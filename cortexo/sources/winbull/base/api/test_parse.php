<?php
$jsonPath = 'c:\wamp64\www\JMJ Bullion\admin\application\config\page_content.json';
$pageContent = json_decode(file_get_contents($jsonPath), true);
$html = $pageContent['bank']['content'];
$doc = new DOMDocument();
@$doc->loadHTML($html);
$xpath = new DOMXPath($doc);
$rows = $xpath->query('//table//tr');
$details = [];
foreach ($rows as $row) {
    $cols = $xpath->query('td', $row);
    if ($cols->length >= 3) {
        $field = trim($cols->item(0)->textContent);
        $value = trim($cols->item(2)->textContent);
        if ($field) {
            $details[] = array("field" => $field, "value" => $value);
        }
    }
}
print_r($details);
?>
