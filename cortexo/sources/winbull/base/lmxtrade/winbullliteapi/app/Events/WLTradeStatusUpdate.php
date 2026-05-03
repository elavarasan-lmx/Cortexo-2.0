<?php
namespace App\Events;

/**
 *
 * @author admin
 *        
 */
use Illuminate\Support\Facades\Log;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;


class WLTradeStatusUpdate implements ShouldBroadcastNow
{
	use SerializesModels;
    /**
     */
	public $updatedata;
	
    public function __construct($updatedata)
    {
		$this->updatedata = $updatedata;
	}
	public function broadcastOn()
	{
	    //Log::info('WL Trade Event broadcast updatedata .', ['updatedata' => $this->updatedata]); 
		return ['wltradeupdate'];
	}
}

