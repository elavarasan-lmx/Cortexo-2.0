<?php
namespace App\Jobs;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use App\PushTradingStatusUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class TradingStatusUpdateJob implements ShouldQueue
{
	use InteractsWithQueue, Queueable, SerializesModels;
	protected $tradingstatus;
    /**
     */
    public function __construct()
    {}
	public function sendtradingstatus($clienttradingstatus){
		$this->tradingstatus = $clienttradingstatus;

		$statusupdate = new PushTradingStatusUpdate();
		$statusupdate->pushTradingStatus($this->tradingstatus);
	}
	/**
	* This will handle the job to send SMS / Notification in background
	*/
 	public function handle()
    {
		//Log::info("Push Executed trading status Queues Handle", ['TrdingStatus' => $this->tradingstatus]);
		$statusupdate = new PushTradingStatusUpdate();
		$statusupdate->pushTradingStatus($this->tradingstatus);
	}
}

