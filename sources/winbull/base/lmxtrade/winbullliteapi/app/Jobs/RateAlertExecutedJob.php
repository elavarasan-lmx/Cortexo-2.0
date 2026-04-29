<?php
namespace App\Jobs;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use App\PushExecutedratealerts;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class RateAlertExecutedJob implements ShouldQueue
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
		$executealerts = new PushExecutedratealerts();
		$executealerts->pushRates($this->executedrates);
	}
	/**
	* This will handle the job to send SMS / Notification in background
	*/
 	public function handle()
    {
		//Log::info("Push Executed rate alerts Queues Handle", ['ExRates' => $this->executedrates]);
		$executealerts = new PushExecutedratealerts();
		$executealerts->pushRates($this->executedrates);
	}
}

