#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');

// Import our modules
const DataProcessor = require('./src/dataProcessor');
const ScoringEngine = require('./src/scoringEngine');
const UserInterface = require('./src/userInterface');
const ReportGenerator = require('./src/reportGenerator');

class InternalLinkingOptimizer {
  constructor() {
    this.dataProcessor = new DataProcessor();
    this.scoringEngine = null;
    this.userInterface = null;
    this.reportGenerator = null;
    this.csvFilePath = path.join(__dirname, 'data', 'naecleaningsolutions.com_pages_20250923.csv');
  }

  async initialize() {
    try {
      // Check if CSV file exists
      if (!await fs.pathExists(this.csvFilePath)) {
        throw new Error(`CSV file not found at: ${this.csvFilePath}`);
      }

      // Initialize components
      this.scoringEngine = new ScoringEngine(this.dataProcessor);
      this.userInterface = new UserInterface(this.dataProcessor);
      this.reportGenerator = new ReportGenerator(this.dataProcessor, this.scoringEngine);

      console.log(chalk.green('✅ Internal Linking Optimizer initialized successfully'));
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      return false;
    }
  }

  async loadAndProcessData() {
    try {
      console.log(chalk.blue('📊 Loading and processing CSV data...'));
      
      // Show progress
      this.userInterface.showProgress('Loading CSV data...', 0, 100);
      
      // Parse CSV data
      await this.dataProcessor.parseCSV(this.csvFilePath);
      this.userInterface.updateProgress(50, 'Categorizing pages...');
      
      // Data is automatically categorized in parseCSV
      this.userInterface.updateProgress(100, 'Data processing complete!');
      this.userInterface.completeProgress();
      
      const analytics = this.dataProcessor.getAnalytics();
      console.log(chalk.green(`✅ Processed ${analytics.totalPages} pages successfully`));
      console.log(chalk.gray(`   • Money Pages: ${analytics.distribution.money}`));
      console.log(chalk.gray(`   • Supporting Pages: ${analytics.distribution.supporting}`));
      console.log(chalk.gray(`   • Traffic Pages: ${analytics.distribution.traffic}`));
      console.log(chalk.gray(`   • Orphaned Pages: ${analytics.orphanedPages}`));
      
      return true;
    } catch (error) {
      this.userInterface.completeProgress();
      console.error(chalk.red('❌ Data processing failed:'), error.message);
      return false;
    }
  }

  async runInteractiveAnalysis() {
    try {
      console.log(chalk.blue('\n🎯 Starting interactive analysis...'));
      
      // Run the full 6-phase interactive flow
      const userPreferences = await this.userInterface.runInteractiveFlow();
      
      return userPreferences;
    } catch (error) {
      console.error(chalk.red('❌ Interactive analysis failed:'), error.message);
      return null;
    }
  }

  async performAnalysis(userPreferences) {
    try {
      console.log(chalk.blue('\n🔍 Performing site analysis...'));
      
      // Show progress
      this.userInterface.showProgress('Analyzing pages...', 0, 100);
      
      // Calculate site analysis
      this.userInterface.updateProgress(25, 'Calculating page scores...');
      const siteAnalysis = this.scoringEngine.calculateSiteScore(userPreferences);
      
      this.userInterface.updateProgress(50, 'Finding opportunities...');
      // Opportunities are already included in calculateSiteScore
      
      this.userInterface.updateProgress(75, 'Generating recommendations...');
      // Recommendations are already included in calculateSiteScore
      
      this.userInterface.updateProgress(100, 'Analysis complete!');
      this.userInterface.completeProgress();
      
      console.log(chalk.green('✅ Site analysis completed successfully'));
      console.log(chalk.gray(`   • Overall Score: ${siteAnalysis.overall.score}/100 (${siteAnalysis.overall.grade})`));
      console.log(chalk.gray(`   • Opportunities Found: ${siteAnalysis.opportunities.length}`));
      console.log(chalk.gray(`   • Recommendations Generated: ${siteAnalysis.recommendations.length}`));
      
      return siteAnalysis;
    } catch (error) {
      this.userInterface.completeProgress();
      console.error(chalk.red('❌ Site analysis failed:'), error.message);
      return null;
    }
  }

  async generateReports(siteAnalysis, userPreferences) {
    try {
      console.log(chalk.blue('\n📊 Generating reports...'));
      
      // Show progress
      this.userInterface.showProgress('Generating reports...', 0, 100);
      
      this.userInterface.updateProgress(25, 'Creating report content...');
      const reports = await this.reportGenerator.generateReports(siteAnalysis, userPreferences);
      
      this.userInterface.updateProgress(75, 'Saving report files...');
      
      // Display console report if requested
      if (userPreferences.outputFormats.includes('console')) {
        this.userInterface.updateProgress(85, 'Displaying console report...');
        console.log('\n' + '='.repeat(80));
        this.reportGenerator.displayConsoleReport(reports.console);
        console.log('='.repeat(80) + '\n');
      }
      
      this.userInterface.updateProgress(100, 'Reports generated!');
      this.userInterface.completeProgress();
      
      // Show file locations
      console.log(chalk.green('\n✅ Reports generated successfully:'));
      
      if (reports.markdown) {
        console.log(chalk.blue(`📝 Markdown: ${reports.markdown.path}`));
      }
      
      if (reports.html) {
        console.log(chalk.blue(`🌐 HTML: ${reports.html.path}`));
        
        // Ask if user wants to open HTML report
        const openHTML = await this.userInterface.askForConfirmation(
          'Would you like to open the HTML report in your browser?', 
          true
        );
        
        if (openHTML) {
          await this.reportGenerator.openHTMLReport(reports.html.path);
        }
      }
      
      if (reports.csv) {
        console.log(chalk.blue(`📊 CSV: ${reports.csv.path}`));
      }
      
      return reports;
    } catch (error) {
      this.userInterface.completeProgress();
      console.error(chalk.red('❌ Report generation failed:'), error.message);
      return null;
    }
  }

  async displaySummary(siteAnalysis, userPreferences) {
    console.log(chalk.cyan.bold('\n🎉 OPTIMIZATION SUMMARY'));
    console.log(chalk.cyan('─'.repeat(50)));
    
    const { overall, opportunities, recommendations } = siteAnalysis;
    
    // Overall results
    const scoreColor = overall.score >= 80 ? 'green' : overall.score >= 60 ? 'yellow' : 'red';
    console.log(chalk.white('Overall Score: ') + chalk[scoreColor].bold(`${overall.score}/100 (${overall.grade})`));
    console.log(chalk.white('Pages Analyzed: ') + chalk.blue(overall.totalPages));
    
    // Top 3 opportunities
    console.log(chalk.white('\nTop Opportunities:'));
    opportunities.slice(0, 3).forEach((opp, index) => {
      const priorityColor = opp.priority === 'high' ? 'red' : opp.priority === 'medium' ? 'yellow' : 'green';
      console.log(chalk.gray(`  ${index + 1}. `) + chalk[priorityColor](`[${opp.priority.toUpperCase()}] `) + chalk.white(opp.issue));
    });
    
    // Next steps
    console.log(chalk.white('\nRecommended Next Steps:'));
    console.log(chalk.gray('  1. ') + chalk.white('Review the detailed reports generated'));
    console.log(chalk.gray('  2. ') + chalk.white('Start with high-priority opportunities'));
    console.log(chalk.gray('  3. ') + chalk.white('Monitor progress using your selected tools'));
    
    if (userPreferences.createActionPlan) {
      console.log(chalk.gray('  4. ') + chalk.white('Follow the implementation timeline in your action plan'));
    }
    
    console.log(chalk.cyan('\n' + '─'.repeat(50)));
    console.log(chalk.green.bold('🚀 Ready to optimize your internal linking strategy!'));
  }

  async run() {
    try {
      // Initialize the system first
      if (!await this.initialize()) {
        process.exit(1);
      }
      
      // Display welcome banner
      this.userInterface.displayWelcomeBanner();
      
      // Load and process data
      if (!await this.loadAndProcessData()) {
        process.exit(1);
      }
      
      // Run interactive analysis
      const userPreferences = await this.runInteractiveAnalysis();
      if (!userPreferences) {
        process.exit(1);
      }
      
      // Perform site analysis
      const siteAnalysis = await this.performAnalysis(userPreferences);
      if (!siteAnalysis) {
        process.exit(1);
      }
      
      // Generate reports
      const reports = await this.generateReports(siteAnalysis, userPreferences);
      if (!reports) {
        process.exit(1);
      }
      
      // Display summary
      await this.displaySummary(siteAnalysis, userPreferences);
      
      console.log(chalk.blue('\n💡 Thank you for using the Internal Linking Optimization Tool!'));
      console.log(chalk.gray('   For support or questions, please refer to the documentation.\n'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Application error:'), error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Main execution
if (require.main === module) {
  const optimizer = new InternalLinkingOptimizer();
  optimizer.run();
}

module.exports = InternalLinkingOptimizer;