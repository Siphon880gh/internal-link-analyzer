# Internal Linking Optimization CLI - Context Documentation

## Overview
A comprehensive Node.js CLI tool that analyzes website CSV data to provide strategic internal linking optimization recommendations. Implements the proven 3-tier framework (Money Pages, Supporting Content, Traffic Content) with interactive user flows and professional report generation.

## Tech Stack
- **Runtime**: Node.js (CommonJS modules)
- **CLI Framework**: Inquirer.js v8 (interactive prompts)
- **Data Processing**: csv-parser, lodash
- **UI/Output**: chalk v4 (terminal colors), cli-progress, table
- **File System**: fs-extra
- **Report Formats**: Console, HTML, Markdown, CSV

## Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   index.js      │───▶│  UserInterface   │───▶│ DataProcessor   │
│ (Orchestrator)  │    │ (6-phase flow)   │    │ (CSV + Analytics)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ ReportGenerator │    │  ScoringEngine   │    │ File Outputs    │
│ (Multi-format)  │    │ (Optimization)   │    │ (reports/ dir)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Data Flow
1. **Data Selection** → User selects CSV file from data/ directory (with SEMrush instructions)
2. **CSV Input** → DataProcessor parses & categorizes pages into 3 tiers
3. **Interactive Flow** → UserInterface collects preferences (7 phases)
4. **Analysis** → ScoringEngine calculates optimization scores & opportunities
5. **Output** → ReportGenerator creates console/HTML/markdown/CSV reports

## File Structure
```
/Users/wengffung/dev/web/xny/il/
├── index.js (272 lines)           # Main orchestrator class
├── package.json                   # Dependencies: chalk@4, inquirer@8, etc.
├── README.md (239 lines)          # User documentation
├── src/
│   ├── dataProcessor.js (290 lines)    # CSV parsing & page categorization
│   ├── scoringEngine.js (478 lines)    # Multi-factor optimization scoring
│   ├── userInterface.js (627 lines)    # 6-phase interactive CLI flow
│   └── reportGenerator.js (893 lines)  # Multi-format report generation
├── data/
│   └── naecleaningsolutions.com_pages_20250923.csv  # Sample data (55 pages)
├── reports/                       # Generated reports (timestamped)
└── context/                       # Training materials & worksheets
```

## Key Components

### 1. DataProcessor (`src/dataProcessor.js`)
```javascript
class DataProcessor {
  async parseCSV(filePath)           // Parse CSV → structured page objects
  categorizePages()                  // Auto-classify into 3 tiers
  getAnalytics()                     // Site-wide metrics & statistics
  findOptimizationOpportunities()    // Identify orphaned pages, issues
  generateTopicClusters()            // Content grouping recommendations
}
```

**Key Data Structure:**
```javascript
page = {
  url, title, ilr, incomingLinks, outgoingLinks,
  crawlDepth, httpStatus, loadTime, issues,
  tier: 'money'|'supporting'|'traffic',
  pageType: 'service'|'supporting'|'blog'|'other'
}
```

### 2. ScoringEngine (`src/scoringEngine.js`)
```javascript
class ScoringEngine {
  calculatePageScore(page)           // Multi-factor scoring (0-100)
  calculateSiteScore(preferences)    // Overall site analysis
  // Scoring weights: links(30%), tier(20%), technical(20%), content(15%), cluster(15%)
}
```

**Score Breakdown:**
- **Link Score**: Incoming/outgoing link optimization
- **Tier Score**: Appropriateness for Money/Supporting/Traffic classification
- **Technical Score**: Load time, HTTP status, sitemap inclusion
- **Content Score**: Title/description quality, URL structure
- **Cluster Score**: Topic cluster participation

### 3. UserInterface (`src/userInterface.js`)
```javascript
class UserInterface {
  async runInteractiveFlow()         // 7-phase question sequence
  // Phase 0: Data file selection (CSV from SEMrush)
  // Phase 1: Business goals & website type
  // Phase 2: Current state assessment & optimization areas
  // Phase 3: Page priority selection (dynamic from data)
  // Phase 4: Technical preferences (WordPress, tools)
  // Phase 5: Report preferences & output formats
  // Phase 6: Confirmation & execution
}
```

### 4. ReportGenerator (`src/reportGenerator.js`)
```javascript
class ReportGenerator {
  async generateReports(analysis, preferences)  // Multi-format output
  generateHTMLReport()               // Responsive web report with CSS
  generateMarkdownReport()           // Documentation-friendly format
  generateConsoleReport()            // Terminal display with colors
  generateCSVReport()                // Spreadsheet-compatible data
}
```

## 3-Tier Framework Implementation

### Money Pages (5-15% target)
- **Criteria**: Service pages, ILR ≥ 95, high commercial intent
- **Goal**: 95-100 ILR score, focus on conversions
- **Example**: `/bank-cleaning-services-austin/` (ILR: 100, Links: 64)

### Supporting Pages (25-35% target)  
- **Criteria**: About/contact/testimonials, ILR 70-95, trust-building
- **Goal**: 80-95 ILR score, authority building
- **Example**: `/about/` (ILR: 88, Links: 64)

### Traffic Pages (50-70% target)
- **Criteria**: Blog posts/resources, ILR < 70, educational content  
- **Goal**: 60-80 ILR score, organic traffic growth
- **Example**: Blog posts (ILR: 12-66, Links: 1-5)

## Key Algorithms

### Page Categorization Logic
```javascript
// In dataProcessor.js
determinePageType(url, title) {
  if (serviceKeywords.some(k => url.includes(k))) return 'service';
  if (supportingKeywords.some(k => url.includes(k))) return 'supporting';  
  if (url.includes('/blog/') || title.includes('tips')) return 'blog';
  return 'other';
}
```

### Scoring Algorithm
```javascript
// In scoringEngine.js
calculatePageScore(page) {
  const total = (linkScore * 0.3) + (tierScore * 0.2) + 
                (technicalScore * 0.2) + (contentScore * 0.15) + 
                (clusterScore * 0.15);
  return { total: Math.min(100, total), grade: getGrade(total) };
}
```

## Report Outputs

### HTML Report Features
- **Responsive Design**: Mobile-friendly with gradient styling
- **Score Visualization**: Color-coded performance indicators
- **Interactive Sections**: Collapsible opportunity lists
- **Professional Layout**: Stakeholder-ready presentation

### Console Report Features  
- **Color Coding**: Red/yellow/green priority indicators
- **Progress Bars**: Real-time analysis feedback
- **Structured Display**: Organized sections with separators
- **Action Focus**: Prioritized next steps

## Usage Patterns

### Standard Workflow
```bash
npm start  # Interactive 6-phase flow
# → Data loading & processing
# → User preference collection  
# → Site analysis & scoring
# → Multi-format report generation
```

### Key User Decisions
1. **Primary Goal**: Conversions vs Traffic vs Authority vs Balanced
2. **Optimization Areas**: Orphaned pages, distribution, clusters, technical
3. **Content Capacity**: High/Medium/Low content creation ability
4. **Timeline**: Aggressive (1mo) vs Moderate (3mo) vs Gradual (6mo)
5. **Output Formats**: Console, HTML, Markdown, CSV combinations

## Performance Metrics
- **Data Processing**: ~55 pages in <2 seconds
- **Analysis Speed**: Complete site scoring in <1 second  
- **Report Generation**: HTML/Markdown reports in <500ms
- **Memory Usage**: Efficient streaming CSV processing

## Error Handling
- **Graceful Failures**: Comprehensive try-catch with user-friendly messages
- **Data Validation**: CSV format checking and missing field handling
- **Progress Feedback**: Visual indicators for long-running operations
- **Recovery Options**: Ability to restart phases without data loss

## Extension Points
- **Custom Scoring**: Modular weight system for different business models
- **Additional Formats**: Plugin architecture for new report types  
- **Data Sources**: Adapter pattern for non-CSV inputs
- **Integration APIs**: Hooks for WordPress/CMS plugins

## Dependencies & Compatibility
- **Node.js**: v14+ required
- **Platform**: Cross-platform (macOS, Windows, Linux)
- **Memory**: ~50MB typical usage
- **Storage**: Reports saved to `reports/` with timestamps
