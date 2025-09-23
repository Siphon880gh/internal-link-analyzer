const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { table } = require('table');

class ReportGenerator {
  constructor(dataProcessor, scoringEngine) {
    this.dataProcessor = dataProcessor;
    this.scoringEngine = scoringEngine;
    this.reportsDir = path.join(process.cwd(), 'reports');
  }

  async generateReports(siteAnalysis, userPreferences) {
    // Ensure reports directory exists
    await fs.ensureDir(this.reportsDir);

    const reports = {};
    const formats = userPreferences.outputFormats || ['console'];

    if (formats.includes('console')) {
      reports.console = this.generateConsoleReport(siteAnalysis, userPreferences);
    }

    if (formats.includes('markdown')) {
      const markdownReport = this.generateMarkdownReport(siteAnalysis, userPreferences);
      const markdownPath = path.join(this.reportsDir, `internal-linking-report-${this.getTimestamp()}.md`);
      await fs.writeFile(markdownPath, markdownReport);
      reports.markdown = { content: markdownReport, path: markdownPath };
    }

    if (formats.includes('html')) {
      const htmlReport = this.generateHTMLReport(siteAnalysis, userPreferences);
      const htmlPath = path.join(this.reportsDir, `internal-linking-report-${this.getTimestamp()}.html`);
      await fs.writeFile(htmlPath, htmlReport);
      reports.html = { content: htmlReport, path: htmlPath };
    }

    if (formats.includes('csv')) {
      const csvReport = this.generateCSVReport(siteAnalysis, userPreferences);
      const csvPath = path.join(this.reportsDir, `internal-linking-data-${this.getTimestamp()}.csv`);
      await fs.writeFile(csvPath, csvReport);
      reports.csv = { content: csvReport, path: csvPath };
    }

    return reports;
  }

  generateConsoleReport(siteAnalysis, userPreferences) {
    let output = '';
    
    // Header
    output += this.getConsoleHeader();
    
    // Overall Score Card
    output += this.getConsoleScoreCard(siteAnalysis);
    
    // Tier Analysis
    output += this.getConsoleTierAnalysis(siteAnalysis);
    
    // Top Opportunities
    output += this.getConsoleOpportunities(siteAnalysis);
    
    // Recommendations
    output += this.getConsoleRecommendations(siteAnalysis, userPreferences);
    
    // Top/Bottom Performers
    output += this.getConsolePerformers(siteAnalysis);
    
    // Action Plan
    if (userPreferences.createActionPlan) {
      output += this.getConsoleActionPlan(siteAnalysis, userPreferences);
    }
    
    return output;
  }

  getConsoleHeader() {
    return chalk.blue.bold(`
╔════════════════════════════════════════════════════════════╗
║                INTERNAL LINKING REPORT CARD                ║
║                Generated: ${new Date().toLocaleString()}                 ║
╚════════════════════════════════════════════════════════════╝
`) + '\n';
  }

  getConsoleScoreCard(siteAnalysis) {
    const { overall, tiers } = siteAnalysis;
    const scoreColor = overall.score >= 80 ? 'green' : overall.score >= 60 ? 'yellow' : 'red';
    const stars = '⭐'.repeat(Math.ceil(overall.score / 20));
    
    return chalk.cyan.bold('\n📊 OVERALL SITE SCORE\n') +
           chalk[scoreColor].bold(`Score: ${overall.score}/100 ${stars} (Grade: ${overall.grade})\n`) +
           chalk.white(`Total Pages Analyzed: ${overall.totalPages}\n\n`) +
           
           chalk.cyan.bold('📈 TIER DISTRIBUTION\n') +
           chalk.white(`• Money Pages: ${tiers.distribution.money.count} (${tiers.distribution.money.percentage}%) - ${this.getStatusEmoji(tiers.distribution.money.status)} ${tiers.distribution.money.status}\n`) +
           chalk.white(`• Supporting Pages: ${tiers.distribution.supporting.count} (${tiers.distribution.supporting.percentage}%) - ${this.getStatusEmoji(tiers.distribution.supporting.status)} ${tiers.distribution.supporting.status}\n`) +
           chalk.white(`• Traffic Pages: ${tiers.distribution.traffic.count} (${tiers.distribution.traffic.percentage}%) - ${this.getStatusEmoji(tiers.distribution.traffic.status)} ${tiers.distribution.traffic.status}\n\n`);
  }

  getConsoleTierAnalysis(siteAnalysis) {
    const { tiers, analytics } = siteAnalysis;
    
    return chalk.cyan.bold('🎯 TIER PERFORMANCE ANALYSIS\n') +
           chalk.white(`• Money Pages Average Score: ${tiers.scores.money}/100\n`) +
           chalk.white(`• Supporting Pages Average Score: ${tiers.scores.supporting}/100\n`) +
           chalk.white(`• Traffic Pages Average Score: ${tiers.scores.traffic}/100\n\n`) +
           
           chalk.cyan.bold('📊 KEY METRICS\n') +
           chalk.white(`• Average ILR: ${analytics.averages.ilr}\n`) +
           chalk.white(`• Average Incoming Links: ${analytics.averages.incomingLinks}\n`) +
           chalk.white(`• Orphaned Pages: ${analytics.orphanedPages}\n`) +
           chalk.white(`• High Performers (ILR > 90): ${analytics.highPerformingPages}\n`) +
           chalk.white(`• Under Performers (ILR < 50): ${analytics.lowPerformingPages}\n\n`);
  }

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

  getConsoleRecommendations(siteAnalysis, userPreferences) {
    const recommendations = siteAnalysis.recommendations.slice(0, 3);
    let output = chalk.cyan.bold('💡 STRATEGIC RECOMMENDATIONS\n');
    
    recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? chalk.red('HIGH') : 
                      rec.priority === 'medium' ? chalk.yellow('MEDIUM') : 
                      chalk.green('LOW');
      
      output += chalk.white(`${index + 1}. [${priority}] ${rec.title}\n`);
      output += chalk.gray(`   ${rec.action}\n`);
      output += chalk.gray(`   📈 ${rec.impact}\n\n`);
    });
    
    return output;
  }

  getConsolePerformers(siteAnalysis) {
    const topPerformers = siteAnalysis.pageScores.slice(0, 5);
    const bottomPerformers = siteAnalysis.pageScores.slice(-5).reverse();
    
    let output = chalk.cyan.bold('🏆 TOP PERFORMING PAGES\n');
    topPerformers.forEach((page, index) => {
      const scoreColor = page.total >= 80 ? 'green' : page.total >= 60 ? 'yellow' : 'red';
      output += chalk.white(`${index + 1}. ${page.page?.title || 'Unknown'} - `) + 
                chalk[scoreColor](`${page.total}/100 (${page.grade})\n`);
    });
    
    output += chalk.cyan.bold('\n⚠️  PAGES NEEDING ATTENTION\n');
    bottomPerformers.forEach((page, index) => {
      const scoreColor = page.total >= 80 ? 'green' : page.total >= 60 ? 'yellow' : 'red';
      output += chalk.white(`${index + 1}. ${page.page?.title || 'Unknown'} - `) + 
                chalk[scoreColor](`${page.total}/100 (${page.grade})\n`);
    });
    
    return output + '\n';
  }

  getConsoleActionPlan(siteAnalysis, userPreferences) {
    const timeline = userPreferences.timeline || 'moderate';
    const timeframes = {
      aggressive: { weeks: 4, tasksPerWeek: 8 },
      moderate: { weeks: 12, tasksPerWeek: 4 },
      gradual: { weeks: 24, tasksPerWeek: 2 }
    };
    
    const plan = timeframes[timeline];
    
    return chalk.cyan.bold('📅 IMPLEMENTATION ACTION PLAN\n') +
           chalk.white(`Timeline: ${timeline} (${plan.weeks} weeks)\n`) +
           chalk.white(`Recommended Tasks Per Week: ${plan.tasksPerWeek}\n\n`) +
           
           chalk.yellow.bold('WEEK 1-2: QUICK WINS\n') +
           chalk.white('• Fix orphaned pages with 0-2 internal links\n') +
           chalk.white('• Add internal links to top money pages\n') +
           chalk.white('• Fix technical issues (404s, slow loading)\n\n') +
           
           chalk.yellow.bold('WEEK 3-4: CONTENT OPTIMIZATION\n') +
           chalk.white('• Optimize supporting page internal links\n') +
           chalk.white('• Create topic cluster connections\n') +
           chalk.white('• Improve anchor text strategy\n\n') +
           
           chalk.yellow.bold('ONGOING: MONITORING & REFINEMENT\n') +
           chalk.white('• Track ILR improvements weekly\n') +
           chalk.white('• Monitor traffic and conversion impacts\n') +
           chalk.white('• Adjust strategy based on results\n\n');
  }

  generateMarkdownReport(siteAnalysis, userPreferences) {
    const { overall, tiers, analytics, opportunities, recommendations } = siteAnalysis;
    const timestamp = new Date().toLocaleString();
    
    let markdown = `# Internal Linking Optimization Report

Generated: ${timestamp}
Analysis Tool: Internal Linking Optimization CLI

---

## Executive Summary

### Overall Site Score: ${overall.score}/100 (${overall.grade})

Your website has been analyzed for internal linking optimization opportunities. Based on ${overall.totalPages} pages analyzed, here are the key findings:

**Tier Distribution:**
- Money Pages: ${tiers.distribution.money.count} pages (${tiers.distribution.money.percentage}%) - Status: ${tiers.distribution.money.status}
- Supporting Pages: ${tiers.distribution.supporting.count} pages (${tiers.distribution.supporting.percentage}%) - Status: ${tiers.distribution.supporting.status}  
- Traffic Pages: ${tiers.distribution.traffic.count} pages (${tiers.distribution.traffic.percentage}%) - Status: ${tiers.distribution.traffic.status}

**Key Metrics:**
- Average ILR Score: ${analytics.averages.ilr}
- Average Incoming Links: ${analytics.averages.incomingLinks}
- Orphaned Pages: ${analytics.orphanedPages}
- High Performers (ILR > 90): ${analytics.highPerformingPages}
- Under Performers (ILR < 50): ${analytics.lowPerformingPages}

---

## Top Optimization Opportunities

${opportunities.slice(0, 10).map((opp, index) => `
### ${index + 1}. ${opp.issue} [${opp.priority.toUpperCase()} Priority]

**Recommendation:** ${opp.recommendation}

**Impact:** ${opp.impact}

${opp.page ? `**Affected Page:** [${opp.page.title}](${opp.page.url})` : ''}
`).join('\n')}

---

## Strategic Recommendations

${recommendations.slice(0, 5).map((rec, index) => `
### ${index + 1}. ${rec.title} [${rec.priority.toUpperCase()} Priority]

**Action:** ${rec.action}

**Impact:** ${rec.impact}

**Category:** ${rec.category}
`).join('\n')}

---

## Page Performance Analysis

### Top Performing Pages

${siteAnalysis.pageScores.slice(0, 10).map((score, index) => `
${index + 1}. **${score.page?.title || 'Unknown'}** - Score: ${score.total}/100 (${score.grade})
   - Link Score: ${score.breakdown.linkScore}/100
   - Technical Score: ${score.breakdown.technicalScore}/100
   - Content Score: ${score.breakdown.contentScore}/100
`).join('\n')}

### Pages Needing Attention

${siteAnalysis.pageScores.slice(-10).reverse().map((score, index) => `
${index + 1}. **${score.page?.title || 'Unknown'}** - Score: ${score.total}/100 (${score.grade})
   - Primary Issues: ${score.recommendations.slice(0, 2).map(r => r.action).join(', ')}
`).join('\n')}

---

## Implementation Timeline

Based on your selected timeline (${userPreferences.timeline}), here's a recommended implementation plan:

### Phase 1: Quick Wins (Weeks 1-2)
- Fix ${analytics.orphanedPages} orphaned pages
- Add internal links to top money pages
- Resolve technical issues

### Phase 2: Content Optimization (Weeks 3-8)
- Optimize supporting page internal links
- Create topic cluster connections
- Improve anchor text strategy

### Phase 3: Advanced Optimization (Weeks 9-12)
- Implement advanced linking strategies
- Monitor and adjust based on performance
- Scale successful tactics

---

## Monitoring & Next Steps

### Key Metrics to Track
1. **Internal Link Ratio (ILR)** improvements
2. **Organic traffic** changes to optimized pages
3. **Conversion rates** on money pages
4. **Page authority** improvements

### Tools Integration
${userPreferences.monitoringTools ? `
Current Tools: ${userPreferences.monitoringTools.join(', ')}
` : ''}

### WordPress Integration
${userPreferences.wordpressIntegration === 'yes' ? `
Recommended Plugin: ${userPreferences.wordpressPlugin || 'Link Whisper'}
Implementation: ${userPreferences.linkManagement}
` : 'Manual implementation recommended'}

---

*Report generated by Internal Linking Optimization Tool*
*For questions or support, please refer to the documentation.*
`;

    return markdown;
  }

  generateHTMLReport(siteAnalysis, userPreferences) {
    const { overall, tiers, analytics, opportunities, recommendations } = siteAnalysis;
    const timestamp = new Date().toLocaleString();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internal Linking Optimization Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .report-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 30px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .score-section {
            padding: 40px;
            text-align: center;
            background: #f8f9fa;
        }
        
        .overall-score {
            display: inline-block;
            background: ${this.getScoreColor(overall.score)};
            color: white;
            padding: 30px;
            border-radius: 10px;
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 20px;
            min-width: 150px;
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        
        .grade {
            font-size: 0.4em;
            margin-top: 10px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
        }
        
        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            text-align: center;
            border-left: 5px solid #667eea;
        }
        
        .metric-card h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        
        .tier-analysis {
            padding: 40px;
            background: white;
        }
        
        .tier-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            border-left: 5px solid;
        }
        
        .tier-money { border-left-color: #28a745; }
        .tier-supporting { border-left-color: #ffc107; }
        .tier-traffic { border-left-color: #17a2b8; }
        
        .opportunities-section, .recommendations-section {
            padding: 40px;
            background: white;
        }
        
        .opportunity-item, .recommendation-item {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            border-left: 5px solid;
        }
        
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        
        .priority-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        
        .badge-high { background: #dc3545; color: white; }
        .badge-medium { background: #ffc107; color: #333; }
        .badge-low { background: #28a745; color: white; }
        
        .performers-section {
            padding: 40px;
            background: white;
        }
        
        .performers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 20px;
        }
        
        .performer-list {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
        }
        
        .performer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .performer-item:last-child {
            border-bottom: none;
        }
        
        .performer-name {
            flex: 1;
            font-weight: 500;
        }
        
        .performer-score {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 10px;
            color: white;
        }
        
        .action-plan {
            padding: 40px;
            background: #f8f9fa;
        }
        
        .timeline-phase {
            background: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .phase-title {
            color: #667eea;
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .task-list {
            list-style: none;
        }
        
        .task-list li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
        }
        
        .task-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            padding: 40px;
            background: #333;
            color: white;
        }
        
        .section-title {
            font-size: 2em;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
        }
        
        .section-title:after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #667eea;
        }
        
        @media (max-width: 768px) {
            .performers-grid {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="report-card">
            <div class="header">
                <h1>🚀 Internal Linking Report</h1>
                <div class="subtitle">Generated: ${timestamp}</div>
            </div>
            
            <!-- Overall Score -->
            <div class="score-section">
                <div class="overall-score" style="background: ${this.getScoreColor(overall.score)}">
                    <div>${overall.score}</div>
                    <div class="grade">${overall.grade}</div>
                </div>
                <h2>Overall Optimization Score</h2>
                <p>Based on analysis of ${overall.totalPages} pages</p>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="report-card">
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>📊 Average ILR</h3>
                    <div class="metric-value">${analytics.averages.ilr}</div>
                    <div class="metric-label">Internal Link Ratio</div>
                </div>
                <div class="metric-card">
                    <h3>🔗 Avg Links</h3>
                    <div class="metric-value">${analytics.averages.incomingLinks}</div>
                    <div class="metric-label">Incoming Internal Links</div>
                </div>
                <div class="metric-card">
                    <h3>⚠️ Orphaned Pages</h3>
                    <div class="metric-value">${analytics.orphanedPages}</div>
                    <div class="metric-label">Pages with ≤2 links</div>
                </div>
                <div class="metric-card">
                    <h3>⏱️ Avg Load Time</h3>
                    <div class="metric-value">${analytics.averages.loadTime}s</div>
                    <div class="metric-label">Page Load Speed</div>
                </div>
            </div>
        </div>

        <!-- Tier Analysis -->
        <div class="report-card">
            <div class="tier-analysis">
                <h2 class="section-title">🎯 Tier Distribution Analysis</h2>
                
                <div class="tier-card tier-money">
                    <h3>💰 Money Pages (${tiers.distribution.money.percentage}%)</h3>
                    <p><strong>${tiers.distribution.money.count} pages</strong> - Average Score: ${tiers.scores.money}/100</p>
                    <p>Status: ${this.getStatusText(tiers.distribution.money.status)} (Ideal: 5-15%)</p>
                </div>
                
                <div class="tier-card tier-supporting">
                    <h3>🤝 Supporting Pages (${tiers.distribution.supporting.percentage}%)</h3>
                    <p><strong>${tiers.distribution.supporting.count} pages</strong> - Average Score: ${tiers.scores.supporting}/100</p>
                    <p>Status: ${this.getStatusText(tiers.distribution.supporting.status)} (Ideal: 25-35%)</p>
                </div>
                
                <div class="tier-card tier-traffic">
                    <h3>📈 Traffic Pages (${tiers.distribution.traffic.percentage}%)</h3>
                    <p><strong>${tiers.distribution.traffic.count} pages</strong> - Average Score: ${tiers.scores.traffic}/100</p>
                    <p>Status: ${this.getStatusText(tiers.distribution.traffic.status)} (Ideal: 50-70%)</p>
                </div>
            </div>
        </div>

        <!-- Top Opportunities -->
        <div class="report-card">
            <div class="opportunities-section">
                <h2 class="section-title">🚀 Top Optimization Opportunities</h2>
                ${opportunities.slice(0, 8).map(opp => `
                <div class="opportunity-item priority-${opp.priority}">
                    <div class="priority-badge badge-${opp.priority}">${opp.priority} Priority</div>
                    <h3>${opp.issue}</h3>
                    <p><strong>Recommendation:</strong> ${opp.recommendation}</p>
                    <p><strong>Impact:</strong> ${opp.impact}</p>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Strategic Recommendations -->
        <div class="report-card">
            <div class="recommendations-section">
                <h2 class="section-title">💡 Strategic Recommendations</h2>
                ${recommendations.slice(0, 5).map(rec => `
                <div class="recommendation-item priority-${rec.priority}">
                    <div class="priority-badge badge-${rec.priority}">${rec.priority} Priority</div>
                    <h3>${rec.title}</h3>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Page Performers -->
        <div class="report-card">
            <div class="performers-section">
                <h2 class="section-title">📊 Page Performance Analysis</h2>
                <div class="performers-grid">
                    <div class="performer-list">
                        <h3>🏆 Top Performers</h3>
                        ${siteAnalysis.pageScores.slice(0, 8).map(score => `
                        <div class="performer-item">
                            <div class="performer-name">${score.page?.title?.substring(0, 40) || 'Unknown'}${score.page?.title?.length > 40 ? '...' : ''}</div>
                            <div class="performer-score" style="background: ${this.getScoreColor(score.total)}">${score.total}</div>
                        </div>
                        `).join('')}
                    </div>
                    
                    <div class="performer-list">
                        <h3>⚠️ Needs Attention</h3>
                        ${siteAnalysis.pageScores.slice(-8).reverse().map(score => `
                        <div class="performer-item">
                            <div class="performer-name">${score.page?.title?.substring(0, 40) || 'Unknown'}${score.page?.title?.length > 40 ? '...' : ''}</div>
                            <div class="performer-score" style="background: ${this.getScoreColor(score.total)}">${score.total}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Plan -->
        ${userPreferences.createActionPlan ? `
        <div class="report-card">
            <div class="action-plan">
                <h2 class="section-title">📅 Implementation Action Plan</h2>
                <p style="text-align: center; margin-bottom: 30px; font-size: 1.1em;">
                    Timeline: <strong>${userPreferences.timeline}</strong> approach
                </p>
                
                <div class="timeline-phase">
                    <div class="phase-title">🚀 Phase 1: Quick Wins (Weeks 1-2)</div>
                    <ul class="task-list">
                        <li>Fix ${analytics.orphanedPages} orphaned pages with minimal internal links</li>
                        <li>Add strategic internal links to top money pages</li>
                        <li>Resolve technical issues (404s, slow loading pages)</li>
                        <li>Optimize highest-impact pages first</li>
                    </ul>
                </div>
                
                <div class="timeline-phase">
                    <div class="phase-title">🔧 Phase 2: Content Optimization (Weeks 3-8)</div>
                    <ul class="task-list">
                        <li>Optimize supporting page internal link structure</li>
                        <li>Create topic cluster connections</li>
                        <li>Improve anchor text strategy and diversity</li>
                        <li>Balance link distribution across tiers</li>
                    </ul>
                </div>
                
                <div class="timeline-phase">
                    <div class="phase-title">📈 Phase 3: Advanced Optimization (Weeks 9+)</div>
                    <ul class="task-list">
                        <li>Implement advanced linking strategies</li>
                        <li>Monitor and adjust based on performance data</li>
                        <li>Scale successful tactics across the site</li>
                        <li>Continuous optimization and refinement</li>
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>Report generated by Internal Linking Optimization Tool</p>
            <p>For questions or support, please refer to the documentation</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  generateCSVReport(siteAnalysis) {
    const csvHeaders = [
      'Page URL',
      'Page Title',
      'Tier',
      'ILR Score',
      'Incoming Links',
      'Outgoing Links',
      'Optimization Score',
      'Grade',
      'Load Time',
      'Issues',
      'Top Recommendation'
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    siteAnalysis.pageScores.forEach(pageScore => {
      const page = pageScore.page || {};
      const topRecommendation = pageScore.recommendations[0]?.action || 'No specific recommendation';
      
      const row = [
        `"${page.url || ''}"`,
        `"${page.title || ''}"`,
        `"${page.tier || ''}"`,
        page.ilr || 0,
        page.incomingLinks || 0,
        page.outgoingLinks || 0,
        pageScore.total || 0,
        `"${pageScore.grade || ''}"`,
        page.loadTime || 0,
        page.issues || 0,
        `"${topRecommendation}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  getScoreColor(score) {
    if (score >= 80) return '#28a745'; // Green
    if (score >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'good': return '✅';
      case 'too-few': return '⬇️';
      case 'too-many': return '⬆️';
      default: return '❓';
    }
  }

  getStatusText(status) {
    switch (status) {
      case 'good': return 'Optimal Distribution';
      case 'too-few': return 'Need More Pages';
      case 'too-many': return 'Too Many Pages';
      default: return 'Unknown Status';
    }
  }

  getTimestamp() {
    return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  }

  displayConsoleReport(report) {
    console.log(report);
  }

  async openHTMLReport(htmlPath) {
    const { exec } = require('child_process');
    const platform = process.platform;
    
    let command;
    if (platform === 'darwin') {
      command = `open "${htmlPath}"`;
    } else if (platform === 'win32') {
      command = `start "" "${htmlPath}"`;
    } else {
      command = `xdg-open "${htmlPath}"`;
    }
    
    exec(command, (error) => {
      if (error) {
        console.log(chalk.yellow(`Could not auto-open HTML report. Please manually open: ${htmlPath}`));
      } else {
        console.log(chalk.green(`HTML report opened in your default browser`));
      }
    });
  }
}

module.exports = ReportGenerator;
