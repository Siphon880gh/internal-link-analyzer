<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get action from either GET or POST
$action = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
}

switch ($action) {
    case 'search_pages':
        searchPages();
        break;
    case 'generate_report':
        generateReport();
        break;
    default:
        echo json_encode(['error' => 'Invalid action', 'method' => $_SERVER['REQUEST_METHOD'], 'received_action' => $action]);
        break;
}

function searchPages() {
    $query = $_GET['query'] ?? '';
    $type = $_GET['type'] ?? 'all'; // 'money', 'supporting', 'all'
    
    // For empty query, return all pages (for local data loading)
    $searchAll = strlen($query) === 0;
    
    if (!$searchAll && strlen($query) < 2) {
        echo json_encode(['suggestions' => []]);
        return;
    }
    
    // Read CSV file
    $csvFile = 'data/naecleaningsolutions.com_pages_20250923.csv';
    if (!file_exists($csvFile)) {
        echo json_encode(['error' => 'CSV file not found']);
        return;
    }
    
    $pages = [];
    if (($handle = fopen($csvFile, 'r')) !== FALSE) {
        $headers = fgetcsv($handle, 0, ',', '"', '\\');
        while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== FALSE) {
            $page = array_combine($headers, $data);
            
            // Categorize page based on ILR and URL patterns
            $tier = categorizePage($page);
            
            // Filter by type if specified
            if ($type !== 'all' && $tier !== $type) {
                continue;
            }
            
            // Search in title and URL (or include all if searchAll is true)
            $title = $page['Page Title'] ?? '';
            $url = $page['Page URL'] ?? '';
            
            $matches = $searchAll || stripos($title, $query) !== false || stripos($url, $query) !== false;
            
            if ($matches && !empty($title)) { // Exclude pages with empty titles
                $pages[] = [
                    'title' => $title,
                    'url' => $url,
                    'ilr' => floatval($page['ILR'] ?? 0),
                    'incomingLinks' => intval($page['Incoming Internal Links'] ?? 0),
                    'tier' => $tier,
                    'slug' => generateSlug($url)
                ];
            }
        }
        fclose($handle);
    }
    
    // Sort by relevance (ILR score)
    usort($pages, function($a, $b) {
        return $b['ilr'] <=> $a['ilr'];
    });
    
    // Limit to 15 suggestions for search, or 100 for loading all data
    $limit = $searchAll ? 100 : 15;
    $pages = array_slice($pages, 0, $limit);
    
    echo json_encode(['suggestions' => $pages]);
}

function generateReport() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['error' => 'Invalid input data']);
        return;
    }
    
    // Simulate analysis based on user selections
    $analysis = performAnalysis($input);
    
    // Generate reports
    $reports = [];
    $timestamp = date('Y-m-d\TH-i-s');
    
    // Ensure reports directory exists
    if (!file_exists('reports')) {
        mkdir('reports', 0755, true);
    }
    
    // Generate HTML report using CLI-style format
    if (in_array('html', $input['outputFormats'] ?? [])) {
        include_once 'generateHTMLReport.php';
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, $analysis['pages'] ?? null);
        $htmlFile = "reports/internal-linking-report-{$timestamp}.html";
        file_put_contents($htmlFile, $htmlContent);
        $reports['html'] = [
            'path' => $htmlFile,
            'content' => $htmlContent,
            'size' => strlen($htmlContent)
        ];
    }
    
    // Generate CSV report
    if (in_array('csv', $input['outputFormats'] ?? [])) {
        $csvContent = generateCSVReport($analysis, $input);
        $csvFile = "reports/internal-linking-data-{$timestamp}.csv";
        file_put_contents($csvFile, $csvContent);
        $reports['csv'] = [
            'path' => $csvFile,
            'content' => $csvContent,
            'size' => strlen($csvContent)
        ];
    }
    
    // Generate Markdown report
    if (in_array('markdown', $input['outputFormats'] ?? [])) {
        $markdownContent = generateMarkdownReport($analysis, $input);
        $markdownFile = "reports/internal-linking-report-{$timestamp}.md";
        file_put_contents($markdownFile, $markdownContent);
        $reports['markdown'] = [
            'path' => $markdownFile,
            'content' => $markdownContent,
            'size' => strlen($markdownContent)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'analysis' => $analysis,
        'reports' => $reports,
        'timestamp' => $timestamp
    ]);
}

// Include all the helper functions from the original file
function categorizePage($page) {
    $url = strtolower($page['Page URL'] ?? '');
    $title = strtolower($page['Page Title'] ?? '');
    $ilr = floatval($page['ILR'] ?? 0);
    
    // Service pages (Money Pages)
    $serviceKeywords = [
        'cleaning-services', 'bank-cleaning', 'medical-facility', 'office-building',
        'school-cleaning', 'church-cleaning', 'auto-dealership', 'warehouse-cleaning'
    ];
    
    foreach ($serviceKeywords as $keyword) {
        if (strpos($url, $keyword) !== false) {
            return 'money';
        }
    }
    
    // Supporting pages
    $supportingKeywords = ['about', 'contact', 'day-porter', 'carpet-cleaning', 'floor-cleaning'];
    foreach ($supportingKeywords as $keyword) {
        if (strpos($url, $keyword) !== false) {
            return 'supporting';
        }
    }
    
    // Based on ILR score
    if ($ilr >= 95) return 'money';
    if ($ilr >= 70) return 'supporting';
    return 'traffic';
}

function generateSlug($url) {
    $path = parse_url($url, PHP_URL_PATH);
    $slug = trim($path, '/');
    $parts = explode('/', $slug);
    return end($parts) ?: 'homepage';
}

function performAnalysis($input) {
    // Load CSV data
    $csvFile = 'data/' . ($input['selectedDataFile'] ?? 'naecleaningsolutions.com_pages_20250923.csv');
    $pages = loadCSVData($csvFile);
    
    // Calculate basic analytics
    $totalPages = count($pages);
    $moneyPages = array_filter($pages, fn($p) => $p['tier'] === 'money');
    $supportingPages = array_filter($pages, fn($p) => $p['tier'] === 'supporting');
    $trafficPages = array_filter($pages, fn($p) => $p['tier'] === 'traffic');
    $orphanedPages = array_filter($pages, fn($p) => intval($p['incomingLinks']) <= 2);
    
    $avgILR = $totalPages > 0 ? array_sum(array_column($pages, 'ilr')) / $totalPages : 0;
    $avgIncomingLinks = $totalPages > 0 ? array_sum(array_column($pages, 'incomingLinks')) / $totalPages : 0;
    
    // Generate opportunities based on user selections
    $opportunities = [];
    
    if (in_array('orphaned', $input['optimizationAreas'] ?? [])) {
        foreach (array_slice($orphanedPages, 0, 8) as $page) {
            $opportunities[] = [
                'type' => 'orphaned',
                'priority' => 'high',
                'page' => $page,
                'issue' => 'Page has very few internal links',
                'recommendation' => "Add 5-10 internal links from related pages to {$page['title']}",
                'impact' => 'High - Will significantly improve page authority'
            ];
        }
    }
    
    if (in_array('distribution', $input['optimizationAreas'] ?? [])) {
        $opportunities[] = [
            'type' => 'distribution',
            'priority' => 'medium',
            'issue' => 'Uneven link distribution across content tiers',
            'recommendation' => 'Redistribute some links from over-linked pages to under-linked pages',
            'impact' => 'Medium - Will improve overall site architecture'
        ];
    }
    
    // Calculate overall score
    $overallScore = calculateOverallScore($pages, $input);
    
    return [
        'overall' => [
            'score' => $overallScore,
            'grade' => ($overallScore >= 90 ? 'A+' : ($overallScore >= 80 ? 'A' : ($overallScore >= 70 ? 'B' : ($overallScore >= 60 ? 'C' : ($overallScore >= 50 ? 'D' : 'F'))))),
            'totalPages' => $totalPages
        ],
        'analytics' => [
            'totalPages' => $totalPages,
            'orphanedPages' => count($orphanedPages),
            'averages' => [
                'ilr' => round($avgILR, 2),
                'incomingLinks' => round($avgIncomingLinks, 2)
            ],
            'distribution' => [
                'money' => count($moneyPages),
                'supporting' => count($supportingPages),
                'traffic' => count($trafficPages)
            ]
        ],
        'opportunities' => $opportunities,
        'recommendations' => generateRecommendations($input, $pages),
        'userSelections' => $input,
        'pages' => $pages  // Include pages data for HTML report generation
    ];
}

function loadCSVData($csvFile) {
    $pages = [];
    if (file_exists($csvFile) && ($handle = fopen($csvFile, 'r')) !== FALSE) {
        $headers = fgetcsv($handle, 0, ',', '"', '\\');
        while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== FALSE) {
            $page = array_combine($headers, $data);
            $pages[] = [
                'url' => $page['Page URL'] ?? '',
                'title' => $page['Page Title'] ?? '',
                'ilr' => floatval($page['ILR'] ?? 0),
                'incomingLinks' => intval($page['Incoming Internal Links'] ?? 0),
                'outgoingLinks' => intval($page['Outgoing Internal Links'] ?? 0),
                'loadTime' => floatval($page['Page (HTML) Load Time, sec'] ?? 0),
                'issues' => intval($page['Issues'] ?? 0),
                'tier' => categorizePage($page)
            ];
        }
        fclose($handle);
    }
    return $pages;
}

function calculateOverallScore($pages, $input) {
    if (empty($pages)) return 0;
    
    $baseScore = 60; // Base score
    
    // Bonus for good practices selected
    if (in_array('orphaned', $input['optimizationAreas'] ?? [])) $baseScore += 5;
    if (in_array('distribution', $input['optimizationAreas'] ?? [])) $baseScore += 5;
    if (in_array('clusters', $input['optimizationAreas'] ?? [])) $baseScore += 5;
    
    // Adjust based on goals
    switch ($input['primaryGoal'] ?? 'balanced') {
        case 'conversions':
            $moneyPages = array_filter($pages, fn($p) => $p['tier'] === 'money');
            $avgMoneyILR = !empty($moneyPages) ? array_sum(array_column($moneyPages, 'ilr')) / count($moneyPages) : 0;
            $baseScore += ($avgMoneyILR > 90) ? 10 : 0;
            break;
        case 'traffic':
            $trafficPages = array_filter($pages, fn($p) => $p['tier'] === 'traffic');
            $baseScore += (count($trafficPages) > count($pages) * 0.5) ? 10 : 0;
            break;
    }
    
    return min(100, $baseScore);
}

// getGrade function moved to generateHTMLReport.php

function generateRecommendations($input, $pages) {
    $recommendations = [];
    
    // Goal-based recommendations
    switch ($input['primaryGoal'] ?? 'balanced') {
        case 'conversions':
            $recommendations[] = [
                'priority' => 'high',
                'title' => 'Optimize Money Pages for Conversions',
                'action' => 'Focus internal linking on your highest-converting service pages',
                'impact' => 'Direct impact on business revenue'
            ];
            break;
        case 'traffic':
            $recommendations[] = [
                'priority' => 'high',
                'title' => 'Boost Content Page Authority',
                'action' => 'Add more internal links to your blog posts and informational content',
                'impact' => 'Will improve organic search rankings and traffic'
            ];
            break;
    }
    
    // Add orphaned pages recommendation
    $orphanedPages = array_filter($pages, fn($p) => intval($p['incomingLinks']) <= 2);
    if (count($orphanedPages) > 0) {
        $recommendations[] = [
            'priority' => 'high',
            'title' => 'Fix Orphaned Pages',
            'action' => 'Add internal links to ' . count($orphanedPages) . ' orphaned pages',
            'impact' => 'Will improve overall site structure and SEO'
        ];
    }
    
    // Add low-scoring pages recommendation (simplified scoring)
    $lowScorePages = array_filter($pages, function($p) {
        $incomingLinks = intval($p['Incoming Internal Links'] ?? $p['incomingLinks'] ?? 0);
        $ilr = floatval($p['ILR'] ?? $p['ilr'] ?? 0);
        $simpleScore = min(($incomingLinks / 2), 40) + ($ilr * 0.4);
        return $simpleScore < 50;
    });
    if (count($lowScorePages) > 0) {
        $recommendations[] = [
            'priority' => 'medium',
            'title' => 'Improve Low-Scoring Pages',
            'action' => 'Optimize ' . count($lowScorePages) . ' pages with scores below 50',
            'impact' => 'Will raise overall site quality and search performance'
        ];
    }
    
    return $recommendations;
}

function generateHTMLReport($analysis, $input) {
    // Include the comprehensive report generator
    include_once 'generateHTMLReport.php';
    return generateCLIStyleHTMLReport($analysis, $input, $analysis['pages'] ?? null);
}

function generateCSVReport($analysis, $input) {
    $csv = "Page Type,Count,Percentage,Average ILR,Status\n";
    $total = $analysis['analytics']['totalPages'];
    
    $csv .= "Money Pages,{$analysis['analytics']['distribution']['money']}," . 
           round(($analysis['analytics']['distribution']['money'] / $total) * 100, 1) . "%,95+,Good\n";
    $csv .= "Supporting Pages,{$analysis['analytics']['distribution']['supporting']}," . 
           round(($analysis['analytics']['distribution']['supporting'] / $total) * 100, 1) . "%,70-95,Good\n";
    $csv .= "Traffic Pages,{$analysis['analytics']['distribution']['traffic']}," . 
           round(($analysis['analytics']['distribution']['traffic'] / $total) * 100, 1) . "%,<70,Needs Work\n";
    
    $csv .= "\nOpportunities\n";
    $csv .= "Priority,Issue,Recommendation,Impact\n";
    
    foreach ($analysis['opportunities'] as $opp) {
        $csv .= "\"{$opp['priority']}\",\"{$opp['issue']}\",\"{$opp['recommendation']}\",\"{$opp['impact']}\"\n";
    }
    
    return $csv;
}

function generateMarkdownReport($analysis, $input) {
    $timestamp = date('F j, Y \a\t g:i A');
    
    return "# Internal Linking Optimization Report

Generated: {$timestamp}

## Executive Summary

### Overall Score: {$analysis['overall']['score']}/100 ({$analysis['overall']['grade']})

Your website has been analyzed for internal linking optimization opportunities. Based on {$analysis['overall']['totalPages']} pages analyzed, here are the key findings:

**Page Distribution:**
- Money Pages: {$analysis['analytics']['distribution']['money']} pages
- Supporting Pages: {$analysis['analytics']['distribution']['supporting']} pages  
- Traffic Pages: {$analysis['analytics']['distribution']['traffic']} pages

**Key Metrics:**
- Average ILR Score: {$analysis['analytics']['averages']['ilr']}
- Orphaned Pages: {$analysis['analytics']['orphanedPages']}

## Your Optimization Goals

- **Primary Goal:** " . ucfirst($input['primaryGoal'] ?? 'balanced') . "
- **Timeline:** " . ucfirst($input['timeline'] ?? 'moderate') . "
- **Focus Areas:** " . implode(', ', $input['optimizationAreas'] ?? []) . "

## Top Optimization Opportunities

" . implode("\n\n", array_map(function($opp, $i) {
    return "### " . ($i + 1) . ". {$opp['issue']} [" . strtoupper($opp['priority']) . " Priority]

**Recommendation:** {$opp['recommendation']}

**Impact:** {$opp['impact']}";
}, $analysis['opportunities'], array_keys($analysis['opportunities']))) . "

## Next Steps

1. Focus on high-priority opportunities first
2. Implement changes based on your selected timeline
3. Monitor progress using your preferred SEO tools
4. Review and adjust strategy based on results

---

*Report generated by Internal Linking Optimization Tool*

**Powered by XnY** - Internal Linking Optimization Solutions";
}

// Note: Helper functions for HTML report generation are now in generateHTMLReport.php
// Removed duplicate functions to prevent redeclaration errors
?>
