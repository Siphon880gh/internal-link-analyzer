const ReportGenerator = require('../src/reportGenerator');
const fs = require('fs-extra');
const path = require('path');

describe('ReportGenerator', () => {
  let reportGenerator;
  let mockDataProcessor;
  let mockScoringEngine;

  beforeEach(() => {
    mockDataProcessor = {
      getAllPages: jest.fn()
    };

    mockScoringEngine = {
      getScoreColor: jest.fn((score) => {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        return '#dc3545';
      })
    };

    reportGenerator = new ReportGenerator(mockDataProcessor, mockScoringEngine);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with dataProcessor and scoringEngine', () => {
      expect(reportGenerator.dataProcessor).toBe(mockDataProcessor);
      expect(reportGenerator.scoringEngine).toBe(mockScoringEngine);
      expect(reportGenerator.reportsDir).toBe(path.join(process.cwd(), 'reports'));
    });
  });

  describe('generateReports', () => {
    const mockSiteAnalysis = {
      overall: { score: 75, grade: 'B', totalPages: 100 },
      tiers: {
        distribution: {
          money: { count: 10, percentage: 10, status: 'good' },
          supporting: { count: 30, percentage: 30, status: 'good' },
          traffic: { count: 60, percentage: 60, status: 'good' }
        },
        scores: { money: 85, supporting: 70, traffic: 60 }
      },
      analytics: {
        averages: { ilr: 65, incomingLinks: 25, loadTime: 1.8 },
        orphanedPages: 15,
        highPerformingPages: 20,
        lowPerformingPages: 10
      },
      opportunities: [
        { priority: 'high', issue: 'Test issue', recommendation: 'Test recommendation', impact: 'High impact' }
      ],
      recommendations: [
        { priority: 'medium', title: 'Test recommendation', action: 'Test action', impact: 'Medium impact' }
      ],
      pageScores: [
        { 
          total: 90, 
          page: { title: 'Top Page' }, 
          grade: 'A+',
          breakdown: { linkScore: 80, technicalScore: 90, contentScore: 85, clusterScore: 75, tierScore: 85 }
        },
        { 
          total: 30, 
          page: { title: 'Bottom Page' }, 
          grade: 'F',
          breakdown: { linkScore: 20, technicalScore: 30, contentScore: 25, clusterScore: 35, tierScore: 30 }
        }
      ]
    };

    const mockUserPreferences = {
      outputFormats: ['console', 'markdown', 'html', 'csv'],
      createActionPlan: true,
      timeline: 'moderate'
    };

    beforeEach(() => {
      fs.ensureDir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();
    });

    test('should generate all requested report formats', async () => {
      const reports = await reportGenerator.generateReports(mockSiteAnalysis, mockUserPreferences);

      expect(reports.console).toBeDefined();
      expect(reports.markdown).toBeDefined();
      expect(reports.markdown.path).toContain('internal-linking-report-');
      expect(reports.html).toBeDefined();
      expect(reports.html.path).toContain('internal-linking-report-');
      expect(reports.csv).toBeDefined();
      expect(reports.csv.path).toContain('internal-linking-data-');

      expect(fs.ensureDir).toHaveBeenCalledWith(reportGenerator.reportsDir);
      expect(fs.writeFile).toHaveBeenCalledTimes(3); // markdown, html, csv
    });

    test('should generate only console report when specified', async () => {
      const preferences = { outputFormats: ['console'] };
      
      const reports = await reportGenerator.generateReports(mockSiteAnalysis, preferences);

      expect(reports.console).toBeDefined();
      expect(reports.markdown).toBeUndefined();
      expect(reports.html).toBeUndefined();
      expect(reports.csv).toBeUndefined();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('should handle file write errors gracefully', async () => {
      fs.writeFile.mockRejectedValue(new Error('Write error'));

      await expect(reportGenerator.generateReports(mockSiteAnalysis, mockUserPreferences))
        .rejects.toThrow('Write error');
    });
  });

  describe('generateConsoleReport', () => {
    const mockSiteAnalysis = {
      overall: { score: 75, grade: 'B', totalPages: 100 },
      tiers: {
        distribution: {
          money: { count: 10, percentage: 10, status: 'good' },
          supporting: { count: 30, percentage: 30, status: 'good' },
          traffic: { count: 60, percentage: 60, status: 'good' }
        },
        scores: { money: 85, supporting: 70, traffic: 60 }
      },
      analytics: {
        averages: { ilr: 65, incomingLinks: 25, loadTime: 1.8 },
        orphanedPages: 15,
        highPerformingPages: 20,
        lowPerformingPages: 10
      },
      opportunities: [
        { priority: 'high', issue: 'Test issue', recommendation: 'Test recommendation', impact: 'High impact' }
      ],
      recommendations: [
        { priority: 'medium', title: 'Test recommendation', action: 'Test action', impact: 'Medium impact' }
      ],
      pageScores: [
        { 
          total: 90, 
          page: { title: 'Top Page' }, 
          grade: 'A+',
          breakdown: { linkScore: 80, technicalScore: 90, contentScore: 85, clusterScore: 75, tierScore: 85 }
        },
        { 
          total: 30, 
          page: { title: 'Bottom Page' }, 
          grade: 'F',
          breakdown: { linkScore: 20, technicalScore: 30, contentScore: 25, clusterScore: 35, tierScore: 30 }
        }
      ]
    };

    test('should generate console report with all sections', () => {
      const report = reportGenerator.generateConsoleReport(mockSiteAnalysis, {});

      expect(report).toContain('INTERNAL LINKING REPORT CARD');
      expect(report).toContain('OVERALL SITE SCORE');
      expect(report).toContain('TIER DISTRIBUTION');
      expect(report).toContain('TOP OPTIMIZATION OPPORTUNITIES');
      expect(report).toContain('STRATEGIC RECOMMENDATIONS');
      expect(report).toContain('TOP PERFORMING PAGES');
      expect(report).toContain('PAGES NEEDING ATTENTION');
    });

    test('should include action plan when requested', () => {
      const userPreferences = { createActionPlan: true, timeline: 'moderate' };
      const report = reportGenerator.generateConsoleReport(mockSiteAnalysis, userPreferences);

      expect(report).toContain('IMPLEMENTATION ACTION PLAN');
      expect(report).toContain('moderate');
    });

    test('should not include action plan when not requested', () => {
      const userPreferences = { createActionPlan: false };
      const report = reportGenerator.generateConsoleReport(mockSiteAnalysis, userPreferences);

      expect(report).not.toContain('IMPLEMENTATION ACTION PLAN');
    });
  });

  describe('generateMarkdownReport', () => {
    const mockSiteAnalysis = {
      overall: { score: 75, grade: 'B', totalPages: 100 },
      tiers: {
        distribution: {
          money: { count: 10, percentage: 10, status: 'good' },
          supporting: { count: 30, percentage: 30, status: 'good' },
          traffic: { count: 60, percentage: 60, status: 'good' }
        },
        scores: { money: 85, supporting: 70, traffic: 60 }
      },
      analytics: {
        averages: { ilr: 65, incomingLinks: 25, loadTime: 1.8 },
        orphanedPages: 15,
        highPerformingPages: 20,
        lowPerformingPages: 10
      },
      opportunities: [
        { priority: 'high', issue: 'Test issue', recommendation: 'Test recommendation', impact: 'High impact', page: { title: 'Test Page', url: 'https://example.com' } }
      ],
      recommendations: [
        { priority: 'medium', title: 'Test recommendation', action: 'Test action', impact: 'Medium impact', category: 'test' }
      ],
      pageScores: [
        { total: 90, page: { title: 'Top Page' }, grade: 'A+', breakdown: { linkScore: 80, technicalScore: 90, contentScore: 85 } },
        { total: 30, page: { title: 'Bottom Page' }, grade: 'F', recommendations: [{ action: 'Fix this' }, { action: 'Fix that' }] }
      ]
    };

    test('should generate markdown report with proper structure', () => {
      const report = reportGenerator.generateMarkdownReport(mockSiteAnalysis, { timeline: 'moderate' });

      expect(report).toContain('# Internal Linking Optimization Report');
      expect(report).toContain('## Executive Summary');
      expect(report).toContain('## Top Optimization Opportunities');
      expect(report).toContain('## Strategic Recommendations');
      expect(report).toContain('## Page Performance Analysis');
      expect(report).toContain('## Implementation Timeline');
      expect(report).toContain('## Monitoring & Next Steps');
    });

    test('should include page links in opportunities', () => {
      const report = reportGenerator.generateMarkdownReport(mockSiteAnalysis, {});

      expect(report).toContain('[Test Page](https://example.com)');
    });

    test('should include monitoring tools when specified', () => {
      const userPreferences = { monitoringTools: ['gsc', 'ga'] };
      const report = reportGenerator.generateMarkdownReport(mockSiteAnalysis, userPreferences);

      expect(report).toContain('gsc, ga');
    });

    test('should include WordPress integration when specified', () => {
      const userPreferences = { wordpressIntegration: 'yes', wordpressPlugin: 'Link Whisper', linkManagement: 'automated' };
      const report = reportGenerator.generateMarkdownReport(mockSiteAnalysis, userPreferences);

      expect(report).toContain('Link Whisper');
      expect(report).toContain('automated');
    });
  });

  describe('generateHTMLReport', () => {
    const mockSiteAnalysis = {
      overall: { score: 75, grade: 'B', totalPages: 100 },
      tiers: {
        distribution: {
          money: { count: 10, percentage: 10, status: 'good' },
          supporting: { count: 30, percentage: 30, status: 'good' },
          traffic: { count: 60, percentage: 60, status: 'good' }
        },
        scores: { money: 85, supporting: 70, traffic: 60 }
      },
      analytics: {
        averages: { ilr: 65, incomingLinks: 25, loadTime: 1.8 },
        orphanedPages: 15,
        highPerformingPages: 20,
        lowPerformingPages: 10
      },
      opportunities: [
        { priority: 'high', issue: 'Test issue', recommendation: 'Test recommendation', impact: 'High impact' }
      ],
      recommendations: [
        { priority: 'medium', title: 'Test recommendation', action: 'Test action', impact: 'Medium impact' }
      ],
      pageScores: [
        { 
          total: 90, 
          page: { title: 'Top Page' }, 
          grade: 'A+',
          breakdown: { linkScore: 80, technicalScore: 90, contentScore: 85, clusterScore: 75, tierScore: 85 }
        },
        { 
          total: 30, 
          page: { title: 'Bottom Page' }, 
          grade: 'F',
          breakdown: { linkScore: 20, technicalScore: 30, contentScore: 25, clusterScore: 35, tierScore: 30 }
        }
      ]
    };

    test('should generate HTML report with proper structure', () => {
      const report = reportGenerator.generateHTMLReport(mockSiteAnalysis, { createActionPlan: true, timeline: 'moderate' });

      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('<html lang="en">');
      expect(report).toContain('<head>');
      expect(report).toContain('<title>Internal Linking Optimization Report</title>');
      expect(report).toContain('<body>');
      expect(report).toContain('Overall Optimization Score');
      expect(report).toContain('Tier Distribution Analysis');
      expect(report).toContain('Top Optimization Opportunities');
      expect(report).toContain('Strategic Recommendations');
      expect(report).toContain('Page Performance Analysis');
      expect(report).toContain('Implementation Action Plan');
    });

    test('should include action plan section when requested', () => {
      const userPreferences = { createActionPlan: true, timeline: 'moderate' };
      const report = reportGenerator.generateHTMLReport(mockSiteAnalysis, userPreferences);

      expect(report).toContain('Implementation Action Plan');
      expect(report).toContain('moderate');
    });

    test('should not include action plan section when not requested', () => {
      const userPreferences = { createActionPlan: false };
      const report = reportGenerator.generateHTMLReport(mockSiteAnalysis, userPreferences);

      expect(report).not.toContain('Implementation Action Plan');
    });

    test('should use correct score colors', () => {
      mockScoringEngine.getScoreColor.mockReturnValue('#28a745');
      
      const report = reportGenerator.generateHTMLReport(mockSiteAnalysis, {});
      
      expect(mockScoringEngine.getScoreColor).toHaveBeenCalledWith(75);
      expect(report).toContain('#28a745');
    });
  });

  describe('generateCSVReport', () => {
    const mockSiteAnalysis = {
      pageScores: [
        {
          page: {
            url: 'https://example.com/page1',
            title: 'Page 1',
            tier: 'money',
            ilr: 95,
            incomingLinks: 50,
            outgoingLinks: 25,
            loadTime: 1.5,
            issues: 0
          },
          total: 90,
          grade: 'A+',
          recommendations: [{ action: 'Add more links' }]
        },
        {
          page: {
            url: 'https://example.com/page2',
            title: 'Page 2',
            tier: 'traffic',
            ilr: 45,
            incomingLinks: 5,
            outgoingLinks: 10,
            loadTime: 2.5,
            issues: 2
          },
          total: 30,
          grade: 'F',
          recommendations: [{ action: 'Fix technical issues' }]
        }
      ]
    };

    test('should generate CSV report with correct headers', () => {
      const csv = reportGenerator.generateCSVReport(mockSiteAnalysis);

      expect(csv).toContain('Page URL,Page Title,Tier,ILR Score,Incoming Links,Outgoing Links,Optimization Score,Grade,Load Time,Issues,Top Recommendation');
    });

    test('should include all page data in CSV format', () => {
      const csv = reportGenerator.generateCSVReport(mockSiteAnalysis);

      expect(csv).toContain('https://example.com/page1');
      expect(csv).toContain('Page 1');
      expect(csv).toContain('money');
      expect(csv).toContain('95');
      expect(csv).toContain('50');
      expect(csv).toContain('25');
      expect(csv).toContain('90');
      expect(csv).toContain('A+');
      expect(csv).toContain('1.5');
      expect(csv).toContain('0');
      expect(csv).toContain('Add more links');
    });

    test('should handle pages with missing data', () => {
      const incompleteAnalysis = {
        pageScores: [
          {
            page: {},
            total: 0,
            grade: 'F',
            recommendations: []
          }
        ]
      };

      const csv = reportGenerator.generateCSVReport(incompleteAnalysis);

      expect(csv).toContain('""');
      expect(csv).toContain('0');
      expect(csv).toContain('No specific recommendation');
    });
  });

  describe('utility methods', () => {
    test('getScoreColor should return correct colors', () => {
      expect(reportGenerator.getScoreColor(90)).toBe('#28a745');
      expect(reportGenerator.getScoreColor(70)).toBe('#ffc107');
      expect(reportGenerator.getScoreColor(50)).toBe('#dc3545');
    });

    test('getStatusEmoji should return correct emojis', () => {
      expect(reportGenerator.getStatusEmoji('good')).toBe('✅');
      expect(reportGenerator.getStatusEmoji('too-few')).toBe('⬇️');
      expect(reportGenerator.getStatusEmoji('too-many')).toBe('⬆️');
      expect(reportGenerator.getStatusEmoji('unknown')).toBe('❓');
    });

    test('getStatusText should return correct text', () => {
      expect(reportGenerator.getStatusText('good')).toBe('Optimal Distribution');
      expect(reportGenerator.getStatusText('too-few')).toBe('Need More Pages');
      expect(reportGenerator.getStatusText('too-many')).toBe('Too Many Pages');
      expect(reportGenerator.getStatusText('unknown')).toBe('Unknown Status');
    });

    test('getTimestamp should return formatted timestamp', () => {
      const timestamp = reportGenerator.getTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });

    test('displayConsoleReport should log report', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const testReport = 'Test report content';

      reportGenerator.displayConsoleReport(testReport);

      expect(consoleSpy).toHaveBeenCalledWith(testReport);
      consoleSpy.mockRestore();
    });
  });

  describe('openHTMLReport', () => {
    test('should open HTML report on macOS', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const { exec } = require('child_process');
      const execSpy = jest.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
        callback(null, 'success');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await reportGenerator.openHTMLReport('/path/to/report.html');

      expect(execSpy).toHaveBeenCalledWith('open "/path/to/report.html"', expect.any(Function));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('HTML report opened'));

      Object.defineProperty(process, 'platform', { value: originalPlatform });
      execSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    test('should open HTML report on Windows', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      const execSpy = jest.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
        callback(null, 'success');
      });

      await reportGenerator.openHTMLReport('/path/to/report.html');

      expect(execSpy).toHaveBeenCalledWith('start "" "/path/to/report.html"', expect.any(Function));

      Object.defineProperty(process, 'platform', { value: originalPlatform });
      execSpy.mockRestore();
    });

    test('should open HTML report on Linux', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      const execSpy = jest.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
        callback(null, 'success');
      });

      await reportGenerator.openHTMLReport('/path/to/report.html');

      expect(execSpy).toHaveBeenCalledWith('xdg-open "/path/to/report.html"', expect.any(Function));

      Object.defineProperty(process, 'platform', { value: originalPlatform });
      execSpy.mockRestore();
    });

    test('should handle open errors gracefully', async () => {
      const execSpy = jest.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
        callback(new Error('Open failed'), null);
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await reportGenerator.openHTMLReport('/path/to/report.html');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Could not auto-open HTML report'));

      execSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
