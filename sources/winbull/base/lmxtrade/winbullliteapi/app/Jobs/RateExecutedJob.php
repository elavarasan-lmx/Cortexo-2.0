<?php
namespace App\Jobs;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use App\PushExecutedOrders;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Redis;

class RateExecutedJob implements ShouldQueue
{
	use InteractsWithQueue, Queueable, SerializesModels;
	protected $executedrates;
    /**
     */
    public function __construct()
    {}
	public function sendexecutedrates($clientexecutedrates){
		$this->executedrates = $clientexecutedrates;
		// handle() not working on EC2 server, so we call the method directly.
		$executeorders = new PushExecutedOrders();
		$executeorders->pushRates($this->executedrates);
	}
 	public function handle()
    {
		//app('redis')->set("test-data", '876'); 
		//Log::info("Rate Executed Jobs Class",['RateExecutedData' => $this->executedrates]);
		$executeorders = new PushExecutedOrders();
		$executeorders->pushRates($this->executedrates);
	}
}

