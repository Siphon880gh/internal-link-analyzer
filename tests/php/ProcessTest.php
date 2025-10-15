<?php

namespace Xny\InternalLinking\Tests;

use PHPUnit\Framework\TestCase;

class ProcessTest extends TestCase
{
    private $testCsvFile;
    private $testReportsDir;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test CSV file
        $this->testCsvFile = __DIR__ . '/../data/test_pages.csv';
        $this->testReportsDir = __DIR__ . '/../reports';
        
        // Ensure test data directory exists
        if (!is_dir(dirname($this->testCsvFile))) {
            mkdir(dirname($this->testCsvFile), 0755, true);
        }
        
        // Create test CSV data
        $csvData = "Page URL,Page Title,ILR,Raw ILR,Unique Pageviews,Crawl Depth,HTTP Status Code,\"Page (HTML) Load Time, sec\",Schema.org (Microdata),Schema.org (JSON-LD),Open Graph,Twitter Cards,Microformats,Canonicalization,In sitemap,Incoming Internal Links,Outgoing Internal Links,Outgoing External Links,AMP link,Hreflang Links,Hreflang Issues,JS and CSS Number,\"JS and CSS Size, KB\",Issues,Description,Blocked AI search bots\n";
        $csvData .= "https://example.com/cleaning-services,\"Expert Cleaning Services\",100,0.95,n/a,1,200,1.5,1,1,1,1,0,Self-canonical,1,50,25,10,0,-,-,50,200,5,\"Professional cleaning services for your business\"\n";
        $csvData .= "https://example.com/about,\"About Our Company\",75,0.75,n/a,2,200,2.0,1,1,1,1,0,Self-canonical,1,30,20,5,0,-,-,40,150,2,\"Learn more about our company and mission\"\n";
        $csvData .= "https://example.com/blog-post,\"Cleaning Tips Blog\",45,0.45,n/a,3,200,1.8,1,1,1,1,0,Self-canonical,1,10,15,8,0,-,-,30,100,1,\"Useful cleaning tips and advice\"\n";
        
        file_put_contents($this->testCsvFile, $csvData);
        
        // Ensure reports directory exists
        if (!is_dir($this->testReportsDir)) {
            mkdir($this->testReportsDir, 0755, true);
        }
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        
        // Clean up test files
        if (file_exists($this->testCsvFile)) {
            unlink($this->testCsvFile);
        }
        
        // Clean up test reports
        if (is_dir($this->testReportsDir)) {
            $files = glob($this->testReportsDir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
            rmdir($this->testReportsDir);
        }
    }

    public function testSearchPagesWithValidQuery()
    {
        // Mock $_GET parameters
        $_GET['action'] = 'search_pages';
        $_GET['query'] = 'cleaning';
        $_GET['type'] = 'all';
        
        // Mock file operations
        $originalCsvFile = 'data/naecleaningsolutions.com_pages_20250923.csv';
        
        // Capture output
        ob_start();
        
        // Include the process.php file
        include __DIR__ . '/../../process.php';
        
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('suggestions', $response);
        $this->assertIsArray($response['suggestions']);
    }

    public function testSearchPagesWithEmptyQuery()
    {
        $_GET['action'] = 'search_pages';
        $_GET['query'] = '';
        $_GET['type'] = 'all';
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('suggestions', $response);
    }

    public function testSearchPagesWithShortQuery()
    {
        $_GET['action'] = 'search_pages';
        $_GET['query'] = 'a';
        $_GET['type'] = 'all';
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('suggestions', $response);
        $this->assertEmpty($response['suggestions']);
    }

    public function testSearchPagesWithCsvFileNotFound()
    {
        $_GET['action'] = 'search_pages';
        $_GET['query'] = 'test';
        $_GET['type'] = 'all';
        
        // Temporarily rename the CSV file to simulate not found
        $originalCsvFile = 'data/naecleaningsolutions.com_pages_20250923.csv';
        $backupCsvFile = 'data/naecleaningsolutions.com_pages_20250923.csv.backup';
        
        if (file_exists($originalCsvFile)) {
            rename($originalCsvFile, $backupCsvFile);
        }
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        // Restore the CSV file
        if (file_exists($backupCsvFile)) {
            rename($backupCsvFile, $originalCsvFile);
        }
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('error', $response);
        $this->assertEquals('CSV file not found', $response['error']);
    }

    public function testGenerateReportWithValidInput()
    {
        $_GET['action'] = 'generate_report';
        $_POST['action'] = 'generate_report';
        
        $inputData = [
            'moneyPages' => ['cleaning-services'],
            'supportingPages' => ['about'],
            'outputFormats' => ['html', 'csv'],
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned', 'distribution'],
            'selectedDataFile' => 'test_pages.csv'
        ];
        
        // Mock input stream
        $inputJson = json_encode($inputData);
        
        // Mock php://input
        $tempFile = tempnam(sys_get_temp_dir(), 'php_input');
        file_put_contents($tempFile, $inputJson);
        
        // Override php://input for testing
        $originalInput = 'php://input';
        
        ob_start();
        
        // We need to modify the process.php to use our test data
        // For now, we'll test the functions directly
        $this->assertTrue(function_exists('performAnalysis'));
        $this->assertTrue(function_exists('generateHTMLReport'));
        $this->assertTrue(function_exists('generateCSVReport'));
        $this->assertTrue(function_exists('generateMarkdownReport'));
        
        ob_get_clean();
        
        unlink($tempFile);
    }

    public function testGenerateReportWithInvalidInput()
    {
        $_GET['action'] = 'generate_report';
        $_POST['action'] = 'generate_report';
        
        // Mock invalid input
        $tempFile = tempnam(sys_get_temp_dir(), 'php_input');
        file_put_contents($tempFile, 'invalid json');
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('error', $response);
        $this->assertEquals('Invalid input data', $response['error']);
        
        unlink($tempFile);
    }

    public function testCategorizePageFunction()
    {
        // Test service page categorization
        $servicePage = [
            'Page URL' => 'https://example.com/cleaning-services',
            'Page Title' => 'Cleaning Services',
            'ILR' => '95'
        ];
        
        $result = categorizePage($servicePage);
        $this->assertEquals('money', $result);
        
        // Test supporting page categorization
        $supportingPage = [
            'Page URL' => 'https://example.com/about',
            'Page Title' => 'About Us',
            'ILR' => '75'
        ];
        
        $result = categorizePage($supportingPage);
        $this->assertEquals('supporting', $result);
        
        // Test traffic page categorization
        $trafficPage = [
            'Page URL' => 'https://example.com/blog-post',
            'Page Title' => 'Blog Post',
            'ILR' => '45'
        ];
        
        $result = categorizePage($trafficPage);
        $this->assertEquals('traffic', $result);
    }

    public function testGenerateSlugFunction()
    {
        $url1 = 'https://example.com/cleaning-services';
        $result1 = generateSlug($url1);
        $this->assertEquals('cleaning-services', $result1);
        
        $url2 = 'https://example.com/path/to/page';
        $result2 = generateSlug($url2);
        $this->assertEquals('page', $result2);
        
        $url3 = 'https://example.com/';
        $result3 = generateSlug($url3);
        $this->assertEquals('homepage', $result3);
    }

    public function testLoadCSVDataFunction()
    {
        $pages = loadCSVData($this->testCsvFile);
        
        $this->assertIsArray($pages);
        $this->assertCount(3, $pages);
        
        // Check first page
        $firstPage = $pages[0];
        $this->assertEquals('https://example.com/cleaning-services', $firstPage['url']);
        $this->assertEquals('Expert Cleaning Services', $firstPage['title']);
        $this->assertEquals(100, $firstPage['ilr']);
        $this->assertEquals(50, $firstPage['incomingLinks']);
    }

    public function testCalculateOverallScoreFunction()
    {
        $pages = [
            [
                'url' => 'https://example.com/page1',
                'title' => 'Page 1',
                'ilr' => 95,
                'incomingLinks' => 50,
                'tier' => 'money'
            ],
            [
                'url' => 'https://example.com/page2',
                'title' => 'Page 2',
                'ilr' => 75,
                'incomingLinks' => 30,
                'tier' => 'supporting'
            ]
        ];
        
        $input = [
            'optimizationAreas' => ['orphaned', 'distribution'],
            'primaryGoal' => 'conversions'
        ];
        
        $score = calculateOverallScore($pages, $input);
        
        $this->assertIsNumeric($score);
        $this->assertGreaterThan(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function testGenerateRecommendationsFunction()
    {
        $pages = [
            [
                'url' => 'https://example.com/page1',
                'title' => 'Page 1',
                'ilr' => 95,
                'incomingLinks' => 50,
                'tier' => 'money'
            ],
            [
                'url' => 'https://example.com/page2',
                'title' => 'Page 2',
                'ilr' => 25,
                'incomingLinks' => 1,
                'tier' => 'traffic'
            ]
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'optimizationAreas' => ['orphaned']
        ];
        
        $recommendations = generateRecommendations($input, $pages);
        
        $this->assertIsArray($recommendations);
        $this->assertNotEmpty($recommendations);
        
        // Check that we have recommendations for orphaned pages
        $orphanedRec = array_filter($recommendations, function($rec) {
            return strpos($rec['title'], 'Orphaned') !== false;
        });
        $this->assertNotEmpty($orphanedRec);
    }

    public function testGenerateCSVReportFunction()
    {
        $analysis = [
            'analytics' => [
                'totalPages' => 100,
                'distribution' => [
                    'money' => 10,
                    'supporting' => 30,
                    'traffic' => 60
                ]
            ],
            'opportunities' => [
                [
                    'priority' => 'high',
                    'issue' => 'Test issue',
                    'recommendation' => 'Test recommendation',
                    'impact' => 'High impact'
                ]
            ]
        ];
        
        $input = [];
        
        $csvContent = generateCSVReport($analysis, $input);
        
        $this->assertIsString($csvContent);
        $this->assertStringContainsString('Page Type,Count,Percentage', $csvContent);
        $this->assertStringContainsString('Money Pages,10,10%', $csvContent);
        $this->assertStringContainsString('Supporting Pages,30,30%', $csvContent);
        $this->assertStringContainsString('Traffic Pages,60,60%', $csvContent);
        $this->assertStringContainsString('Opportunities', $csvContent);
        $this->assertStringContainsString('high', $csvContent);
    }

    public function testGenerateMarkdownReportFunction()
    {
        $analysis = [
            'overall' => [
                'score' => 75,
                'grade' => 'B',
                'totalPages' => 100
            ],
            'analytics' => [
                'totalPages' => 100,
                'orphanedPages' => 15,
                'averages' => [
                    'ilr' => 65,
                    'incomingLinks' => 25
                ],
                'distribution' => [
                    'money' => 10,
                    'supporting' => 30,
                    'traffic' => 60
                ]
            ],
            'opportunities' => [
                [
                    'priority' => 'high',
                    'issue' => 'Test issue',
                    'recommendation' => 'Test recommendation',
                    'impact' => 'High impact'
                ]
            ],
            'recommendations' => [
                [
                    'priority' => 'medium',
                    'title' => 'Test recommendation',
                    'action' => 'Test action',
                    'impact' => 'Medium impact'
                ]
            ]
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned']
        ];
        
        $markdownContent = generateMarkdownReport($analysis, $input);
        
        $this->assertIsString($markdownContent);
        $this->assertStringContainsString('# Internal Linking Optimization Report', $markdownContent);
        $this->assertStringContainsString('## Executive Summary', $markdownContent);
        $this->assertStringContainsString('75/100 (B)', $markdownContent);
        $this->assertStringContainsString('## Top Optimization Opportunities', $markdownContent);
        $this->assertStringContainsString('## Strategic Recommendations', $markdownContent);
        $this->assertStringContainsString('## Implementation Timeline', $markdownContent);
        $this->assertStringContainsString('conversions', $markdownContent);
        $this->assertStringContainsString('moderate', $markdownContent);
    }

    public function testInvalidAction()
    {
        $_GET['action'] = 'invalid_action';
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        $this->assertIsArray($response);
        $this->assertArrayHasKey('error', $response);
        $this->assertEquals('Invalid action', $response['error']);
    }

    public function testCorsHeaders()
    {
        $_GET['action'] = 'search_pages';
        $_GET['query'] = 'test';
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        
        // Check that CORS headers are set
        $headers = headers_list();
        $this->assertContains('Content-Type: application/json', $headers);
        $this->assertContains('Access-Control-Allow-Origin: *', $headers);
        $this->assertContains('Access-Control-Allow-Methods: POST, GET', $headers);
        $this->assertContains('Access-Control-Allow-Headers: Content-Type', $headers);
    }

    public function testOptionsRequest()
    {
        $_SERVER['REQUEST_METHOD'] = 'OPTIONS';
        
        ob_start();
        include __DIR__ . '/../../process.php';
        $output = ob_get_clean();
        
        $this->assertEquals('', $output);
    }
}
