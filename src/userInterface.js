const inquirer = require('inquirer');
const chalk = require('chalk');
const cliProgress = require('cli-progress');

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

  async runPhase1() {
    console.log(chalk.yellow.bold('\n📋 Phase 1: Welcome & Business Goals (1/6)\n'));

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
    console.log(chalk.yellow.bold('\n🔍 Phase 2: Current State Assessment (2/6)\n'));

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
    console.log(chalk.yellow.bold('\n🎯 Phase 3: Page Priority Selection (3/6)\n'));

    // Get actual data for dynamic choices
    const moneyPages = this.dataProcessor.getPagesByCategory('moneyPages');
    const supportingPages = this.dataProcessor.getPagesByCategory('supportingPages');

    const moneyPageChoices = moneyPages.map(page => ({
      name: `${page.title} (ILR: ${page.ilr}, Links: ${page.incomingLinks})`,
      value: page.slug,
      checked: page.ilr >= 98 // Auto-select highest performing pages
    }));

    const supportingPageChoices = supportingPages.map(page => ({
      name: `${page.title} (ILR: ${page.ilr}, Links: ${page.incomingLinks})`,
      value: page.slug,
      checked: page.ilr >= 85 // Auto-select well-performing supporting pages
    }));

    const phase3Questions = [
      {
        type: 'checkbox',
        name: 'moneyPages',
        message: 'Which service/money pages are most important to your business?',
        choices: moneyPageChoices,
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
        message: 'Which supporting content pages should receive more internal links?',
        choices: supportingPageChoices.slice(0, 10) // Limit to top 10 to avoid overwhelming
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
  }

  async runPhase4() {
    console.log(chalk.yellow.bold('\n⚙️  Phase 4: Technical Preferences (4/6)\n'));

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
    console.log(chalk.yellow.bold('\n📊 Phase 5: Report Preferences (5/6)\n'));

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
    console.log(chalk.yellow.bold('\n✅ Phase 6: Confirmation & Execution (6/6)\n'));

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
      console.log(chalk.white('Priority Money Pages:'), chalk.green(this.answers.moneyPages.length + ' selected'));
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
