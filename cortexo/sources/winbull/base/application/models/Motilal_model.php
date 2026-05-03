<?php
require_once(APPPATH . 'libraries/GoogleAuthenticator.php');
class Motilal_model extends CI_Model
{

	public function execute($orderData)
	{

		print_r("Motilal Hedge Executed");
		exit;
	}

	// Hedging Part Start
	function login_motilal_oswal($booking_data, $data)
	{
		$ga = new PHPGangsta_GoogleAuthenticator();
		$secret = Globals::$secret_key;
		$code   = $ga->getCode($secret);

		$loginPayload = [
			"userid"   => Globals::$clientcode,
			"password" => Globals::$hedge_password,
			"2FA"      => Globals::$twoFA,
			"totp"     => $code
		];

		$loginHeaders = $this->get_common_headers(true);

		$loginResponse = $this->curl_request(Globals::$authapi, 'POST', json_encode($loginPayload), $loginHeaders);
		$loginData     = json_decode($loginResponse, true);

		if (empty($loginData['AuthToken'])) {
			echo json_encode(["status" => "error", "message" => "AuthToken missing"]);
			return;
		}

		$authToken = $loginData['AuthToken'];

		$book_type   = $booking_data['book_type'] == 0 ? 'BUY' : 'SELL';
		$orderwt     = $booking_data['book_qty'] * 1000;
		$book_no  = $booking_data['book_no'];

		[$goldMegaLots, $goldMiniLots] = $this->calculate_gold_lots($orderwt);

		if ($goldMegaLots > 0) {
			$this->place_order($authToken, $data->gold_mini_symbol, $book_type, $goldMegaLots, $book_no);
		}
		if ($goldMiniLots > 0) {
			$this->place_order($authToken, $data->gold_micro_symbol, $book_type, $goldMiniLots, $book_no);
		}
	}

	function calculate_gold_lots($orderwt)
	{
		$goldMegaLots = 0;
		$goldMiniLots = 0;

		if ($orderwt >= 100) {
			$goldMegaLots = floor($orderwt / 100);
			$orderwt -= $goldMegaLots * 100;
		}

		if ($orderwt > 0) {
			$minorderwt = 6;
			$lots = floor($orderwt / 10);
			if (($orderwt % 10) >= $minorderwt) {
				$lots += 1;
			}
			$goldMiniLots = $lots;
		}

		return [$goldMegaLots, $goldMiniLots];
	}

	function place_order($authToken, $symboltoken, $book_type, $quantityLots, $book_no)
	{
		$orderPayload = [
			"clientcode"       => Globals::$clientcode,
			"exchange"         => 'MCX',
			"symboltoken"      => (int)$symboltoken,
			"buyorsell"        => $book_type,
			"ordertype"        => "MARKET",
			"producttype"      => "NORMAL",
			"orderduration"    => "DAY",
			"price"            => 0,
			"triggerprice"     => 0,
			"quantityinlot"    => (int)$quantityLots,
			"disclosedquantity" => 0,
			"amoorder"         => "N",
			"goodtilldate"     => "",
			"algoid"           => "",
			"tag"              => ""
		];

		//hedge_log
		$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"FN (OrderPayload): " . (print_r($orderPayload, true)) . PHP_EOL .
			"-------------------------" . PHP_EOL;
		// file_put_contents('../logs/hedge_log', $log, FILE_APPEND);
		$logFile = $_SERVER['DOCUMENT_ROOT'] . '/winbullSource/logs/hedge_log';

		file_put_contents($logFile, $log, FILE_APPEND);

		$orderHeaders = $this->get_common_headers(false, $authToken);

		$orderResponse = $this->curl_request(Globals::$placeorder, 'POST', json_encode($orderPayload), $orderHeaders);
		$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"FN (OrderResponse): " . (print_r($orderResponse, true)) . PHP_EOL .
			"-------------------------" . PHP_EOL;
		// file_put_contents('../logs/hedge_log', $log, FILE_APPEND);
		$logFile = $_SERVER['DOCUMENT_ROOT'] . '/winbullSource/logs/hedge_log';

		file_put_contents($logFile, $log, FILE_APPEND);
		$orderData     = json_decode($orderResponse, true);

		if (!empty($orderData)) {
			$this->CI->db->insert('dt_hedge_log', [
				'status'        => $orderData['status'],
				'message'       => $orderData['message'],
				'errorcode'     => $orderData['errorcode'],
				'uniqueorderid' => $orderData['uniqueorderid'],
				'created_at'    => date('Y-m-d H:i:s'),
				'book_no'       => $book_no
			]);
			if ($orderData['status'] != 'ERROR') {
				$this->CI->db->where('book_no', $book_no);
				$this->CI->db->update('dt_booking', array("book_ishedge" => 1));
			}
		}
	}

	function get_common_headers($isLogin = false, $authToken = "")
	{
		$headers = [
			'Accept: application/json',
			'User-Agent: MOSL/V.1.1.0',
			'ApiKey: ' . Globals::$ApiKey,
			'ClientLocalIp: 82.60.76.112',
			'ClientPublicIp: 82.60.76.112',
			'vendorinfo: ' . Globals::$clientcode,
			'SourceId: WEB',
			'MacAddress: 7A-14-01-88-B0-B1',
			'osversion: 10.0.19041',
			'osname: Windows 10',
			'devicemodel: AHV',
			'manufacturer: DELL',
			'productname: Test',
			'productversion: 1',
			'installedappid: 12312312',
			'browsername: Chrome',
			'browserversion: 105.0',
			'Content-Type: application/json'
		];

		if ($isLogin) {
			$headers[] = 'Authorization: true';
		} elseif (!empty($authToken)) {
			$headers[] = "Authorization: $authToken";
		}
		return $headers;
	}

	// Curl Request
	function curl_request($url, $method, $payload, $headers)
	{
		$curl = curl_init();
		curl_setopt_array($curl, [
			CURLOPT_URL            => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CUSTOMREQUEST  => $method,
			CURLOPT_POSTFIELDS     => $payload,
			CURLOPT_HTTPHEADER     => $headers,
			CURLOPT_TIMEOUT        => 30,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1
		]);

		$response = curl_exec($curl);
		$err      = curl_error($curl);
		curl_close($curl);

		if ($err) {
			return json_encode(["status" => "error", "message" => "cURL Error: $err"]);
		}
		return $response;
	}
	// Hedging Part End
}
