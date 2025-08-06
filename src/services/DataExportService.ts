// DataExportService.ts - Handle export/import of energy data
import { EnergyReading } from '../types/energy';

export interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  energyReadings: EnergyReading[];
}

export class DataExportService {
  private static instance: DataExportService;

  public static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  /**
   * Export energy data as JSON
   */
  public exportAsJSON(energyData: EnergyReading[]): void {
    const exportData: ExportData = this.prepareExportData(energyData);
    const jsonString = JSON.stringify(exportData, null, 2);
    
    this.downloadFile(
      jsonString,
      `energy-flow-data-${this.getDateString()}.json`,
      'application/json'
    );
  }

  /**
   * Export energy data as CSV
   */
  public exportAsCSV(energyData: EnergyReading[]): void {
    const csvContent = this.convertToCSV(energyData);
    
    this.downloadFile(
      csvContent,
      `energy-flow-data-${this.getDateString()}.csv`,
      'text/csv'
    );
  }

  /**
   * Import energy data from JSON file
   */
  public async importFromJSON(file: File): Promise<EnergyReading[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const importData = JSON.parse(text) as ExportData;
          
          // Validate the import data structure
          if (this.validateImportData(importData)) {
            resolve(importData.energyReadings);
          } else {
            reject(new Error('Invalid JSON format. Please check your file structure.'));
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON file. Please check the file format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file.'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Import energy data from CSV file
   */
  public async importFromCSV(file: File): Promise<EnergyReading[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const energyReadings = this.parseCSV(text);
          resolve(energyReadings);
        } catch (error) {
          reject(new Error('Failed to parse CSV file. Please check the file format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file.'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Create a backup of all energy data
   */
  public createBackup(energyData: EnergyReading[]): void {
    const backupData: ExportData = {
      ...this.prepareExportData(energyData),
      metadata: {
        ...this.prepareExportData(energyData).metadata,
        version: '1.0-backup'
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    
    this.downloadFile(
      jsonString,
      `energy-flow-backup-${this.getDateString()}.json`,
      'application/json'
    );
  }

  /**
   * Restore data from backup file
   */
  public async restoreFromBackup(file: File): Promise<EnergyReading[]> {
    const energyReadings = await this.importFromJSON(file);
    
    // Additional validation for backup files
    if (energyReadings.length === 0) {
      throw new Error('Backup file appears to be empty.');
    }
    
    return energyReadings;
  }

  /**
   * Get export statistics
   */
  public getExportStats(energyData: EnergyReading[]): {
    totalRecords: number;
    dateRange: { start: string; end: string };
    energyTypes: string[];
    averageEnergy: number;
  } {
    if (energyData.length === 0) {
      return {
        totalRecords: 0,
        dateRange: { start: 'N/A', end: 'N/A' },
        energyTypes: [],
        averageEnergy: 0
      };
    }

    const sortedData = [...energyData].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const energyTypes = Array.from(new Set(energyData.map(reading => reading.type)));
    const totalEnergy = energyData.reduce((sum, reading) => sum + reading.level, 0);
    const averageEnergy = totalEnergy / energyData.length;

    return {
      totalRecords: energyData.length,
      dateRange: {
        start: sortedData[0].timestamp,
        end: sortedData[sortedData.length - 1].timestamp
      },
      energyTypes,
      averageEnergy: Math.round(averageEnergy * 100) / 100
    };
  }

  // Private helper methods
  private prepareExportData(energyData: EnergyReading[]): ExportData {
    const stats = this.getExportStats(energyData);
    
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalRecords: stats.totalRecords,
        dateRange: stats.dateRange
      },
      energyReadings: energyData
    };
  }

  private convertToCSV(energyData: EnergyReading[]): string {
    const headers = ['timestamp', 'type', 'level', 'notes', 'tags'];
    const csvRows = [headers.join(',')];

    energyData.forEach(reading => {
      const row = [
        `"${reading.timestamp}"`,
        `"${reading.type}"`,
        reading.level.toString(),
        `"${reading.notes || ''}"`,
        `"${reading.tags?.join(';') || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private parseCSV(csvText: string): EnergyReading[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const energyReadings: EnergyReading[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length >= 3) {
        const reading: EnergyReading = {
          id: Date.now() + i, // Generate new ID
          timestamp: values[0].replace(/"/g, ''),
          type: values[1].replace(/"/g, '') as any,
          level: parseFloat(values[2]),
          notes: values[3]?.replace(/"/g, '') || undefined,
          tags: values[4]?.replace(/"/g, '').split(';').filter(tag => tag.trim()) || undefined
        };

        // Validate the reading
        if (this.validateEnergyReading(reading)) {
          energyReadings.push(reading);
        }
      }
    }

    return energyReadings;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private validateImportData(data: any): data is ExportData {
    return (
      data &&
      typeof data === 'object' &&
      data.metadata &&
      Array.isArray(data.energyReadings) &&
      data.energyReadings.every((reading: any) => this.validateEnergyReading(reading))
    );
  }

  private validateEnergyReading(reading: any): reading is EnergyReading {
    return (
      reading &&
      typeof reading === 'object' &&
      typeof reading.timestamp === 'string' &&
      typeof reading.type === 'string' &&
      typeof reading.level === 'number' &&
      reading.level >= 0 &&
      reading.level <= 10
    );
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}
