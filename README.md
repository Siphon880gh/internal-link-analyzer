# Internal Linking Optimization Tool

## Quick Summary
• **Dual-interface optimization system** with both CLI and modern HTML wizard for internal linking analysis
• **7-phase interactive flow** covering data selection, business goals, page priorities, and technical preferences
• **Multi-factor scoring system** (0-100) evaluates pages across links, technical health, content quality, and topic clusters  
• **Professional reports** in HTML, Markdown, Console, and CSV formats with actionable recommendations
• **3-tier framework implementation** automatically categorizes Money/Supporting/Traffic pages for strategic optimization
• **Web wizard interface** with Tailwind CSS, XnY branding, autocomplete, and real PHP backend processing
• **Streamlined data selection** with single CSV file option and SEMrush integration instructions

> 📚 **For Developers**: See [`context.md`](./context.md) for architecture overview, [`context-data-processing.md`](./context-data-processing.md) for CSV handling, [`context-ui-flow.md`](./context-ui-flow.md) for CLI flow, [`context-html-wizard.md`](./context-html-wizard.md) for web wizard, and [`context-scoring-reports.md`](./context-scoring-reports.md) for analysis algorithms.

---

A comprehensive CLI tool for analyzing and optimizing internal linking strategies based on CSV data analysis. This tool implements the proven 3-tier framework (Money Pages, Supporting Content, Traffic Content) to provide data-driven recommendations for improving your website's internal linking structure.

## 🚀 Features

### Dual Interface Options
- **Interactive CLI**: 7-phase command-line wizard with progress tracking
- **HTML Wizard**: Modern web interface with Tailwind CSS and responsive design

### Core Functionality  
- **Data-Driven Analysis**: Processes CSV data to categorize and score all pages
- **3-Tier Framework**: Automatically categorizes pages into Money, Supporting, and Traffic tiers
- **Comprehensive Scoring**: Multi-factor scoring algorithm considering links, technical health, content quality, and more
- **Multiple Report Formats**: Console, HTML, Markdown, and CSV outputs
- **Action Plans**: Customized implementation timelines based on your capacity
- **Topic Cluster Recommendations**: Strategic content grouping suggestions

## 📋 Requirements

- **CLI Mode**: Node.js (version 14 or higher)
- **Web Mode**: PHP (version 7.4 or higher)
- CSV file with website page data

## 🛠️ Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:
```bash
npm install
```

## 📊 CSV Data Format

Your CSV file should include these columns:
- `Page URL` - Full URL of each page
- `Page Title` - Title of the page
- `ILR` - Internal Link Ratio (0-100)
- `Incoming Internal Links` - Number of internal links pointing to the page
- `Outgoing Internal Links` - Number of internal links from the page
- `Crawl Depth` - How deep the page is in site structure
- `HTTP Status Code` - Response code (200, 404, etc.)
- `Page (HTML) Load Time, sec` - Page load time in seconds
- `Issues` - Number of technical issues
- `In sitemap` - Whether page is in XML sitemap (1/0)
- `Description` - Meta description or page summary

## 🎯 Usage

### CLI Mode (Recommended for Analysis)
```bash
npm start
```

This launches the full interactive CLI experience with:
1. **Phase 0**: Data file selection (CSV from SEMrush)
2. **Phase 1**: Business goals and website type
3. **Phase 2**: Current state assessment 
4. **Phase 3**: Page priority selection
5. **Phase 4**: Technical preferences
6. **Phase 5**: Report preferences
7. **Phase 6**: Confirmation and execution

### Web Wizard Mode (Recommended for Presentations)
```bash
php -S localhost:8000
open http://localhost:8000/index.html
```

Features a modern HTML wizard with:
- **Visual Progress**: Step-by-step indicators with completion status
- **Previous Steps Sidebar**: Real-time summary of selections
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Form Validation**: Ensures all required fields are completed
- **Professional UI**: Tailwind CSS styling with XnY branding
- **Smart Autocomplete**: Fast page search with local data loading
- **Real Reports**: Actual HTML/CSV generation via PHP backend

### Quick Demo/Test
```bash
npm test
```

Runs a quick test with sample preferences to verify the system works.

## 📊 Report Formats

### Console Report
- Real-time display in terminal
- Color-coded scores and priorities
- Interactive progress bars

### HTML Report
- Beautiful, responsive web interface
- Visual score cards and charts
- Professional presentation for stakeholders
- Automatically opens in browser

### Markdown Report
- Detailed analysis in markdown format
- Perfect for documentation
- Easy to share and version control

### CSV Export
- Raw data for further analysis
- Import into spreadsheets
- Custom reporting and filtering

## 🎯 Scoring System

The tool uses a comprehensive scoring algorithm (0-100) based on:

- **Link Score (30%)**: Internal link count and distribution
- **Tier Score (20%)**: Appropriateness for page tier
- **Technical Score (20%)**: Load time, status codes, issues
- **Content Score (15%)**: Title, description, URL quality
- **Cluster Score (15%)**: Topic cluster effectiveness

### Grade Scale
- **A+ (90-100)**: Excellent optimization
- **A (80-89)**: Good performance
- **B (70-79)**: Decent, room for improvement
- **C (60-69)**: Needs attention
- **D (50-59)**: Poor performance
- **F (<50)**: Critical issues

## 📈 3-Tier Framework

### Money Pages (5-15% of content)
- Service/product pages
- High commercial intent
- Target: 95-100 ILR score
- Focus: Conversion optimization

### Supporting Pages (25-35% of content)
- About, contact, testimonials
- Trust-building content
- Target: 80-95 ILR score
- Focus: Authority building

### Traffic Pages (50-70% of content)
- Blog posts, resources, guides
- Educational content
- Target: 60-80 ILR score
- Focus: Organic traffic growth

## 🔧 Optimization Opportunities

The tool identifies and prioritizes:

- **Orphaned Pages**: Pages with minimal internal links
- **Link Distribution Issues**: Imbalanced link allocation
- **Technical Problems**: Slow loading, 404s, missing sitemaps
- **Content Gaps**: Poor titles, descriptions, URL structure
- **Cluster Opportunities**: Topic grouping potential

## 📅 Implementation Timelines

### Aggressive (1 month)
- 8 tasks per week
- Quick wins focus
- High-impact changes first

### Moderate (3 months)
- 4 tasks per week
- Balanced approach
- Sustainable progress

### Gradual (6 months)
- 2 tasks per week
- Long-term strategy
- Minimal disruption

## 🛠️ WordPress Integration

For WordPress sites, the tool recommends:
- **Link Whisper** (Premium, AI-powered)
- **Internal Link Juicer** (Free, automatic)
- **Yoast SEO** (Basic internal linking)
- **Manual implementation** (Custom approach)

## 📊 Monitoring Integration

Supports tracking with:
- Google Search Console
- Google Analytics
- Screaming Frog SEO Spider
- Ahrefs
- SEMrush

## 📁 Project Structure

```
/
├── index.js (274 lines)              # CLI orchestrator
├── index.html (1230 lines)           # HTML wizard interface
├── process.php (455 lines)           # PHP backend for web interface
├── generateHTMLReport.php (813 lines) # CLI-style HTML report generation
├── src/
│   ├── dataProcessor.js (290 lines)  # CSV parsing and categorization
│   ├── scoringEngine.js (478 lines)  # Optimization scoring algorithms
│   ├── userInterface.js (700 lines)  # Interactive CLI interface
│   └── reportGenerator.js (893 lines) # Multi-format report generation
├── data/
│   └── *.csv                        # Your website data files
├── reports/                         # Generated reports (timestamped)
├── context/                        # Training materials and worksheets
└── package.json                    # Dependencies and scripts
```

## 🎨 Sample Output

```
╔════════════════════════════════════════════════════════════╗
║                INTERNAL LINKING REPORT CARD                ║
╚════════════════════════════════════════════════════════════╝

📊 OVERALL SITE SCORE
Score: 71/100 ⭐⭐⭐⭐ (Grade: B)
Total Pages Analyzed: 55

📈 TIER DISTRIBUTION
• Money Pages: 7 (13%) - ✅ good
• Supporting Pages: 23 (42%) - ⬆️ too-many  
• Traffic Pages: 25 (45%) - ⬇️ too-few

🚀 TOP OPTIMIZATION OPPORTUNITIES
1. [HIGH] Fix 17 orphaned pages with minimal internal links
2. [HIGH] Improve link distribution across content tiers
3. [MEDIUM] Create topic clusters around main services
```

## 🧪 Testing & Coverage

This project includes a comprehensive automated test suite with high coverage across both JavaScript/Node.js and PHP components.

### Test Framework Setup

**JavaScript/Node.js Testing:**
- **Framework**: Jest with coverage thresholds
- **Coverage Requirements**: Statements 90%, Branches 85%, Functions 90%, Lines 90%
- **Output Formats**: Text, HTML, LCOV

**PHP Testing:**
- **Framework**: PHPUnit with Xdebug coverage
- **Coverage Requirements**: Similar thresholds to JavaScript
- **Output Formats**: Text summary, HTML report, Clover XML

### Running Tests

#### JavaScript Tests
```bash
# Run all JavaScript tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

#### PHP Tests
```bash
# Install PHP dependencies
composer install

# Run all PHP tests
composer test

# Run tests with coverage
composer test:cov

# Run tests for CI
composer test:ci
```

#### API Tests
```bash
# Start PHP server
php -S localhost:8000 &

# Run API tests
npm test -- tests/api.test.js
```

### Test Coverage

The test suite covers:

#### JavaScript Components
- **DataProcessor**: CSV parsing, page categorization, analytics, optimization opportunities
- **ScoringEngine**: Page scoring algorithms, tier analysis, recommendations
- **UserInterface**: Interactive CLI flow, progress tracking, input validation
- **ReportGenerator**: Multi-format report generation, HTML/CSS/JS output
- **Main Application**: Complete workflow orchestration, error handling

#### PHP Components
- **process.php**: API endpoints, data processing, report generation
- **generateHTMLReport.php**: HTML report generation, page scoring, recommendations
- **Helper Functions**: Page categorization, slug generation, score calculation

#### API Endpoints
- **search_pages**: Page search and filtering functionality
- **generate_report**: Report generation with multiple formats
- **Error Handling**: Invalid inputs, file not found, malformed data

### Coverage Reports

After running tests, coverage reports are available in:

- **JavaScript**: `coverage/` directory (HTML report at `coverage/lcov-report/index.html`)
- **PHP**: `coverage/` directory (HTML report at `coverage/index.html`)
- **LCOV**: `coverage/lcov.info` (for CI integration)
- **Clover XML**: `clover.xml` (for CI integration)

### CI/CD Integration

The project includes GitHub Actions workflows that:

1. **Run tests** on multiple Node.js and PHP versions
2. **Generate coverage reports** in multiple formats
3. **Upload artifacts** for review and analysis
4. **Comment on PRs** with coverage summaries
5. **Security scanning** with Trivy vulnerability scanner
6. **Code linting** with ESLint and PHP CodeSniffer

### Test Data

Test data is automatically generated during CI runs and includes:
- Sample CSV files with realistic page data
- Mock user preferences and configurations
- Edge cases and error conditions
- Custom page scenarios

### Coverage Thresholds

The build will fail if coverage falls below:
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Viewing Coverage Reports

1. **Local Development**: Run `npm run test:cov` or `composer test:cov`
2. **CI/CD**: Download artifacts from GitHub Actions
3. **HTML Reports**: Open `coverage/lcov-report/index.html` (JS) or `coverage/index.html` (PHP)

### Adding New Tests

When adding new features:

1. **Write tests first** (TDD approach)
2. **Cover edge cases** and error conditions
3. **Mock external dependencies** (file system, network calls)
4. **Test both success and failure paths**
5. **Maintain coverage thresholds**

### Test Commands Reference

```bash
# JavaScript
npm test                    # Run tests
npm run test:cov           # Run with coverage
npm run test:watch         # Watch mode
npm run test:ci            # CI mode

# PHP
composer test              # Run tests
composer test:cov          # Run with coverage
composer test:ci           # CI mode

# API Testing
php -S localhost:8000 &    # Start server
npm test -- tests/api.test.js  # Test API endpoints
```

## 🤝 Support

This tool is based on proven internal linking optimization principles. For questions:

1. Review the generated reports
2. Check the context documentation
3. Follow the implementation action plans
4. Monitor progress with your preferred SEO tools
5. Run the test suite to verify functionality

## 📝 License

ISC License - Use freely for your internal linking optimization needs.

---

**Ready to transform your internal linking strategy?** 🚀

Run `npm start` to begin your optimization journey!
