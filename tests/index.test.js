const InternalLinkingOptimizer = require('../index');

describe('InternalLinkingOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new InternalLinkingOptimizer();
  });

  describe('constructor', () => {
    test('should initialize with null components and empty csvFilePath', () => {
      expect(optimizer.dataProcessor).toBeDefined();
      expect(optimizer.scoringEngine).toBeNull();
      expect(optimizer.userInterface).toBeNull();
      expect(optimizer.reportGenerator).toBeNull();
      expect(optimizer.csvFilePath).toBeNull();
    });
  });

  describe('initialize', () => {
    test('should initialize all components successfully', async () => {
      const result = await optimizer.initialize();

      expect(result).toBe(true);
      expect(optimizer.scoringEngine).toBeDefined();
      expect(optimizer.userInterface).toBeDefined();
      expect(optimizer.reportGenerator).toBeDefined();
    });

    test('should handle initialization errors', async () => {
      // Mock DataProcessor to throw error
      const originalDataProcessor = optimizer.dataProcessor;
      optimizer.dataProcessor = {
        constructor: jest.fn().mockImplementation(() => {
          throw new Error('Initialization error');
        })
      };

      const result = await optimizer.initialize();

      expect(result).toBe(false);
      expect(optimizer.scoringEngine).toBeNull();
      expect(optimizer.userInterface).toBeNull();
      expect(optimizer.reportGenerator).toBeNull();

      // Restore original dataProcessor
      optimizer.dataProcessor = originalDataProcessor;
    });
  });

  describe('loadAndProcessData', () => {
    beforeEach(() => {
      // Mock fs-extra
      const fs = require('fs-extra');
      fs.pathExists.mockResolvedValue(true);
    });

    test('should load and process CSV data successfully', async () => {
      // Mock dataProcessor methods
      optimizer.dataProcessor.parseCSV = jest.fn().mockResolvedValue([]);
      optimizer.dataProcessor.getAnalytics = jest.fn().mockReturnValue({
        totalPages: 100,
        distribution: { money: 10, supporting: 30, traffic: 60 },
        orphanedPages: 5
      });

      // Mock userInterface methods
      optimizer.userInterface = {
        showProgress: jest.fn(),
        updateProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      const result = await optimizer.loadAndProcessData('/path/to/test.csv');

      expect(result).toBe(true);
      expect(optimizer.csvFilePath).toBe('/path/to/test.csv');
      expect(optimizer.dataProcessor.parseCSV).toHaveBeenCalledWith('/path/to/test.csv');
      expect(optimizer.userInterface.showProgress).toHaveBeenCalled();
      expect(optimizer.userInterface.updateProgress).toHaveBeenCalledTimes(3);
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });

    test('should handle file not found error', async () => {
      const fs = require('fs-extra');
      fs.pathExists.mockResolvedValue(false);

      optimizer.userInterface = {
        completeProgress: jest.fn()
      };

      const result = await optimizer.loadAndProcessData('/path/to/nonexistent.csv');

      expect(result).toBe(false);
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });

    test('should handle CSV parsing errors', async () => {
      const fs = require('fs-extra');
      fs.pathExists.mockResolvedValue(true);

      optimizer.dataProcessor.parseCSV = jest.fn().mockRejectedValue(new Error('CSV parsing error'));
      optimizer.userInterface = {
        showProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      const result = await optimizer.loadAndProcessData('/path/to/invalid.csv');

      expect(result).toBe(false);
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });
  });

  describe('runInteractiveAnalysis', () => {
    test('should run interactive flow and return user preferences', async () => {
      const mockPreferences = { primaryGoal: 'conversions', timeline: 'moderate' };
      
      optimizer.userInterface = {
        runInteractiveFlow: jest.fn().mockResolvedValue(mockPreferences)
      };

      const result = await optimizer.runInteractiveAnalysis();

      expect(result).toEqual(mockPreferences);
      expect(optimizer.userInterface.runInteractiveFlow).toHaveBeenCalled();
    });

    test('should handle interactive flow errors', async () => {
      optimizer.userInterface = {
        runInteractiveFlow: jest.fn().mockRejectedValue(new Error('Interactive error'))
      };

      const result = await optimizer.runInteractiveAnalysis();

      expect(result).toBeNull();
    });
  });

  describe('performAnalysis', () => {
    test('should perform site analysis successfully', async () => {
      const mockUserPreferences = { primaryGoal: 'conversions' };
      const mockSiteAnalysis = {
        overall: { score: 75, grade: 'B', totalPages: 100 },
        opportunities: [{ priority: 'high', issue: 'Test issue' }],
        recommendations: [{ priority: 'medium', title: 'Test recommendation' }]
      };

      optimizer.scoringEngine = {
        calculateSiteScore: jest.fn().mockReturnValue(mockSiteAnalysis)
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        updateProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      const result = await optimizer.performAnalysis(mockUserPreferences);

      expect(result).toEqual(mockSiteAnalysis);
      expect(optimizer.scoringEngine.calculateSiteScore).toHaveBeenCalledWith(mockUserPreferences);
      expect(optimizer.userInterface.showProgress).toHaveBeenCalled();
      expect(optimizer.userInterface.updateProgress).toHaveBeenCalledTimes(4);
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });

    test('should handle analysis errors', async () => {
      optimizer.scoringEngine = {
        calculateSiteScore: jest.fn().mockImplementation(() => {
          throw new Error('Analysis error');
        })
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      const result = await optimizer.performAnalysis({});

      expect(result).toBeNull();
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });
  });

  describe('generateReports', () => {
    test('should generate reports successfully', async () => {
      const mockSiteAnalysis = { overall: { score: 75 } };
      const mockUserPreferences = { outputFormats: ['console', 'markdown'] };
      const mockReports = {
        console: 'Console report content',
        markdown: { content: 'Markdown content', path: '/path/to/report.md' }
      };

      optimizer.reportGenerator = {
        generateReports: jest.fn().mockResolvedValue(mockReports)
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        updateProgress: jest.fn(),
        completeProgress: jest.fn(),
        askForConfirmation: jest.fn().mockResolvedValue(false)
      };

      const result = await optimizer.generateReports(mockSiteAnalysis, mockUserPreferences);

      expect(result).toEqual(mockReports);
      expect(optimizer.reportGenerator.generateReports).toHaveBeenCalledWith(mockSiteAnalysis, mockUserPreferences);
      expect(optimizer.userInterface.showProgress).toHaveBeenCalled();
      expect(optimizer.userInterface.updateProgress).toHaveBeenCalledTimes(3);
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });

    test('should display console report when requested', async () => {
      const mockSiteAnalysis = { overall: { score: 75 } };
      const mockUserPreferences = { outputFormats: ['console'] };
      const mockReports = {
        console: 'Console report content'
      };

      optimizer.reportGenerator = {
        generateReports: jest.fn().mockResolvedValue(mockReports),
        displayConsoleReport: jest.fn()
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        updateProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      await optimizer.generateReports(mockSiteAnalysis, mockUserPreferences);

      expect(optimizer.reportGenerator.displayConsoleReport).toHaveBeenCalledWith('Console report content');
    });

    test('should ask to open HTML report when generated', async () => {
      const mockSiteAnalysis = { overall: { score: 75 } };
      const mockUserPreferences = { outputFormats: ['html'] };
      const mockReports = {
        html: { content: 'HTML content', path: '/path/to/report.html' }
      };

      optimizer.reportGenerator = {
        generateReports: jest.fn().mockResolvedValue(mockReports),
        openHTMLReport: jest.fn()
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        updateProgress: jest.fn(),
        completeProgress: jest.fn(),
        askForConfirmation: jest.fn().mockResolvedValue(true)
      };

      await optimizer.generateReports(mockSiteAnalysis, mockUserPreferences);

      expect(optimizer.userInterface.askForConfirmation).toHaveBeenCalledWith(
        'Would you like to open the HTML report in your browser?',
        true
      );
      expect(optimizer.reportGenerator.openHTMLReport).toHaveBeenCalledWith('/path/to/report.html');
    });

    test('should handle report generation errors', async () => {
      optimizer.reportGenerator = {
        generateReports: jest.fn().mockRejectedValue(new Error('Report generation error'))
      };

      optimizer.userInterface = {
        showProgress: jest.fn(),
        completeProgress: jest.fn()
      };

      const result = await optimizer.generateReports({}, {});

      expect(result).toBeNull();
      expect(optimizer.userInterface.completeProgress).toHaveBeenCalled();
    });
  });

  describe('displaySummary', () => {
    test('should display optimization summary', () => {
      const mockSiteAnalysis = {
        overall: { score: 75, grade: 'B', totalPages: 100 },
        opportunities: [
          { priority: 'high', issue: 'High priority issue' },
          { priority: 'medium', issue: 'Medium priority issue' },
          { priority: 'low', issue: 'Low priority issue' }
        ],
        recommendations: []
      };

      const mockUserPreferences = { createActionPlan: true };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      optimizer.displaySummary(mockSiteAnalysis, mockUserPreferences);

      expect(consoleSpy).toHaveBeenCalled();
      // Check that summary contains key information
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toContain('75/100');
      expect(logCalls).toContain('B');
      expect(logCalls).toContain('100');
      expect(logCalls).toContain('HIGH');
      expect(logCalls).toContain('MEDIUM');
      expect(logCalls).toContain('action plan');

      consoleSpy.mockRestore();
    });

    test('should display summary without action plan when not requested', () => {
      const mockSiteAnalysis = {
        overall: { score: 85, grade: 'A', totalPages: 50 },
        opportunities: [{ priority: 'high', issue: 'Test issue' }],
        recommendations: []
      };

      const mockUserPreferences = { createActionPlan: false };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      optimizer.displaySummary(mockSiteAnalysis, mockUserPreferences);

      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain('action plan');

      consoleSpy.mockRestore();
    });
  });

  describe('run', () => {
    test('should run complete optimization workflow', async () => {
      const mockUserPreferences = {
        dataFilePath: '/path/to/data.csv',
        primaryGoal: 'conversions',
        outputFormats: ['console']
      };

      const mockSiteAnalysis = {
        overall: { score: 75, grade: 'B', totalPages: 100 },
        opportunities: [],
        recommendations: []
      };

      const mockReports = { console: 'Report content' };

      // Mock all methods
      jest.spyOn(optimizer, 'initialize').mockResolvedValue(true);
      jest.spyOn(optimizer, 'runInteractiveAnalysis').mockResolvedValue(mockUserPreferences);
      jest.spyOn(optimizer, 'loadAndProcessData').mockResolvedValue(true);
      jest.spyOn(optimizer, 'performAnalysis').mockResolvedValue(mockSiteAnalysis);
      jest.spyOn(optimizer, 'generateReports').mockResolvedValue(mockReports);
      jest.spyOn(optimizer, 'displaySummary').mockImplementation();

      // Mock userInterface methods
      optimizer.userInterface = {
        displayWelcomeBanner: jest.fn()
      };

      await optimizer.run();

      expect(optimizer.initialize).toHaveBeenCalled();
      expect(optimizer.userInterface.displayWelcomeBanner).toHaveBeenCalled();
      expect(optimizer.runInteractiveAnalysis).toHaveBeenCalled();
      expect(optimizer.loadAndProcessData).toHaveBeenCalledWith('/path/to/data.csv');
      expect(optimizer.performAnalysis).toHaveBeenCalledWith(mockUserPreferences);
      expect(optimizer.generateReports).toHaveBeenCalledWith(mockSiteAnalysis, mockUserPreferences);
      expect(optimizer.displaySummary).toHaveBeenCalledWith(mockSiteAnalysis, mockUserPreferences);
    });

    test('should exit on initialization failure', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockResolvedValue(false);

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should exit on interactive analysis failure', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockResolvedValue(true);
      jest.spyOn(optimizer, 'runInteractiveAnalysis').mockResolvedValue(null);
      optimizer.userInterface = { displayWelcomeBanner: jest.fn() };

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should exit on data processing failure', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockResolvedValue(true);
      jest.spyOn(optimizer, 'runInteractiveAnalysis').mockResolvedValue({ dataFilePath: '/path/to/data.csv' });
      jest.spyOn(optimizer, 'loadAndProcessData').mockResolvedValue(false);
      optimizer.userInterface = { displayWelcomeBanner: jest.fn() };

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should exit on analysis failure', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockResolvedValue(true);
      jest.spyOn(optimizer, 'runInteractiveAnalysis').mockResolvedValue({ dataFilePath: '/path/to/data.csv' });
      jest.spyOn(optimizer, 'loadAndProcessData').mockResolvedValue(true);
      jest.spyOn(optimizer, 'performAnalysis').mockResolvedValue(null);
      optimizer.userInterface = { displayWelcomeBanner: jest.fn() };

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should exit on report generation failure', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockResolvedValue(true);
      jest.spyOn(optimizer, 'runInteractiveAnalysis').mockResolvedValue({ dataFilePath: '/path/to/data.csv' });
      jest.spyOn(optimizer, 'loadAndProcessData').mockResolvedValue(true);
      jest.spyOn(optimizer, 'performAnalysis').mockResolvedValue({ overall: { score: 75 } });
      jest.spyOn(optimizer, 'generateReports').mockResolvedValue(null);
      optimizer.userInterface = { displayWelcomeBanner: jest.fn() };

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should handle application errors', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(optimizer, 'initialize').mockRejectedValue(new Error('Application error'));

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });

    test('should show error stack trace in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const testError = new Error('Test error');
      jest.spyOn(optimizer, 'initialize').mockRejectedValue(testError);

      await expect(optimizer.run()).rejects.toThrow('process.exit called');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));

      process.env.NODE_ENV = originalEnv;
      exitSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
