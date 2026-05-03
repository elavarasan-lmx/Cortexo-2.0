<?php
	header('Access-Control-Allow-Origin: *');  
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	$responsedata = array();

	$jsonPath = '../admin/application/config/page_content.json';
	if (file_exists($jsonPath)) {
	    $pageContent = json_decode(file_get_contents($jsonPath), true);
	    if (isset($pageContent['contact-us']['content_4']) && !empty($pageContent['contact-us']['content_4'])) {
	        $contactItems = json_decode($pageContent['contact-us']['content_4'], true);
	        if (is_array($contactItems)) {
	            foreach ($contactItems as $item) {
	                $icon = 'pin';
	                if ($item['type'] == 'phone') $icon = 'call';
	                if ($item['type'] == 'email') $icon = 'mail';
	                if ($item['type'] == 'address') $icon = 'pin';
	                if (!empty($item['value'])) {
		                $responsedata['contactus'][] = array(
		                    "title" => $item['title'],
		                    "content" => array(
		                        array("icon" => $icon, "displaytext" => "<p><a style='color:#000; text-decoration: none;'>" . $item['value'] . "</a></p>")
		                    )
		                );
	            	}
	            }
	        }
	    }
	}

	if (empty($responsedata['contactus'])) {
		$responsedata['contactus'][] = array("title" => "E-Mail & Website" , "content" => array(array("icon" => "mail", "displaytext" => "<p><a style='color:#000; text-decoration: none;' href='mailto:#'></a></p>"), array("icon" => "globe", "displaytext" => "<p><a style='color:#000; text-decoration: none;' href='#'></a></p>")));
	}
	echo json_encode($responsedata);
?>

