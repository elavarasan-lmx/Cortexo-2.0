<?php
$this->load->view("include/header");
$controller_name = "C_customergroup";
$model_name = "customergroup_model";
?>
<style>
    .footer {
        padding: 0px 10px
    }
    /* AJAX Save Loader */
    #ajax_loader {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: none;
        justify-content: center;
        align-items: center;
    }
    #ajax_loader.show { display: flex; }
    .typcn-spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
</style>

<script type="text/javascript">
    $(function() {
        $('#datetimepicker1').datetimepicker({
            pickTime: false
        });
        $('#datetimepicker2').datetimepicker({
            pickTime: false
        });

    });

    function applyGroup() {
        if (typeof jQuery === 'undefined') return;
        var j = jQuery;
        var groupVal = j("#cgc_group").val();
        
        if (!groupVal || groupVal == -1) {
            showToast("Select a Group", 'danger');
            return;
        }

        var count = 0;
        j("#data_grid tr").each(function() {
            var $row = j(this);
            var $checkbox = $row.find('td').eq(0).find('input[type="checkbox"]');
            
            if ($checkbox.is(":checked")) {
                var $select = $row.find('td').eq(3).find('select');
                if ($select.length > 0) {
                    $select.val(groupVal).trigger('change');
                    $checkbox.prop('checked', false);
                    count++;
                }
            }
        });

        // Reset the "All" checkbox in header
        j("#select_all").prop('checked', false);

        if (count === 0) {
            showToast("Select a Customer", 'danger');
        } else {
            showToast("Group applied to " + count + " customers", 'success');
        }
    }

    function searchdata() {
        var customerVal = document.getElementById('customersearch').value;
        var companyVal  = document.getElementById('companysearch').value;

        // Validation: reject input that has ONLY special characters
        if (customerVal.length > 0 && !/[a-zA-Z0-9]/.test(customerVal)) {
            showToast('Customer search must contain at least one letter or number.', 'warning');
            document.getElementById('customersearch').value = '';
            return;
        }
        if (companyVal.length > 0 && !/[a-zA-Z0-9]/.test(companyVal)) {
            showToast('Company search must contain at least one letter or number.', 'warning');
            document.getElementById('companysearch').value = '';
            return;
        }

        var regexp;
        var regexp1;
        var tableId = document.getElementById('data_grid');
        var uppertableId = document.getElementById('data_grid_header');

        for (var i = 0; i < tableId.rows.length; i++) {
            regexp  = new RegExp(uppertableId.rows[1].cells[1].childNodes[0].value, 'i');
            regexp1 = new RegExp(uppertableId.rows[1].cells[2].childNodes[0].value, 'i');
            if (regexp.test((tableId.rows[i].cells[1].innerHTML).toLowerCase()) &&
                regexp1.test((tableId.rows[i].cells[2].innerHTML).toLowerCase())) {
                tableId.rows[i].style.display = "table-row";
            } else {
                tableId.rows[i].style.display = "none";
            }
        }
    }
</script>
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-12 grid-margin">
                <div class="card">
                    <!-- put your content here -->
                    <div class="card-body">
                        <h4 class="card-title">
                            <!--<i class="glyphicon glyphicon-th"></i> Trader Entry<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customergroup/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>-->
                        </h4>
                        <?php
                        $status                =    $type;
                        $id                    =    $_POST['fv']['cgrp_id'] == NULL ? NULL : $_POST['fv']['cgrp_id'];
                        $attributes         =    array('class' => 'form-horizontal');
                        //Opening form
                        echo form_open($controller_name . "/DB_Controller/" . $model_name . "/" . $status . "/" . $id, $attributes);
                        ?>
                        <div class="form-sample">
                            <p class="card-description card-description1"> Customer Group</p>

                            <?php
                            if (isset($db_error_msg) && $db_error_msg != '') {
                                echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> ' . $db_error_msg . '
											</div>';
                            } ?>
                            <div class="row form-sample1" style="display: none;">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Entry Date *</label>
                                        <div class="col-sm-7">
                                            <div class="input-group date" id="datetimepicker1">
                                                <input data-date-format="DD-MM-YYYY" type="text" class="form-control"
                                                    name="fv[cgrp_entrydate]" tabindex="1" id="cgrp_entrydate" size="25"
                                                    maxlength="10" readonly="true" value="31-05-2024" required="">
                                                <span class="input-group-addon"><span
                                                        class="glyphicon-calendar glyphicon"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Effective Date *</label>
                                        <div class="col-sm-7">
                                            <div class="input-group date" id="datetimepicker1">
                                                <input data-date-format="DD-MM-YYYY" type="text" class="form-control"
                                                    name="fv[cgrp_effectivedate]" tabindex="2" id="cgrp_effectivedate"
                                                    size="25" maxlength="10" readonly="true"
                                                    value="<?php echo set_value('cgrp_effectivedate', $cgrp_effectivedate); ?>"
                                                    required />
                                                <span class="input-group-addon"><span
                                                        class="glyphicon-calendar glyphicon"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row form-sample1">
                                <div class="col-md-8">
                                    <div class="form-group row">
                                        <label class="col-sm-3 col-form-label"></label>
                                        <div class="col-sm-5">
                                            <?php $tabindex = 4; ?>
                                            <select name="cgc_group" id="cgc_group" tabIndex="<?php echo $tabindex++; ?>" class="form-control">
                                                <?php
                                                echo $this->$model_name->load_customergroup(Null);
                                                ?>
                                            </select>
                                            <span class="help-block">Select the list box.</span>
                                        </div>

                                        <div class="col-md-2">
                                            <button name="button1" type="button" value="Apply" onclick="applyGroup();" tabIndex="<?php echo $tabindex++; ?>" class="btn btn-success btnapp">Apply</button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4"></div>
                    </div>
                    <div class="table-responsive customergroup" style="margin-top: 10px;">
                        <table id="data_grid_header" class="table table-hover1">
                            <thead>
                                <tr>
                                    <th width="5%"><input type="checkbox" name="select_all" id="select_all" value="" onclick="selectAll(this,'data_grid')" /> All</th>
                                    <th width="25%">Customer</th>
                                    <th width="25%">Company</th>
                                    <th width="20%">Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td align="center"><input type="text" name="customersearch" id="customersearch" value="" class="listsearchinput" maxlength="30" onkeyup="searchdata()" /></td>
                                    <td align="center"><input type="text" name="companysearch" id="companysearch" value="" class="listsearchinput" maxlength="30" onkeyup="searchdata()" /></td>
                                    <td align="center"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="height:300px;overflow:auto;" class="table">
                        <table id="data_grid" class="table table-striped table-bordered bootstrap-datatable">
                            <?php
                            $tabindex = 3;
                            $result_set = $this->$model_name->load_customer($id);
                            //echo($sql);
                            foreach ($result_set->result_array() as $row) {
                            ?>
                                <tr>
                                    <td width="5%"><input type="checkbox" name="select[]" value="" /></td>
                                    <td width="25%"><input class="cus_id" type="hidden" name="cgrpitems[cus_id][]"
                                            tabIndex="<?php echo $tabindex++; ?>"
                                            value="<?php echo $row['cus_id']; ?>" /><?php echo $row['cus_name']; ?></td>

                                    <td width="25%"><?php echo $row['cus_company_name']; ?></td>
                                    <td width="20%">
                                        <select class="form-control cgitems_comgroupid"
                                            name='cgrpitems[cgitems_comgroupid][]' id='cgitems_comgroupid[]'
                                            tabIndex="<?php echo $tabindex++; ?>"
                                            required><?php echo $this->$model_name->load_customergroup($row['cgitems_comgroupid']); ?></select>
                                    </td>
                                </tr>
                            <?php } ?>
                        </table>
                    </div>
                    <div class="row form-sample1">
                        <div class="col-md-4"></div>
                        <div class="col-md-4 page_footer" style="margin-bottom:20px;">
                            <?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
                                <button type="submit" onclick="validate(event)"
                                    class="btn btn1 btn-success btn-md btn-md1 save">Update</button>
                            <?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
                                <button type="submit" class="btn btn1 btn-success btn-md btn-md1 save">Save</button>
                            <?php } ?>
                            <button type="button" class="btn btn1 btn-danger btn-md btn-md2"
                                onclick="history.back();">Cancel</button>
                        </div>
                        <div class="col-md-4">

                        </div>
                    </div>

                    </div>
                    <?php echo form_close(); ?>
                </div>
            </div>
        </div>
    </div>
</div>


<?php $this->load->view("include/footer"); ?>
<script type="text/javascript">
    $('document').ready(function() {
        $('.save').click(function(event) {
            event.preventDefault();
            get_data();
        });
    });

    function get_data() {
        var postData = {
            'cgrp_entrydate': $("#cgrp_entrydate").val(),
            'cgrp_effectivedate': $("#cgrp_effectivedate").val()
        };
        var $btn = $('.save');
        var btnOrigText = $btn.text().trim();

        // Show loader FIRST, then delay 50ms so browser can paint before async:false blocks UI thread
        $btn.prop('disabled', true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
        $('#ajax_loader').addClass('show');

        setTimeout(function() {
            my_Date = new Date();
            $.ajax({
                url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customergroup/customer_group/<?php echo $id ?>/0/" +
                    my_Date.getUTCSeconds(),
                async: false,
                type: "POST",
                dataType: 'json',
                data: postData,
                success: function(result) {
                    if (result.status == 'true') {
                        var groupData = [];
                        var remainingRecords = $('#data_grid tr').size();
                        var subracted_records = 0;
                        $("#data_grid").find("tr").each(function(i) {
                            var row = $(this);
                            groupData.push({
                                'cus_id': row.find('.cus_id').val(),
                                'cgitems_comgroupid': row.find('.cgitems_comgroupid').val()
                            });
                            var subractRecords = parseFloat(remainingRecords) > 500 ? 500 : remainingRecords;

                            if (parseFloat(i + 1) - parseFloat(subracted_records) == parseInt(subractRecords)) {
                                var result = post_data(groupData);
                                var jsonresponse = JSON.parse(result.responseText);
                                if (jsonresponse['status'] == 'true') {
                                    remainingRecords = parseFloat(remainingRecords) - parseFloat(subractRecords);
                                    subracted_records = parseFloat(subracted_records) + parseFloat(subractRecords);
                                    groupData = [];
                                } else {
                                    $('#ajax_loader').removeClass('show');
                                    $btn.prop('disabled', false).text(btnOrigText);
                                    showToast("Unable to insert data. Please try again later.", 'danger');
                                    return false;
                                }
                            }
                        });
                    }
                },
                error: function(error) {
                    $('#ajax_loader').removeClass('show');
                    $btn.prop('disabled', false).text(btnOrigText);
                    showToast('Server error. Please try again.', 'danger');
                }
            });

            $('#ajax_loader').removeClass('show');
            $btn.prop('disabled', false).text(btnOrigText);
            window.location.href = "<?php echo $this->config->item('base_url'); ?>index.php/C_customergroup/open_listingform";
        }, 50); // 50ms delay lets browser paint the loader before sync XHR blocks UI thread
    }

    function post_data(groupData) {

        var postData = {
            'cusGroup': groupData
        };
        my_Date = new Date();
        return $.ajax({
            url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customergroup/customer_group/<?php echo $id ?>/1/" +
                my_Date.getUTCSeconds(),
            async: false,
            type: "POST",
            dataType: 'json',
            data: postData,
            success: function(data) {
                console.log(data);
            },
        })
    }
</script>