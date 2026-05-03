<?php
namespace App\Jobs;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use App\PushExecutehighlowalerts;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class HighLowExecuteJob implements ShouldQueue
{
	use InteractsWithQueue, Queueable, SerializesModels;
	protected $highlowalerts;
    /**
     */
    public function __construct()
    {}
	public function executehighlowalerts($hlexecutealerts){
		$this->highlowalerts = $hlexecutealerts;

		$executealerts = new PushExecutehighlowalerts();
		$executealerts->pushHighLowAlerts($this->highlowalerts);
	}
	/**
	* This will handle the job to send SMS / Notification in background
	*/
 	public function handle()
    {
		//Log::info("High/Low Executed alerts Queues Handle", ['ExRates' => $this->highlowalerts]); 
		$executealerts = new PushExecutehighlowalerts();
		$executealerts->pushHighLowAlerts($this->highlowalerts);
		//$this->delete();
	}
}

