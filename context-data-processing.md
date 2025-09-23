# Data Processing & Analysis Context

## Overview
The data processing layer handles CSV parsing, page categorization, and analytics generation for the internal linking optimization system.

## Core Module: DataProcessor (`src/dataProcessor.js` - 291 lines)

### Key Responsibilities
- Parse CSV files with website page data
- Categorize pages into 3-tier framework
- Generate site analytics and metrics
- Identify optimization opportunities
- Create topic cluster recommendations

### CSV Data Schema
```javascript
// Expected CSV columns
{
  'Page URL': 'https://example.com/page',
  'Page Title': 'Page Title Text',
  'ILR': 85.5,                           // Internal Link Ratio (0-100)
  'Incoming Internal Links': 42,          // Number of internal links TO this page
  'Outgoing Internal Links': 25,          // Number of internal links FROM this page
  'Crawl Depth': 2,                       // Site hierarchy depth
  'HTTP Status Code': 200,                // Response status
  'Page (HTML) Load Time, sec': 1.5,      // Performance metric
  'Issues': 3,                            // Technical issue count
  'In sitemap': 1,                        // Boolean (1/0)
  'Description': 'Meta description...'     // Page description
}
```

### Page Object Structure
```javascript
// Processed page object
page = {
  // Raw CSV data
  url: 'https://naecleaningsolutions.com/bank-cleaning-services-austin/',
  title: 'Expert Financial Institutions & Bank Cleaning Services in Austin, TX',
  ilr: 100,
  incomingLinks: 64,
  outgoingLinks: 41,
  crawlDepth: 1,
  httpStatus: 200,
  loadTime: 2.252,
  issues: 20,
  inSitemap: true,
  description: 'call 512-761-8623 for top-rated bank cleaning...',
  
  // Computed fields
  slug: 'bank-cleaning-services-austin',
  pageType: 'service',        // service|supporting|blog|other
  tier: 'money'              // money|supporting|traffic
}
```

### Page Classification Logic

#### Page Type Detection
```javascript
determinePageType(url, title) {
  const urlLower = url.toLowerCase();
  
  // Service pages (Money Pages)
  const serviceKeywords = [
    'cleaning-services', 'bank-cleaning', 'medical-facility', 
    'office-building', 'school-cleaning', 'church-cleaning', 
    'auto-dealership', 'warehouse-cleaning'
  ];
  
  // Supporting pages
  const supportingKeywords = [
    'about', 'contact', 'day-porter', 'carpet-cleaning', 'floor-cleaning'
  ];
  
  // Blog/content pages
  if (urlLower.includes('/blog/') || title.toLowerCase().includes('tips')) {
    return 'blog';
  }
  
  return 'other';
}
```

#### Tier Assignment
```javascript
categorizePages() {
  this.pages.forEach(page => {
    if (page.pageType === 'service' && page.ilr >= 95) {
      page.tier = 'money';
    } else if (page.pageType === 'supporting' || (page.ilr >= 70 && page.ilr < 95)) {
      page.tier = 'supporting';
    } else {
      page.tier = 'traffic';
    }
  });
}
```

### Analytics Generation

#### Key Metrics Calculated
```javascript
getAnalytics() {
  return {
    totalPages: 55,
    orphanedPages: 17,              // Pages with ≤2 internal links
    highPerformingPages: 12,        // ILR ≥ 90
    lowPerformingPages: 8,          // ILR < 50
    averages: {
      ilr: 65.2,
      incomingLinks: 28.4,
      loadTime: 1.8
    },
    distribution: {
      money: 7,                     // 13% of pages
      supporting: 23,               // 42% of pages  
      traffic: 25                   // 45% of pages
    }
  };
}
```

### Optimization Opportunity Detection

#### Orphaned Page Detection
```javascript
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
```

#### Link Distribution Analysis
```javascript
const highLinks = this.pages.filter(page => page.incomingLinks > 50);
const lowLinks = this.pages.filter(page => 
  page.incomingLinks < 10 && page.tier !== 'traffic'
);

if (highLinks.length > 0 && lowLinks.length > 0) {
  opportunities.push({
    type: 'distribution',
    priority: 'medium',
    issue: 'Uneven link distribution across tiers',
    recommendation: 'Redistribute some links from over-linked pages to under-linked pages'
  });
}
```

### Topic Cluster Generation

#### Cluster Types
1. **Commercial Cleaning Services** - Office, bank, medical, school pages
2. **Specialized Solutions** - Auto dealership, warehouse, church pages  
3. **Supporting Services** - Day porter, carpet, floor cleaning pages
4. **Content/Education** - Blog posts and tip pages

```javascript
generateTopicClusters() {
  const clusters = [];
  
  // Commercial cluster example
  const commercialPages = this.pages.filter(page => 
    page.pageType === 'service' && 
    ['office-building', 'bank-cleaning', 'medical-facility'].some(keyword => 
      page.slug.includes(keyword)
    )
  );
  
  clusters.push({
    name: 'Commercial Cleaning Services',
    hub: commercialPages.find(p => p.slug.includes('office-building')),
    spokes: commercialPages.filter(p => !p.slug.includes('office-building')),
    type: 'service-cluster'
  });
  
  return clusters;
}
```

### Sample Data Insights (NAE Cleaning Solutions)
- **Total Pages**: 55 analyzed
- **Money Pages**: 7 (bank, church, medical, office, school, auto, warehouse cleaning)
- **Supporting Pages**: 23 (about, contact, day porter, carpet/floor cleaning)
- **Traffic Pages**: 25 (blog posts, tips, guides)
- **Orphaned Pages**: 17 pages with ≤2 internal links
- **Performance Range**: ILR scores from 12 (blog posts) to 100 (service pages)

### Performance Characteristics
- **Parsing Speed**: ~2 seconds for 55 pages
- **Memory Usage**: Efficient streaming with csv-parser
- **Data Validation**: Handles missing fields gracefully
- **Error Recovery**: Continues processing on malformed rows
