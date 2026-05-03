<?php
   
namespace App\Http\Middleware;
   
use Closure;
use Illuminate\Support\Facades\Log;
   
class CheckIpMiddleware
{
    
    public $whiteIps = ['202.129.197.162','157.49.232.114','192.168.1.1', '127.0.0.1', '1.23.176.180', '18.139.18.248', '54.255.23.197', '59.144.163.116', '122.180.145.240', '122.176.16.58', '122.176.16.62', '118.139.186.1', '113.193.131.246', '1.22.25.88', '128.199.22.44', '54.151.226.222', '13.127.105.85', '103.250.145.3', '1.22.25.43', '34.87.129.189', '1.23.1.148', '42.111.128.2', '42.111.129.71', '115.246.77.138', '119.82.80.62', '139.59.59.114', '115.113.191.18', '103.80.65.178', '182.75.44.194', '13.251.64.130', '117.255.112.66' ]; 
        
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
		$headers = apache_request_headers();
		//Log::info("origin details", ['origin' => $request->header('origin')]);
		//Log::info("HTTP_REFERER", ['HTTP_REFERER' => isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) : NULL]);
        //if (!in_array($request->ip(), $this->whiteIps)) {
		if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			if (!in_array($headers['X-Forwarded-For'], $this->whiteIps)) {
				// Log::info("origin details", ['origin' => parse_url($_SERVER['SERVER_NAME'])]);
				/*
					 You can redirect to any error page. 
				*/
				return response()->json(['your ip address is not valid..']);
			}
		}else{
			//Log::info("origin details", ['origin' => $request]);
			return response()->json(['your ip address is not valid...']);
		}
    
        return $next($request);
    }
}