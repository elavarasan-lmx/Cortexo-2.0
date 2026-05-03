var socketurl = '';
var baserateapiurl = '';
var symbols = '';
var flag_settings;
var bcurl;
var bcclient;
var bcusername;
var bcpassword;
var bcupdatetime;
var app_header_chk;
var rateFeed;
var polling;
var websocket_type;

try {
    // Create a request variable and assign a new XMLHttpRequest object to it.
    var request = new XMLHttpRequest()

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', 'http://www.maharajgoldsmith.com/api/getsettings.php', false)

    request.onload = function () {
        // Begin accessing JSON data here
        if (request.status >= 200 && request.status < 400) {
            response = JSON.parse(this.response);
            socketurl = response.socketurl;
            baserateapiurl = response.rateurl;
            symbols = response.symbol;
            bcurl = response.bcurl;
            bcclient = response.bcclient;
            bcusername = response.bcusername;
            bcpassword = response.bcpassword;
            bcupdatetime = response.bcupdatetime;
            app_header_chk = response.app_header_chk;
            rateFeed = response.rateFeed;
            polling = response.polling;
            websocket_type = response.websocket_type;
            flag_settings = 1;
        }
    }
    // Send request
    request.send()
}
catch (e) {
    console.log("socketsample ", e);
    var socketurl = 'http://www.maharajgoldsmith.com/';
    var baserateapiurl = 'http://www.maharajgoldsmith.com/lmxtrade/winbullliteapi/api/v1/wlcurrentrates';
    flag_settings = 0;
}