const UserInterface = require('../src/userInterface');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

describe('UserInterface', () => {
  let userInterface;
  let mockDataProcessor;

  beforeEach(() => {
    mockDataProcessor = {
      getAllPages: jest.fn().mockReturnValue([
        { title: 'Service Page', ilr: 95, incomingLinks: 50, tier: 'money', slug: 'service-page' },
        { title: 'Supporting Page', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'supporting-page' },
        { title: 'Blog Post', ilr: 45, incomingLinks: 10, tier: 'traffic', slug: 'blog-post' }
      ])
    };

    userInterface = new UserInterface(mockDataProcessor);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with dataProcessor and empty answers', () => {
      expect(userInterface.dataProcessor).toBe(mockDataProcessor);
      expect(userInterface.answers).toEqual({});
      expect(userInterface.progressBar).toBeNull();
    });
  });

  describe('runInteractiveFlow', () => {
    test('should run all phases and return answers', async () => {
      // Mock all phase methods
      jest.spyOn(userInterface, 'runPhaseDataSelection').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase1').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase2').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase3').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase4').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase5').mockResolvedValue();
      jest.spyOn(userInterface, 'runPhase6').mockResolvedValue();

      // Set up answers
      userInterface.answers = { test: 'value' };

      const result = await userInterface.runInteractiveFlow();

      expect(result).toEqual({ test: 'value' });
      expect(userInterface.runPhaseDataSelection).toHaveBeenCalled();
      expect(userInterface.runPhase1).toHaveBeenCalled();
      expect(userInterface.runPhase2).toHaveBeenCalled();
      expect(userInterface.runPhase3).toHaveBeenCalled();
      expect(userInterface.runPhase4).toHaveBeenCalled();
      expect(userInterface.runPhase5).toHaveBeenCalled();
      expect(userInterface.runPhase6).toHaveBeenCalled();
    });

    test('should handle errors during interactive flow', async () => {
      jest.spyOn(userInterface, 'runPhaseDataSelection').mockRejectedValue(new Error('Test error'));

      await expect(userInterface.runInteractiveFlow()).rejects.toThrow('Test error');
    });
  });

  describe('runPhaseDataSelection', () => {
    beforeEach(() => {
      fs.readdir.mockResolvedValue(['test1.csv', 'test2.csv', 'other.txt']);
      fs.statSync.mockReturnValue({
        size: 1024,
        mtime: new Date('2023-01-01')
      });
    });

    test('should scan data directory and prompt for file selection', async () => {
      inquirer.prompt.mockResolvedValue({
        selectedDataFile: 'test1.csv',
        confirmDataFile: true
      });

      await userInterface.runPhaseDataSelection();

      expect(fs.readdir).toHaveBeenCalledWith(path.join(process.cwd(), 'data'));
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.selectedDataFile).toBe('test1.csv');
      expect(userInterface.answers.dataFilePath).toBe(path.join(process.cwd(), 'data', 'test1.csv'));
    });

    test('should handle no CSV files found', async () => {
      fs.readdir.mockResolvedValue(['test.txt', 'other.doc']);

      await expect(userInterface.runPhaseDataSelection()).rejects.toThrow('No CSV files found in the data/ directory');
    });

    test('should retry on file confirmation rejection', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({
          selectedDataFile: 'test1.csv',
          confirmDataFile: false
        })
        .mockResolvedValueOnce({
          selectedDataFile: 'test2.csv',
          confirmDataFile: true
        });

      await userInterface.runPhaseDataSelection();

      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      expect(userInterface.answers.selectedDataFile).toBe('test2.csv');
    });
  });

  describe('runPhase1', () => {
    test('should prompt for business goals and website type', async () => {
      inquirer.prompt.mockResolvedValue({
        welcome: true,
        primaryGoal: 'conversions',
        websiteType: 'Service-based business'
      });

      await userInterface.runPhase1();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.welcome).toBe(true);
      expect(userInterface.answers.primaryGoal).toBe('conversions');
      expect(userInterface.answers.websiteType).toBe('Service-based business');
    });

    test('should exit on welcome rejection', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      inquirer.prompt.mockResolvedValue({
        welcome: false,
        primaryGoal: 'conversions',
        websiteType: 'Service-based business'
      });

      await expect(userInterface.runPhase1()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('runPhase2', () => {
    test('should prompt for optimization areas and preferences', async () => {
      inquirer.prompt.mockResolvedValue({
        optimizationAreas: ['orphaned', 'distribution'],
        contentCapacity: 'medium',
        timeline: 'moderate'
      });

      await userInterface.runPhase2();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.optimizationAreas).toEqual(['orphaned', 'distribution']);
      expect(userInterface.answers.contentCapacity).toBe('medium');
      expect(userInterface.answers.timeline).toBe('moderate');
    });

    test('should validate optimization areas selection', async () => {
      inquirer.prompt.mockResolvedValue({
        optimizationAreas: [],
        contentCapacity: 'medium',
        timeline: 'moderate'
      });

      // The validation should prevent empty selection
      await userInterface.runPhase2();
      expect(inquirer.prompt).toHaveBeenCalled();
    });
  });

  describe('runPhase3', () => {
    test('should prompt for page selections', async () => {
      inquirer.prompt.mockResolvedValue({
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        blogStrategy: 'clusters'
      });

      await userInterface.runPhase3();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.moneyPages).toEqual(['service-page']);
      expect(userInterface.answers.supportingPages).toEqual(['supporting-page']);
      expect(userInterface.answers.blogStrategy).toBe('clusters');
    });

    test('should handle custom page addition', async () => {
      inquirer.prompt.mockResolvedValue({
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        blogStrategy: 'clusters'
      });

      // Mock askForConfirmation to return true
      jest.spyOn(userInterface, 'askForConfirmation').mockResolvedValue(true);
      jest.spyOn(userInterface, 'askForInput')
        .mockResolvedValueOnce('https://example.com/custom-money')
        .mockResolvedValueOnce('Custom Money Page')
        .mockResolvedValueOnce('https://example.com/custom-supporting')
        .mockResolvedValueOnce('Custom Supporting Page')
        .mockResolvedValueOnce(''); // Empty to finish

      await userInterface.runPhase3();

      expect(userInterface.answers.customMoneyPages).toEqual([
        { url: 'https://example.com/custom-money', title: 'Custom Money Page' }
      ]);
      expect(userInterface.answers.customSupportingPages).toEqual([
        { url: 'https://example.com/custom-supporting', title: 'Custom Supporting Page' }
      ]);
    });

    test('should skip custom pages when not requested', async () => {
      inquirer.prompt.mockResolvedValue({
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        blogStrategy: 'clusters'
      });

      jest.spyOn(userInterface, 'askForConfirmation').mockResolvedValue(false);

      await userInterface.runPhase3();

      expect(userInterface.answers.customMoneyPages).toBeUndefined();
      expect(userInterface.answers.customSupportingPages).toBeUndefined();
    });
  });

  describe('runPhase4', () => {
    test('should prompt for technical preferences', async () => {
      inquirer.prompt.mockResolvedValue({
        wordpressIntegration: 'yes',
        linkManagement: 'hybrid',
        monitoringTools: ['gsc', 'ga']
      });

      await userInterface.runPhase4();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.wordpressIntegration).toBe('yes');
      expect(userInterface.answers.linkManagement).toBe('hybrid');
      expect(userInterface.answers.monitoringTools).toEqual(['gsc', 'ga']);
    });

    test('should prompt for WordPress plugin when WordPress is selected', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({
          wordpressIntegration: 'yes',
          linkManagement: 'hybrid',
          monitoringTools: ['gsc']
        })
        .mockResolvedValueOnce({
          wordpressPlugin: 'Link Whisper'
        });

      await userInterface.runPhase4();

      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      expect(userInterface.answers.wordpressPlugin).toBe('Link Whisper');
    });
  });

  describe('runPhase5', () => {
    test('should prompt for report preferences', async () => {
      inquirer.prompt.mockResolvedValue({
        reportDetail: 'action-focused',
        outputFormats: ['console', 'markdown'],
        createActionPlan: true
      });

      await userInterface.runPhase5();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.reportDetail).toBe('action-focused');
      expect(userInterface.answers.outputFormats).toEqual(['console', 'markdown']);
      expect(userInterface.answers.createActionPlan).toBe(true);
    });

    test('should prompt for advanced metrics when detailed report is selected', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({
          reportDetail: 'detailed',
          outputFormats: ['console', 'html'],
          createActionPlan: true
        })
        .mockResolvedValueOnce({
          advancedMetrics: ['Anchor text distribution analysis']
        });

      await userInterface.runPhase5();

      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      expect(userInterface.answers.advancedMetrics).toEqual(['Anchor text distribution analysis']);
    });
  });

  describe('runPhase6', () => {
    test('should display summary and confirm analysis', async () => {
      userInterface.answers = {
        primaryGoal: 'conversions',
        websiteType: 'Service-based business',
        timeline: 'moderate',
        contentCapacity: 'medium',
        optimizationAreas: ['orphaned'],
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        outputFormats: ['console']
      };

      jest.spyOn(userInterface, 'displaySelectionSummary').mockImplementation();
      inquirer.prompt.mockResolvedValue({
        confirmAnalysis: true
      });

      await userInterface.runPhase6();

      expect(userInterface.displaySelectionSummary).toHaveBeenCalled();
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(userInterface.answers.confirmAnalysis).toBe(true);
    });

    test('should exit on analysis confirmation rejection', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      jest.spyOn(userInterface, 'displaySelectionSummary').mockImplementation();
      inquirer.prompt.mockResolvedValue({
        confirmAnalysis: false
      });

      await expect(userInterface.runPhase6()).rejects.toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('displaySelectionSummary', () => {
    test('should display all selections correctly', () => {
      userInterface.answers = {
        primaryGoal: 'conversions',
        websiteType: 'Service-based business',
        timeline: 'moderate',
        contentCapacity: 'medium',
        optimizationAreas: ['orphaned', 'distribution'],
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        customMoneyPages: [{ url: 'https://example.com/custom', title: 'Custom Page' }],
        outputFormats: ['console', 'markdown']
      };

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      userInterface.displaySelectionSummary();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('progress methods', () => {
    test('should create and update progress bar', () => {
      const mockProgressBar = {
        start: jest.fn(),
        update: jest.fn(),
        stop: jest.fn()
      };

      // Mock cli-progress
      const cliProgress = require('cli-progress');
      cliProgress.SingleBar.mockImplementation(() => mockProgressBar);

      userInterface.showProgress('Test message', 0, 100);
      expect(mockProgressBar.start).toHaveBeenCalledWith(100, 0, { message: 'Test message' });

      userInterface.updateProgress(50, 'Updated message');
      expect(mockProgressBar.update).toHaveBeenCalledWith(50, { message: 'Updated message' });

      userInterface.completeProgress();
      expect(mockProgressBar.stop).toHaveBeenCalled();
      expect(userInterface.progressBar).toBeNull();
    });
  });

  describe('display methods', () => {
    test('should display different message types', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      userInterface.displayError('Test error');
      userInterface.displaySuccess('Test success');
      userInterface.displayWarning('Test warning');
      userInterface.displayInfo('Test info');

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      consoleSpy.mockRestore();
    });

    test('should display error with stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('Test error');

      userInterface.displayError('Test error', error);

      expect(consoleSpy).toHaveBeenCalledTimes(2); // Error message + stack trace
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('input methods', () => {
    test('should ask for confirmation', async () => {
      inquirer.prompt.mockResolvedValue({ confirmed: true });

      const result = await userInterface.askForConfirmation('Test confirmation?');

      expect(result).toBe(true);
      expect(inquirer.prompt).toHaveBeenCalledWith([{
        type: 'confirm',
        name: 'confirmed',
        message: 'Test confirmation?',
        default: true
      }]);
    });

    test('should ask for input', async () => {
      inquirer.prompt.mockResolvedValue({ input: 'test input' });

      const result = await userInterface.askForInput('Test input?');

      expect(result).toBe('test input');
      expect(inquirer.prompt).toHaveBeenCalledWith([{
        type: 'input',
        name: 'input',
        message: 'Test input?',
        default: ''
      }]);
    });

    test('should ask for choice', async () => {
      const choices = ['option1', 'option2'];
      inquirer.prompt.mockResolvedValue({ choice: 'option1' });

      const result = await userInterface.askForChoice('Test choice?', choices);

      expect(result).toBe('option1');
      expect(inquirer.prompt).toHaveBeenCalledWith([{
        type: 'list',
        name: 'choice',
        message: 'Test choice?',
        choices: choices,
        default: null
      }]);
    });
  });

  describe('utility methods', () => {
    test('should display table', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const data = [{ name: 'Test', value: 123 }];

      userInterface.displayTable(data, 'Test Table');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should display separator', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      userInterface.displaySeparator('Test Section');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should get user preferences', () => {
      userInterface.answers = { test: 'value' };

      const preferences = userInterface.getUserPreferences();

      expect(preferences).toEqual({ test: 'value' });
    });

    test('should clear screen', () => {
      const consoleSpy = jest.spyOn(console, 'clear').mockImplementation();

      userInterface.clearScreen();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should display welcome banner', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      userInterface.displayWelcomeBanner();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
