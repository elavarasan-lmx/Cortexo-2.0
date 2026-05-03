<?php
   
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
   
class WhiteListDomainMiddleware
{
    public $whiteIps = ['192.168.1.1', '127.0.0.1', '1.23.176.180', '18.139.18.248', '1.22.24.145'];
   /*  public $allowedUsers = ['kjpl-trade', 'pavithrr-trade'];
    // Add other allowed user names
    public $allowedDomains = [
		'http://kjpl.in', 'http://www.kjpl.in', 'http://localhost', 'http://pavithrrgold.com', 'http://www.pavithrrgold.com',
		// Add other allowed domains here
	]; */

    
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
       /*  //Log::info("origin details", ['origin' => $request->password]);
		if(!empty($request->header('Origin'))){
            $origin = $request->header('Origin');
            // Check if the origin is in the allowed domains
            if (in_array($origin, $this->allowedDomains)) {
                // Valid domain, process the request
                $postData = $request->json()->all();
            }else{
                return response()->json(['your ip address is not valid.']);
            }
        }else{
            if (in_array($request->password, $this->allowedUsers)) {
                // Valid domain, process the request
                $postData = $request->json()->all();
            }else{
                return response()->json(['Your ip is not valid.']);
            }
        } */
        return $next($request);
    }
}