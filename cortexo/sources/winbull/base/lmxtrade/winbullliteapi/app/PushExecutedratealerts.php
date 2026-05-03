<?php
namespace App;

/**
 *
 * @author RVK
 *        
 */
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
class PushExecutedratealerts
{
    private $REST_API_KEY;
	private $APP_ID; 
	private $SUBTITLE;
	
    public function __construct()
    {}
	public function pushRates($executed_alerts)
	{
		foreach($executed_alerts as $key => $executedrates){
			$client_details = json_decode(app('redis')->get("WLclient-" . $key), true);
			$this->REST_API_KEY = $client_details['onesignalapi'];
			$this->APP_ID = $client_details['onesignalid'];
			$this->SUBTITLE = "Rate alert Execution";
			$execute_url = $client_details["baseurl"]."/index.php/C_sendorderstatus/send_ratealertStatus";
			foreach($executedrates as $exkey => $val){
				$message = "Your rate alert has been executed. Your requested rate : ".$val['Rate']. " Current rate is :".$val['currate'];
				
				$hashes_array = array();
				$fields = array(
					'app_id' => $this->APP_ID,
					'include_player_ids' => array($val['device_id']),
					'data' => array(
						"nav" => "1"
					),
					'headings' => array("en" => $this->SUBTITLE),
					'subtitle' => array("en" => $this->SUBTITLE),
					'contents' => array("en" => $message),
					'android_accent_color' => "21a7c5",
					'web_buttons' => $hashes_array
				);
				
				$auth_key = $this->REST_API_KEY;
				$fields = json_encode($fields);

				$ch = curl_init();
				curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
				curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
				 'Authorization: Basic '.$auth_key));
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
				curl_setopt($ch, CURLOPT_HEADER, FALSE);
				curl_setopt($ch, CURLOPT_POST, TRUE);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
				curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
				$response = curl_exec($ch);
				curl_close($ch);
			}
			Log::info("Update Queues URL: ".$execute_url);
			$field_string = http_build_query($executedrates);
			$handle = curl_init($execute_url);
			curl_setopt($handle, CURLOPT_POST, true);
			curl_setopt($handle, CURLOPT_POSTFIELDS, $field_string);
			curl_setopt($handle, CURLOPT_ENCODING,  '');
			$res = curl_exec($handle);
			curl_close($handle);
			Log::info("Cloud Site Return Value" . $res);
		}
	}
}

