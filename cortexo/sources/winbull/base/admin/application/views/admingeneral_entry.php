<?php
$this->load->view('include/header.php');
$model_name = "Adminrpanel_model";
?>
<!-- ✅ Include toastr CSS & JS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>

<style>
    .footer {
        padding: 0 10px;
    }

    .days,
    .time {
        width: 12%;
    }

    .time input {
        background: #FFF !important;
        cursor: pointer !important;
    }

    .timeAndDays,
    .AutoTradeONTime,
    .AutoTradeOFFTime,
    .AutoMarketONTime,
    .AutoMarketOFFTime {
        display: none;
    }

    .hint {
        color: red !important;
        font-weight: 900 !important;
    }

    /* Loading overlay styling */
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

    .country {
        padding-left: 0;
        padding-right: 0;
        height: 30px;
        margin-left: -10px;
    }

    .gap-2 {
        gap: unset !important;
    }

    .country-select,
    country-select {
        border-radius: 5px 0px 0px 5px !important;
        border-right: unset !important;
        border: 1px solid #dee2e6 !important;
    }

    .mobile-input {
        border-radius: 0px 5px 5px 0px !important;
        border: 1px solid #dee2e6 !important;
    }

    .flag {
        margin-right: 5px !important;
        /* padding-left: 5px !important; */
    }

    .typcn-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<script type="text/javascript">
    const SITE_URL = "<?= site_url(); ?>";
    $(document).ready(function() {
        $('#opening_date').datetimepicker({
            format: 'DD-MM-YYYY',
            pickTime: false
        });
        $('#limitcancel_time').timepicker({
            template: false,
            showInputs: false,
            minuteStep: 1
        });
        $('#trade_on_time').timepicker({
            template: false,
            showInputs: false,
            minuteStep: 1
        });
        $('#trade_off_time').timepicker({
            template: false,
            showInputs: false,
            minuteStep: 1
        });

        $('#market_on_time').timepicker({
            template: false,
            showInputs: false,
            minuteStep: 1
        });
        $('#market_off_time').timepicker({
            template: false,
            showInputs: false,
            minuteStep: 1
        });

        $('input[type=checkbox][name="fv[has_gminqty]"], input[type=checkbox][name="fv[has_sminqty]"], input[type=checkbox][name="fv[has_gmaxqty]"], input[type=checkbox][name="fv[has_smaxqty]"], input[type=checkbox][name="fv[has_gallot_qty]"], input[type=checkbox][name="fv[has_sallot_qty]"]').change(function() {
            change_qtystatus();
        });
        $('input[type=radio][name="fv[limit_cancellation]"]').change(function() {
            enableTimeForLimitCancellation();
        });
        $('input[type=radio][name="fv[trade_on]"]').change(function() {
            enableTimeForAutoTradeON();
        });
        $('input[type=radio][name="fv[trade_off]"]').change(function() {
            enableTimeForAutoTradeOFF();
        });

        $('input[type=radio][name="fv[market_on]"]').change(function() {
            enableTimeForAutoMarketON();
        });
        $('input[type=radio][name="fv[market_off]"]').change(function() {
            enableTimeForAutoMarketOFF();
        });

        change_qtystatus();
        enableTimeForLimitCancellation();
        enableTimeForAutoTradeON();
        enableTimeForAutoTradeOFF();

        enableTimeForAutoMarketOFF();
        enableTimeForAutoMarketON();

        // BZ-40: Toggle trade history days field based on checkbox
        toggleTradeHistoryField();
        $('#expire_history').change(function() {
            toggleTradeHistoryField();
        });

        // Show loader before AJAX call
        $("#ajax_loader").addClass("show");

        // Hide loader after AJAX completes
        $("#ajax_loader").removeClass("show");

        // AJAX form submit
        $("#general_settings").on("submit", function(e) {
            e.preventDefault();
            let form = $(this);
            let btn = form.find('button[type="submit"]');
            let btnText = btn.text();

            // Validate: Max Qty must not exceed Max Allot (when both are enabled)
            if ($("#has_gmaxqty").is(":checked") && $("#has_gallot_qty").is(":checked")) {
                var goldMaxQty = parseFloat($("#gold_max_qty").val()) || 0;
                var goldAllotQty = parseFloat($("#gold_allot_qty").val()) || 0;
                if (goldMaxQty > goldAllotQty) {
                    showToast("Gold Max Qty (" + goldMaxQty + " gms) cannot exceed Gold Max Allotted Qty (" + goldAllotQty + " gms).", 'danger');
                    return;
                }
            }
            if ($("#has_smaxqty").is(":checked") && $("#has_sallot_qty").is(":checked")) {
                var silverMaxQty = parseFloat($("#silver_max_qty").val()) || 0;
                var silverAllotQty = parseFloat($("#silver_allot_qty").val()) || 0;
                if (silverMaxQty > silverAllotQty) {
                    showToast("Silver Max Qty (" + silverMaxQty + " gms) cannot exceed Silver Max Allotted Qty (" + silverAllotQty + " gms).", 'danger');
                    return;
                }
            }

            btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
            $("#ajax_loader").addClass("show");

            $.ajax({
                url: form.attr("action"),
                type: "POST",
                data: form.serialize(),
                dataType: "json",
                success: function(response) {
                    $("#ajax_loader").removeClass("show");
                    if (response.status === "success") {
                        showToast(response.message || "Settings saved successfully.", 'success');
                        setTimeout(function() {
                            window.location.href = SITE_URL + "/C_main/load_mainpage";
                        }, 1000);
                    } else {
                        btn.prop("disabled", false).text(btnText);
                        showToast(response.message || "Failed to save. Please try again.", 'danger');
                    }
                },
                error: function() {
                    $("#ajax_loader").removeClass("show");
                    btn.prop("disabled", false).text(btnText);
                    showToast("Server error occurred. Please try again.", 'danger');
                }
            });
        });
    });

    function onOffMaxQtys() {
        if ($("#maxqty_on").is(":checked")) {
            $("#maxQtys").css("display", "block");
        } else {
            $("#maxQtys").css("display", "none");
        }
    }

    function onOffMinQtys() {
        if ($("#minqty_on").is(":checked")) {
            $("#minQtys").css("display", "block");
        } else {
            $("#minQtys").css("display", "none");
        }
    }

    function enableTimeForLimitCancellation() {
        if ($("#limit_cancellation_auto").is(":checked")) {
            $(".timeAndDays").css("display", "block");
        } else {
            $(".timeAndDays").css("display", "none");
        }
    }

    function enableTimeForAutoTradeON() {
        if ($("#trade_on_auto").is(":checked")) {
            $(".AutoTradeONTime").css("display", "block");
        } else {
            $(".AutoTradeONTime").css("display", "none");
        }
    }

    function enableTimeForAutoTradeOFF() {
        if ($("#trade_off_auto").is(":checked")) {
            $(".AutoTradeOFFTime").css("display", "block");
        } else {
            $(".AutoTradeOFFTime").css("display", "none");
        }
    }


    function enableTimeForAutoMarketON() {
        if ($("#market_on_auto").is(":checked")) {
            $(".AutoMarketONTime").css("display", "block");
        } else {
            $(".AutoMarketONTime").css("display", "none");
        }
    }

    function enableTimeForAutoMarketOFF() {
        if ($("#market_off_auto").is(":checked")) {
            $(".AutoMarketOFFTime").css("display", "block");
        } else {
            $(".AutoMarketOFFTime").css("display", "none");
        }
    }

    // BZ-40: Toggle trade history days field disabled based on checkbox
    function toggleTradeHistoryField() {
        var isChecked = $('#expire_history').is(':checked');
        $('#days_expire').prop('disabled', !isChecked);
        if (!isChecked) {
            $('#days_expire').val('');
        }
    }

    function change_qtystatus() {
        $("#gold_min_qty").prop("readonly", !$("#has_gminqty").is(":checked"));
        $("#silver_min_qty").prop("readonly", !$("#has_sminqty").is(":checked"));
        $("#gold_max_qty").prop("readonly", !$("#has_gmaxqty").is(":checked"));
        $("#silver_max_qty").prop("readonly", !$("#has_smaxqty").is(":checked"));
        $("#gold_allot_qty").prop("readonly", !$("#has_gallot_qty").is(":checked"));
        $("#silver_allot_qty").prop("readonly", !$("#has_sallot_qty").is(":checked"));
    }
</script>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-12 grid-margin">
                <div class="card">
                    <div class="card-body">

                        <?php
                        $attributes = array('class' => 'form-horizontal', 'id' => 'general_settings');
                        // Opening form
                        echo form_open('C_admin_rpanel/DB_Controller/Adminrpanel_model/edit/2', $attributes);

                        // Safely parse tolerance pieces if posted, else keep existing values below
                        $gold_tol  = isset($_POST['fv']['gold_tol']) ? explode('#', $_POST['fv']['gold_tol']) : [];
                        $silver_tol = isset($_POST['fv']['silver_tol']) ? explode('#', $_POST['fv']['silver_tol']) : [];

                        $cur_userid = $this->login_model->get_userid();
                        $display = ($cur_userid != 3) ? "style='display:none'" : "";

                        ?>

                        <!-- <p class="card-description card-description1">General Settings</p> -->
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> General Settings </h4>
                        <?php $is_readonly = ($userrights["edit"] != 1 && $userrights["add"] != 1); ?>
                        <fieldset <?php if ($is_readonly) echo 'disabled'; ?>>
                        <!-- Company + Mail (BZ-99: visible to all admin users) -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <?php
                                render_text_input('Company Name', 'fv[admin_company_name]', $admin_company_name ?? '', true, 50, 'Enter company name.', 'text', ['onkeydown' => 'validateKeyPress(event, this,4)', 'data-validate' => 'no-repeats']);
                                ?>
                            </div>
                            <div class="col-md-6">
                                <?php
                                render_text_input('Mail Server Name', 'fv[admin_mail_server]', $admin_mail_server ?? '', false, 100, 'Enter your mailserver name (no spaces).', 'text', ['onkeydown' => 'validateKeyPress(event, this,11)', 'data-validate' => 'no-consecutive-dots', 'pattern' => '[^\s]+', 'title' => 'No spaces allowed']);
                                ?>
                            </div>
                        </div>

                        <!-- Mail/SMS Credentials (BZ-99: visible to all admin users) -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <?php
                                render_text_input('Mail Server Password', 'fv[admin_mail_password]', $admin_mail_password ?? '', true, 50, 'Enter mail password. (min 6 chars, no spaces)', 'password', ['minlength' => '6', 'pattern' => '\S{6,}', 'title' => 'Minimum 6 characters, no spaces allowed']);
                                ?>
                            </div>
                            <div class="col-md-6">
                                <?php
                                render_text_input('SMS User Name', 'fv[admin_sms_username]', $admin_sms_username ?? '', false, 50, 'Enter SMS username. (min 3 chars, no spaces)', 'text', ['onkeydown' => 'validateKeyPress(event, this,12)', 'minlength' => '3', 'pattern' => '[^\s]+', 'title' => 'Minimum 3 characters, no spaces allowed']);
                                ?>
                            </div>
                        </div>

                        <div class="row form-sample1"><!-- BZ-99: SMS credentials visible to all -->
                            <div class="col-md-6">
                                <?php
                                render_text_input('SMS Password', 'fv[admin_sms_password]', $admin_sms_password ?? '', true, 50, 'Enter SMS password. (min 6 chars, no spaces)', 'password', ['minlength' => '6', 'pattern' => '\S{6,}', 'title' => 'Minimum 6 characters, no spaces allowed']);
                                ?>
                            </div>
                            <div class="col-md-6">
                                <?php
                                render_text_input('SMS Auth Key', 'fv[admin_sms_authkey]', $admin_sms_authkey ?? '', false, 100, 'Enter SMS auth key.', 'text', ['onkeydown' => 'validateKeyPress(event, this,6)']);
                                ?>
                            </div>
                        </div>

                        <!-- Hidden Hedge Contracts -->
                        <div class="row form-sample1" style="display: none;">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Gold Hedge Contract</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[gold_hedgecontract]" id="gold_hedgecontract" class="form-control" value="<?php echo set_value('gold_hedgecontract', $gold_hedgecontract); ?>" required onkeydown="validateKeyPress(event, this,4)" maxlength="30" />
                                            <span class="help-block">Enter Gold Contract name for Hedge .</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Silver Hedge Contract</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[silver_hedgecontract]" id="silver_hedgecontract" class="form-control" value="<?php echo set_value('silver_hedgecontract', $silver_hedgecontract); ?>" placeholder="" onkeydown="validateKeyPress(event, this,4)" maxlength="30" />
                                            <span class="help-block">Enter Silver Contract name for Hedge.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Hidden Hedge Min Lot -->
                        <div class="row form-sample1" style="display: none;">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Gold Hedge Min Lot</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[gold_hedge_lot_qty]" id="gold_hedge_lot_qty" class="form-control" value="<?php echo set_value('gold_hedge_lot_qty', $gold_hedge_lot_qty); ?>" required onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter Gold Hedge Lot in Grams.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Silver Hedge Min Lot</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[silver_hedge_lot_qty]" id="silver_hedge_lot_qty" class="form-control" value="<?php echo set_value('silver_hedge_lot_qty', $silver_hedge_lot_qty); ?>" placeholder="" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter Silver Hedge Lot in Grams.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Hidden Enable Hedge -->
                        <div class="row form-sample1" style="display: none;">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Enable Hedge</label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[is_hedge]',
                                            [
                                                1 => ['label' => 'Yes', 'id' => 'is_hedge'],
                                                0 => ['label' => 'No', 'id' => 'is_hedge']
                                            ],
                                            $is_hedge,
                                            'To enable/disable hedge.'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label"></label>
                                    <div class="col-sm-7">
                                        <div class="form-group row"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Display Toggles -->
                        <div <?php echo $display ?> class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Display Silver Rate</label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[admin_is_silver]',
                                            [
                                                1 => ['label' => 'Yes', 'id' => 'admin_is_silver_yes'],
                                                0 => ['label' => 'No', 'id' => 'admin_is_silver_no']
                                            ],
                                            $admin_is_silver,
                                            'To enable/disable silver rates.'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Display Coin Rate</label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[admin_is_coin]',
                                            [
                                                1 => ['label' => 'Yes', 'id' => 'admin_is_coin'],
                                                0 => ['label' => 'No', 'id' => 'admin_is_coin']
                                            ],
                                            $admin_is_coin,
                                            'To enable/disable coin rates.'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php if ($lite_trade == 1) { ?>
                            <div <?php echo $display ?> class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Login Page</label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[admin_booking]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'admin_booking'],
                                                    0 => ['label' => 'No', 'id' => 'com_group_active']
                                                ],
                                                $admin_booking,
                                                'To enable/disable user login page.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Is Trade</label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[lite_trade]',
                                            [
                                                1 => ['label' => 'Yes', 'id' => 'lite_trade'],
                                                0 => ['label' => 'No', 'id' => 'lite_trade']
                                            ],
                                            $lite_trade,
                                            'To enable/disable Trade option.'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                                <div class="col-md-6" style="display: none;">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Is Online buy/sell <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[is_trade]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'confirmation_yes'],
                                                    0 => ['label' => 'No', 'id' => 'confirmation_no']
                                                ],
                                                $is_trade,
                                                'Choose to enable/disable online buy sell.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php } ?>

                        <!-- Auto (Customer/Admin) -->
                        <?php if ($lite_trade == 1) { ?>
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Auto (Customer) <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[confirmation_for]',
                                                [
                                                    2 => ['label' => 'Hold', 'id' => 'confirmation_hold'],
                                                    1 => ['label' => 'Confirmation', 'id' => 'confirmation_book']
                                                ],
                                                $confirmation_for,
                                                'To enable confirmation or hold for customer booking.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Auto (Admin) <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[confirmation_admin]',
                                                [
                                                    2 => ['label' => 'Hold', 'id' => 'conf_admin_hold'],
                                                    1 => ['label' => 'Confirmation', 'id' => 'conf_admin_book']
                                                ],
                                                $confirmation_admin,
                                                'To enable confirmation or hold for phonebooking.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Min Qty / Book -->

                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Gold Min Qty / Book</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_gminqty',
                                                'gold_min_qty',
                                                $has_gminqty ?? 0,
                                                $gold_min_qty ?? '',
                                                'Enter minimum qty per booking for gold (in grams).',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Silver Min Qty / Book</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_sminqty',
                                                'silver_min_qty',
                                                $has_sminqty ?? 0,
                                                $silver_min_qty ?? '',
                                                'Enter minimum qty per booking for silver commodities (in gms)',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Max Qty / Book -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Gold Max Qty / Book</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_gmaxqty',
                                                'gold_max_qty',
                                                $has_gmaxqty ?? 0,
                                                $gold_max_qty ?? '',
                                                'Enter maximum qty per booking for gold commodities (in gms)',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Silver Max Qty / Book</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_smaxqty',
                                                'silver_max_qty',
                                                $has_smaxqty ?? 0,
                                                $silver_max_qty ?? '',
                                                'Enter maximum qty per booking for silver commodities (in gms)',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Max Allotted Qty -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Gold Max Alloted Qty</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_gallot_qty',
                                                'gold_allot_qty',
                                                $has_gallot_qty ?? 0,
                                                $gold_allot_qty ?? '',
                                                'Enter maximum allotted qty for gold commodities (in gms)',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Silver Max Alloted Qty</label>
                                        <div class="col-sm-7">
                                            <?php render_checkbox_input(
                                                'has_sallot_qty',
                                                'silver_allot_qty',
                                                $has_sallot_qty ?? 0,
                                                $silver_allot_qty ?? '',
                                                'Enter maximum allotted qty for silver commodities (in gms)',
                                                2,
                                                9,
                                                3
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <!-- Max allowed limits & Purchase purity (hidden UI) -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Max. allowed limit orders</label>
                                        <div class="col-sm-7">
                                            <input required type="text" name="fv[max_order]" id="max_order" class="form-control" value="<?php echo isset($max_order) ? $max_order : ''; ?>" maxlength="2" onkeydown="validateKeyPress(event, this,1)" />
                                            <span class="help-block">Enter maximum allowed limit orders for each user.</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label" style="display:none">Purchase purity</label>
                                        <div class="col-sm-7" style="display:none">
                                            <div class="btn-group" data-toggle="buttons">
                                                <select id="purchase_purity" name="fv[purchase_purity]" class="form-control">
                                                    <option value="-1" <?php if ($purchase_purity == -1) { ?> selected="selected" <?php } ?>>-Select-</option>
                                                    <option value="0" <?php if ($purchase_purity == 0) { ?> selected="selected" <?php } ?>> 995 </option>
                                                    <option value="1" <?php if ($purchase_purity == 1) { ?> selected="selected" <?php } ?>> 999 </option>
                                                </select>
                                            </div>
                                            <span class="help-block">Select purity for purchase.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <?php } ?>

                        <!-- Mjdta Diff -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">MJDTA Gold Difference</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[mjdta_gold_diff]" id="mjdta_gold_diff" class="form-control" value="<?php echo isset($mjdta_gold_diff) ? $mjdta_gold_diff : ''; ?>" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                        </div>
                                        <span class="help-block">Enter MJDTA Gold Difference</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">MJDTA Silver Difference</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[mjdta_silver_diff]" id="mjdta_silver_diff" class="form-control" value="<?php echo isset($mjdta_silver_diff) ? $mjdta_silver_diff : ''; ?>" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                        </div>
                                        <span class="help-block">Enter MJDTA Silver Difference</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Mjdta Diff -->

                        <?php if ($lite_trade == 1) { ?>

                            <!-- Limit Cancellation -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Limit Cancellation <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[limit_cancellation]',
                                                [
                                                    0 => ['label' => 'Manual', 'id' => 'limit_cancellation_manual'],
                                                    1 => ['label' => 'Auto', 'id' => 'limit_cancellation_auto']
                                                ],
                                                $limit_cancellation,
                                                'Choose manual or auto cancellation of limits'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label timeAndDays">Time</label>
                                        <div class="col-sm-7 timeAndDays">
                                            <div class="bootstrap-timepicker">
                                                <input id="limitcancel_time" name="fv[limitcancel_time]" type="text" class="input-small form-control" readonly value="<?php echo $limitcancel_time ?>" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <!-- Trade On -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Trade On <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[trade_on]',
                                                [
                                                    0 => ['label' => 'Manual', 'id' => 'trade_on_manual'],
                                                    1 => ['label' => 'Auto', 'id' => 'trade_on_auto']
                                                ],
                                                $trade_on,
                                                'Choose Manual or Auto trade ON',
                                                '(weekends off by default)'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label AutoTradeONTime">Time</label>
                                        <div class="col-sm-7 AutoTradeONTime">
                                            <div class="bootstrap-timepicker">
                                                <input id="trade_on_time" name="fv[trade_on_time]" type="text" class="input-small form-control" readonly value="<?php echo $trade_on_time ?>" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Trade Off -->
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Trade Off <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[trade_off]',
                                                [
                                                    0 => ['label' => 'Manual', 'id' => 'trade_off_manual'],
                                                    1 => ['label' => 'Auto', 'id' => 'trade_off_auto']
                                                ],
                                                $trade_off,
                                                'Choose Manual trade OFF or Auto trade OFF',
                                                '(On saturdays and sundays trade will be off by default)'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label AutoTradeOFFTime">Time</label>
                                        <div class="col-sm-7 AutoTradeOFFTime">
                                            <div class="bootstrap-timepicker">
                                                <input id="trade_off_time" name="fv[trade_off_time]" type="text" class="input-small form-control" readonly value="<?php echo $trade_off_time ?>" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <?php } ?>

                        <!-- Market On -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Market On <span class="hint">*</span></label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[market_on]',
                                            [
                                                0 => ['label' => 'Manual', 'id' => 'market_on_manual'],
                                                1 => ['label' => 'Auto', 'id' => 'market_on_auto']
                                            ],
                                            $market_on,
                                            'Choose Manual market ON or Auto market ON',
                                            '(On saturdays and sundays market will be off by default)'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label AutoMarketONTime">Time</label>
                                    <div class="col-sm-7 AutoMarketONTime">
                                        <div class="bootstrap-timepicker">
                                            <input id="market_on_time" name="fv[market_on_time]" type="text" class="input-small form-control" readonly value="<?php echo $market_on_time ?>" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Market Off -->

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Market Off <span class="hint">*</span></label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[market_off]',
                                            [
                                                0 => ['label' => 'Manual', 'id' => 'market_off_manual'],
                                                1 => ['label' => 'Auto', 'id' => 'market_off_auto']
                                            ],
                                            $market_off,
                                            'Choose Manual market OFF or Auto market OFF',
                                            '(On saturdays and sundays market will be off by default)'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label AutoMarketOFFTime">Time</label>
                                    <div class="col-sm-7 AutoMarketOFFTime">
                                        <div class="bootstrap-timepicker">
                                            <input id="market_off_time" name="fv[market_off_time]" type="text" class="input-small form-control" readonly value="<?php echo $market_off_time ?>" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Margin Settings -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Enable Margin <span class="hint">*</span></label>
                                    <div class="col-sm-7">
                                        <?php render_radio_group(
                                            'fv[display_margin]',
                                            [
                                                1 => ['label' => 'Yes', 'id' => 'display_margin_yes'],
                                                0 => ['label' => 'No', 'id' => 'display_margin_no']
                                            ],
                                            $display_margin,
                                            'Margin can be enabled or disabled here'
                                        ); ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Margin squareoff <span class="hint">*</span></label>
                                    <div class="col-sm-7">
                                        <div class="col-sm-7 form-group row">
                                            <?php render_radio_group(
                                                'fv[margin_reverse_type]',
                                                [
                                                    0 => ['label' => 'Yes', 'id' => 'margin_reverse_type_yes'],
                                                    1 => ['label' => 'No', 'id' => 'margin_reverse_type_no']
                                                ],
                                                $margin_reverse_type
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Trade history + Auto refresh -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Display trade history to users (exp. in days)</label>
                                    <div class="col-sm-7">
                                        <input type="checkbox" id="expire_history" name="fv[expire_history]" <?php if (isset($expire_history) && $expire_history == 1) { ?> checked="checked" <?php } ?> />
                                        <input type="text" name="fv[days_expire]" id="days_expire" class="form-control" value="<?php echo isset($days_expire) ? $days_expire : ''; ?>" style="display:inline; width:90%" onkeydown="validateKeyPress(event, this,1)" maxlength="2" />
                                        <span class="help-block">Enter no of days</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Auto Refresh</label>
                                    <div class="col-sm-7">
                                        <input required type="text" name="fv[auto_refresh]" id="auto_refresh" class="form-control" value="<?php echo isset($auto_refresh) ? $auto_refresh : ''; ?>" maxlength="3" onkeydown="validateKeyPress(event, this,1)" />
                                        <span class="help-block">Enter value in minutes (e.g., 1 for 1 minute).</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Display Limit order Page + Client Limit -->
                        <?php if ($lite_trade == 1) { ?>
                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Display Limit order Page <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[limit_enable]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'limit_enable_yes'],
                                                    0 => ['label' => 'No', 'id' => 'limit_enable_no']
                                                ],
                                                $limit_enable,
                                                'Limit order page can be enabled or disabled here'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Display Client Limit <span class="hint">*</span></label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[clientlimit_enable]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'clientlimit_enable_yes'],
                                                    0 => ['label' => 'No', 'id' => 'clientlimit_enable_no']
                                                ],
                                                $clientlimit_enable,
                                                'Client Limit can be enabled or disabled here'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <?php } ?>

                        <!-- TCS/TDS Hint + Stock Manage -->
                        <div class="row form-sample1">
                            <div class="col-md-12">
                                <div class="form-group row">
                                    <label class="col-sm-2 col-form-label">TCS/TDS Hint</label>
                                    <div class="col-sm-8">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="fv[admin_tcstdshint]" id="admin_tcstdshint" class="form-control" value="<?php echo isset($admin_tcstdshint) ? $admin_tcstdshint : ''; ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="200">
                                            <span class="help-block">Enter TCS / TDS Hint</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <!-- <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Stock Manage</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" name="fv[admin_stockmanage]" id="admin_stockmanage" class="form-control" value="<?php echo isset($admin_stockmanage) ? $admin_stockmanage : ''; ?>" onkeydown="validateKeyPress(event, this,2)" />
                                            <span class="help-block">Enter Stock Manage</span>
                                        </div>
                                    </div>
                                </div> -->
                                <?php
                                render_text_input('Stock Manage', 'fv[admin_stockmanage]', $admin_stockmanage ?? '', true, 50, 'Enter Stock Manage.', 'text', ['onkeydown' => 'validateKeyPress(event, this,2,10,3)']);
                                ?>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row"></div>
                            </div>
                        </div>

                        <!-- Booking Alert -->
                        <p class="card-description card-description1">Booking Alert</p>
                        <!-- Admin mobile number's For Notifications -->
                        <div class="row form-sample1">
                            <?php
                            renderMobileInput(1, $is_admin_mob1 ?? 0, $admin_mob1 ?? '', $countries_mob1  ?? $fv['countries_mob1 '], true);  // mobile 1
                            renderMobileInput(2, $is_admin_mob2 ?? 0, $admin_mob2 ?? '', $countries_mob2  ?? $fv['countries_mob2 '], true);   // mobile 2
                            ?>
                        </div>

                        <div class="row form-sample1">
                            <?php
                            renderMobileInput(3, $is_admin_mob3 ?? 0, $admin_mob3 ?? '', $countries_mob3  ?? $fv['countries_mob3 '], true);  // mobile 3
                            renderMobileInput(4, $is_admin_mob4 ?? 0, $admin_mob4 ?? '', $countries_mob4  ?? $fv['countries_mob4 '], true);  // mobile 4
                            ?>
                        </div>

                        <div class="row form-sample1">
                            <?php
                            renderMobileInput(5, $is_admin_mob5 ?? 0, $admin_mob5 ?? '', $countries_mob5  ?? $fv['countries_mob5 '], true);  // mobile 5
                            ?>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Enquiry mail to</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="email" class="form-control" style="display:inline;" id="admin_mail" name="fv[admin_mail]" value="<?php echo isset($admin_mail) ? $admin_mail : ''; ?>" maxlength="100" onkeydown="validateKeyPress(event, this,11)" data-validate="email no-consecutive-dots"/>
                                            <span class="help-block">Enquiry mail To</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php includeMobileInputScripts(); ?>

                        <!-- Opening (hidden) -->
                        <div class="row form-sample1" style="display:none">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Opening Qty, Rate</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label"></label>
                                    <div class="col-sm-7">
                                        <div class="form-group row"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1" style="display:none">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Date</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" class="form-control" id="opening_date" name="fv[opening_date]" value="<?php echo isset($opening_date) ? $opening_date : ''; ?>" readonly />
                                            <span class="help-block">Opening date entry</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label"></label>
                                    <div class="col-sm-7">
                                        <div class="form-group row"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1" style="display:none">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Qty(Gold in KG)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" class="form-control" id="gold_open_qty" name="fv[gold_open_qty]" value="<?php echo isset($gold_open_qty) ? $gold_open_qty : ''; ?>" onkeydown="validateKeyPress(event, this,2,10,3)" maxlength="10"/>
                                            <span class="help-block">Gold opening qty in KG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Rate(Gold,1 Gram)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" class="form-control" id="gold_open_rate" name="fv[gold_open_rate]" value="<?php echo isset($gold_open_rate) ? $gold_open_rate : ''; ?>" onkeydown="validateKeyPress(event, this,2,10,2)" maxlength="10"/>
                                            <span class="help-block">Gold Opening Rate in 1 Gram</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1" style="display:none">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Qty(Silver in KG)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" class="form-control" id="silver_open_qty" name="fv[silver_open_qty]" value="<?php echo isset($silver_open_qty) ? $silver_open_qty : ''; ?>" onkeydown="validateKeyPress(event, this,2,10,3)" maxlength="10"/>
                                            <span class="help-block">Silver Opening Qty in KG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Rate(Silver,1 KG)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" class="form-control" style="display:inline; width:90%" id="silver_open_rate" name="fv[silver_open_rate]" value="<?php echo isset($silver_open_rate) ? $silver_open_rate : ''; ?>" onkeydown="validateKeyPress(event, this,2,10,2)" maxlength="10"/>
                                            <span class="help-block">Silver Opening Rate in 1 Gram</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tolerance -->
                        <p class="card-description card-description1">Tolerance(in %)</p>
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">High(Gold)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="tol_gold_high" id="tol_gold_high" class="form-control" value="<?php echo isset($gold_tol[0]) ? $gold_tol[0] : ''; ?>" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter maximum order value for gold(in %)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Low(Gold)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="tol_gold_low" id="tol_gold_low" class="form-control" value="<?php echo isset($gold_tol[1]) ? $gold_tol[1] : ''; ?>" placeholder="" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter minimum order value for gold(in %)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">High(Silver)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="tol_silver_high" id="tol_silver_high" class="form-control" value="<?php echo isset($silver_tol[0]) ? $silver_tol[0] : '';  ?>" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter maximum order value for silver(in %)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Low(Silver)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="tol_silver_low" id="tol_silver_low" class="form-control" value="<?php echo isset($silver_tol[1]) ? $silver_tol[1] : ''; ?>" placeholder="" onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                            <span class="help-block">Enter minimum order value for silver(in %)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order cancellation tolerance -->
                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Order cancellation limit(Gold in rs)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="fv[limitcancel_goldtol]" id="limitcancel_goldtol" class="form-control" value="<?php echo isset($limitcancel_goldtol) ? $limitcancel_goldtol : '';  ?>" onkeydown="validateKeyPress(event, this,2)" maxlength="5" />
                                            <span class="help-block">Enter value for gold(in rs)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Order cancellation limit(Silver in rs)</label>
                                    <div class="col-sm-7">
                                        <div class="form-group row">
                                            <input type="text" step="any" name="fv[limitcancel_silvertol]" id="limitcancel_silvertol" class="form-control" value="<?php echo isset($limitcancel_silvertol) ? $limitcancel_silvertol : ''; ?>" placeholder="" onkeydown="validateKeyPress(event, this,2)" maxlength="5" />
                                            <span class="help-block">Enter value for silver(in rs)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <!-- Hedging Details -->
                        <?php if ($lite_trade == 1) { ?>
                            <p class="card-description card-description1" style="margin-top: 10px;">Hedging Details</p>
                            <div <?php echo $display ?> class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Enable Gold Hedge</label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[is_hedge_gold]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'is_hedge_gold'],
                                                    0 => ['label' => 'No', 'id' => 'is_hedge_gold']
                                                ],
                                                $is_hedge_gold,
                                                'To enable/disable Gold Hedge.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Enable Silver Hedge</label>
                                        <div class="col-sm-7">
                                            <?php render_radio_group(
                                                'fv[is_hedge_silver]',
                                                [
                                                    1 => ['label' => 'Yes', 'id' => 'is_hedge_silver'],
                                                    0 => ['label' => 'No', 'id' => 'is_hedge_silver']
                                                ],
                                                $is_hedge_silver,
                                                'To enable/disable Silver Hedge.'
                                            ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Gold Hedge Min Lot</label>
                                        <div class="col-sm-7">
                                            <div class="form-group row">
                                                <input type="text" name="fv[gold_hedge_lot_qty]" id="gold_hedge_lot_qty" class="form-control" value="<?php echo set_value('gold_hedge_lot_qty', $gold_hedge_lot_qty); ?>" required onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                                <span class="help-block">Enter Gold Hedge Lot in Grams.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Silver Hedge Min Lot</label>
                                        <div class="col-sm-7">
                                            <div class="form-group row">
                                                <input type="text" name="fv[silver_hedge_lot_qty]" id="silver_hedge_lot_qty" class="form-control" value="<?php echo set_value('silver_hedge_lot_qty', $silver_hedge_lot_qty); ?>" placeholder="" required onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                                <span class="help-block">Enter Silver Hedge Lot in Grams.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row form-sample1">
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Gold Hedge Adjusted Qty</label>
                                        <div class="col-sm-7">
                                            <div class="form-group row">
                                                <input type="text" name="fv[gold_booking_adjusted_qty]" id="gold_booking_adjusted_qty" class="form-control" value="<?php echo set_value('gold_booking_adjusted_qty', $gold_booking_adjusted_qty); ?>" required onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                                <span class="help-block">
                                                    Enter Gold Hedge Lot in grams.<br>
                                                    Ex: 53g → 50g, 57g → 60g (rounded to nearest 10g)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group row">
                                        <label class="col-sm-4 col-form-label">Silver Hedge Adjusted Qty</label>
                                        <div class="col-sm-7">
                                            <div class="form-group row">
                                                <input type="text" name="fv[silver_booking_adjusted_qty]" id="silver_booking_adjusted_qty" class="form-control" value="<?php echo set_value('silver_booking_adjusted_qty', $silver_booking_adjusted_qty); ?>" placeholder="" required onkeydown="validateKeyPress(event, this,2,9,3)" maxlength="9" />
                                                <span class="help-block">
                                                    Enter Silver Hedge Lot in grams.<br>
                                                    Ex: 53g → 50g, 57g → 60g (rounded to nearest 10g)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php } ?>

                        </fieldset><!-- BZ-46: End disabled fieldset -->
                        <!-- Save / Cancel -->
                        <div class="row form-sample1">
                            <div class="col-md-3"></div>
                            <div class="col-md-6">
                                <?php if ($userrights["edit"] == 1) { ?>
                                    <button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="return validateGeneralForm(event)">Save</button>
                                <?php } else if ($userrights["add"] == 1) { ?>
                                    <button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="return validateGeneralForm(event)">Save</button>
                                <?php } ?>
                                <button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
                                <p align="right" id="msgPendingOrder" style="font-style:italic; color: #FF0000; display:none">* Note : All pending orders will be cleared</p>
                            </div>
                            <div class="col-md-6"></div>
                        </div>

                        <?php echo form_close(); ?>

                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php $this->load->view("include/footer"); ?>


<script>
    function validateGeneralForm(e) {
        // 1. Common Validation: Handled by data-validate="no-consecutive-dots" in General.js

        // 2. Email Validation: Handled by data-validate="email" in General.js

        // 2. Validate Gold Min/Max Qty
        const goldMinQtyEnabled = $('#has_gminqty').is(':checked');
        const goldMaxQtyEnabled = $('#has_gmaxqty').is(':checked');

        if (goldMinQtyEnabled && goldMaxQtyEnabled) {
            const goldMinQty = parseFloat($('#gold_min_qty').val()) || 0;
            const goldMaxQty = parseFloat($('#gold_max_qty').val()) || 0;

            if (goldMinQty < 1) {
                showToast('Gold Min Qty / Book must be at least 1', 'error');
                $('#gold_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }

            if (goldMaxQty < 1) {
                showToast('Gold Max Qty / Book must be at least 1', 'error');
                $('#gold_max_qty').focus();
                if (e) e.preventDefault();
                return false;
            }

            if (goldMinQty >= goldMaxQty) {
                showToast('Gold Min Qty / Book must be less than Gold Max Qty / Book', 'error');
                $('#gold_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }
        // Validate individual checks if only one is enabled
        if (goldMinQtyEnabled) {
             const goldMinQty = parseFloat($('#gold_min_qty').val()) || 0;
             if (goldMinQty < 1) {
                showToast('Gold Min Qty / Book must be at least 1', 'error');
                $('#gold_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }
        if (goldMaxQtyEnabled) {
             const goldMaxQty = parseFloat($('#gold_max_qty').val()) || 0;
             if (goldMaxQty < 1) {
                showToast('Gold Max Qty / Book must be at least 1', 'error');
                $('#gold_max_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }


        // 3. Validate Silver Min/Max Qty
        const silverMinQtyEnabled = $('#has_sminqty').is(':checked');
        const silverMaxQtyEnabled = $('#has_smaxqty').is(':checked');

        if (silverMinQtyEnabled && silverMaxQtyEnabled) {
            const silverMinQty = parseFloat($('#silver_min_qty').val()) || 0;
            const silverMaxQty = parseFloat($('#silver_max_qty').val()) || 0;

            if (silverMinQty < 1) {
                showToast('Silver Min Qty / Book must be at least 1', 'error');
                $('#silver_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }

            if (silverMaxQty < 1) {
                showToast('Silver Max Qty / Book must be at least 1', 'error');
                $('#silver_max_qty').focus();
                if (e) e.preventDefault();
                return false;
            }

            if (silverMinQty >= silverMaxQty) {
                showToast('Silver Min Qty / Book must be less than Silver Max Qty / Book', 'error');
                $('#silver_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }
        // Validate individual checks
        if (silverMinQtyEnabled) {
             const silverMinQty = parseFloat($('#silver_min_qty').val()) || 0;
             if (silverMinQty < 1) {
                showToast('Silver Min Qty / Book must be at least 1', 'error');
                $('#silver_min_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }
        if (silverMaxQtyEnabled) {
             const silverMaxQty = parseFloat($('#silver_max_qty').val()) || 0;
             if (silverMaxQty < 1) {
                showToast('Silver Max Qty / Book must be at least 1', 'error');
                $('#silver_max_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }

        // 4. Validate Gold Max Alloted Qty
        const goldAllotQtyEnabled = $('#has_gallot_qty').is(':checked');

        if (goldAllotQtyEnabled) {
            const goldAllotQty = parseFloat($('#gold_allot_qty').val()) || 0;

            if (goldAllotQty < 1) {
                showToast('Gold Max Alloted Qty must be at least 1', 'error');
                $('#gold_allot_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }

        // 5. Validate Silver Max Alloted Qty
        const silverAllotQtyEnabled = $('#has_sallot_qty').is(':checked');

        if (silverAllotQtyEnabled) {
            const silverAllotQty = parseFloat($('#silver_allot_qty').val()) || 0;

            if (silverAllotQty < 1) {
                showToast('Silver Max Alloted Qty must be at least 1', 'error');
                $('#silver_allot_qty').focus();
                if (e) e.preventDefault();
                return false;
            }
        }

        return true;
    }

    // Toggle Readonly status based on checkbox
    function change_qtystatus() {
        if ($("#has_gminqty").is(":checked")) {
            $("#gold_min_qty").prop("readonly", false);
        } else {
            $("#gold_min_qty").prop("readonly", true);
        }

        if ($("#has_sminqty").is(":checked")) {
            $("#silver_min_qty").prop("readonly", false);
        } else {
            $("#silver_min_qty").prop("readonly", true);
        }

        if ($("#has_gmaxqty").is(":checked")) {
            $("#gold_max_qty").prop("readonly", false);
        } else {
            $("#gold_max_qty").prop("readonly", true);
        }

        if ($("#has_smaxqty").is(":checked")) {
            $("#silver_max_qty").prop("readonly", false);
        } else {
            $("#silver_max_qty").prop("readonly", true);
        }

        if ($("#has_gallot_qty").is(":checked")) {
            $("#gold_allot_qty").prop("readonly", false);
        } else {
            $("#gold_allot_qty").prop("readonly", true);
        }

        if ($("#has_sallot_qty").is(":checked")) {
            $("#silver_allot_qty").prop("readonly", false);
        } else {
            $("#silver_allot_qty").prop("readonly", true);
        }
    }

    $(document).ready(function() {
        $('input[type=checkbox][name="fv[has_gminqty]"], input[type=checkbox][name="fv[has_sminqty]"], input[type=checkbox][name="fv[has_gmaxqty]"], input[type=checkbox][name="fv[has_smaxqty]"], input[type=checkbox][name="fv[has_gallot_qty]"], input[type=checkbox][name="fv[has_sallot_qty]"]').change(function() {
            change_qtystatus();
        });
        change_qtystatus();
    });
</script>

<style>
    .help-block {
        font-size: 11px !important;
    }
</style>
