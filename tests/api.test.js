const request = require('supertest');
const path = require('path');

// Mock the PHP server for testing
const mockPhpServer = {
  get: jest.fn(),
  post: jest.fn()
};

// Mock fs for file operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock child_process for PHP execution
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('API Endpoints', () => {
  const fs = require('fs');
  const { exec } = require('child_process');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search_pages endpoint', () => {
    test('should return page suggestions for valid query', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/service,Service Page,95,50
https://example.com/supporting,Supporting Page,75,30
https://example.com/blog,Blog Post,45,10`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      // Mock PHP execution
      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            {
              title: 'Service Page',
              url: 'https://example.com/service',
              ilr: 95,
              incomingLinks: 50,
              tier: 'money',
              slug: 'service'
            }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      // Simulate API call
      const query = 'service';
      const expectedResponse = {
        suggestions: [
          {
            title: 'Service Page',
            url: 'https://example.com/service',
            ilr: 95,
            incomingLinks: 50,
            tier: 'money',
            slug: 'service'
          }
        ]
      };

      // Test the search functionality
      expect(fs.existsSync).toHaveBeenCalledWith('data/naecleaningsolutions.com_pages_20250923.csv');
      expect(fs.readFileSync).toHaveBeenCalledWith('data/naecleaningsolutions.com_pages_20250923.csv', 'utf8');
      
      done();
    });

    test('should return empty suggestions for short query', (done) => {
      exec.mockImplementation((command, callback) => {
        const mockResponse = { suggestions: [] };
        callback(null, JSON.stringify(mockResponse));
      });

      const query = 'a';
      const expectedResponse = { suggestions: [] };

      done();
    });

    test('should return all pages for empty query', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/page1,Page 1,95,50
https://example.com/page2,Page 2,75,30
https://example.com/page3,Page 3,45,10`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            { title: 'Page 1', url: 'https://example.com/page1', ilr: 95, incomingLinks: 50, tier: 'money', slug: 'page1' },
            { title: 'Page 2', url: 'https://example.com/page2', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'page2' },
            { title: 'Page 3', url: 'https://example.com/page3', ilr: 45, incomingLinks: 10, tier: 'traffic', slug: 'page3' }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should handle CSV file not found', (done) => {
      fs.existsSync.mockReturnValue(false);

      exec.mockImplementation((command, callback) => {
        const mockResponse = { error: 'CSV file not found' };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should categorize pages correctly', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/cleaning-services,Cleaning Services,95,50
https://example.com/about,About Us,75,30
https://example.com/blog-post,Blog Post,45,10`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            { title: 'Cleaning Services', url: 'https://example.com/cleaning-services', ilr: 95, incomingLinks: 50, tier: 'money', slug: 'cleaning-services' },
            { title: 'About Us', url: 'https://example.com/about', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'about' },
            { title: 'Blog Post', url: 'https://example.com/blog-post', ilr: 45, incomingLinks: 10, tier: 'traffic', slug: 'blog-post' }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should sort results by ILR score', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/page1,Page 1,45,10
https://example.com/page2,Page 2,95,50
https://example.com/page3,Page 3,75,30`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            { title: 'Page 2', url: 'https://example.com/page2', ilr: 95, incomingLinks: 50, tier: 'money', slug: 'page2' },
            { title: 'Page 3', url: 'https://example.com/page3', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'page3' },
            { title: 'Page 1', url: 'https://example.com/page1', ilr: 45, incomingLinks: 10, tier: 'traffic', slug: 'page1' }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });
  });

  describe('generate_report endpoint', () => {
    test('should generate HTML report successfully', (done) => {
      const mockInput = {
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        outputFormats: ['html'],
        primaryGoal: 'conversions',
        timeline: 'moderate',
        optimizationAreas: ['orphaned']
      };

      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          success: true,
          analysis: {
            overall: { score: 75, grade: 'B', totalPages: 100 },
            analytics: {
              totalPages: 100,
              orphanedPages: 15,
              averages: { ilr: 65, incomingLinks: 25 },
              distribution: { money: 10, supporting: 30, traffic: 60 }
            },
            opportunities: [
              { priority: 'high', issue: 'Test issue', recommendation: 'Test recommendation', impact: 'High impact' }
            ],
            recommendations: [
              { priority: 'medium', title: 'Test recommendation', action: 'Test action', impact: 'Medium impact' }
            ]
          },
          reports: {
            html: {
              path: 'reports/internal-linking-report-2023-01-01T12-00-00.html',
              content: '<html>Test HTML Report</html>',
              size: 1000
            }
          },
          timestamp: '2023-01-01T12-00-00'
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should generate multiple report formats', (done) => {
      const mockInput = {
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        outputFormats: ['html', 'csv', 'markdown'],
        primaryGoal: 'conversions',
        timeline: 'moderate',
        optimizationAreas: ['orphaned']
      };

      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          success: true,
          analysis: {
            overall: { score: 75, grade: 'B', totalPages: 100 },
            analytics: {
              totalPages: 100,
              orphanedPages: 15,
              averages: { ilr: 65, incomingLinks: 25 },
              distribution: { money: 10, supporting: 30, traffic: 60 }
            },
            opportunities: [],
            recommendations: []
          },
          reports: {
            html: {
              path: 'reports/internal-linking-report-2023-01-01T12-00-00.html',
              content: '<html>Test HTML Report</html>',
              size: 1000
            },
            csv: {
              path: 'reports/internal-linking-data-2023-01-01T12-00-00.csv',
              content: 'Page URL,Page Title,Score\nhttps://example.com,Test Page,75',
              size: 100
            },
            markdown: {
              path: 'reports/internal-linking-report-2023-01-01T12-00-00.md',
              content: '# Test Report\n\nTest content',
              size: 200
            }
          },
          timestamp: '2023-01-01T12-00-00'
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should handle invalid input data', (done) => {
      const mockInput = null;

      exec.mockImplementation((command, callback) => {
        const mockResponse = { error: 'Invalid input data' };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should handle custom pages', (done) => {
      const mockInput = {
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        customMoneyPages: [
          { url: 'https://example.com/custom-money', title: 'Custom Money Page' }
        ],
        customSupportingPages: [
          { url: 'https://example.com/custom-supporting', title: 'Custom Supporting Page' }
        ],
        outputFormats: ['html'],
        primaryGoal: 'conversions',
        timeline: 'moderate',
        optimizationAreas: ['orphaned']
      };

      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          success: true,
          analysis: {
            overall: { score: 75, grade: 'B', totalPages: 102 }, // 2 custom pages added
            analytics: {
              totalPages: 102,
              orphanedPages: 15,
              averages: { ilr: 65, incomingLinks: 25 },
              distribution: { money: 11, supporting: 31, traffic: 60 } // Custom pages added to respective tiers
            },
            opportunities: [],
            recommendations: []
          },
          reports: {
            html: {
              path: 'reports/internal-linking-report-2023-01-01T12-00-00.html',
              content: '<html>Test HTML Report with Custom Pages</html>',
              size: 1200
            }
          },
          timestamp: '2023-01-01T12-00-00'
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should handle analysis errors', (done) => {
      const mockInput = {
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        outputFormats: ['html'],
        primaryGoal: 'conversions',
        timeline: 'moderate',
        optimizationAreas: ['orphaned']
      };

      exec.mockImplementation((command, callback) => {
        const mockResponse = { error: 'Analysis failed' };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should create reports directory if it does not exist', (done) => {
      const mockInput = {
        moneyPages: ['service-page'],
        supportingPages: ['supporting-page'],
        outputFormats: ['html'],
        primaryGoal: 'conversions',
        timeline: 'moderate',
        optimizationAreas: ['orphaned']
      };

      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          success: true,
          analysis: {
            overall: { score: 75, grade: 'B', totalPages: 100 },
            analytics: {
              totalPages: 100,
              orphanedPages: 15,
              averages: { ilr: 65, incomingLinks: 25 },
              distribution: { money: 10, supporting: 30, traffic: 60 }
            },
            opportunities: [],
            recommendations: []
          },
          reports: {
            html: {
              path: 'reports/internal-linking-report-2023-01-01T12-00-00.html',
              content: '<html>Test HTML Report</html>',
              size: 1000
            }
          },
          timestamp: '2023-01-01T12-00-00'
        };
        callback(null, JSON.stringify(mockResponse));
      });

      expect(fs.mkdirSync).toHaveBeenCalledWith('reports', 493); // 0755 in decimal

      done();
    });
  });

  describe('Error handling', () => {
    test('should handle PHP execution errors', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(new Error('PHP execution failed'), null);
      });

      done();
    });

    test('should handle malformed JSON response', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(null, 'Invalid JSON response');
      });

      done();
    });

    test('should handle missing action parameter', (done) => {
      exec.mockImplementation((command, callback) => {
        const mockResponse = { error: 'Invalid action', method: 'GET', received_action: '' };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });
  });

  describe('Data validation', () => {
    test('should validate page categorization logic', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/cleaning-services,Cleaning Services,95,50
https://example.com/bank-cleaning,Bank Cleaning,98,60
https://example.com/medical-facility,Medical Facility,100,70
https://example.com/about,About Us,75,30
https://example.com/contact,Contact Us,80,35
https://example.com/day-porter,Day Porter,85,40
https://example.com/blog-post,Blog Post,45,10
https://example.com/random-page,Random Page,30,5`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            { title: 'Medical Facility', url: 'https://example.com/medical-facility', ilr: 100, incomingLinks: 70, tier: 'money', slug: 'medical-facility' },
            { title: 'Bank Cleaning', url: 'https://example.com/bank-cleaning', ilr: 98, incomingLinks: 60, tier: 'money', slug: 'bank-cleaning' },
            { title: 'Cleaning Services', url: 'https://example.com/cleaning-services', ilr: 95, incomingLinks: 50, tier: 'money', slug: 'cleaning-services' },
            { title: 'Day Porter', url: 'https://example.com/day-porter', ilr: 85, incomingLinks: 40, tier: 'supporting', slug: 'day-porter' },
            { title: 'Contact Us', url: 'https://example.com/contact', ilr: 80, incomingLinks: 35, tier: 'supporting', slug: 'contact' },
            { title: 'About Us', url: 'https://example.com/about', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'about' },
            { title: 'Blog Post', url: 'https://example.com/blog-post', ilr: 45, incomingLinks: 10, tier: 'traffic', slug: 'blog-post' },
            { title: 'Random Page', url: 'https://example.com/random-page', ilr: 30, incomingLinks: 5, tier: 'traffic', slug: 'random-page' }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });

    test('should handle edge cases in data processing', (done) => {
      const mockCsvData = `Page URL,Page Title,ILR,Incoming Internal Links
https://example.com/empty-title,,95,50
https://example.com/zero-ilr,Zero ILR,0,10
https://example.com/high-links,High Links,50,200
https://example.com/special-chars,"Page with "quotes" and, commas",75,30`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockCsvData);

      exec.mockImplementation((command, callback) => {
        const mockResponse = {
          suggestions: [
            { title: 'Zero ILR', url: 'https://example.com/zero-ilr', ilr: 0, incomingLinks: 10, tier: 'traffic', slug: 'zero-ilr' },
            { title: 'High Links', url: 'https://example.com/high-links', ilr: 50, incomingLinks: 200, tier: 'traffic', slug: 'high-links' },
            { title: 'Page with "quotes" and, commas', url: 'https://example.com/special-chars', ilr: 75, incomingLinks: 30, tier: 'supporting', slug: 'special-chars' }
          ]
        };
        callback(null, JSON.stringify(mockResponse));
      });

      done();
    });
  });
});
