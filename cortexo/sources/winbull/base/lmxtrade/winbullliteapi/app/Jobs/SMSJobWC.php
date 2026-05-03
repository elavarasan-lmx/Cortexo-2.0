<?php

namespace App\Jobs;
use Log;
use App\User;
use App\MSG91WCrm;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
//use Illuminate\Foundation\Bus\Dispatchable;
use Sender\TransactionalSms;
use Sender\Otp;



class SMSJobWC implements ShouldQueue
{
	 //use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
	 use InteractsWithQueue, Queueable, SerializesModels;
	 protected $mobile;
	 protected $message;
	 protected $messagetype; //1-> OTP 2-> Promotional
	 protected $sender_id;
	 protected $api_key;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(/*User $user*/)
    {
         //$this->user = $user;
		 
    }
	public function setmessage($mobile, $message, $messagetype, $sender_id,$api_key)
	{
		$this->mobile = $mobile;
		$this->message = $message;
		$this->messagetype = $messagetype;
		$this->sender_id = $sender_id;
		$this->api_key = $api_key;
	}

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
		if($this->mobile){
			Log::info("Request SMS Jobs Queues Handle", ['Mobile' => $this->mobile]);
			$MSG91WCrm = new MSG91WCrm();
			$msg91Response = $MSG91WCrm->sendSMS($this->message, $this->mobile, $this->messagetype, $this->sender_id, $this->api_key);
			if($msg91Response['error']){
				Log::error("Message sent faild to $this->mobile", ['Mobile' => $this->mobile, 'message' => $msg91Response['message'], 'messagetype' => $this->messagetype]);
			}else{
				Log::info("Message has been sent to $this->mobile.' '.$this->api_key", ['Mobile' => $this->mobile, 'message' => $msg91Response['message'], 'messagetype' => $this->messagetype]);
			}	
		}
    }
}
