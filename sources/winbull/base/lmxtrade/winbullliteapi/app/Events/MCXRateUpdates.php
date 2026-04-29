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


class MCXRateUpdates implements ShouldBroadcastNow
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
		return ['mcxratesupdate'];
	}
}

