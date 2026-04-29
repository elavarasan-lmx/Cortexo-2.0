<?php
namespace App\Jobs;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use App\PushOrderStatusUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderStatusUpdatedJob implements ShouldQueue
{
	use InteractsWithQueue, Queueable, SerializesModels;
	protected $orderstatus;
    /**
     */
    public function __construct()
    {}
	public function sendorderstatus($clientorderstatus){
		$this->orderstatus = $clientorderstatus;

		$statusupdate = new PushOrderStatusUpdate();
		$statusupdate->pushOrderStatus($this->orderstatus);
	}
	/**
	* This will handle the job to send SMS / Notification in background
	*/
 	public function handle()
    {
		Log::info("Push Expiry orders status Queues Handle", ['ExpiryOrderStatus' => $this->orderstatus]);
		$statusupdate = new PushOrderStatusUpdate();
		$statusupdate->pushOrderStatus($this->orderstatus);
	}
}

