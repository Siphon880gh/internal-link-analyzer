<?php
// Simple test to generate a report and see what happens
$input = [
    'moneyPages' => ['cleaning-services', 'bank-cleaning'],
    'supportingPages' => ['about', 'contact'],
    'primaryGoal' => 'conversions',
    'timeline' => 'moderate',
    'optimizationAreas' => ['orphaned', 'distribution'],
    'outputFormats' => ['html'],
    'selectedDataFile' => 'naecleaningsolutions.com_pages_20250923.csv'
];

include 'process.php';
$action = 'generate_report';
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['action'] = 'generate_report';

echo "Testing report generation...\n";
?>
