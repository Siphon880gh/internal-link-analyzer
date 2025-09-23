# Inquirer Questions Design for Internal Linking Optimization

## Overview
This document outlines the interactive question flow that will guide users through the internal linking optimization process using the CSV data analysis.

---

## Phase 1: Welcome & Business Goals

### 1.1 Welcome Message
```javascript
{
  type: 'confirm',
  name: 'welcome',
  message: 'Welcome to the Internal Linking Optimization Tool! This will analyze your website data and provide strategic recommendations. Ready to begin?',
  default: true
}
```

### 1.2 Business Goal Selection
```javascript
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
}
```

### 1.3 Website Type
```javascript
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
```

---

## Phase 2: Current State Assessment

### 2.1 Optimization Priority
```javascript
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
}
```

### 2.2 Content Creation Capacity
```javascript
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
}
```

### 2.3 Implementation Timeline
```javascript
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
```

---

## Phase 3: Page Priority Selection

### 3.1 Money Pages Focus
```javascript
{
  type: 'checkbox',
  name: 'moneyPages',
  message: 'Which service/money pages are most important to your business?',
  choices: [
    {
      name: 'Bank Cleaning Services (ILR: 100, Links: 64)',
      value: 'bank-cleaning',
      checked: true
    },
    {
      name: 'Medical Facility Cleaning (ILR: 100, Links: 64)',
      value: 'medical-cleaning',
      checked: true
    },
    {
      name: 'Office Building Cleaning (ILR: 100, Links: 64)',
      value: 'office-cleaning',
      checked: true
    },
    {
      name: 'School Cleaning Services (ILR: 100, Links: 64)',
      value: 'school-cleaning',
      checked: true
    },
    {
      name: 'Auto Dealership Cleaning (ILR: 98, Links: 64)',
      value: 'dealership-cleaning',
      checked: false
    },
    {
      name: 'Warehouse Cleaning Services (ILR: 98, Links: 64)',
      value: 'warehouse-cleaning',
      checked: false
    },
    {
      name: 'Church Cleaning Services (ILR: 100, Links: 64)',
      value: 'church-cleaning',
      checked: false
    }
  ],
  validate: function(answer) {
    if (answer.length < 1) {
      return 'Please select at least one money page to focus on.';
    }
    return true;
  }
}
```

### 3.2 Supporting Content Priority
```javascript
{
  type: 'checkbox',
  name: 'supportingPages',
  message: 'Which supporting content pages should receive more internal links?',
  choices: [
    {
      name: 'About Page (ILR: 88, Links: 64)',
      value: 'about',
      checked: true
    },
    {
      name: 'Day Porter Services (ILR: 93, Links: 64)',
      value: 'day-porter',
      checked: true
    },
    {
      name: 'Commercial Carpet Cleaning (ILR: 90, Links: 64)',
      value: 'carpet-cleaning',
      checked: true
    },
    {
      name: 'Commercial Floor Cleaning (ILR: 90, Links: 64)',
      value: 'floor-cleaning',
      checked: true
    },
    {
      name: 'Contact Page (ILR: 71, Links: 63)',
      value: 'contact',
      checked: true
    }
  ]
}
```

### 3.3 Blog Content Strategy
```javascript
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
```

---

## Phase 4: Technical Preferences

### 4.1 WordPress Integration
```javascript
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
}
```

### 4.2 Link Management Preference
```javascript
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
}
```

### 4.3 Monitoring & Tracking
```javascript
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
```

---

## Phase 5: Report Preferences

### 5.1 Report Detail Level
```javascript
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
}
```

### 5.2 Output Format
```javascript
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
}
```

### 5.3 Follow-up Actions
```javascript
{
  type: 'confirm',
  name: 'createActionPlan',
  message: 'Would you like to create a detailed action plan with specific tasks and deadlines?',
  default: true
}
```

---

## Phase 6: Confirmation & Execution

### 6.1 Review Selections
```javascript
{
  type: 'confirm',
  name: 'confirmAnalysis',
  message: 'Ready to analyze your website data and generate optimization recommendations?',
  default: true
}
```

### 6.2 Progress Display
During analysis, show progress bars for:
- CSV data parsing
- Page categorization
- Score calculations
- Report generation

---

## Question Flow Logic

### Conditional Questions
```javascript
// Show WordPress-specific questions only if WordPress is selected
if (answers.wordpressIntegration === 'yes') {
  questions.push({
    type: 'list',
    name: 'wordpressPlugin',
    message: 'Which WordPress plugin would you prefer for internal linking?',
    choices: [
      'Link Whisper (Recommended)',
      'Internal Link Juicer',
      'Yoast SEO',
      'Manual implementation'
    ]
  });
}

// Show advanced options only for detailed reports
if (answers.reportDetail === 'detailed') {
  questions.push({
    type: 'checkbox',
    name: 'advancedMetrics',
    message: 'Include advanced metrics in your report?',
    choices: [
      'Anchor text distribution analysis',
      'Link equity flow visualization',
      'Competitor comparison data',
      'Historical performance trends'
    ]
  });
}
```

### Validation Rules
```javascript
const validateSelections = (answers) => {
  const errors = [];
  
  if (answers.optimizationAreas.length === 0) {
    errors.push('Please select at least one optimization area.');
  }
  
  if (answers.moneyPages.length === 0) {
    errors.push('Please select at least one money page to focus on.');
  }
  
  if (answers.outputFormats.length === 0) {
    errors.push('Please select at least one output format.');
  }
  
  return errors;
};
```

---

## User Experience Enhancements

### Progress Indicators
- Show current phase (1 of 6)
- Display progress bar for each phase
- Provide estimated time remaining

### Help Text
- Add help text for complex questions
- Provide examples for better understanding
- Include tooltips for technical terms

### Error Handling
- Clear error messages for validation failures
- Option to go back and modify previous answers
- Graceful handling of unexpected inputs

### Accessibility
- Clear, descriptive question text
- Logical question ordering
- Consistent formatting and styling

This question flow ensures users provide all necessary information while maintaining a smooth, intuitive experience that guides them toward successful internal linking optimization.
