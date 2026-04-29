<?php
class News_model extends CI_Model {
		var $table_name = 'dt_news';
		public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}

	public function get_data($params = "" , $page = "all")
    {
	   	$query = $this->db->query("SELECT news_id, newstitle as news, status FROM dt_news");
		return $query;
    }

	public function empty_record()
	{
		$_POST['fv']['news_id']		= NULL;
		$_POST['fv']['news']		= NULL;
		$_POST['fv']['newstitle']	= NULL;
		$_POST['fv']['newsshortdesc'] = NULL;
		$_POST['fv']['updatetime']	= date('d-m-Y h:i:s');
		$_POST['fv']['isprimary']	= 0;
		$_POST['fv']['active']		= 1;
		$_POST['fv']['db_error_msg'] = "";
	}

	/*
	* Fetch record for entry when edit
	*/
	public function get_entry_record($record_id)
	{
		$records['news_id'] = $record_id;

		// BUG-04 FIX: Cast to int to prevent SQL injection
		$query = "SELECT news_id, newstitle, newsshortdesc, news, date_format(updatetime,'%d-%m-%Y %h:%i:%s') as updatetime, isprimary, status
				  FROM dt_news WHERE news_id=" . (int)$record_id;
		$result_set = $this->db->query($query);

		foreach ($result_set->result() as $row)
		{
			$records['news_id']   		= $row->news_id;
			$records['newstitle']		= $row->newstitle;
			$records['newsshortdesc']	= $row->newsshortdesc;
			$records['news']   			= $row->news;
			$records['updatetime']		= $row->updatetime;
			$records['isprimary']		= $row->isprimary;
			$records['active']			= $row->status;
			$records['db_error_msg']	= "";
		}
		return $records;
	}

	/**
	* Remove record
	* @param id
	* @return array status
	*/
	public function delete_record($record_id)
	{
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);

		// BUG-04 FIX: Cast to int to prevent SQL injection
		$this->db->query("DELETE FROM " . $this->table_name . " WHERE news_id=" . (int)$record_id);

		// BUG-01 FIX: Return array('status'=>1) instead of boolean TRUE
		if ($this->db->affected_rows() > 0) {
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = array();
			foreach ($old_record as $field => $value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				$logged_data[$label] = (isset($value_labels[$field]) && isset($value_labels[$field][$value]))
					? $value_labels[$field][$value]
					: $value;
			}
			log_admin_delete('31', 'News', $logged_data, 'Admin - Deleted news item: ' . $old_record['newstitle']);
			return array('status' => 1);
		}

		return array('status' => 0, 'message' => 'Record not found or already deleted.');
	}

	/**
	* Insert record
	* @return array status
	*/
	public function insert_record($id)
	{
		$title = trim($_POST['fv']['newstitle']);

		// RULE 1: No duplicate titles
		$dup = $this->db->get_where($this->table_name, array('newstitle' => $title))->num_rows();
		if ($dup > 0) {
			return array('status' => 0, 'message' => 'A news article with this title already exists. Please use a different title.');
		}

		// RULE 2: Only one active news at a time
		if (isset($_POST['fv']['status']) && $_POST['fv']['status'] == 1) {
			$active_count = $this->db->get_where($this->table_name, array('status' => 1))->num_rows();
			if ($active_count > 0) {
				return array('status' => 0, 'message' => 'Another news article is already active. Please deactivate it before activating this one.');
			}
		}

		// BZ-52 FIX: Only one primary news record allowed
		if (isset($_POST['fv']['isprimary']) && $_POST['fv']['isprimary'] == 1) {
			$primary_count = $this->db->get_where($this->table_name, array('isprimary' => 1))->num_rows();
			if ($primary_count > 0) {
				return array('status' => 0, 'message' => 'Another news article is already set as Primary. Please remove that primary flag before setting this one.');
			}
		}

		$_POST['fv']['updatetime'] = date('Y-m-d H:i:s');
		$this->db->insert($this->table_name, $_POST['fv']);
		$insertId = $this->db->insert_id();

		if ($insertId) {
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = array();
			foreach ($_POST['fv'] as $field => $value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				$logged_data[$label] = (isset($value_labels[$field]) && isset($value_labels[$field][$value]))
					? $value_labels[$field][$value]
					: $value;
			}
			log_admin_add('31', 'News', $logged_data, 'Admin - Added new news item: ' . $title);
			return array('status' => 1);
		} else {
			return array('status' => 0, 'message' => 'Failed to insert record.');
		}
	}

	public function update_record($id)
	{
		$title = trim($_POST['fv']['newstitle']);

		// RULE 1: No duplicate titles (exclude current record)
		$this->db->where('newstitle', $title);
		$this->db->where('news_id !=', (int)$id);
		$dup = $this->db->count_all_results($this->table_name);
		if ($dup > 0) {
			return array('status' => 0, 'message' => 'A news article with this title already exists. Please use a different title.');
		}

		// RULE 2: Only one active news at a time (exclude current record)
		if (isset($_POST['fv']['status']) && $_POST['fv']['status'] == 1) {
			$this->db->where('status', 1);
			$this->db->where('news_id !=', (int)$id);
			$active_count = $this->db->count_all_results($this->table_name);
			if ($active_count > 0) {
				return array('status' => 0, 'message' => 'Another news article is already active. Please deactivate it before activating this one.');
			}
		}

		// BZ-52 FIX: Only one primary news allowed (exclude current record)
		if (isset($_POST['fv']['isprimary']) && $_POST['fv']['isprimary'] == 1) {
			$this->db->where('isprimary', 1);
			$this->db->where('news_id !=', (int)$id);
			$primary_count = $this->db->count_all_results($this->table_name);
			if ($primary_count > 0) {
				return array('status' => 0, 'message' => 'Another news article is already set as Primary. Please update that record first.');
			}
		}

		$oldRecord = $this->get_entry_record($id);
		$_POST['fv']['news_id'] = $id;
		$this->db->update($this->table_name, $_POST['fv'], array('news_id' => $id));

		if ($this->db->affected_rows() > 0) {
			$changed_data = get_changed_fields($oldRecord, $_POST['fv']);

			$old_values = array();
			$new_values = array();
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			if (!empty($changed_data)) {
				log_admin_edit('31', 'News', $old_values, $new_values, 'Admin - Updated news item: ' . $_POST['fv']['newstitle']);
			}
		} else {
			// BUG-03 FIX: affected_rows == 0 means nothing changed — treat as success
			// (previously returned status:0 causing "Failed to update" on unchanged save)
		}

		// Send news text update to external URL if configured
		$news = array();
		$news['newstext'] = array('id' => $_POST['fv']['news_id'], 'news' => $_POST['fv']['news']);
		$url = isset(Globals::$newsupdate) ? Globals::$newsupdate : '';
		if ($url != '') {
			$field_string = http_build_query($news);
			$curl_resp = curl_helper($url, $field_string);
		}

		return array('status' => 1);
	}
}
?>