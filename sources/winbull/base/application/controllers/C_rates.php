<?php
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
defined('BASEPATH') OR exit('No direct script access allowed');

class C_rates extends CI_Controller {

    public function rate_data() {

        $filePath = Globals::$path;

        // Ensure file exists
        if (!file_exists($filePath)) {
            echo json_encode(["status" => "error", "message" => "Encrypted file not found"]);
            return;
        }
		$headers = apache_request_headers();

		// if (!isset($headers['Referer'])) {
		// 		echo json_encode(['status' => 'success', 'message' => 'Data decrypted Failed']);
		// 	}else{
				$data = file_get_contents($filePath);

				// Decrypt the base64-encoded payload
				$encryptedData = base64_decode($data);
		
				// Extract the IV (first 16 bytes) and encrypted data (rest)
				$iv = substr($encryptedData, 0, 16);  // First 16 bytes are the IV
				$encrypted = substr($encryptedData, 16);  // Remaining data is the encrypted message
		
				// The encryption key (must match the one used during encryption)
				$encryptionKey = Globals::$key;
				// Decrypt the data using AES-256-CBC
				$decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $encryptionKey, OPENSSL_RAW_DATA, $iv);
		
				if ($decrypted === false) {
					echo '{"status": "error", "message": "Failed to decrypt data"}';
					return;
				}

			header('Content-Type: application/octet-stream');
			echo $decrypted;
		// }
	}    

	public function rp_rate_data() {
		$url = Globals::$bcsrurl;
		
		$postData = json_encode(['bcsclient' => Globals::$bcclient,'bcsusername' => Globals::$bcusername,'bcspassword' => Globals::$bcpassword]);

		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

		$data = curl_exec($ch);
		curl_close($ch);


		$key = Globals::$key;
		$iv = openssl_random_pseudo_bytes(16);  // Generate a random IV for encryption
	

		// Encrypt data
		$encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

		// Combine IV and encrypted data
		$encrypted_data = base64_encode($iv . $encrypted);

        // Ensure file exists
		$headers = apache_request_headers();

		if (!isset($headers['Referer'])) {
				echo json_encode(['status' => 'success', 'message' => 'Data decrypted Failed']);
			}else{
				// Decrypt the base64-encoded payload
				$encryptedData = base64_decode($encrypted_data);
		
				// Extract the IV (first 16 bytes) and encrypted data (rest)
				$iv = substr($encryptedData, 0, 16);  // First 16 bytes are the IV
				$encrypted = substr($encryptedData, 16);  // Remaining data is the encrypted message
		
				// The encryption key (must match the one used during encryption)
				$encryptionKey = Globals::$key;
				// Decrypt the data using AES-256-CBC
				$decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $encryptionKey, OPENSSL_RAW_DATA, $iv);
		
				if ($decrypted === false) {
				echo '{"status": "error", "message": "Failed to decrypt data"}';
				return;
			}

			header('Content-Type: application/octet-stream');
			echo $decrypted;
		}
	}

}
