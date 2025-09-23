const _ = require('lodash');

class ScoringEngine {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.weights = {
      linkScore: 0.3,      // 30% - Internal link count and distribution
      tierScore: 0.2,      // 20% - Page tier appropriateness
      technicalScore: 0.2, // 20% - Technical health (load time, status, etc.)
      contentScore: 0.15,  // 15% - Content quality indicators
      clusterScore: 0.15   // 15% - Topic cluster effectiveness
    };
  }

  calculatePageScore(page) {
    const linkScore = this.calculateLinkScore(page);
    const tierScore = this.calculateTierScore(page);
    const technicalScore = this.calculateTechnicalScore(page);
    const contentScore = this.calculateContentScore(page);
    const clusterScore = this.calculateClusterScore(page);

    const totalScore = Math.round(
      (linkScore * this.weights.linkScore) +
      (tierScore * this.weights.tierScore) +
      (technicalScore * this.weights.technicalScore) +
      (contentScore * this.weights.contentScore) +
      (clusterScore * this.weights.clusterScore)
    );

    return {
      total: Math.min(100, totalScore),
      breakdown: {
        linkScore: Math.round(linkScore),
        tierScore: Math.round(tierScore),
        technicalScore: Math.round(technicalScore),
        contentScore: Math.round(contentScore),
        clusterScore: Math.round(clusterScore)
      },
      grade: this.getGrade(totalScore),
      recommendations: this.generatePageRecommendations(page, {
        linkScore, tierScore, technicalScore, contentScore, clusterScore
      })
    };
  }

  calculateLinkScore(page) {
    // Base score from incoming links (0-40 points)
    const incomingScore = Math.min(page.incomingLinks / 2, 40);
    
    // ILR score component (0-40 points)
    const ilrScore = page.ilr * 0.4;
    
    // Outgoing links balance (0-20 points)
    const outgoingBalance = this.calculateOutgoingBalance(page);
    
    return Math.min(100, incomingScore + ilrScore + outgoingBalance);
  }

  calculateOutgoingBalance(page) {
    // Ideal outgoing links based on page tier
    const idealOutgoing = {
      money: 15,      // Money pages should link to 10-20 supporting pages
      supporting: 25, // Supporting pages should link to 20-30 other pages
      traffic: 35     // Traffic pages should link to 30-40 other pages
    };

    const ideal = idealOutgoing[page.tier] || 25;
    const difference = Math.abs(page.outgoingLinks - ideal);
    
    // Closer to ideal = higher score
    return Math.max(0, 20 - (difference * 0.5));
  }

  calculateTierScore(page) {
    const tierExpectations = {
      money: { minILR: 95, minLinks: 50, maxLinks: 100 },
      supporting: { minILR: 70, minLinks: 30, maxLinks: 80 },
      traffic: { minILR: 30, minLinks: 5, maxLinks: 50 }
    };

    const expectations = tierExpectations[page.tier];
    if (!expectations) return 50;

    let score = 0;

    // ILR expectation (0-50 points)
    if (page.ilr >= expectations.minILR) {
      score += 50;
    } else {
      score += (page.ilr / expectations.minILR) * 50;
    }

    // Link count expectation (0-50 points)
    if (page.incomingLinks >= expectations.minLinks && page.incomingLinks <= expectations.maxLinks) {
      score += 50;
    } else if (page.incomingLinks < expectations.minLinks) {
      score += (page.incomingLinks / expectations.minLinks) * 50;
    } else {
      // Penalize over-linking
      const excess = page.incomingLinks - expectations.maxLinks;
      score += Math.max(25, 50 - (excess * 0.5));
    }

    return Math.min(100, score);
  }

  calculateTechnicalScore(page) {
    let score = 100;

    // HTTP Status (0-25 points deduction)
    if (page.httpStatus !== 200) {
      score -= 25;
    }

    // Load Time (0-25 points deduction)
    if (page.loadTime > 3) {
      score -= Math.min(25, (page.loadTime - 3) * 5);
    }

    // Issues count (0-25 points deduction)
    if (page.issues > 0) {
      score -= Math.min(25, page.issues * 2);
    }

    // Sitemap inclusion (0-25 points deduction)
    if (!page.inSitemap) {
      score -= 25;
    }

    return Math.max(0, score);
  }

  calculateContentScore(page) {
    let score = 0;

    // Title quality (0-30 points)
    if (page.title && page.title.length > 10) {
      score += 30;
      // Bonus for descriptive titles
      if (page.title.length > 30 && page.title.length < 60) {
        score += 10;
      }
    }

    // Description quality (0-30 points)
    if (page.description && page.description.length > 50) {
      score += 30;
      // Bonus for comprehensive descriptions
      if (page.description.length > 100) {
        score += 10;
      }
    }

    // URL structure (0-20 points)
    if (page.slug && page.slug.includes('-')) {
      score += 20; // SEO-friendly URL structure
    }

    // Page depth (0-20 points)
    const depthScore = Math.max(0, 20 - (page.crawlDepth * 5));
    score += depthScore;

    return Math.min(100, score);
  }

  calculateClusterScore(page) {
    const clusters = this.dataProcessor.generateTopicClusters();
    let score = 50; // Base score

    // Check if page is part of a topic cluster
    const isInCluster = clusters.some(cluster => 
      cluster.hub.url === page.url || 
      cluster.spokes.some(spoke => spoke.url === page.url)
    );

    if (isInCluster) {
      score += 30; // Bonus for being in a cluster
      
      // Additional bonus for being a hub page
      const isHub = clusters.some(cluster => cluster.hub.url === page.url);
      if (isHub) {
        score += 20;
      }
    }

    return Math.min(100, score);
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  generatePageRecommendations(page, scores) {
    const recommendations = [];

    // Link-based recommendations
    if (scores.linkScore < 60) {
      if (page.incomingLinks < 10) {
        recommendations.push({
          type: 'links',
          priority: 'high',
          action: `Add ${10 - page.incomingLinks} more internal links to this page`,
          impact: 'Will significantly improve page authority and rankings'
        });
      }
      
      if (page.ilr < 70) {
        recommendations.push({
          type: 'links',
          priority: 'high',
          action: 'Focus on getting high-quality internal links from authoritative pages',
          impact: 'Will improve Internal Link Ratio and overall page strength'
        });
      }
    }

    // Tier-based recommendations
    if (scores.tierScore < 70) {
      const tierAdvice = {
        money: 'This money page needs more internal links to reach its potential',
        supporting: 'This supporting page should link to more relevant content',
        traffic: 'This content page needs better integration with your site structure'
      };
      
      recommendations.push({
        type: 'tier',
        priority: 'medium',
        action: tierAdvice[page.tier] || 'Improve page positioning in site hierarchy',
        impact: 'Will better align page with its intended role in site architecture'
      });
    }

    // Technical recommendations
    if (scores.technicalScore < 80) {
      if (page.loadTime > 3) {
        recommendations.push({
          type: 'technical',
          priority: 'high',
          action: `Optimize page load time (currently ${page.loadTime.toFixed(2)}s)`,
          impact: 'Will improve user experience and search rankings'
        });
      }
      
      if (page.issues > 0) {
        recommendations.push({
          type: 'technical',
          priority: 'high',
          action: `Fix ${page.issues} technical issues on this page`,
          impact: 'Will resolve SEO and user experience problems'
        });
      }
      
      if (!page.inSitemap) {
        recommendations.push({
          type: 'technical',
          priority: 'medium',
          action: 'Add this page to your XML sitemap',
          impact: 'Will help search engines discover and index this page'
        });
      }
    }

    // Content recommendations
    if (scores.contentScore < 70) {
      if (!page.title || page.title.length < 30) {
        recommendations.push({
          type: 'content',
          priority: 'medium',
          action: 'Improve page title - make it more descriptive and keyword-rich',
          impact: 'Will improve click-through rates and search rankings'
        });
      }
      
      if (!page.description || page.description.length < 100) {
        recommendations.push({
          type: 'content',
          priority: 'medium',
          action: 'Add or improve meta description to better describe page content',
          impact: 'Will improve search result appearance and click-through rates'
        });
      }
    }

    // Cluster recommendations
    if (scores.clusterScore < 70) {
      recommendations.push({
        type: 'cluster',
        priority: 'low',
        action: 'Consider creating topic clusters around this page\'s main theme',
        impact: 'Will improve topical authority and internal link structure'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  calculateSiteScore(userPreferences = {}) {
    const allPages = this.dataProcessor.getAllPages();
    const pageScores = allPages.map(page => this.calculatePageScore(page));
    
    // Overall site metrics
    const avgScore = _.meanBy(pageScores, 'total');
    const analytics = this.dataProcessor.getAnalytics();
    const opportunities = this.dataProcessor.findOptimizationOpportunities();
    
    // Tier distribution analysis
    const tierDistribution = this.analyzeTierDistribution();
    
    // Link equity flow analysis
    const linkEquityFlow = this.analyzeLinkEquityFlow();
    
    return {
      overall: {
        score: Math.round(avgScore),
        grade: this.getGrade(avgScore),
        totalPages: allPages.length
      },
      tiers: {
        distribution: tierDistribution,
        scores: {
          money: this.calculateTierAverageScore('money'),
          supporting: this.calculateTierAverageScore('supporting'),
          traffic: this.calculateTierAverageScore('traffic')
        }
      },
      analytics,
      opportunities: opportunities.slice(0, 10), // Top 10 opportunities
      linkEquityFlow,
      recommendations: this.generateSiteRecommendations(pageScores, opportunities, userPreferences),
      pageScores: pageScores.sort((a, b) => b.total - a.total) // Sort by score descending
    };
  }

  analyzeTierDistribution() {
    const categories = this.dataProcessor.categories;
    const total = this.dataProcessor.getAllPages().length;
    
    return {
      money: {
        count: categories.moneyPages.length,
        percentage: Math.round((categories.moneyPages.length / total) * 100),
        ideal: '5-15%',
        status: this.getTierDistributionStatus(categories.moneyPages.length / total, 0.05, 0.15)
      },
      supporting: {
        count: categories.supportingPages.length,
        percentage: Math.round((categories.supportingPages.length / total) * 100),
        ideal: '25-35%',
        status: this.getTierDistributionStatus(categories.supportingPages.length / total, 0.25, 0.35)
      },
      traffic: {
        count: categories.trafficPages.length,
        percentage: Math.round((categories.trafficPages.length / total) * 100),
        ideal: '50-70%',
        status: this.getTierDistributionStatus(categories.trafficPages.length / total, 0.50, 0.70)
      }
    };
  }

  getTierDistributionStatus(actual, minIdeal, maxIdeal) {
    if (actual >= minIdeal && actual <= maxIdeal) return 'good';
    if (actual < minIdeal) return 'too-few';
    return 'too-many';
  }

  analyzeLinkEquityFlow() {
    const allPages = this.dataProcessor.getAllPages();
    const highAuthority = allPages.filter(page => page.ilr > 80);
    const lowAuthority = allPages.filter(page => page.ilr < 50);
    
    // Calculate how well high-authority pages link to low-authority pages
    let flowScore = 0;
    let totalConnections = 0;
    
    highAuthority.forEach(highPage => {
      // This is a simplified calculation - in a real implementation,
      // you'd analyze actual link connections
      const potentialFlow = Math.min(highPage.outgoingLinks, 10);
      flowScore += potentialFlow;
      totalConnections += 10; // Max potential
    });
    
    return {
      score: totalConnections > 0 ? Math.round((flowScore / totalConnections) * 100) : 0,
      highAuthorityPages: highAuthority.length,
      lowAuthorityPages: lowAuthority.length,
      status: flowScore / totalConnections > 0.6 ? 'good' : 'needs-improvement'
    };
  }

  calculateTierAverageScore(tier) {
    const pages = this.dataProcessor.getPagesByCategory(tier + 'Pages');
    if (pages.length === 0) return 0;
    
    const scores = pages.map(page => this.calculatePageScore(page).total);
    return Math.round(_.mean(scores));
  }

  generateSiteRecommendations(pageScores, opportunities, userPreferences) {
    const recommendations = [];
    
    // High priority recommendations based on user goals
    if (userPreferences.primaryGoal === 'conversions') {
      recommendations.push({
        priority: 'high',
        category: 'conversions',
        title: 'Optimize Money Pages for Conversions',
        action: 'Focus internal linking on your highest-converting service pages',
        pages: this.dataProcessor.getPagesByCategory('moneyPages').slice(0, 5),
        impact: 'Direct impact on business revenue'
      });
    }
    
    if (userPreferences.primaryGoal === 'traffic') {
      recommendations.push({
        priority: 'high',
        category: 'traffic',
        title: 'Boost Content Page Authority',
        action: 'Add more internal links to your blog posts and informational content',
        pages: this.dataProcessor.getPagesByCategory('trafficPages').filter(p => p.ilr < 50).slice(0, 10),
        impact: 'Will improve organic search rankings and traffic'
      });
    }
    
    // Universal recommendations
    const orphanedPages = opportunities.filter(opp => opp.type === 'orphaned');
    if (orphanedPages.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'technical',
        title: 'Fix Orphaned Pages',
        action: `Add internal links to ${orphanedPages.length} orphaned pages`,
        pages: orphanedPages.map(opp => opp.page).slice(0, 5),
        impact: 'Will improve overall site structure and SEO'
      });
    }
    
    // Low-performing pages
    const lowScores = pageScores.filter(score => score.total < 50);
    if (lowScores.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        title: 'Improve Low-Scoring Pages',
        action: `Optimize ${lowScores.length} pages with scores below 50`,
        impact: 'Will raise overall site quality and search performance'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  getScoreColor(score) {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 80) return '🟡';
    if (score >= 60) return '🟠';
    return '🔴';
  }
}

module.exports = ScoringEngine;
