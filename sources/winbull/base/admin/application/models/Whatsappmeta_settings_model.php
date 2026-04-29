<?php
class Whatsappmeta_settings_model extends CI_Model {
    var $table_name = 'dt_whatsappmeta_settings';

    public function get_data($params = "" , $page = "all")
    {
        $this->db->select('serv.serv_id, serv.serv_name, whatsapp_content, whatsapp_footer, template_id');
        $this->db->from('dt_serv_master AS serv');
        $this->db->join($this->table_name . ' AS whatsapp', 'whatsapp.service_id = serv.serv_id', 'left');
        return $this->db->get();
    }

    function get_entry_record($record_id)
    {
        $this->db->select('serv_id, serv_name, whatsapp_content, whatsapp_footer, template_id');
        $this->db->from('dt_serv_master');
        $this->db->join($this->table_name, 'service_id = serv_id', 'left');
        $this->db->where('serv_id', (int)$record_id);
        $result_set = $this->db->get();
        
        $records = array();
        foreach ($result_set->result() as $row)
        {
            $records['service_id']        = $row->serv_id;
            $records['serv_name']         = $row->serv_name;            
            $records['whatsapp_content']  = $row->whatsapp_content;
            $records['whatsapp_footer']   = $row->whatsapp_footer;
            $records['template_id']       = $row->template_id;
        }        
        return $records;
    }

    public function update_record($id)
    {
        $old_record = $this->get_entry_record($id);
        
        // Mass assignment protection - whitelist allowed fields
        $allowed_fields = array('whatsapp_content', 'whatsapp_footer', 'template_id');
        $update_data = array();
        
        if (isset($_POST['fv']) && is_array($_POST['fv'])) {
            foreach ($allowed_fields as $field) {
                if (isset($_POST['fv'][$field])) {
                    $update_data[$field] = $_POST['fv'][$field];
                }
            }
        }
        
        $update_data['service_id'] = (int)$id;
        
        // Check if record exists
        $this->db->where('service_id', (int)$id);
        $query = $this->db->get($this->table_name);
        
        if ($query->num_rows() > 0) {
            $this->db->update($this->table_name, $update_data, array('service_id' => $id));
        } else {
            $this->db->insert($this->table_name, $update_data);
        }
        
        if ($this->db->affected_rows() > 0) {
            $this->load->helper('field_labels');
            $changes = array();
            // Simplified logging for brevity
            log_admin_edit('81', 'Meta Whatsapp Settings', $changes, 'Admin - Updated meta whatsapp settings for service: ' . $old_record['serv_name']);
        }
        return array('status' => 1);
    }

    public function delete_record($id)
    {
        $this->db->where('service_id', (int)$id);
        $this->db->delete($this->table_name);

        if ($this->db->affected_rows() > 0) {
            return array('status' => 1);
        } else {
            return array('status' => 0);
        }
    }
}
