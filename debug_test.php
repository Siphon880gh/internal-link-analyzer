<?php
$input = [
    'moneyPages' => ['cleaning-services', 'bank-cleaning'],
    'supportingPages' => ['about', 'contact']
];
$pages = [
    ['url' => 'https://example.com/cleaning-services/', 'title' => 'Cleaning Services', 'incomingLinks' => 5, 'tier' => 'traffic'],
    ['url' => 'https://example.com/bank-cleaning/', 'title' => 'Bank Cleaning', 'incomingLinks' => 3, 'tier' => 'traffic'],
    ['url' => 'https://example.com/about/', 'title' => 'About Us', 'incomingLinks' => 2, 'tier' => 'traffic']
];

function generateSlug($url) {
    $path = parse_url($url, PHP_URL_PATH);
    $slug = trim($path, '/');
    $parts = explode('/', $slug);
    return end($parts) ?: 'homepage';
}

foreach ($pages as &$page) {
    $slug = generateSlug($page['url']);
    if (in_array($slug, $input['moneyPages'])) {
        $page['tier'] = 'money';
        $page['userSelected'] = true;
    } elseif (in_array($slug, $input['supportingPages'])) {
        $page['tier'] = 'supporting';
        $page['userSelected'] = true;
    } else {
        $page['tier'] = 'traffic';
        $page['userSelected'] = false;
    }
}

$moneyPages = array_filter($pages, function($p) {
    return ($p['tier'] ?? '') === 'money';
});

echo 'Money pages found: ' . count($moneyPages) . PHP_EOL;
foreach ($moneyPages as $page) {
    echo 'Title: ' . $page['title'] . ', Tier: ' . $page['tier'] . PHP_EOL;
}
?>
