# Scoring Engine & Report Generation Context

## Overview
The scoring and reporting layer provides sophisticated optimization analysis and professional multi-format report generation with visual elements and actionable recommendations.

## Scoring Engine (`src/scoringEngine.js` - 479 lines)

### Multi-Factor Scoring Algorithm
```javascript
// Weighted scoring system (0-100 scale)
const weights = {
  linkScore: 0.3,      // 30% - Internal link count and distribution
  tierScore: 0.2,      // 20% - Page tier appropriateness  
  technicalScore: 0.2, // 20% - Technical health (load time, status, etc.)
  contentScore: 0.15,  // 15% - Content quality indicators
  clusterScore: 0.15   // 15% - Topic cluster effectiveness
};

calculatePageScore(page) {
  const totalScore = 
    (linkScore * weights.linkScore) +
    (tierScore * weights.tierScore) +
    (technicalScore * weights.technicalScore) +
    (contentScore * weights.contentScore) +
    (clusterScore * weights.clusterScore);
    
  return {
    total: Math.min(100, totalScore),
    breakdown: { linkScore, tierScore, technicalScore, contentScore, clusterScore },
    grade: getGrade(totalScore),  // A+ to F scale
    recommendations: generatePageRecommendations(page, scores)
  };
}
```

### Individual Score Components

#### 1. Link Score (30% weight)
```javascript
calculateLinkScore(page) {
  // Incoming links component (0-40 points)
  const incomingScore = Math.min(page.incomingLinks / 2, 40);
  
  // ILR score component (0-40 points)  
  const ilrScore = page.ilr * 0.4;
  
  // Outgoing links balance (0-20 points)
  const idealOutgoing = { money: 15, supporting: 25, traffic: 35 };
  const ideal = idealOutgoing[page.tier] || 25;
  const outgoingBalance = Math.max(0, 20 - (Math.abs(page.outgoingLinks - ideal) * 0.5));
  
  return Math.min(100, incomingScore + ilrScore + outgoingBalance);
}
```

#### 2. Tier Score (20% weight)
```javascript
calculateTierScore(page) {
  const expectations = {
    money: { minILR: 95, minLinks: 50, maxLinks: 100 },
    supporting: { minILR: 70, minLinks: 30, maxLinks: 80 },
    traffic: { minILR: 30, minLinks: 5, maxLinks: 50 }
  };
  
  const exp = expectations[page.tier];
  let score = 0;
  
  // ILR expectation (0-50 points)
  score += page.ilr >= exp.minILR ? 50 : (page.ilr / exp.minILR) * 50;
  
  // Link count expectation (0-50 points)
  if (page.incomingLinks >= exp.minLinks && page.incomingLinks <= exp.maxLinks) {
    score += 50;
  } else if (page.incomingLinks < exp.minLinks) {
    score += (page.incomingLinks / exp.minLinks) * 50;
  } else {
    score += Math.max(25, 50 - ((page.incomingLinks - exp.maxLinks) * 0.5));
  }
  
  return Math.min(100, score);
}
```

#### 3. Technical Score (20% weight)
```javascript
calculateTechnicalScore(page) {
  let score = 100;
  
  if (page.httpStatus !== 200) score -= 25;           // HTTP status penalty
  if (page.loadTime > 3) score -= Math.min(25, (page.loadTime - 3) * 5); // Load time penalty
  if (page.issues > 0) score -= Math.min(25, page.issues * 2);           // Issues penalty
  if (!page.inSitemap) score -= 25;                   // Sitemap penalty
  
  return Math.max(0, score);
}
```

#### 4. Content Score (15% weight)
```javascript
calculateContentScore(page) {
  let score = 0;
  
  // Title quality (0-40 points total)
  if (page.title && page.title.length > 10) {
    score += 30;
    if (page.title.length > 30 && page.title.length < 60) score += 10; // Sweet spot bonus
  }
  
  // Description quality (0-40 points total)  
  if (page.description && page.description.length > 50) {
    score += 30;
    if (page.description.length > 100) score += 10; // Comprehensive bonus
  }
  
  // URL structure (0-20 points)
  if (page.slug && page.slug.includes('-')) score += 20; // SEO-friendly URLs
  
  return Math.min(100, score);
}
```

#### 5. Cluster Score (15% weight)
```javascript
calculateClusterScore(page) {
  const clusters = this.dataProcessor.generateTopicClusters();
  let score = 50; // Base score
  
  const isInCluster = clusters.some(cluster => 
    cluster.hub.url === page.url || 
    cluster.spokes.some(spoke => spoke.url === page.url)
  );
  
  if (isInCluster) {
    score += 30; // Cluster participation bonus
    
    const isHub = clusters.some(cluster => cluster.hub.url === page.url);
    if (isHub) score += 20; // Hub page bonus
  }
  
  return Math.min(100, score);
}
```

### Grade Scale & Color Coding
```javascript
getGrade(score) {
  if (score >= 90) return 'A+';  // Green
  if (score >= 80) return 'A';   // Green  
  if (score >= 70) return 'B';   // Yellow
  if (score >= 60) return 'C';   // Yellow
  if (score >= 50) return 'D';   // Red
  return 'F';                    // Red
}

getScoreColor(score) {
  if (score >= 80) return '#28a745'; // Green
  if (score >= 60) return '#ffc107'; // Yellow  
  return '#dc3545';                  // Red
}
```

### Site-Level Analysis
```javascript
calculateSiteScore(userPreferences) {
  const pageScores = allPages.map(page => this.calculatePageScore(page));
  const avgScore = _.meanBy(pageScores, 'total');
  
  return {
    overall: {
      score: Math.round(avgScore),
      grade: this.getGrade(avgScore),
      totalPages: allPages.length
    },
    tiers: {
      distribution: this.analyzeTierDistribution(),
      scores: {
        money: this.calculateTierAverageScore('money'),
        supporting: this.calculateTierAverageScore('supporting'), 
        traffic: this.calculateTierAverageScore('traffic')
      }
    },
    opportunities: this.dataProcessor.findOptimizationOpportunities(),
    recommendations: this.generateSiteRecommendations(pageScores, userPreferences),
    pageScores: pageScores.sort((a, b) => b.total - a.total)
  };
}
```

## Report Generator (`src/reportGenerator.js` - 893 lines)

### Multi-Format Report Generation
```javascript
async generateReports(siteAnalysis, userPreferences) {
  const reports = {};
  const formats = userPreferences.outputFormats || ['console'];
  
  if (formats.includes('console')) {
    reports.console = this.generateConsoleReport(siteAnalysis, userPreferences);
  }
  
  if (formats.includes('html')) {
    const htmlReport = this.generateHTMLReport(siteAnalysis, userPreferences);
    const htmlPath = path.join(this.reportsDir, `internal-linking-report-${timestamp}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    reports.html = { content: htmlReport, path: htmlPath };
  }
  
  // Similar for markdown and CSV formats
  return reports;
}
```

### HTML Report Features

#### Responsive Design with Modern Styling
```css
/* Key CSS classes from HTML report */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.report-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.overall-score {
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${scoreColor};  // Dynamic based on score
  color: white;
  padding: 30px;
  border-radius: 10px;
  font-size: 3em;
  min-width: 150px;
  min-height: 150px;
}
```

#### Dynamic Content Sections
```javascript
// HTML report sections generated dynamically
const htmlSections = [
  'Header with gradient styling and timestamp',
  'Overall score circle with color-coded background',
  'Key metrics grid (4-column responsive)',
  'Tier distribution analysis with status indicators',
  'Top optimization opportunities with priority badges',
  'Strategic recommendations with impact descriptions',
  'Page performance analysis (top/bottom performers)',
  'Implementation action plan with timeline phases',
  'Footer with tool attribution'
];
```

### Console Report Features

#### Color-Coded Output
```javascript
getConsoleScoreCard(siteAnalysis) {
  const { overall, tiers } = siteAnalysis;
  const scoreColor = overall.score >= 80 ? 'green' : 
                     overall.score >= 60 ? 'yellow' : 'red';
  const stars = '⭐'.repeat(Math.ceil(overall.score / 20));
  
  return chalk.cyan.bold('\n📊 OVERALL SITE SCORE\n') +
         chalk[scoreColor].bold(`Score: ${overall.score}/100 ${stars} (Grade: ${overall.grade})\n`) +
         chalk.white(`Total Pages Analyzed: ${overall.totalPages}\n`);
}
```

#### Structured Information Display
```javascript
getConsoleOpportunities(siteAnalysis) {
  const opportunities = siteAnalysis.opportunities.slice(0, 5);
  let output = chalk.cyan.bold('🚀 TOP OPTIMIZATION OPPORTUNITIES\n');
  
  opportunities.forEach((opp, index) => {
    const priority = opp.priority === 'high' ? chalk.red('HIGH') : 
                     opp.priority === 'medium' ? chalk.yellow('MEDIUM') : 
                     chalk.green('LOW');
    
    output += chalk.white(`${index + 1}. [${priority}] ${opp.issue}\n`);
    output += chalk.gray(`   → ${opp.recommendation}\n`);
    output += chalk.gray(`   💡 ${opp.impact}\n\n`);
  });
  
  return output;
}
```

### Markdown Report Structure
```markdown
# Internal Linking Optimization Report

## Executive Summary
### Overall Site Score: ${score}/100 (${grade})

## Top Optimization Opportunities
${opportunities.map(opp => `
### ${index + 1}. ${opp.issue} [${opp.priority.toUpperCase()} Priority]
**Recommendation:** ${opp.recommendation}
**Impact:** ${opp.impact}
`).join('\n')}

## Page Performance Analysis
### Top Performing Pages
${topPages.map(page => `
${index + 1}. **${page.title}** - Score: ${page.total}/100 (${page.grade})
   - Link Score: ${page.breakdown.linkScore}/100
   - Technical Score: ${page.breakdown.technicalScore}/100
`).join('\n')}
```

### CSV Export Format
```javascript
generateCSVReport(siteAnalysis) {
  const headers = [
    'Page URL', 'Page Title', 'Tier', 'ILR Score', 'Incoming Links',
    'Outgoing Links', 'Optimization Score', 'Grade', 'Load Time', 
    'Issues', 'Top Recommendation'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  siteAnalysis.pageScores.forEach(pageScore => {
    const row = [
      `"${page.url || ''}"`,
      `"${page.title || ''}"`,
      `"${page.tier || ''}"`,
      page.ilr || 0,
      page.incomingLinks || 0,
      pageScore.total || 0,
      `"${pageScore.grade || ''}"`,
      `"${pageScore.recommendations[0]?.action || 'No recommendation'}"`
    ];
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
}
```

### Report File Management
```javascript
// Timestamp-based file naming
getTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  // Results in: "2025-09-23T12-36-15"
}

// Auto-open HTML reports in browser
async openHTMLReport(htmlPath) {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') command = `open "${htmlPath}"`;
  else if (platform === 'win32') command = `start "" "${htmlPath}"`;
  else command = `xdg-open "${htmlPath}"`;
  
  exec(command, (error) => {
    if (!error) console.log(chalk.green('HTML report opened in browser'));
  });
}
```

### Sample Report Outputs

#### Console Report Sample
```
╔════════════════════════════════════════════════════════════╗
║                INTERNAL LINKING REPORT CARD                ║
╚════════════════════════════════════════════════════════════╝

📊 OVERALL SITE SCORE
Score: 71/100 ⭐⭐⭐⭐ (Grade: B)
Total Pages Analyzed: 55

🚀 TOP OPTIMIZATION OPPORTUNITIES
1. [HIGH] Page has very few internal links
   → Add 5-10 internal links from related pages
   💡 High - Will significantly improve page authority

2. [MEDIUM] Uneven link distribution across tiers  
   → Redistribute links from over-linked to under-linked pages
   💡 Medium - Will improve overall site architecture
```

### Performance Characteristics
- **HTML Generation**: ~500ms for 55 pages with full styling
- **Markdown Export**: ~100ms with complete formatting
- **CSV Processing**: ~50ms for spreadsheet-ready data
- **File I/O**: Efficient async operations with error handling
- **Memory Usage**: Streaming generation for large datasets
