const inquirer = require('inquirer');
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs-extra');
const path = require('path');

class UserInterface {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.answers = {};
    this.progressBar = null;
  }

  async runInteractiveFlow() {
    console.log(chalk.blue.bold('\n🚀 Internal Linking Optimization Tool\n'));
    console.log(chalk.gray('This tool will analyze your website data and provide strategic recommendations.\n'));

    try {
      // Phase 0: Data File Selection
      await this.runPhaseDataSelection();
      
      // Phase 1: Welcome & Business Goals
      await this.runPhase1();
      
      // Phase 2: Current State Assessment
      await this.runPhase2();
      
      // Phase 3: Page Priority Selection
      await this.runPhase3();
      
      // Phase 4: Technical Preferences
      await this.runPhase4();
      
      // Phase 5: Report Preferences
      await this.runPhase5();
      
      // Phase 6: Confirmation & Execution
      await this.runPhase6();
      
      return this.answers;
    } catch (error) {
      console.error(chalk.red('Error during interactive flow:'), error.message);
      throw error;
    }
  }

  async runPhaseDataSelection() {
    console.log(chalk.yellow.bold('\n📂 Data File Selection (Step 1 of 7)\n'));
    
    try {
      // Scan data directory for CSV files
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.readdir(dataDir);
      const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
      
      if (csvFiles.length === 0) {
        throw new Error('No CSV files found in the data/ directory');
      }
      
      // Show instructions for getting data from SEMrush
      console.log(chalk.cyan('💡 How to get your internal linking data:'));
      console.log(chalk.gray('   1. Go to SEMrush → Site Audit'));
      console.log(chalk.gray('   2. Click "View Details" on Internal Links'));
      console.log(chalk.gray('   3. Click "Export to CSV" at the top right'));
      console.log(chalk.gray('   4. Save the file in the data/ directory\n'));
      
      const dataSelectionQuestions = [
        {
          type: 'list',
          name: 'selectedDataFile',
          message: 'Which CSV data file would you like to analyze?',
          choices: csvFiles.map(file => {
            const filePath = path.join(dataDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            const modifiedDate = stats.mtime.toLocaleDateString();
            
            return {
              name: `${file} (${sizeKB} KB, modified: ${modifiedDate})`,
              value: file,
              short: file
            };
          }),
          default: csvFiles[0]
        },
        {
          type: 'confirm',
          name: 'confirmDataFile',
          message: 'Is this the correct data file for your website analysis?',
          default: true
        }
      ];
      
      const answers = await inquirer.prompt(dataSelectionQuestions);
      
      if (!answers.confirmDataFile) {
        console.log(chalk.yellow('Please select the correct data file and try again.'));
        return await this.runPhaseDataSelection(); // Recursive call to retry
      }
      
      // Store the selected file path
      this.answers.selectedDataFile = answers.selectedDataFile;
      this.answers.dataFilePath = path.join(dataDir, answers.selectedDataFile);
      
      console.log(chalk.green(`✅ Selected data file: ${answers.selectedDataFile}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error scanning data files:'), error.message);
      console.log(chalk.yellow('\n💡 Make sure you have CSV files in the data/ directory.'));
      console.log(chalk.gray('   To get data: SEMrush → Site Audit → Internal Links → Export CSV\n'));
      throw error;
    }
  }

  async runPhase1() {
    console.log(chalk.yellow.bold('\n📋 Phase 1: Welcome & Business Goals (2/7)\n'));

    const phase1Questions = [
      {
        type: 'confirm',
        name: 'welcome',
        message: 'Welcome to the Internal Linking Optimization Tool! This will analyze your website data and provide strategic recommendations. Ready to begin?',
        default: true
      },
      {
        type: 'list',
        name: 'primaryGoal',
        message: 'What is your primary business goal for internal linking optimization?',
        choices: [
          {
            name: 'Increase Conversions (Focus on Money Pages)',
            value: 'conversions',
            short: 'Conversions'
          },
          {
            name: 'Boost Organic Traffic (Focus on Content Pages)',
            value: 'traffic',
            short: 'Traffic'
          },
          {
            name: 'Build Authority & Trust (Focus on Supporting Content)',
            value: 'authority',
            short: 'Authority'
          },
          {
            name: 'Balanced Approach (All Content Types)',
            value: 'balanced',
            short: 'Balanced'
          }
        ],
        default: 'balanced'
      },
      {
        type: 'list',
        name: 'websiteType',
        message: 'What type of website are you optimizing?',
        choices: [
          'Service-based business (like NAE Cleaning)',
          'E-commerce store',
          'Content/blog site',
          'Corporate website',
          'Other'
        ],
        default: 'Service-based business (like NAE Cleaning)'
      }
    ];

    const answers = await inquirer.prompt(phase1Questions);
    Object.assign(this.answers, answers);

    if (!answers.welcome) {
      console.log(chalk.yellow('Come back when you\'re ready to optimize your internal linking!'));
      process.exit(0);
    }
  }

  async runPhase2() {
    console.log(chalk.yellow.bold('\n🔍 Phase 2: Current State Assessment (3/7)\n'));

    const phase2Questions = [
      {
        type: 'checkbox',
        name: 'optimizationAreas',
        message: 'Which areas need the most attention? (Select all that apply)',
        choices: [
          {
            name: 'Fix orphaned pages (pages with no internal links)',
            value: 'orphaned',
            checked: true
          },
          {
            name: 'Improve link distribution across content tiers',
            value: 'distribution',
            checked: true
          },
          {
            name: 'Create topic clusters and hub pages',
            value: 'clusters',
            checked: false
          },
          {
            name: 'Optimize anchor text strategy',
            value: 'anchors',
            checked: false
          },
          {
            name: 'Fix technical issues (broken links, etc.)',
            value: 'technical',
            checked: true
          },
          {
            name: 'Improve site architecture',
            value: 'architecture',
            checked: false
          }
        ],
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one optimization area.';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'contentCapacity',
        message: 'What is your content creation capacity?',
        choices: [
          {
            name: 'High - I can create new content and modify existing pages',
            value: 'high'
          },
          {
            name: 'Medium - I can modify existing content but limited new content',
            value: 'medium'
          },
          {
            name: 'Low - I prefer to work with existing content only',
            value: 'low'
          }
        ],
        default: 'medium'
      },
      {
        type: 'list',
        name: 'timeline',
        message: 'What is your preferred implementation timeline?',
        choices: [
          {
            name: '1 month - Aggressive optimization',
            value: 'aggressive'
          },
          {
            name: '3 months - Moderate, steady progress',
            value: 'moderate'
          },
          {
            name: '6 months - Gradual, sustainable approach',
            value: 'gradual'
          }
        ],
        default: 'moderate'
      }
    ];

    const answers = await inquirer.prompt(phase2Questions);
    Object.assign(this.answers, answers);
  }

  async runPhase3() {
    console.log(chalk.yellow.bold('\n🎯 Phase 3: Page Priority Selection (4/7)\n'));

    // Display helpful information about the metrics
    console.log(chalk.cyan.bold('💡 Understanding the Metrics:\n'));
    console.log(chalk.gray('ILR (Internal Link Ratio): A score from 0-100 that measures how well a page'));
    console.log(chalk.gray('is internally linked within your website. Higher scores (90-100) indicate pages'));
    console.log(chalk.gray('that are strongly connected through your site\'s internal linking structure.\n'));
    console.log(chalk.gray('Links: The number of internal links pointing to this page from other pages.\n'));
    console.log(chalk.cyan('💡 Tip: Pages with high ILR scores are already well-optimized. Consider focusing'));
    console.log(chalk.cyan('on pages with lower scores that deserve more internal links.\n'));

    // Get all pages and allow user to select any page as money or supporting
    // This allows flexibility instead of restricting to auto-categorized pages
    const allPages = this.dataProcessor.getAllPages();
    
    // Sort by ILR to show highest performing pages first
    const sortedPages = [...allPages].sort((a, b) => b.ilr - a.ilr);
    
    // Create choices for money pages - show all pages, auto-select those with high ILR or service keywords
    const moneyPageChoices = sortedPages.map(page => ({
      name: `${page.title} (ILR: ${page.ilr}, Links: ${page.incomingLinks}) [${page.tier}]`,
      value: page.slug,
      checked: page.ilr >= 95 || page.tier === 'money' // Auto-select high performers and auto-categorized money pages
    }));

    // Create choices for supporting pages - show all pages
    const supportingPageChoices = sortedPages.map(page => ({
      name: `${page.title} (ILR: ${page.ilr}, Links: ${page.incomingLinks}) [${page.tier}]`,
      value: page.slug,
      checked: (page.ilr >= 70 && page.ilr < 95) || page.tier === 'supporting' // Auto-select mid-range performers
    }));

    const phase3Questions = [
      {
        type: 'checkbox',
        name: 'moneyPages',
        message: 'Which service/money pages are most important to your business? (showing all pages, [tier] indicates auto-categorization)',
        choices: moneyPageChoices,
        pageSize: 15, // Show 15 items at a time for better navigation
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one money page to focus on.';
          }
          return true;
        }
      },
      {
        type: 'checkbox',
        name: 'supportingPages',
        message: 'Which supporting content pages should receive more internal links? (showing all pages)',
        choices: supportingPageChoices,
        pageSize: 15 // Show 15 items at a time for better navigation
      },
      {
        type: 'list',
        name: 'blogStrategy',
        message: 'How should we handle your blog content optimization?',
        choices: [
          {
            name: 'Focus on high-traffic blog posts first',
            value: 'high-traffic'
          },
          {
            name: 'Create topic clusters around main services',
            value: 'clusters'
          },
          {
            name: 'Optimize all blog posts equally',
            value: 'equal'
          },
          {
            name: 'Skip blog optimization for now',
            value: 'skip'
          }
        ],
        default: 'clusters'
      }
    ];

    const answers = await inquirer.prompt(phase3Questions);
    Object.assign(this.answers, answers);

    // Ask if user wants to add custom URLs not in the CSV
    const addCustom = await this.askForConfirmation(
      '\nWould you like to add custom page URLs that might not be in the CSV data (e.g., pages SEMrush didn\'t crawl)?',
      false
    );

    if (addCustom) {
      this.answers.customMoneyPages = [];
      this.answers.customSupportingPages = [];

      console.log(chalk.cyan('\n💡 Adding custom money pages...'));
      console.log(chalk.gray('Press Enter with empty URL to skip to next section.\n'));
      
      let addMore = true;
      while (addMore) {
        const url = await this.askForInput('Enter custom money page URL (or press Enter to finish):', '');
        if (!url) break;
        
        const title = await this.askForInput('Enter page title:', '');
        if (title) {
          this.answers.customMoneyPages.push({ url, title });
          console.log(chalk.green(`✓ Added: ${title}`));
        }
      }

      console.log(chalk.cyan('\n💡 Adding custom supporting pages...'));
      console.log(chalk.gray('Press Enter with empty URL to skip.\n'));
      
      addMore = true;
      while (addMore) {
        const url = await this.askForInput('Enter custom supporting page URL (or press Enter to finish):', '');
        if (!url) break;
        
        const title = await this.askForInput('Enter page title:', '');
        if (title) {
          this.answers.customSupportingPages.push({ url, title });
          console.log(chalk.green(`✓ Added: ${title}`));
        }
      }

      if (this.answers.customMoneyPages.length > 0 || this.answers.customSupportingPages.length > 0) {
        console.log(chalk.green(`\n✅ Added ${this.answers.customMoneyPages.length} custom money pages and ${this.answers.customSupportingPages.length} custom supporting pages`));
      }
    }
  }

  async runPhase4() {
    console.log(chalk.yellow.bold('\n⚙️  Phase 4: Technical Preferences (5/7)\n'));

    const phase4Questions = [
      {
        type: 'list',
        name: 'wordpressIntegration',
        message: 'Do you use WordPress for your website?',
        choices: [
          {
            name: 'Yes - I use WordPress and want plugin recommendations',
            value: 'yes'
          },
          {
            name: 'No - I use a different CMS/platform',
            value: 'no'
          },
          {
            name: 'Not sure - I want general recommendations',
            value: 'unsure'
          }
        ],
        default: 'yes'
      },
      {
        type: 'list',
        name: 'linkManagement',
        message: 'How do you prefer to manage internal links?',
        choices: [
          {
            name: 'Automated tools (plugins, scripts)',
            value: 'automated'
          },
          {
            name: 'Manual implementation with detailed instructions',
            value: 'manual'
          },
          {
            name: 'Hybrid approach (automated + manual review)',
            value: 'hybrid'
          }
        ],
        default: 'hybrid'
      },
      {
        type: 'checkbox',
        name: 'monitoringTools',
        message: 'Which tools do you currently use for SEO monitoring?',
        choices: [
          {
            name: 'Google Search Console',
            value: 'gsc',
            checked: true
          },
          {
            name: 'Google Analytics',
            value: 'ga',
            checked: true
          },
          {
            name: 'Screaming Frog SEO Spider',
            value: 'screaming-frog',
            checked: false
          },
          {
            name: 'Ahrefs',
            value: 'ahrefs',
            checked: false
          },
          {
            name: 'SEMrush',
            value: 'semrush',
            checked: false
          },
          {
            name: 'None of the above',
            value: 'none',
            checked: false
          }
        ]
      }
    ];

    const answers = await inquirer.prompt(phase4Questions);
    Object.assign(this.answers, answers);

    // Conditional WordPress plugin question
    if (answers.wordpressIntegration === 'yes') {
      const wpQuestion = await inquirer.prompt([
        {
          type: 'list',
          name: 'wordpressPlugin',
          message: 'Which WordPress plugin would you prefer for internal linking?',
          choices: [
            'Link Whisper (Recommended)',
            'Internal Link Juicer',
            'Yoast SEO',
            'Manual implementation'
          ]
        }
      ]);
      Object.assign(this.answers, wpQuestion);
    }
  }

  async runPhase5() {
    console.log(chalk.yellow.bold('\n📊 Phase 5: Report Preferences (6/7)\n'));

    const phase5Questions = [
      {
        type: 'list',
        name: 'reportDetail',
        message: 'How detailed should your optimization report be?',
        choices: [
          {
            name: 'Executive Summary - High-level overview and key actions',
            value: 'summary'
          },
          {
            name: 'Detailed Analysis - Comprehensive report with all findings',
            value: 'detailed'
          },
          {
            name: 'Action-Focused - Prioritized tasks and implementation steps',
            value: 'action-focused'
          }
        ],
        default: 'action-focused'
      },
      {
        type: 'checkbox',
        name: 'outputFormats',
        message: 'How would you like to receive your optimization report?',
        choices: [
          {
            name: 'Console display (terminal output)',
            value: 'console',
            checked: true
          },
          {
            name: 'Markdown file (.md)',
            value: 'markdown',
            checked: true
          },
          {
            name: 'CSV file for spreadsheet analysis',
            value: 'csv',
            checked: false
          },
          {
            name: 'HTML report for web viewing',
            value: 'html',
            checked: false
          }
        ],
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one output format.';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'createActionPlan',
        message: 'Would you like to create a detailed action plan with specific tasks and deadlines?',
        default: true
      }
    ];

    const answers = await inquirer.prompt(phase5Questions);
    Object.assign(this.answers, answers);

    // Conditional advanced metrics question for detailed reports
    if (answers.reportDetail === 'detailed') {
      const advancedQuestion = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'advancedMetrics',
          message: 'Include advanced metrics in your report?',
          choices: [
            'Anchor text distribution analysis',
            'Link equity flow visualization',
            'Competitor comparison data',
            'Historical performance trends'
          ]
        }
      ]);
      Object.assign(this.answers, advancedQuestion);
    }
  }

  async runPhase6() {
    console.log(chalk.yellow.bold('\n✅ Phase 6: Confirmation & Execution (7/7)\n'));

    // Display summary of selections
    this.displaySelectionSummary();

    const confirmQuestion = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmAnalysis',
        message: 'Ready to analyze your website data and generate optimization recommendations?',
        default: true
      }
    ]);

    Object.assign(this.answers, confirmQuestion);

    if (!confirmQuestion.confirmAnalysis) {
      console.log(chalk.yellow('Analysis cancelled. You can run this tool again anytime.'));
      process.exit(0);
    }
  }

  displaySelectionSummary() {
    console.log(chalk.cyan.bold('\n📋 Your Selections Summary:\n'));
    
    console.log(chalk.white('Business Goal:'), chalk.green(this.answers.primaryGoal));
    console.log(chalk.white('Website Type:'), chalk.green(this.answers.websiteType));
    console.log(chalk.white('Timeline:'), chalk.green(this.answers.timeline));
    console.log(chalk.white('Content Capacity:'), chalk.green(this.answers.contentCapacity));
    
    if (this.answers.optimizationAreas) {
      console.log(chalk.white('Focus Areas:'), chalk.green(this.answers.optimizationAreas.join(', ')));
    }
    
    if (this.answers.moneyPages && this.answers.moneyPages.length > 0) {
      const customMoneyCount = this.answers.customMoneyPages ? this.answers.customMoneyPages.length : 0;
      const totalMoney = this.answers.moneyPages.length + customMoneyCount;
      const customText = customMoneyCount > 0 ? chalk.yellow(` (+ ${customMoneyCount} custom URLs)`) : '';
      console.log(chalk.white('Priority Money Pages:'), chalk.green(totalMoney + ' selected') + customText);
    }
    
    if (this.answers.supportingPages && this.answers.supportingPages.length > 0) {
      const customSupportingCount = this.answers.customSupportingPages ? this.answers.customSupportingPages.length : 0;
      const totalSupporting = this.answers.supportingPages.length + customSupportingCount;
      const customText = customSupportingCount > 0 ? chalk.yellow(` (+ ${customSupportingCount} custom URLs)`) : '';
      console.log(chalk.white('Supporting Pages:'), chalk.green(totalSupporting + ' selected') + customText);
    }
    
    if (this.answers.outputFormats) {
      console.log(chalk.white('Report Formats:'), chalk.green(this.answers.outputFormats.join(', ')));
    }
    
    console.log('');
  }

  showProgress(message, current = 0, total = 100) {
    if (!this.progressBar) {
      this.progressBar = new cliProgress.SingleBar({
        format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} | {message}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
      });
      this.progressBar.start(total, current, { message });
    } else {
      this.progressBar.update(current, { message });
    }
  }

  updateProgress(current, message) {
    if (this.progressBar) {
      this.progressBar.update(current, { message });
    }
  }

  completeProgress() {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  displayError(message, error = null) {
    console.log(chalk.red.bold('\n❌ Error: ') + chalk.red(message));
    if (error && process.env.NODE_ENV === 'development') {
      console.log(chalk.gray(error.stack));
    }
  }

  displaySuccess(message) {
    console.log(chalk.green.bold('\n✅ ') + chalk.green(message));
  }

  displayWarning(message) {
    console.log(chalk.yellow.bold('\n⚠️  ') + chalk.yellow(message));
  }

  displayInfo(message) {
    console.log(chalk.blue.bold('\nℹ️  ') + chalk.blue(message));
  }

  async askForConfirmation(message, defaultValue = true) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: message,
        default: defaultValue
      }
    ]);
    return answer.confirmed;
  }

  async askForInput(message, defaultValue = '') {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: message,
        default: defaultValue
      }
    ]);
    return answer.input;
  }

  async askForChoice(message, choices, defaultValue = null) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: message,
        choices: choices,
        default: defaultValue
      }
    ]);
    return answer.choice;
  }

  displayTable(data, title = '') {
    if (title) {
      console.log(chalk.cyan.bold(`\n${title}\n`));
    }
    
    console.table(data);
  }

  displaySeparator(title = '') {
    const line = '─'.repeat(60);
    if (title) {
      console.log(chalk.gray(`\n${line}`));
      console.log(chalk.white.bold(` ${title} `));
      console.log(chalk.gray(`${line}\n`));
    } else {
      console.log(chalk.gray(`\n${line}\n`));
    }
  }

  getUserPreferences() {
    return this.answers;
  }

  clearScreen() {
    console.clear();
  }

  displayWelcomeBanner() {
    console.log(chalk.blue.bold(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🚀 INTERNAL LINKING OPTIMIZATION TOOL 🚀            ║
║                                                            ║
║    Transform your website's internal linking strategy      ║
║    with data-driven insights and actionable recommendations║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `));
  }
}

module.exports = UserInterface;
