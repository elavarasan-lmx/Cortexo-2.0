<?php
function render_radio_group($name, $options, $selected_value = null, $help_text = '', $highlight = '')
{
?>
    <div class="btn-group btngroupradio" data-toggle="buttons">
        <?php foreach ($options as $value => $data):
            // Allow either plain label or ['label' => '...', 'id' => '...']
            $label = is_array($data) ? $data['label'] : $data;
            $id = is_array($data) && isset($data['id']) ? $data['id'] : strtolower(str_replace(['[', ']'], '_', $name)) . $value;
        ?>
            <label class="btn btn-primary <?php echo ($selected_value == $value) ? 'active' : ''; ?>">
                <input type="radio"
                    name="<?php echo $name; ?>"
                    id="<?php echo $id; ?>"
                    value="<?php echo $value; ?>"
                    <?php echo ($selected_value == $value) ? 'checked="checked"' : ''; ?>>
                <?php echo $label; ?>
            </label>
        <?php endforeach; ?>
    </div>
    <?php if ($help_text): ?>
        <span class="help-block">
            <?php echo $help_text; ?>
            <?php if ($highlight): ?>
                <span style="color:#FF0000;"> <?php echo $highlight; ?></span>
            <?php endif; ?>
        </span>
    <?php endif;
}


function render_radio_group_with_onchange($name, $options, $selected_value = null, $help_text = '', $highlight = '',$onchange="")
{
?>
    <div class="btn-group btngroupradio" data-toggle="buttons">
        <?php foreach ($options as $value => $data):
            // Allow either plain label or ['label' => '...', 'id' => '...']
            $label = is_array($data) ? $data['label'] : $data;
            $id = is_array($data) && isset($data['id']) ? $data['id'] : strtolower(str_replace(['[', ']'], '_', $name)) . $value;
        ?>
            <label class="btn btn-primary <?php echo ($selected_value == $value) ? 'active' : ''; ?>">
                <input type="radio"
                    name="<?php echo $name; ?>"
                    id="<?php echo $id; ?>"
                    value="<?php echo $value; ?>"
                    <?php echo $onchange ? 'onchange="' . htmlspecialchars($onchange) . '"' : ''; ?>
                    <?php echo ($selected_value == $value) ? 'checked="checked"' : ''; ?>>
                <?php echo $label; ?>
            </label>
        <?php endforeach; ?>
    </div>
    <?php if ($help_text): ?>
        <span class="help-block">
            <?php echo $help_text; ?>
            <?php if ($highlight): ?>
                <span style="color:#FF0000;"> <?php echo $highlight; ?></span>
            <?php endif; ?>
        </span>
    <?php endif;
}

function render_checkbox_input($name_checkbox, $name_input, $checkbox_value = 0, $input_value = '', $help_text = '')
{
    ?>
    <div>
        <input type="checkbox"
            id="<?php echo $name_checkbox; ?>"
            name="fv[<?php echo $name_checkbox; ?>]"
            <?php echo ($checkbox_value == 1) ? 'checked="checked"' : ''; ?>
            onchange="validateCheck('<?php echo $name_checkbox; ?>', '<?php echo $name_input; ?>','<?php echo $input_value; ?>')" />


        <input type="text"
            class="form-control"
            style="display:inline; width:90%;"
            <?php echo ($checkbox_value == 1) ? '' : 'disabled'; ?>
            id="<?php echo $name_input; ?>"
            name="fv[<?php echo $name_input; ?>]"
            value="<?php echo ($checkbox_value == 1) ? htmlspecialchars($input_value) : 0; ?>"
            onkeydown="validateKeyPress(event, this,1)"
            maxlength="4" />

    </div>


    <?php if ($help_text): ?>
        <span class="help-block"><?php echo $help_text; ?></span>
<?php endif;
}

/**
 * Log admin add operation
 * @param string $module_name - Name of the module
 * @param array $data - Data being added
 * @param string $description - Optional description
 * @return boolean
 */
function log_admin_add($log_type,$module_name, $data = array(), $description = '')
{
    $CI =& get_instance();
    $CI->load->model('Adminlog_model');

    return $CI->Adminlog_model->log_add($log_type,$module_name, $data, $description);
}

/**
 * Log admin edit operation
 * @param string $module_name - Name of the module
 * @param array $old_data - Data before update
 * @param array $new_data - Data after update
 * @param string $description - Optional description
 * @return boolean
 */
function log_admin_edit($log_type,$module_name, $old_data = array(), $new_data = array(), $description = '')
{
    $CI =& get_instance();
    $CI->load->model('Adminlog_model');
    return $CI->Adminlog_model->log_edit($log_type,$module_name, $old_data, $new_data, $description);
}

/**
 * Log admin delete operation
 * @param string $module_name - Name of the module
 * @param array $data - Data being deleted
 * @param string $description - Optional description
 * @return boolean
 */
function log_admin_delete($log_type,$module_name, $data = array(), $description = '')
{
    $CI =& get_instance();
    $CI->load->model('Adminlog_model');
    return $CI->Adminlog_model->log_delete($log_type,$module_name, $data, $description);
}

/**
 * Compare old and new records to identify changed fields
 * @param array $old_data - Data before update
 * @param array $new_data - Data after update
 * @return array - Array containing only the changed fields with old and new values
 */
function get_changed_fields($old_data = array(), $new_data = array()) {
    $changed_data = array();
    
    // Load field labels helper
    $CI =& get_instance();
    $CI->load->helper('field_labels');
    $field_labels = get_field_labels();
    $value_labels = get_field_value_labels();
    
    // Get the ID field name and value (if exists)
    $id_field = null;
    $id_value = null;
    
    // Common ID field names - expanded to cover primary key fields found across models/tables
    $id_fields = array(
        'id', 'log_id', 'log_admin_id', 'admin_user_id', 'adv_id', 'appeven_id', 'appvideo_id', 'appvideo_id',
        'bcontract_id', 'tracking_id', 'branch_id', 'cat_id', 'city_id', 'com_group_id', 'com_id', 'com_wtgroup_id',
        'com_weight_id', 'ctp_id', 'contract_id', 'cus_com_cus_id', 'cus_com_id', 'cus_id', 'cgrp_id', 'delty_id',
        'service_id', 'eve_id', 'gal_id', 'grn_id', 'hedging_id', 'hda_id', 'hd_id', 'knkoff_id', 'lcs_id', 'mar_id',
        'request_id', 'news_id', 'pop_id', 'prem_group_id', 'prem_id', 'pro_id', 'purchase_id', 'rcom_id',
        'serv_grp_id', 'serv_group_id', 'serv_com_id', 'serv_id', 'serv_grp_com_id', 'sup_id', 'trans_id',
        'device_user_id', 'session_id', 'video_id'
    );
    
    // Find ID field in the data
    foreach ($id_fields as $field) {
        if (isset($new_data[$field])) {
            $id_field = $field;
            $id_value = $new_data[$field];
            // Add ID field to changed data with label if available
            $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
            $changed_data[$label] = array(
                'old' => isset($old_data[$field]) ? $old_data[$field] : null,
                'new' => $new_data[$field]
            );
            break;
        }
    }
    
    // Compare each field in new data with old data
    foreach ($new_data as $key => $value) {
        // Skip internal fields that are not relevant for logging
        if (in_array($key, array('db_error_msg'))) {
            continue;
        }
        
        // Skip ID field as we already handled it
        if ($key === $id_field) {
            continue;
        }
        
        // Check if the field exists in old data and has changed
        // Handle all cases: both values exist, one is missing, or one/both are null
        if (isset($old_data[$key])) {
            // Both old and new values exist, check if they're different
            // Use loose comparison to handle type differences (e.g., "0" vs 0)
            if ($old_data[$key] != $value) {
                // Special handling for time fields that might be set to default values when conditions change
                $time_fields = array('limitcancel_time', 'trade_on_time', 'trade_off_time', 'market_on_time', 'market_off_time');
                
                // If this is a time field and the new value is a default value while the old value was also effectively empty
                if (in_array($key, $time_fields)) {
                    // Define what we consider default/empty values for time fields
                    $default_time_values = array(null, '', '00:00:00');
                    
                    // If both old and new values are essentially empty/default, don't log as a change
                    if (in_array($old_data[$key], $default_time_values) && in_array($value, $default_time_values)) {
                        continue;
                    }
                }
                
                // Special handling for date fields that might change format but represent the same date
                if ($key == 'opening_date') {
                    // If both dates represent the same date (different formats), don't log as a change
                    if ($old_data[$key] && $value) {
                        $old_date = date('Y-m-d', strtotime($old_data[$key]));
                        $new_date = date('Y-m-d', strtotime($value));
                        if ($old_date == $new_date) {
                            continue;
                        }
                    }
                }
                
                // Special handling for lite_trade to show user-friendly values
                if ($key == 'lite_trade') {
                    // Convert numeric values to user-friendly labels
                    $lite_trade_labels = array(0 => 'OFF', 1 => 'ON');
                    if (isset($lite_trade_labels[$old_data[$key]]) || isset($lite_trade_labels[$value])) {
                        $old_value_label = isset($lite_trade_labels[$old_data[$key]]) ? $lite_trade_labels[$old_data[$key]] : $old_data[$key];
                        $new_value_label = isset($lite_trade_labels[$value]) ? $lite_trade_labels[$value] : $value;
                        
                        $label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
                        $changed_data[$label] = array(
                            'old' => $old_value_label,
                            'new' => $new_value_label
                        );
                        continue; // Skip the default processing
                    }
                }
                
                $label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
                
                // Get user-friendly value labels if available
                $old_value_label = $old_data[$key];
                $new_value_label = $value;
                
                if (isset($value_labels[$key])) {
                    $old_value_label = isset($value_labels[$key][$old_data[$key]]) ? $value_labels[$key][$old_data[$key]] : $old_data[$key];
                    $new_value_label = isset($value_labels[$key][$value]) ? $value_labels[$key][$value] : $value;
                }
                
                // For marquee text, strip HTML tags to avoid showing </p> in logs
                if ($key == 'mrq_text') {
                    $old_value_label = strip_tags($old_value_label);
                    $new_value_label = strip_tags($new_value_label);
                }
                
                $changed_data[$label] = array(
                    'old' => $old_value_label,
                    'new' => $new_value_label
                );
            }
        } else {
            // Field didn't exist in old data (new field)
            // Only store non-null new values
            if ($value !== null && $value !== '') {
                $label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
                
                // Get user-friendly value labels if available
                $new_value_label = $value;
                if (isset($value_labels[$key])) {
                    $new_value_label = isset($value_labels[$key][$value]) ? $value_labels[$key][$value] : $value;
                }
                
                // For marquee text, strip HTML tags to avoid showing </p> in logs
                if ($key == 'mrq_text') {
                    $new_value_label = strip_tags($new_value_label);
                }
                
                $changed_data[$label] = array(
                    'old' => null,
                    'new' => $new_value_label
                );
            }
        }
    }
    
    // Handle special case: Check if any fields in old_data are missing from new_data
    // This would indicate they were not submitted in the form (not changed)
    // We should NOT log these as changed fields
    foreach ($old_data as $key => $value) {
        // Skip internal fields and ID field
        if (in_array($key, array('db_error_msg')) || $key === $id_field) {
            continue;
        }
        
        // If a field exists in old_data but not in new_data, it means it wasn't part of this update
        // So we should NOT include it in the changed_data
        // This fixes the issue where missing fields were incorrectly showing as null
    }
    
    // Check for fields that existed in old data but not in new data (removed fields)
    // This is the key fix - we should NOT log fields that are missing from new_data
    // as this indicates they weren't part of the update operation
    /*
    foreach ($old_data as $key => $value) {
        if (!isset($new_data[$key]) && !in_array($key, array('db_error_msg'))) {
            // Only store non-null old values
            if ($value !== null) {
                $label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
                
                // Get user-friendly value labels if available
                $old_value_label = $value;
                if (isset($value_labels[$key])) {
                    $old_value_label = isset($value_labels[$key][$value]) ? $value_labels[$key][$value] : $value;
                }
                
                $changed_data[$label] = array(
                    'old' => $old_value_label,
                    'new' => null
                );
            }
        }
    }
    */
    
    return $changed_data;
}
