<?php

namespace Xny\InternalLinking\Tests;

use PHPUnit\Framework\TestCase;

class GenerateHTMLReportTest extends TestCase
{
    private $testReportsDir;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->testReportsDir = __DIR__ . '/../reports';
        
        // Ensure reports directory exists
        if (!is_dir($this->testReportsDir)) {
            mkdir($this->testReportsDir, 0755, true);
        }
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        
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

    public function testCalculateDetailedPageScoresFunction()
    {
        $analysis = [
            'overall' => ['score' => 75],
            'analytics' => ['totalPages' => 100]
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'optimizationAreas' => ['orphaned']
        ];
        
        $pages = [
            [
                'url' => 'https://example.com/page1',
                'title' => 'Page 1',
                'ilr' => 95,
                'incomingLinks' => 50,
                'outgoingLinks' => 25,
                'tier' => 'money'
            ],
            [
                'url' => 'https://example.com/page2',
                'title' => 'Page 2',
                'ilr' => 75,
                'incomingLinks' => 30,
                'outgoingLinks' => 20,
                'tier' => 'supporting'
            ]
        ];
        
        $pageScores = calculateDetailedPageScores($analysis, $input, $pages);
        
        $this->assertIsArray($pageScores);
        $this->assertCount(2, $pageScores);
        
        // Check first page score
        $firstScore = $pageScores[0];
        $this->assertArrayHasKey('page', $firstScore);
        $this->assertArrayHasKey('score', $firstScore);
        $this->assertArrayHasKey('recommendations', $firstScore);
        $this->assertIsNumeric($firstScore['score']);
        $this->assertIsArray($firstScore['recommendations']);
    }

    public function testCalculatePageScoreFunction()
    {
        $page = [
            'url' => 'https://example.com/test-page',
            'title' => 'Test Page',
            'ilr' => 80,
            'incomingLinks' => 25,
            'outgoingLinks' => 15,
            'tier' => 'supporting'
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'optimizationAreas' => ['orphaned']
        ];
        
        $score = calculatePageScore($page, $input);
        
        $this->assertIsNumeric($score);
        $this->assertGreaterThan(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function testGetTierScoreFunction()
    {
        $input = ['primaryGoal' => 'conversions'];
        
        // Test money tier with conversions goal
        $moneyScore = getTierScore('money', $input);
        $this->assertEquals(20, $moneyScore);
        
        // Test supporting tier with conversions goal
        $supportingScore = getTierScore('supporting', $input);
        $this->assertEquals(10, $supportingScore);
        
        // Test traffic tier with conversions goal
        $trafficScore = getTierScore('traffic', $input);
        $this->assertEquals(5, $trafficScore);
        
        // Test with traffic goal
        $input['primaryGoal'] = 'traffic';
        $trafficScoreWithGoal = getTierScore('traffic', $input);
        $this->assertEquals(20, $trafficScoreWithGoal);
        
        // Test with authority goal
        $input['primaryGoal'] = 'authority';
        $supportingScoreWithGoal = getTierScore('supporting', $input);
        $this->assertEquals(20, $supportingScoreWithGoal);
        
        // Test with balanced goal
        $input['primaryGoal'] = 'balanced';
        $balancedScore = getTierScore('money', $input);
        $this->assertEquals(10, $balancedScore);
    }

    public function testGeneratePageRecommendationsFunction()
    {
        $page = [
            'url' => 'https://example.com/test-page',
            'title' => 'Test Page',
            'ilr' => 60,
            'incomingLinks' => 5,
            'outgoingLinks' => 10,
            'tier' => 'money'
        ];
        
        $score = 45; // Low score to trigger recommendations
        
        $recommendations = generatePageRecommendations($page, $score);
        
        $this->assertIsArray($recommendations);
        $this->assertNotEmpty($recommendations);
        
        // Check that we have link-based recommendations
        $linkRecs = array_filter($recommendations, function($rec) {
            return strpos($rec, 'internal links') !== false;
        });
        $this->assertNotEmpty($linkRecs);
    }

    public function testGetScoreColorFunction()
    {
        $greenColor = getScoreColor(90);
        $this->assertEquals('#28a745', $greenColor);
        
        $yellowColor = getScoreColor(70);
        $this->assertEquals('#ffc107', $yellowColor);
        
        $redColor = getScoreColor(50);
        $this->assertEquals('#dc3545', $redColor);
    }

    public function testGetGradeFunction()
    {
        $this->assertEquals('A+', getGrade(95));
        $this->assertEquals('A', getGrade(85));
        $this->assertEquals('B', getGrade(75));
        $this->assertEquals('C', getGrade(65));
        $this->assertEquals('D', getGrade(55));
        $this->assertEquals('F', getGrade(45));
    }

    public function testGetTierStatusFunction()
    {
        $goodStatus = getTierStatus(10, 100, 0.05, 0.15);
        $this->assertEquals('✅ good', $goodStatus);
        
        $tooFewStatus = getTierStatus(2, 100, 0.05, 0.15);
        $this->assertEquals('⬇️ too-few', $tooFewStatus);
        
        $tooManyStatus = getTierStatus(20, 100, 0.05, 0.15);
        $this->assertEquals('⬆️ too-many', $tooManyStatus);
    }

    public function testGenerateCLIStyleHTMLReportFunction()
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
            'optimizationAreas' => ['orphaned'],
            'createActionPlan' => true
        ];
        
        $pages = [
            [
                'url' => 'https://example.com/money-page',
                'title' => 'Money Page',
                'ilr' => 95,
                'incomingLinks' => 50,
                'outgoingLinks' => 25,
                'tier' => 'money',
                'isCustom' => false
            ],
            [
                'url' => 'https://example.com/supporting-page',
                'title' => 'Supporting Page',
                'ilr' => 75,
                'incomingLinks' => 30,
                'outgoingLinks' => 20,
                'tier' => 'supporting',
                'isCustom' => false
            ],
            [
                'url' => 'https://example.com/traffic-page',
                'title' => 'Traffic Page',
                'ilr' => 45,
                'incomingLinks' => 10,
                'outgoingLinks' => 15,
                'tier' => 'traffic',
                'isCustom' => false
            ]
        ];
        
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, $pages);
        
        $this->assertIsString($htmlContent);
        $this->assertStringContainsString('<!DOCTYPE html>', $htmlContent);
        $this->assertStringContainsString('<html lang="en">', $htmlContent);
        $this->assertStringContainsString('<head>', $htmlContent);
        $this->assertStringContainsString('<title>Internal Linking Optimization Report | XnY</title>', $htmlContent);
        $this->assertStringContainsString('<body>', $htmlContent);
        $this->assertStringContainsString('Overall Optimization Score', $htmlContent);
        $this->assertStringContainsString('75', $htmlContent);
        $this->assertStringContainsString('B', $htmlContent);
        $this->assertStringContainsString('Tier Distribution Analysis', $htmlContent);
        $this->assertStringContainsString('Top Optimization Opportunities', $htmlContent);
        $this->assertStringContainsString('Strategic Recommendations', $htmlContent);
        $this->assertStringContainsString('Page Performance Analysis', $htmlContent);
        $this->assertStringContainsString('Implementation Action Plan', $htmlContent);
        $this->assertStringContainsString('Money Page', $htmlContent);
        $this->assertStringContainsString('Supporting Page', $htmlContent);
        $this->assertStringContainsString('Traffic Page', $htmlContent);
    }

    public function testGenerateCLIStyleHTMLReportWithCustomPages()
    {
        $analysis = [
            'overall' => ['score' => 75, 'grade' => 'B', 'totalPages' => 100],
            'analytics' => [
                'totalPages' => 100,
                'orphanedPages' => 15,
                'averages' => ['ilr' => 65, 'incomingLinks' => 25],
                'distribution' => ['money' => 10, 'supporting' => 30, 'traffic' => 60]
            ],
            'opportunities' => [],
            'recommendations' => []
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned'],
            'createActionPlan' => false
        ];
        
        $pages = [
            [
                'url' => 'https://example.com/custom-money',
                'title' => 'Custom Money Page',
                'ilr' => 95,
                'incomingLinks' => 50,
                'outgoingLinks' => 25,
                'tier' => 'money',
                'isCustom' => true
            ]
        ];
        
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, $pages);
        
        $this->assertStringContainsString('CUSTOM URL', $htmlContent);
        $this->assertStringNotContainsString('Implementation Action Plan', $htmlContent);
    }

    public function testGenerateCLIStyleHTMLReportWithNoPages()
    {
        $analysis = [
            'overall' => ['score' => 75, 'grade' => 'B', 'totalPages' => 0],
            'analytics' => [
                'totalPages' => 0,
                'orphanedPages' => 0,
                'averages' => ['ilr' => 0, 'incomingLinks' => 0],
                'distribution' => ['money' => 0, 'supporting' => 0, 'traffic' => 0]
            ],
            'opportunities' => [],
            'recommendations' => []
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned'],
            'createActionPlan' => true
        ];
        
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, null);
        
        $this->assertIsString($htmlContent);
        $this->assertStringContainsString('<!DOCTYPE html>', $htmlContent);
        $this->assertStringContainsString('0', $htmlContent);
    }

    public function testGenerateCLIStyleHTMLReportWithOrphanedPages()
    {
        $analysis = [
            'overall' => ['score' => 75, 'grade' => 'B', 'totalPages' => 100],
            'analytics' => [
                'totalPages' => 100,
                'orphanedPages' => 15,
                'averages' => ['ilr' => 65, 'incomingLinks' => 25],
                'distribution' => ['money' => 10, 'supporting' => 30, 'traffic' => 60]
            ],
            'opportunities' => [],
            'recommendations' => []
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned'],
            'createActionPlan' => true
        ];
        
        $pages = [
            [
                'url' => 'https://example.com/orphaned-page',
                'title' => 'Orphaned Page',
                'ilr' => 20,
                'incomingLinks' => 1,
                'outgoingLinks' => 5,
                'tier' => 'traffic',
                'isCustom' => false
            ]
        ];
        
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, $pages);
        
        $this->assertStringContainsString('Orphaned Pages (≤2 Internal Links)', $htmlContent);
        $this->assertStringContainsString('Orphaned Page', $htmlContent);
        $this->assertStringContainsString('High', $htmlContent); // Priority
    }

    public function testGenerateCLIStyleHTMLReportWithJavaScript()
    {
        $analysis = [
            'overall' => ['score' => 75, 'grade' => 'B', 'totalPages' => 100],
            'analytics' => [
                'totalPages' => 100,
                'orphanedPages' => 15,
                'averages' => ['ilr' => 65, 'incomingLinks' => 25],
                'distribution' => ['money' => 10, 'supporting' => 30, 'traffic' => 60]
            ],
            'opportunities' => [],
            'recommendations' => []
        ];
        
        $input = [
            'primaryGoal' => 'conversions',
            'timeline' => 'moderate',
            'optimizationAreas' => ['orphaned'],
            'createActionPlan' => true
        ];
        
        $pages = [
            [
                'url' => 'https://example.com/page1',
                'title' => 'Page 1',
                'ilr' => 95,
                'incomingLinks' => 50,
                'outgoingLinks' => 25,
                'tier' => 'money',
                'isCustom' => false
            ]
        ];
        
        $htmlContent = generateCLIStyleHTMLReport($analysis, $input, $pages);
        
        $this->assertStringContainsString('<script>', $htmlContent);
        $this->assertStringContainsString('function toggleExplanation', $htmlContent);
        $this->assertStringContainsString('function openModal', $htmlContent);
        $this->assertStringContainsString('function closeModal', $htmlContent);
        $this->assertStringContainsString('allPagesData', $htmlContent);
    }
}
