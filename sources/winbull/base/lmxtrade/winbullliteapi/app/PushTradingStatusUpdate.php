<?php
namespace App;

/**
 *
 * @author RVK
 *        
 */
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
class PushTradingStatusUpdate
{
	
    /**
     */
    public function __construct()
    {}
	public function pushTradingStatus($clientstatus)
	{
		foreach($clientstatus as $key => $val){
			Log::info("Client Trading Status ",['request' => $val]);
			if (app('redis')->get("WLclient-" . strtoupper($val["client"]))) {
				$client_details = json_decode(app('redis')->get("WLclient-" . strtoupper($val["client"])), true);
				Log::info("Trade ON OFF Cloud Site URL:". $client_details["tradeonoffurl"]);
				$field_string = http_build_query($val);
				$handle = curl_init($client_details["tradeonoffurl"]);
				curl_setopt($handle, CURLOPT_POST, true);
				curl_setopt($handle, CURLOPT_POSTFIELDS, $field_string);
				curl_setopt($handle, CURLOPT_ENCODING,  '');
				$res = curl_exec($handle);
				curl_close($handle);
				Log::info("Trade ON/OFF Cloud Site Return Value" . $res);
			}
		}
	}
}

