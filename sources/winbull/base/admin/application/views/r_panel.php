<!DOCTYPE html>
<html lang="en">

<head>


    <meta charset="utf-8">
    <title>R Panel</title>
    <?php
    echo link_tag('assets/css/rpanel_style.css');
    ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Winbull Lite, a fully featured">
    <meta name="author" content="Logimax Technologies Bullion.">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/typicons/typicons.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/vendor.bundle.base.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/style.css">
    <!-- The styles -->


    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/fullcalendar/dist/fullcalendar.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/fullcalendar/dist/fullcalendar.print.css' rel='stylesheet' media='print'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/chosen/chosen.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/colorbox/example3/colorbox.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/responsive-tables/responsive-tables.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/bootstrap-tour/build/css/bootstrap-tour.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.theme.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.iphone.toggle.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/uploadify.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/animate.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/customize.css' rel='stylesheet'>
    <!--<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-glyphicons/1.0.0/css/bootstrap-glyphicons.min.css">-->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap-icons.min.css" rel="stylesheet">

    <link rel="stylesheet" href="<?php echo base_url() ?>assets/css/phonebooking/main.css">
    <link rel="stylesheet" href="<?php echo base_url() ?>assets/css/phonebooking/media.css">

    <!-- jQuery -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
    <!-- General.js: validateKeyPress, showToast, validateForm -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/General.js?v=2.0"></script>
    <script src='<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap.min.js'></script>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-datetimepicker.css' rel='stylesheet'>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-datetimepicker.min.js"></script>

    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/socket.io.min.js"></script>
    <!--<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>-->

    <script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>assets/tiny_mce/tiny_mce.js"></script>
    <!-- endinject -->
    <!-- Plugin js for this page-->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/Chart.min.js"></script>
    <!-- End plugin js for this page-->
    <!-- inject:js -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/off-canvas.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/hoverable-collapse.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/template.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/settings.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/todolist.js"></script>
    <!-- endinject -->
    <!-- Custom js for this page-->
    <link rel="stylesheet" href="<?php echo base_url() ?>assets/css/radiobuttons.css">
    <link rel="shortcut icon" href="<?php echo $this->config->item('base_url'); ?>favicon.ico">

    <style type="text/css">
        .dataTables_filter input {
            margin-left: -65px;
        }
    </style>
    <script type="text/javascript">
        var bcsrurl = "<?php echo Globals::$bcsrurl; ?>";
        var rpbcencdata = "<?php echo Globals::$rpbcencdata; ?>";
        var colNames = new Array("ASK($)", "Premium", "Conv", "INR(₹)", "Premium", "Custom", "Tax Type", "Tax", "TCS", "Pure", "1Grm Rate", "1KG Rate");
        var colsubNames = new Array("askdollar", "premium", "bconvert_value", "inr", "rupeepremium", "custom", "btax_type", "btax_value", "tcs_tax", "pure", "grmrate", "kgrate");
        var rpanelbankrates = <?php echo json_encode($rpanelbank); ?>;
        var rpaneldata = <?php echo json_encode($rpaneldata); ?>;
        var rpanelsetting = <?php echo json_encode($rpanelsettings); ?>;
        var rpanelcontract = <?php echo json_encode($rpanel_display_contracts); ?>;
        var rpanelchartcontract = <?php echo json_encode($rpanel_display_chart_contracts); ?>;
        var rpanelcommodities = <?php echo json_encode($rpanel_display_commodities); ?>;
        console.log(rpanelcommodities);
        tinyMCE.init({
            mode: "textareas",
            theme: "advanced"
        });

        function gold_spotrateconversion(con_value) {
            return parseFloat((con_value / 1000) * rpanelsetting.rpsg_weight).toFixed(2);
        }

        function gold_conversion(con_value) {
            return parseFloat((con_value / 10) * rpanelsetting.rpsg_weight).toFixed(2);
        }

        function silver_conversion(con_value) {
            return parseFloat((con_value / 1000) * rpanelsetting.rpss_weight).toFixed(2);
        }

        function manual_roundoff(round_value, type, com_type) {
            var convert_value = 0;
            var round_method = 0;

            if (com_type == 0) round_method = rpanelsetting.rpsg_roundoff;
            else round_method = rpanelsetting.rpss_roundoff;

            if (type == 'ask') {
                if (round_method == 0)
                    convert_value = round_value;
                else
                    convert_value = Math.ceil(round_value / round_method) * round_method;
            } else {
                if (round_method == 0)
                    convert_value = round_value;
                else
                    convert_value = Math.floor(round_value / round_method) * round_method;
            }
            return parseFloat(convert_value).toFixed(2);
        }

        function fnStartClock() {

            try {
                //alert("fnStartClock");
                refreshData();
                oInterval = setInterval(refreshData, 1000);
            } catch (e) {
                //alert("fnStartClock" + e);
            }
        }

        function refreshData() {
            CallWebServiceFromJquery();
        }

        function CallWebServiceFromJquery() {


            try {
                //alert('CallWebServiceFromJquery');
                $.ajax({
                    type: "POST",
                    url: bcsrurl,
                    dataType: "text",
                    data: "{ 'client' : '<?php echo Globals::$bcclient; ?>, 'username' : '<?php echo Globals::$bcusername; ?>', 'password ' : '<?php echo Globals::$bcpassword; ?>' }",
                    crossDomain: true,
                    processData: false,
                    success: OnSuccess,
                    error: OnError,
                    cache: false
                });
            } catch (e) {
                //alert("CallWebServiceFromJquery " + e);
            }

        }

        // function CallWebServiceFromJquery() {
        //     var xhr = new XMLHttpRequest();
        //     xhr.open("GET", rpbcencdata, true);
        //     xhr.responseType = "blob"; // receive binary data

        //     xhr.onload = function () {
        //         if (xhr.status === 200) {
        //             const reader = new FileReader();
        //             reader.onload = function () {
        //                 const text = reader.result;
        // 				OnSuccess(text);
        //             };
        //             reader.readAsText(xhr.response);
        //         } else {
        //             console.error("Failed:", xhr.status);
        //         }
        //     };

        //     xhr.onerror = function () {
        //         console.error("XHR error");
        //     };

        //     xhr.send();
        // }
        function OnSuccess(data, status) {
            try {
                var datetime = getCurrentDateTime();

                var messagesDesktopp = "";
                messagesDesktopp = data.split("\n");
                //alert(messagesDesktopp.length);
                if (typeof oldData != 'undefined') {

                } else {
                    //alert("1");
                    oldData = data.toString();
                }
                var messagesOldDesktop = oldData.split("\n");
                for (var i = 0; i < messagesDesktopp.length; i++) {
                    var retDesktop = messagesDesktopp[i].split("\t");
                    var oldRetDesktop;
                    oldRetDesktop = messagesOldDesktop[i].split("\t");
                    if (typeof retDesktop[1] != 'undefined') {
                        if ($("#" + retDesktop[6] + "_bid").length != 0) {
                            if (retDesktop[0] > $("#" + retDesktop[6] + "_bid").html()) {
                                $("#" + retDesktop[6] + "_bid").css('color', 'green');
                            } else if (retDesktop[0] < $("#" + retDesktop[6] + "_bid").html()) {
                                $("#" + retDesktop[6] + "_bid").css('color', 'red');
                            } else {
                                $("#" + retDesktop[6] + "_bid").css('color', '');
                            }

                            if (retDesktop[1] > $("#" + retDesktop[6] + "_ask").html()) {
                                $("#" + retDesktop[6] + "_ask").css('color', 'green');
                            } else if (retDesktop[1] < $("#" + retDesktop[6] + "_ask").html()) {
                                $("#" + retDesktop[6] + "_ask").css('color', 'red');
                            } else {
                                $("#" + retDesktop[6] + "_ask").css('color', '');
                            }

                            if (retDesktop[2] > $("#" + retDesktop[6] + "_low").html()) {
                                $("#" + retDesktop[6] + "_low").css('color', 'green');
                            } else if (retDesktop[2] < $("#" + retDesktop[6] + "_low").html()) {
                                $("#" + retDesktop[6] + "_low").css('color', 'red');
                            } else {
                                $("#" + retDesktop[6] + "_low").css('color', '');
                            }
                            if (retDesktop[7] > $("#" + retDesktop[6] + "_high").html()) {
                                $("#" + retDesktop[6] + "_high").css('color', 'green');
                            } else if (retDesktop[7] < $("#" + retDesktop[6] + "_high").html()) {
                                $("#" + retDesktop[6] + "_high").css('color', 'red');
                            } else {
                                $("#" + retDesktop[6] + "_high").css('color', '');
                            }
                            if (retDesktop[6] == "SPOT-INR" || retDesktop[6] == "SPOT-GOLD" || retDesktop[6] == "SPOT-SILVER") {
                                $("#" + retDesktop[6] + "_bid").html(parseFloat(retDesktop[0]).toFixed(2));
                                $("#" + retDesktop[6] + "_ask").html(parseFloat(retDesktop[1]).toFixed(2));
                                $("#" + retDesktop[6] + "_low").html(parseFloat(retDesktop[2]).toFixed(2));
                                $("#" + retDesktop[6] + "_high").html(parseFloat(retDesktop[7]).toFixed(2));
                            } else {
                                $("#" + retDesktop[6] + "_bid").html(retDesktop[0]);
                                $("#" + retDesktop[6] + "_ask").html(retDesktop[1]);
                                $("#" + retDesktop[6] + "_low").html(retDesktop[2]);
                                $("#" + retDesktop[6] + "_high").html(retDesktop[7]);
                            }
                        }
                        // console.log(retDesktop);
                    }
                }
            } catch (e) {}
        }

        function getCurrentDateTime() {

            var currentdate = new Date();
            var datetime = currentdate.getDate() + "-" +
                (currentdate.getMonth() + 1) + "-" +
                currentdate.getFullYear() + " @ " +
                currentdate.getHours() + ":";

            if (currentdate.getMinutes() < 10) {
                datetime = datetime + "0" + currentdate.getMinutes() + ":";
            } else {
                datetime = datetime + currentdate.getMinutes() + ":";
            }

            if (currentdate.getSeconds() < 10) {
                datetime = datetime + "0" + currentdate.getSeconds();
            } else {
                datetime = datetime + currentdate.getSeconds();
            }


            return datetime;
        }
        $(document).ready(function() {
            fnStartClock();
        });

        function OnError(request, status, error) {
            //alert("Webservice Error: " + request.statusText + " " + error);
        }
        (function() {
            var socket_url = '<?php echo Globals::$socket_base_url ?>';
            var socket = io(socket_url, {
                path: "/socket.io/",
                transports: ["websocket"], // 🔥 FORCE WEBSOCKET ONLY
                upgrade: false, // 🔥 DO NOT FALL BACK
                reconnection: true,
                reconnectionAttempts: Infinity, // keep retrying forever
                reconnectionDelay: 2000,
                timeout: 20000
            });
            socket.on("<?php echo Globals::$evt_rpanelupdate ?>", function(data) {
                window.location.reload(true);
            });
            //setInterval(function(){ updateIndicator(); }, 5000);
            var callback = function() {
                var currentObj = "";
                var updatetime_val = $("#updatetime").val();
                $("#updated_time").html(rpaneldata.lastupdatetime);

                if (updatetime_val == '') {
                    $("#updatetime").val(rpaneldata.updateon);
                }

                //1-> Market On 0->Market Off
                if (rpaneldata.rate_display == 1) {
                    $("#israteon").attr("checked", true);
                } else {
                    $("#israteoff").attr("checked", true);
                }
                //0->Market Closed 1-> Market opened
                if (rpaneldata.market_status == 1) {
                    $("#marketstatus").attr("checked", true);
                    $('.rpanelcontract').hide();
                    $('#marketClosed').show();
                    $('#orbitClosed').hide();

                } else {
                    $("#marketstatus").removeAttr("checked");
                    $('.rpanelcontract').show();
                    $('#marketClosed').hide();
                    $('#orbitClosed').show();
                }
                if ($(".displaycontract tbody tr").length) {
                    $(".displaycontract tbody tr").each(function() {
                        var $this = $(this);
                        $(this).each(function() {
                            if (($(this).find('td:eq(1) div').html() == null || isNaN($(this).find('td:eq(1) div').html())) && ($(this).find('td:eq(2) div').html() == null || isNaN($(this).find('td:eq(2) div').html()))) {
                                return 0;
                            } else {
                                //console.log($(this).find('td:eq(2) div').html());
                            }
                        });


                    });
                } else {
                    return 0;
                }

                /* Bank Rates Calculation Start Here */
                $.each(rpanelbankrates, function(rbkey, rbval) {
                    var bank_kgrate = 0;
                    for (i = 0; i < 12; i++) {
                        if (i == 0) {
                            var getval = rbval[colsubNames[i]];
                            $("#" + colsubNames[i] + "_" + rbval.bcontract_symbol.replace(' ', '_')).html($("#" + rbval.bcontract_rate + "_ask").html());
                        } else if (i == 3) {
                            var getval = rbval[colsubNames[i]];
                            $("#" + colsubNames[i] + "_" + rbval.bcontract_symbol.replace(' ', '_')).html($("#SPOT-INR_ask").html());
                        }
                        if (i == 1 || i == 4 || i == 5 || i == 7 || i == 8) {
                            var getval = rbval[colsubNames[i]];
                            if (($("input#" + colsubNames[i] + "_" + rbval.bcontract_symbol.replace(' ', '_'))).length) {
                                if (!$('#' + colsubNames[i] + "_" + rbval.bcontract_symbol.replace(' ', '_')).is(':focus')) {
                                    $("input#" + colsubNames[i] + "_" + rbval.bcontract_symbol.replace(' ', '_')).val(getval);
                                }
                            }
                        }
                    }
                    // Step 1: Base INR Price — keep as raw float (no toFixed here, round only at display)
                    bank_kgrate = (isNaN(parseFloat($("#" + rbval.bcontract_rate + "_ask").html())) ? 0 : parseFloat($("#" + rbval.bcontract_rate + "_ask").html()) + parseFloat(rbval.premium) + parseFloat(rbval.askdiff)) * ((isNaN($("#SPOT-INR_ask").html())) ? 0 : parseFloat($("#SPOT-INR_ask").html()) + parseFloat(rbval.rupeepremium));

                    // Step 2: Conversion — keep as raw float
                    if (parseInt(rbval.bconvert_value_type) == 1)
                        bank_kgrate = bank_kgrate + parseFloat(rbval.bconvert_value);
                    else if (parseInt(rbval.bconvert_value_type) == 2)
                        bank_kgrate = bank_kgrate - parseFloat(rbval.bconvert_value);
                    else if (parseInt(rbval.bconvert_value_type) == 3)
                        bank_kgrate = bank_kgrate * parseFloat(rbval.bconvert_value);
                    else if (parseInt(rbval.bconvert_value_type) == 4)
                        bank_kgrate = bank_kgrate / parseFloat(rbval.bconvert_value);

                    // Step 3: Extra Charges — keep as raw float
                    if (parseFloat(rbval.bextra_charges) > 0) {
                        if (parseInt(rbval.bextra_type) == 1) {
                            bank_kgrate = bank_kgrate + parseFloat(rbval.bextra_charges);
                        } else if (parseInt(rbval.bextra_type) == 2) {
                            bank_kgrate = bank_kgrate - parseFloat(rbval.bextra_charges);
                        } else if (parseInt(rbval.bextra_type) == 3) {
                            bank_kgrate = bank_kgrate * parseFloat(rbval.bextra_charges);
                        } else if (parseInt(rbval.bextra_type) == 4) {
                            bank_kgrate = bank_kgrate / parseFloat(rbval.bextra_charges);
                        }
                    }
                    bank_kgrate = parseFloat(bank_kgrate) + parseFloat(rbval.custom);
                    // Step 5: Tax — keep as raw float
                    if (parseFloat(rbval.btax_value) > 0) {
                        if (parseInt(rbval.btax_type) == 1) {
                            bank_kgrate = bank_kgrate * ((100 + parseFloat(rbval.btax_value)) / 100);
                        } else if (parseInt(rbval.btax_type) == 2) {
                            bank_kgrate = bank_kgrate + parseFloat(rbval.btax_value);
                        }
                    }
                    // Step 6: TCS — keep as raw float
                    if (parseFloat(rbval.tcs_tax) > 0) {
                        bank_kgrate = bank_kgrate * ((100 + parseFloat(rbval.tcs_tax)) / 100);
                    }
                    // Step 7: Purity — keep as raw float
                    if (parseInt(rbval.pure) == 1) {
                        bank_kgrate = bank_kgrate / 0.995;
                    }

                    // Step 8: Final display — round ONLY here (fixes decimal precision bug)
                    $("#" + colsubNames[i - 1] + "_" + rbval.bcontract_symbol.replace(' ', '_')).html(parseFloat(bank_kgrate).toFixed(2));
                    $("#" + colsubNames[i - 2] + "_" + rbval.bcontract_symbol.replace(' ', '_')).html(parseFloat((bank_kgrate / 1000)).toFixed(2));
                    if (rbkey == 0) {
                        $("#spot_buy").html(gold_spotrateconversion(parseFloat(bank_kgrate).toFixed(2)));
                        $("#spot_sell").html(gold_spotrateconversion(parseFloat(bank_kgrate).toFixed(2)));

                    }
                    if (rbkey == 1) {
                        $("#silver_spot_sell").html(silver_conversion(parseFloat(bank_kgrate).toFixed(2)));
                    }
                });
                /*Bank Rates Calculation End Here*/
                /* Rpanel Commodity Calculation Start Here */
                if (rpaneldata.market_status == 0) {
                    $.each(rpanelcommodities, function(rckey, rcval) {
                        $('.rpanelcontract tr').each(function() {
                            var $this = $(this);
                            if (($this.find("input#" + rcval.dispname.replace(' ', '_') + "_isBank")).length) {
                                if (rcval.tradetype == 0) {
                                    $this.find("input#" + rcval.dispname.replace(' ', '_') + "_isMcx").attr("checked", true);
                                    var ratehrow = $(this).closest('tr');
                                    var raterow = $(this).closest('tr').next('tr');
                                    var basebid = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat($("#" + ratehrow.find("input.mcxcontract_" + rcval.dispname).val() + "_bid").html())) : silver_conversion(parseFloat($("#" + ratehrow.find("input.mcxcontract_" + rcval.dispname).val() + "_bid").html()));
                                    var baseask = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat($("#" + ratehrow.find("input.mcxcontract_" + rcval.dispname).val() + "_ask").html())) : silver_conversion(parseFloat($("#" + ratehrow.find("input.mcxcontract_" + rcval.dispname).val() + "_ask").html()));
                                    var selldiff = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.selldiff)) : silver_conversion(parseFloat(rcval.selldiff));
                                    var buydiff = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.buydiff)) : silver_conversion(parseFloat(rcval.buydiff));
                                    var selltax = 0;
                                    var buytax = 0;
                                    var selltcs = 0;
                                    var buytcs = 0;
                                    // Sell diff: diff_type 0 = add, else subtract
                                    var sellOp = parseInt(rcval.rcom_sell_diff_type) == 0 ? 1 : -1;
                                    if (rcval.rcom_sell_callpurity == 1) {
                                        var sellingrate = manual_roundoff(parseFloat((parseFloat(isNaN(baseask) ? 0 : baseask) + sellOp * parseFloat(selldiff)) / 0.995).toFixed(2), 'ask', rcval.comtype);
                                    } else {
                                        var sellingrate = manual_roundoff(parseFloat(parseFloat(isNaN(baseask) ? 0 : baseask) + sellOp * parseFloat(selldiff)).toFixed(2), 'ask', rcval.comtype);
                                    }

                                    // Buy diff: diff_type 0 = add, else subtract
                                    var buyOp = parseInt(rcval.rcom_buy_diff_type) == 0 ? 1 : -1;
                                    if (rcval.rcom_buy_callpurity == 1) {
                                        var buyingrate = manual_roundoff(parseFloat((parseFloat(isNaN(basebid) ? 0 : basebid) + buyOp * parseFloat(buydiff)) / 0.995).toFixed(2), 'bid', rcval.comtype);
                                    } else {
                                        var buyingrate = manual_roundoff(parseFloat(parseFloat(isNaN(basebid) ? 0 : basebid) + buyOp * parseFloat(buydiff)).toFixed(2), 'bid', rcval.comtype);
                                    }
                                    if (rcval.is_gst == 1) {
                                        var selltax = parseFloat(parseFloat(100 + parseFloat(rcval.rcom_sell_tax)) / 100).toFixed(2);
                                        var buytax = parseFloat(parseFloat(100 + parseFloat(rcval.rcom_buy_tax)) / 100).toFixed(2);

                                        sellingrate = parseFloat(parseFloat(isNaN(sellingrate) ? 0 : sellingrate) * parseFloat(selltax)).toFixed(2);
                                        buyingrate = parseFloat(parseFloat(isNaN(buyingrate) ? 0 : buyingrate) * parseFloat(buytax)).toFixed(2);
                                    }
                                    if (rcval.is_tcs == 1) {
                                        var selltcs = parseFloat(parseFloat(100 + parseFloat(rcval.rcom_sell_tcs)) / 100);
                                        var buytcs = parseFloat(parseFloat(100 + parseFloat(rcval.rcom_buy_tcs)) / 100);

                                        sellingrate = parseFloat(parseFloat(isNaN(sellingrate) ? 0 : sellingrate) * parseFloat(selltcs)).toFixed(2);
                                        buyingrate = parseFloat(parseFloat(isNaN(buyingrate) ? 0 : buyingrate) * parseFloat(buytcs)).toFixed(2);
                                    }

                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_base_ask_rate").val(isNaN(baseask) ? '-' : baseask);
                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_selling_diff').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_selling_diff").val(selldiff);
                                    }
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_selling_rate").val(sellingrate);
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_base_bid_rate").val(isNaN(basebid) ? '-' : basebid);
                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_buying_diff').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_buying_diff").val(buydiff);
                                    }
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_buying_rate").val(buyingrate);
                                } else if (rcval.tradetype == 1) {
                                    $this.find("input#" + rcval.dispname.replace(' ', '_') + "_isBank").attr("checked", true);
                                    var raterow = $(this).closest('tr').next('tr');
                                    var ratehrow = $(this).closest('tr');

                                    var basebid = baseask = parseInt(rcval.comtype) == 0 ? gold_spotrateconversion(parseFloat($("." + ratehrow.find("input.bankcontractid_" + rcval.dispname).val() + "_kgrate").html())) : silver_conversion(parseFloat($("." + ratehrow.find("input.bankcontractid_" + rcval.dispname).val() + "_kgrate").html()));
                                    var selldiff = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.selldiff)) : silver_conversion(parseFloat(rcval.selldiff));
                                    var buydiff = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.buydiff)) : silver_conversion(parseFloat(rcval.buydiff));
                                    // Bank: Sell diff_type 0 = add, else subtract
                                    var sellOpBank = parseInt(rcval.rcom_sell_diff_type) == 0 ? 1 : -1;
                                    var sellingrate = manual_roundoff(parseFloat((parseFloat(isNaN(baseask) ? 0 : baseask) + sellOpBank * parseFloat(selldiff))).toFixed(2), 'ask', rcval.comtype);
                                    // Bank: Buy diff_type 0 = add, else subtract
                                    var buyOpBank = parseInt(rcval.rcom_buy_diff_type) == 0 ? 1 : -1;
                                    var buyingrate = manual_roundoff(parseFloat((parseFloat(isNaN(basebid) ? 0 : basebid) + buyOpBank * parseFloat(buydiff))).toFixed(2), 'bid', rcval.comtype)

                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_base_ask_rate").val(isNaN(baseask) ? '-' : baseask);
                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_selling_diff').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_selling_diff").val(selldiff);
                                    }
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_selling_rate").val(sellingrate);
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_base_bid_rate").val(isNaN(basebid) ? '-' : basebid);
                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_buying_diff').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_buying_diff").val(buydiff);
                                    }
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_buying_rate").val(buyingrate);
                                } else if (rcval.tradetype == 2) {
                                    $this.find("input#" + rcval.dispname.replace(' ', '_') + "_isManual").attr("checked", true);
                                    var raterow = $(this).closest('tr').next('tr');

                                    var sellingrate = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.sellrate)) : silver_conversion(parseFloat(rcval.sellrate));
                                    var buydiff = parseInt(rcval.comtype) == 0 ? gold_conversion(parseFloat(rcval.buydiff)) : silver_conversion(parseFloat(rcval.buydiff));

                                    var buyingrate = parseFloat(sellingrate - buydiff).toFixed(2);

                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_m_selling_rate').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_m_selling_rate").val(sellingrate);
                                    }

                                    if (!$('#' + rcval.dispname.replace(' ', '_') + '_m_buying_diff').is(':focus')) {
                                        raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_m_buying_diff").val(buydiff);
                                    }
                                    raterow.find("input#" + rcval.dispname.replace(' ', '_') + "_m_buying_rate").val(buyingrate);
                                }
                                // Dynamic orbit chart values based on commodity type
                                if (parseInt(rcval.comtype) == 0) {
                                    // Gold commodity → set sell rate and default future
                                    $("#sell").html(sellingrate);
                                    var goldAsk = $("#" + rcval.mcxcontract.replace(' ', '_') + "_ask").html();
                                    if (!isNaN(parseFloat(goldAsk))) {
                                        $("#future").html(gold_conversion(goldAsk));
                                    }
                                }
                                if (parseInt(rcval.comtype) == 1) {
                                    // Silver commodity → set buy rate and default future
                                    $("#buy").html(parseFloat(sellingrate).toFixed(2));
                                    var silverAsk = $("#" + rcval.mcxcontract.replace(' ', '_') + "_ask").html();
                                    if (!isNaN(parseFloat(silverAsk))) {
                                        $("#buyfuture").html(silver_conversion(silverAsk));
                                    }
                                }
                            }
                        });
                    });
                }
                /* Rpanel Commodity Calculation End Here */

                /*Orbit Range Calculation Start Here*/


                $('#sell_spot').html(isNaN(parseFloat($("#sell").html() - $("#spot_sell").html())) ? '-' : parseFloat($("#sell").html() - $("#spot_sell").html()).toFixed(2));
                if (parseFloat($("#sell_spot").html()) > 0) $("#sell_spot").css("background-color", "green")
                else $("#sell_spot").css("background-color", "red");
                $.each(rpanelchartcontract, function(rckey, rcval) {

                    if (rcval.status == 1 && rcval.aribitchart_status == 1 && rcval.com_type == 1) {
                        $('#future').html(isNaN(gold_conversion($("#" + rcval.contract_symbol.replace(' ', '_') + "_ask").html())) ? '-' : gold_conversion($("#" + rcval.contract_symbol.replace(' ', '_') + "_ask").html()));
                    }

                })
                document.getElementById("sell_future").innerHTML = (parseFloat($("#sell").html()) - parseFloat($("#future").html())).toFixed(2);
                if (parseFloat($("#sell_future").html()) > 0) $("#sell_future").css("background-color", "green");
                else $("#sell_future").css("background-color", "red");

                document.getElementById("spot_future").innerHTML = (parseFloat($("#future").html()) - parseFloat($("#spot_sell").html())).toFixed(2);

                if (parseFloat($("#spot_future").html()) > 0) $("#spot_future").css("background-color", "green");
                else $("#spot_future").css("background-color", "red");



                document.getElementById("buy_spot").innerHTML = (parseFloat($("#buy").html()) - parseFloat($("#silver_spot_sell").html())).toFixed(2);
                if (parseFloat($("#buy_spot").html()) > 0) $("#buy_spot").css("background-color", "green");
                else $("#buy_spot").css("background-color", "red");
                $.each(rpanelchartcontract, function(rckey, rcval) {
                    if (rcval.status == 1 && rcval.aribitchart_status == 1 && rcval.com_type == 2) {

                        $('#buyfuture').html(isNaN(silver_conversion($("#" + rcval.contract_symbol.replace(' ', '_') + "_ask").html())) ? '-' : silver_conversion($("#" + rcval.contract_symbol.replace(' ', '_') + "_ask").html()));
                    }
                })


                document.getElementById("buy_future").innerHTML = (parseFloat($("#buy").html()) - parseFloat($("#buyfuture").html())).toFixed(2);
                if (parseFloat($("#buy_future").html()) > 0) $("#buy_future").css("background-color", "green");
                else $("#buy_future").css("background-color", "red");

                document.getElementById("spot_buyfuture").innerHTML = (parseFloat($("#buyfuture").html()) - parseFloat($("#silver_spot_sell").html())).toFixed(2);
                if (parseFloat($("#spot_buyfuture").html()) > 0) $("#spot_buyfuture").css("background-color", "green");
                else $("#spot_buyfuture").css("background-color", "red");

                /*Orbit Range Calculation Start Here*/


            };
            callback();
            window.setInterval(callback, 500);
        })();

        function updateIndicator() {
            var online = navigator.onLine;
            if (online) {
                //console.log($("#connectionmsg").html());
                if ($("#connectionmsg").html() != "") {
                    window.location.reload(true);
                }
                $("#connectionmsg").html("");
                $("#connectionmsg").hide();
                /* document.getElementById("connectionmsg").innerHTML = "";
                document.getElementById("connectionmsg").style.display = "none"; */
            } else {
                $("#connectionmsg").show();
                $("#connectionmsg").html("Please check your internet connection");
                /* document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
                document.getElementById("connectionmsg").style.display = "block"; */
            }
        }

        function check_user() {
            $.ajax({
                type: "GET",
                url: "<?php echo $this->config->item('basic_url'); ?>C_ajax/ajax_",
                data: "",
                success: function(xmlDoc) {
                    if (xmlDoc == "") {
                        window.close();
                    }
                }
            });
            setTimeout("check_user(0)", 5000);
        }

        function ratedisplay() {
            submitForm();
        }

        function submitForm() {
            document.forms["iframeForm"].submit();
        }

        function changeFocus() {
            document.getElementById('update').focus();
        }

        function disableForm(theform) {
            if (document.all || document.getElementById) {
                var tempobj = theform.elements;
                //alert(tempobj.length);
                for (i = 0; i < tempobj.length; i++) {
                    tempobj[i].readOnly = true;
                }
                //alert(1);
            }
        } //load_xmldata(0);
    </script>
</head>

<body onLoad="check_user();">
    <!-- Toast container required by showToast() in General.js -->
    <div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>
    <?php $attributes     =    array('id' => 'iframeForm', 'autocomplete' => 'off', 'onSubmit' => 'return disableForm(this);'); ?>
    <?php echo form_open('C_rpanel/DB_Controller/', $attributes); ?>
    <!-- topbar starts -->
    <script>
        <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
            showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
        <?php endif; ?>
    </script>
    <div class="main-panel" style="margin-top:10px;">
        <div class="content-wrapper">
            <div class="row" id="phoneBook">
                <!-- <div id="loader" class="loader"><img src="<?php echo dirname(base_url()) ?>/assets/images/ajax_load.gif" /></div> -->
                <div class="card" style="width:100%">
                    <div class="card-body">
                        <div class="row">
                            <h4 class="col-md-3 card-title rpanel_title"><i class="glyphicon glyphicon-th"></i> RPANEL
                                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/logout" class=" btn btn-primary btn-sm add_new rpanel_title2" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Logout</a>
                            </h4>
                            <div class="col-md-7 table table-hover1 rateTable">
                                <ul class="commodity_listing rpanelmar">
                                    <label align="center" id="connectionmsg" class="connectionmsg" style="display: none; color: rgb(204, 0, 0); margin-top: 54px; font-size:32px; background-color:#000000; position:absolute; line-height:86px;"></label>
                                    <li><a href="#">Rate Display</a></li>
                                    <li><input type="radio" id="israteon" name="fv[rate_display]" value="1" <?php echo ($rpaneldata['rate_display'] == 1) ?  "checked" : "";  ?> onChange="ratedisplay();" />
                                        <label for="israteon" style="cursor:pointer"><strong>On</strong></label>
                                        <input type="radio" id="israteoff" name="fv[rate_display]" value="0" <?php echo ($rpaneldata['rate_display'] == 0) ?  "checked" : "";  ?> onChange="ratedisplay();" />
                                        <label for="israteoff" style="cursor:pointer"><strong>Off</strong></label>
                                    </li>
                                    <li class="market_sta"><a href="#">Market Status</a></li>
                                    <li><input type="checkbox" id="marketstatus" name="fv[marketstatus]" value="1" onChange="ratedisplay();" <?php echo ($rpaneldata['market_status'] == 1) ?  "checked" : "";  ?> />
                                        <label for="marketstatus" style="cursor:pointer"><strong>Market Closed</strong></label>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-2 rpanel_title1">
                                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/logout" class=" btn btn-primary btn-sm add_new" role="button" id="clicklogout"><i class="typcn typcn-document btn-icon-append"></i> Logout</a>
                            </div>
                        </div>
                        <div class="row form-sample1">
                            <div class="col-md-7">
                                <div class="table-responsive1">
                                    <table id="table1" class="table table-hover1 rateTable displaycontract">
                                        <thead>
                                            <tr>
                                                <th class="titleheading1">Symbol</th>
                                                <th>Bid</th>
                                                <th>Ask</th>
                                                <th>High</th>
                                                <th class="phonebook_head">Low</th>
                                                <!--<th>BDiff</th>
												<th>ADiff</th>-->
                                            </tr>
                                        </thead>
                                        <tbody class="commodity_listing commodity_listing1">
                                            <?php foreach ($rpanel_display_contracts as $key => $contract) {
                                                $rclass = $key % 2 == 0 ? 'even' : 'odd';
                                                if ($contract['showdiff'] == 1) {
                                                    $diff = '<td><input type="text" value="' . $contract['biddiff'] . '" id="' . $contract['contract_symbol'] . '_biddiff" class="white-highlight" name="fv[rpcontract][' . $contract['contract_symbol'] . '][biddiff]"></td><td><input type="text" value="' . $contract['askdiff'] . '"  id="' . $contract['contract_symbol'] . '_askdiff" class="white-highlight" name="fv[rpcontract][' . $contract['contract_symbol'] . '][askdiff]"></td>';
                                                } else {
                                                    $diff = "<td></td><td></td>";
                                                }
                                                $diff = '';
                                                echo '<tr class="' . $rclass . '"><td class="rateheading">' . $contract['displayname'] . '<input type="hidden" name="fv[rpcontract][' . $contract['contract_symbol'] . '][contract]" value="' . $contract['contract_id'] . '" /></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_bid" id="' . $contract['contract_symbol'] . '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="bid">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_ask" id="' . $contract['contract_symbol'] . '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="ask">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_high" id="' . $contract['contract_symbol'] . '_high" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="high">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_low" id="' . $contract['contract_symbol'] . '_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="low">-</div></td>' . $diff . '</tr>';
                                            } ?>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-responsive1">

                                    <table class="table table-hover1 rpanelrate rpanelcontract">
                                        <?php foreach ($rpanel_display_commodities as $rckey => $rcval) {
                                            $mcxtrade = $banktrade = $manualtrade = "";
                                            if ($rcval['tradetype'] == 0) {
                                                $mcxtrade = 'checked="checked"';
                                            } else if ($rcval['tradetype'] == 1) {
                                                $banktrade = 'checked="checked"';
                                            } else if ($rcval['tradetype'] == 2) {
                                                $manualtrade = 'checked="checked"';
                                            }

                                            $mcxwtgst = $rcval['is_gst'] == 1 ?  "checked" : "";
                                            $mcxwttcs = $rcval['is_tcs'] == 1 ?  "checked" : "";

                                            $displaytaxblock = $rcval['tradetype'] == 0 ? "display:block" : "display:none";

                                            $insertrow = '<tr class="rpanelrate1"><td><strong>' . $rcval['dispname'] . ':</strong><input type="radio" id="' . str_replace(" ", "_", $rcval['dispname']) . '_isMcx" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][trade_type]" value="0" ' . $mcxtrade . ' onChange="submitForm();" /><label for="isMcx"></label><label for="isMcx" style="cursor:pointer"><strong>Future</strong></label><input type="radio" id="' . str_replace(" ", "_", $rcval['dispname']) . '_isBank" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][trade_type]" ' . $banktrade . ' value="1" onChange="submitForm();" /><label for="isBank"></label><label for="isBank" style="cursor:pointer"><strong>Bank</strong></label><input type="radio" id="' . str_replace(" ", "_", $rcval['dispname']) . '_isManual" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][trade_type]" value="2" ' . $manualtrade . ' onChange="submitForm();" /><input type="hidden" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][comid]" value="' . $rcval['comid'] . '" class="comid_' . str_replace(" ", "_", $rcval['dispname']) . '" /><input type="hidden" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][mcxcontract]" value="' . $rcval['mcxcontract'] . '" class="mcxcontract_' . str_replace(" ", "_", $rcval['dispname']) . '" /><input type="hidden" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][comtype]" value="' . $rcval['comtype'] . '" class="comtype_' . str_replace(" ", "_", $rcval['dispname']) . '" /><input type="hidden" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][bankcontract]" value="' . $rcval['bcontract_rate'] . '" class="bankcontract_' . str_replace(" ", "_", $rcval['dispname']) . '" /><input type="hidden" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][bankcontrid]" value="' . $rcval['bcontract_id'] . '"  class="bankcontractid_' . str_replace(" ", "_", $rcval['dispname']) . '" /><label for="isManual"></label><label for="isManual" style="cursor:pointer"><strong>Manual</strong></label><span style="float: right; ' . $displaytaxblock . '"><lable><input type="checkbox" id="' . str_replace(" ", "_", $rcval['dispname']) . '_isgst" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][is_gst]" value="1" ' . $mcxwtgst . ' onChange="submitForm();" /></lable><label ><strong>GST</strong></label><lable><input type="checkbox" id="' . str_replace(" ", "_", $rcval['dispname']) . '_istcs" name="fv[contract][' . str_replace(" ", "_", $rcval['dispname']) . '][is_tcs]" value="1" ' . $mcxwttcs . ' onChange="submitForm();"  /></lable><label><strong>TCS</strong></label></span></td></tr>';
                                            $selldiff = $rcval['comtype'] == 0 ? number_format((($rcval['selldiff'] / 10) * $rpanelsettings['rpsg_weight']), 2, '.', '') : number_format((($rcval['selldiff'] / 1000) * $rpanelsettings['rpss_weight']), 2, '.', '');
                                            $buydiff = $rcval['comtype'] == 0 ? number_format((($rcval['buydiff'] / 10) * $rpanelsettings['rpsg_weight']), 2, '.', '') : number_format((($rcval['buydiff'] / 1000) * $rpanelsettings['rpss_weight']), 2, '.', '');

                                            if ($rcval['tradetype'] == 2) {
                                                $display_row = $rckey == 0 ? '' : "";

                                                $manualsellrate = $rcval['comtype'] == 0 ? number_format((($rcval['sellrate'] / 10) * $rpanelsettings['rpsg_weight']), 2, '.', '') : number_format((($rcval['sellrate'] / 1000) * $rpanelsettings['rpss_weight']), 2, '.', '');
                                                $manualselldiff = $rcval['comtype'] == 0 ? number_format((($selldiff / 10) * $rpanelsettings['rpsg_weight']), 2, '.', '') : number_format((($selldiff / 1000) * $rpanelsettings['rpss_weight']), 2, '.', '');
                                                $insertrow .= '<tr><td><div class=""><table width="100%" border="0" cellpadding="0" cellspacing="0"  class="table3" id="manual"><tr class="table3-title" ' . $display_row . '><td class="titleheading1">Sell Rate</td><td>Buy Diff</td><td>Buy Rate</td></tr><tr class="table3-rate"><td><input type="text" id="' . str_replace(" ", "_", $rcval['dispname']) . '_m_selling_rate" class="white-highlight1" onkeydown="validateKeyPress(event, this,3)" style="width:50%" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][selling_rate]" value="' . $manualsellrate . '" ><input type="hidden" id="mgold_selling_diff" class="white-highlight1" onkeydown="validateKeyPress(event, this,3)" style="width:50%" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][selling_diff]" value="' . $selldiff . '" ></td><td><input type="text" id="' . str_replace(" ", "_", $rcval['dispname']) . '_m_buying_diff" class="white-highlight1" onkeydown="validateKeyPress(event, this,3)" style="width:50% !important" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][buying_diff]" value="' . $manualselldiff . '" ></td><td class="rdata"><input type="text" id="' . str_replace(" ", "_", $rcval['dispname']) . '_m_buying_rate" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][buying_rate]" class="txtlabelbold" readonly="true" onFocus="changeFocus();" value="' . ($manualsellrate - $manualselldiff) . '"></td></tr></table></div></td></tr>';
                                            } else {
                                                $display_row = $rckey == 0 ? '' : "";
                                                $insertrow .= '<tr><td><div class="table3-container"><table width="100%" border="0" cellpadding="0" cellspacing="0" class="table3" id="mcx_bank"><tr class="table3-title" ' . $display_row . '><td class="titleheading1">Base Ask Rate</td><td>Sell diff</td><td>Sell Rate</td><td id="gold_base_bid_rate">Base Bid Rate</td><td>Buy Diff</td><td>Buy Rate</td></tr><tr class="table3-rate"><td class=" rdata"><input type="text" id="' . str_replace(" ", "_", $rcval['dispname']) . '_base_ask_rate" class="txtlabelbold" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][base_ask_rate]" readonly="true" value="" onFocus="changeFocus();"></td><td><input type="text" class="white-highlight1" onkeydown="validateKeyPress(event, this,3)"  id="' . str_replace(" ", "_", $rcval['dispname']) . '_selling_diff" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][selling_diff]" value="' . $selldiff . '" ></td><td class="rdata"><input type="text" id="' . str_replace(" ", "_", $rcval['dispname']) . '_selling_rate" class="txtlabelbold" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][selling_rate]" readonly="true" value="" onFocus="changeFocus();"></td><td class="rdata"><input type="text" class="txtlabelbold" id="' . str_replace(" ", "_", $rcval['dispname']) . '_base_bid_rate" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][base_bid_rate]" value="" readonly="true" onFocus="changeFocus();"></td><td><input type="text" class="white-highlight1" onkeydown="validateKeyPress(event, this,3)" id="' . str_replace(" ", "_", $rcval['dispname']) . '_buying_diff" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][buying_diff]" value="' . $buydiff . '" ></td><td class="rdata"><input type="text" class="txtlabelbold" id="' . str_replace(" ", "_", $rcval['dispname']) . '_buying_rate" name="fv[contractrates][' . str_replace(" ", "_", $rcval['dispname']) . '][buying_rate]" value=""  readonly="true" onFocus="changeFocus();"></td></tr></table></div></td></tr>';
                                            }
                                            echo $insertrow;
                                        } ?>
                                    </table>
                                    <table cellspacing="0" cellpadding="0" width="100%" id="marketClosed" style="display:none;">
                                        <tr>
                                            <td width="100%" style="padding: unset;">
                                                <textarea id="market_closed" name="fv[market_closed]" cols="102" rows="8"></textarea>
                                            </td>
                                        </tr>
                                    </table>

                                    <div class="update-button-box" style="margin-top:10px !important;">
                                        <input type="hidden" id="TinyMCE_text" name="TinyMCE_text" value="">
                                        <?php if (empty($disable_rpaneledit) || $disable_rpaneledit != 1): ?>
                                            <input type="submit" value="Update" id="update" name="update" class="updatedrpanel" />
                                        <?php else: ?>
                                            <span class="badge" style="background:#e74c3c;color:#fff;padding:6px 14px;font-size:13px;border-radius:4px;">🔒 Read Only — Updates disabled</span>
                                        <?php endif; ?>
                                    </div>
                                    <?php if (!empty($disable_rpaneledit) && $disable_rpaneledit == 1): ?>
                                        <script>
                                            $(document).ready(function() {
                                                // Disable all editable controls for read-only users
                                                $('#iframeForm input[type="text"], #iframeForm input[type="number"], #iframeForm textarea').prop('readonly', true);
                                                $('#iframeForm input[type="radio"], #iframeForm input[type="checkbox"]').prop('disabled', true);
                                                $('#iframeForm').off('submit').on('submit', function(e) {
                                                    e.preventDefault();
                                                    showToast('You do not have permission to modify R-Panel data.', 'danger');
                                                    return false;
                                                });
                                            });
                                        </script>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="box-content col-md-5" style="">
                                <div class="table-responsive1 table-responsive">
                                    <table id="table2" class="table table-hover1 rateTable rpbankrates">
                                        <?php
                                        foreach ($rpanelbank as $rbkey => $rbval) {
                                            if ($rbkey == 0) {
                                                $tablehead = '<thead><tr class="title title1"><th class="titleheading1">Description</th>';
                                                $tablebody = '<tbody>';

                                                foreach ($rpanelbank as $rpkey => $rpval) {
                                                    $tablehead .= '<th><p class="rpanel-title">' . $rpval['bcontract_symbol'] . '</p><input type="hidden" value=' . $rpval['bcontract_id'] . ' name="fv[bankrate][' . str_replace(" ", "_", $rpval['bcontract_symbol']) . '][bankid]" ><input type="hidden" value=' . $rpval['bcontract_symbol'] . ' name="fv[bankrate][' . str_replace(" ", "_", $rpval['bcontract_symbol']) . '][bankcontrname]" ><input type="hidden" value=' . $rpval['bconvert_value_type'] . ' name="fv[bankrate][' . str_replace(" ", "_", $rpval['bcontract_symbol']) . '][converttype]" ><input type="hidden" value=' . $rpval['bextra_charges'] . ' name="fv[bankrate][' . str_replace(" ", "_", $rpval['bcontract_symbol']) . '][extracharge]" ><input type="hidden" value=' . $rpval['bextra_type'] . ' name="fv[bankrate][' . str_replace(" ", "_", $rpval['bcontract_symbol']) . '][chargetype]" ></th>';
                                                }
                                                $tablehead .= '</tr></thead>';
                                                $colNames = array("ASK($)", "Premium", "Conv", "INR(₹)", "Premium", "Custom", "Tax Type", "Tax", "TCS", "Pure", "1Grm Rate", "1KG Rate");
                                                $colsubNames = array("askdollar", "premium", "bconvert_value", "inr", "rupeepremium", "custom", "btax_type", "btax_value", "tcs_tax", "pure", "grmrate", "kgrate");
                                                $tablerow = "";
                                                for ($i = 0; $i < 12; $i++) {
                                                    $className = $i % 2 == 0 ? 'class="rpanel-tbody even"' : 'class="rpanel-tbody odd"';
                                                    $tablerow .= "<tr " . $className . "><td class='rateheading'>" . $colNames[$i] . "</td>";
                                                    foreach ($rpanelbank as $key => $val) {
                                                        if ($i == 1 || $i == 4 || $i == 5 || $i == 7 || $i == 8) {
                                                            $getval = $val[$colsubNames[$i]];
                                                            $disp_rate = "<input class='white-highlight' type='text' value=" . $getval . " name='fv[bankrate][" . str_replace(" ", "_", $val['bcontract_symbol']) . "][" . $colsubNames[$i] . "]' id='" . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . "' onkeydown='validateKeyPress(event, this,2)' />";
                                                        } else if ($i == 2) {
                                                            $getval = $val[$colsubNames[$i]];
                                                            $disp_rate = "<input class='txtlabel txtlabel1 white-highlight' onkeydown='validateKeyPress(event, this,2)' type='text' value=" . $getval . " name='fv[bankrate][" . str_replace(" ", "_", $val['bcontract_symbol']) . "][" . $colsubNames[$i] . "]' id='" . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . "' readonly='true' >";
                                                        } else if ($i == 6) {
                                                            $getval = $val[$colsubNames[$i]];
                                                            $percheck = $getval == 1 ?  "checked" : "";
                                                            $valcheck = $getval == 2 ?  "checked" : "";
                                                            $disp_rate = '<input type="radio" id="' . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . '" name="fv[bankrate][' . str_replace(" ", "_", $val['bcontract_symbol']) . '][' . $colsubNames[$i] . ']" value="1" onChange="ratedisplay();" ' . $percheck . ' />%<input type="radio" id="' . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . '" name="fv[bankrate][' . str_replace(" ", "_", $val['bcontract_symbol']) . '][' . $colsubNames[$i] . ']" value="2" onChange="ratedisplay();" ' . $valcheck . ' />V';
                                                        } else if ($i == 9) {
                                                            $getval = $val[$colsubNames[$i]];
                                                            $yescheck = $getval == 1 ?  "checked" : "";
                                                            $nocheck = $getval == 0 ?  "checked" : "";
                                                            $disp_rate = '<input type="radio" id="' . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . '" name="fv[bankrate][' . str_replace(" ", "_", $val['bcontract_symbol']) . '][' . $colsubNames[$i] . ']" value="1" onChange="ratedisplay();" ' . $yescheck . ' />Yes<input type="radio" id="' . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . '" name="fv[bankrate][' . str_replace(" ", "_", $val['bcontract_symbol']) . '][' . $colsubNames[$i] . ']" value="0" onChange="ratedisplay();" ' . $nocheck . ' />No';
                                                        } else {
                                                            //$getval = $val[$colsubNames[$i]] ?? ;
                                                            $disp_rate = "<label id='" . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . "' class='" . $val['bcontract_id'] . "_" . $colsubNames[$i] . "'>-</label>";
                                                        }
                                                        $tablerow .= '<td class="rdata "' . ($colsubNames[$i] . "_" . str_replace(" ", "_", $val['bcontract_symbol'])) . '">' . $disp_rate . '</td>';
                                                    }
                                                    $tablerow .= "</tr>";
                                                }
                                                $tablebody .= $tablerow;
                                                $tablebody .= '</tbody>';
                                                echo $tablehead;
                                                echo $tablebody;
                                            }
                                        } ?>
                                    </table>
                                </div>
                                <div class="box-content box-content1" style="">
                                    <div class="table-responsive1">
                                        <div class="lastupdate" style="display:none;"><label id="updated_time"></label></div>
                                        <div class="flowchart" id="orbitClosed" style="display:none;">
                                            <div class="sell">
                                                <div class="bank" id="spot_sell"></div>
                                                <div class="svg" id="sell"></div>
                                                <div class="mcx" id="future"></div>
                                                <div class="bank-svg" id="sell_spot"></div>
                                                <div class="svg-mcx" id="sell_future"></div>
                                                <div class="bank-mcx" id="spot_future"></div>
                                            </div>
                                            <div class="buy">
                                                <div class="bank" id="silver_spot_sell"></div>
                                                <div class="svg" id="buy"></div>
                                                <div class="mcx" id="buyfuture"></div>
                                                <div class="bank-svg" id="buy_spot"></div>
                                                <div class="svg-mcx" id="buy_future"></div>
                                                <div class="bank-mcx" id="spot_buyfuture"></div>
                                            </div>
                                        </div>
                                        <div class="notification">
                                            <h4>Notification</h4>
                                            <div class="booking_contact1">
                                                <p>Logimax Technologies (P) Ltd.,</p>
                                            </div>
                                        </div>
                                        <div class="notification">
                                            <h4>Help Desk</h4>
                                            <div class="booking_contact1">
                                                <div class="help-contact">
                                                    <i class="glyphicon glyphicon-phone"></i><span><a href="tel:+919585554799"> +91 9585554799</a></span><br />
                                                    <i class="glyphicon glyphicon-phone"></i><span><a href="tel:+919585554899"> +91 9585554899</a></span><br />
                                                    <i class="glyphicon glyphicon-phone"></i><span><a href="tel:+919585554999"> +91 9585554999</a></span><br />
                                                </div>
                                            </div>
                                        </div>
                                        <!--<div class="help-desk">
										<div class="help-phone-no">+91 9585554799<br>
											+91 9585554899,+91 9585554999</div>
										<div class="poweredby">Powered by <a href="http://www.logimaxindia.com" target="_blank"><img src="<?php echo $this->config->item('base_url') ?>assets/img/logimax.png"  alt="" width="70" height="24" align="absmiddle"/></a></div>
									</div>-->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row form-sample1">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" name="fv[updatetime]" id="updatetime" value="<?php echo $rpaneldata['updateon']; ?>" />
    <input type="hidden" name="fv[rpanelsettings]" id="rpanelsettings" value='<?php echo json_encode($rpanelsettings); ?>' />
</body>
<?php $this->load->view("include/footer"); ?>