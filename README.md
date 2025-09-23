# Internal Linking Optimization Tool

## Quick Summary
• **Data-driven CLI tool** that analyzes website CSV data to optimize internal linking strategies
• **6-phase interactive flow** guides users through business goals, page priorities, and technical preferences  
• **Multi-factor scoring system** (0-100) evaluates pages across links, technical health, content quality, and topic clusters
• **Professional reports** in HTML, Markdown, Console, and CSV formats with actionable recommendations
• **3-tier framework implementation** automatically categorizes Money/Supporting/Traffic pages for strategic optimization
• **Real-time analysis** of 55+ pages with progress tracking and visual feedback

> 📚 **For Developers**: See [`context.md`](./context.md) for architecture overview, [`context-data-processing.md`](./context-data-processing.md) for CSV handling, [`context-ui-flow.md`](./context-ui-flow.md) for interactive flow, and [`context-scoring-reports.md`](./context-scoring-reports.md) for analysis algorithms.

---

A comprehensive CLI tool for analyzing and optimizing internal linking strategies based on CSV data analysis. This tool implements the proven 3-tier framework (Money Pages, Supporting Content, Traffic Content) to provide data-driven recommendations for improving your website's internal linking structure.

## 🚀 Features

- **Interactive CLI Interface**: 6-phase question flow to understand your specific needs
- **Data-Driven Analysis**: Processes CSV data to categorize and score all pages
- **3-Tier Framework**: Automatically categorizes pages into Money, Supporting, and Traffic tiers
- **Comprehensive Scoring**: Multi-factor scoring algorithm considering links, technical health, content quality, and more
- **Multiple Report Formats**: Console, HTML, Markdown, and CSV outputs
- **Action Plans**: Customized implementation timelines based on your capacity
- **Topic Cluster Recommendations**: Strategic content grouping suggestions

## 📋 Requirements

- Node.js (version 14 or higher)
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

### Interactive Mode (Recommended)
```bash
npm start
```

This launches the full interactive experience with:
1. **Phase 1**: Business goals and website type
2. **Phase 2**: Current state assessment 
3. **Phase 3**: Page priority selection
4. **Phase 4**: Technical preferences
5. **Phase 5**: Report preferences
6. **Phase 6**: Confirmation and execution

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
├── src/
│   ├── dataProcessor.js     # CSV parsing and categorization
│   ├── scoringEngine.js     # Optimization scoring algorithms
│   ├── userInterface.js     # Interactive CLI interface
│   └── reportGenerator.js   # Multi-format report generation
├── data/
│   └── *.csv               # Your website data files
├── reports/                # Generated reports
├── context/               # Training materials and worksheets
├── index.js              # Main application
└── package.json          # Dependencies and scripts
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

## 🤝 Support

This tool is based on proven internal linking optimization principles. For questions:

1. Review the generated reports
2. Check the context documentation
3. Follow the implementation action plans
4. Monitor progress with your preferred SEO tools

## 📝 License

ISC License - Use freely for your internal linking optimization needs.

---

**Ready to transform your internal linking strategy?** 🚀

Run `npm start` to begin your optimization journey!
