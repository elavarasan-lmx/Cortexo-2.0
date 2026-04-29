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
use App\Jobs\UpdateBaseRatesJob;


class WinbullliteController extends Controller
{
	private $tradable = true;
	private $clientcode;
	private $clientcodesmall;
	public function __construct()
	{
		$this->clientcode= config('global.clientcode');
		$this->clientcodesmall = config('global.clientcodesmall');

		// Log::info("Constructor clientcode debug", ['clientcode_new' => $this->clientcode_new]);
		// Log::info("Constructor clientcode debug", ['clientcodesmall_new' => $this->clientcodesmall_new]);
	}
	
	public function getcurrentrates()
	{
		return app('redis')->get("lmxliverates");
	}
	public function createclient(Request $request)
	{
		$validator = Validator::make($request->all(), [
            'client' 	=> 'required',
			'ratealert'	=> 'required',
			'highlow' 	=> 'required',
			'status' 	=> 'required',
			'code'		=> 'required'
        ],
		[
            'client.required' 		=> 'Client name is required',
			'ratealert.required'	=> 'Rate alert is required',
			'highlow.required'		=> 'High low is required',
			'status.required'		=> 'Client status is required',
			'code.required'			=> 'Client code is required',
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		/* print_r($request->input('higlowalertsettings'));
		var_dump($request->input('higlowalertsettings')['gold_up']);
		exit; */
		
		$message = "";
		
		$redis = app('redis');
		$keys = $redis->keys('*');
		
		//Log::info("keys list ",['keys' => $keys]); 
		
		if (app('redis')->get("WLclient-" . $request->input('client'))) {
			$client_deails = json_decode(app('redis')->get("WLclient-" . $request->input('client')), true);
			$client_deails["client"] 		= $request->input('client');
			$client_deails["ratealert"] 	= $request->input('ratealert');
			$client_deails["highlow"] 		= $request->input('highlow');
			$client_deails["status"] 		= $request->input('status');
			$client_deails["code"] 			= $request->input('code');
			$client_deails["baseurl"] 		= $request->input('baseurl');
			$client_deails["orderexeurl"] 	= $request->input('orderexeurl');
			$client_deails["name"] 			= $request->input('name');
			$client_deails["onesignalid"] 	= $request->input('onesignalid');
			$client_deails["onesignalapi"] 	= $request->input('onesignalapi');
			$client_deails["firebaseserverkey"] 	= $request->input('firebaseserverkey');
			$client_deails["smssenderid"] 	= $request->input('smssenderid');
			$client_deails["limitexpireurl"]= $request->input('limitexpireurl');
			$client_deails["tradeonoffurl"] = $request->input('tradeonoffurl');
			$client_deails["requiredhighlowalert"] = $request->input('requiredhighlowalert');
			$client_deails["higlowalertsettings"] = array('gold_up' => $request->input('higlowalertsettings')['gold_up'], 'gold_down' => $request->input('higlowalertsettings')['gold_down'], 'silver_up' => $request->input('higlowalertsettings')['silver_up'], 'silver_down' => $request->input('higlowalertsettings')['silver_down']);
			$client_deails["gold_contract"] 	= $request->input('gold_contract');
			$client_deails["silver_contract"] 	= $request->input('silver_contract');
			$client_deails["bank_gold_contract"]= $request->input('bank_gold_contract');
			$client_deails["bank_silver_contract"] 	= $request->input('bank_silver_contract');
			$client_deails["alertfor"] 			= $request->input('alertfor'); // 1-> Bank Rates 2->MCX Rates
			$client_deails["exchange_rate"] 	= $request->input('exchange_rate');			
			$client_deails["alert_from"] 		= $request->input('alert_from');			
			$client_deails["alert_to"] 			= $request->input('alert_to');			
			app('redis')->set("WLclient-" . $request->input('client'), json_encode($client_deails));
			$message = 'Client details update successfully.';
			Log::info("Client created ",['clientdetails' => array("client" => $request->input('client'), "ratealert" => $request->input('ratealert'), "highlow" => $request->input('highlow'), "status" => $request->input('status'), "code" => $request->input('code'), "baseurl" => $request->input('baseurl'), "orderexeurl" => $request->input('orderexeurl'), "name" => $request->input('name'), "onesignalid" => $request->input('onesignalid'),"onesignalapi" => $request->input('onesignalapi'), "firebaseserverkey" => $request->input('firebaseserverkey'), "smssenderid" => $request->input('smssenderid'), "limitexpireurl" => $request->input('limitexpireurl'), "tradeonoffurl" => $request->input('tradeonoffurl'), 'requiredhighlowalert' => $request->input('requiredhighlowalert'), 'higlowalertsettings' => array('gold_up' => $request->input('higlowalertsettings')['gold_up'], 'gold_down' => $request->input('higlowalertsettings')['gold_down'], 'silver_up' => $request->input('higlowalertsettings')['silver_up'], 'silver_down' => $request->input('higlowalertsettings')['silver_down']), 'gold_contract' => $request->input('gold_contract'), 'silver_contract' => $request->input('silver_contract'), 'alertfor' => $request->input('alertfor'), 'bank_gold_contract' => $request->input('bank_gold_contract'), 'bank_silver_contract' => $request->input('bank_silver_contract'), 'exchange_rate' => $request->input('exchange_rate'), 'alert_from' => $request->input('alert_from'), 'alert_to' => $request->input('alert_to'))]);
		}else{
			app('redis')->set("WLclient-" . $request->input('client'), json_encode(array("client" => $request->input('client'), "ratealert" => $request->input('ratealert'), "highlow" => $request->input('highlow'), "status" => $request->input('status'), "code" => $request->input('code'), "baseurl" => $request->input('baseurl'), "orderexeurl" => $request->input('orderexeurl'), "name" => $request->input('name'), "onesignalid" => $request->input('onesignalid'),"onesignalapi" => $request->input('onesignalapi'), "firebaseserverkey" => $request->input('firebaseserverkey'), "smssenderid" => $request->input('smssenderid'), "limitexpireurl" => $request->input('limitexpireurl'), "tradeonoffurl" => $request->input('tradeonoffurl'), 'requiredhighlowalert' => $request->input('requiredhighlowalert'), 'higlowalertsettings' => array('gold_up' => $request->input('higlowalertsettings')['gold_up'], 'gold_down' => $request->input('higlowalertsettings')['gold_down'], 'silver_up' => $request->input('higlowalertsettings')['silver_up'], 'silver_down' => $request->input('higlowalertsettings')['silver_down']), 'gold_contract' => $request->input('gold_contract'), 'silver_contract' => $request->input('silver_contract'), 'alertfor' => $request->input('alertfor'), 'bank_gold_contract' => $request->input('bank_gold_contract'), 'bank_silver_contract' => $request->input('bank_silver_contract'), 'exchange_rate' => $request->input('exchange_rate'), 'alert_from' => $request->input('alert_from'), 'alert_to' => $request->input('alert_to'))));
			$message = 'Client details created successfully.';
			//Log::info("Client updated ",['clientdetails' => array("client" => $request->input('client'), "ratealert" => $request->input('ratealert'), "highlow" => $request->input('highlow'), "status" => $request->input('status'), "code" => $request->input('code'), "baseurl" => $request->input('baseurl'), "orderexeurl" => $request->input('orderexeurl'), "name" => $request->input('name'), "onesignalid" => $request->input('onesignalid'),"onesignalapi" => $request->input('onesignalapi'), "firebaseserverkey" => $request->input('firebaseserverkey'), "smssenderid" => $request->input('smssenderid'), "limitexpireurl" => $request->input('limitexpireurl'), "tradeonoffurl" => $request->input('tradeonoffurl'), 'requiredhighlowalert' => $request->input('requiredhighlowalert'), 'higlowalertsettings' => array('gold_up' => $request->input('higlowalertsettings')['gold_up'], 'gold_down' => $request->input('higlowalertsettings')['gold_down'], 'silver_up' => $request->input('higlowalertsettings')['silver_up'], 'silver_down' => $request->input('higlowalertsettings')['silver_down']), 'gold_contract' => $request->input('gold_contract'), 'silver_contract' => $request->input('silver_contract'), 'alertfor' => $request->input('alertfor'), 'bank_gold_contract' => $request->input('bank_gold_contract'), 'bank_silver_contract' => $request->input('bank_silver_contract'), 'exchange_rate' => $request->input('exchange_rate'), 'alert_from' => $request->input('alert_from'), 'alert_to' => $request->input('alert_to'))]);
		}
		
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to update the client trading status 
	* like 1.trade on or off
	* 2.Is auto trade on or off with time
	* 3.Limit whether expire or not if get expire means that time
	* Request arguments as like this (array)
	* 'client'  	 => $client, //Client code
	* 'trade_enable'   => $_POST['fv']['trade_enable'], //Trade On or Off 0->Off 1-> ON
	* 'limit_expire'   =>  $_POST['fv']['limit_cancellation'], //Whether Limit Expire or not 1-> Yes 0->No
	* 'limit_expire_time' => $_POST['fv']['limitcancel_time'], //IF limit_expire = 1 time
	* 'trade_on'  => $_POST['fv']['trade_on'],  //Trade on by manual or auto 1-> Auto 0->Manual
	* 'trade_on_time'  => $_POST['fv']['trade_on_time'], //trade_on 1 time is mandatory in this time it * automatically get trade on and send the request to cloud respected site
	* 'trade_off'	 => $_POST['fv']['trade_off'], //Trade off by manual or auto 1-> Auto 0->Manual
	* 'trade_off_time' => $_POST['fv']['trade_off_time'] //trade_off 1 time is mandatory in this time it automatically get trade off and send the request to cloud respected site
	*/
	public function updateclienttradestatus(Request $request)
	{
		$validator = Validator::make($request->all(), [
            'client' 	=> 'required',
			'trade_enable'	=> 'required'
        ],
		[
            'client.required' 		=> 'Client name is required',
			'trade_enable.required'	=> 'Trade enable is required'
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		$message = "";
		$client_trading_status_update = array();
		if (app('redis')->get("WLclienttradestatus-" . $request->input('client'))) {
			$client_deails = json_decode(app('redis')->get("WLclienttradestatus-" . $request->input('client')), true);
			if($client_deails["trade_enable"] != $request->input('trade_enable')){
				$client_trading_status_update[] = array("client" => $request->input('client'), "trade_enable" => $request->input('trade_enable'));
			}
			$client_deails["client"] 			= $request->input('client');
			$client_deails["trade_enable"] 		= $request->input('trade_enable');
			$client_deails["limit_expire"] 		= $request->input('limit_expire');
			$client_deails["limit_expire_time"] = $request->input('limit_expire_time');
			$client_deails["trade_on"] 			= $request->input('trade_on');
			$client_deails["trade_on_time"] 	= $request->input('trade_on_time');
			$client_deails["trade_off"] 		= $request->input('trade_off');
			$client_deails["trade_off_time"] 	= $request->input('trade_off_time');
						
			app('redis')->set("WLclienttradestatus-" . $request->input('client'), json_encode($client_deails));
			$message = 'Client trade details update successfully.';
		}else{
			app('redis')->set("WLclienttradestatus-" . $request->input('client'), json_encode(array("client" => $request->input('client'), "trade_enable" => $request->input('trade_enable'), "limit_expire" => $request->input('limit_expire'), "limit_expire_time" => $request->input('limit_expire_time'), "trade_on" => $request->input('trade_on'), "trade_on_time" => $request->input('trade_on_time'), "trade_off" => $request->input('trade_off'), "trade_off_time" => $request->input('trade_off_time'))));
			$message = 'Client trade details created successfully.';
			$client_trading_status_update[] = array("client" => $request->input('client'), "trade_enable" => $request->input('trade_enable'));
		}
		if(!empty($client_trading_status_update)){
			event(new WLTradeStatusUpdate($client_trading_status_update));
		}
		$this->check_client_update_trade();
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to create clients up / down alerts to end user_error
	* Can create with client name and code and settings with following param
	* @param client, code, required_alert, gold_down, gold_up, silver_down, silver_up
	*/
	public function createclientupdownalerts()
	{
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required',
			'code'			=> 'required',
			'required_alert'=> 'required', //whether 0 or 1 0-> No 1->Yes
			'gold_up' 		=> 'required',
			'gold_down' 	=> 'required',
			'silver_up' 	=> 'required',
			'silver_down' 	=> 'required'
        ],
		[
            'client.required' 		=> 'Client name is required',
			'code.required'			=> 'Client code is required',
			'required_alert.required'	=> 'Required alert is required',
			'gold_up.required'		=> 'Gold up rate is required',
			'gold_down.required'	=> 'Gold down rate is required',
			'silver_up.required'	=> 'Silver up rate is required',
			'silver_down.required'	=> 'Silver down rate is required'
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		$message = "";
		
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to update the client up / down alerts settings
	* Can change whether need to send alerts fields 
	* and can change the values required_alert, gold_down, gold_up, silver_down, silver_up
	*/
	public function updateclientupdownalerts()
	{
		
	}
	/**
	* This method is used to return all the clients stored in redis with 
	* the key name start with WLclient-
	* Return as array.
	*/
	public function getallclients()
	{
		//Log::info("clientlist11", ['clientlist11' => $this->clientcode]); 
		return app('redis')->keys("WLclient-".$this->clientcode);
	}
	/**
	* This method used to create rate alert or limit order for users
	* This request will call from cloud sites. 
	* For individual client site customers will post the request.
	* Here creating redis key with the name of WLratealertclients_bullion.
	* All the new requests store into single json string and store into redis key WLratealertclients_bullion.
	*/
	public function createratealert(Request $request)
	{
		$message = "";
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required',
			'book_cusid'	=> 'required',
			'book_comid' 	=> 'required',
			'book_type' 	=> 'required',
			'book_rate'		=> 'required',
			'book_qty'		=> 'required',
			'book_no'		=> 'required',
			'alert_type'	=> 'required',
        ],
		[
            'client.required' 		=> 'Client name is required',
			'book_cusid.required'	=> 'Customer id is required',
			'book_comid.required'	=> 'Commodity id is required',
			'book_type.required'	=> 'Book type is required',
			'book_rate.required'	=> 'Book rate is required',
			'book_qty.required'		=> 'Booking qty is required',
			'book_no.required'		=> 'Booking no. is required',
			'alert_type.required'	=> 'Alert type is required',
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			$ratealert_deails[]	= array("client" => $request->input('client'), "book_cusid" => $request->input('book_cusid'), "book_comid" => $request->input('book_comid'), "book_type" => $request->input('book_type'), "book_rate" => $request->input('book_rate'), "book_qty" => $request->input('book_qty'), "book_no" => $request->input('book_no'), "alert_type" => $request->input('alert_type'), "mobile_no" => $request->input('mobile_no'), "device_id" => $request->input('device_id'), "created" => date("d-m-Y H:i:s"));
			app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
			$message = 'Request created successfully.';
			//Log::info("Trade Create Data ",['traderequest' => array("client" => $request->input('client'), "book_cusid" => $request->input('book_cusid'), "book_comid" => $request->input('book_comid'), "book_type" => $request->input('book_type'), "book_rate" => $request->input('book_rate'), "book_qty" => $request->input('book_qty'), "book_no" => $request->input('book_no'), "alert_type" => $request->input('alert_type'), "mobile_no" => $request->input('mobile_no'), "device_id" => $request->input('device_id'), "created" => date("d-m-Y H:i:s"))]);
		}else{
			$ratealert_deails = array();
			$ratealert_deails[] = array("client" => $request->input('client'), "book_cusid" => $request->input('book_cusid'), "book_comid" => $request->input('book_comid'), "book_type" => $request->input('book_type'), "book_rate" => $request->input('book_rate'), "book_qty" => $request->input('book_qty'), "book_no" => $request->input('book_no'), "alert_type" => $request->input('alert_type'), "mobile_no" => $request->input('mobile_no'), "device_id" => $request->input('device_id'), "created" => date("d-m-Y H:i:s"));
			app('redis')->set('WLratealertclients_'.$this->clientcodesmall , json_encode($ratealert_deails));
			$message = 'Request created successfully.';
			//Log::info("Trade Create Data ",['traderequest' => array("client" => $request->input('client'), "book_cusid" => $request->input('book_cusid'), "book_comid" => $request->input('book_comid'), "book_type" => $request->input('book_type'), "book_rate" => $request->input('book_rate'), "book_qty" => $request->input('book_qty'), "book_no" => $request->input('book_no'), "alert_type" => $request->input('alert_type'), "mobile_no" => $request->input('mobile_no'), "device_id" => $request->input('device_id'), "created" => date("d-m-Y H:i:s"))]);
		}
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to remove particular clients customers rate alerts
	* Argument recive as client code
	*/
	public function removeclientratealertrequest(Request $request)
	{
		$message = "";
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required'
        ],
		[
            'client.required' 		=> 'Client name is required'
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			foreach($ratealert_deails as $key => $ratealert){
				if($ratealert['client'] ==  $request->input('client')) {
					unset($ratealert_deails[$key]);
				}
			}
			app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
			$message = "Cleared all the limit orders for this client.";
		}else{
			$message = 'No record found for given request.';
		}
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to update the rate alert / Limit order.
	* Request will be received from cloud site.
	* This is used to update the already created alert / limit orders
	* Here we used logic as get all the alerts stored into redis key WLratealertclients_bullion
	* and check with client id and book no by looping the array, If match means will update
	* and store the new array values into redis key WLratealertclients_bullion as json_encode string.
	*/
	public function updateratealert(Request $request)
	{
		$message = "";
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required',
			'book_cusid'	=> 'required',
			'book_comid' 	=> 'required',
			'book_type' 	=> 'required',
			'book_rate'		=> 'required',
			'book_qty'		=> 'required',
			'book_no'		=> 'required'
        ],
		[
            'client.required' 		=> 'Client name is required',
			'book_cusid.required'	=> 'Customer id is required',
			'book_comid.required'	=> 'Commodity id is required',
			'book_type.required'	=> 'Booking type is required',
			'book_rate.required'	=> 'Booking rate is required',
			'book_qty.required'		=> 'Booking qty is required',
			'book_no.required'		=> 'Booking no is required'
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			foreach($ratealert_deails as $key => $ratealert){
				if($ratealert['client'] ==  $request->input('client') &&  $ratealert['book_no'] ==  $request->input('book_no') && $ratealert['book_cusid'] == $request->input('book_cusid')) {
					$ratealert_deails[$key]['book_rate'] 	= $request->input('book_rate');
					$ratealert_deails[$key]['book_qty'] 	= $request->input('book_qty');
					$ratealert_deails[$key]['updated'] 		= date("d-m-Y H:i:s");
					app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
					$message = 'Request updated successfully.';
					//Log::info('Trade Update :', [array("client" => $request->input('client'), "book_cusid" => $request->input('book_cusid'), "book_comid" => $request->input('book_comid'), "book_type" => $request->input('book_type'), "book_rate" => $request->input('book_rate'), "book_qty" => $request->input('book_qty'), "book_no" => $request->input('book_no'), "alert_type" => $request->input('alert_type'), "mobile_no" => $request->input('mobile_no'), "device_id" => $request->input('device_id'), "created" => date("d-m-Y H:i:s"))]);
				}
			}
		}else{
			$message = 'No record found for given request.';
		}
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to view all the rate alerts of clients
	*/
	public function viewallclientsratesrequest()
	{
		$all_clients_rate_request = array();
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$all_clients_rate_request 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
		}
		return $all_clients_rate_request;
	}
	/**
	* This method is used to view particular client limit / rate alert request
	*/
	public function reteriveclientrequest(Request $request)
	{
		$message = "";
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required',
        ],
		[
            'client.required' 		=> 'Client name is required',
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		$client_rate_request = array();
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			foreach($ratealert_deails as $key => $ratealert){
				if($ratealert['client'] ==  $request->input('client')) {
					$client_rate_request[] = $ratealert;
				}
			}
			$message = 'Client request list.';
		}else{
			$message = 'No record found for given request.';
		}
		return array('error' => false, 'message' => $message, 'requests' => $client_rate_request);
	}
	
	public function createclientrates()
	{
		for ($i = 0; $i < 120; $i++) {
			//Log::info('createrates started');
			//exec('php D:/lmxrepository/php7/panchayat/artisan process:stock > /dev/null 2>&1 &');
			$this->createrates();
			//Log::info('createrates end');
			usleep(500000); //or time_sleep_until
		}
	}
	public function executeratealerts()
	{
		for ($i = 0; $i < 120; $i++) {
			$this->execute_ratealert();
			usleep(500000); //or time_sleep_until
		}
	}
	public function executehighlowalerts()
	{
		$client_details = $this->clients_details();
		foreach($client_details as $dkey => $dval){
			if(!empty($dval['requiredhighlowalert'])){
				if(date("H:i") > date("H:i", strtotime($dval['alert_from'])) && date("H:i") < date("H:i", strtotime($dval['alert_to']))){
					$this->execute_highlowalerts($dval);
				}
			}
		}
	}
	public function updateratefeed()
	{
		//Log::info("testupdatefeed ", ['updateratefeed' => "testrates"]);

		for ($i = 0; $i < 1000; $i++) {
			dispatch(new UpdateBaseRatesJob())->onQueue('high-priority');
			usleep(1000); // 1 millisecond delay
		}
	}
	public function checkrateupdatefeed()
	{
		//Log::info("testupdatefeed ", ['request' => "testrates"]);
		for ($i = 0; $i < 4; $i++) {
			$this->check_rate_update();
			usleep(15000000); //or time_sleep_until
		}
	}
	
	/**
	* This method is used to create individual client commodity final rates.
	* Base rates read from WLBaseRates key redis
	* Calculate base rates with commodity array stored in redis from 
	* cloud site admin commodity group update.
	* Redis key stored for this logic as client name . "commoditygroupupdate" string
	*/
	public function createrates()
	{
		$client_final_rates = array();
		$clients_commodities = $this->clients_commodities();
		//Log::info('clientcommodities started...');
		//Log::info("Client commodities ",['clients_commodities' => $clients_commodities]); 
		foreach($clients_commodities as $ckey => $cval){
			//Log::info("RATE DATA ",['clientdetails' => $cval["clientdetails"], 'client_commodities' => $cval["client_commodities"]]);
			$client_final_rates[] = array("clientdetails" => $cval["clientdetails"], "clientrates" => $this->calculate_client_commodities($cval["client_commodities"], $this->clientcodesmall));
		}
		app('redis')->set('WLclientsrates_'.$this->clientcodesmall, json_encode($client_final_rates));
		
		//$this->execute_ratealert();
		
		/* $client_details = $this->clients_details();
		foreach($client_details as $dkey => $dval){
			if(!empty($dval['requiredhighlowalert'])){
				if(date("H:i") > date("H:i", strtotime($dval['alert_from'])) && date("H:i") < date("H:i", strtotime($dval['alert_to']))){
					$this->execute_highlowalerts($dval);
				}
			}
		} */
		
		
		//return $client_final_rates;
	}
	/**
	* This method is used to create all clients commodities
	* This will be arrive from stored client commoditygroupupdate redis key
	* All the client list will be taken from *WLclient-* redis key
	* Here also check whether market open and rate on.
	* If else wont create client commodities to calculate final rates
	*/
	public function clients_commodities()
	{
		$client_commodities = array();
		$client_details = $this->clients_details();
		
		foreach($client_details as $dkey => $dval){
		if(app('redis')->get($this->clientcodesmall."commoditydata")){
			$rpanel_settings = array();
			$rpanel_settings = json_decode(app('redis')->get($this->clientcodesmall."rpaneldata"), true);
			if(!empty($rpanel_settings['rpaneldata'])){
				////Log::info('Rpanel Settings :', [$rpanel_settings['rpaneldata']['rate_display']]);
				$ratedisplay = ($rpanel_settings['rpaneldata']['rate_display'] == 1 && $rpanel_settings['rpaneldata']['market_status'] == 0);
				if($ratedisplay){
					$commodity_details = json_decode(app('redis')->get($this->clientcodesmall."commoditydata"), true);
					if(!empty($commodity_details['commodity'])){
						$client_commodities[] = array("clientdetails" => $dval, "client_commodities" => $commodity_details['commodity'], "ccode" => $this->clientcodesmall);
					}
				}
			}
		}
		}
		return $client_commodities;
	}
	/**
	* This method is used to get details of clients
	* This will return stored data against client
	* like client, ratealert, highlow, status, code
	* return as array
	*/
	public function clients_details()
	{
		
		$clientlist = $this->getallclients();
		//Log::info("clientlist", ['clientlist' => $clientlist]); 
		$client_details = array();
		foreach($clientlist as $ckey => $kval){
			$client_details[] = json_decode(app('redis')->get($kval), true);
		}
		return $client_details;
	}
	/**
	* This method is used to create final rates for individual clients
	* Argument receive as array of commodities
	* Loop the commodities array and calculate with base rates and arrive the final rates
	*/
	public function calculate_client_commodities($commodities, $ccode)
	{
		$current_base_rates = $this->get_current_baserates();
		$commodity_rates = array();
		foreach($commodities as $comkey => $comvalue){
			if($ccode == "svg"){
				////Log::info("Client commodity ",['comvalue' => $comvalue]);
			}
			if(isset($comvalue["trade_type"])){
				////Log::info("Client Code ",['ccode' => $ccode]);
				
				if($comvalue["trade_type"] == 0){ //For MCX rate calculation
					$commodity_rates[] = $this->calculate_mcx_rates($current_base_rates, $comvalue, $ccode);
				}elseif($comvalue["trade_type"] == 1){ //For Bank rate calculation
					$commodity_rates[] = $this->calculate_bank_rates($current_base_rates, $comvalue, $ccode);
				}else{ //For Manual rate calculation
					$commodity_rates[] = $this->calculate_manual_rates($current_base_rates, $comvalue);
				}
			}else{
				////Log::info("Trade Type not updated Client Code ",['ccode' => $ccode]);
			}
		}
		return $commodity_rates;
	}
	/**
	* For MCX rate calculation
	* @arg1 base rates array
	* @arg2 commodity details
	* Return the final values of sell and buy rate
	* Return array like array("com_id" => "", "com_name" => "", "selling_rate" => "", "buying_rate" => "")
	*/
	public function calculate_mcx_rates($base_rates, $commodity_details, $ccode)
	{
		if (is_array($base_rates) || is_object($base_rates)) {
		////Log::info("RATE commodity_details ",['commodity_details' => $commodity_details]);
			$calculated_rates = array();
			foreach($base_rates as $bskey => $bsval){
				try {
					if(!empty($commodity_details["mcxcontract"])){
						if($bsval["gold1_symbol"] == $commodity_details["mcxcontract"]){ // Check commodity contract and base rate contract
							$purity = 100;
							$retail_rate = "-";
							if($commodity_details["rcom_sell_callpurity"] == 1){ //Will check whether need  to convert 0.995
								if(!isset($commodity_details['rcom_sell_tax'])){
									if($commodity_details["rcom_sell_diff_type"] == 0) //This line determine the diff type 
										$base_ask = ($bsval["gold1_ask"] + $commodity_details["sell_diff"]) / 0.995;
									else
										$base_ask = ($bsval["gold1_ask"] - $commodity_details["sell_diff"]) / 0.995;
								}else{
									if($commodity_details["rcom_sell_diff_type"] == 0) //This line determine the diff type 
									{
										$base_ask = (($bsval["gold1_ask"] + $commodity_details["sell_diff"]) * ((100 + $commodity_details['rcom_sell_tax']) / 100)) / 0.995;
									}
									else{
										$base_ask = (($bsval["gold1_ask"] - $commodity_details["sell_diff"]) * ((100 + $commodity_details['rcom_sell_tax']) / 100)) / 0.995;
									}
								}
							}else{
								if($commodity_details["rcom_sell_diff_type"] == 0)
									$base_ask = $bsval["gold1_ask"] + $commodity_details["sell_diff"];
								else
									$base_ask = $bsval["gold1_ask"] - $commodity_details["sell_diff"];
							}
							if(isset($commodity_details['is_gst']))
							{
								if($commodity_details['is_gst'] == 1){
									$base_ask = ($base_ask * ((100 + $commodity_details['rcom_sell_tax']) / 100));
								}
							}
							if(isset($commodity_details['is_tcs']))
							{
								if($commodity_details['is_tcs'] == 1){
									$base_ask = ($base_ask * ((100 + $commodity_details['rcom_sell_tcs']) / 100));
								}
							}
							if($ccode != 'ibpl'){
								if($commodity_details['com_isregion'] == 1) {
									if($commodity_details['com_calpurity'] == 0) { //if purity = 995
										$base_ask = $base_ask / 0.995;
									} else { //if purity = 999 OR 9999
										$base_ask = $base_ask / 1;
									}
									//rate1 = rate + (rate * tax/100) Tax calculation
									$base_ask +=($base_ask *  ($commodity_details['com_tax'] / 100));
									//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
									$base_ask +=($base_ask *  ($commodity_details['com_octroi'] / 100));
									//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
									$base_ask +=($base_ask *  ($commodity_details['com_stamduty'] / 100));					
								}else {
									if(!isset($commodity_details['com_display_purity'])){
										$commodity_details['com_display_purity'] = 0;
									}
									if($commodity_details['com_display_purity'] != 0) {
										$purity = $commodity_details['com_display_purity'];
									}
									$base_ask = $base_ask * ($purity / 100);
								}
							}
							$selling_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($base_ask, $commodity_details['com_weight']) : $this->silver_conversion($base_ask, $commodity_details['com_weight']);
							$sellingrate = $this->manual_roundoff($selling_con, $commodity_details['com_correction_type'], 'ask');
							//Buying rate calculation start here
							if($commodity_details["rcom_buy_callpurity"] == 1){ //Will check whether need  to convert 0.995
								if(!isset($commodity_details['rcom_buy_tax'])){
									if($commodity_details["rcom_buy_diff_type"] == 0) //This line determine the diff type 
										$base_bid = ($bsval["gold1_bid"] + $commodity_details["buy_diff"]) / 0.995;
									else
										$base_bid = ($bsval["gold1_bid"] - $commodity_details["buy_diff"]) / 0.995;
								}else{
									if($commodity_details["rcom_buy_diff_type"] == 0) //This line determine the diff type 
									{
										$base_bid = (($bsval["gold1_bid"] + $commodity_details["buy_diff"]) * ((100 + $commodity_details['rcom_buy_tax']) / 100)) / 0.995;
									}
									else{
										$base_bid = (($bsval["gold1_bid"] - $commodity_details["buy_diff"]) * ((100 + $commodity_details['rcom_buy_tax']) / 100)) / 0.995;
									}
								}
							}else{
								if($commodity_details["rcom_buy_diff_type"] == 0)
									$base_bid = $bsval["gold1_bid"] + $commodity_details["buy_diff"];
								else
									$base_bid = $bsval["gold1_bid"] - $commodity_details["buy_diff"];
							}
							if(isset($commodity_details['is_gst']))
							{
								if($commodity_details['is_gst'] == 1){
									$base_bid = ($base_bid * ((100 + $commodity_details['rcom_buy_tax']) / 100));
								}
							}
							if(isset($commodity_details['is_tcs']))
							{
								if($commodity_details['is_tcs'] == 1){
									$base_bid = ($base_bid * ((100 + $commodity_details['rcom_buy_tcs']) / 100));
								}
							}
							if($ccode != 'ibpl'){
								if($commodity_details['com_isregion'] == 1) {
									if($commodity_details['com_calpurity'] == 0) { //if purity = 995
										$base_bid = $base_bid / 0.995;
									} else { //if purity = 999 OR 9999
										$base_bid = $base_bid / 1;
									}
									//rate1 = rate + (rate * tax/100) Tax calculation
									$base_bid +=($base_bid *  ($commodity_details['com_tax'] / 100));
									//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
									$base_bid +=($base_bid *  ($commodity_details['com_octroi'] / 100));
									//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
									$base_bid +=($base_bid *  ($commodity_details['com_stamduty'] / 100));					
								}else {
									if($commodity_details['com_display_purity'] != 0) {
										$purity = $commodity_details['com_display_purity'];
									}
									$base_bid = $base_bid * ($purity / 100);
								}
							}
							$buying_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($base_bid, $commodity_details['com_weight']) : $this->silver_conversion($base_bid, $commodity_details['com_weight']);
							$buying_rate = $this->manual_roundoff($buying_con, $commodity_details['com_correction_type'], 'bid');
							
							if($commodity_details['com_sel_active'] == 1) {
								//set selling price selling price = rate + premium + other charges
								if($commodity_details['com_premium_type'] == 1){
									$selling_rate = $commodity_details['com_sel_premium'];
								}else{
									$selling_rate =  $sellingrate + $commodity_details['com_sel_premium'] + $commodity_details['com_other_charges'];
								}
								$selling_rate = number_format($this->manual_roundoff($selling_rate, $commodity_details['com_correction_type'], 'ask'),$commodity_details['com_roundoff'],'.','');
								//$selling_rate = round($this->manual_roundoff($selling_rate, $commodity_details['com_correction_type'], 'ask'),$commodity_details['com_roundoff'],'.','');
							}else $selling_rate = '-';
							
							if(!empty($commodity_details['com_selretail_active'])) {
								if($commodity_details['com_selretail_active'] == 1) {
								//set selling price selling price = rate + premium + other charges
								$retail_rate = $commodity_details['com_premium_type'] == 1 ? $sellingrate : $sellingrate + $commodity_details['com_selretail_premium'] + $commodity_details['com_other_charges'];
								$retail_rate = number_format($this->manual_roundoff($retail_rate, $commodity_details['com_correction_type'], 'ask'),$commodity_details['com_roundoff'],'.','');
								}else $retail_rate = '-';
							}
							
							//Display buying rate
							if($commodity_details['com_buy_active'] == 1 ) {
								if($commodity_details['com_premium_type'] == 1){
									$buying_rate = $commodity_details['com_buy_premium'];
								}else{
								//set buying price buying price = rate + premium
									$buying_rate = $buying_rate +  $commodity_details['com_buy_premium'];
								}
								$buying_rate = number_format($this->manual_roundoff($buying_rate,  $commodity_details['com_correction_type'],'bid'),$commodity_details['com_roundoff'],'.','');
							}else $buying_rate = '-';
							
							$calculated_rates = array("com_id" => $commodity_details['com_id'], "com_name" => $commodity_details['com_name'], "selling_rate" => $selling_rate, "buying_rate" => $buying_rate, "delivery" => $commodity_details['deliverydays'], "retail_rate" => $retail_rate);
						}
					}
				}catch(Exception $e) {
					//Log::info('Exception.', ['Exception' => $e->getMessage()]);
				}
			}
			return $calculated_rates;
		}
		else {
			Log::error("Unexpected data type for base_rates: " . json_encode($base_rates));
		}
	}
	/**
	* For Bank rate calculation
	* @arg1 base rates array
	* @arg2 commodity details
	* Return the final values of sell and buy rate
	*/
	public function calculate_bank_rates($base_rates, $commodity_details, $ccode)
	{
		$calculated_rates = array();
		foreach($base_rates as $bskey => $bsval){
			if($bsval["gold1_symbol"] == $commodity_details["bankcontract"]){ // Check commodity contract and base rate contract
				$inr_ask = 0;
				$inr_bid = 0;
				$purity = 100;
				foreach($base_rates as $bsrkey => $bsrval){
					if($bsrval["gold1_symbol"] == "SPOT-INR"){
						$inr_ask = $bsrval["gold1_ask"];
						$inr_bid = $bsrval["gold1_bid"];
					}
				}
				$bank_kgrate = ($bsval["gold1_ask"] + $commodity_details["premium"]) * ($inr_ask + $commodity_details["rupeepremium"]);
				if($commodity_details['bconvert_value_type'] == 1)
					$bank_kgrate =  $bank_kgrate + $commodity_details['bconvert_value'];
				elseif($commodity_details['bconvert_value_type'] == 2)
					$bank_kgrate =  $bank_kgrate - $commodity_details['bconvert_value'];
				elseif($commodity_details['bconvert_value_type'] == 3)
					$bank_kgrate =  $bank_kgrate * $commodity_details['bconvert_value'];
				elseif($commodity_details['bconvert_value_type'] == 4)
					$bank_kgrate =  $bank_kgrate / $commodity_details['bconvert_value'];
										
				if($commodity_details['bextra_charges'] > 0){
					if($commodity_details['bextra_type'] == 1){
						$bank_kgrate = $bank_kgrate + $commodity_details['bextra_charges'];
					}elseif($commodity_details['bextra_type'] == 2){
						$bank_kgrate = $bank_kgrate - $commodity_details['bextra_charges'];
					}elseif($commodity_details['bextra_type'] == 3){
						$bank_kgrate = $bank_kgrate * $commodity_details['bextra_charges'];
					}elseif($commodity_details['bextra_type'] == 4){
						$bank_kgrate = ($bank_kgrate / $commodity_details['bextra_charges']);
					}
				}
				$bank_kgrate = $bank_kgrate + $commodity_details['custom'];
										
				if($commodity_details['tax'] > 0){
					if($commodity_details['taxtype'] == 1){
						$bank_kgrate = ($bank_kgrate * ((100 + $commodity_details['tax']) / 100));
					}else if($commodity_details['taxtype'] == 2){
						$bank_kgrate = $bank_kgrate + $commodity_details['tax'];
					}
				}
				if($commodity_details['pure'] == 1){
					$bank_kgrate = ($bank_kgrate / 0.995);
				}
				$bankrate = 0;
										
				if($commodity_details['com_type'] == 0){
					$bankrate = ($bank_kgrate / 100);
				}else{
					$bankrate = $bank_kgrate;
				}
				if($commodity_details["rcom_sell_diff_type"] == 0) //This line determine the diff type 
						$base_ask = ($bankrate + $commodity_details["sell_diff"]);
				else
					$base_ask = ($bankrate - $commodity_details["sell_diff"]);
				if($ccode != 'ibpl'){
					if($commodity_details['com_isregion'] == 1) {
						if($commodity_details['com_calpurity'] == 0) { //if purity = 995
							$base_ask = $base_ask / 0.995;
						}else { //if purity = 999 OR 9999
							$base_ask = $base_ask / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$base_ask +=($base_ask *  ($commodity_details['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$base_ask +=($base_ask *  ($commodity_details['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$base_ask +=($base_ask *  ($commodity_details['com_stamduty'] / 100));	
					}else{
						if($commodity_details['com_display_purity'] != 0) {
							$purity = $commodity_details['com_display_purity'];
						}
						$base_ask = $base_ask * ($purity / 100);
					}
				}
				$selling_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($base_ask, $commodity_details['com_weight']) : $this->silver_conversion($base_ask, $commodity_details['com_weight']);
				$selling_rate = $this->manual_roundoff($selling_con, $commodity_details['com_correction_type'], 'ask');
				
				//Buying rate calculation start here
				if($commodity_details["rcom_buy_diff_type"] == 0)
					$base_bid = $bankrate + $commodity_details["buy_diff"];
				else
					$base_bid = $bankrate - $commodity_details["buy_diff"];
				if($ccode != 'ibpl'){
					if($commodity_details['com_isregion'] == 1) {
						if($commodity_details['com_calpurity'] == 0) { //if purity = 995
							$base_bid = $base_bid / 0.995;
						} else { //if purity = 999 OR 9999
							$base_bid = $base_bid / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$base_bid +=($base_bid *  ($commodity_details['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$base_bid +=($base_bid *  ($commodity_details['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$base_bid +=($base_bid *  ($commodity_details['com_stamduty'] / 100));					
					}else {
						if($commodity_details['com_display_purity'] != 0) {
							$purity = $commodity_details['com_display_purity'];
						}
						$base_bid = $base_bid * ($purity / 100);
					}
				}
				$buying_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($base_bid, $commodity_details['com_weight']) : $this->silver_conversion($base_bid, $commodity_details['com_weight']);
				$buying_rate = $this->manual_roundoff($buying_con, $commodity_details['com_correction_type'], 'bid');
				
				if($commodity_details['com_sel_active'] == 1) {
					if($commodity_details['com_premium_type'] == 1){
						$selling_rate = $commodity_details['com_sel_premium'];
					}else{
					//set selling price selling price = rate + premium + other charges
						$selling_rate = $selling_rate + $commodity_details['com_sel_premium'] + $commodity_details['com_other_charges'];
					}
					$selling_rate = number_format($this->manual_roundoff($selling_rate, $commodity_details['com_correction_type'], 'ask'),$commodity_details['com_roundoff'],'.','');
				}else $selling_rate = '-';
				//Display buying rate
				if($commodity_details['com_buy_active'] == 1 ) {
					if($commodity_details['com_premium_type'] == 1){
						$buying_rate = $commodity_details['com_buy_premium'];
					}else{
					//set buying price buying price = rate + premium
						$buying_rate = $buying_rate +  $commodity_details['com_buy_premium'];
					}
					$buying_rate = number_format($this->manual_roundoff($buying_rate,  $commodity_details['com_correction_type'],'bid'),$commodity_details['com_roundoff'],'.','');
				}else $buying_rate = '-';
				
				$calculated_rates = array("com_id" => $commodity_details['com_id'], "com_name" => $commodity_details['com_name'], "selling_rate" => $selling_rate, "buying_rate" => $buying_rate, "delivery" => $commodity_details['deliverydays']);
			}
		}
		return $calculated_rates;
	}
	/**
	* For Manual rate calculation
	* @arg1 base rates array
	* @arg2 commodity details
	* Return the final values of sell and buy rate
	*/
	public function calculate_manual_rates($base_rates, $commodity_details)
	{
		$calculated_rates = array();
		$purity = 100;
		$base_ask = $commodity_details['sell_rate'];
		if($commodity_details['com_isregion'] == 1) {
			if($commodity_details['com_calpurity'] == 0) { //if purity = 995
				$base_ask = $base_ask / 0.995;
			}else { //if purity = 999 OR 9999
				$base_ask = $base_ask / 1;
			}
			//rate1 = rate + (rate * tax/100) Tax calculation
			$base_ask +=($base_ask *  ($commodity_details['com_tax'] / 100));
			//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
			$base_ask +=($base_ask *  ($commodity_details['com_octroi'] / 100));
			//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
			$base_ask +=($base_ask *  ($commodity_details['com_stamduty'] / 100));	
		}else{
			if(!isset($commodity_details["com_display_purity"])){
				$commodity_details['com_display_purity'] = 0;
			}
			if($commodity_details['com_display_purity'] != 0) {
				$purity = $commodity_details['com_display_purity'];
			}
			$base_ask = $base_ask * ($purity / 100);
		}
		$selling_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($base_ask, $commodity_details['com_weight']) : $this->silver_conversion($base_ask, $commodity_details['com_weight']);
		$selling_rate = $this->manual_roundoff($selling_con, $commodity_details['com_correction_type'], 'ask');
		
		$buying_con = $commodity_details['com_type'] == 0 ? $this->gold_conversion($commodity_details['buy_diff'], $commodity_details['com_weight']) : $this->silver_conversion($commodity_details['buy_diff'], $commodity_details['com_weight']);

		$buying_rate = $selling_con - $buying_con;
		$buying_rate = $this->manual_roundoff($buying_rate, $commodity_details['com_correction_type'], 'bid');
		
		if($commodity_details['com_sel_active'] == 1) {
			//set selling price selling price = rate + premium + other charges
			$selling_rate = $commodity_details['com_premium_type'] == 1 ? $commodity_details['com_sel_premium'] : $selling_rate + $commodity_details['com_sel_premium'] + $commodity_details['com_other_charges'];
			$selling_rate = number_format($this->manual_roundoff($selling_rate, $commodity_details['com_correction_type'], 'ask'),$commodity_details['com_roundoff'],'.','');
		}else $selling_rate = '-';
		//Display buying rate
		if($commodity_details['com_buy_active'] == 1 ) {
			//set buying price buying price = rate + premium
			$buying_rate = $commodity_details['com_premium_type'] == 1 ? $commodity_details['com_buy_premium'] : $buying_rate +  $commodity_details['com_buy_premium'];
			$buying_rate = number_format($this->manual_roundoff($buying_rate,  $commodity_details['com_correction_type'],'bid'),$commodity_details['com_roundoff'],'.','');
		}else $buying_rate = '-';
		
		$calculated_rates = array("com_id" => $commodity_details['com_id'], "com_name" => $commodity_details['com_name'], "selling_rate" => $selling_rate, "buying_rate" => $buying_rate, "delivery" => $commodity_details['deliverydays']);
		return $calculated_rates;
	}
	/**
	* This method is used to convert bank gold rates
	* This will convert 1 kg value 
	* arg1 1kg rate 
	* arg2 conversion weight
	*/
	public function gold_spotrateconversion($con_value, $com_weight) {
		return (($con_value / 1000) * $com_weight);
	}
	/**
	* This method is used to convert gold rates
	* This will convert 10 grm rate to commodity weight 
	* arg1 10 grm rate 
	* arg2 conversion weight
	*/
	public function gold_conversion($con_value, $com_weight) {
		return (($con_value / 10) * $com_weight);
	}
	/**
	* This method is used to convert silver rates
	* This will convert 1 kg value to commodity weight
	* arg1 1kg rate 
	* arg2 conversion weight
	*/
	public function silver_conversion($con_value, $com_weight) {
		return (($con_value / 1000) * $com_weight);
	}
	/**
	* This method is used to round off the values for finally display
	* Receive the 3 argument 
	* @arg1 round_value which need to do round off
	* @arg2 round_method which need to found value
	* @arg3 type which is indicate whether ask / bid round off
	*/
	public function manual_roundoff($round_value, $round_method, $type) {
		$convert_value = 0;
		if($type == 'ask')
		{
			if($round_method == 0){
				$convert_value = $round_value;
			}else{
				$convert_value = ceil($round_value / $round_method) * $round_method;
			}
		} else {
			if($round_method == 0){
				$convert_value = $round_value;
			}else{
				$convert_value = floor($round_value / $round_method) * $round_method;
			}
		}
		return $convert_value;
	}
	/**
	* This method is used to get current base rates
	* This will return the current base rates as array
	*/
	/* public function get_current_baserates()
	{
		//Log::info('UpdateBaseRatesJob started');
		try {
			$redis = app('redis'); // Use Laravel's Redis abstraction
			$redis_key = 'lmxliverates'; // Key to fetch
			$data = $redis->get($redis_key); // Fetch data from Redis
			//Log::info("dataliverates", ['dataliverates' => $data]); 
			if ($data) {
				// Decode JSON data if necessary
				$decodedData = json_decode($data, true);
		
				// Retrieve the data from the new key
				$baserates = json_decode($redis->get('lmxliverates'), true);
				
				//Carbon validation start 
				$rate_valid = true;
				$mcxrates = array();
				foreach($decodedData as $rkey => $rval){
					//if(!empty($rval["gold1_bid"]) && !empty($rval["gold1_ask"])){
						
					if($rval['gold1_symbol'] == 'GOLD-C' || $rval['gold1_symbol'] == 'SILVER-C')
					{
						if(!empty($rval["gold1_bid"]) && !empty($rval["gold1_ask"])){
							$goldbaseaskrates = $rval["gold1_ask"];
							$goldbasebidrates = $rval["gold1_bid"];
							
							foreach($baserates as $ekey => $eval){
								if($eval['gold1_symbol'] == 'GOLD-C' || $rval['gold1_symbol'] == 'SILVER-C')
								{	
									if($goldbaseaskrates |= $eval["gold1_ask"] || $goldbaseaskrates < $eval["gold1_ask"] || $goldbasebidrates > $eval["gold1_bid"] || $goldbasebidrates < $eval["gold1_bid"]){
										app('redis')->set("WLMCXUpdatetime", Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s')));
									}
								}
							}
						}
					}
				
					if( $rval['gold1_symbol'] == "GOLDDEC" || $rval['gold1_symbol'] == "SILVERDEC" || $rval['gold1_symbol'] == "SPOT-INR" || $rval['gold1_symbol'] == "SPOT-GOLD" || $rval['gold1_symbol'] == "SPOT-SILVER" || $rval['gold1_symbol'] == "PLATINUM" || $rval['gold1_symbol'] == "USDAED" || $rval['gold1_symbol'] == "GOLDAMFIX" || $rval['gold1_symbol'] == "GOLDPMFIX"){
						if($rval['gold1_symbol'] == "GOLDDEC"){
							$rval['gold1_symbol'] = "GOLD-C";
						}else if($rval['gold1_symbol'] == "SILVERDEC"){
							$rval['gold1_symbol'] = "SILVER-C";
						}
						if( $rval['gold1_symbol'] != "SPOT-GOLD" || $rval['gold1_symbol'] == "SPOT-INR" || $rval['gold1_symbol'] == "SPOT-SILVER"){
							$osrates[] = $rval;
						}
						$mcxrates[] = $rval;
						}
					//}
				}
				if($rate_valid){
					app('redis')->set('WLBaseRatesUpdated_'.$this->clientcodesmall, Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s')));
					//Log::info("Received data ",['request' => $receivedrates]);
					app('redis')->set('WLMCXBaseRates_'.$this->clientcodesmall, json_encode($mcxrates));
					//event(new MCXRateUpdates(json_encode($mcxrates)));
				}
				// Return the final data
				return $baserates;
			} else {
				return "Key '{$redis_key}' not found in Redis.";
			}
		} catch (\Exception $e) {
			// Handle Redis connection error
			return "Failed to connect to Redis: " . $e->getMessage();
		}
	} */
	public function get_current_baserates()
	{
		try {
			$redis    = app('redis');

			//  Fetch both keys 
			$xml_data = json_decode($redis->get('lmxliverates'), true) ?? [];
			$mt5_data = json_decode($redis->get('lmxliveprice_mt'), true) ?? [];

			//  Merge into one array 
			$decodedData = array_merge($xml_data, $mt5_data);

			if (empty($decodedData)) {
				return "No data found in Redis.";
			}

			//  Use merged data as baserates too 
			$baserates = $decodedData;

			$rate_valid = true;
			$mcxrates   = array();
			$osrates    = array();

			foreach ($decodedData as $rkey => $rval) {

				if ($rval['gold1_symbol'] == 'GOLD-C' || $rval['gold1_symbol'] == 'SILVER-C') {
					if (!empty($rval["gold1_bid"]) && !empty($rval["gold1_ask"])) {
						$goldbaseaskrates = $rval["gold1_ask"];
						$goldbasebidrates = $rval["gold1_bid"];

						foreach ($baserates as $ekey => $eval) {
							if ($eval['gold1_symbol'] == 'GOLD-C' || $rval['gold1_symbol'] == 'SILVER-C') {
								if ($goldbaseaskrates != $eval["gold1_ask"] || $goldbasebidrates != $eval["gold1_bid"]) {
									app('redis')->set("WLMCXUpdatetime", Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s')));
								}
							}
						}
					}
				}

				if (
					$rval['gold1_symbol'] == "GOLDDEC"     ||
					$rval['gold1_symbol'] == "SILVERDEC"   ||
					$rval['gold1_symbol'] == "SPOT-INR"    ||
					$rval['gold1_symbol'] == "SPOT-GOLD"   ||
					$rval['gold1_symbol'] == "SPOT-SILVER" ||
					$rval['gold1_symbol'] == "PLATINUM"    ||
					$rval['gold1_symbol'] == "USDAED"      ||
					$rval['gold1_symbol'] == "GOLDAMFIX"   ||
					$rval['gold1_symbol'] == "GOLDPMFIX"   ||
					$rval['gold1_symbol'] == "GOLDJUNREF"  ||   // ← MT5 symbol
					$rval['gold1_symbol'] == "SILVERMAYREF"     // ← MT5 symbol
				) {
					if ($rval['gold1_symbol'] == "GOLDDEC") {
						$rval['gold1_symbol'] = "GOLD-C";
					} else if ($rval['gold1_symbol'] == "SILVERDEC") {
						$rval['gold1_symbol'] = "SILVER-C";
					}

					if ($rval['gold1_symbol'] != "SPOT-GOLD" || $rval['gold1_symbol'] == "SPOT-INR" || $rval['gold1_symbol'] == "SPOT-SILVER") {
						$osrates[] = $rval;
					}
					$mcxrates[] = $rval;
				}
			}

			if ($rate_valid) {
				app('redis')->set('WLBaseRatesUpdated_' . $this->clientcodesmall, Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s')));
				app('redis')->set('WLMCXBaseRates_' . $this->clientcodesmall, json_encode($mcxrates));
			}

			return $baserates;

		} catch (\Exception $e) {
			return "Failed to connect to Redis: " . $e->getMessage();
		}
	}
	/**
	* This method is used to remove the rate alert / limit order
	* Request will be receive from clients cloud site.
	* Logic created like just remove the array based on condition from existing array
	* Check the condition like client name and book no
	*/
	public function removeratealertrequest(Request $request)
	{
		$message = "";
		$validator = Validator::make($request->all(), [
            'client' 		=> 'required',
			'book_no'		=> 'required',
        ],
		[
            'client.required' 		=> 'Client name is required',
			'book_no.required'		=> 'Booking no. is required',
        ]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
		
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			foreach($request->input('book_no') as $book_no){
				foreach($ratealert_deails as $key => $ratealert){
					if($ratealert['client'] ==  $request->input('client') &&  $ratealert['book_no'] ==  $book_no) {
						unset($ratealert_deails[$key]);
						app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
						$message = 'Request removed successfully.';
					}
				}
			}
		}else{
			$message = 'No record found for given request.';
		}
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to remove the rate alert request which ever executed successfully.
	* This method will be call from this own controller after rate reached the request rate.
	* This method will be call after the success request send to cloud server for update 
	* in individual client table.
	* @parem array all the executed rates for client will be receive here 
	* array(array("client" => "svg", "book_no" => 12), array("client" => "pr", "book_no" => 10))
	* Need to remove executed client rates from WLratealertclients_bullion redis key.
	*/
	public function remove_executed_ratealert($executedrates)
	{
		if (app('redis')->get('WLratealertclients_'.$this->clientcodesmall)) {
			$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
			foreach($ratealert_deails as $key => $ratealert){
				foreach($executedrates as $exkey => $exvalue){
					if($ratealert['client'] ==  $exvalue['client'] &&  $ratealert['book_no'] ==  $exvalue['book_no']) {
						unset($ratealert_deails[$key]);
					}
				}
			}
			app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
			$message = 'Request removed successfully.';
		}else{
			$message = 'No record found for given request.';
		}
		return array('error' => false, 'message' => $message);
	}
	/**
	* This method is used to get all clients current rates
	* This will return array of commodities and rates
	*/
	public function allclients_current_rates()
	{
		$all_clients_rates = array();
		$clients_rates = json_decode(app('redis')->get('WLclientsrates_'.$this->clientcodesmall), true);
		foreach($clients_rates as $crkey => $cval){
			$all_clients_rates[$cval["clientdetails"]["code"]] = $cval["clientrates"];
		}
		return $all_clients_rates;
	}
	/**
	* This method is used to get given client rates
	* @parem1 client code
	* Return represent client commodities rates
	*/
	public function client_current_rates(Request $request)
	{
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
		
		$client_rates = array();
		$clients_rates = json_decode(app('redis')->get('WLclientsrates_'.$this->clientcodesmall), true);
		
		if($this->tradable){
			foreach($clients_rates as $crkey => $cval){
				//print_r($cval);exit; 
				if($cval["clientdetails"]["code"] == $request->input('client')){
					//print_r($cval["clientrates"]);exit;
					$client_rates = $cval["clientrates"];
				}
			}
		}
		 //print_r($client_rates);exit;
		foreach($client_rates as $ckey => $crates){
			$client_rates[$ckey]['tradable'] = $this->getTradable();
		}
		//print_r($client_rates);exit; 
		
		//Log::info("Client Cur Rate ",['currates' => $client_rates, 'clientname' => $request->input('client')]); 
		return $client_rates;
	}
		
	/**
	* This method is used to execute the rate alert / limit order
	* This will check the clients settings whether rate alert / limit order enabled
	* Will check clients final rate and clients customers requested rates 
	* If match rates for customers request it will pass arguments to queue to dispatch job
	* Jobs are sending sms / notification and sending executed flag for client with book no
	* This will call curl to pass values to notify client cloud site to update status in db 
	* for respected client customers book no.
	*/
	public function execute_ratealert()
	{
		$isexecuted = false;
		$isorders = false;
		$isalerts = false;
		$executed_orders = array();
		$executed_alerts = array();
		$clients_executed_orders = array();
		$clients_executed_alerts = array();
		$clients_rates = json_decode(app('redis')->get('WLclientsrates_'.$this->clientcodesmall), true);
		$clients_allert_requests = array();
		$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
		if(!empty($ratealert_deails)){
			foreach($ratealert_deails as $rakey => $raval){
				foreach($clients_rates as $crkey => $cval){
					if($raval["client"] == $cval["clientdetails"]["code"]){
						foreach($cval["clientrates"] as $key => $val){
							if(!empty($val['com_id']) && !empty($raval['book_comid'])){
								if($val['com_id'] == $raval['book_comid']){
									if($raval['book_type'] == 0){
										if($raval['book_rate'] >= $val['selling_rate'] && $raval['alert_type'] != 2 && is_numeric($val['selling_rate']) && $val['selling_rate'] != 0) {
											if($raval['alert_type'] == 0){
												$executed_orders[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['selling_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'confirmedon' => date('Y-m-d H:i:s'));
												$isorders = true;
											}elseif($raval['alert_type'] == 1){
												$isalerts = true;
												$executed_alerts[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['selling_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'device_id' => $raval['device_id'], 'mobile_no' => $raval['mobile_no'], 'confirmedon' => date('Y-m-d H:i:s'));
											}
											unset($ratealert_deails[$rakey]);
											$isexecuted = true;
										}else if($raval['book_rate'] <= $val['selling_rate'] && $raval['alert_type'] == 2 && is_numeric($val['selling_rate']) && $val['selling_rate'] != 0) { //For stop loss price
											$isorders = true;
											$executed_orders[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['selling_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'confirmedon' => date('Y-m-d H:i:s'));
											unset($ratealert_deails[$rakey]);
											$isexecuted = true;
											
										}
									}else if($raval['book_type'] == 2){
										if($raval['book_rate'] >= $val['retail_rate'] && is_numeric($val['retail_rate']) && $val['retail_rate'] != 0) {
											if($raval['alert_type'] == 0){
												$executed_orders[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['retail_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'confirmedon' => date('Y-m-d H:i:s'));
												$isorders = true;
											}elseif($raval['alert_type'] == 1){
												$isalerts = true;
												$executed_alerts[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['retail_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'device_id' => $raval['device_id'], 'mobile_no' => $raval['mobile_no'], 'confirmedon' => date('Y-m-d H:i:s'));
											}
											unset($ratealert_deails[$rakey]);
											$isexecuted = true;
										}
									}else if($raval['book_type'] == 1){
										if($raval['book_rate'] <= $val['buying_rate'] && $raval['alert_type'] == 0 && is_numeric($val['buying_rate']) && $val['buying_rate'] != 0) {
											if($raval['alert_type'] == 0){
												$executed_orders[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['buying_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'confirmedon' => date('Y-m-d H:i:s'));
												$isorders = true;
											}elseif($raval['alert_type'] == 1){
												$isalerts = true;
												$executed_alerts[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['buying_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'device_id' => $raval['device_id'], 'mobile_no' => $raval['mobile_no'], 'confirmedon' => date('Y-m-d H:i:s'));
											}
											unset($ratealert_deails[$rakey]);
											$isexecuted = true;
										}else if($raval['book_rate'] >= $val['selling_rate'] && $raval['alert_type'] == 1 && is_numeric($val['buying_rate']) && $val['buying_rate'] != 0) {
												$isalerts = true;
												$executed_alerts[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['selling_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'device_id' => $raval['device_id'], 'mobile_no' => $raval['mobile_no'], 'confirmedon' => date('Y-m-d H:i:s'));
												unset($ratealert_deails[$rakey]);
												$isexecuted = true;
										}else if($raval['book_rate'] >= $val['buying_rate'] && $raval['alert_type'] == 2 && is_numeric($val['buying_rate']) && $val['buying_rate'] != 0) {
											$executed_orders[] = array('client' => $cval["clientdetails"]["client"], 'CusId' => $raval['book_cusid'], 'ComId' => $val['com_id'],'com_name' => $val['com_name'], 'currate' => str_replace( ',', '',$val['buying_rate']), 'Rate' => $raval['book_rate'], 'Weight' => $raval['book_qty'], 'BNo' => $raval['book_no'], 'confirmedon' => date('Y-m-d H:i:s'));
											$isorders = true;
											$isexecuted = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		if($isexecuted){
			app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
		}
		if($isorders){
			Log::info('Limit execution job creation.', ['executed_orders' => $executed_orders]);
			foreach($executed_orders as $key => $orders)
			{
				$clients_executed_orders[$orders['client']][$key] = $orders;
			}
			$this->update_client_executed_rates($clients_executed_orders);
		}
		if($isalerts){
			Log::info('Alert execution job creation.', ['executed_alerts' => $executed_alerts]); 
			foreach($executed_alerts as $key => $orders)
			{
			   $clients_executed_alerts[$orders['client']][$key] = $orders;
			}
			$this->update_client_executed_alerts($clients_executed_alerts);
		}
	}
	/**
	* This method is used to check and execute the MCX rates high/low differences
	*/
	public function execute_highlowalerts($client_details){
		if($this->tradable){
			//$currentbaserates = json_decode(app('redis')->get("WLBaseRates"),true);
			//$currentbaserates = json_decode(app('redis')->get(app('redis')->get("WLBaseRatesFinal")),true);
			$currentbaserates = json_decode(app('redis')->get("lmxliverates"),true);
			$exealerts = array();
			if(app('redis')->get("WLupdown-" . $client_details['client'])) {
				$lastrate = json_decode(app('redis')->get("WLupdown-" . $client_details['client']), true);
				$updownrate = $client_details['higlowalertsettings'];
				$cgrate = 0;
				$csrate = 0;
				$inr_ask = 0;
				$gold_ask = 0;
				$silver_ask = 0;
				if($client_details['alertfor'] == 2){
					foreach($currentbaserates as $ckey => $cval){
						if($cval['gold1_symbol'] == $client_details['gold_contract']){
							$cgrate = $cval['gold1_ask'];
						}else if($cval['gold1_symbol'] == $client_details['silver_contract']){
							$csrate = $cval['gold1_ask'];
						}else if($cval['gold1_symbol'] == $client_details['exchange_rate']){
							$inr_ask = $cval['gold1_ask'];
						}
					}
				}else{
					$rpanel_settings = json_decode(app('redis')->get($client_details['code']."rpaneldata"), true);
					foreach($rpanel_settings['rpanelbank'] as $rpkey => $rpval){
						foreach($currentbaserates as $ckey => $cval){
							if($cval['gold1_symbol'] == $rpval['bcontract_rate'] && $rpval['bcontract_rate'] == $client_details['bank_gold_contract']){
								$gold_ask = $cval['gold1_ask'];
							}else if($cval['gold1_symbol'] == $rpval['bcontract_rate'] && $rpval['bcontract_rate'] == $client_details['bank_silver_contract']){
								$silver_ask = $cval['gold1_ask'];
							}else if($cval['gold1_symbol'] == $client_details['exchange_rate']){
								$inr_ask = $cval['gold1_ask'];
							}
						}
					}
					foreach($rpanel_settings['rpanelbank'] as $rpkey => $rpval){
						if($rpval['bcontract_rate'] == $client_details['bank_gold_contract']){ //Gold Bank Rate Calculation
							$cgrate = ($gold_ask + $rpval["premium"]) * ($inr_ask + $rpval["rupeepremium"]);
							if($rpval['bconvert_value_type'] == 1)
								$cgrate =  $cgrate + $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 2)
								$cgrate =  $cgrate - $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 3)
								$cgrate =  $cgrate * $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 4)
								$cgrate =  $cgrate / $rpval['bconvert_value'];
													
							if($rpval['bextra_charges'] > 0){
								if($rpval['bextra_type'] == 1){
									$cgrate = $cgrate + $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 2){
									$cgrate = $cgrate - $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 3){
									$cgrate = $cgrate * $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 4){
									$cgrate = ($cgrate / $rpval['bextra_charges']);
								}
							}
							$cgrate = $cgrate + $rpval['custom'];
													
							if($rpval['btax_value'] > 0){
								if($rpval['btax_type'] == 1){
									$cgrate = ($cgrate * ((100 + $rpval['btax_value']) / 100));
								}else if($rpval['btax_type'] == 2){
									$cgrate = $cgrate + $rpval['btax_value'];
								}
							}
							if($rpval['pure'] == 1){
								$cgrate = ($cgrate / 0.995);
							}
							$cgrate = number_format(($cgrate / 100),0,'.','');
						}else if($rpval['bcontract_rate'] == $client_details['bank_silver_contract']){ //Silver Bank Rate Calculation 
							$csrate = ($silver_ask + $rpval["premium"]) * ($inr_ask + $rpval["rupeepremium"]);
							if($rpval['bconvert_value_type'] == 1)
								$csrate =  $csrate + $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 2)
								$csrate =  $csrate - $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 3)
								$csrate =  $csrate * $rpval['bconvert_value'];
							elseif($rpval['bconvert_value_type'] == 4)
								$csrate =  $csrate / $rpval['bconvert_value'];
													
							if($rpval['bextra_charges'] > 0){
								if($rpval['bextra_type'] == 1){
									$csrate = $csrate + $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 2){
									$csrate = $csrate - $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 3){
									$csrate = $csrate * $rpval['bextra_charges'];
								}elseif($rpval['bextra_type'] == 4){
									$csrate = ($csrate / $rpval['bextra_charges']);
								}
							}
							$csrate = $csrate + $rpval['custom'];
													
							if($rpval['btax_value'] > 0){
								if($rpval['btax_type'] == 1){
									$csrate = ($csrate * ((100 + $rpval['btax_value']) / 100));
								}else if($rpval['btax_type'] == 2){
									$csrate = $csrate + $rpval['btax_value'];
								}
							}
							if($rpval['pure'] == 1){
								$csrate = ($csrate / 0.995);
							}
							$csrate = number_format($csrate,0,'.','');
						}
					}
				}
				if((int)($lastrate['gprice'] - $cgrate) > (int)$updownrate['gold_down'] && (int)$updownrate['gold_down'] > 0) {
					$updaterate = $lastrate;
					$updaterate['gprice'] = $cgrate;
					app('redis')->set("WLupdown-" . $client_details['client'], json_encode($updaterate));
					$exealerts['title'] = $client_details['name'];
					$exealerts['client'] = $client_details['client'];
					$exealerts['message'] = "Gold Down By Rupees : " . ($lastrate['gprice'] - $cgrate);
					if($client_details['alertfor'] == 2){
						$exealerts['message'] = $exealerts['message'] ." , Gold : ".$cgrate. " , Silver : ".$csrate;
					}else{
						$exealerts['message'] = $exealerts['message'] ." , Gold : ".$cgrate." Gold($) : ".$gold_ask." INR : ".$inr_ask;
					}
					$this->execute_client_updown_alerts($exealerts);
				}else if((int)($cgrate - $lastrate['gprice']) > (int)$updownrate['gold_up'] && (int)$updownrate['gold_up'] > 0) {
					$updaterate = $lastrate;
					$updaterate['gprice'] = $cgrate;
					app('redis')->set("WLupdown-" . $client_details['client'], json_encode($updaterate));
					$exealerts['title'] = $client_details['name'];
					$exealerts['client'] = $client_details['client'];
					$exealerts['message'] = "Gold Up By Rupees : " . ($cgrate - $lastrate['gprice']);
					if($client_details['alertfor'] == 2){
						$exealerts['message'] = $exealerts['message'] ." , Gold : ".$cgrate. " , Silver : ".$csrate;
					}else{
						$exealerts['message'] = $exealerts['message'] ." , Gold : ".$cgrate." Gold($) : ".$gold_ask." INR : ".$inr_ask;
					}
					$this->execute_client_updown_alerts($exealerts);
				}
				if((int)($lastrate['sprice'] - $csrate) > (int)$updownrate['silver_down'] && (int)$updownrate['silver_down'] > 0) {
					$updaterate = $lastrate;
					$updaterate['sprice'] = $csrate;
					app('redis')->set("WLupdown-" . $client_details['client'], json_encode($updaterate));
					$exealerts['title'] = $client_details['name'];
					$exealerts['client'] = $client_details['client'];
					$exealerts['message'] = "Silver Down By Rupees : " . ($lastrate['sprice'] - $csrate);
					if($client_details['alertfor'] == 2){
						$exealerts['message'] = $exealerts['message'] ." , Silver : ".$csrate. " , Gold : ".$cgrate;
					}else{
						$exealerts['message'] = $exealerts['message'] ." , Silver : ".$csrate." Silver($) : ".$silver_ask." INR : ".$inr_ask;
					}
					$this->execute_client_updown_alerts($exealerts);
				}else if((int)($csrate - $lastrate['sprice']) > (int)$updownrate['silver_up'] && (int)$updownrate['silver_up'] > 0) {
					$updaterate = $lastrate;
					$updaterate['sprice'] = $csrate;
					app('redis')->set("WLupdown-" . $client_details['client'], json_encode($updaterate));
					$exealerts['title'] = $client_details['name'];
					$exealerts['client'] = $client_details['client'];
					$exealerts['message'] = "Silver Up By Rupees : " . ($csrate - $lastrate['sprice']);
					if($client_details['alertfor'] == 2){
						$exealerts['message'] = $exealerts['message'] ." , Silver : ".$csrate. " , Gold : ".$cgrate;
					}else{
						$exealerts['message'] = $exealerts['message'] ." , Silver : ".$csrate." Silver($) : ".$silver_ask." INR : ".$inr_ask;
					}
					$this->execute_client_updown_alerts($exealerts);
				}
			}else{
				$cgrate = 0;
				$csrate = 0;
				$inr_ask = 0;
				if($client_details['alertfor'] == 2){
					foreach($currentbaserates as $ckey => $cval){
						if($cval['gold1_symbol'] == $client_details['gold_contract']){
							$cgrate = $cval['gold1_ask'];
						}else if($cval['gold1_symbol'] == $client_details['silver_contract']){
							$csrate = $cval['gold1_ask'];
						}
					}
				}else{
					try {
						$gold_ask = 0;
						$silver_ask = 0;
						$rpanel_settings = json_decode(app('redis')->get($client_details['code']."rpaneldata"), true);
						foreach($rpanel_settings['rpanelbank'] as $rpkey => $rpval){
							foreach($currentbaserates as $ckey => $cval){
								if($cval['gold1_symbol'] == $rpval['bcontract_rate'] && $rpval['bcontract_rate'] == $client_details['bank_gold_contract']){
									$gold_ask = $cval['gold1_ask'];
								}else if($cval['gold1_symbol'] == $rpval['bcontract_rate'] && $rpval['bcontract_rate'] == $client_details['bank_silver_contract']){
									$silver_ask = $cval['gold1_ask'];
								}else if($cval['gold1_symbol'] == $client_details['exchange_rate']){
									$inr_ask = $cval['gold1_ask'];
								}
							}
						}
						foreach($rpanel_settings['rpanelbank'] as $rpkey => $rpval){
							if($rpval['bcontract_rate'] == $client_details['bank_gold_contract']){ //Gold Bank Rate Calculation
								$cgrate = ($gold_ask + $rpval["premium"]) * ($inr_ask + $rpval["rupeepremium"]);
								if($rpval['bconvert_value_type'] == 1)
									$cgrate =  $cgrate + $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 2)
									$cgrate =  $cgrate - $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 3)
									$cgrate =  $cgrate * $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 4)
									$cgrate =  $cgrate / $rpval['bconvert_value'];
														
								if($rpval['bextra_charges'] > 0){
									if($rpval['bextra_type'] == 1){
										$cgrate = $cgrate + $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 2){
										$cgrate = $cgrate - $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 3){
										$cgrate = $cgrate * $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 4){
										$cgrate = ($cgrate / $rpval['bextra_charges']);
									}
								}
								$cgrate = $cgrate + $rpval['custom'];
														
								if($rpval['btax_value'] > 0){
									if($rpval['btax_type'] == 1){
										$cgrate = ($cgrate * ((100 + $rpval['btax_value']) / 100));
									}else if($rpval['btax_type'] == 2){
										$cgrate = $cgrate + $rpval['btax_value'];
									}
								}
								if($rpval['pure'] == 1){
									$cgrate = ($cgrate / 0.995);
								}
								$cgrate = number_format(($cgrate / 100),0,'.','');
							}else if($rpval['bcontract_rate'] == $client_details['bank_silver_contract']){ //Silver Bank Rate Calculation 
								$csrate = ($silver_ask + $rpval["premium"]) * ($inr_ask + $rpval["rupeepremium"]);
								if($rpval['bconvert_value_type'] == 1)
									$csrate =  $csrate + $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 2)
									$csrate =  $csrate - $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 3)
									$csrate =  $csrate * $rpval['bconvert_value'];
								elseif($rpval['bconvert_value_type'] == 4)
									$csrate =  $csrate / $rpval['bconvert_value'];
														
								if($rpval['bextra_charges'] > 0){
									if($rpval['bextra_type'] == 1){
										$csrate = $csrate + $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 2){
										$csrate = $csrate - $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 3){
										$csrate = $csrate * $rpval['bextra_charges'];
									}elseif($rpval['bextra_type'] == 4){
										$csrate = ($csrate / $rpval['bextra_charges']);
									}
								}
								$csrate = $csrate + $rpval['custom'];
														
								if($rpval['btax_value'] > 0){
									if($rpval['btax_type'] == 1){
										$csrate = ($csrate * ((100 + $rpval['btax_value']) / 100));
									}else if($rpval['btax_type'] == 2){
										$csrate = $csrate + $rpval['btax_value'];
									}
								}
								if($rpval['pure'] == 1){
									$csrate = ($csrate / 0.995);
								}
								$csrate = number_format($csrate,0,'.','');
							}
						}
					}catch(Exception $e) {
						////Log::info('Exception.', ['Exception' => $e->getMessage()]);
					}
				}
				$lastrate = array('gprice' => $cgrate, 'sprice' => $csrate);
				app('redis')->set("WLupdown-" . $client_details['client'], json_encode($lastrate));
			}
		}
	}
	public function execute_client_updown_alerts($executed_clients_alerts)
	{
		//Log::info('Up/Down alert details.', ['updownalerts' => $executed_clients_alerts]);
		$updatealerts = new HighLowExecuteJob();
		$updatealerts->executehighlowalerts($executed_clients_alerts);
        dispatch($updatealerts);
	}
	/**
	* This method is used to send queue job of executed rates
	* Dispatch the job to run in background to update the cloud site
	* @parem1 Client executed rates array
	*/
	public function update_client_executed_test(Request $executed_clients_rates)
	{
		app('redis')->set("test-data", '987');
		//dispatch(new sendexecutedrates($executed_clients_rates));
		$updaterequest = new RateExecutedJob();
		$updaterequest->sendexecutedrates([]);
        dispatch($updaterequest);
	}
	public function update_client_executed_rates($executed_clients_rates)
	{
		//Log::info('Rate execution job creation.', ['limitexecution' => $executed_clients_rates]);
		app('redis')->set("test-data", '12987');
		$updaterequest = new RateExecutedJob();
		$updaterequest->sendexecutedrates($executed_clients_rates);
        dispatch($updaterequest);

	}
	/**
	* This method is used to send queue job of executed rate alert requests
	* Dispatch the job to run in background to send SMS / Notification
	* @parem1 Client executed rate alert array
	*/
	public function update_client_executed_alerts($executed_clients_rates= array())
	{
		//Log::info('Rate alert execution job creation.', [$executed_clients_rates]);
		$alertrequest = new RateAlertExecutedJob();
		$alertrequest->sendexecutedrates($executed_clients_rates);
        dispatch($alertrequest);
	}
	/**
	* This method call from service to check whether rate updating or not.
	* This method is used to check the trading status
	* This method is used to update automatic trade on / off
	* This method is used to update limit expiry for given time.
	*/
	public function check_client_update_trade()
	{
		$allclienttradestatusdetails = app('redis')->keys("WLclienttradestatus-*");
		$clienttradingstatus_details = array();
		$client_trading_status_update = array();
		$client_limit_status_update = array();
		foreach($allclienttradestatusdetails as $ckey => $cval){
			$clienttradingstatus_details = json_decode(app('redis')->get($cval), true);
			if($clienttradingstatus_details['limit_expire'] == 1){
				if(date("H:i", strtotime($clienttradingstatus_details['limit_expire_time'])) == date("H:i")){
					$book_numbers = array();
					$ratealert_deails 	= json_decode(app('redis')->get('WLratealertclients_'.$this->clientcodesmall), true);
					if(!empty($ratealert_deails)){
						foreach($ratealert_deails as $rakey => $raval){
							if($raval["client"] == $clienttradingstatus_details['client']){
								$book_numbers[] = $raval['book_no'];
								unset($ratealert_deails[$rakey]);
							}
						}
						if(!empty($book_numbers)){
							$client_limit_status_update[] = array("client" => $clienttradingstatus_details['client'], 'book_numbers' => $book_numbers);
							app('redis')->set('WLratealertclients_'.$this->clientcodesmall, json_encode($ratealert_deails));
						}
					}
				}
			}
			if($clienttradingstatus_details['trade_on'] == 1 || $clienttradingstatus_details['trade_off'] == 1){
				if(date("H:i", strtotime($clienttradingstatus_details['trade_on_time'])) == date("H:i")){
					$client_trading_status_update[] = array("client" => $clienttradingstatus_details['client'], "trade_enable" => 1);
					$clienttradingstatus_details['trade_enable'] = 1;
					app('redis')->set("WLclienttradestatus-" . $clienttradingstatus_details['client'], json_encode($clienttradingstatus_details));
				}elseif(date("H:i", strtotime($clienttradingstatus_details['trade_off_time'])) == date("H:i")){
					$client_trading_status_update[] = array("client" => $clienttradingstatus_details['client'], "trade_enable" => 0);
					$clienttradingstatus_details['trade_enable'] = 0;
					app('redis')->set("WLclienttradestatus-" . $clienttradingstatus_details['client'], json_encode($clienttradingstatus_details));
				}
			}
		}
		//Log::info('client_trading_status_update:', ['data' => json_encode($client_trading_status_update)]);

		//Log::info('client_trading_status_update :', [$client_trading_status_update]);
		if(!empty($client_trading_status_update)){
			$updatestatus = new TradingStatusUpdateJob();
			$updatestatus->sendtradingstatus($client_trading_status_update);
			dispatch($updatestatus);
			event(new WLTradeStatusUpdate($client_trading_status_update));
		}
		if(!empty($client_limit_status_update)){
			$updateorderstatus = new OrderStatusUpdatedJob();
			$updateorderstatus->sendorderstatus($client_limit_status_update);
			dispatch($updateorderstatus);
		}
	}
	/**
	* This method is used to check and return whether current rates are tradable
	* This will check the current rate update time
	* Except holidays, this need to check
	*/
	public function getTradable()
	{
		if (app('redis')->get("WLHolidays")) {
			$holidays_list = json_decode(app('redis')->get("WLHolidays"), true);
		}else{
			$holidays_list = array();
		}
		$today = date("d-m-Y");
		if(in_array($today, $holidays_list) || date('D') == 'Sat' || date('D') == 'Sun'){
			return 1;
		}else{
			if(Carbon::createFromFormat('Y-m-d H:i:s', app('redis')->get('WLBaseRatesUpdated_'.$this->clientcodesmall))  > Carbon::now()->subSeconds(40)->toDateTimeString()){
				return 1;
			}else{
				return 0;
			}
		}
		
	}
	/**
	* This method call from service to check whether rate updating or not.
	* If rates are not updated means email will send to appropriate person to alert
	* This function will call only on week days
	* Here we will check the condition like current not fall in holidays.
	*/
	public function check_rate_update()
	{
		$today = date("d-m-Y");
		if (app('redis')->get("WLHolidays")) {
			$holidays_list = json_decode(app('redis')->get("WLHolidays"), true);
		}else{
			$holidays_list = array();
		}
		//$holidays_list = json_decode(app('redis')->get("WLHolidays"), true);
		if(!in_array($today, $holidays_list)){
			//Log::info('Rate updated on :'.app('redis')->get("WLBaseRatesUpdated"));
			if(Carbon::createFromFormat('Y-m-d H:i:s', app('redis')->get("WLMCXUpdatetime"))  > Carbon::now()->subSeconds(30)->toDateTimeString()){
			
				//app('redis')->set("WLBaseRatesFinal", "WLBaseRates");
				
				//echo "Rate Updating";
				//Log::info("check_rate_update ", ['request' => "check_rate_update"]);
			}else{
				if(Carbon::createFromFormat('Y-m-d H:i:s', app('redis')->get("WLMCXUpdatetime"))  < Carbon::createFromFormat('Y-m-d H:i:s', app('redis')->get("WLMCXUpdatetime_new"))){
					//app('redis')->set("WLBaseRatesFinal", "WLBaseRates1");
					
					$notified_on = json_decode(app('redis')->get("WLRateNotify"), true); 
					if(!empty($notified_on)){
						if(Carbon::createFromFormat('Y-m-d H:i:s', $notified_on['notifiedon'])  < Carbon::now()->subMinutes(15)->toDateTimeString()){ 
							app('redis')->set("WLRateNotify", json_encode(array("notifiedon" => date('Y-m-d H:i:s'))));
							$this->sendmail(); 
							$this->sendwhatsapp();
						}
					}else{
						app('redis')->set("WLRateNotify", json_encode(array("notifiedon" => date('Y-m-d H:i:s'))));
						$this->sendmail();
						$this->sendwhatsapp();
					}
				}
				else{
					//app('redis')->set("WLBaseRatesFinal", "WLBaseRates");
				}
				//$this->sendwhatsapp(); 
				/* Log::info("check swift ", ['request' => "swiftrates"]);
				Log::info('check WLBaseRatesFinal :'.app('redis')->get("WLBaseRatesFinal"));
				Log::info('check WLBaseRates1 :'.app('redis')->get("WLBaseRates1")); */
				
			}
		}
		
		//return Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s'));
		//$dt = Carbon::createFromFormat('d-m-Y H:i:s', date('d-m-Y H:i:s'));
		//echo $dt->toDateTimeString();
		/* $time_remaining  = strtotime(Carbon::now()->toDateTimeString()) - strtotime(Carbon::createFromFormat('Y-m-d H:i:s', app('redis')->get("WLBaseRatesUpdated")));
		echo app('redis')->get("WLBaseRatesUpdated");
		echo $time_remaining; */
	}
	public function updateholiday(Request $request)
	{
		$validator = Validator::make($request->all(), [
            'holidays' => 'required',
        ],
		[
			'holidays.required' 	=> 'Holidays list required',
		]);
		if ($validator->fails()) {
            return array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
        }
	  
		if (app('redis')->get("WLHolidays")) {
			$holidays_list = json_decode(app('redis')->get("WLHolidays"), true);
		}else{
			$holidays_list = array();
		}
		foreach($request->input('holidays') as $holiday){
			$holidays_list[] = $holiday;
		}
		app('redis')->set("WLHolidays", json_encode($holidays_list));
		return app('redis')->get("WLHolidays");
	}
	public function holidaylist(Request $request)
	{
		return app('redis')->get("WLHolidays");
	}
	public function check_rpaneldata(Request $request)
	{
		$rpanel_settings = json_decode(app('redis')->get("svgrpaneldata"), true);
		$ratedisplay = ($rpanel_settings['rpaneldata']['rate_display'] == 1 && $rpanel_settings['rpaneldata']['market_status'] == 0);
		return (string)$ratedisplay;
		//return $rpanel_settings['rpanelbank'];
	}
	public function show_client_trade_details(Request $request)
	{
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
		return app('redis')->get("WLclienttradestatus-" . $request->input('client'));
	}
	public function show_client_details(Request $request)
	{
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
		return app('redis')->get("WLclient-" . $request->input('client'));
	}
	
	public function sendmail()
	{
		Mail::to('prabakaran@logimaxindia.com')->send(new SendMailable($name));
		return 'Email was sent';
	}
	public function sendwhatsapp()
	{
		$name = 'Cache Server 10';
		$message = "Rate are not updating in this hosting: ".$name;
		$whatsappurl_cv ="http://whatsappsms.creativepoint.in/api/";
		$instanceid = "clr2jxfou02f1kpiednvrx4i6";
		$whatsappurl = $whatsappurl_cv."sendText?token=".$instanceid."&phone=919942171205&message=".urlencode($message);
		
		$curl = curl_init();
		curl_setopt_array($curl, array(
		  CURLOPT_URL => $whatsappurl,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'GET',
		));
		$response = curl_exec($curl); 

		if (curl_errno($curl)) {
			$error_msg = curl_error($curl);
			log_message("error", (__METHOD__).". Data: ".json_encode($message)." Response: ".$response." Msg: ".$error_msg);
		}
		curl_close($ch);
	}
	public function removeclient(Request $request)
	{
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
		//return app('redis')->get("WLclient-" . $request->input('client'));
		if (app('redis')->get("WLclient-" . $request->input('client'))) {
			app('redis')->del("WLclient-" . $request->input('client')); 
			return app('redis')->keys("WLclient-*");
		}else{
			return 'client name not find';
		}
	}
}
