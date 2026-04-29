<?php
   
namespace App\Http\Middleware;
   
use Closure;
use Illuminate\Support\Facades\Log;
   
class CheckMyIpMiddleware
{
    
    public $whiteIps = ['192.168.1.1', '127.0.0.1', '1.23.176.180', '18.139.18.248', '54.255.23.197', '59.144.163.116', '122.180.145.240', '122.176.16.58', '122.176.16.62', '118.139.186.1', '113.193.131.246', '1.22.25.88', '128.199.22.44'];
        
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
		print_r($headers);
		
		exit;
		//Log::info("origin details", ['origin' => $request->header('origin')]);
		//Log::info("HTTP_REFERER", ['HTTP_REFERER' => isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) : NULL]);
        //if (!in_array($request->ip(), $this->whiteIps)) {
		if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			if (!in_array($headers['X-Forwarded-For'], $this->whiteIps)) {
				// Log::info("origin details", ['origin' => parse_url($_SERVER['SERVER_NAME'])]);
				/*
					 You can redirect to any error page. 
				*/
				return response()->json(['your ip address is not valid.']);
			}
		}else{
			Log::info("origin details", ['origin' => $request]);
			return response()->json(['your ip address is not valid.']);
		}
    
        return $next($request);
    }
}