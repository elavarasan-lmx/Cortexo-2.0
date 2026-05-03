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


class MAHARAJLimitUpdates implements ShouldBroadcastNow
{
	use SerializesModels;
    /**
     */
	public $updatedata;
	private $clientcodesmall;
	
    public function __construct($updatedata)
    {
		$this->updatedata = $updatedata;
		$this->clientcodesmall = config('global.clientcodesmall');
	}
	public function broadcastOn()
	{
		return [$this->clientcodesmall . 'updatelimit'];
	}
}

