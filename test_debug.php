<?php
// Test script to debug the report generation issue
$input = json_encode([
    'moneyPages' => ['cleaning-services', 'bank-cleaning'],
    'supportingPages' => ['about', 'contact'],
    'primaryGoal' => 'conversions',
    'timeline' => 'moderate',
    'optimizationAreas' => ['orphaned', 'distribution'],
    'outputFormats' => ['html'],
    'selectedDataFile' => 'naecleaningsolutions.com_pages_20250923.csv'
]);

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_POST['action'] = 'generate_report';

// Create a temporary file to simulate php://input
$tempFile = tempnam(sys_get_temp_dir(), 'php_input');
file_put_contents($tempFile, $input);

// Override php://input to read from our temp file
stream_wrapper_unregister('php');
stream_wrapper_register('php', 'class://PHPInputWrapper');
file_put_contents('php://input', $input);

// Include and run the process
include 'process.php';

// Clean up
unlink($tempFile);

class PHPInputWrapper {
    private $data;
    public function stream_open($path, $mode, $options, &$opened_path) {
        global $input;
        $this->data = $input;
        return true;
    }
    public function stream_read($count) {
        $data = substr($this->data, 0, $count);
        $this->data = substr($this->data, $count);
        return $data;
    }
    public function stream_eof() {
        return empty($this->data);
    }
}
?>
