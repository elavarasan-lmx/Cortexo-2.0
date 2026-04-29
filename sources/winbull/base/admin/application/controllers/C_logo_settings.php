<?php
class C_logo_settings extends My_Controller {
	var $menu_code = 85;
	var $form_entry = "logo_settings_entry";

	public function __construct()
	{
		parent::__construct();
		$this->load->model("Logo_settings_model");
		$this->load->helper('common');
	}

	function index()
	{
	}

	// Entry Form
	function open_entry_form() {
		$data = array();
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			// Get current settings
			$data['settings'] = $this->Logo_settings_model->get_settings();
			$this->load->view($this->form_entry, $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}

	// Upload Website Logo
	function upload_website_logo() {
		$this->_process_upload('website_logo', 'website_logo', FCPATH . '../assets/images/', 'Website Logo');
	}

	// Upload Admin Logo
	function upload_admin_logo() {
		$this->_process_upload('admin_logo', 'admin_logo', FCPATH . 'assets/img/', 'Admin Logo');
	}

	// Upload Favicon
	function upload_favicon() {
		if (!isset($_FILES['favicon_file']) || $_FILES['favicon_file']['error'] !== UPLOAD_ERR_OK) {
			$this->session->set_flashdata('error', 'No file selected or upload error.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		$file = $_FILES['favicon_file'];
		$allowed = array('png', 'jpg', 'jpeg', 'svg', 'ico');
		$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

		if (!in_array($ext, $allowed)) {
			$this->session->set_flashdata('error', 'Invalid file type. Only PNG, JPG, JPEG, SVG and ICO are allowed.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		if ($file['size'] > 5 * 1024 * 1024) {
			$this->session->set_flashdata('error', 'File size exceeds 5MB limit.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		// Create favicon directory if not exists
		$favicon_dir = FCPATH . '../favicon/';
		if (!is_dir($favicon_dir)) {
			mkdir($favicon_dir, 0755, true);
		}

		// Process the image - resize to 100x100 and convert to ICO
		$tmp_path = $file['tmp_name'];
		$ico_filename = 'favicon.ico';

		// Load GD library for image processing
		if ($ext === 'ico') {
			// If already ICO, just copy it
			copy($tmp_path, $favicon_dir . $ico_filename);
		} else if ($ext === 'svg') {
			// For SVG, save directly and also as PNG for ICO conversion
			$svg_content = file_get_contents($tmp_path);
			file_put_contents($favicon_dir . 'favicon.svg', $svg_content);

			// Try to convert SVG to ICO via GD if imagick is not available
			// Store the SVG path as favicon
			$ico_filename = 'favicon.svg';
		} else {
			// For PNG/JPG/JPEG - resize to 100x100 and save
			$source = null;
			if ($ext === 'png') {
				$source = @imagecreatefrompng($tmp_path);
			} else {
				$source = @imagecreatefromjpeg($tmp_path);
			}

			if ($source) {
				$orig_w = imagesx($source);
				$orig_h = imagesy($source);

				// Create 100x100 image
				$resized = imagecreatetruecolor(100, 100);
				// Preserve transparency for PNG
				imagealphablending($resized, false);
				imagesavealpha($resized, true);
				$transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
				imagefill($resized, 0, 0, $transparent);

				imagecopyresampled($resized, $source, 0, 0, 0, 0, 100, 100, $orig_w, $orig_h);

				// Save as PNG (ICO-compatible)
				imagepng($resized, $favicon_dir . 'favicon_100x100.png');

				// Create ICO file (simplified - save as PNG with .ico extension works in most browsers)
				// For a proper ICO, we create a simple ICO file
				$this->_create_ico($resized, $favicon_dir . $ico_filename);

				imagedestroy($source);
				imagedestroy($resized);
			} else {
				// Fallback: just copy the file
				copy($tmp_path, $favicon_dir . $ico_filename);
			}
		}

		// Also copy to admin/favicon.ico and root favicon.ico
		if (file_exists($favicon_dir . $ico_filename)) {
			// Copy to admin directory
			copy($favicon_dir . $ico_filename, FCPATH . 'favicon.ico');
			// Copy to root directory
			copy($favicon_dir . $ico_filename, FCPATH . '../favicon.ico');
		}

		// Update database
		$this->Logo_settings_model->update_setting('website_favicon', $ico_filename);

		// Log the change
		$this->load->helper('common');
		log_admin_add(85, 'Logo & Icon Settings', array('favicon' => $ico_filename), 'Favicon updated');

		$this->session->set_flashdata('success', 'Favicon updated successfully.');
		redirect('C_logo_settings/open_entry_form');
	}

	// Toggle custom logo
	function toggle_custom_logo() {
		$status = $this->input->post('status');
		$this->Logo_settings_model->update_setting('custom_logo_enabled', $status);
		echo json_encode(array('status' => 'success'));
	}

	// Delete / Reset logo
	function reset_logo() {
		$type = $this->input->post('type');
		if ($type) {
			$this->Logo_settings_model->update_setting($type, NULL);

			$this->load->helper('common');
			log_admin_add(85, 'Logo & Icon Settings', array($type => 'reset'), ucfirst(str_replace('_', ' ', $type)) . ' reset to default');

			echo json_encode(array('status' => 'success', 'message' => ucfirst(str_replace('_', ' ', $type)) . ' reset to default.'));
		} else {
			echo json_encode(array('status' => 'error', 'message' => 'Invalid type.'));
		}
	}

	// Private: Process upload
	private function _process_upload($field_name, $db_column, $upload_path, $label) {
		if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) {
			$this->session->set_flashdata('error', 'No file selected or upload error.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		$file = $_FILES[$field_name];
		$allowed = array('png', 'jpg', 'jpeg', 'svg');
		$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

		if (!in_array($ext, $allowed)) {
			$this->session->set_flashdata('error', 'Invalid file type. Only PNG, JPG, JPEG, SVG are allowed.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		if ($file['size'] > 5 * 1024 * 1024) {
			$this->session->set_flashdata('error', 'File size exceeds 5MB limit.');
			redirect('C_logo_settings/open_entry_form');
			return;
		}

		// Create upload path if not exists
		if (!is_dir($upload_path)) {
			mkdir($upload_path, 0755, true);
		}

		// Delete old logo files (logo.png, logo.jpg, logo.jpeg, logo.svg)
		$old_extensions = array('png', 'jpg', 'jpeg', 'svg');
		foreach ($old_extensions as $old_ext) {
			$old_file = $upload_path . 'logo.' . $old_ext;
			if (file_exists($old_file)) {
				@unlink($old_file);
			}
		}

		// Save with common name: logo.png / logo.jpg / logo.svg
		$filename = 'logo.' . $ext;

		// Move uploaded file
		if (move_uploaded_file($file['tmp_name'], $upload_path . $filename)) {
			// Update database
			$this->Logo_settings_model->update_setting($db_column, $filename);

			// Log the change
			$this->load->helper('common');
			log_admin_add(85, 'Logo & Icon Settings', array($db_column => $filename), $label . ' updated');

			$this->session->set_flashdata('success', $label . ' updated successfully.');
		} else {
			$this->session->set_flashdata('error', 'Failed to upload file. Please check directory permissions.');
		}

		redirect('C_logo_settings/open_entry_form');
	}

	// Private: Create ICO file from GD image resource
	private function _create_ico($img, $filename) {
		$w = imagesx($img);
		$h = imagesy($img);

		// Create a PNG in memory for the ICO
		ob_start();
		imagepng($img);
		$png_data = ob_get_clean();

		// Simple ICO format
		$ico = pack('vvv', 0, 1, 1); // Header: reserved, type (1=icon), count
		$ico .= pack('CCCCvvVV',
			$w >= 256 ? 0 : $w,      // width
			$h >= 256 ? 0 : $h,      // height
			0,                         // color palette
			0,                         // reserved
			1,                         // color planes
			32,                        // bits per pixel
			strlen($png_data),         // image data size
			22                         // offset to image data (6 header + 16 entry)
		);
		$ico .= $png_data;

		file_put_contents($filename, $ico);
	}
}
