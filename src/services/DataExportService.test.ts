import { DataExportService } from '../services/DataExportService';
import { EnergyReading } from '../types/energy';

describe('DataExportService', () => {
  let exportService: DataExportService;
  let mockEnergyData: EnergyReading[];

  beforeEach(() => {
    exportService = DataExportService.getInstance();
    
    mockEnergyData = [
      {
        id: 1,
        timestamp: '2025-08-01T08:00:00.000Z',
        type: 'physical',
        level: 7,
        notes: 'Feeling energized after workout',
        tags: ['workout', 'health']
      },
      {
        id: 2,
        timestamp: '2025-08-01T14:00:00.000Z',
        type: 'mental',
        level: 8,
        notes: 'Sharp focus and clarity',
        tags: ['work', 'focus']
      },
      {
        id: 3,
        timestamp: '2025-08-01T20:00:00.000Z',
        type: 'creative',
        level: 6,
        notes: 'Working on new project'
      }
    ];
  });

  test('should return correct export statistics', () => {
    const stats = exportService.getExportStats(mockEnergyData);
    
    expect(stats.totalRecords).toBe(3);
    expect(stats.energyTypes).toEqual(['physical', 'mental', 'creative']);
    expect(stats.averageEnergy).toBe(7); // (7 + 8 + 6) / 3 = 7
    expect(stats.dateRange.start).toBe('2025-08-01T08:00:00.000Z');
    expect(stats.dateRange.end).toBe('2025-08-01T20:00:00.000Z');
  });

  test('should handle empty data correctly', () => {
    const stats = exportService.getExportStats([]);
    
    expect(stats.totalRecords).toBe(0);
    expect(stats.energyTypes).toEqual([]);
    expect(stats.averageEnergy).toBe(0);
    expect(stats.dateRange.start).toBe('N/A');
    expect(stats.dateRange.end).toBe('N/A');
  });

  test('should create proper CSV format', () => {
    // Create a spy on the downloadFile method
    const downloadSpy = jest.spyOn(exportService as any, 'downloadFile');
    downloadSpy.mockImplementation(() => {});

    exportService.exportAsCSV(mockEnergyData);

    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('timestamp,type,level,notes,tags'),
      expect.stringMatching(/energy-flow-data-\d{4}-\d{2}-\d{2}\.csv/),
      'text/csv'
    );

    // Verify CSV content includes our test data
    const csvContent = downloadSpy.mock.calls[0][0];
    expect(csvContent).toContain('"2025-08-01T08:00:00.000Z","physical",7,"Feeling energized after workout","workout;health"');
    
    downloadSpy.mockRestore();
  });

  test('should create proper JSON format', () => {
    // Create a spy on the downloadFile method
    const downloadSpy = jest.spyOn(exportService as any, 'downloadFile');
    downloadSpy.mockImplementation(() => {});

    exportService.exportAsJSON(mockEnergyData);

    expect(downloadSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/energy-flow-data-\d{4}-\d{2}-\d{2}\.json/),
      'application/json'
    );

    // Verify JSON content
    const jsonContent = downloadSpy.mock.calls[0][0] as string;
    const exportData = JSON.parse(jsonContent);
    
    expect(exportData.metadata).toBeDefined();
    expect(exportData.metadata.totalRecords).toBe(3);
    expect(exportData.energyReadings).toEqual(mockEnergyData);
    
    downloadSpy.mockRestore();
  });

  test('should validate energy readings correctly', () => {
    const validReading = {
      id: 1,
      timestamp: '2025-08-01T08:00:00.000Z',
      type: 'physical',
      level: 7
    };

    const invalidReading = {
      id: 1,
      timestamp: '2025-08-01T08:00:00.000Z',
      type: 'physical',
      level: 15 // Invalid level > 10
    };

    const validateMethod = (exportService as any).validateEnergyReading;
    
    expect(validateMethod(validReading)).toBe(true);
    expect(validateMethod(invalidReading)).toBe(false);
    expect(validateMethod(null)).toBe(false);
    expect(validateMethod({})).toBe(false);
  });

  test('should parse CSV correctly', async () => {
    const csvContent = `timestamp,type,level,notes,tags
"2025-08-01T08:00:00.000Z","physical",7,"Good energy","workout;health"
"2025-08-01T14:00:00.000Z","mental",8,"Focused","work"`;

    const parseMethod = (exportService as any).parseCSV;
    const result = parseMethod(csvContent);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('physical');
    expect(result[0].level).toBe(7);
    expect(result[0].notes).toBe('Good energy');
    expect(result[0].tags).toEqual(['workout', 'health']);
    expect(result[1].type).toBe('mental');
    expect(result[1].level).toBe(8);
  });

  test('should handle malformed CSV gracefully', () => {
    const malformedCSV = 'timestamp,type\n"invalid"';
    
    const parseMethod = (exportService as any).parseCSV;
    expect(() => parseMethod(malformedCSV)).toThrow('CSV file must contain header and at least one data row.');
    
    const emptyCSV = '';
    expect(() => parseMethod(emptyCSV)).toThrow('CSV file must contain header and at least one data row.');
  });
});
