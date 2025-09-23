# User Interface & Interactive Flow Context

## Overview
The UI layer provides a comprehensive 6-phase interactive CLI experience for gathering user preferences and displaying results with progress tracking and visual feedback.

## Core Module: UserInterface (`src/userInterface.js` - 628 lines)

### Key Responsibilities
- Guide users through 6-phase optimization questionnaire
- Display progress bars and visual feedback
- Present dynamic choices based on actual data
- Collect and validate user preferences
- Show results summaries and confirmations

### 7-Phase Interactive Flow

#### Phase 0: Data File Selection
```javascript
const dataSelectionQuestions = [
  {
    type: 'list',
    name: 'selectedDataFile',
    message: 'Which CSV data file would you like to analyze?',
    choices: csvFiles.map(file => ({
      name: `${file} (${sizeKB} KB, modified: ${modifiedDate})`,
      value: file,
      short: file
    }))
  },
  {
    type: 'confirm', 
    name: 'confirmDataFile',
    message: 'Is this the correct data file for your website analysis?',
    default: true
  }
];

// SEMrush instructions displayed:
// 1. Go to SEMrush → Site Audit
// 2. Click "View Details" on Internal Links  
// 3. Click "Export to CSV" at the top right
// 4. Save the file in the data/ directory
```

#### Phase 1: Welcome & Business Goals
```javascript
const phase1Questions = [
  {
    type: 'confirm',
    name: 'welcome',
    message: 'Ready to begin optimization analysis?',
    default: true
  },
  {
    type: 'list', 
    name: 'primaryGoal',
    choices: [
      'Increase Conversions (Focus on Money Pages)',
      'Boost Organic Traffic (Focus on Content Pages)', 
      'Build Authority & Trust (Focus on Supporting Content)',
      'Balanced Approach (All Content Types)'
    ]
  },
  {
    type: 'list',
    name: 'websiteType', 
    choices: ['Service-based business', 'E-commerce store', 'Content/blog site', ...]
  }
];
```

#### Phase 2: Current State Assessment
```javascript
const phase2Questions = [
  {
    type: 'checkbox',
    name: 'optimizationAreas',
    choices: [
      { name: 'Fix orphaned pages', value: 'orphaned', checked: true },
      { name: 'Improve link distribution', value: 'distribution', checked: true },
      { name: 'Create topic clusters', value: 'clusters', checked: false },
      { name: 'Optimize anchor text', value: 'anchors', checked: false },
      { name: 'Fix technical issues', value: 'technical', checked: true }
    ]
  },
  {
    type: 'list',
    name: 'contentCapacity',
    choices: ['High - Create new content', 'Medium - Modify existing', 'Low - Existing only']
  },
  {
    type: 'list', 
    name: 'timeline',
    choices: ['1 month - Aggressive', '3 months - Moderate', '6 months - Gradual']
  }
];
```

#### Phase 3: Page Priority Selection (Dynamic)
```javascript
// Dynamic choices generated from actual data
const moneyPageChoices = moneyPages.map(page => ({
  name: `${page.title} (ILR: ${page.ilr}, Links: ${page.incomingLinks})`,
  value: page.slug,
  checked: page.ilr >= 98  // Auto-select highest performers
}));

const phase3Questions = [
  {
    type: 'checkbox',
    name: 'moneyPages',
    message: 'Which service/money pages are most important?',
    choices: moneyPageChoices,
    validate: answer => answer.length >= 1 || 'Select at least one money page'
  },
  {
    type: 'checkbox',
    name: 'supportingPages', 
    choices: supportingPageChoices.slice(0, 10)  // Limit to avoid overwhelming
  }
];
```

#### Phase 4: Technical Preferences
```javascript
const phase4Questions = [
  {
    type: 'list',
    name: 'wordpressIntegration',
    choices: ['Yes - Want plugin recommendations', 'No - Different CMS', 'Not sure']
  },
  {
    type: 'list',
    name: 'linkManagement', 
    choices: ['Automated tools', 'Manual implementation', 'Hybrid approach']
  },
  {
    type: 'checkbox',
    name: 'monitoringTools',
    choices: [
      { name: 'Google Search Console', value: 'gsc', checked: true },
      { name: 'Google Analytics', value: 'ga', checked: true },
      { name: 'Screaming Frog SEO Spider', value: 'screaming-frog' },
      { name: 'Ahrefs', value: 'ahrefs' },
      { name: 'SEMrush', value: 'semrush' }
    ]
  }
];

// Conditional follow-up for WordPress users
if (answers.wordpressIntegration === 'yes') {
  const wpQuestion = {
    type: 'list',
    name: 'wordpressPlugin',
    choices: ['Link Whisper (Recommended)', 'Internal Link Juicer', 'Yoast SEO', 'Manual']
  };
}
```

#### Phase 5: Report Preferences
```javascript
const phase5Questions = [
  {
    type: 'list',
    name: 'reportDetail',
    choices: [
      'Executive Summary - High-level overview',
      'Detailed Analysis - Comprehensive report', 
      'Action-Focused - Prioritized tasks'
    ]
  },
  {
    type: 'checkbox',
    name: 'outputFormats',
    choices: [
      { name: 'Console display (terminal)', value: 'console', checked: true },
      { name: 'Markdown file (.md)', value: 'markdown', checked: true },
      { name: 'CSV file for spreadsheets', value: 'csv' },
      { name: 'HTML report for web viewing', value: 'html' }
    ],
    validate: answer => answer.length >= 1 || 'Select at least one format'
  }
];

// Advanced metrics for detailed reports
if (answers.reportDetail === 'detailed') {
  const advancedQuestion = {
    type: 'checkbox',
    name: 'advancedMetrics',
    choices: [
      'Anchor text distribution analysis',
      'Link equity flow visualization', 
      'Competitor comparison data',
      'Historical performance trends'
    ]
  };
}
```

#### Phase 6: Confirmation & Execution
```javascript
// Display user selections summary
displaySelectionSummary() {
  console.log(chalk.cyan.bold('📋 Your Selections Summary:'));
  console.log(chalk.white('Business Goal:'), chalk.green(this.answers.primaryGoal));
  console.log(chalk.white('Timeline:'), chalk.green(this.answers.timeline));
  console.log(chalk.white('Focus Areas:'), chalk.green(this.answers.optimizationAreas.join(', ')));
  // ... more summary items
}

const confirmQuestion = {
  type: 'confirm',
  name: 'confirmAnalysis',
  message: 'Ready to analyze your website data and generate recommendations?',
  default: true
};
```

### Progress Tracking & Visual Feedback

#### Progress Bar Implementation
```javascript
showProgress(message, current = 0, total = 100) {
  this.progressBar = new cliProgress.SingleBar({
    format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} | {message}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true
  });
  this.progressBar.start(total, current, { message });
}

updateProgress(current, message) {
  this.progressBar.update(current, { message });
}
```

#### Visual Elements
```javascript
displayWelcomeBanner() {
  console.log(chalk.blue.bold(`
╔════════════════════════════════════════════════════════════╗
║        🚀 INTERNAL LINKING OPTIMIZATION TOOL 🚀            ║
║    Transform your website's internal linking strategy      ║
╚════════════════════════════════════════════════════════════╝
  `));
}

displayError(message, error = null) {
  console.log(chalk.red.bold('\n❌ Error: ') + chalk.red(message));
}

displaySuccess(message) {
  console.log(chalk.green.bold('\n✅ ') + chalk.green(message));
}
```

### Validation & Error Handling

#### Input Validation Examples
```javascript
// Checkbox validation - require at least one selection
validate: function(answer) {
  if (answer.length < 1) {
    return 'Please select at least one optimization area.';
  }
  return true;
}

// Custom validation for specific business rules
validate: function(answer) {
  if (answer.length < 1) {
    return 'Please select at least one money page to focus on.';
  }
  if (answer.length > 10) {
    return 'Please select no more than 10 pages to maintain focus.';
  }
  return true;
}
```

### User Preference Object Structure
```javascript
// Complete user preferences object after all phases
userPreferences = {
  // Phase 1
  welcome: true,
  primaryGoal: 'conversions',
  websiteType: 'Service-based business',
  
  // Phase 2  
  optimizationAreas: ['orphaned', 'distribution', 'technical'],
  contentCapacity: 'medium',
  timeline: 'moderate',
  
  // Phase 3
  moneyPages: ['bank-cleaning', 'medical-cleaning', 'office-cleaning'],
  supportingPages: ['about', 'day-porter', 'carpet-cleaning'],
  blogStrategy: 'clusters',
  
  // Phase 4
  wordpressIntegration: 'yes',
  wordpressPlugin: 'Link Whisper (Recommended)',
  linkManagement: 'hybrid',
  monitoringTools: ['gsc', 'ga', 'screaming-frog'],
  
  // Phase 5
  reportDetail: 'action-focused',
  outputFormats: ['console', 'html', 'markdown'],
  createActionPlan: true,
  advancedMetrics: ['anchor-text', 'link-equity']
};
```

### Helper Methods

#### User Interaction Utilities
```javascript
async askForConfirmation(message, defaultValue = true) {
  const answer = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmed',
    message: message,
    default: defaultValue
  }]);
  return answer.confirmed;
}

async askForChoice(message, choices, defaultValue = null) {
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'choice', 
    message: message,
    choices: choices,
    default: defaultValue
  }]);
  return answer.choice;
}
```

#### Display Utilities
```javascript
displaySeparator(title = '') {
  const line = '─'.repeat(60);
  if (title) {
    console.log(chalk.gray(`\n${line}`));
    console.log(chalk.white.bold(` ${title} `));
    console.log(chalk.gray(`${line}\n`));
  }
}

displayTable(data, title = '') {
  if (title) console.log(chalk.cyan.bold(`\n${title}\n`));
  console.table(data);
}
```

### Integration with Data Layer
- **Dynamic Choices**: Page selection lists populated from actual CSV data
- **Real-time Validation**: Checks against available pages and realistic limits  
- **Context-aware Questions**: Conditional flows based on previous answers
- **Data-driven Defaults**: Auto-select high-performing pages for user convenience

### Performance & UX Considerations
- **Responsive Design**: Adapts to terminal width
- **Keyboard Navigation**: Full arrow key and shortcut support
- **Progress Feedback**: Visual indicators for long operations
- **Error Recovery**: Graceful handling of invalid inputs
- **Session Persistence**: Maintains state throughout flow
