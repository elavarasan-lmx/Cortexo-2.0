<?php
	header('Access-Control-Allow-Origin: *');  
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	$responsedata = array();

	$jsonPath = '../admin/application/config/page_content.json';
	$details = array(
		array("field" => "Bank Name", "value" => ""),
		array("field" => "Account Name", "value" => ""),
		array("field" => "Account Number", "value" => ""),
		array("field" => "IFSC Code", "value" => ""),
		array("field" => "Branch", "value" => ""),
		array("field" => "GST No", "value" => ""),
		array("field" => "PAN No", "value" => "")
	);

	if (file_exists($jsonPath)) {
	    $pageContent = json_decode(file_get_contents($jsonPath), true);
	    if (isset($pageContent['bank']['content'])) {
	        $html = $pageContent['bank']['content'];
	        $doc = new DOMDocument();
	        @$doc->loadHTML('<?xml encoding="UTF-8">' . $html);
	        $xpath = new DOMXPath($doc);
	        $rows = $xpath->query('//table//tr');
	        if ($rows->length > 0) {
	            $details = array();
	            foreach ($rows as $row) {
	                $cols = $xpath->query('td', $row);
	                if ($cols->length >= 3) {
	                    $field = trim(str_replace(':', '', $cols->item(0)->textContent));
	                    $value = trim($cols->item(2)->textContent);
	                    if ($field) {
	                        $details[] = array("field" => $field, "value" => $value);
	                    }
	                }
	            }
	        }
	    }
	}

	$responsedata['bankdetails'][] = array("header" => "","logo" => "", "details" => $details);
	
	echo json_encode($responsedata);
?>