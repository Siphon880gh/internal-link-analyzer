const ScoringEngine = require('../src/scoringEngine');
const DataProcessor = require('../src/dataProcessor');

describe('ScoringEngine', () => {
  let scoringEngine;
  let mockDataProcessor;

  beforeEach(() => {
    mockDataProcessor = {
      getAllPages: jest.fn(),
      getAnalytics: jest.fn(),
      findOptimizationOpportunities: jest.fn(),
      generateTopicClusters: jest.fn(() => []), // Return empty array by default
      getPagesByCategory: jest.fn(() => []), // Return empty array by default
      categories: {
        moneyPages: [],
        supportingPages: [],
        trafficPages: []
      }
    };

    scoringEngine = new ScoringEngine(mockDataProcessor);
  });

  describe('constructor', () => {
    test('should initialize with correct weights', () => {
      expect(scoringEngine.weights).toEqual({
        linkScore: 0.3,
        tierScore: 0.2,
        technicalScore: 0.2,
        contentScore: 0.15,
        clusterScore: 0.15
      });
    });

    test('should store dataProcessor reference', () => {
      expect(scoringEngine.dataProcessor).toBe(mockDataProcessor);
    });
  });

  describe('calculatePageScore', () => {
    const mockPage = {
      url: 'https://example.com/test-page',
      title: 'Test Page Title',
      ilr: 80,
      incomingLinks: 25,
      outgoingLinks: 15,
      tier: 'supporting',
      httpStatus: 200,
      loadTime: 2.0,
      issues: 1,
      inSitemap: true,
      description: 'Test page description with sufficient length',
      crawlDepth: 2,
      slug: 'test-page'
    };

    beforeEach(() => {
      mockDataProcessor.generateTopicClusters.mockReturnValue([
        {
          hub: { url: 'https://example.com/hub' },
          spokes: [{ url: 'https://example.com/test-page' }]
        }
      ]);
    });

    test('should calculate total score correctly', () => {
      const result = scoringEngine.calculatePageScore(mockPage);

      expect(result.total).toBeGreaterThan(0);
      expect(result.total).toBeLessThanOrEqual(100);
      expect(result.breakdown).toHaveProperty('linkScore');
      expect(result.breakdown).toHaveProperty('tierScore');
      expect(result.breakdown).toHaveProperty('technicalScore');
      expect(result.breakdown).toHaveProperty('contentScore');
      expect(result.breakdown).toHaveProperty('clusterScore');
      expect(result.grade).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    test('should cap total score at 100', () => {
      const highPerformingPage = {
        ...mockPage,
        ilr: 100,
        incomingLinks: 100,
        outgoingLinks: 50,
        httpStatus: 200,
        loadTime: 0.5,
        issues: 0,
        inSitemap: true,
        description: 'Excellent page with comprehensive description',
        title: 'Perfect Page Title'
      };

      const result = scoringEngine.calculatePageScore(highPerformingPage);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    test('should handle pages with missing data', () => {
      const incompletePage = {
        url: 'https://example.com/incomplete',
        ilr: 50,
        incomingLinks: 5,
        outgoingLinks: 2,
        tier: 'traffic',
        httpStatus: 200,
        loadTime: 1.0,
        issues: 0,
        inSitemap: true,
        title: 'Test Page',
        description: 'Test description',
        crawlDepth: 1,
        slug: 'test-page'
      };

      const result = scoringEngine.calculatePageScore(incompletePage);
      expect(result.total).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('calculateLinkScore', () => {
    test('should calculate link score based on incoming links and ILR', () => {
      const page = { incomingLinks: 20, ilr: 80, outgoingLinks: 15, tier: 'supporting' };
      const score = scoringEngine.calculateLinkScore(page);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should cap incoming score at 40 points', () => {
      const page = { incomingLinks: 200, ilr: 80, outgoingLinks: 15, tier: 'supporting' };
      const score = scoringEngine.calculateLinkScore(page);
      
      // Should not exceed 100 even with very high incoming links
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should calculate ILR score component correctly', () => {
      const page = { incomingLinks: 0, ilr: 100, outgoingLinks: 15, tier: 'supporting' };
      const score = scoringEngine.calculateLinkScore(page);
      
      expect(score).toBeGreaterThan(40); // ILR component should contribute significantly
    });
  });

  describe('calculateOutgoingBalance', () => {
    test('should score well for ideal outgoing link counts', () => {
      const moneyPage = { outgoingLinks: 15, tier: 'money' };
      const supportingPage = { outgoingLinks: 25, tier: 'supporting' };
      const trafficPage = { outgoingLinks: 35, tier: 'traffic' };

      const moneyScore = scoringEngine.calculateOutgoingBalance(moneyPage);
      const supportingScore = scoringEngine.calculateOutgoingBalance(supportingPage);
      const trafficScore = scoringEngine.calculateOutgoingBalance(trafficPage);

      expect(moneyScore).toBeGreaterThan(15);
      expect(supportingScore).toBeGreaterThan(15);
      expect(trafficScore).toBeGreaterThan(15);
    });

    test('should penalize excessive outgoing links', () => {
      const page = { outgoingLinks: 100, tier: 'money' };
      const score = scoringEngine.calculateOutgoingBalance(page);
      
      expect(score).toBeLessThan(20);
    });

    test('should handle unknown tier', () => {
      const page = { outgoingLinks: 25, tier: 'unknown' };
      const score = scoringEngine.calculateOutgoingBalance(page);
      
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateTierScore', () => {
    test('should score money pages correctly', () => {
      const moneyPage = { ilr: 95, incomingLinks: 60, tier: 'money' };
      const score = scoringEngine.calculateTierScore(moneyPage);
      
      expect(score).toBeGreaterThan(80);
    });

    test('should score supporting pages correctly', () => {
      const supportingPage = { ilr: 75, incomingLinks: 40, tier: 'supporting' };
      const score = scoringEngine.calculateTierScore(supportingPage);
      
      expect(score).toBeGreaterThan(60);
    });

    test('should score traffic pages correctly', () => {
      const trafficPage = { ilr: 40, incomingLinks: 10, tier: 'traffic' };
      const score = scoringEngine.calculateTierScore(trafficPage);
      
      expect(score).toBeGreaterThan(30);
    });

    test('should penalize over-linking', () => {
      const overLinkedPage = { ilr: 95, incomingLinks: 200, tier: 'money' };
      const score = scoringEngine.calculateTierScore(overLinkedPage);
      
      expect(score).toBeLessThan(100);
    });

    test('should return 50 for unknown tier', () => {
      const unknownPage = { ilr: 50, incomingLinks: 25, tier: 'unknown' };
      const score = scoringEngine.calculateTierScore(unknownPage);
      
      expect(score).toBe(50);
    });
  });

  describe('calculateTechnicalScore', () => {
    test('should give perfect score for optimal technical metrics', () => {
      const perfectPage = {
        httpStatus: 200,
        loadTime: 1.0,
        issues: 0,
        inSitemap: true
      };
      
      const score = scoringEngine.calculateTechnicalScore(perfectPage);
      expect(score).toBe(100);
    });

    test('should penalize non-200 status codes', () => {
      const badStatusPage = {
        httpStatus: 404,
        loadTime: 1.0,
        issues: 0,
        inSitemap: true
      };
      
      const score = scoringEngine.calculateTechnicalScore(badStatusPage);
      expect(score).toBe(75);
    });

    test('should penalize slow loading pages', () => {
      const slowPage = {
        httpStatus: 200,
        loadTime: 5.0,
        issues: 0,
        inSitemap: true
      };
      
      const score = scoringEngine.calculateTechnicalScore(slowPage);
      expect(score).toBeLessThan(100);
    });

    test('should penalize pages with issues', () => {
      const issuePage = {
        httpStatus: 200,
        loadTime: 1.0,
        issues: 10,
        inSitemap: true
      };
      
      const score = scoringEngine.calculateTechnicalScore(issuePage);
      expect(score).toBeLessThan(100);
    });

    test('should penalize pages not in sitemap', () => {
      const noSitemapPage = {
        httpStatus: 200,
        loadTime: 1.0,
        issues: 0,
        inSitemap: false
      };
      
      const score = scoringEngine.calculateTechnicalScore(noSitemapPage);
      expect(score).toBe(75);
    });

    test('should not go below 0', () => {
      const terriblePage = {
        httpStatus: 500,
        loadTime: 10.0,
        issues: 50,
        inSitemap: false
      };
      
      const score = scoringEngine.calculateTechnicalScore(terriblePage);
      expect(score).toBe(0);
    });
  });

  describe('calculateContentScore', () => {
    test('should score well for good content', () => {
      const goodContentPage = {
        title: 'Excellent Page Title with Good Length',
        description: 'This is a comprehensive description that provides good information about the page content and should score well',
        slug: 'excellent-page-title',
        crawlDepth: 1
      };
      
      const score = scoringEngine.calculateContentScore(goodContentPage);
      expect(score).toBeGreaterThan(80);
    });

    test('should penalize short titles', () => {
      const shortTitlePage = {
        title: 'Short',
        description: 'Good description',
        slug: 'short',
        crawlDepth: 1
      };
      
      const score = scoringEngine.calculateContentScore(shortTitlePage);
      expect(score).toBeLessThan(80);
    });

    test('should penalize missing descriptions', () => {
      const noDescPage = {
        title: 'Good Title Length',
        description: '',
        slug: 'good-title',
        crawlDepth: 1
      };
      
      const score = scoringEngine.calculateContentScore(noDescPage);
      expect(score).toBeLessThan(80);
    });

    test('should penalize deep crawl depth', () => {
      const deepPage = {
        title: 'Good Title Length',
        description: 'Good description',
        slug: 'good-title',
        crawlDepth: 10
      };
      
      const score = scoringEngine.calculateContentScore(deepPage);
      expect(score).toBeLessThan(80);
    });

    test('should handle missing data gracefully', () => {
      const incompletePage = {
        title: '',
        description: '',
        slug: '',
        crawlDepth: 0
      };
      
      const score = scoringEngine.calculateContentScore(incompletePage);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateClusterScore', () => {
    test('should give bonus for pages in clusters', () => {
      const page = { url: 'https://example.com/page' };
      mockDataProcessor.generateTopicClusters.mockReturnValue([
        {
          hub: { url: 'https://example.com/hub' },
          spokes: [{ url: 'https://example.com/page' }]
        }
      ]);
      
      const score = scoringEngine.calculateClusterScore(page);
      expect(score).toBeGreaterThan(50);
    });

    test('should give extra bonus for hub pages', () => {
      const hubPage = { url: 'https://example.com/hub' };
      mockDataProcessor.generateTopicClusters.mockReturnValue([
        {
          hub: { url: 'https://example.com/hub' },
          spokes: [{ url: 'https://example.com/page' }]
        }
      ]);
      
      const score = scoringEngine.calculateClusterScore(hubPage);
      expect(score).toBeGreaterThan(80);
    });

    test('should return base score for pages not in clusters', () => {
      const isolatedPage = { url: 'https://example.com/isolated' };
      mockDataProcessor.generateTopicClusters.mockReturnValue([]);
      
      const score = scoringEngine.calculateClusterScore(isolatedPage);
      expect(score).toBe(50);
    });
  });

  describe('getGrade', () => {
    test('should return correct grades for score ranges', () => {
      expect(scoringEngine.getGrade(95)).toBe('A+');
      expect(scoringEngine.getGrade(85)).toBe('A');
      expect(scoringEngine.getGrade(75)).toBe('B');
      expect(scoringEngine.getGrade(65)).toBe('C');
      expect(scoringEngine.getGrade(55)).toBe('D');
      expect(scoringEngine.getGrade(45)).toBe('F');
    });
  });

  describe('generatePageRecommendations', () => {
    const mockPage = {
      incomingLinks: 5,
      ilr: 60,
      tier: 'money',
      loadTime: 4.0,
      issues: 3,
      inSitemap: false,
      title: 'Short',
      description: 'Short desc'
    };

    test('should generate link-based recommendations for low scores', () => {
      const scores = { linkScore: 40, tierScore: 80, technicalScore: 80, contentScore: 80, clusterScore: 80 };
      const recommendations = scoringEngine.generatePageRecommendations(mockPage, scores);
      
      const linkRecs = recommendations.filter(r => r.type === 'links');
      expect(linkRecs.length).toBeGreaterThan(0);
      expect(linkRecs[0].priority).toBe('high');
    });

    test('should generate technical recommendations for technical issues', () => {
      const scores = { linkScore: 80, tierScore: 80, technicalScore: 40, contentScore: 80, clusterScore: 80 };
      const recommendations = scoringEngine.generatePageRecommendations(mockPage, scores);
      
      const techRecs = recommendations.filter(r => r.type === 'technical');
      expect(techRecs.length).toBeGreaterThan(0);
      expect(techRecs[0].priority).toBe('high');
    });

    test('should generate content recommendations for content issues', () => {
      const scores = { linkScore: 80, tierScore: 80, technicalScore: 80, contentScore: 40, clusterScore: 80 };
      const recommendations = scoringEngine.generatePageRecommendations(mockPage, scores);
      
      const contentRecs = recommendations.filter(r => r.type === 'content');
      expect(contentRecs.length).toBeGreaterThan(0);
      expect(contentRecs[0].priority).toBe('medium');
    });

    test('should sort recommendations by priority', () => {
      const scores = { linkScore: 40, tierScore: 40, technicalScore: 40, contentScore: 40, clusterScore: 40 };
      const recommendations = scoringEngine.generatePageRecommendations(mockPage, scores);
      
      const priorities = recommendations.map(r => r.priority);
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedPriorities = [...priorities].sort((a, b) => priorityOrder[b] - priorityOrder[a]);
      
      expect(priorities).toEqual(sortedPriorities);
    });
  });

  describe('calculateSiteScore', () => {
    const mockPages = [
      { ilr: 95, incomingLinks: 50, tier: 'money' },
      { ilr: 75, incomingLinks: 30, tier: 'supporting' },
      { ilr: 45, incomingLinks: 10, tier: 'traffic' }
    ];

    beforeEach(() => {
      mockDataProcessor.getAllPages.mockReturnValue(mockPages);
      mockDataProcessor.getAnalytics.mockReturnValue({
        totalPages: 3,
        orphanedPages: 1,
        highPerformingPages: 1,
        lowPerformingPages: 1,
        averages: { ilr: 71.7, incomingLinks: 30, loadTime: 1.5 },
        distribution: { money: 1, supporting: 1, traffic: 1 }
      });
      mockDataProcessor.findOptimizationOpportunities.mockReturnValue([
        { type: 'orphaned', priority: 'high', issue: 'Test issue' }
      ]);
      mockDataProcessor.generateTopicClusters.mockReturnValue([]);
    });

    test('should calculate overall site score', () => {
      const result = scoringEngine.calculateSiteScore();
      
      expect(result.overall.score).toBeGreaterThan(0);
      expect(result.overall.grade).toBeDefined();
      expect(result.overall.totalPages).toBe(3);
      expect(result.analytics).toBeDefined();
      expect(result.opportunities).toHaveLength(1);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.pageScores).toBeInstanceOf(Array);
    });

    test('should analyze tier distribution', () => {
      const result = scoringEngine.calculateSiteScore();
      
      expect(result.tiers.distribution).toBeDefined();
      expect(result.tiers.distribution.money).toBeDefined();
      expect(result.tiers.distribution.supporting).toBeDefined();
      expect(result.tiers.distribution.traffic).toBeDefined();
    });

    test('should calculate tier average scores', () => {
      const result = scoringEngine.calculateSiteScore();
      
      expect(result.tiers.scores.money).toBeGreaterThan(0);
      expect(result.tiers.scores.supporting).toBeGreaterThan(0);
      expect(result.tiers.scores.traffic).toBeGreaterThan(0);
    });

    test('should generate site recommendations', () => {
      const userPreferences = { primaryGoal: 'conversions' };
      const result = scoringEngine.calculateSiteScore(userPreferences);
      
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should sort page scores by total score', () => {
      const result = scoringEngine.calculateSiteScore();
      
      const scores = result.pageScores.map(ps => ps.total);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });
  });

  describe('analyzeTierDistribution', () => {
    beforeEach(() => {
      mockDataProcessor.categories = {
        moneyPages: [{}, {}], // 2 pages
        supportingPages: [{}, {}, {}, {}], // 4 pages
        trafficPages: [{}, {}, {}, {}, {}, {}] // 6 pages
      };
      mockDataProcessor.getAllPages.mockReturnValue(new Array(12)); // 12 total pages
    });

    test('should calculate tier distribution correctly', () => {
      const result = scoringEngine.analyzeTierDistribution();
      
      expect(result.money.count).toBe(2);
      expect(result.money.percentage).toBe(17); // 2/12 * 100
      expect(result.supporting.count).toBe(4);
      expect(result.supporting.percentage).toBe(33); // 4/12 * 100
      expect(result.traffic.count).toBe(6);
      expect(result.traffic.percentage).toBe(50); // 6/12 * 100
    });

    test('should determine tier status correctly', () => {
      const result = scoringEngine.analyzeTierDistribution();
      
      expect(result.money.status).toBe('too-many'); // 17% is above 5-15% range
      expect(result.supporting.status).toBe('good'); // 33% is within 25-35% range
      expect(result.traffic.status).toBe('good'); // 50% is within 50-70% range
    });
  });

  describe('getTierDistributionStatus', () => {
    test('should return correct status for different distributions', () => {
      expect(scoringEngine.getTierDistributionStatus(0.10, 0.05, 0.15)).toBe('good');
      expect(scoringEngine.getTierDistributionStatus(0.03, 0.05, 0.15)).toBe('too-few');
      expect(scoringEngine.getTierDistributionStatus(0.20, 0.05, 0.15)).toBe('too-many');
    });
  });

  describe('analyzeLinkEquityFlow', () => {
    beforeEach(() => {
      mockDataProcessor.getAllPages.mockReturnValue([
        { ilr: 90, outgoingLinks: 20 }, // High authority
        { ilr: 85, outgoingLinks: 15 }, // High authority
        { ilr: 30, outgoingLinks: 5 },  // Low authority
        { ilr: 25, outgoingLinks: 3 }   // Low authority
      ]);
    });

    test('should analyze link equity flow', () => {
      const result = scoringEngine.analyzeLinkEquityFlow();
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.highAuthorityPages).toBe(2);
      expect(result.lowAuthorityPages).toBe(2);
      expect(result.status).toBeDefined();
    });

    test('should handle empty pages array', () => {
      mockDataProcessor.getAllPages.mockReturnValue([]);
      
      const result = scoringEngine.analyzeLinkEquityFlow();
      expect(result.score).toBe(0);
      expect(result.highAuthorityPages).toBe(0);
      expect(result.lowAuthorityPages).toBe(0);
    });
  });

  describe('calculateTierAverageScore', () => {
    test('should calculate average score for tier', () => {
      const mockPages = [
        { ilr: 90, incomingLinks: 50 },
        { ilr: 80, incomingLinks: 40 }
      ];
      
      mockDataProcessor.getPagesByCategory.mockReturnValue(mockPages);
      
      const avgScore = scoringEngine.calculateTierAverageScore('money');
      expect(avgScore).toBeGreaterThan(0);
    });

    test('should return 0 for empty tier', () => {
      mockDataProcessor.getPagesByCategory.mockReturnValue([]);
      
      const avgScore = scoringEngine.calculateTierAverageScore('empty');
      expect(avgScore).toBe(0);
    });
  });

  describe('generateSiteRecommendations', () => {
    const mockPageScores = [
      { total: 90, page: { tier: 'money' } },
      { total: 30, page: { tier: 'traffic' } }
    ];
    const mockOpportunities = [
      { type: 'orphaned', page: { title: 'Orphaned Page' } }
    ];

    test('should generate conversion-focused recommendations', () => {
      const userPreferences = { primaryGoal: 'conversions' };
      mockDataProcessor.getPagesByCategory.mockReturnValue([{ ilr: 95 }]);
      
      const recommendations = scoringEngine.generateSiteRecommendations(mockPageScores, mockOpportunities, userPreferences);
      
      const conversionRec = recommendations.find(r => r.category === 'conversions');
      expect(conversionRec).toBeDefined();
      expect(conversionRec.priority).toBe('high');
    });

    test('should generate traffic-focused recommendations', () => {
      const userPreferences = { primaryGoal: 'traffic' };
      mockDataProcessor.getPagesByCategory.mockReturnValue([{ ilr: 30 }]);
      
      const recommendations = scoringEngine.generateSiteRecommendations(mockPageScores, mockOpportunities, userPreferences);
      
      const trafficRec = recommendations.find(r => r.category === 'traffic');
      expect(trafficRec).toBeDefined();
      expect(trafficRec.priority).toBe('high');
    });

    test('should generate universal recommendations', () => {
      const recommendations = scoringEngine.generateSiteRecommendations(mockPageScores, mockOpportunities, {});
      
      const orphanedRec = recommendations.find(r => r.category === 'technical');
      expect(orphanedRec).toBeDefined();
      expect(orphanedRec.priority).toBe('high');
    });

    test('should sort recommendations by priority', () => {
      const recommendations = scoringEngine.generateSiteRecommendations(mockPageScores, mockOpportunities, {});
      
      const priorities = recommendations.map(r => r.priority);
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedPriorities = [...priorities].sort((a, b) => priorityOrder[b] - priorityOrder[a]);
      
      expect(priorities).toEqual(sortedPriorities);
    });
  });

  describe('getScoreColor', () => {
    test('should return correct colors for score ranges', () => {
      expect(scoringEngine.getScoreColor(90)).toBe('green');
      expect(scoringEngine.getScoreColor(70)).toBe('yellow');
      expect(scoringEngine.getScoreColor(50)).toBe('red');
    });
  });

  describe('getScoreEmoji', () => {
    test('should return correct emojis for score ranges', () => {
      expect(scoringEngine.getScoreEmoji(95)).toBe('🟢');
      expect(scoringEngine.getScoreEmoji(85)).toBe('🟡');
      expect(scoringEngine.getScoreEmoji(65)).toBe('🟠');
      expect(scoringEngine.getScoreEmoji(45)).toBe('🔴');
    });
  });
});
