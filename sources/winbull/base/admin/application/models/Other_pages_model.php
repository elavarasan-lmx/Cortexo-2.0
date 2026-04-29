<?php
class Other_pages_model extends CI_Model
{
	private $json_path;

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
		$this->json_path = APPPATH . 'config/other_pages.json';
	}

	private function read_json()
	{
		if (!file_exists($this->json_path)) {
			return [];
		}
		$json_data = file_get_contents($this->json_path);
		return json_decode($json_data, true) ?: [];
	}

	private function write_json($data)
	{
		return file_put_contents($this->json_path, json_encode($data, JSON_PRETTY_PRINT));
	}

	public function get_data()
	{
		$data = $this->read_json();
		// Map for view compatibility
		$formatted = [];
		foreach ($data as $page) {
			$formatted[] = [
				'page_id'     => $page['page_slug'], 
				'page_title'  => $page['page_title'],
				'page_slug'   => $page['page_slug'],
				'page_active' => 1
			];
		}
		
		return new class($formatted) {
			private $data;
			public function __construct($data) { $this->data = $data; }
			public function result_array() { return $this->data; }
		};
	}

	public function empty_record()
	{
		$_POST['fv']['page_title']	=	NULL;
		$_POST['fv']['page_slug']	=	NULL;
		$_POST['fv']['page_content'] =	NULL;
		$_POST['fv']['page_active']	=	TRUE;
		$_POST['fv']['db_error_msg'] =	"";
	}

	public function get_entry_record($slug)
	{
		$pages = $this->read_json();
		$found = null;
		foreach ($pages as $p) {
			if ($p['page_slug'] === $slug) {
				$found = $p;
				break;
			}
		}

		if (!$found) return false;

		$records = [
			'page_id'      => $slug,
			'page_title'   => $found['page_title'],
			'page_slug'    => $slug,
			'page_active'  => 1,
			'is_file'      => 1,
			'file_path'    => $found['file_path'],
			'db_error_msg' => ""
		];

		$full_path = '../' . $found['file_path'];
		if (file_exists($full_path)) {
			$records['page_content'] = file_get_contents($full_path);
		} else {
			$records['page_content'] = "";
		}

		return $records;
	}

	public function insert_record($id)
	{
		$pages = $this->read_json();
		$new_title = $_POST['fv']['page_title'];
		$new_slug  = $_POST['fv']['page_slug'];
		
		// Validate slug
		foreach ($pages as $p) {
			if ($p['page_slug'] === $new_slug) {
				return ['status' => 0, 'error' => 'Slug already exists.'];
			}
		}

		$file_path = 'application/views/' . str_replace('-', '', $new_slug) . '.php';
		
		$new_page = [
			'page_title' => $new_title,
			'page_slug'  => $new_slug,
			'file_path'  => $file_path,
			'method'     => ucfirst(str_replace('-', '', $new_slug))
		];

		$pages[] = $new_page;
		$this->write_json($pages);

		// Create the file
		$full_path = '../' . $file_path;
		if (!file_exists($full_path)) {
			file_put_contents($full_path, $_POST['fv']['page_content'] ?? '');
		}

		$this->load->helper('common');
		log_admin_add('51', 'Other Pages', $_POST['fv'], 'Admin - Added new page: ' . $new_title);

		return ['status' => 1];
	}

	public function update_record($slug)
	{
		$pages = $this->read_json();
		$found_index = -1;
		foreach ($pages as $index => $p) {
			if ($p['page_slug'] === $slug) {
				$found_index = $index;
				break;
			}
		}

		if ($found_index === -1) return ['status' => 0, 'error' => 'Page not found'];

		$page = $pages[$found_index];
		$content = $_POST['fv']['page_content'];
		$full_path = '../' . $page['file_path'];

		$old_content = "";
		if (file_exists($full_path)) {
			$old_content = file_get_contents($full_path);
		}
		$old_title = $page['page_title'];

		if (file_put_contents($full_path, $content) !== false) {
			// Update title if changed
			$pages[$found_index]['page_title'] = $_POST['fv']['page_title'];
			$this->write_json($pages);
			
			$this->load->helper('common');
			$old_data = ['page_title' => $old_title, 'page_slug' => $slug, 'page_content' => $old_content];
			$new_data = ['page_title' => $_POST['fv']['page_title'], 'page_slug' => $slug, 'page_content' => $content];
			
			$changed_data = get_changed_fields($old_data, $new_data);
			$old_values = array();
			$new_values = array();
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			if (!empty($changed_data)) {
				log_admin_edit('51', 'Other Pages', $old_values, $new_values, 'Admin - Updated page: ' . $_POST['fv']['page_title']);
			}

			return ['status' => 1];
		} else {
			return ['status' => 0, 'error' => 'Failed to write to file'];
		}
	}

	public function delete_record($slug)
	{
		$pages = $this->read_json();
		$new_pages = [];
		$path_to_delete = '';
		$found = false;

		foreach ($pages as $p) {
			if ($p['page_slug'] === $slug) {
				$path_to_delete = '../' . $p['file_path'];
				$found = true;
				continue;
			}
			$new_pages[] = $p;
		}

		// BZ-35: Check if slug was actually found
		if (!$found) {
			return ['status' => 0, 'error' => 'Page not found: ' . $slug];
		}

		// BZ-35: Check if write succeeded
		$write_result = $this->write_json($new_pages);
		if ($write_result === false) {
			return ['status' => 0, 'error' => 'Failed to save changes. Check file write permissions on other_pages.json'];
		}
		
		// Optionally delete the physical file
		if ($path_to_delete && file_exists($path_to_delete)) {
			// unlink($path_to_delete); // Uncomment if you want to also delete the view file
		}

		$this->load->helper('common');
		log_admin_delete('51', 'Other Pages', ['page_slug' => $slug], 'Admin - Deleted page with slug: ' . $slug);

		return ['status' => 1];
	}

	public function upload_image()
	{
		if ($_FILES['upload_img']['name']) {
			$config['upload_path'] = '../assets/images/';
			$config['allowed_types'] = 'gif|jpg|png|jpeg';
			$config['max_size'] = '5120';
			$config['remove_spaces'] = true;
			$config['overwrite'] = false;

			$this->load->library('upload', $config);
			if (!$this->upload->do_upload('upload_img')) {
				return array('status' => 0, 'error' => $this->upload->display_errors());
			} else {
				$data = $this->upload->data();
				return array('status' => 1, 'file_name' => $data['file_name'], 'url' => 'assets/images/' . $data['file_name']);
			}
		}
		return array('status' => 0, 'error' => 'No file selected');
	}
}
