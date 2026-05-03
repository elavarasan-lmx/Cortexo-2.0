<?php
$this->load->view('include/header.php');
$this->load->helper('common');
$this->load->view('common/confirm_modal.php'); // BZ: Shared confirmation modal
$general_Settings = $this->commodity_model->get_generalsettings();
$disp_margin = $this->login_model->get_marginsettings();
$model_name = "commodity_model";
?>
<style>
    #ajax_loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        z-index: 9999;
        display: none;
        justify-content: center;
        align-items: center;
        text-align: center;
        transition: opacity 0.2s ease-in-out;
    }

    #ajax_loader.show {
        display: flex !important;
        justify-content: center !important;
        opacity: 1;
    }

    #ajax_loader img {
        /* width: 100px; */
        height: 100px;
        display: block;
        margin: 0 auto;
    }

    .footer {
        padding: 0px 10px
    }

    .EnableDisableComm {
        display: none;
    }

    .com-barQuantities {
        padding: 0px;
    }
</style>
<script type="text/javascript">
    const BASE_URL = "<?php echo $this->config->item('base_url'); ?>";

    function validateCommodityName(event) {
        let target = $(event.target);
        let val = target.val();
        if (val.length < 4) {
            target.css("border", "1px solid red");
            $("#com_name_error_length").show();
            $(".saveBtn").prop("disabled", true);
        } else {
            target.css("border", "");
            $("#com_name_error_length").hide();
            $(".saveBtn").prop("disabled", false);
        }
    }

    function validateWeight(event) {
        let Com_weight = $("#com_weight");
        let Com_weight_val = parseFloat(Com_weight.val());

        let Com_display_purity = $("#com_display_purity");
        let purity_val = Com_display_purity.val();

        let com_order_number = $("#com_order_number");
        let com_order_number_val = com_order_number.val();

        let com_bar_no = $("#com_bar_no");
        let com_bar_no_val = com_bar_no.val();

        $(".error").remove();

        let target = $(event.target);

        // Commodity Name validation
        if (target.is("#com_name")) {
            validateCommodityName(event);
        }

        // Weight validation
        if (target.is("#com_weight")) {
            if (isNaN(Com_weight_val) || Com_weight_val <= 0) {
                Com_weight.val('');
                Com_weight.after('<span class="error text-danger">Weight must be greater than 0.</span>');
                Com_weight.css("border", "1px solid red");
                $(".saveBtn").prop("disabled", true);
            } else {
                Com_weight.css("border", "");
                $(".saveBtn").prop("disabled", false);
            }
        }

        // Order validation
        if (target.is("#com_order_number")) {
            if (isNaN(com_order_number_val) || com_order_number_val <= 0) {
                com_order_number.val('');
                com_order_number.after('<span class="error text-danger">Sequence Number start from 1.</span>');
                com_order_number.css("border", "1px solid red");
                $(".saveBtn").prop("disabled", true);
            } else {
                com_order_number.css("border", "");
                $(".saveBtn").prop("disabled", false);
            }
        }

        // Bar Number
        if (target.is("#com_bar_no")) {
            if (isNaN(com_bar_no_val) || com_bar_no_val <= 0) {
                com_bar_no.val('');
                com_bar_no.after('<span class="error text-danger">No of Bars Number start from 1.</span>');
                com_bar_no.css("border", "1px solid red");
                $(".saveBtn").prop("disabled", true);
            } else {
                com_bar_no.css("border", "");
                $(".saveBtn").prop("disabled", false);
            }
        }

        // Bar Quantity
        if (target.is("#com_bar_quantity")) {
            let com_bar_quantity = $("#com_bar_quantity");
            let com_bar_quantity_val = parseFloat(com_bar_quantity.val());
            if (isNaN(com_bar_quantity_val) || com_bar_quantity_val <= 0) {
                com_bar_quantity.val('');
                com_bar_quantity.after('<span class="error text-danger">Bar Quantity must be greater than 0.</span>');
                com_bar_quantity.css("border", "1px solid red");
                $(".saveBtn").prop("disabled", true);
            } else {
                com_bar_quantity.css("border", "");
                $(".saveBtn").prop("disabled", false);
            }
        }

        // Purity validation
        if (target.is("#com_display_purity")) {
            let regex = /^[0-9]{0,2}(\.[0-9]{0,2})?$/;
            // Purity is NaN or <= 0
            if (parseFloat(purity_val) < 0 || isNaN(purity_val) || purity_val == '') {
                Com_display_purity.val('');
                Com_display_purity.after('<span class="error text-danger">Please Enter Value.</span>');
                Com_display_purity.css("border", "1px solid red");
                $(".saveBtn").prop("disabled", true);
            }
            // Purity doesn't match the regex
            else if (!regex.test(purity_val)) {
                Com_display_purity.val(purity_val.slice(0, -1)); // Prevent user from entering invalid input.
                // Com_display_purity.css("border", "1px solid red");
                // $(".saveBtn").prop("disabled", true); 
            } else {
                Com_display_purity.css("border", "");
                $(".saveBtn").prop("disabled", false);
            }
        }

    }

    function validateRoundOff(event) {
        const key = event.key;
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (allowedKeys.includes(key)) return;

        if (!/^[0-5]$/.test(key)) {
            event.preventDefault();
        }
    }

    // function validate(e) {
    //     e.preventDefault();

    //     var isOrderValid = true;
    //     var isComNameValid = true;

    //     // if (<?php echo json_encode($type); ?> == 'add_new') {
    //     $.ajax({
    //         type: "POST",
    //         dataType: "json",
    //         url: "<?php echo $this->config->item('base_url'); ?>index.php/C_commodity_master/get_comName",
    //         data: {
    //             com_name: document.getElementById('com_name').value
    //         },
    //         async: false,
    //         success: function(data) {
    //             if (data.status) {
    //                 showToast('Commodity Name already exists', 'danger');
    //                 isComNameValid = false;
    //             }
    //         }
    //     });

    //     $.ajax({
    //         type: "POST",
    //         dataType: "json",
    //         url: "<?php echo $this->config->item('base_url'); ?>index.php/C_commodity_master/get_orderNo",
    //         data: {
    //             com_order_number: document.getElementById('com_order_number').value
    //         },
    //         async: false,
    //         success: function(data) {
    //             if (data.status) {
    //                 showToast('Sequence Number already exists', 'danger');
    //                 isOrderValid = false;
    //             }
    //         }
    //     });
    //     // }

    //     if (isOrderValid && isComNameValid) {
    //         $("#iframeForm").submit();
    //     }
    // }

    $(document).ready(function() {
        $("#commodity_entry").on("submit", function(e) {
            e.preventDefault();
            let form = this;

            // 1. Standard Validation
            if (!validateForm(e, form)) {
                return false;
            }

            // ─── BZ: Limit Order Guard — pre-check before submit ───
            if (!$(form).data('limit_confirmed')) {
                var comId = $('input[name="fv[com_id]"]').val() || '';
                var comActive = $('input[name="fv[com_active]"]:checked').val();
                if (comId && comActive == '0') {
                    $.ajax({
                        url: BASE_URL + "index.php/C_commodity_master/check_commodity_limits",
                        type: "POST",
                        data: { com_id: comId, com_active: comActive },
                        dataType: "json",
                        success: function(resp) {
                            if (resp.has_limits === true) {
                                showConfirmModal(
                                    '⚠️ Active Limit Orders Found',
                                    resp.message,
                                    function() {
                                        $(form).data('limit_confirmed', true);
                                        $(form).trigger('submit');
                                    }
                                );
                            } else {
                                $(form).data('limit_confirmed', true);
                                $(form).trigger('submit');
                            }
                        },
                        error: function() {
                            $(form).data('limit_confirmed', true);
                            $(form).trigger('submit');
                        }
                    });
                    return false;
                } else {
                    $(form).data('limit_confirmed', true);
                }
            }
            $(form).data('limit_confirmed', false);

            let btn = $(form).find('button[type="submit"]');
            let formData = new FormData(form);

            btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
            $("#ajax_loader").addClass("show");

            $.ajax({
                url: $(form).attr("action"),
                type: "POST",
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                data: formData,
                processData: false,
                contentType: false,
                dataType: "json",
                success: function(response) {
                    $("#ajax_loader").removeClass("show");

                    if (response.status === "success") {
                        showToast(response.message, 'success');
                        setTimeout(function() {
                            window.location.href = "<?= site_url('C_commodity_master/open_listingform') ?>";
                        }, 1000);
                    } else {
                        btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
                        showToast(response.message, 'danger');
                    }
                },
                error: function(xhr, status, error) {
                    $("#ajax_loader").removeClass("show");
                    btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
                    showToast("Server error: " + error, 'danger');
                }
            });
        });
    });



    $(document).ready(function() {

        // Initial function calls
        act_is_region();
        act_is_tradeStaus();
        act_is_margin(true);
        act_bar_selection();

        $('input[type=radio][name=add_status]').change(function() {
            $(".EnableDisableComm").toggle(this.value == "1");
        });

        $("input[type=radio][name='fv[bar_selection]']").change(barNos);
        barNos();
        const SITE_URL = "<?= site_url(); ?>";

        // AJAX form submit
        // $("#commodity_entry").on("submit", function(e) {
        //     e.preventDefault();

        //     let form = $(this);
        //     let btn = form.find('button[type="submit"]');
        //     btn.prop("disabled", true).text("Saving...");
        //     $("#ajax_loader").addClass("show");

        //     $.ajax({
        //         url: form.attr("action"),
        //         type: "POST",
        //         data: form.serialize(),
        //         dataType: "json",
        //         success: function(response) {
        //             $("#ajax_loader").removeClass("show");

        //             if (response.status === "success") {
        //                 window.location.href = SITE_URL + "/C_commodity_master/open_listingform";
        //             } else {
        //                 toastr.error(response.message || "Failed to save settings. Please try again.");
        //                 btn.prop("disabled", false).text("Save");
        //                 $("#ajax_loader").removeClass("show");
        //             }
        //         },
        //         error: function(xhr, status, error) {
        //             $("#ajax_loader").removeClass("show");
        //             btn.prop("disabled", false).text("Save");
        //             toastr.error("Server error: " + error);
        //         }
        //         // }).done(function(response) {
        //         //     if (response.status === "success") {
        //         //         window.location.href = SITE_URL + "/C_commodity_master/open_listingform";
        //         //     } else {
        //         //         toastr.error(response.message || "Failed to save settings. Please try again.");
        //         //         btn.prop("disabled", false).text("Save");
        //         //         $("#ajax_loader").removeClass("show");
        //         //     }
        //         // }).fail(function(xhr, status, error) {
        //         //     toastr.error("Server error: " + error);
        //         //     btn.prop("disabled", false).text("Save");
        //         //     $("#ajax_loader").removeClass("show");
        //     });

        // });

    });

    function barNos() {
        var has_bar_selection = $("#bar_selection_yes").is(":checked") ? 1 : 0;

        if (has_bar_selection == 1) {
            $(".barNos").css("display", "block");
        } else {
            $(".barNos").css("display", "none");
        }
    }

    function act_is_margin(isOnLoad = false) {

        const isPercentage = document.getElementById("com_margin_type").value == "1";

        const percentage = document.querySelector('.percentage');
        const decimal_val = document.querySelector('.decimal_val');

        if (!isOnLoad) {
            percentage.value = "";
            decimal_val.value = "";
        }

        percentage.style.display = isPercentage ? 'block' : 'none';
        decimal_val.style.display = isPercentage ? 'none' : 'block';

        if (isPercentage) {
            percentage.setAttribute("name", "fv[com_margin_value]");
            decimal_val.removeAttribute("name");
        } else {
            decimal_val.setAttribute("name", "fv[com_margin_value]");
            percentage.removeAttribute("name");
        }
    }

    function act_is_region() {
        var puritySetting = document.getElementById('com_isregion_yes').checked;
        var displayPurity = document.querySelector('.com_display_purity');
        var purityConversion = document.querySelector('.com_Calpurity');

        if (puritySetting) {
            purityConversion.style.display = 'block';
            displayPurity.style.display = 'none';
        } else {
            purityConversion.style.display = 'none';
            displayPurity.style.display = 'block';

        }

    }

    function act_is_tradeStaus() {
        var tradeStatus = document.getElementById('add_status_yes').checked;
        var trade = document.querySelector('.trade_status');

        if (tradeStatus) {
            trade.style.display = 'block';
        } else {
            trade.style.display = 'none';
        }
    }

    function act_bar_selection() {
        var barSelection = document.getElementById('bar_selection_yes').checked;
        var barQty = document.querySelector('.com_bar_quantity');
        var barNo = document.querySelector('.com_bar_no');
        var allowDecimal = document.querySelector('.allowed_decimals');

        if (barSelection) {
            barQty.style.display = 'block';
        } else {
            barQty.style.display = 'none';
        }
    }
</script>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-12 grid-margin ">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">
                            <a style="display:none;" href="<?php echo $this->config->item('base_url'); ?>index.php/C_commodity_master/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>
                        </h4>
                        <?php
                        $status = $type;
                        $id = $_POST['fv']['com_id'] == NULL ? NULL : $_POST['fv']['com_id'];
                        $attributes = array('class' => 'form-horizontal', 'id' => 'commodity_entry', 'name' => 'iframeForm', 'novalidate' => 'novalidate');
                        //Opening form
                        echo form_open('C_commodity_master/DB_Controller/commodity_model/' . $status . '/' . $id, $attributes);
                        ?>
                        <input type="hidden" name="fv[com_id]" value="<?= $com_id ?>">
                        <p class="card-description card-description1"> Commodity Master</p>
                        <?php
                        if (isset($db_error_msg) && $db_error_msg != '') {
                            echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> ' . $db_error_msg . '
											</div>';
                        }
                        ?>

                        <?php if ($this->session->flashdata('message')): ?>
                            <script type="text/javascript">
                                showToast("<?php echo addslashes($this->session->flashdata('message')); ?>", 'info');
                            </script>
                        <?php
                        endif; ?>

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Commodity Name * </label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="fv[com_name]" tabindex="1"
                                            maxlength="50" minlength="4" id="com_name"
                                            value="<?php echo set_value('com_name', $com_name); ?>"
                                            placeholder="gold, silver" onkeydown="validateKeyPress(event, this, 6)"
                                            oninput="validateWeight(event)"
                                            required data-no-numbers-only />
                                        <span id="com_name_error" class="text-danger"
                                            style="display: none;">Commodity name cannot start with a number or be
                                            only numbers.</span>
                                        <span id="com_name_error_length" class="text-danger" style="display: none;">Commodity name must be at least 4 characters.</span>
                                        <span class="help-block">Name of the item to be displayed in live rate
                                            page</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Purity Settings</label>
                                    <div class="col-sm-7">

                                        <?php render_radio_group_with_onchange('fv[com_isregion]', [1 => ['label' => 'On', 'id' => 'com_isregion_yes'], 0 => ['label' => 'Off', 'id' => 'com_isregion_no']], $com_isregion, 'This settings includes/excludes regional taxes', '', 'act_is_region()'); ?>




                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">R-Panel Commodity Type * </label>
                                    <div class="col-sm-7">
                                        <select name="fv[com_type]" id="com_type" tabindex="2" class="form-control">
                                            <?php echo $this->$model_name->load_rpanelcommodity($com_type); ?>
                                        </select>
                                        <span class="help-block">This item will be categorized under this
                                            group</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 com_Calpurity">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Purity Conversion *</label>
                                    <div class="col-sm-7">
                                        <select name="fv[com_calpurity]" id="com_calpurity" class="form-control"> //
                                            <?php if ($com_isregion == 0) { ?> disabled <?php
                                                                                    } ?>
                                            <option value="0"
                                                <?php echo $com_calpurity == 0 ? "selected=selected" : ""; ?>>995</option>
                                            <option value="1"
                                                <?php echo $com_calpurity == 1 ? "selected=selected" : ""; ?>>999</option>
                                            <option value="2"
                                                <?php echo $com_calpurity == 2 ? "selected=selected" : ""; ?>>9999
                                            </option>
                                        </select>
                                        <span class="help-block">It convers into specified purity</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6 com_display_purity">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Display Purity </label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="fv[com_display_purity]" id="com_display_purity" value="<?php echo set_value('com_display_purity', $com_display_purity); ?>" placeholder="" oninput="validateWeight(event)" />
                                        <span class="help-block">Showing this display purity (example: 99.99).</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Weight (In Grm) *</label>
                                    <div class="col-sm-7">
                                        <input type="text" step="any" class="form-control" name="fv[com_weight]"
                                            id="com_weight"
                                            value="<?php echo set_value('com_weight', $com_weight); ?>" tabindex="3"
                                            placeholder="" required oninput="validateWeight(event)" onkeydown="validateKeyPress(event, this, 2,10,3)" />
                                        <span class="help-block">Rate will be displayed in specified weight</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Round-off factor</label>
                                    <div class="col-sm-7">
                                        <select class="form-control" name="fv[com_correction_type]"
                                            id="com_correction_type">
                                            <option value="0.00"
                                                <?php echo $com_correction_type == 0.00 ? "selected=selected" : ""; ?>>0
                                                Ps</option>
                                            <option value="0.05"
                                                <?php echo $com_correction_type == 0.05 ? "selected=selected" : ""; ?>>5
                                                Ps</option>
                                            <option value="0.25"
                                                <?php echo $com_correction_type == 0.25 ? "selected=selected" : ""; ?>>25
                                                Ps</option>
                                            <option value="0.5"
                                                <?php echo $com_correction_type == 0.5 ? "selected=selected" : ""; ?>>50
                                                Ps</option>
                                            <option value="1"
                                                <?php echo $com_correction_type == 1 ? "selected=selected" : ""; ?>>1 Rs
                                            </option>
                                            <option value="5"
                                                <?php echo $com_correction_type == 5 ? "selected=selected" : ""; ?>>5 Rs
                                            </option>
                                            <option value="10"
                                                <?php echo $com_correction_type == 10 ? "selected=selected" : ""; ?>>10 Rs
                                            </option>
                                            <option value="25"
                                                <?php echo $com_correction_type == 25 ? "selected=selected" : ""; ?>>25 Rs
                                            </option>
                                            <option value="50"
                                                <?php echo $com_correction_type == 50 ? "selected=selected" : ""; ?>>50 Rs
                                            </option>
                                            <!-- <option value="75" <?php echo $com_correction_type == 75 ? "selected=selected" : ""; ?>>75 Rs</option> -->
                                            <option value="100"
                                                <?php echo $com_correction_type == 100 ? "selected=selected" : ""; ?>>100
                                                Rs</option>
                                        </select>
                                        <span class="help-block">Will be rounded off to the next specified
                                            value</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Other charges *</label>
                                    <div class="col-sm-7">
                                        <input type="text" step="any" maxlength="10" min="0" class="form-control"
                                            name="fv[com_other_charges]" id="com_other_charges"
                                            value="<?php echo set_value('com_other_charges', $com_other_charges); ?>"
                                            placeholder="" onkeydown="validateKeyPress(event, this,2,9,2)" required />
                                        <span class="help-block">Applicable charges with this item</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Sequence Number *</label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="fv[com_order_number]"
                                            id="com_order_number"
                                            value="<?php echo set_value('com_order_number', $com_order_number); ?>"
                                            placeholder="" required oninput="validateWeight(event)" maxlength="2" />
                                        <span class="help-block">Will list thie item in specified sequence</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="row form-sample1">

                        </div>
                        <div class="row form-sample1">

                            <?php if ($general_Settings['admin_is_coin'] == 1) { ?>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Is Madurai Rate? </label>
                                        <div class="col-sm-7">

                                            <?php render_radio_group('fv[com_is_coin]', [1 => ['label' => 'Yes', 'id' => 'com_is_coin_yes'], 0 => ['label' => 'No', 'id' => 'com_is_coin_no']], $com_is_coin, 'Showing Madurai table'); ?>
                                        </div>
                                    </div>
                                </div>
                            <?php
                            } ?>
                        </div>
                        <div class="row form-sample1">

                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Decimals for rate *</label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="fv[com_roundoff]"
                                            id="com_roundoff"
                                            value="<?php echo set_value('com_roundoff', $com_roundoff); ?>"
                                            placeholder="" required onkeydown="validateRoundOff(event)"
                                            maxlength="1" />
                                        <span class="help-block">Number of digits after decimal point</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 allowed_decimals">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Decimals for qty*</label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="fv[allowed_decimals]"
                                            id="allowed_decimals"
                                            value="<?php echo set_value('allowed_decimals', $allowed_decimals); ?>"
                                            placeholder="" required maxlength="1"
                                            onkeydown="validateRoundOff(event)" />
                                        <span class="help-block">Number of digits after decimal point for booking qty</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php if ($lite_trade == 1) { ?>
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Is Bar Selection</label>
                                        <div class="col-sm-7">

                                            <?php render_radio_group_with_onchange('fv[bar_selection]', [1 => ['label' => 'Yes', 'id' => 'bar_selection_yes'], 0 => ['label' => 'No', 'id' => 'bar_selection_no']], $bar_selection, 'Bars selection through drop down or manual entering', '', 'act_bar_selection()'); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 com_bar_quantity">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">No of bars * </label>
                                        <div class="col-sm-7">
                                            <input type="text" step="any" class="form-control" name="fv[com_bar_no]" id="com_bar_no"
                                                value="<?php echo set_value('com_bar_no', $com_bar_no); ?>" maxlength="5"
                                                oninput="validateWeight(event)" required />
                                            <span class="help-block">Enter no of bars, if bar selection is
                                                selected</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- <div class="col-md-6 allowed_decimals">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Decimals for qty*</label>
                                        <div class="col-sm-7">
                                            <input type="text" class="form-control" name="fv[allowed_decimals]"
                                                id="allowed_decimals"
                                                value="<?php echo set_value('allowed_decimals', $allowed_decimals); ?>"
                                                placeholder="" required maxlength="3"
                                                onkeydown="validateKeyPress(event, this,1)" />
                                            <span class="help-block">Number of digits after decimal point for booking qty</span>
                                        </div>
                                    </div>
                                </div> -->
                            </div>
                        <?php } ?>
                        <div class="row form-sample1" <?php if ($disp_margin == 0) { ?> style="display:none"
                            <?php
                                                        } ?>>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Margin Type</label>
                                    <div class="col-sm-7">
                                        <select name="fv[com_margin_type]" id="com_margin_type" class="form-control" onchange="act_is_margin(false)">
                                            <option value="1" <?php echo $com_margin_type == 1 ? "selected" : ""; ?>>Percentage</option>
                                            <option value="0" <?php echo $com_margin_type == 0 ? "selected" : ""; ?>>Value</option>
                                        </select>
                                        <span class="help-block">Select Margin Type.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Margin Value</label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control percentage" name="fv[com_margin_value]" id="com_margin_value_percentage" value="<?php echo set_value('com_margin_value', $com_margin_value); ?>" onkeydown="validateKeyPress(event, this,2,2,2)" />
                                        <input type="text" class="form-control decimal_val" name="fv[com_margin_value]" id="com_margin_value_decimal" value="<?php echo set_value('com_margin_value', $com_margin_value); ?>" onkeydown="validateKeyPress(event, this,2,10,2)" />
                                        <span class="help-block">Enter Margin Value.(Fix Margin/ Kg for Value)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php if ($lite_trade == 1) { ?>
                            <div>
                                <div class="row form-sample1">

                                    <div class="col-md-6">
                                        <div class="form-group row">
                                            <label class="col-sm-4 col-form-label">Bar Quantity </label>
                                            <div class="col-sm-7">
                                                <div class="row">
                                                    <div class="col-md-6 com-barQuantities">
                                                        <input type="text" step="any" class="form-control" name="fv[com_bar_quantity]" id="com_bar_quantity" value="<?php echo set_value('com_bar_quantity', $com_bar_quantity); ?>" onkeydown="validateKeyPress(event, this,1)" oninput="validateWeight(event)" maxlength="3" />
                                                    </div>
                                                    <div class="col-md-6">
                                                        <select name="fv[com_bar_type]" id="com_bar_type"
                                                            class="form-control">
                                                            <option value="0"
                                                                <?php echo $com_bar_type == 0 ? "selected=selected" : ""; ?>>Grams
                                                            </option>
                                                            <option value="1"
                                                                <?php echo $com_bar_type == 1 ? "selected=selected" : ""; ?>>Kg
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <div class="col-md-6">
                                        <div class="form-group row">
                                            <label class="col-sm-4 col-form-label">No of bars * </label>
                                            <div class="col-sm-7">
                                                <input type="text" step="any" class="form-control" name="fv[com_bar_no]" id="com_bar_no"
                                                    value="<?php echo set_value('com_bar_no', $com_bar_no); ?>" maxlength="5"
                                                    oninput="validateWeight(event)" required />
                                                <span class="help-block">Enter no of bars, if bar selection is
                                                    selected</span>
                                            </div>
                                        </div>
                                    </div> -->
                                </div>
                            </div>
                        <?php } ?>
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Active</label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group('fv[com_active]', [1 => ['label' => 'Yes', 'id' => 'com_active_yes'], 0 => ['label' => 'No', 'id' => 'com_active_no']], $com_active, 'Enable/disable this commodity'); ?>
                                    </div>
                                </div>
                            </div>
                            <?php if ($lite_trade == 1) { ?>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Update Trading Status</label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group_with_onchange('add_status', [1 => ['label' => 'Yes', 'id' => 'add_status_yes'], 0 => ['label' => 'No', 'id' => 'add_status_no']], 0, 'Update trading status for commodity to each customers', '', 'act_is_tradeStaus()'); ?>
                                        </div>
                                    </div>
                                </div>
                            <?php } ?>
                        </div>
                        <?php if ($lite_trade == 1) { ?>
                            <div class="trade_status">
                                <div class="row form-sample1">
                                    <div class="col-md-6">
                                        <div class="form-group row">
                                            <label class="col-sm-4 col-form-label">Sell status</label>
                                            <div class="col-sm-7">
                                                <?php render_radio_group('enable_commodity_sell', [1 => ['label' => 'Enable', 'id' => 'sell_status_on'], 0 => ['label' => 'Disable', 'id' => 'sell_status_off']], null, 'Enable/Disable selling trade status for customers'); ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group row">
                                            <label class="col-sm-4 col-form-label">Buy status</label>
                                            <div class="col-sm-7">
                                                <?php render_radio_group('enable_commodity_buy', [1 => ['label' => 'Enable', 'id' => 'buy_status_on'], 0 => ['label' => 'Disable', 'id' => 'buy_status_off']], null, 'Enable/Disable buying trade status for customers'); ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php } ?>

                        <div class="row form-sample1">
                            <div class="col-md-4"></div>
                            <div class="col-md-4 page_footer" style="text-align:center !important;">
                                <?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
                                    <input type="hidden" name="old_com_name" id="old_com_name" value="<?= $com_name ?>">
                                    <input type="hidden" name="old_order_no" id="old_order_no" value="<?= $com_order_number ?>">
                                    <button type="submit" class="btn btn1 btn-success btn-md btn-md1 saveBtn">Update</button>
                                <?php
                                } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
                                    <button type="submit" class="btn btn1 btn-success btn-md btn-md1 saveBtn">Save</button>
                                <?php
                                } ?>
                                <button type="button" class="btn btn1 btn-danger btn-md btn-md2"
                                    onclick="history.back();">Cancel</button>
                            </div>
                            <div class="col-md-4">

                            </div>
                        </div>
                        <?php echo form_close(); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<?php $this->load->view("include/footer"); ?>