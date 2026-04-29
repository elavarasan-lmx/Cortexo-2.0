<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

$responsedata = array();

// ─── Helper: parse JSON block list into phone/whatsapp arrays ─────────────
function parseNumberBlocks($json_string, &$phones, &$whatsapps) {
    if (empty($json_string)) return;
    $items = json_decode($json_string, true);
    if (!is_array($items)) return;

    foreach ($items as $item) {
        $type  = isset($item['type'])  ? strtolower(trim($item['type']))  : '';
        $value = isset($item['value']) ? trim($item['value'])             : '';
        if (empty($value)) continue;

        $lines = array_filter(array_map('trim', explode("\n", $value)));
        foreach ($lines as $num_raw) {
            $clean = preg_replace('/[^0-9+]/', '', $num_raw);
            if (empty($clean)) continue;

            if ($type === 'phone') {
                $phones[] = array(
                    "icon"        => "call",
                    "displaytext" => "<p> :<a href='tel:{$clean}' style='color:#000; text-decoration: none;'>{$num_raw}</a></p>"
                );
            } elseif ($type === 'whatsapp') {
                $whatsapps[] = array(
                    "icon"        => "logo-whatsapp",
                    "displaytext" => "<p> : <a target='blank' href='https://api.whatsapp.com/send?phone={$clean}'>{$num_raw}</p>"
                );
            }
        }
    }
}

// ─── Load ONLY from Mobile App Numbers section (content_5) ────────────────
$content_file = __DIR__ . '/../admin/application/config/page_content.json';

$phone_numbers    = array();
$whatsapp_numbers = array();

if (file_exists($content_file)) {
    $all_content  = json_decode(file_get_contents($content_file), true);
    $contact_data = isset($all_content['contact-us']) ? $all_content['contact-us'] : array();

    // ── DEBUG MODE: visit phonenumberdetails.php?debug=1 to inspect JSON ──
    if (isset($_GET['debug']) && $_GET['debug'] == '1') {
        header('Content-Type: application/json');
        echo json_encode(array(
            'contact_us_keys'  => array_keys($contact_data),
            'content_5_raw'    => isset($contact_data['content_5']) ? $contact_data['content_5'] : 'NOT FOUND',
            'content_4_raw'    => isset($contact_data['content_4']) ? $contact_data['content_4'] : 'NOT FOUND',
        ), JSON_PRETTY_PRINT);
        exit;
    }

    // ── Step 1: Read from content_5 (Mobile App Numbers section) ──────────
    parseNumberBlocks(
        isset($contact_data['content_5']) ? $contact_data['content_5'] : '',
        $phone_numbers,
        $whatsapp_numbers
    );

    // ── Step 2: If phone still empty, fallback to content_4 phone entries ──
    if (empty($phone_numbers) && !empty($contact_data['content_4'])) {
        $tmp_p = array(); $tmp_w = array();
        parseNumberBlocks($contact_data['content_4'], $tmp_p, $tmp_w);
        if (!empty($tmp_p)) $phone_numbers = $tmp_p;
    }

    // ── Step 3: If whatsapp still empty, fallback to content_4 whatsapp ───
    if (empty($whatsapp_numbers) && !empty($contact_data['content_4'])) {
        $tmp_p = array(); $tmp_w = array();
        parseNumberBlocks($contact_data['content_4'], $tmp_p, $tmp_w);
        if (!empty($tmp_w)) $whatsapp_numbers = $tmp_w;
    }

    // ── Step 4: If whatsapp STILL empty, mirror phone number as whatsapp ──
    if (empty($whatsapp_numbers) && !empty($phone_numbers)) {
        foreach ($phone_numbers as $ph) {
            preg_match("/href='tel:([^']+)'/", $ph['displaytext'], $m);
            $clean = isset($m[1]) ? $m[1] : '';
            preg_match("/'>\s*([^<]+)<\/a>/", $ph['displaytext'], $dm);
            $num_raw = isset($dm[1]) ? trim($dm[1]) : $clean;
            if (!empty($clean)) {
                $whatsapp_numbers[] = array(
                    "icon"        => "logo-whatsapp",
                    "displaytext" => "<p> : <a target='blank' href='https://api.whatsapp.com/send?phone={$clean}'>{$num_raw}</p>"
                );
            }
        }
    }
}

// ─── Build final response ──────────────────────────────────────────────────
$responsedata['phone'][]    = array("title" => "Touch to call", "content" => $phone_numbers);
$responsedata['whatsapp'][] = array("title" => "WhatsApp",      "content" => $whatsapp_numbers);

echo json_encode($responsedata);
?>