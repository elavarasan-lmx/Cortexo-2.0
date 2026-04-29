<?php
namespace App;

/**
 *
 * @author RVK
 *        
 */
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
class PushExecutehighlowalerts
{
	private $REST_API_KEY;
	private $APP_ID; 
	private $SUBTITLE;
    /**
     */
    public function __construct()
    {}
	public function pushHighLowAlerts($executed_alerts)
	{
		//Log::info("High / Low Executed rate alerts Push Notification", ['ExhlAlerts' => executed_alerts]);
		$client_details = json_decode(app('redis')->get("WLclient-" . $executed_alerts['client']), true);
		$this->REST_API_KEY = $client_details['onesignalapi'];
		$this->APP_ID = $client_details['onesignalid'];
		$this->SUBTITLE = $executed_alerts['title'];
		
		$hashes_array = array();
		$fields = array(
			'app_id' => $this->APP_ID,
			'included_segments' => array('All'),
			'data' => array(
				"nav" => "1"
			),
			'headings' => array("en" => $this->SUBTITLE),
			'subtitle' => array("en" => $this->SUBTITLE),
			'contents' => array("en" => $executed_alerts['message']),
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
		return $response;
	}
}

