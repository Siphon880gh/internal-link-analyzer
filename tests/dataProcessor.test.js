const DataProcessor = require('../src/dataProcessor');
const fs = require('fs-extra');
const csv = require('csv-parser');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('csv-parser');

describe('DataProcessor', () => {
  let dataProcessor;
  let mockCSVData;

  beforeEach(() => {
    dataProcessor = new DataProcessor();
    
    // Sample CSV data for testing
    mockCSVData = [
      {
        'Page URL': 'https://example.com/cleaning-services',
        'Page Title': 'Service Page Title',
        'ILR': '95.5',
        'Raw ILR': '0.95',
        'Incoming Internal Links': '50',
        'Outgoing Internal Links': '25',
        'Crawl Depth': '2',
        'HTTP Status Code': '200',
        'Page (HTML) Load Time, sec': '1.5',
        'In sitemap': '1',
        'Issues': '0',
        'Description': 'Test service page description'
      },
      {
        'Page URL': 'https://example.com/supporting-page',
        'Page Title': 'Supporting Page Title',
        'ILR': '75.0',
        'Raw ILR': '0.75',
        'Incoming Internal Links': '30',
        'Outgoing Internal Links': '20',
        'Crawl Depth': '3',
        'HTTP Status Code': '200',
        'Page (HTML) Load Time, sec': '2.0',
        'In sitemap': '1',
        'Issues': '2',
        'Description': 'Test supporting page description'
      },
      {
        'Page URL': 'https://example.com/blog-post',
        'Page Title': 'Blog Post Title',
        'ILR': '45.0',
        'Raw ILR': '0.45',
        'Incoming Internal Links': '5',
        'Outgoing Internal Links': '15',
        'Crawl Depth': '4',
        'HTTP Status Code': '200',
        'Page (HTML) Load Time, sec': '1.8',
        'In sitemap': '0',
        'Issues': '1',
        'Description': 'Test blog post description'
      }
    ];

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with empty arrays and categories', () => {
      expect(dataProcessor.pages).toEqual([]);
      expect(dataProcessor.categories).toEqual({
        moneyPages: [],
        supportingPages: [],
        trafficPages: []
      });
    });
  });

  describe('parseCSV', () => {
    test('should parse CSV data and categorize pages correctly', async () => {
      // Mock CSV stream
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            mockCSVData.forEach(callback);
          } else if (event === 'end') {
            callback();
          }
          return mockStream;
        })
      };

      // Override the mock for this specific test
      const originalMock = fs.createReadStream;
      fs.createReadStream = jest.fn(() => mockStream);

      const result = await dataProcessor.parseCSV('test.csv');

      expect(result).toHaveLength(3);
      expect(dataProcessor.pages).toHaveLength(3);
      
      // Check first page (service page with high ILR)
      const servicePage = dataProcessor.pages[0];
      expect(servicePage.url).toBe('https://example.com/cleaning-services');
      expect(servicePage.title).toBe('Service Page Title');
      expect(servicePage.ilr).toBe(95.5);
      expect(servicePage.incomingLinks).toBe(50);
      expect(servicePage.tier).toBe('money');
      expect(servicePage.pageType).toBe('service');
    });

    test('should handle CSV parsing errors', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('CSV parsing error'));
          }
          return mockStream;
        })
      };

      // Override the mock for this specific test
      const originalMock = fs.createReadStream;
      fs.createReadStream = jest.fn(() => mockStream);

      await expect(dataProcessor.parseCSV('invalid.csv')).rejects.toThrow('CSV parsing error');
    });

    test('should handle empty CSV files', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'end') {
            callback();
          }
          return mockStream;
        })
      };

      // Override the mock for this specific test
      const originalMock = fs.createReadStream;
      fs.createReadStream = jest.fn(() => mockStream);

      const result = await dataProcessor.parseCSV('empty.csv');
      expect(result).toEqual([]);
      expect(dataProcessor.pages).toEqual([]);
    });
  });

  describe('extractSlug', () => {
    test('should extract slug from URL correctly', () => {
      expect(dataProcessor.extractSlug('https://example.com/service-page')).toBe('service-page');
      expect(dataProcessor.extractSlug('https://example.com/path/to/page')).toBe('page');
      expect(dataProcessor.extractSlug('https://example.com/')).toBe('');
      expect(dataProcessor.extractSlug('')).toBe('');
      expect(dataProcessor.extractSlug(null)).toBe('');
    });
  });

  describe('determinePageType', () => {
    test('should identify service pages correctly', () => {
      expect(dataProcessor.determinePageType('https://example.com/cleaning-services', 'Service Page')).toBe('service');
      expect(dataProcessor.determinePageType('https://example.com/bank-cleaning', 'Bank Service')).toBe('service');
      expect(dataProcessor.determinePageType('https://example.com/medical-facility', 'Medical Service')).toBe('service');
    });

    test('should identify supporting pages correctly', () => {
      expect(dataProcessor.determinePageType('https://example.com/about', 'About Page')).toBe('supporting');
      expect(dataProcessor.determinePageType('https://example.com/contact', 'Contact Page')).toBe('supporting');
      expect(dataProcessor.determinePageType('https://example.com/day-porter', 'Day Porter')).toBe('supporting');
    });

    test('should identify blog pages correctly', () => {
      expect(dataProcessor.determinePageType('https://example.com/blog/post', 'Blog Post')).toBe('blog');
      expect(dataProcessor.determinePageType('https://example.com/recent-blog', 'Recent Blog')).toBe('blog');
      expect(dataProcessor.determinePageType('https://example.com/article', 'Tips and Guide')).toBe('blog');
    });

    test('should return other for unrecognized pages', () => {
      expect(dataProcessor.determinePageType('https://example.com/random', 'Random Page')).toBe('other');
      expect(dataProcessor.determinePageType('', '')).toBe('other');
      expect(dataProcessor.determinePageType(null, null)).toBe('other');
    });
  });

  describe('categorizePages', () => {
    beforeEach(() => {
      // Set up test data
      dataProcessor.pages = [
        {
          url: 'https://example.com/service',
          title: 'Service Page',
          ilr: 95,
          pageType: 'service',
          tier: null
        },
        {
          url: 'https://example.com/supporting',
          title: 'Supporting Page',
          ilr: 75,
          pageType: 'supporting',
          tier: null
        },
        {
          url: 'https://example.com/blog',
          title: 'Blog Page',
          ilr: 45,
          pageType: 'blog',
          tier: null
        }
      ];
    });

    test('should categorize pages into correct tiers', () => {
      dataProcessor.categorizePages();

      expect(dataProcessor.pages[0].tier).toBe('money');
      expect(dataProcessor.pages[1].tier).toBe('supporting');
      expect(dataProcessor.pages[2].tier).toBe('traffic');

      expect(dataProcessor.categories.moneyPages).toHaveLength(1);
      expect(dataProcessor.categories.supportingPages).toHaveLength(1);
      expect(dataProcessor.categories.trafficPages).toHaveLength(1);
    });

    test('should sort categories by ILR score', () => {
      dataProcessor.pages = [
        { ilr: 50, tier: null, pageType: 'service' },
        { ilr: 100, tier: null, pageType: 'service' },
        { ilr: 75, tier: null, pageType: 'service' }
      ];

      dataProcessor.categorizePages();

      // Page with ILR 100 should be in moneyPages (>= 95)
      expect(dataProcessor.categories.moneyPages[0].ilr).toBe(100);
      
      // Page with ILR 75 should be in supportingPages (70-94)
      expect(dataProcessor.categories.supportingPages[0].ilr).toBe(75);
      
      // Page with ILR 50 should be in trafficPages (< 70)
      expect(dataProcessor.categories.trafficPages[0].ilr).toBe(50);
    });
  });

  describe('getAnalytics', () => {
    beforeEach(() => {
      dataProcessor.pages = [
        { ilr: 95, incomingLinks: 50, loadTime: 1.5, tier: 'money' },
        { ilr: 75, incomingLinks: 30, loadTime: 2.0, tier: 'supporting' },
        { ilr: 45, incomingLinks: 5, loadTime: 1.8, tier: 'traffic' },
        { ilr: 25, incomingLinks: 1, loadTime: 3.0, tier: 'traffic' }
      ];
      dataProcessor.categories = {
        moneyPages: [dataProcessor.pages[0]],
        supportingPages: [dataProcessor.pages[1]],
        trafficPages: [dataProcessor.pages[2], dataProcessor.pages[3]]
      };
    });

    test('should return correct analytics', () => {
      const analytics = dataProcessor.getAnalytics();

      expect(analytics.totalPages).toBe(4);
      expect(analytics.orphanedPages).toBe(1); // 1 page with ≤2 links
      expect(analytics.highPerformingPages).toBe(1); // 1 page with ILR ≥90
      expect(analytics.lowPerformingPages).toBe(2); // 2 pages with ILR <50
      
      expect(analytics.averages.ilr).toBeCloseTo(60, 0);
      expect(analytics.averages.incomingLinks).toBeCloseTo(21.5, 1);
      expect(analytics.averages.loadTime).toBeCloseTo(2.075, 2);
      
      expect(analytics.distribution.money).toBe(1);
      expect(analytics.distribution.supporting).toBe(1);
      expect(analytics.distribution.traffic).toBe(2);
    });

    test('should handle empty pages array', () => {
      dataProcessor.pages = [];
      dataProcessor.categories = { moneyPages: [], supportingPages: [], trafficPages: [] };

      const analytics = dataProcessor.getAnalytics();

      expect(analytics.totalPages).toBe(0);
      expect(analytics.orphanedPages).toBe(0);
      expect(analytics.averages.ilr).toBeNaN();
    });
  });

  describe('findOptimizationOpportunities', () => {
    beforeEach(() => {
      dataProcessor.pages = [
        { incomingLinks: 1, ilr: 30, pageType: 'service', title: 'Orphaned Service', tier: 'money' },
        { incomingLinks: 50, ilr: 60, pageType: 'service', title: 'Low ILR Service', tier: 'money' },
        { incomingLinks: 100, ilr: 95, pageType: 'service', title: 'Over-linked', tier: 'money' },
        { incomingLinks: 5, ilr: 80, pageType: 'supporting', title: 'Under-linked', tier: 'supporting' }
      ];
    });

    test('should find orphaned pages', () => {
      const opportunities = dataProcessor.findOptimizationOpportunities();
      
      const orphanedOpps = opportunities.filter(opp => opp.type === 'orphaned');
      expect(orphanedOpps).toHaveLength(1);
      expect(orphanedOpps[0].priority).toBe('high');
      expect(orphanedOpps[0].page.title).toBe('Orphaned Service');
    });

    test('should find low ILR service pages', () => {
      const opportunities = dataProcessor.findOptimizationOpportunities();
      
      const lowILROpps = opportunities.filter(opp => opp.type === 'low-ilr');
      expect(lowILROpps).toHaveLength(2); // Both Orphaned Service (30) and Low ILR Service (60) have ILR < 70
      expect(lowILROpps[0].priority).toBe('medium');
      expect(lowILROpps[1].priority).toBe('medium');
      expect(lowILROpps.some(opp => opp.page.title === 'Low ILR Service')).toBe(true);
      expect(lowILROpps.some(opp => opp.page.title === 'Orphaned Service')).toBe(true);
    });

    test('should find distribution issues', () => {
      const opportunities = dataProcessor.findOptimizationOpportunities();
      
      const distOpps = opportunities.filter(opp => opp.type === 'distribution');
      expect(distOpps).toHaveLength(1);
      expect(distOpps[0].priority).toBe('medium');
      expect(distOpps[0].details.overLinked).toBe(1); // "Over-linked" has 100 links
      expect(distOpps[0].details.underLinked).toBe(2); // "Orphaned Service" (1 link) and "Under-linked" (5 links)
    });

    test('should sort opportunities by priority', () => {
      const opportunities = dataProcessor.findOptimizationOpportunities();
      
      const priorities = opportunities.map(opp => opp.priority);
      expect(priorities).toEqual(['high', 'medium', 'medium', 'medium']); // orphaned (high), low-ilr (2x medium), distribution (medium)
    });
  });

  describe('generateTopicClusters', () => {
    beforeEach(() => {
      dataProcessor.pages = [
        { url: 'https://example.com/office-building', slug: 'office-building', pageType: 'service', ilr: 95, tier: 'money' },
        { url: 'https://example.com/bank-cleaning', slug: 'bank-cleaning', pageType: 'service', ilr: 90, tier: 'money' },
        { url: 'https://example.com/medical-facility', slug: 'medical-facility', pageType: 'service', ilr: 85, tier: 'money' },
        { url: 'https://example.com/day-porter', slug: 'day-porter', pageType: 'supporting', ilr: 70, tier: 'supporting' },
        { url: 'https://example.com/blog-post', slug: 'blog-post', pageType: 'blog', ilr: 40, tier: 'traffic' }
      ];
      dataProcessor.categories = {
        moneyPages: dataProcessor.pages.slice(0, 3),
        supportingPages: [dataProcessor.pages[3]],
        trafficPages: [dataProcessor.pages[4]]
      };
    });

    test('should generate commercial cleaning services cluster', () => {
      const clusters = dataProcessor.generateTopicClusters();
      
      const commercialCluster = clusters.find(c => c.name === 'Commercial Cleaning Services');
      expect(commercialCluster).toBeDefined();
      expect(commercialCluster.type).toBe('service-cluster');
      expect(commercialCluster.hub.slug).toBe('office-building');
      expect(commercialCluster.spokes).toHaveLength(2);
    });

    test('should generate supporting services cluster', () => {
      const clusters = dataProcessor.generateTopicClusters();
      
      const supportingCluster = clusters.find(c => c.name === 'Supporting Services & Solutions');
      expect(supportingCluster).toBeDefined();
      expect(supportingCluster.type).toBe('supporting-cluster');
    });

    test('should generate blog content cluster', () => {
      const clusters = dataProcessor.generateTopicClusters();
      
      const blogCluster = clusters.find(c => c.name === 'Cleaning Tips & Education');
      expect(blogCluster).toBeDefined();
      expect(blogCluster.type).toBe('content-cluster');
    });

    test('should return empty array when no clusters can be formed', () => {
      dataProcessor.pages = [];
      dataProcessor.categories = { moneyPages: [], supportingPages: [], trafficPages: [] };

      const clusters = dataProcessor.generateTopicClusters();
      expect(clusters).toEqual([]);
    });
  });

  describe('getPagesByCategory', () => {
    beforeEach(() => {
      dataProcessor.categories = {
        moneyPages: [{ title: 'Money Page 1' }, { title: 'Money Page 2' }],
        supportingPages: [{ title: 'Supporting Page 1' }],
        trafficPages: [{ title: 'Traffic Page 1' }, { title: 'Traffic Page 2' }, { title: 'Traffic Page 3' }]
      };
    });

    test('should return correct pages for valid category', () => {
      const moneyPages = dataProcessor.getPagesByCategory('moneyPages');
      expect(moneyPages).toHaveLength(2);
      expect(moneyPages[0].title).toBe('Money Page 1');

      const supportingPages = dataProcessor.getPagesByCategory('supportingPages');
      expect(supportingPages).toHaveLength(1);
      expect(supportingPages[0].title).toBe('Supporting Page 1');
    });

    test('should return empty array for invalid category', () => {
      const invalidPages = dataProcessor.getPagesByCategory('invalidCategory');
      expect(invalidPages).toEqual([]);
    });
  });

  describe('getAllPages', () => {
    test('should return all pages', () => {
      dataProcessor.pages = [{ title: 'Page 1' }, { title: 'Page 2' }];
      
      const allPages = dataProcessor.getAllPages();
      expect(allPages).toHaveLength(2);
      expect(allPages[0].title).toBe('Page 1');
    });
  });

  describe('getPageByUrl', () => {
    beforeEach(() => {
      dataProcessor.pages = [
        { url: 'https://example.com/page1', title: 'Page 1' },
        { url: 'https://example.com/page2', title: 'Page 2' }
      ];
    });

    test('should return correct page for existing URL', () => {
      const page = dataProcessor.getPageByUrl('https://example.com/page1');
      expect(page.title).toBe('Page 1');
    });

    test('should return undefined for non-existing URL', () => {
      const page = dataProcessor.getPageByUrl('https://example.com/nonexistent');
      expect(page).toBeUndefined();
    });
  });

  describe('searchPages', () => {
    beforeEach(() => {
      dataProcessor.pages = [
        { title: 'Cleaning Services Austin', url: 'https://example.com/cleaning', description: 'Professional cleaning' },
        { title: 'Office Cleaning', url: 'https://example.com/office', description: 'Office cleaning services' },
        { title: 'Blog Post', url: 'https://example.com/blog', description: 'Cleaning tips and tricks' }
      ];
    });

    test('should search by title', () => {
      const results = dataProcessor.searchPages('cleaning');
      expect(results).toHaveLength(3);
      expect(results[0].title).toBe('Cleaning Services Austin');
    });

    test('should search by URL', () => {
      const results = dataProcessor.searchPages('office');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Office Cleaning');
    });

    test('should search by description', () => {
      const results = dataProcessor.searchPages('professional');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Cleaning Services Austin');
    });

    test('should be case insensitive', () => {
      const results = dataProcessor.searchPages('CLEANING');
      expect(results).toHaveLength(3);
    });

    test('should return empty array for no matches', () => {
      const results = dataProcessor.searchPages('nonexistent');
      expect(results).toEqual([]);
    });
  });
});
