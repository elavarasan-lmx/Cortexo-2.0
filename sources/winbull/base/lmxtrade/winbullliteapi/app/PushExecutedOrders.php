<?php
namespace App;

/**
 *
 * @author RVK
 *        
 */
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
class PushExecutedOrders
{
	
    /**
     */
    public function __construct()
    {}
	public function pushRates($executed_rates)
	{
		//Log::info("Push Rates Data ",['ExecutedOrdersData' => $executed_rates]);
		foreach($executed_rates as $key => $val){
			//Log::info("Received data",['receivedrequest' => $val]);
			$client_details = json_decode(app('redis')->get("WLclient-" . $key), true);
			//Log::info("Cloud Site URL :". $client_details["orderexeurl"]);
			$field_string = http_build_query($val);
			$handle = curl_init($client_details["orderexeurl"]);
			curl_setopt($handle, CURLOPT_POST, true);
			curl_setopt($handle, CURLOPT_POSTFIELDS, $field_string);
			curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($handle, CURLOPT_ENCODING, '');
			curl_setopt($handle, CURLOPT_TIMEOUT, 10); 
			curl_setopt($handle, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
			$res = curl_exec($handle);
			if (curl_errno($handle)) {
				echo 'cURL Error: ' . curl_error($handle);
			} else {
				echo 'Response: ' . $res;
			}
			curl_close($handle);

			/* $field_string = http_build_query($val);
			$handle = curl_init($client_details["orderexeurl"]);
			curl_setopt($handle, CURLOPT_POST, true);
			curl_setopt($handle, CURLOPT_POSTFIELDS, $field_string);
			curl_setopt($handle, CURLOPT_ENCODING,  '');
			$res = curl_exec($handle);
			curl_close($handle); */
			//Log::info("Cloud Site Return Value" . $res);
			//app('redis')->set("test-data", $handle);
		}
	}
}

