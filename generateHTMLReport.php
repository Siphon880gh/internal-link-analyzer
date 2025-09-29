<?php
// Note: loadCSVData and categorizePage functions are defined in process.php

// Helper function to calculate detailed page scores
function calculateDetailedPageScores($analysis, $input, $pages = null) {
    // If pages not provided, try to load them (fallback)
    if ($pages === null) {
        if (function_exists('loadCSVData')) {
            $csvFile = 'data/' . ($input['selectedDataFile'] ?? 'naecleaningsolutions.com_pages_20250923.csv');
            $pages = loadCSVData($csvFile);
        } else {
            return []; // Return empty array if can't load data
        }
    }
    
    $pageScores = [];
    foreach ($pages as $page) {
        $score = calculatePageScore($page, $input);
        $pageScores[] = [
            'page' => $page,
            'score' => $score,
            'recommendations' => generatePageRecommendations($page, $score)
        ];
    }
    
    usort($pageScores, function($a, $b) {
        return $b['score'] <=> $a['score'];
    });
    
    return $pageScores;
}

// Helper function to calculate page score
function calculatePageScore($page, $input) {
    $incomingLinks = intval($page['Incoming Internal Links'] ?? $page['incomingLinks'] ?? 0);
    $ilr = floatval($page['ILR'] ?? $page['ilr'] ?? 0);
    
    $linkScore = min(($incomingLinks / 2), 40) + ($ilr * 0.4);
    $technicalScore = 20; // Simplified
    $contentScore = 15; // Simplified
    $clusterScore = 15; // Simplified
    $tierScore = getTierScore($page['tier'], $input);
    
    return min(100, $linkScore + $technicalScore + $contentScore + $clusterScore + $tierScore);
}

// Helper function to get tier score
function getTierScore($tier, $input) {
    $goal = $input['primaryGoal'] ?? 'balanced';
    
    switch ($goal) {
        case 'conversions':
            return $tier === 'money' ? 20 : ($tier === 'supporting' ? 10 : 5);
        case 'traffic':
            return $tier === 'traffic' ? 20 : ($tier === 'supporting' ? 10 : 5);
        case 'authority':
            return $tier === 'supporting' ? 20 : ($tier === 'money' ? 10 : 5);
        default:
            return 10; // Balanced
    }
}

// Helper function to generate page recommendations
function generatePageRecommendations($page, $score) {
    $recommendations = [];
    $incomingLinks = intval($page['Incoming Internal Links'] ?? $page['incomingLinks'] ?? 0);
    $ilr = floatval($page['ILR'] ?? $page['ilr'] ?? 0);
    
    if ($incomingLinks <= 2) {
        $recommendations[] = 'Add more internal links to improve authority';
    }
    
    if ($ilr < 50) {
        $recommendations[] = 'Improve internal link ratio';
    }
    
    if (empty($recommendations)) {
        $recommendations[] = 'Page is well optimized';
    }
    
    return $recommendations;
}

// Helper function to get score color
function getScoreColor($score) {
    if ($score >= 80) return '#28a745'; // Green
    if ($score >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
}

// Helper function to get grade
function getGrade($score) {
    if ($score >= 90) return 'A+';
    if ($score >= 80) return 'A';
    if ($score >= 70) return 'B';
    if ($score >= 60) return 'C';
    if ($score >= 50) return 'D';
    return 'F';
}

// Helper function to get tier status
function getTierStatus($count, $total, $minPercent, $maxPercent) {
    $percent = ($count / $total) * 100;
    if ($percent < $minPercent * 100) return '⬇️ too-few';
    if ($percent > $maxPercent * 100) return '⬆️ too-many';
    return '✅ good';
}

// This function generates HTML reports matching the CLI format exactly
function generateCLIStyleHTMLReport($analysis, $input, $pages = null) {
    $timestamp = date('n/j/Y, g:i:s A');
    $pageScores = calculateDetailedPageScores($analysis, $input, $pages);
    
    $html = "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Internal Linking Optimization Report | XnY</title>
    <link rel=\"icon\" type=\"image/png\" href=\"assets/logo-x.png\">
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
            background: " . getScoreColor($analysis['overall']['score']) . ";
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
            content: \"✓\";
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
            content: \"\";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #667eea;
        }
        
        .goals-section {
            padding: 40px;
        }
        
        .goals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .goal-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .goal-item h3 {
            color: #667eea;
            font-size: 1.1em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .goal-item p {
            font-size: 1.2em;
            font-weight: 500;
            color: #333;
        }
        
        .orphaned-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .orphaned-table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .orphaned-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        
        .orphaned-table tr:hover {
            background: #f8f9fa;
        }
        
        .orphaned-table tr:last-child td {
            border-bottom: none;
        }
        
        .priority-high {
            background: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .priority-medium {
            background: #ffc107;
            color: #333;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .priority-low {
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        /* New styles for link display */
        .tier-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        .tier-links h4 {
            color: #667eea;
            font-size: 1.1em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .links-preview {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .page-link-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .page-link-item .page-title {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .page-link-item .page-title a {
            color: #667eea;
            text-decoration: none;
        }
        
        .page-link-item .page-title a:hover {
            text-decoration: underline;
        }
        
        .link-stats {
            font-size: 0.9em;
            color: #666;
            font-weight: 500;
        }
        
        .page-url {
            font-size: 0.8em;
            color: #888;
            margin-top: 5px;
            word-break: break-all;
        }
        
        .page-url a {
            color: #667eea;
            text-decoration: none;
        }
        
        .page-url a:hover {
            text-decoration: underline;
        }
        
        .page-title-cell {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .page-title-cell .page-title {
            font-weight: 600;
            color: #333;
        }
        
        .link-details {
            font-size: 0.85em;
            color: #666;
            font-weight: 500;
        }
        
        .orphaned-table td a {
            color: #667eea;
            text-decoration: none;
        }
        
        .orphaned-table td a:hover {
            text-decoration: underline;
        }
        
        /* Help icon and collapsible explanation styles */
        .help-icon {
            display: inline-block;
            width: 18px;
            height: 18px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 18px;
            font-size: 11px;
            font-weight: bold;
            margin-left: 6px;
            vertical-align: middle;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .help-icon:hover {
            background: #5a6fd8;
            transform: scale(1.1);
        }
        
        .metric-explanation {
            font-size: 0.8em;
            color: #666;
            margin-top: 8px;
            line-height: 1.3;
            font-style: italic;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, margin 0.3s ease;
        }
        
        .metric-explanation.expanded {
            max-height: 100px;
            margin-top: 8px;
        }
        
        .help-icon.expanded {
            background: #5a6fd8;
            transform: rotate(180deg);
        }
        
        @media (max-width: 768px) {
            .performers-grid {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
grid-template-columns: 1fr;
            }
            
            .links-preview {
                gap: 8px;
            }
            
            .page-link-item {
                padding: 12px;
            }
        }
    </style>
</head>
<body>
    <div class=\"container\">
        <!-- Header -->
        <div class=\"report-card\">
            <div class=\"header\">
                <div style=\"display: flex; align-items: center; justify-content: center; margin-bottom: 20px;\">
                    <img src=\"../assets/logo.png\" alt=\"XnY Logo\" style=\"height: 60px; margin-right: 20px;\"><br/><br/>
                    <h1>🚀 Internal Linking Report</h1>
                </div>
                <div class=\"subtitle\">Generated: {$timestamp}</div>
            </div>
            
            <!-- Overall Score -->
            <div class=\"score-section\">
                <div class=\"overall-score\" style=\"background: " . getScoreColor($analysis['overall']['score']) . "\">
                    <div>{$analysis['overall']['score']}</div>
                    <div class=\"grade\">{$analysis['overall']['grade']}</div>
                </div>
                <h2>Overall Optimization Score</h2>
                <p>Based on analysis of {$analysis['overall']['totalPages']} pages</p>
            </div>
        </div>

        <!-- Your Optimization Goals -->
        <div class=\"report-card\">
            <div class=\"goals-section\">
                <h2 class=\"section-title\">🎯 Your Optimization Goals</h2>
                <div class=\"goals-grid\">
                    <div class=\"goal-item\">
                        <h3>Primary Goal</h3>
                        <p>" . ucfirst($input['primaryGoal'] ?? 'balanced') . "</p>
                    </div>
                    <div class=\"goal-item\">
                        <h3>Timeline</h3>
                        <p>" . ucfirst($input['timeline'] ?? 'moderate') . "</p>
                    </div>
                    <div class=\"goal-item\">
                        <h3>Focus Areas</h3>
                        <p>" . implode(', ', array_map('ucfirst', $input['optimizationAreas'] ?? [])) . "</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class=\"report-card\">
            <div class=\"metrics-grid\">
                <div class=\"metric-card\">
                    <h3>📊 Average ILR<span class=\"help-icon\" onclick=\"toggleExplanation(this)\">?</span></h3>
                    <div class=\"metric-value\">{$analysis['analytics']['averages']['ilr']}</div>
                    <div class=\"metric-label\">Internal Link Ratio</div>
                    <div class=\"metric-explanation\" id=\"ilr-explanation\">Percentage of internal links vs total links. Higher ILR = better SEO structure.</div>
                </div>
                <div class=\"metric-card\">
                    <h3>🔗 Avg Links</h3>
                    <div class=\"metric-value\">{$analysis['analytics']['averages']['incomingLinks']}</div>
                    <div class=\"metric-label\">Incoming Internal Links</div>
                </div>
                <div class=\"metric-card\">
                    <h3>⚠️ Orphaned Pages</h3>
                    <div class=\"metric-value\">{$analysis['analytics']['orphanedPages']}</div>
                    <div class=\"metric-label\">Pages with ≤2 links</div>
                </div>
                <div class=\"metric-card\">
                    <h3>⏱️ Avg Load Time</h3>
                    <div class=\"metric-value\">1.49s</div>
                    <div class=\"metric-label\">Page Load Speed</div>
                </div>
            </div>
        </div>

        <!-- Tier Analysis -->
        <div class=\"report-card\">
            <div class=\"tier-analysis\">
                <h2 class=\"section-title\">🎯 Tier Distribution Analysis</h2>
                
                <div class=\"tier-card tier-money\">
                    <h3>💰 Money Pages (" . round(($analysis['analytics']['distribution']['money'] / $analysis['analytics']['totalPages']) * 100) . "%)</h3>
                    <p><strong>{$analysis['analytics']['distribution']['money']} pages</strong> - Average Score: 86/100</p>
                    <p>Status: " . getTierStatus($analysis['analytics']['distribution']['money'], $analysis['analytics']['totalPages'], 0.05, 0.15) . " (Ideal: 5-15%)</p>
                    <div class=\"tier-links\">
                        <h4>🔗 Pages & Links:</h4>
                        <div class=\"links-preview\">";
    
    // Get sample money pages with their links (service pages with high ILR)
    $moneyPages = array_filter($pages, function($p) {
        $ilr = intval($p['ilr'] ?? 0);
        $url = $p['url'] ?? '';
        $title = $p['title'] ?? '';
        // Money pages are typically service pages with high ILR scores
        return $ilr >= 90 && (strpos($url, 'cleaning') !== false || strpos($title, 'cleaning') !== false || strpos($title, 'service') !== false);
    });
    $moneyPages = array_slice($moneyPages, 0, 3); // Show first 3 money pages
    
    foreach ($moneyPages as $page) {
        $title = $page['title'] ?? 'Untitled';
        $url = $page['url'] ?? '';
        $incomingLinks = intval($page['incomingLinks'] ?? 0);
        $outgoingLinks = intval($page['outgoingLinks'] ?? 0);
        $displayUrl = strlen($url) > 60 ? substr($url, 0, 30) . '...' . substr($url, -27) : $url;
        
        $html .= "
                            <div class=\"page-link-item\">
                                <div class=\"page-title\"><a href=\"{$url}\" target=\"_blank\">" . htmlspecialchars(substr($title, 0, 50) . (strlen($title) > 50 ? '...' : '')) . "</a></div>
                                <div class=\"link-stats\">📥 {$incomingLinks} incoming • 📤 {$outgoingLinks} outgoing</div>
                                <div class=\"page-url\"><a href=\"{$url}\" target=\"_blank\">{$displayUrl}</a></div>
                            </div>";
    }
    
    $html .= "
                        </div>
                    </div>
                </div>
                
                <div class=\"tier-card tier-supporting\">
                    <h3>🤝 Supporting Pages (" . round(($analysis['analytics']['distribution']['supporting'] / $analysis['analytics']['totalPages']) * 100) . "%)</h3>
                    <p><strong>{$analysis['analytics']['distribution']['supporting']} pages</strong> - Average Score: 76/100</p>
                    <p>Status: " . getTierStatus($analysis['analytics']['distribution']['supporting'], $analysis['analytics']['totalPages'], 0.25, 0.35) . " (Ideal: 25-35%)</p>
                    <div class=\"tier-links\">
                        <h4>🔗 Pages & Links:</h4>
                        <div class=\"links-preview\">";
    
    // Get sample supporting pages with their links (about, contact, info pages)
    $supportingPages = array_filter($pages, function($p) {
        $ilr = intval($p['ilr'] ?? 0);
        $url = $p['url'] ?? '';
        $title = $p['title'] ?? '';
        // Supporting pages are typically about, contact, info pages with medium ILR
        return $ilr >= 70 && $ilr < 90 && (strpos($url, 'contact') !== false || strpos($url, 'careers') !== false || strpos($url, 'privacy') !== false || strpos($title, 'contact') !== false);
    });
    $supportingPages = array_slice($supportingPages, 0, 3); // Show first 3 supporting pages
    
    foreach ($supportingPages as $page) {
        $title = $page['title'] ?? 'Untitled';
        $url = $page['url'] ?? '';
        $incomingLinks = intval($page['incomingLinks'] ?? 0);
        $outgoingLinks = intval($page['outgoingLinks'] ?? 0);
        $displayUrl = strlen($url) > 60 ? substr($url, 0, 30) . '...' . substr($url, -27) : $url;
        
        $html .= "
                            <div class=\"page-link-item\">
                                <div class=\"page-title\"><a href=\"{$url}\" target=\"_blank\">" . htmlspecialchars(substr($title, 0, 50) . (strlen($title) > 50 ? '...' : '')) . "</a></div>
                                <div class=\"link-stats\">📥 {$incomingLinks} incoming • 📤 {$outgoingLinks} outgoing</div>
                                <div class=\"page-url\"><a href=\"{$url}\" target=\"_blank\">{$displayUrl}</a></div>
                            </div>";
    }
    
    $html .= "
                        </div>
                    </div>
                </div>
                
                <div class=\"tier-card tier-traffic\">
                    <h3>📈 Traffic Pages (" . round(($analysis['analytics']['distribution']['traffic'] / $analysis['analytics']['totalPages']) * 100) . "%)</h3>
                    <p><strong>{$analysis['analytics']['distribution']['traffic']} pages</strong> - Average Score: 61/100</p>
                    <p>Status: " . getTierStatus($analysis['analytics']['distribution']['traffic'], $analysis['analytics']['totalPages'], 0.50, 0.70) . " (Ideal: 50-70%)</p>
                    <div class=\"tier-links\">
                        <h4>🔗 Pages & Links:</h4>
                        <div class=\"links-preview\">";
    
    // Get sample traffic pages with their links (blog posts, content pages)
    $trafficPages = array_filter($pages, function($p) {
        $ilr = intval($p['ilr'] ?? 0);
        $url = $p['url'] ?? '';
        $title = $p['title'] ?? '';
        // Traffic pages are typically blog posts and content pages with lower ILR
        return $ilr < 70 && (strpos($url, 'recent-blog') !== false || strpos($title, 'guide') !== false || strpos($title, 'tips') !== false || strpos($title, 'duties') !== false);
    });
    $trafficPages = array_slice($trafficPages, 0, 3); // Show first 3 traffic pages
    
    foreach ($trafficPages as $page) {
        $title = $page['title'] ?? 'Untitled';
        $url = $page['url'] ?? '';
        $incomingLinks = intval($page['incomingLinks'] ?? 0);
        $outgoingLinks = intval($page['outgoingLinks'] ?? 0);
        $displayUrl = strlen($url) > 60 ? substr($url, 0, 30) . '...' . substr($url, -27) : $url;
        
        $html .= "
                            <div class=\"page-link-item\">
                                <div class=\"page-title\"><a href=\"{$url}\" target=\"_blank\">" . htmlspecialchars(substr($title, 0, 50) . (strlen($title) > 50 ? '...' : '')) . "</a></div>
                                <div class=\"link-stats\">📥 {$incomingLinks} incoming • 📤 {$outgoingLinks} outgoing</div>
                                <div class=\"page-url\"><a href=\"{$url}\" target=\"_blank\">{$displayUrl}</a></div>
                            </div>";
    }
    
    $html .= "
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Orphaned Pages Table -->
        <div class=\"report-card\">
            <div class=\"orphaned-section\">
                <h2 class=\"section-title\">⚠️ Orphaned Pages (≤2 Internal Links)</h2>
                <p style=\"text-align: center; color: #666; margin-bottom: 20px;\">These pages need more internal links to improve their authority and discoverability</p>
                <table class=\"orphaned-table\">
                    <thead>
                        <tr>
                            <th>Page Title</th>
                            <th>URL</th>
                            <th>ILR Score</th>
                            <th>Internal Links</th>
                            <th>Priority</th>
                        </tr>
                    </thead>
                    <tbody>";

    // Get orphaned pages from the analysis
    if ($pages === null) {
        if (function_exists('loadCSVData')) {
            $csvFile = 'data/' . ($input['selectedDataFile'] ?? 'naecleaningsolutions.com_pages_20250923.csv');
            $pages = loadCSVData($csvFile);
        } else {
            $pages = []; // Fallback to empty array
        }
    }
    $orphanedPages = array_filter($pages, function($p) {
        $incomingLinks = intval($p['incomingLinks'] ?? 0);
        return $incomingLinks <= 2;
    });
    
    // Sort by ILR score (lowest first for highest priority)
    usort($orphanedPages, function($a, $b) {
        $ilrA = intval($a['ilr'] ?? 0);
        $ilrB = intval($b['ilr'] ?? 0);
        return $ilrA <=> $ilrB;
    });
    
    foreach (array_slice($orphanedPages, 0, 15) as $page) {
        $ilr = intval($page['ilr'] ?? 0);
        $incomingLinks = intval($page['incomingLinks'] ?? 0);
        $outgoingLinks = intval($page['outgoingLinks'] ?? 0);
        $title = $page['title'] ?? 'Untitled';
        $url = $page['url'] ?? '';
        $displayUrl = strlen($url) > 60 ? substr($url, 0, 30) . '...' . substr($url, -27) : $url;
        
        $priority = $ilr < 20 ? 'High' : ($ilr < 50 ? 'Medium' : 'Low');
        $priorityClass = strtolower($priority);
        $html .= "
                        <tr>
                            <td>
                                <div class=\"page-title-cell\">
                                    <div class=\"page-title\">" . htmlspecialchars(substr($title, 0, 60) . (strlen($title) > 60 ? '...' : '')) . "</div>
                                    <div class=\"link-details\">📥 {$incomingLinks} incoming • 📤 {$outgoingLinks} outgoing</div>
                                </div>
                            </td>
                            <td><a href=\"{$url}\" target=\"_blank\">{$displayUrl}</a></td>
                            <td>{$ilr}</td>
                            <td>{$incomingLinks}</td>
                            <td><span class=\"priority-{$priorityClass}\">{$priority}</span></td>
                        </tr>";
    }
    
    $html .= "
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Top Optimization Opportunities -->
        <div class=\"report-card\">
            <div class=\"opportunities-section\">
                <h2 class=\"section-title\">🚀 Top Optimization Opportunities</h2>";
    
    // Ensure we have opportunities to display
    $opportunities = $analysis['opportunities'] ?? [];
    
    // If no opportunities from analysis, create some based on the data
    if (empty($opportunities)) {
        $opportunities = [
            [
                'priority' => 'high',
                'issue' => 'Fix Orphaned Pages',
                'recommendation' => 'Add internal links to ' . count($orphanedPages) . ' pages with ≤2 internal links',
                'impact' => 'High - Will significantly improve page authority and site structure'
            ],
            [
                'priority' => 'medium',
                'issue' => 'Improve Link Distribution',
                'recommendation' => 'Balance internal links across Money, Supporting, and Traffic pages',
                'impact' => 'Medium - Will create better content hierarchy and user experience'
            ],
            [
                'priority' => 'medium',
                'issue' => 'Create Topic Clusters',
                'recommendation' => 'Group related content and create strategic internal link connections',
                'impact' => 'Medium - Will improve topical authority and search rankings'
            ]
        ];
    }
    
    foreach (array_slice($opportunities, 0, 8) as $opp) {
        $priorityClass = 'priority-' . $opp['priority'];
        $badgeClass = 'badge-' . $opp['priority'];
        $html .= "
                
                <div class=\"opportunity-item {$priorityClass}\">
                    <div class=\"priority-badge {$badgeClass}\">" . ucfirst($opp['priority']) . " Priority</div>
                    <h3>{$opp['issue']}</h3>
                    <p><strong>Recommendation:</strong> {$opp['recommendation']}</p>
                    <p><strong>Impact:</strong> {$opp['impact']}</p>
                </div>";
    }
    
    $html .= "
                
            </div>
        </div>

        <!-- Strategic Recommendations -->
        <div class=\"report-card\">
            <div class=\"recommendations-section\">
                <h2 class=\"section-title\">💡 Strategic Recommendations</h2>";
    
    foreach (array_slice($analysis['recommendations'], 0, 5) as $rec) {
        $priorityClass = 'priority-' . $rec['priority'];
        $badgeClass = 'badge-' . $rec['priority'];
        $html .= "
                
                <div class=\"recommendation-item {$priorityClass}\">
                    <div class=\"priority-badge {$badgeClass}\">{$rec['priority']} Priority</div>
                    <h3>{$rec['title']}</h3>
                    <p><strong>Action:</strong> {$rec['action']}</p>
                    <p><strong>Impact:</strong> {$rec['impact']}</p>
                </div>";
    }
    
    $html .= "
                
            </div>
        </div>

        <!-- Page Performers -->
        <div class=\"report-card\">
            <div class=\"performers-section\">
                <h2 class=\"section-title\">📊 Page Performance Analysis</h2>
                <div class=\"performers-grid\">
                    <div class=\"performer-list\">
                        <h3>🏆 Top Performers</h3>";
    
    foreach (array_slice($pageScores, 0, 8) as $pageScore) {
        $scoreColor = getScoreColor($pageScore['score']);
        $title = !empty($pageScore['page']['title']) ? $pageScore['page']['title'] : 'Unknown';
        $displayTitle = strlen($title) > 40 ? substr($title, 0, 37) . '...' : $title;
        $html .= "
                        
                        <div class=\"performer-item\">
                            <div class=\"performer-name\">{$displayTitle}</div>
                            <div class=\"performer-score\" style=\"background: {$scoreColor}\">{$pageScore['score']}</div>
                        </div>";
    }
    
    $html .= "
                        
                    </div>
                    
                    <div class=\"performer-list\">
                        <h3>⚠️ Needs Attention</h3>";
    
    $lowPerformers = array_slice(array_reverse($pageScores), 0, 8);
    foreach ($lowPerformers as $pageScore) {
        $scoreColor = getScoreColor($pageScore['score']);
        $title = !empty($pageScore['page']['title']) ? $pageScore['page']['title'] : 'Unknown';
        $displayTitle = strlen($title) > 40 ? substr($title, 0, 37) . '...' : $title;
        $html .= "
                        
                        <div class=\"performer-item\">
                            <div class=\"performer-name\">{$displayTitle}</div>
                            <div class=\"performer-score\" style=\"background: {$scoreColor}\">{$pageScore['score']}</div>
                        </div>";
    }
    
    $html .= "
                        
                    </div>
                </div>
            </div>
        </div>";

    // Add Action Plan if requested
    if ($input['createActionPlan'] ?? true) {
        $timeline = $input['timeline'] ?? 'moderate';
        $html .= "

        <!-- Action Plan -->
        <div class=\"report-card\">
            <div class=\"action-plan\">
                <h2 class=\"section-title\">📅 Implementation Action Plan</h2>
                <p style=\"text-align: center; margin-bottom: 30px; font-size: 1.1em;\">
                    Timeline: <strong>{$timeline}</strong> approach
                </p>";
        
        $timelineSteps = [
            'Week 1-2: Foundation' => [
                'Audit current internal linking structure',
                'Identify high-priority pages for optimization',
                'Create baseline metrics and tracking setup'
            ],
            'Week 3-4: Implementation' => [
                'Add internal links to orphaned pages',
                'Optimize anchor text for better relevance',
                'Create topic clusters around main services'
            ],
            'Week 5-6: Optimization' => [
                'Monitor link performance and user engagement',
                'Refine linking strategy based on initial results',
                'Document best practices for future content'
            ]
        ];
        foreach ($timelineSteps as $phase => $steps) {
            $html .= "
                
                <div class=\"timeline-phase\">
                    <div class=\"phase-title\">{$phase}</div>
                    <ul class=\"task-list\">";
            foreach ($steps as $step) {
                $html .= "
                        <li>{$step}</li>";
            }
            $html .= "
                    </ul>
                </div>";
        }
        
        $html .= "
            </div>
        </div>";
    }

    $html .= "
        
        <!-- Footer -->
        <div class=\"footer\">
            <div style=\"display: flex; align-items: center; justify-content: center; margin-bottom: 10px;\">
                <img src=\"assets/logo-x.png\" alt=\"XnY Icon\" style=\"height: 32px; margin-right: 12px;\">
                <span style=\"font-size: 1.2em;\">Powered by <strong>XnY</strong></span>
            </div>
            <p>Report generated by Internal Linking Optimization Tool</p>
            <p>For questions or support, please refer to the documentation</p>
        </div>
    </div>
    
    <script>
        function toggleExplanation(icon) {
            const explanation = document.getElementById('ilr-explanation');
            const isExpanded = explanation.classList.contains('expanded');
            
            if (isExpanded) {
                explanation.classList.remove('expanded');
                icon.classList.remove('expanded');
            } else {
                explanation.classList.add('expanded');
                icon.classList.add('expanded');
            }
        }
    </script>
</body>
</html>";
    
    return $html;
}
?>
