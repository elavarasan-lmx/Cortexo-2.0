<?php
class C_career_applications extends My_Controller
{
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
		$this->load->database();
	}

	function listing()
	{
		$data["userrights"] = array("view" => 1, "add" => 0, "edit" => 0, "delete" => 1, "sms" => 0, "email" => 0, "notification" => 0);
		
		// Check table existence cleanly
		if ($this->db->table_exists('job_applications')) {
			$data['records'] = $this->db->query("SELECT * FROM job_applications ORDER BY created_at DESC")->result_array();
		} else {
			$data['records'] = [];
		}

        $this->load->view('career_applications_listing', $data);
	}
	
	function delete_record($id)
	{
		if (!empty($id)) {
			// Get resume path before deleting
			$query = $this->db->query("SELECT resume_path FROM job_applications WHERE id = ?", array($id));
			$row = $query->row_array();
			if ($row && !empty($row['resume_path'])) {
				$file_path = '../' . $row['resume_path'];
				if (file_exists($file_path)) {
					unlink($file_path);
				}
			}
			$this->db->query("DELETE FROM job_applications WHERE id = ?", array($id));
			$this->session->set_flashdata('success', 'Application deleted successfully.');
		}
		redirect("C_career_applications/listing");
	}
}
