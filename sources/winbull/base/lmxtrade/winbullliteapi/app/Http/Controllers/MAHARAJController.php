<?php

namespace App\Http\Controllers;

/**
 *
 * @author admin
 *        
 */

use Illuminate\Support\Facades\Log;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;
use App\Events\MAHARAJCommodityUpdates;
use App\Events\MAHARAJRpanelUpdates;
use App\Events\MAHARAJMarqueeUpdates;
use App\Events\MAHARAJNewsUpdates;
use App\Events\MAHARAJBookUpdates;
use App\Events\MAHARAJLimitUpdates;
use App\Events\MAHARAJUserUpdates;

class MAHARAJController extends Controller
{
	private $clientcode;
	private $clientcodesmall;
	public function __construct()
	{
		$this->clientcode = config('global.clientcode');
		$this->clientcodesmall = config('global.clientcodesmall');
	}

	public function updatecommoditygroup(Request $request)
	{
		try {
			$request_data = array();
			parse_str($request, $request_data);
			//Log::info("Received data ",['request' => $request_data['commodity']]);
			app('redis')->set($this->clientcodesmall . 'commoditydata', json_encode($request_data['commodity']));
			event(new MAHARAJCommodityUpdates($request_data['commodity']));
		} catch (Exception $e) {
			//Log::info('Exception.', ['Exception' => $e->getMessage()]);
		}
	}
	public function updaterpanel(Request $request)
	{
		try {
			$request_data = array();
			parse_str($request, $request_data);
			app('redis')->set($this->clientcodesmall . 'rpaneldata', json_encode($request_data['rpanel']));
			event(new MAHARAJRpanelUpdates($request_data['rpanel']));
		} catch (Exception $e) {
			//Log::info('Exception.', ['Exception' => $e->getMessage()]);
		}
	}
	public function updatenews(Request $request)
	{
		$request_data = array();
		parse_str($request, $request_data);
		app('redis')->set($this->clientcodesmall . 'newsdata', json_encode($request_data['newstext']));
		event(new MAHARAJNewsUpdates($request_data['newstext']));
	}
	public function updatemarquee(Request $request)
	{
		$request_data = array();
		parse_str($request, $request_data);
		//Log::info("Received data ",['request' => $request_data]);
		app('redis')->set($this->clientcodesmall . 'marqueedata', json_encode($request_data['marqueetext']));
		event(new MAHARAJMarqueeUpdates($request_data['marqueetext']));
	}
	public function updatelimit(Request $request)
	{
		$request_data = array();
		parse_str($request, $request_data);
		//Log::info("Received data ",['request' => $request_data]);
		app('redis')->set($this->clientcodesmall . 'limitdata', json_encode($request_data['limit']));
		event(new MAHARAJLimitUpdates($request_data['limit']));
	}
	public function updatebook(Request $request)
	{
		$request_data = array();
		parse_str($request, $request_data);
		//Log::info("Received data ",['request' => $request_data]);
		app('redis')->set($this->clientcodesmall . 'bookdata', json_encode($request_data['book']));
		event(new MAHARAJBookUpdates($request_data['book']));
	}

	public function updateusertermination(Request $request)
	{
		$request_data = array();
		parse_str($request, $request_data);
		// Log::info("Received data ",['request' => $request_data]);
		app('redis')->set($this->clientcodesmall . 'terminateuserdata', json_encode($request_data['terminateuser']));
		event(new MAHARAJUserUpdates($request_data['terminateuser']));
	}

}
