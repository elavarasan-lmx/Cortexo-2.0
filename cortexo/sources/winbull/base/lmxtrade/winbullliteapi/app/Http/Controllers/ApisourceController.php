<?php
namespace App\Http\Controllers;

/**
 *
 * @author RVK
 * @Created 25-09-2018
 */
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
use App\Jobs\TYNTECSMSJob;

class ApisourceController extends Controller
{
	private $tradable = true;
    public function __construct()
    {
		
	}
	
	/**
	* This method return the current rates as json string
	*/
	public function getcurrentrates()
	{
		
		return app('redis')->get(app('redis')->get("lmxliverates"));
		//return app('redis')->get("WLBaseRates");
	}
	
	public function updateeconomicapi()
	{
		$url = 'https://api.tradingeconomics.com/news/country/mexico'; 
		$headers = array(
			"Accept: application/json",
			"Authorization: Client guest:guest"
		);

		$curl = curl_init();
		curl_setopt_array($curl, array(
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => "GET",
			CURLOPT_SSL_VERIFYPEER => 0,
			CURLOPT_SSL_VERIFYHOST => 0,
			CURLOPT_HTTPHEADER => $headers
		));  
			
		$response = curl_exec($curl);
		//echo $response;exit;
		curl_close($curl);
		$news = json_decode($response, true);
		//echo app('redis')->get("WLclient-AB");exit;
		if(app('redis')->get("WLEconomicnewsId")) {
			$last_id = app('redis')->get("WLEconomicnewsId");
			foreach($news as $key => $val){
				if($val['id'] > $last_id){
					app('redis')->set("WLEconomicnewsId", $val['id']);
					$exealerts = array();
					$exealerts['title'] = $val['title'];
					$exealerts['client'] = 'AB';
					$exealerts['message'] = $val['description'];
					$updatealerts = new HighLowExecuteJob();
					$updatealerts->executehighlowalerts($exealerts);
					dispatch($updatealerts);
				}
			}
		}else{
			app('redis')->set("WLEconomicnewsId", "133113");
		}
		
		
		return $news;
	}
	
}
