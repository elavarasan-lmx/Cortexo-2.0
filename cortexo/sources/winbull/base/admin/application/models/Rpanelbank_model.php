<?php
class Rpanelbank_model extends CI_Model
{
    var $table_name = 'dt_bankcontractmaster';                        //Initialize table Name
    var $secondtable_name = 'dt_rpanelbank';

    public function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    function index() {}
    public function get_data($params = "", $page = "all")
    {
        $query = $this->db->query("SELECT bcontract_id, bcontract_symbol, bcontract_status, 
								   bcontract_rate, bconvert_value, bextra_charges, b_orderno
								   FROM dt_bankcontractmaster 
								   ORDER BY b_orderno ASC");
        return $query;
    }

    public function empty_record() //Fetch listing record
    {
        $_POST['fv']['bcontract_id']        =    NULL;
        $_POST['fv']['bcontract_symbol']    =    NULL;
        $_POST['fv']['bcontract_rate']        =    NULL;
        $_POST['fv']['bconvert_value']        =    NULL;
        $_POST['fv']['bconvert_value_type']    =    3;
        $_POST['fv']['bcontract_status']    =    TRUE;
        $_POST['fv']['bextra_charges']        =    0;
        $_POST['fv']['bextra_type']            =    3;
        $_POST['fv']['b_orderno']            =    NULL;
        $_POST['fv']['db_error_msg']        =    "";
    }

    public function load_bankcontract($record_id)
    {
        $record_id = ($record_id == NULL) ? -1 : $record_id;
        $strData = "";

        // $strData = "<option value='-1' ";
        // $strData .= $record_id == -1 ? "selected='selected'" : "";
        // $strData.=">- SELECT -</option>";
        $resultset = $this->db->query("SELECT contract_id, contract_symbol, displayname from dt_contractmaster WHERE status = 1 AND ctype = 2");
        foreach ($resultset->result() as $row) {
            $strData .= "<option value='" . htmlspecialchars($row->contract_symbol, ENT_QUOTES) . "' ";
            $strData .= ($record_id == $row->contract_symbol) ? "selected='selected'" : "";
            $strData .= ">" . htmlspecialchars($row->displayname, ENT_QUOTES) . "</option>";
        }
        $resultset->free_result();
        return $strData;
    }
    public function get_entry_record($record_id)                                         //Fetch entry record
    {
        $records['com_id']       = $record_id;
        //Build contents query
        $record_id = (int)$record_id;  // ✅ prevent SQL injection
        $query = "SELECT bcontract_id, bcontract_symbol, bcontract_status, bcontract_rate, bconvert_value, bconvert_value_type, bextra_charges, bextra_type,b_orderno
				FROM dt_bankcontractmaster WHERE bcontract_id=" . $record_id;
        $result_set = $this->db->query($query);

        foreach ($result_set->result() as $row) {
            $records['bcontract_id']               = $row->bcontract_id;
            $records['bcontract_symbol']           = $row->bcontract_symbol;
            $records['bcontract_rate']           = $row->bcontract_rate;
            $records['bconvert_value']           = $row->bconvert_value;
            $records['bconvert_value_type']        = $row->bconvert_value_type;
            $records['bextra_charges']           = $row->bextra_charges;
            $records['bextra_type']               = $row->bextra_type;
            $records['bcontract_status']         = ($row->bcontract_status == 1) ? TRUE : FALSE;
            $records['b_orderno']               = $row->b_orderno;
            $records['db_error_msg']            = "";
        }
        return $records;
    }
    /** DELETE */
    public function delete_record($record_id)
    {
        // Get record for logging
        $old_record = $this->get_entry_record($record_id);

        // Soft delete
        $result = $this->db->update(
            $this->table_name,
            ['bcontract_status' => 0],
            ['bcontract_id' => $record_id]
        );

        if ($result && $this->db->affected_rows() == 0) {
            return ['status' => 1, 'message' => 'Record is already inactive.'];
        }

        if ($result && $this->db->affected_rows() > 0) {

            // Logging
            $this->load->helper('field_labels');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            $logged_data = [];
            foreach ($old_record as $field => $value) {
                $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;

                $logged_data[$label] =
                    isset($value_labels[$field][$value])
                    ? $value_labels[$field][$value]
                    : $value;
            }

            log_admin_delete(
                '36',
                'Rpanel Bank',
                $logged_data,
                'Admin - Deleted Rpanel bank contract: ' . $old_record['bcontract_symbol']
            );

            return ['status' => 1];
        }

        return ['status' => 0];
    }

    /** ACTIVATE (re-enable) */
    public function activate_record($record_id)
    {
        $old_record = $this->get_entry_record($record_id);

        $result = $this->db->update(
            $this->table_name,
            ['bcontract_status' => 1],
            ['bcontract_id' => $record_id]
        );

        if ($result && $this->db->affected_rows() == 0) {
            return ['status' => 1, 'message' => 'Record is already active.'];
        }

        if ($result && $this->db->affected_rows() > 0) {

            $this->load->helper('field_labels');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            $logged_data = [];
            foreach ($old_record as $field => $value) {
                $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
                $logged_data[$label] =
                    isset($value_labels[$field][$value])
                    ? $value_labels[$field][$value]
                    : $value;
            }

            log_admin_edit(
                '36',
                'Rpanel Bank',
                $logged_data,
                $logged_data,
                'Admin - Activated Rpanel bank contract: ' . $old_record['bcontract_symbol']
            );

            return ['status' => 1];
        }

        return ['status' => 0];
    }

    /** INSERT */
    public function insert_record($id)
    {
        $result = $this->db->insert($this->table_name, $_POST['fv']);

        if ($result) {

            // Insert into second table — INSERT IGNORE prevents duplicate rows
            $_POST['rpbank']['rpanelid'] = 1;
            $_POST['rpbank']['banksymbol'] = $this->db->insert_id();
            $this->db->query(
                "INSERT IGNORE INTO dt_rpanelbank (rpanelid, banksymbol) VALUES (1, " . (int)$_POST['rpbank']['banksymbol'] . ")"
            );

            // Logging
            $this->load->helper('field_labels');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            $logged_data = [];
            foreach ($_POST['fv'] as $field => $value) {
                $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
                $logged_data[$label] =
                    isset($value_labels[$field][$value])
                    ? $value_labels[$field][$value]
                    : $value;
            }

            log_admin_add(
                '36',
                'Rpanel Bank',
                $logged_data,
                'Admin - Added new Rpanel bank contract: ' . $_POST['fv']['bcontract_symbol']
            );

            return ['status' => 1];
        }

        return ['status' => 0];
    }

    /** UPDATE */
    public function update_record($id)
    {
        // Before update
        $old_record = $this->get_entry_record($id);

        // Update main table
        $result = $this->db->update($this->table_name, $_POST['fv'], ['bcontract_id' => $id]);

        if ($result) {

            // Update second table timestamp
            $this->db->update("dt_r_panel", ['updateon' => time()], ['id' => 1]);

            // Find changed fields
            $changed = get_changed_fields($old_record, $_POST['fv']);

            if (!empty($changed)) {

                $old_vals = [];
                $new_vals = [];

                foreach ($changed as $field => $values) {
                    $old_vals[$field] = $values['old'];
                    $new_vals[$field] = $values['new'];
                }

                log_admin_edit(
                    '36',
                    'Rpanel Bank',
                    $old_vals,
                    $new_vals,
                    'Admin - Updated Rpanel bank contract: ' . $_POST['fv']['bcontract_symbol']
                );
            }

            return ['status' => 1];
        }

        return ['status' => 0];
    }
}
