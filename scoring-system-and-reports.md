# Scoring System and Report Cards for Internal Linking Optimization

## Overview
This document defines the scoring algorithms, report card templates, and analysis frameworks for the internal linking optimization system.

---

## 1. Scoring Algorithm Framework

### 1.1 Overall Site Score (0-100)
```javascript
const calculateOverallSiteScore = (pages) => {
  const linkDistributionScore = calculateLinkDistributionScore(pages); // 0-25 points
  const orphanedContentScore = calculateOrphanedContentScore(pages); // 0-20 points
  const authorityFlowScore = calculateAuthorityFlowScore(pages); // 0-20 points
  const technicalHealthScore = calculateTechnicalHealthScore(pages); // 0-15 points
  const contentClusterScore = calculateContentClusterScore(pages); // 0-20 points
  
  return Math.round(linkDistributionScore + orphanedContentScore + authorityFlowScore + technicalHealthScore + contentClusterScore);
};
```

### 1.2 Individual Page Score (0-100)
```javascript
const calculatePageScore = (page, siteContext) => {
  const linkScore = Math.min(page.incomingLinks / 10, 10) * 3; // 0-30 points
  const tierScore = getTierScore(page.tier) * 2; // 0-20 points
  const technicalScore = getTechnicalScore(page) * 2; // 0-20 points
  const contentScore = getContentScore(page) * 1.5; // 0-15 points
  const clusterScore = getClusterScore(page, siteContext) * 1.5; // 0-15 points
  
  return Math.round(linkScore + tierScore + technicalScore + contentScore + clusterScore);
};
```

### 1.3 Tier Classification Scoring
```javascript
const getTierScore = (tier) => {
  switch(tier) {
    case 'money': return 10; // Highest priority
    case 'supporting': return 7; // Medium priority
    case 'traffic': return 5; // Lower priority
    default: return 3;
  }
};
```

### 1.4 Technical Health Scoring
```javascript
const getTechnicalScore = (page) => {
  let score = 0;
  
  // HTTP Status Code (0-5 points)
  if (page.httpStatus === 200) score += 5;
  else if (page.httpStatus >= 300 && page.httpStatus < 400) score += 3;
  else if (page.httpStatus >= 400) score += 0;
  
  // Page Load Time (0-5 points)
  if (page.loadTime < 1.5) score += 5;
  else if (page.loadTime < 3.0) score += 3;
  else if (page.loadTime < 5.0) score += 1;
  
  // Schema.org Implementation (0-5 points)
  if (page.schemaOrg === 1) score += 5;
  else if (page.schemaOrg === 0) score += 0;
  
  // Canonicalization (0-5 points)
  if (page.canonicalization === 'Self-canonical') score += 5;
  else if (page.canonicalization === 'Canonical to other page') score += 2;
  else score += 0;
  
  return score;
};
```

### 1.5 Content Quality Scoring
```javascript
const getContentScore = (page) => {
  let score = 0;
  
  // Page Title Quality (0-5 points)
  if (page.title && page.title.length > 30 && page.title.length < 60) score += 5;
  else if (page.title && page.title.length > 0) score += 3;
  
  // Description Quality (0-5 points)
  if (page.description && page.description.length > 120 && page.description.length < 160) score += 5;
  else if (page.description && page.description.length > 0) score += 3;
  
  // Meta Tags Implementation (0-5 points)
  let metaScore = 0;
  if (page.openGraph === 1) metaScore += 1;
  if (page.twitterCards === 1) metaScore += 1;
  if (page.microformats === 1) metaScore += 1;
  if (page.ampLink === 1) metaScore += 1;
  if (page.hreflangLinks > 0) metaScore += 1;
  score += metaScore;
  
  return score;
};
```

---

## 2. Link Distribution Analysis

### 2.1 Link Distribution Score (0-25 points)
```javascript
const calculateLinkDistributionScore = (pages) => {
  const tiers = categorizePagesByTier(pages);
  const totalLinks = pages.reduce((sum, page) => sum + page.incomingLinks, 0);
  
  // Ideal distribution: Money 5-10%, Supporting 30-40%, Traffic 50-60%
  const moneyLinks = tiers.money.reduce((sum, page) => sum + page.incomingLinks, 0);
  const supportingLinks = tiers.supporting.reduce((sum, page) => sum + page.incomingLinks, 0);
  const trafficLinks = tiers.traffic.reduce((sum, page) => sum + page.incomingLinks, 0);
  
  const moneyPercentage = (moneyLinks / totalLinks) * 100;
  const supportingPercentage = (supportingLinks / totalLinks) * 100;
  const trafficPercentage = (trafficLinks / totalLinks) * 100;
  
  let score = 0;
  
  // Money pages distribution (0-8 points)
  if (moneyPercentage >= 5 && moneyPercentage <= 10) score += 8;
  else if (moneyPercentage >= 3 && moneyPercentage <= 15) score += 5;
  else if (moneyPercentage > 0) score += 2;
  
  // Supporting content distribution (0-8 points)
  if (supportingPercentage >= 30 && supportingPercentage <= 40) score += 8;
  else if (supportingPercentage >= 20 && supportingPercentage <= 50) score += 5;
  else if (supportingPercentage > 0) score += 2;
  
  // Traffic content distribution (0-9 points)
  if (trafficPercentage >= 50 && trafficPercentage <= 60) score += 9;
  else if (trafficPercentage >= 40 && trafficPercentage <= 70) score += 6;
  else if (trafficPercentage > 0) score += 3;
  
  return score;
};
```

### 2.2 Orphaned Content Score (0-20 points)
```javascript
const calculateOrphanedContentScore = (pages) => {
  const totalPages = pages.length;
  const orphanedPages = pages.filter(page => page.incomingLinks <= 2).length;
  const orphanedPercentage = (orphanedPages / totalPages) * 100;
  
  // Score based on percentage of orphaned pages
  if (orphanedPercentage <= 5) return 20; // Excellent
  else if (orphanedPercentage <= 10) return 15; // Good
  else if (orphanedPercentage <= 20) return 10; // Fair
  else if (orphanedPercentage <= 30) return 5; // Poor
  else return 0; // Very poor
};
```

### 2.3 Authority Flow Score (0-20 points)
```javascript
const calculateAuthorityFlowScore = (pages) => {
  const highAuthorityPages = pages.filter(page => page.ilr >= 80);
  const lowAuthorityPages = pages.filter(page => page.ilr < 50);
  
  let score = 0;
  
  // Check if high-authority pages link to low-authority pages
  highAuthorityPages.forEach(highPage => {
    const linksToLowAuthority = lowAuthorityPages.filter(lowPage => 
      highPage.outgoingLinks.includes(lowPage.url)
    ).length;
    
    if (linksToLowAuthority > 0) score += 2;
  });
  
  // Bonus for optimal authority distribution
  const avgILR = pages.reduce((sum, page) => sum + page.ilr, 0) / pages.length;
  if (avgILR >= 70) score += 5;
  else if (avgILR >= 60) score += 3;
  else if (avgILR >= 50) score += 1;
  
  return Math.min(score, 20);
};
```

---

## 3. Report Card Templates

### 3.1 Overall Site Report Card
```markdown
┌─────────────────────────────────────────────────────────────┐
│                INTERNAL LINKING REPORT CARD                 │
│                    [SITE NAME]                             │
├─────────────────────────────────────────────────────────────┤
│ Overall Score: [SCORE]/100 [STARS]                         │
│ Analysis Date: [DATE]                                      │
│ Total Pages Analyzed: [COUNT]                              │
│                                                             │
│ TIER DISTRIBUTION:                                          │
│ • Money Pages: [SCORE]/10 ([STATUS])                       │
│ • Supporting Content: [SCORE]/10 ([STATUS])                │
│ • Traffic Content: [SCORE]/10 ([STATUS])                   │
│                                                             │
│ KEY METRICS:                                                │
│ • Orphaned Pages: [COUNT] ([PERCENTAGE]%)                  │
│ • Average ILR: [SCORE]                                     │
│ • Link Distribution Score: [SCORE]/25                      │
│ • Authority Flow Score: [SCORE]/20                         │
│                                                             │
│ TOP ISSUES:                                                 │
│ • [ISSUE 1]                                                │
│ • [ISSUE 2]                                                │
│ • [ISSUE 3]                                                │
│                                                             │
│ PRIORITY RECOMMENDATIONS:                                   │
│ 1. [RECOMMENDATION 1]                                      │
│ 2. [RECOMMENDATION 2]                                      │
│ 3. [RECOMMENDATION 3]                                      │
│                                                             │
│ ESTIMATED IMPACT:                                           │
│ • Potential ILR Improvement: +[SCORE] points               │
│ • Pages Needing Links: [COUNT]                             │
│ • Implementation Time: [TIMEFRAME]                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Individual Page Report Card
```markdown
┌─────────────────────────────────────────────────────────────┐
│                    PAGE ANALYSIS REPORT                     │
├─────────────────────────────────────────────────────────────┤
│ Page: [URL]                                                │
│ Title: [TITLE]                                             │
│ Score: [SCORE]/100 [STARS]                                 │
│ Tier: [TIER] ([PRIORITY])                                  │
│                                                             │
│ CURRENT STATUS:                                             │
│ • ILR: [SCORE] ([STATUS])                                  │
│ • Incoming Links: [COUNT] ([STATUS])                       │
│ • Outgoing Links: [COUNT]                                  │
│ • Load Time: [TIME]s ([STATUS])                            │
│ • HTTP Status: [CODE] ([STATUS])                           │
│                                                             │
│ OPTIMIZATION OPPORTUNITIES:                                 │
│ • [OPPORTUNITY 1]                                          │
│ • [OPPORTUNITY 2]                                          │
│ • [OPPORTUNITY 3]                                          │
│                                                             │
│ RECOMMENDED ACTIONS:                                        │
│ 1. [ACTION 1] - Priority: [HIGH/MEDIUM/LOW]                │
│ 2. [ACTION 2] - Priority: [HIGH/MEDIUM/LOW]                │
│ 3. [ACTION 3] - Priority: [HIGH/MEDIUM/LOW]                │
│                                                             │
│ LINKING OPPORTUNITIES:                                      │
│ • Link FROM: [PAGE 1], [PAGE 2], [PAGE 3]                 │
│ • Link TO: [PAGE 1], [PAGE 2], [PAGE 3]                   │
│ • Suggested Anchor Text: "[TEXT 1]", "[TEXT 2]"           │
│                                                             │
│ EXPECTED IMPROVEMENTS:                                      │
│ • ILR Increase: +[SCORE] points                            │
│ • Link Count Increase: +[COUNT] links                      │
│ • Ranking Potential: [HIGH/MEDIUM/LOW]                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Topic Cluster Report Card
```markdown
┌─────────────────────────────────────────────────────────────┐
│                   TOPIC CLUSTER STRATEGY                    │
├─────────────────────────────────────────────────────────────┤
│ Cluster: [CLUSTER NAME]                                    │
│ Hub Page: [URL]                                            │
│ Cluster Score: [SCORE]/100 [STARS]                         │
│                                                             │
│ HUB PAGE ANALYSIS:                                          │
│ • Current ILR: [SCORE]                                     │
│ • Incoming Links: [COUNT]                                  │
│ • Outgoing Links: [COUNT]                                  │
│ • Optimization Status: [STATUS]                            │
│                                                             │
│ CLUSTER PAGES:                                              │
│ 1. [PAGE 1] - ILR: [SCORE], Links: [COUNT]                │
│ 2. [PAGE 2] - ILR: [SCORE], Links: [COUNT]                │
│ 3. [PAGE 3] - ILR: [SCORE], Links: [COUNT]                │
│ 4. [PAGE 4] - ILR: [SCORE], Links: [COUNT]                │
│ 5. [PAGE 5] - ILR: [SCORE], Links: [COUNT]                │
│                                                             │
│ LINKING STRATEGY:                                           │
│ • Hub → Spokes: [COUNT] links needed                       │
│ • Spokes → Hub: [COUNT] links needed                       │
│ • Spoke → Spoke: [COUNT] links needed                      │
│                                                             │
│ IMPLEMENTATION PLAN:                                        │
│ Week 1: [TASK 1]                                           │
│ Week 2: [TASK 2]                                           │
│ Week 3: [TASK 3]                                           │
│ Week 4: [TASK 4]                                           │
│                                                             │
│ EXPECTED OUTCOMES:                                          │
│ • Hub Page ILR: +[SCORE] points                            │
│ • Average Cluster ILR: +[SCORE] points                     │
│ • Topic Authority: [HIGH/MEDIUM/LOW]                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Status Classifications

### 4.1 Score Ranges and Status
```javascript
const getScoreStatus = (score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return { status: 'Excellent', emoji: '⭐⭐⭐⭐⭐', color: 'green' };
  else if (percentage >= 80) return { status: 'Very Good', emoji: '⭐⭐⭐⭐', color: 'green' };
  else if (percentage >= 70) return { status: 'Good', emoji: '⭐⭐⭐', color: 'yellow' };
  else if (percentage >= 60) return { status: 'Fair', emoji: '⭐⭐', color: 'yellow' };
  else if (percentage >= 50) return { status: 'Poor', emoji: '⭐', color: 'red' };
  else return { status: 'Very Poor', emoji: '❌', color: 'red' };
};
```

### 4.2 Priority Classifications
```javascript
const getPriorityLevel = (score, tier) => {
  if (tier === 'money' && score < 90) return 'HIGH';
  if (tier === 'supporting' && score < 80) return 'MEDIUM';
  if (tier === 'traffic' && score < 70) return 'MEDIUM';
  if (score < 50) return 'HIGH';
  if (score < 70) return 'MEDIUM';
  return 'LOW';
};
```

---

## 5. Recommendation Engine

### 5.1 Recommendation Categories
```javascript
const generateRecommendations = (page, siteContext) => {
  const recommendations = [];
  
  // Link-based recommendations
  if (page.incomingLinks < 5) {
    recommendations.push({
      type: 'links',
      priority: 'HIGH',
      action: 'Add internal links from high-authority pages',
      description: `This page has only ${page.incomingLinks} internal links. Add 5-10 more links from relevant high-authority pages.`,
      implementation: 'Link from homepage, category pages, and related blog posts.'
    });
  }
  
  // Technical recommendations
  if (page.loadTime > 3.0) {
    recommendations.push({
      type: 'technical',
      priority: 'MEDIUM',
      action: 'Optimize page load time',
      description: `Page load time is ${page.loadTime}s, which is above the recommended 3s threshold.`,
      implementation: 'Optimize images, minify CSS/JS, enable caching.'
    });
  }
  
  // Content recommendations
  if (!page.description || page.description.length < 120) {
    recommendations.push({
      type: 'content',
      priority: 'MEDIUM',
      action: 'Improve meta description',
      description: 'Meta description is missing or too short for optimal SEO.',
      implementation: 'Write a compelling 120-160 character description.'
    });
  }
  
  return recommendations;
};
```

### 5.2 Implementation Priority Matrix
```javascript
const prioritizeRecommendations = (recommendations) => {
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const typeOrder = { 'links': 3, 'technical': 2, 'content': 1 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    return typeOrder[b.type] - typeOrder[a.type];
  });
};
```

---

## 6. Progress Tracking

### 6.1 Progress Metrics
```javascript
const trackProgress = (beforeAnalysis, afterAnalysis) => {
  return {
    overallScoreChange: afterAnalysis.overallScore - beforeAnalysis.overallScore,
    orphanedPagesReduced: beforeAnalysis.orphanedPages - afterAnalysis.orphanedPages,
    averageILRImprovement: afterAnalysis.averageILR - beforeAnalysis.averageILR,
    linksAdded: afterAnalysis.totalLinks - beforeAnalysis.totalLinks,
    pagesOptimized: afterAnalysis.optimizedPages - beforeAnalysis.optimizedPages
  };
};
```

### 6.2 Success Thresholds
```javascript
const evaluateSuccess = (progress) => {
  const thresholds = {
    excellent: { scoreChange: 15, ilrImprovement: 10, orphanedReduction: 10 },
    good: { scoreChange: 10, ilrImprovement: 5, orphanedReduction: 5 },
    fair: { scoreChange: 5, ilrImprovement: 2, orphanedReduction: 2 }
  };
  
  if (progress.overallScoreChange >= thresholds.excellent.scoreChange) return 'Excellent';
  if (progress.overallScoreChange >= thresholds.good.scoreChange) return 'Good';
  if (progress.overallScoreChange >= thresholds.fair.scoreChange) return 'Fair';
  return 'Needs Improvement';
};
```

This scoring system and report card framework provides comprehensive analysis capabilities that will help users understand their current internal linking status and implement strategic improvements based on data-driven insights.
