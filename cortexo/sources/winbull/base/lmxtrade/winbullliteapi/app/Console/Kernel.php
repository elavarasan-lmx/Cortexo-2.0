<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Laravel\Lumen\Console\Kernel as ConsoleKernel;
use App\Http\Controllers;
use Illuminate\Support\Facades\App; 
use Illuminate\Http\Request;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
	$schedule->call('App\Http\Controllers\WinbullliteController@createclientrates')->everyMinute()->timezone('Asia/Kolkata');
	$schedule->call(function () {

            $this->clientcodesmall = config('global.clientcodesmall');
			$data = ['client' => $this->clientcodesmall];
        	$request = new Request($data);
        App::make(\App\Http\Controllers\BroadcastRatesController::class)->finalupdateclientrates($request); })->everyMinute()->timezone('Asia/Kolkata');
	//$schedule->call('App\Http\Controllers\WinbullliteController@updateratefeed')->weekdays()->everyMinute()->timezone('Asia/Kolkata');
	$schedule->call('App\Http\Controllers\WinbullliteController@check_client_update_trade')->everyMinute()->timezone('Asia/Kolkata')->between('7:00', '24:00');
	//$schedule->call('App\Http\Controllers\WinbullliteController@createclientrates')->everyMinute()->timezone('Asia/Kolkata');
	$schedule->call('App\Http\Controllers\WinbullliteController@executeratealerts')->everyMinute()->timezone('Asia/Kolkata');
	$schedule->call('App\Http\Controllers\WinbullliteController@executehighlowalerts')->everyFifteenMinutes()->timezone('Asia/Kolkata');
    }
}
