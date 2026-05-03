<?php
namespace App;

/**
 *
 * @author RVK
 *        
 */
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
class PushOrderStatusUpdate
{
	
    /**
     */
    public function __construct()
    {}
	public function pushOrderStatus($orders)
	{
		foreach($orders as $key => $val){
			Log::info("Expiry data ",['request' => $val]);
			$client_details = json_decode(app('redis')->get("WLclient-" . strtoupper($val["client"])), true);
			Log::info("Client Details" , [$client_details]);
			Log::info("Limit Expiry Cloud Site URL:". $client_details["limitexpireurl"]);
			$field_string = http_build_query($val);
			$handle = curl_init($client_details["limitexpireurl"]);
			curl_setopt($handle, CURLOPT_POST, true);
			curl_setopt($handle, CURLOPT_POSTFIELDS, $field_string);
			curl_setopt($handle, CURLOPT_ENCODING,  '');
			$res = curl_exec($handle);
			curl_close($handle);
		}
	}
}

