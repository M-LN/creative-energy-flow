import React, { useState, useRef } from 'react';
import { DataExportService } from '../services/DataExportService';
import { EnergyReading } from '../types/energy';
import './DataExportPanel.css';

interface DataExportPanelProps {
  energyData: EnergyReading[];
  onDataImported: (data: EnergyReading[]) => void;
}

export const DataExportPanel: React.FC<DataExportPanelProps> = ({
  energyData,
  onDataImported
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');
  const [importMessageType, setImportMessageType] = useState<'success' | 'error' | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const exportService = DataExportService.getInstance();
  const stats = exportService.getExportStats(energyData);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      exportService.exportAsJSON(energyData);
      setImportMessage('Data exported successfully as JSON!');
      setImportMessageType('success');
    } catch (error) {
      setImportMessage('Failed to export data as JSON.');
      setImportMessageType('error');
    } finally {
      setIsExporting(false);
      clearMessageAfterDelay();
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      exportService.exportAsCSV(energyData);
      setImportMessage('Data exported successfully as CSV!');
      setImportMessageType('success');
    } catch (error) {
      setImportMessage('Failed to export data as CSV.');
      setImportMessageType('error');
    } finally {
      setIsExporting(false);
      clearMessageAfterDelay();
    }
  };

  const handleCreateBackup = async () => {
    setIsExporting(true);
    try {
      exportService.createBackup(energyData);
      setImportMessage('Backup created successfully!');
      setImportMessageType('success');
    } catch (error) {
      setImportMessage('Failed to create backup.');
      setImportMessageType('error');
    } finally {
      setIsExporting(false);
      clearMessageAfterDelay();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
  };

  const handleImportFile = async (file: File) => {
    setIsImporting(true);
    setImportMessage('');
    
    try {
      let importedData: EnergyReading[];
      
      if (file.name.endsWith('.json')) {
        importedData = await exportService.importFromJSON(file);
      } else if (file.name.endsWith('.csv')) {
        importedData = await exportService.importFromCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }
      
      if (importedData.length > 0) {
        onDataImported(importedData);
        setImportMessage(`Successfully imported ${importedData.length} energy records!`);
        setImportMessageType('success');
      } else {
        setImportMessage('No valid energy data found in the file.');
        setImportMessageType('error');
      }
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Failed to import data.');
      setImportMessageType('error');
    } finally {
      setIsImporting(false);
      clearMessageAfterDelay();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRestoreBackup = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-action', 'restore');
      fileInputRef.current.click();
    }
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setImportMessage('');
      setImportMessageType('');
    }, 3000);
  };

  return (
    <div className="data-export-panel">
      <div className="export-panel-header">
        <h3>📁 Data Management</h3>
        <p>Export, import, and backup your energy tracking data</p>
      </div>

      {/* Current Data Statistics */}
      <div className="data-stats">
        <h4>Current Data Overview</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Records:</span>
            <span className="stat-value">{stats.totalRecords}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Date Range:</span>
            <span className="stat-value">
              {stats.dateRange.start === 'N/A' 
                ? 'No data' 
                : `${stats.dateRange.start.split('T')[0]} to ${stats.dateRange.end.split('T')[0]}`
              }
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Energy Types:</span>
            <span className="stat-value">{stats.energyTypes.join(', ')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Energy:</span>
            <span className="stat-value">{stats.averageEnergy}/10</span>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <h4>📤 Export Data</h4>
        <div className="export-buttons">
          <button
            onClick={handleExportJSON}
            disabled={isExporting || stats.totalRecords === 0}
            className="export-btn json-btn"
            aria-label="Export data as JSON file"
          >
            {isExporting ? '⏳ Exporting...' : '📄 Export as JSON'}
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={isExporting || stats.totalRecords === 0}
            className="export-btn csv-btn"
            aria-label="Export data as CSV file"
          >
            {isExporting ? '⏳ Exporting...' : '📊 Export as CSV'}
          </button>
          
          <button
            onClick={handleCreateBackup}
            disabled={isExporting || stats.totalRecords === 0}
            className="export-btn backup-btn"
            aria-label="Create backup file"
          >
            {isExporting ? '⏳ Creating...' : '💾 Create Backup'}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h4>📥 Import Data</h4>
        <div className="import-buttons">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="import-btn"
            aria-label="Import data from file"
          >
            {isImporting ? '⏳ Importing...' : '📁 Import from File'}
          </button>
          
          <button
            onClick={handleRestoreBackup}
            disabled={isImporting}
            className="import-btn restore-btn"
            aria-label="Restore from backup file"
          >
            {isImporting ? '⏳ Restoring...' : '🔄 Restore Backup'}
          </button>
        </div>
        
        <p className="import-note">
          Supports JSON and CSV files. Imported data will be merged with existing data.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileSelect}
        className="hidden-file-input"
        aria-label="File input for importing data"
      />

      {/* Status Message */}
      {importMessage && (
        <div className={`import-message ${importMessageType}`} role="alert">
          {importMessage}
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <h4>ℹ️ Data Format Information</h4>
        <ul>
          <li><strong>JSON:</strong> Complete data with metadata, best for backups</li>
          <li><strong>CSV:</strong> Spreadsheet-friendly format for analysis</li>
          <li><strong>Backup:</strong> Full data export with version information</li>
        </ul>
      </div>
    </div>
  );
};
