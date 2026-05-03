<?php

/**
 * Render a radio group
 */
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


function render_radio_group_with_onchange($name, $options, $selected_value = null, $help_text = '', $highlight = '', $onchange = "")
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

function render_checkbox_input($name_checkbox, $name_input, $checkbox_value = 0, $input_value = '', $help_text = '', $validation_type = 2, $maxlength = 10, $decimal_length = 0)
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
            onkeydown="validateKeyPress(event, this,<?php echo $validation_type; ?>,<?php echo $maxlength; ?>,<?php echo $decimal_length; ?>)"
            maxlength="<?php echo $maxlength; ?>" />

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
function log_admin_add($log_type, $module_name, $data = array(), $description = '')
{
    $CI = &get_instance();
    $CI->load->model('Adminlog_model');
    return $CI->Adminlog_model->log_add($log_type, $module_name, $data, $description);
}

/**
 * Log admin edit operation
 * @param string $module_name - Name of the module
 * @param array $old_data - Data before update
 * @param array $new_data - Data after update
 * @param string $description - Optional description
 * @return boolean
 */
function log_admin_edit($log_type, $module_name, $old_data = array(), $new_data = array(), $description = '')
{
    $CI = &get_instance();
    $CI->load->model('Adminlog_model');
    return $CI->Adminlog_model->log_edit($log_type, $module_name, $old_data, $new_data, $description);
}

/**
 * Log admin delete operation
 * @param string $module_name - Name of the module
 * @param array $data - Data being deleted
 * @param string $description - Optional description
 * @return boolean
 */
function log_admin_delete($log_type, $module_name, $data = array(), $description = '')
{
    $CI = &get_instance();
    $CI->load->model('Adminlog_model');
    return $CI->Adminlog_model->log_delete($log_type, $module_name, $data, $description);
}

/**
 * Compare old and new records to identify changed fields
 * @param array $old_data - Data before update
 * @param array $new_data - Data after update
 * @param array $exclude_fields - Fields to exclude from comparison
 * @return array - Array containing only the changed fields with old and new values
 */
function get_changed_fields($old_data = array(), $new_data = array(), $exclude_fields = array())
{
    $changed_data = array();

    // Load field labels helper
    $CI = &get_instance();
    $CI->load->helper('field_labels');
    $field_labels = get_field_labels();
    $value_labels = get_field_value_labels();

    // Get the ID field name and value (if exists)
    $id_field = null;
    $id_value = null;

    // Common ID field names - expanded to cover primary key fields found across models/tables
    $id_fields = array(
        'id',
        'log_id',
        'log_admin_id',
        'admin_user_id',
        'adv_id',
        'appeven_id',
        'appvideo_id',
        'appvideo_id',
        'bcontract_id',
        'tracking_id',
        'branch_id',
        'cat_id',
        'city_id',
        'com_group_id',
        'com_id',
        'com_wtgroup_id',
        'com_weight_id',
        'ctp_id',
        'contract_id',
        'cus_com_cus_id',
        'cus_com_id',
        'cus_id',
        'cgrp_id',
        'delty_id',
        'service_id',
        'eve_id',
        'gal_id',
        'grn_id',
        'hedging_id',
        'hda_id',
        'hd_id',
        'knkoff_id',
        'lcs_id',
        'mar_id',
        'request_id',
        'news_id',
        'pop_id',
        'prem_group_id',
        'prem_id',
        'pro_id',
        'purchase_id',
        'rcom_id',
        'serv_grp_id',
        'serv_group_id',
        'serv_com_id',
        'serv_id',
        'serv_grp_com_id',
        'sup_id',
        'trans_id',
        'device_user_id',
        'session_id',
        'video_id'
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

    // Merge default exclude fields with provided exclude fields
    $exclude_fields = array_merge(array('db_error_msg'), $exclude_fields);

    // Compare each field in new data with old data
    foreach ($new_data as $key => $value) {
        // Skip excluded fields
        if (in_array($key, $exclude_fields)) {
            continue;
        }

        // Skip ID field as we already handled it
        if ($key === $id_field) {
            continue;
        }

        // Check if the field exists in old data and has changed
        if (isset($old_data[$key]) && $old_data[$key] != $value) {
            // Only store non-null values
            if ($old_data[$key] !== null || $value !== null) {
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
        }
        // Handle case where field didn't exist in old data (new field)
        else if (!isset($old_data[$key])) {
            // Only store non-null new values
            if ($value !== null) {
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

function renderMobileInput($index, $is_admin, $mobile_value, $countries, $show_country = false)
{
    $id_suffix = "mob$index";
    $label = "Mobile $index";
    $checkbox_id = "is_admin_$id_suffix";
    $input_id = "admin_$id_suffix";
    $country_id = "country_$id_suffix";
    $flag_id = "country_flag_$id_suffix";
    $error_id = "mobileError_$id_suffix";
    $is_checked = isset($is_admin) && $is_admin == 1;
    $disabled_attr = $is_checked ? "" : "disabled";
    ?>

    <div class="col-md-6">
        <div class="form-group row align-items-center">
            <label class="col-sm-4 col-form-label"><?= htmlspecialchars($label) ?></label>
            <div class="col-sm-8">
                <div class="d-flex align-items-center gap-2">
                    <input type="checkbox" style="margin-right: 5px !important;" id="<?= $checkbox_id ?>" name="fv[<?= $checkbox_id ?>]" <?= isset($is_admin) && $is_admin == 1 ? 'checked="checked"' : '' ?> <?= $is_checked ? 'checked="checked"' : '' ?> />

                    <?php if ($show_country): ?>
                        <!-- class="border rounded" -->
                        <img id="<?= $flag_id ?>" src="https://flagcdn.com/w320/in.png" class="flag" alt="Flag" style="width: 50px; height: 35px; object-fit: cover;border: 1px solid #dee2e6 !important;">

                        <select id="<?= $country_id ?>" name="fv[<?= $country_id ?>]" class="form-select country-select" style="width: 75px;border: 1px solid #dee2e6 !important;" <?= $disabled_attr ?>>
                            <?= $countries ?>
                        </select>
                    <?php endif; ?>

                    <input type="text" name="fv[<?= $input_id ?>]" id="<?= $input_id ?>" style="width: 55%;padding-left: 5px !important;" <?= $disabled_attr ?> class="form-control mobile-input" placeholder="Enter mobile number" value="<?= htmlspecialchars($mobile_value ?? '') ?>" minlength="10" maxlength="10">
                </div>

                <div class="form-text text-danger" id="<?= $error_id ?>"></div>
                <span class="help-block"><?= $label ?> (book/limit confirmation)</span>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const checkbox = document.getElementById('<?= $checkbox_id ?>');
            const country = document.getElementById('<?= $country_id ?>');
            const mobile = document.getElementById('<?= $input_id ?>');
            const errorEl = document.getElementById('<?= $error_id ?>');

            function toggleInputs() {
                const isChecked = checkbox.checked;
                if (country) country.disabled = !isChecked;
                if (mobile) {
                    mobile.required = isChecked;
                    mobile.disabled = !isChecked;
                }
            }
            toggleInputs();
            checkbox.addEventListener('change', toggleInputs);
            const form = checkbox.closest('form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    if (checkbox.checked && mobile.value.trim() === '') {
                        e.preventDefault();
                        errorEl.textContent = 'Please enter a mobile number.';
                        mobile.focus();
                    } else {
                        errorEl.textContent = '';
                    }
                });
            }
        });
    </script>
<?php
}

/**
 * Optional helper to include the related jQuery script (only once per page)
 */
function includeMobileInputScripts()
{
    static $included = false; // prevent multiple loads

    if ($included) return;
    $included = true;
?>

    <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> -->
    <script>
        $(function() {
            // === Handle Country Flag Change ===
            $(".country-select").on("change", function() {
                var iso = $(this).find("option:selected").data("iso");
                var flagId = $(this).attr("id").replace("country_", "country_flag_");
                if (iso) {
                    var flagUrl = "https://flagcdn.com/w320/" + iso.toLowerCase() + ".png";
                    $("#" + flagId).attr("src", flagUrl);
                } else {
                    $("#" + flagId).attr("src", "");
                }
            });

            $(".country-select").trigger("change");

            // === Mobile Number Validation ===
            $(".mobile-input").on("input", function() {
                let mobile_val = $(this).val().replace(/\D/g, "").slice(0, 10);
                $(this).val(mobile_val);

                const errorId = $(this).attr("id").replace("admin_", "mobileError_");

                if (mobile_val.length > 0 && !/^[6-9]\d{9}$/.test(mobile_val)) {
                    $("#" + errorId).text("Enter a valid 10-digit mobile number.").show();
                } else {
                    $("#" + errorId).text("").hide();
                }
            });

            // === Auto-fill Other Mobiles Based on Mobile 1 ===
            $("#admin_mob1").on("input", function() {
                const value = $(this).val();
                for (let i = 2; i <= 4; i++) {
                    const field = $("#admin_mob" + i);
                    if (field.val().trim() === "") {
                        field.val(value);
                    }
                }
            });
        });
    </script>
<?php
}



/**
 * Render a text input with label and help text
 */
if (!function_exists('render_text_input')) {
    function render_text_input($label, $name, $value = '', $required = false, $maxlength = 100, $help = '', $type = 'text', $extra = [])
    {
        $req = $required ? 'required' : '';
        $placeholder = isset($extra['placeholder']) ? $extra['placeholder'] : 'Enter ' . strtolower($label);
        
        $attributes = '';
        if (!empty($extra)) {
            foreach ($extra as $key => $val) {
                if ($key != 'placeholder') {
                    $attributes .= ' ' . $key . '="' . $val . '"';
                }
            }
        }

        echo '
        <div class="form-group row mb-3">
            <label class="col-sm-4 col-form-label">' . htmlspecialchars($label);
        if ($required) echo ' <span class="text-danger">*</span>';
        echo '</label>
            <div class="col-sm-7">
                <input type="' . $type . '" name="' . $name . '" id="' . str_replace(['[', ']'], '_', $name) . '"
                    value="' . htmlspecialchars($value) . '" class="form-control"
                    maxlength="' . $maxlength . '" ' . $req . ' placeholder="' . $placeholder . '"' . $attributes . '>
                <small class="form-text text-muted">' . htmlspecialchars($help) . '</small>
            </div>
        </div>';
    }
}

// Tool Tip Hide
if (! function_exists('disable_autocomplete_script')) {
    function disable_autocomplete_script()
    {
        return <<<HTML
<script>
document.addEventListener('DOMContentLoaded', () => {

  // Disable autocomplete, autocorrect, etc. on all input fields
  const disableAutocomplete = el => {
    ['autocomplete','autocorrect','autocapitalize','spellcheck'].forEach(attr => el.setAttribute(attr, 'off'));
  };

  document.querySelectorAll('input, textarea, select').forEach(disableAutocomplete);

  // Disable jQuery UI / Bootstrap autocomplete if active
  if (window.jQuery) {
    $('input, textarea, select').each(function() {
      const \$t = \$(this);
      if (\$t.data('ui-autocomplete')) \$t.autocomplete('destroy');
      if (\$t.data('typeahead')) \$t.typeahead('destroy');
    });
  }

  // Watch for dynamically added inputs (AJAX, modals, etc.)
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          node.querySelectorAll?.('input, textarea, select').forEach(disableAutocomplete);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

});
</script>
HTML;
    }
}
