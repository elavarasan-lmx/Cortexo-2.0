<?php

/**
 * Global Config File
 *
 * @author  Logimax Team
 */

// Prevent direct script access
// if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'GET' && realpath(__FILE__) == realpath($_SERVER['SCRIPT_FILENAME'])) {
// 	header("HTTP/1.0 404 Not Found");
// 	echo "<h1>Not Found</h1>";
// 	echo "The requested URL was not found on this server.";
// 	exit();
// }

/**
 * Global Constants Class
 */
class Globals
{
    /** Website version */
    public static $web_version = "1.0.1";

    /** Admin version */
    public static $admin_web_version = "4.2.0";

    /** Android version names */
    public static $VERSIONNAME         = '1.0.0';
    public static $NEWVERSIONNAME      = '1.0.0';
    public static $CURRENTVERSIONNAME  = '1.0.0';

    /** iOS version names */
    public static $IOSVERSIONNAME         = '1.0.0';
    public static $IOSNEWVERSIONNAME      = '1.0.0';
    public static $IOSCURRENTVERSIONNAME  = '1.0.0';

    /** OTR flags */
    public static $IOS_OTR      = 0;
    public static $ANDROID_OTR  = 0;

    /** User Account Delete */
    public static $IOS_USERDELETE      = 0;
    public static $ANDROID_USERDELETE  = 0;

    /** Base URLs */
    public static $web_base_url   = "http://www.maharajgoldsmith.com/";
    public static $app_base_url   = "http://www.maharajgoldsmith.com/mobileapi/";
    public static $admin_base_url = "http://www.maharajgoldsmith.com/admin/";

    /** Database credentials */
    public static $hostname = "database-1.cb86ugsw4aax.ap-south-1.rds.amazonaws.com";
    public static $username = "admin";
    public static $password = "admin2k25";
    public static $database = "maharaj";

    /** Website details */
    public static $web_title     = "Maharaj Gold Smith";
    public static $web_copyright = "© 2026 Maharaj Gold Smith. All Rights Reserved";

    /** Client information */
    public static $client = "maharaj";

    /** Socket details */
    public static $socket_base_url = "http://www.maharajgoldsmith.com/";
    public static $rate_socketurl  = "http://www.maharajgoldsmith.com/ratesocket/socket.io";

    /** LS connection details */
    public static $lsrateurl           = "http://72.52.178.11:8080";
    public static $lsrateadapter       = "WLSTOCKLIST_REMOTE";
    public static $lsrateprovider      = "WLQUOTE_ADAPTER";
    public static $lsrateusername      = "lmxwinbullliteapp";
    public static $lsrateusernameapp   = "lmxwinbullliteapp";

    /** API endpoints */
    public static $rateurl = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlcurrentrates";

    /** Broadcast Rate Details */
    public static $rpbcencdata = "http://www.maharajgoldsmith.com/index.php/C_rates/rp_rate_data";
    public static $bcencdata   = "http://www.maharajgoldsmith.com/index.php/C_rates/rate_data";
    public static $txtdata     = "http://www.maharajgoldsmith.com/client/logimax.txt";
    public static $rp_txtdata  = "http://www.maharajgoldsmith.com/client/logimax.txt";
    public static $bcurl       = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/broadcastrates";
    public static $bcsrurl     = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/broadcastsourcerates";
    public static $ratesocketurl = "http://www.maharajgoldsmith.com";
    public static $nativesocketurl = "ws://www.maharajgoldsmith.com/ws";

    public static $bcclient    = "maharaj";
    public static $bcusername  = "maharaj";
    public static $bcpassword  = "maharaj-trade";
    public static $bcupdatetime = "800";

    /** Data types and flags */
    public static $bcrateType = 2;   // 0-> normal(php) 1-> encryption(php)   2-> websocket // Web
    public static $app_header_chk = 0;
    public static $rpRateType   = 0;  // 0=PHP encryption, 1=websocket  (For Rpanel)
    public static $rateFeed = 4;  // 0-> encryption(php) 1-> broadcastrate 2-> text file 3-> Web socket 4-> Native Socket // App
    public static $polling = 1;   // 0-> off 1-> on
    public static $websocket_type = 2;  // 1-> socket.io 2-> Native socket

    /** Encryption Key */
    public static $key = '12@^tyh8901tt56789012345$y89012';

    /** Path to encrypted file */
    public static $path = "/var/www/html/maharaj/client/maharaj.enc";

    /** Socket Event URLs */
    public static $commodityupdate         = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajcommoditygroupupdate";
    public static $rpanelupdate            = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajrpanelupdate";
    public static $newsupdate              = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajnewsupdate";
    public static $marqueeupdate           = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajmarqueeupdate";
    public static $createratealert         = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlcreateratealert";
    public static $updateratealert         = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlupdateratealert";
    public static $cancelratealert         = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlremoveratealert";
    public static $clearallratealert     = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlremoveclientratealerts";
    public static $bookupdate              = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajbookupdate";
    public static $limitupdate             = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajlimitupdate";
    public static $settingsupdate          = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlupdateclienttrade";
    public static $getrates                = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlclientsrates";
    public static $clientdetails           = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlclientdetails";
    public static $createclient            = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlcreateclient";
    public static $terminateuser        = "http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/maharajterminateuserupdate";


    /** Socket Events */
    public static $evt_commupdate        = "maharajupdatecommodity:App\\\Events\\\MAHARAJCommodityUpdates";
    public static $evt_rpanelupdate       = "maharajupdaterpanel:App\\\Events\\\MAHARAJRpanelUpdates";
    public static $evt_bookupdate        = "maharajupdatebook:App\\\Events\\\MAHARAJBookUpdates";
    public static $evt_limitupdate        = "maharajupdatelimit:App\\\Events\\\MAHARAJLimitUpdates";
    public static $evt_trdstatusupdate  = "wltradeupdate:App\\\Events\\\WLTradeStatusUpdate";
    public static $evt_marqueeupdate    = "maharajupdatemarquee:App\\\Events\\\MAHARAJMarqueeUpdates";
    public static $evt_newsupdate        = "maharajupdatenews:App\\\Events\\\MAHARAJNewsUpdates";
    public static $evt_textupdate         = "maharajupdatetext:App\\\Events\\\MAHARAJTextUpdates";
    public static $evt_terminateuser    = "maharajupdateusertermination:App\\\Events\\\MAHARAJUserUpdates";


    /** Notification Settings */
    public static $notification_title             = "Maharaj Bullion";
    public static $notification_subtitle          = "From Maharaj Bullion";
    public static $onesignalAPI                   = "https://onesignal.com/api/v1/notifications";
    public static $app_id                         = "2bcb8b30-4518-48cf-8cdb-a0c869588bda";
    public static $onesignalauth                  = "os_v2_app_fpfywmcfdbem7dg3udegswel3ikfm5hgnbsuxz5mlzokb265ijlsuu2mfurkim7fj4563ifqic5s5jxoffwgdenb6j5nhr6vslkgcsy";
    public static $notification_title_admin       = "Maharaj Bullion Admin App";
    public static $notification_subtitle_admin     = "From Maharaj Bullion Admin App";
    public static $app_id_admin                   = "";
    public static $onesingalapi_admin             = "";

    /** WhatsApp Configuration */
    public static $whatsappurl = "http://whatsappsms.creativepoint.in/api/";
    public static $instanceid  = "";

    /** Mobile App URLs */
    public static $androidUrl = "";
    public static $iosUrl     = "";

    /** Enquiry Email IDs */
    public static $enqFromId = "";
    public static $enqToId   = "";
    public static $enqCCId   = "";

    /** Book Number Placeholder */
    public static $bookno_for_mobile = '<i class="phone-portrait"></i><a class="sub-color" href="tel:+91"></a>,<a class="sub-color" href="tel:+91"></a>';

    /** Timezone */
    public static $timezone = "Asia/Kolkata";

    /** Motilal Oswal Hedge Configuration */
    public static $clientcode = "";
    public static $hedge_password = "";
    public static $secret_key = "";
    public static $twoFA = "";
    public static $ApiKey = "";
    public static $authapi = "";
    public static $placeorder = "";
    public static $gold_mini_symbol = "";
    public static $gold_micro_symbol = "";
}

// Set default timezone
date_default_timezone_set(Globals::$timezone);

// Check cURL
if (!function_exists('curl_version')) {
    exit("Enable cURL in PHP to proceed...");
}
