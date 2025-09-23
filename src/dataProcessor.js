const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');
const _ = require('lodash');

class DataProcessor {
  constructor() {
    this.pages = [];
    this.categories = {
      moneyPages: [],
      supportingPages: [],
      trafficPages: []
    };
  }

  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Clean and process the data
          const page = {
            url: data['Page URL'],
            title: data['Page Title'],
            ilr: parseFloat(data['ILR']) || 0,
            rawILR: parseFloat(data['Raw ILR']) || 0,
            incomingLinks: parseInt(data['Incoming Internal Links']) || 0,
            outgoingLinks: parseInt(data['Outgoing Internal Links']) || 0,
            crawlDepth: parseInt(data['Crawl Depth']) || 0,
            httpStatus: parseInt(data['HTTP Status Code']) || 0,
            loadTime: parseFloat(data['Page (HTML) Load Time, sec']) || 0,
            inSitemap: data['In sitemap'] === '1',
            issues: parseInt(data['Issues']) || 0,
            description: data['Description'] || '',
            // Additional computed fields
            slug: this.extractSlug(data['Page URL']),
            pageType: this.determinePageType(data['Page URL'], data['Page Title']),
            tier: null // Will be set during categorization
          };
          
          results.push(page);
        })
        .on('end', () => {
          this.pages = results;
          this.categorizePages();
          resolve(this.pages);
        })
        .on('error', reject);
    });
  }

  extractSlug(url) {
    if (!url) return '';
    const matches = url.match(/\/([^\/]+)\/?$/);
    return matches ? matches[1] : '';
  }

  determinePageType(url, title) {
    if (!url || !title) return 'other';
    
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // Service pages (Money Pages)
    const serviceKeywords = [
      'cleaning-services', 'bank-cleaning', 'medical-facility', 'office-building',
      'school-cleaning', 'church-cleaning', 'auto-dealership', 'warehouse-cleaning'
    ];
    
    if (serviceKeywords.some(keyword => urlLower.includes(keyword))) {
      return 'service';
    }
    
    // Supporting pages
    const supportingKeywords = ['about', 'contact', 'day-porter', 'carpet-cleaning', 'floor-cleaning'];
    if (supportingKeywords.some(keyword => urlLower.includes(keyword))) {
      return 'supporting';
    }
    
    // Blog/content pages
    if (urlLower.includes('/blog/') || urlLower.includes('/recent-blog/') || 
        titleLower.includes('tips') || titleLower.includes('guide')) {
      return 'blog';
    }
    
    return 'other';
  }

  categorizePages() {
    this.pages.forEach(page => {
      // Categorize based on ILR scores and page types
      if (page.pageType === 'service' && page.ilr >= 95) {
        page.tier = 'money';
        this.categories.moneyPages.push(page);
      } else if (page.pageType === 'supporting' || (page.ilr >= 70 && page.ilr < 95)) {
        page.tier = 'supporting';
        this.categories.supportingPages.push(page);
      } else {
        page.tier = 'traffic';
        this.categories.trafficPages.push(page);
      }
    });

    // Sort each category by ILR score (descending)
    Object.keys(this.categories).forEach(key => {
      this.categories[key].sort((a, b) => b.ilr - a.ilr);
    });
  }

  getAnalytics() {
    const totalPages = this.pages.length;
    const orphanedPages = this.pages.filter(page => page.incomingLinks <= 2);
    const highPerformingPages = this.pages.filter(page => page.ilr >= 90);
    const lowPerformingPages = this.pages.filter(page => page.ilr < 50);
    
    const avgILR = _.meanBy(this.pages, 'ilr');
    const avgIncomingLinks = _.meanBy(this.pages, 'incomingLinks');
    const avgLoadTime = _.meanBy(this.pages, 'loadTime');
    
    return {
      totalPages,
      orphanedPages: orphanedPages.length,
      highPerformingPages: highPerformingPages.length,
      lowPerformingPages: lowPerformingPages.length,
      averages: {
        ilr: Math.round(avgILR * 100) / 100,
        incomingLinks: Math.round(avgIncomingLinks * 100) / 100,
        loadTime: Math.round(avgLoadTime * 100) / 100
      },
      distribution: {
        money: this.categories.moneyPages.length,
        supporting: this.categories.supportingPages.length,
        traffic: this.categories.trafficPages.length
      },
      orphanedPagesList: orphanedPages,
      topPerformers: highPerformingPages.slice(0, 10),
      underPerformers: lowPerformingPages.slice(0, 10)
    };
  }

  findOptimizationOpportunities() {
    const opportunities = [];
    
    // Find orphaned pages
    const orphaned = this.pages.filter(page => page.incomingLinks <= 2);
    orphaned.forEach(page => {
      opportunities.push({
        type: 'orphaned',
        priority: 'high',
        page: page,
        issue: 'Page has very few internal links',
        recommendation: `Add 5-10 internal links from related pages to ${page.title}`,
        impact: 'High - Will significantly improve page authority'
      });
    });
    
    // Find pages with low ILR but high potential
    const lowILR = this.pages.filter(page => 
      page.ilr < 70 && page.pageType === 'service'
    );
    lowILR.forEach(page => {
      opportunities.push({
        type: 'low-ilr',
        priority: 'medium',
        page: page,
        issue: 'Service page with low internal link ratio',
        recommendation: `Increase internal links to ${page.title} from blog posts and supporting pages`,
        impact: 'Medium - Will improve service page authority'
      });
    });
    
    // Find imbalanced link distribution
    const highLinks = this.pages.filter(page => page.incomingLinks > 50);
    const lowLinks = this.pages.filter(page => page.incomingLinks < 10 && page.tier !== 'traffic');
    
    if (highLinks.length > 0 && lowLinks.length > 0) {
      opportunities.push({
        type: 'distribution',
        priority: 'medium',
        issue: 'Uneven link distribution across tiers',
        recommendation: 'Redistribute some links from over-linked pages to under-linked pages',
        impact: 'Medium - Will improve overall site architecture',
        details: {
          overLinked: highLinks.length,
          underLinked: lowLinks.length
        }
      });
    }
    
    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  generateTopicClusters() {
    const clusters = [];
    
    // Commercial Cleaning Services Cluster
    const commercialPages = this.pages.filter(page => 
      page.pageType === 'service' && 
      ['office-building', 'bank-cleaning', 'medical-facility', 'school-cleaning'].some(keyword => 
        page.slug.includes(keyword)
      )
    );
    
    if (commercialPages.length > 0) {
      clusters.push({
        name: 'Commercial Cleaning Services',
        hub: commercialPages.find(p => p.slug.includes('office-building')) || commercialPages[0],
        spokes: commercialPages.filter(p => !p.slug.includes('office-building')),
        type: 'service-cluster'
      });
    }
    
    // Specialized Services Cluster
    const specializedPages = this.pages.filter(page => 
      page.pageType === 'service' && 
      ['auto-dealership', 'warehouse', 'church'].some(keyword => 
        page.slug.includes(keyword)
      )
    );
    
    if (specializedPages.length > 0) {
      clusters.push({
        name: 'Specialized Cleaning Solutions',
        hub: specializedPages[0], // Use highest ILR as hub
        spokes: specializedPages.slice(1),
        type: 'service-cluster'
      });
    }
    
    // Supporting Services Cluster
    const supportingPages = this.categories.supportingPages.filter(page => 
      ['day-porter', 'carpet-cleaning', 'floor-cleaning'].some(keyword => 
        page.slug.includes(keyword)
      )
    );
    
    if (supportingPages.length > 0) {
      clusters.push({
        name: 'Supporting Services & Solutions',
        hub: supportingPages[0],
        spokes: supportingPages.slice(1),
        type: 'supporting-cluster'
      });
    }
    
    // Blog/Content Cluster
    const blogPages = this.categories.trafficPages.filter(page => 
      page.pageType === 'blog' && page.ilr > 30
    );
    
    if (blogPages.length > 0) {
      clusters.push({
        name: 'Cleaning Tips & Education',
        hub: blogPages[0], // Highest ILR blog post
        spokes: blogPages.slice(1, 6), // Top 5 related posts
        type: 'content-cluster'
      });
    }
    
    return clusters;
  }

  getPagesByCategory(category) {
    return this.categories[category] || [];
  }

  getAllPages() {
    return this.pages;
  }

  getPageByUrl(url) {
    return this.pages.find(page => page.url === url);
  }

  searchPages(query) {
    const queryLower = query.toLowerCase();
    return this.pages.filter(page => 
      page.title.toLowerCase().includes(queryLower) ||
      page.url.toLowerCase().includes(queryLower) ||
      page.description.toLowerCase().includes(queryLower)
    );
  }
}

module.exports = DataProcessor;
