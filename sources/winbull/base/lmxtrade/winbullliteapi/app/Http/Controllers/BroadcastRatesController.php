<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;
use App\Jobs\RateExecutedJob;
use App\Jobs\RateAlertExecutedJob;
use App\Jobs\OrderStatusUpdatedJob;
use App\Jobs\TradingStatusUpdateJob;
use App\Jobs\HighLowExecuteJob;
use App\Events\WLTradeStatusUpdate;
use App\Events\MCXRateUpdates;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendMailable;

class BroadcastRatesController extends Controller
{
	private $tradable = true;
	private $request_static;
	public function __construct()
	{
		$this->clientcodesmall = config('global.clientcodesmall');
		$data = ['client' => $this->clientcodesmall];
		$request_static = new Request($data);
	}

	/**
	 * Get merged rates from both XML and MT5 Redis keys.
	 * Use this everywhere instead of app('redis')->get("lmxliverates")
	 */
	private function getMergedRates()
	{
		$xml_data = json_decode(app('redis')->get('lmxliverates'), true) ?? [];
		$mt5_data = json_decode(app('redis')->get('lmxliveprice_mt'), true)  ?? [];

		// Merge MT5 into XML — MT5 symbols added at end
		$merged_map = [];

		foreach ($xml_data as $item) {
			$merged_map[$item['gold1_symbol']] = $item;
		}
		foreach ($mt5_data as $item) {
			$merged_map[$item['gold1_symbol']] = $item;
		}

		return array_values($merged_map);
	}
	public function updatesourcerates(Request $request)
	{
		$baserates     = $this->getMergedRates();
		$lastupdateapp = app('redis')->get("WLBaseRatesUpdated");
		$lastupdateapp = date("m/d/Y h:i:s A", strtotime($lastupdateapp));
		$fh = fopen('php://temp', 'r+');
		foreach($baserates as $row) {
			$newrow = array("gold1_bid" => $row['gold1_bid'], "gold1_ask" => $row['gold1_ask'], "gold1_low" => $row['gold1_low'],"gold1_close" => '-',"gold1_ltp" => '-',"gold1_open"=> $row['gold1_ltp'] ,"gold1_symbol" => $row['gold1_symbol'],"gold1_high" => $row['gold1_high']);
			fputcsv($fh, $newrow, "\t"); // add other args as needed
		}
		$tsv_baserates = stream_get_contents($fh, -1, 0);

		return $tsv_baserates;
	}
	/**
	* This method return the current rates as json string
	*/
	public function finalupdateclientrates(Request $request){
		for ($i = 0; $i < 120; $i++) {
			//Log::info('finalupdateprice');
			$this->finalupdateprice($request);
			usleep(500000); //or time_sleep_until
		}

	}
	public function finalupdateprice(Request $request)
	{
		//Log::info('redisfinal34534534');
		$validator = Validator::make($request->all(), [
	            	'client' => 'required',
        	],
		[
			'client.required' 	=> 'Client code required',
		]);
		if ($validator->fails()) {
            		return array(
                	'error' => true,
                	'message' => $validator->errors()->first()
            		);
        	}
		$response_tcv_rates = array();
		$client_rates = array();
		$clients_rates = json_decode(app('redis')->get('WLclientsrates_'.$this->clientcodesmall), true);
		//print_r("redis: ".app('redis')->get('WLclientsrates_'.$this->clientcodesmall));exit;
		//fetch the client details
		foreach($clients_rates as $crkey => $cval){
			if($cval["clientdetails"]["code"] == $request->input('client')){
				$client_rates = $cval["clientrates"];
				//Log::info("client_rates", ['clientrates' => $client_rates]);
				//Get client final rate
				foreach ($cval["clientrates"] as $rate) {
					$response_tcv_rates[] = array('type' => 3, 'com_id' => $rate['com_id'], 'com_name' => $rate['com_name'], 'bid' => $rate['buying_rate'],'ask' => $rate['selling_rate'], 'high' => '-', 'low' => '-', 'ltp' => '-', 'open' => '-', 'close' => '-', 'delivery' => $rate['delivery'] );
				}
			}
		}
		//Get client commodity data from redis
		$commodity_details = json_decode(app('redis')->get($request->input('client')."commoditydata"), true);
		$contracts = array();
		$bankrates = array();
		$lastupdateat = app('redis')->get('WLBaseRatesUpdated_'.$this->clientcodesmall);
		$lastupdateat = date("m/d/Y h:i:s A", strtotime($lastupdateat));
		$rate_display = array("rate_display" => 1, "market_status" => 0, "message" => "", "lastupdateat" => $lastupdateat);
		if(!empty($commodity_details['rpanel_contracts'])){

			//Get Base rates(DataFeed rate)
			$baserates = $this->getMergedRates();
			//User page display common prices (Exchage price and ounce price)
			foreach($commodity_details['rpanel_contracts'] as $ckey => $cval){
				if($cval['userpage_status'] == 1){
					foreach($baserates as $bkey => $bval){
						if($cval['contract_symbol'] == $bval['gold1_symbol']){
							$response_tcv_rates[] = array('type' => 2, 'com_id' => $cval['contract_symbol'], 'com_name' => $cval['userpage_displayname'], 'bid' => $bval['gold1_bid'], 'ask' => $bval['gold1_ask'], 'high' => $bval['gold1_high'], 'low' => $bval['gold1_low'], 'ltp' => $bval['gold1_ltp'], 'open' => '', 'close' => '', 'delivery' => '-');
						}
					}
				}
			}
			foreach($baserates as $bkey => $bval){
           		     if($bval['gold1_symbol'] == "SPOT-GOLD"){
      			         foreach($commodity_details['rpanel_contracts'] as $ckey => $cval){
     			                  if($cval['contract_symbol'] == $bval['gold1_symbol']){
        			            $response_tcv_rates[] = array('type' => 1, 'com_id' => $bval['gold1_symbol'], 'com_name' => 'GOLD($)', 'bid' => number_format((float)$bval['gold1_bid']+$cval['biddiff'], 2, '.', ''), 'ask' => number_format((float)$bval['gold1_ask']+$cval['askdiff'], 2, '.', ''), 'high' => number_format((float)$bval['gold1_high']+$cval['askdiff'], 2, '.', ''), 'low' => number_format((float)$bval['gold1_low']+$cval['biddiff'], 2, '.', ''), 'ltp' => number_format((float)$bval['gold1_ltp'], 2, '.', ''), 'open' => '', 'close' => '', 'delivery' => '-');
           				   }
           			 }
       		       	 }else if($bval['gold1_symbol'] == "SPOT-SILVER"){
                   	 foreach($commodity_details['rpanel_contracts'] as $ckey => $cval){
                       		 if($cval['contract_symbol'] == $bval['gold1_symbol']){
                   			 $response_tcv_rates[] = array('type' => 1, 'com_id' => $bval['gold1_symbol'], 'com_name' => 'SILVER($)', 'bid' => number_format((float)$bval['gold1_bid']+$cval['biddiff'], 2, '.', ''), 'ask' => number_format((float)$bval['gold1_ask']+$cval['askdiff'], 2, '.', ''), 'high' => number_format((float)$bval['gold1_high']+$cval['askdiff'], 2, '.', ''), 'low' => number_format((float)$bval['gold1_low']+$cval['biddiff'], 2, '.', ''), 'ltp' => number_format((float)$bval['gold1_ltp'], 2, '.', ''), 'open' => '', 'close' => '', 'delivery' => '-');
                   		 }
                  	  }
               		 }else if($bval['gold1_symbol'] == "SPOT-INR"){
                   		 $response_tcv_rates[] = array('type' => 1,'com_id' => $bval['gold1_symbol'], 'com_name' => 'INR(₹)', 'bid' => number_format((float)$bval['gold1_bid'], 2, '.', ''), 'ask' => number_format((float)$bval['gold1_ask'], 2, '.', ''), 'high' => number_format((float)$bval['gold1_high'], 2, '.', ''), 'low' => number_format((float)$bval['gold1_low'], 2, '.', ''), 'ltp' => number_format((float)$bval['gold1_ltp'], 2, '.', ''), 'open' => '', 'close' => '', 'delivery' => '-'); 
               		 }
   		 }
		}
		//Client RPanel data 
		$rpanel_settings = json_decode(app('redis')->get($request->input('client')."rpaneldata"), true);
		if(!empty($rpanel_settings)){
			$response_tcv_rates[] = array('type' => 4, 'com_id' => 4, 'com_name' => '-', 'bid' => $rpanel_settings['rpaneldata']['rate_display'], 'ask' => $rpanel_settings['rpaneldata']['market_status'], 'high' => $rpanel_settings['rpaneldata']['message'], 'low' => str_replace('\"', '',$lastupdateat), 'ltp' => '-', 'open' => '-', 'close' => '-', 'delivery' => '-');
		}

		$fh = fopen('php://temp', 'r+');

		//$array = array(array("id" => 1, "name" => "Prabakar"), array("id" => 2, "name" => "Prabakar1"));

		foreach($response_tcv_rates as $row) {
			fputcsv($fh, $row, "\t"); // add other args as needed
		}
		$csv = stream_get_contents($fh, -1, 0);
		
		app('redis')->set('WLfinalprice_'.$this->clientcodesmall, json_encode($csv)); // No need for json_encode

		$path = config('global.path');
		if (!file_exists($path)) {
		    mkdir($path, 0755, true);
		}

		// Encryption key and method  Must be 16, 24 or 32 bytes for AES-128, AES-192 or AES-256
	        $key = config('global.key');
		$iv = openssl_random_pseudo_bytes(16);  // Generate a random IV for encryption
	

		// Encrypt data
		$encrypted = openssl_encrypt($csv, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

		// Combine IV and encrypted data
		$encrypted_data = base64_encode($iv . $encrypted);

		// Save encrypted file
		file_put_contents($path . config('global.filename'), $encrypted_data);
		file_put_contents($path . config('global.TextFilename'), $csv);

	}
	public function updateclientrates(Request $request)
	{
		$clients_rates = json_decode(app('redis')->get('WLfinalprice_'.$this->clientcodesmall), true);
		return $clients_rates;
	}
}
