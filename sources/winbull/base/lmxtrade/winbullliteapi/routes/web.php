<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/* |-------------------------------------------------------------------------- | Application Routes |-------------------------------------------------------------------------- | | Here is where you can register all of the routes for an application. | It is a breeze. Simply tell Lumen the URIs it should respond to | and give it the Closure to call when that URI is requested. | */

$router->get('/', function () use ($router) {
        return $router->app->version();
});



$router->group(['prefix' => 'api/v1'], function () use ($router) {
        $router->get('/', function () use ($router) {
                        return "Winbull Lite API: " . $router->app->version();
                }
                );
                $router->post('maharajcommoditygroupupdate', 'MAHARAJController@updatecommoditygroup');
                $router->post('maharajrpanelupdate', 'MAHARAJController@updaterpanel');
                $router->post('maharajnewsupdate', 'MAHARAJController@updatenews');
                $router->post('maharajmarqueeupdate', 'MAHARAJController@updatemarquee');
                $router->post('maharajlimitupdate', 'MAHARAJController@updatelimit');
                $router->post('maharajbookupdate', 'MAHARAJController@updatebook');
                $router->post('maharajterminateuserupdate', 'MAHARAJController@updateusertermination');

                $router->post('wlcreateclient', 'WinbullliteController@createclient');
                $router->post('wlupdateclienttrade', 'WinbullliteController@updateclienttradestatus');
                $router->post('wlcreateclientupdownalerts', 'WinbullliteController@createclientupdownalerts');
                $router->post('wlupdateclientupdownalerts', 'WinbullliteController@updateclientupdownalerts');
                $router->post('wlcreateratealert', 'WinbullliteController@createratealert');
                $router->post('wlupdateratealert', 'WinbullliteController@updateratealert');
                $router->post('wlremoveratealert', 'WinbullliteController@removeratealertrequest');
                $router->post('wlremoveclientratealerts', 'WinbullliteController@removeclientratealertrequest');
                $router->post('wlcreatelimitorder', 'WinbullliteController@createlimitorder');
                $router->post('wlupdatelimitorder', 'WinbullliteController@updatelimitorder');
                $router->get('getholidays', 'WinbullliteController@holidaylist');
                $router->post('updateholiday', 'WinbullliteController@updateholiday');
                $router->get('wlallclients', 'WinbullliteController@getallclients');
                //$router->post('wlremoveclient', 'WinbullliteController@removeclient');
        
                $router->get('wlcurrentrates', 'WinbullliteController@getcurrentrates');

                $router->get('testmessage', 'WinbullliteController@testmessage');

                $router->get('wlupdaterates', 'WinbullliteController@createrates');
                $router->post('wlshowclienttrade', 'WinbullliteController@show_client_trade_details');
                $router->get('wlallclientsrates', 'WinbullliteController@allclients_current_rates');
                $router->post('wlclientsrates', 'WinbullliteController@client_current_rates');
                $router->get('wlclientcommodities', 'WinbullliteController@viewallclientsratesrequest');
                $router->post('wlviewclientrequest', 'WinbullliteController@reteriveclientrequest');
                $router->get('checkrateupdate', 'WinbullliteController@check_rate_update');
                $router->get('checkrpaneldata', 'WinbullliteController@check_rpaneldata');
                $router->post('wlclientdetails', 'WinbullliteController@show_client_details');
                $router->get('wlmailcheck', 'WinbullliteController@sendmail');
                $router->get('wlclients_details', 'WinbullliteController@clients_details');


                $router->get('get_current_baserates', 'WinbullliteController@get_current_baserates');

                $router->post('broadcastsourcerates', ['middleware' => 'whiteListDomain', 'uses' => 'BroadcastRatesController@updatesourcerates']);

                $router->post('broadcastrates', ['middleware' => 'whiteListDomain', 'uses' => 'BroadcastRatesController@updateclientrates']);
                $router->post('osbroadcastrates', ['uses' => 'OSBroadcastRatesController@updateclientrates']);

                $router->post('updateclientexecutedtest', 'WinbullliteController@update_client_executed_test');
        });
