<?php
$cus_id = "";
$cus_name = "";
$groupname = "Default";
$client = isset(Globals::$client) ? Globals::$client : '';
?>

<?php $disp_margin = $this->login_model->get_marginsettings(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <?php
    $cur_userid = $this->login_model->get_userid();
    $tradingStatus = $this->login_model->get_tradingEnable();
    ?>
    <meta charset="utf-8">
    <title>Phonebooking</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Winbull Lite, a fully featured, responsive,">
    <meta name="author" content="Logimax Technologies">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/typicons/typicons.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/vendor.bundle.base.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/style.css">
    <!-- The styles -->

    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/lmx-app.css" rel="stylesheet">
    <link
        href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/fullcalendar/dist/fullcalendar.css'
        rel='stylesheet'>
    <link
        href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/fullcalendar/dist/fullcalendar.print.css'
        rel='stylesheet' media='print'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/chosen/chosen.min.css'
        rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/colorbox/example3/colorbox.css'
        rel='stylesheet'>
    <link
        href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/responsive-tables/responsive-tables.css'
        rel='stylesheet'>
    <link
        href='<?php echo $this->config->item('base_url'); ?>assets/bower_components/bootstrap-tour/build/css/bootstrap-tour.min.css'
        rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.theme.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.iphone.toggle.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/uploadify.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/animate.min.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/customize.css' rel='stylesheet'>
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-glyphicons/1.0.0/css/bootstrap-glyphicons.min.css">

    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/css/phonebooking/main.css">
    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/css/phonebooking/media.css">
    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/css/radiobuttons.css">

    <!-- jQuery -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
    <!-- jQuery.browser polyfill for older Bootstrap compatibility -->
    <script>
        if (!jQuery.browser) {
            jQuery.browser = {};
            jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
            jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
            jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
            jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
        }
    </script>
    <script src='<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap.min.js'></script>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-datetimepicker.css' rel='stylesheet'>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-datetimepicker.min.js"></script>
    <!-- <script src="<?php echo dirname($this->config->item('base_url')); ?>/assets/js/socket.io.js"></script> -->
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <!-- <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/vendor.bundle.base.js"></script> -->
    <!-- endinject -->
    <!-- Plugin js for this page-->
    <!-- End plugin js for this page-->
    <!-- inject:js -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/off-canvas.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/hoverable-collapse.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/template.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/settings.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/todolist.js"></script>
    <!-- endinject -->
    <!-- Custom js for this page-->

    <link rel="shortcut icon" href="<?php echo $this->config->item('base_url'); ?>assets/img/favicon.png">

    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <!-- Inline utility functions: showToast, validateKeyPress (General.js not in repo) -->
    <script>
        function showToast(message, type) {
            type = type || 'success';
            var bgColors = {
                success: '#28a745',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8'
            };
            var icons = {
                success: '✅',
                danger: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            var bg = bgColors[type] || '#333';
            var icon = icons[type] || '';

            // Create or get the wrapper
            var el = document.getElementById('lmx-toast-wrap');
            if (!el) {
                el = document.createElement('div');
                el.id = 'lmx-toast-wrap';
                el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;min-width:300px;max-width:500px;pointer-events:auto;';
                document.body.appendChild(el);
            }

            // Create toast message
            var msg = document.createElement('div');
            msg.style.cssText = 'background:' + bg + ';color:#fff;padding:14px 20px;border-radius:8px;margin-bottom:10px;font-size:15px;font-weight:500;box-shadow:0 4px 15px rgba(0,0,0,0.35);display:flex;align-items:center;gap:10px;animation:lmxToastIn 0.3s ease;border-left:5px solid rgba(0,0,0,0.2);';
            msg.innerHTML = '<span style="font-size:18px;flex-shrink:0;">' + icon + '</span><span style="flex:1;">' + message + '</span><span onclick="this.parentNode.remove()" style="cursor:pointer;font-size:18px;opacity:0.8;flex-shrink:0;margin-left:8px;">&times;</span>';
            el.appendChild(msg);

            // Add animation keyframes if not already added
            if (!document.getElementById('lmx-toast-style')) {
                var style = document.createElement('style');
                style.id = 'lmx-toast-style';
                style.textContent = '@keyframes lmxToastIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}';
                document.head.appendChild(style);
            }

            // Auto-remove after 8 seconds
            setTimeout(function() {
                if (msg.parentNode) {
                    msg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    msg.style.opacity = '0';
                    msg.style.transform = 'translateX(100px)';
                    setTimeout(function() {
                        if (msg.parentNode) msg.parentNode.removeChild(msg);
                    }, 300);
                }
            }, 8000);
        }

        function validateKeyPress(event, element, type) {
            if (type == 4) return true; // allow all (text fields)
            var c = event.which || event.keyCode;
            if (c === 8 || c === 9 || c === 46 || c === 37 || c === 39) return true;
            if (c >= 48 && c <= 57) return true;
            if (c === 190 || c === 110) return true; // decimal
            return false;
        }
    </script>
    <script type="text/javascript">
        $(document).ready(function() {
            $('#deli_date').datepicker({
                minDate: 0,
                dateFormat: 'dd-mm-yy'
            });

        });

        function delivery_dateselect(com_deli_from, com_deli_to) {
            var $ = jQuery.noConflict();
            //$("#deli_date").datepicker('option', 'minDate', com_deli_from, 'maxDate', com_deli_to );
            $("#deli_date").datepicker("setDate", com_deli_from);
            $("#deli_date").datepicker('option', {
                minDate: com_deli_from,
                maxDate: com_deli_to
            });
            /* $('#deli_date').datepicker({
            	minDate : 0,
            	maxDate: com_deli_to,
            }); */
        }
    </script>
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchname');

            // Disable autocomplete suggestions
            if (searchInput) {
                searchInput.setAttribute('autocomplete', 'off');
                searchInput.setAttribute('autocorrect', 'off');
                searchInput.setAttribute('autocapitalize', 'off');
                searchInput.setAttribute('spellcheck', 'false');

                // If a jQuery autocomplete or typeahead is attached, destroy it
                if ($(searchInput).data('ui-autocomplete')) {
                    $(searchInput).autocomplete('destroy');
                }
                if ($(searchInput).data('typeahead')) {
                    $(searchInput).typeahead('destroy');
                }
            }
        });
        $(document).ready(function() {
            $("#trade_enable_off").on("click", function(e) {
                e.preventDefault();
                $('#tradeCloseAlert').modal('show');
            });
            $("#trade_enable_on").on("click", function(e) {
                e.preventDefault();
                window.location = "<?php echo base_url(); ?>index.php/c_main/enable_trade/1/0";
            });
            // Socket is initialized globally in the main script block below.
            // Just attach the trade status listener here.
            // (must wait for socket to be ready — wrapped in a small delay or use global)
            var _waitSocket = setInterval(function() {
                if (typeof socket !== 'undefined') {
                    clearInterval(_waitSocket);
                    socket.on("<?php echo Globals::$evt_trdstatusupdate; ?>", function(data) {
                        console.log(data);
                        if (typeof data.updatedata !== 'undefined') {
                            var tradingstatus = data.updatedata;
                            $(tradingstatus).each(function(count_i, status) {
                                if (status.client == '<?php echo $client; ?>') {
                                    var tradestatus = status.trade_enable;
                                    if (tradestatus == 1) {
                                        $("#trade_enable_on").prop("checked", true);
                                    } else {
                                        $("#trade_enable_off").prop("checked", true);
                                    }
                                }
                            });
                        }
                    });
                }
            }, 100);
        });
    </script>
    <style type="text/css">
        .dataTables_filter input {
            margin-left: -65px;
        }

        .rateTable tr th {
            overflow-wrap: break-word;
            white-space: normal;
        }

        .request-btn-text {
            background-color: #273d52;
            color: #fff;
            height: auto;
        }

        .form-group label {
            margin-bottom: 0.2rem
        }

        .request-rows .form-control {
            border: 1px solid #b5aeae
        }

        .radiorates1 {
            top: 7px;
            position: relative;
        }

        .table td {
            font-size: .875rem;
            border: 1px solid #cfc9c9 !important
        }

        @media only screen and (max-width:480px) {
            .navbar .navbar-menu-wrapper .navbar-nav .nav-item {
                margin-left: 3.531rem;
                margin-top: 25px;
            }

            .table-responsive1 {
                overflow-x: auto;
            }

            .rateTable tr th {
                font-size: 13px;
                overflow-wrap: break-word;
                white-space: normal;
            }

            .rateTable tr td {
                font-size: 11px !important;
                padding: 8px;
            }

            .rateTitle {
                font-size: 15px;
            }

            .card .card-body {
                padding: 8px 0px;
            }

            .phone_bookdiv {
                overflow-x: scroll;
                padding-left: 5px;
                padding-right: 5px;
            }

            #phoneBook .grid-margin {
                padding-left: 5px;
                padding-right: 5px;
            }

            .justify-content-end {
                justify-content: flex-start !important;
            }
        }
    </style>
</head>

<body>
    <?php if (!isset($no_visible_elements) || !$no_visible_elements) { ?>
        <!-- topbar starts -->
        <div class="container-scroller">
            <nav class="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                <div class="navbar-brand-wrapper d-flex justify-content-center">
                    <div class="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
                        <a class="navbar-brand brand-logo" href="#"><img
                                src="<?php echo $this->config->item('base_url'); ?>assets/img/logoicon.png" alt="logo"
                                style="width:60%" /></a>
                        <a class="navbar-brand brand-logo-mini" href="#"><img
                                src="<?php echo $this->config->item('base_url'); ?>assets/img/logoicon.png"
                                alt="logo" /></a>
                        <button class="navbar-toggler navbar-toggler align-self-center" type="button"
                            data-toggle="minimize">
                            <span class="typcn typcn-th-menu"></span>
                        </button>
                    </div>
                </div>
                <div class="navbar-menu-wrapper d-flex align-items-center justify-content-end">
                    <ul class="navbar-nav mr-lg-2">
                        <li class="nav-item nav-profile dropdown">
                            <a class="nav-link" href="#" data-toggle="dropdown" id="profileDropdown">
                                <a class="navbar-brand navbar-brand1"
                                    href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">
                                    <span><?php echo $this->general_model->get_companyname(); ?></span></a>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right navbar-dropdown"
                                aria-labelledby="profileDropdown">
                                <a class="dropdown-item">
                                    <i class="typcn typcn-cog-outline text-primary"></i>
                                    Settings
                                </a>
                                <a class="dropdown-item">
                                    <i class="typcn typcn-eject text-primary"></i>
                                    Logout
                                </a>
                            </div>
                        </li>
                    </ul>
                    <ul class="navbar-nav navbar-nav-right">
                        <li class="nav-item nav-date dropdown">
                            <a class="nav-link d-flex justify-content-center align-items-center" href="javascript:;">
                                <h6 class="date mb-0">Trade : <div style="display:inline;" class="radiorates">
                                        <input checked type="radio" value="0" name="trade_OnOff" id="trade_enable_on"
                                            class="option-input radio" <?php if ($tradingStatus == 1) { ?> checked <?php } ?> /> <label for="trade_enable_on"> On</label>
                                        <input type="radio" value="1" name="trade_OnOff" id="trade_enable_off"
                                            class="option-input radio" <?php if ($tradingStatus == 0) { ?> checked <?php } ?> /> <label for="trade_enable_off">Off</label>
                                    </div>
                                </h6>

                            </a>
                        </li>
                        <li class="nav-item nav-date dropdown">
                            <a class="nav-link d-flex justify-content-center align-items-center"
                                href="<?php echo dirname($this->config->item('base_url')); ?>" target="_blank">
                                <i class="typcn typcn-home"></i>

                            </a>
                        </li>
                        <li class="nav-item dropdown mr-0">
                            <a class="nav-link count-indicator dropdown-toggle d-flex align-items-center justify-content-center"
                                id="notificationDropdown" href="#" data-toggle="dropdown">
                                <i class="typcn typcn-user"></i><span class="hidden-sm hidden-xs">
                                    <?php echo $this->session->userdata('username'); ?></span>
                                <span class="caret"></span>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
                                aria-labelledby="notificationDropdown">

                                <a class="preview-item preview-item1">
                                    <div class="preview-thumbnail">
                                        <div class="preview-icon bg-success">
                                            <i class="typcn typcn-lock-closed mx-0"></i>
                                        </div>
                                    </div>
                                    <div class="preview-item-content preview-item-content1">
                                        <h6 class="preview-subject font-weight-normal"><a
                                                href="<?php echo $this->config->item('base_url'); ?>index.php/C_change_psw/open_entry_form">Change
                                                Password</a></h6>
                                    </div>
                                </a>
                                <a class="preview-item preview-item1 preview-item2">
                                    <div class="preview-thumbnail">
                                        <div class="preview-icon bg-warning">
                                            <i class="typcn typcn-cog-outline mx-0"></i>
                                        </div>
                                    </div>
                                    <div class="preview-item-content preview-item-content1 preview-item-content2">
                                        <h6 class="preview-subject font-weight-normal"><a
                                                href='<?php echo $this->config->item('base_url'); ?>index.php/C_main/logout'>Logout</a>
                                        </h6>
                                    </div>
                                </a>
                            </div>
                        </li>
                    </ul>
                    <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button"
                        data-toggle="offcanvas">
                        <span class="typcn typcn-th-menu"></span>
                    </button>
                </div>
            </nav>
            <!-- topbar ends -->

            <nav class="navbar-breadcrumb col-xl-12 col-12 d-flex flex-row p-0">
                <div class="navbar-links-wrapper d-flex align-items-stretch">
                    <div class="nav-link">
                        <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/listing/5" title="Today's Trade"><i class="typcn typcn-calendar-outline"></i></a>
                    </div>
                    <div class="nav-link">
                        <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_booking/open_listingform/1" title="Limit Order"><i class="typcn typcn-mail"></i></a>
                    </div>
                    <div class="nav-link">
                        <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/listing/6" title="Pending Delivery"><i class="typcn typcn-folder"></i></a>
                    </div>
                    <div class="nav-link">
                        <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/listing/3" title="Delivery Invoice"><i class="typcn typcn-document-text"></i></a>
                    </div>
                </div>
                <div class="navbar-menu-wrapper d-flex align-items-center justify-content-end">
                    <ul class="navbar-nav mr-lg-2">
                        <li class="nav-item ml-0">
                            <h4 class="mb-0">Dashboard</h4>
                        </li>
                        <li class="nav-item">
                            <div class="d-flex align-items-baseline">
                                <p class="mb-0"><a
                                        href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage"
                                        style="color:#fff">Home</a></p>
                                <i class="typcn typcn-chevron-right"></i>
                                <p class="mb-0">Phonebooking</p>
                            </div>
                        </li>
                    </ul>

                </div>

            </nav>
        <?php } ?>
        <?php $cus_group = "Default"; ?>
        <a style="display:none" class="btn btn-primary noty"
            data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
            <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
        </a>
        <script type="text/javascript">
            var colsubNames = new Array("askdollar", "premium", "bconvert_value", "inr", "rupeepremium", "custom", "btax_type", "btax_value", "pure", "grmrate", "kgrate");
            var rpanelbankrates = <?php echo json_encode($comdata['rpanelbank']); ?>;
            var rpaneldata = <?php echo json_encode($comdata['rpaneldata']); ?>;
            var rpanelsetting = <?php echo json_encode($comdata['rpanelsettings']); ?>;
            var rpanelcontract = <?php echo json_encode($comdata['rpanel_contracts']); ?>;
            var rpanelcommodities = <?php echo json_encode($comdata['rpanel_commodities']); ?>;

            document.addEventListener("visibilitychange", function() {
                if (document.hidden) {
                    console.log("Browser tab is hidden")
                } else {
                    // $.ajax({
                    // 	url : "<?php echo $this->config->item('base_url'); ?>index.php/C_phonebooking/get_commodity_data",
                    // 	type : "GET",
                    // 	dataType : "json",
                    // 	data: "",
                    // 	async: false,
                    // 	success: function(data){
                    // 		if(data.commoditydetails.length > 0){
                    // 			$("#liveratetable tbody").empty();
                    // 		}
                    // 		$.each(data.commoditydetails,function(idx, commodity){
                    // 			var tablerow = '<tr><td class="roundTopLeft rateTitle com_name">' + commodity.com_name +'</td><td id="buy_rates['+idx+']" class="buy_rates"></td><td id="sell_rates['+idx+']" class="sell_rates"></td><td style="display:none">' + commodity.deliverydays +'</td><td style="display:none;"><div class="com_id">'+ commodity.com_id + '</div><div class="com_type">'+ commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">'+ commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">'+ commodity.com_buy_premium + '</div><div class="com_premium_type">'+ commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">'+ commodity.com_delverydays + '</div><div class="com_isregion">'+ commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">'+ commodity.com_display_purity + '</div><div class="com_roundoff">'+ commodity.com_roundoff + '</div><div class="com_is_coin">'+ commodity.com_is_coin + '</div><div class="com_bar_quantity">'+ commodity.com_bar_quantity + '</div><div class="com_margin_type">'+ commodity.com_margin_type + '</div><div class="com_margin_value">'+ commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">'+ commodity.com_bar_type + '</div><div class="bar_selection">'+ commodity.bar_selection + '</div><div class="com_bar_no">'+ commodity.com_bar_no + '</div><div class="com_unit">'+ commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="is_gst">'+ commodity.is_gst + '</div><div class="is_tcs">'+ commodity.is_tcs + '</div><div class="rcom_sell_tax">'+ commodity.rcom_sell_tax + '</div><div class="rcom_buy_tax">'+ commodity.rcom_buy_tax + '</div><div class="rcom_sell_tcs">'+ commodity.rcom_sell_tcs + '</div><div class="rcom_buy_tcs">'+ commodity.rcom_buy_tcs + '</div></td></tr>';
                    // 			$("#liveratetable tbody").append(tablerow);
                    // 		});

                    // 	},
                    // 	error: function(request,error){
                    // 		console.log(error);
                    // 	}
                    // });
                }
            });
            var socket_url = '<?php echo Globals::$socket_base_url; ?>';
            var socket = io(socket_url, {
                path: "/socket.io/",
                transports: ["websocket"],
                upgrade: false,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                timeout: 20000
            });

            // --- Debug: log socket lifecycle ---
            socket.on('connect', function() {
                console.log('✅ Socket.IO connected, id:', socket.id);
            });
            socket.on('disconnect', function(reason) {
                console.log('⚠️ Socket.IO disconnected, reason:', reason);
                if (reason === 'io server disconnect') {
                    socket.connect();
                }
            });
            socket.on('connect_error', function(err) {
                console.error('❌ Socket.IO connect_error:', err.message);
            });
            socket.io.on('reconnect', function(attempt) {
                console.log('🔄 Socket.IO reconnected after', attempt, 'attempts');
            });
            socket.on("<?php echo Globals::$evt_commupdate; ?>", function(data) {
                rpanelcontract = data.updatedata.rpanel_contracts;
                clear_bookingterminal();
                get_tradingstatus();
                $("#userid").val("");
                $("#searchname").val("");
                if (data.updatedata.commodity.length > 0) {
                    $("#liveratetable tbody").empty();
                }
                $.each(data.updatedata.commodity, function(idx, commodity) {
                    var tablerow = '<tr><td class="roundTopLeft rateTitle com_name">' + commodity.com_name + '</td><td id="buy_rates[' + idx + ']" class="buy_rates"></td><td id="sell_rates[' + idx + ']" class="sell_rates"></td><td style="display:none">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="is_gst">' + commodity.is_gst + '</div><div class="is_tcs">' + commodity.is_tcs + '</div><div class="rcom_sell_tax">' + commodity.rcom_sell_tax + '</div><div class="rcom_buy_tax">' + commodity.rcom_buy_tax + '</div><div class="rcom_sell_tcs">' + commodity.rcom_sell_tcs + '</div><div class="rcom_buy_tcs">' + commodity.rcom_buy_tcs + '</div></td></tr>';
                    $("#liveratetable tbody").append(tablerow);
                });
                clear_bookingterminal();
                $("#userid").val("");
                $("#searchname").val("");
                $('#order_rate').val("");
                $("#avail_margin").html("");
                $("#searchname").focus();
                get_tradingstatus();
            });
            socket.on('<?php echo Globals::$evt_rpanelupdate; ?>', function(data) {
                rpanelbankrates = data.updatedata.rpanelbank;
                rpaneldata = data.updatedata.rpaneldata;
                rpanelcommodities = data.updatedata.rpanel_commodities;
                $(".market_closed").html(data.updatedata.rpaneldata.market_status);
                $(".rate_display").html(data.updatedata.rpaneldata.rate_display);

                if (data.updatedata.rpaneldata.rate_display == 0) {
                    document.getElementById("onoffmessage").style.display = "block";
                    document.getElementById("messagebox").style.display = "none";
                    document.getElementById("divrate").style.display = "none";
                } else if (data.updatedata.rpaneldata.rate_display == 1 && data.updatedata.rpaneldata.market_status == 1) {
                    document.getElementById("onoffmessage").style.display = "none";
                    document.getElementById("divrate").style.display = "none";
                    document.getElementById("messagebox").style.display = "block";
                    $("#messageboxtext").html(data.updatedata.rpaneldata.message);
                } else if (data.updatedata.rpaneldata.rate_display == 1 && data.updatedata.rpaneldata.market_status != 1) {
                    document.getElementById("onoffmessage").style.display = "none";
                    document.getElementById("messagebox").style.display = "none";
                    document.getElementById("divrate").style.display = "block";
                }
            });
            socket.on("<?php echo Globals::$evt_bookupdate; ?>", function(data) {
                console.log("Book Table Refreshed");
                get_data();
            });
            socket.on("<?php echo Globals::$evt_trdstatusupdate; ?>", function(data) {
                if (typeof data.updatedata !== 'undefined') {
                    var tradingstatus = data.updatedata;
                    $(tradingstatus).each(function(count_i, status) {
                        if (status.client == '<?php echo $client; ?>') {
                            enable_trade = status.trade_enable;
                            clear_bookingterminal();
                            $("#userid").val("");
                            $("#searchname").val("");
                        }
                    });
                }
            });
            var customers = [];
            <?php foreach ($customer as $row) { ?>
                var cusArray = {
                    "customerName": "<?php echo $row['cus_name']; ?>",
                    "customerId": <?php echo $row['cus_id']; ?>,
                    "mobileNo": "<?php echo $row['cus_mobile']; ?>",
                    "companyName": "<?php echo $row['cus_company_name']; ?>"
                };
                customers.push(cusArray);
            <?php } ?>
            var groupname = [];

            $(function() {
                setInterval(function() {
                    updateIndicator();
                }, 5000);
                get_tradingstatus();
                get_tolerance();
                get_data();
            });

            function updateIndicator() {
                var online = navigator.onLine;
                if (online) {
                    if ($.trim(document.getElementById("connectionmsg").innerHTML) != "") {
                        $("#ajax_loader").addClass("show");
                        location.reload();
                    }
                    document.getElementById("connectionmsg").innerHTML = "";
                    document.getElementById("connectionmsg").style.display = "none";
                } else {
                    document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
                    document.getElementById("connectionmsg").style.display = "block";
                }
            }

            function gold_spotrateconversion(con_value, com_weight) {
                return parseFloat((con_value / 1000) * com_weight).toFixed(2);
            }

            function gold_conversion(con_value, com_weight) {
                return parseFloat((con_value / 10) * com_weight).toFixed(2);
            }

            function silver_conversion(con_value, com_weight) {
                return parseFloat((con_value / 1000) * com_weight).toFixed(2);
            }

            function manual_roundoff(round_value, round_method, type) {
                if (round_method == 0) {
                    var convert_value = 0;
                    if (type == 'ask') {
                        convert_value = Math.ceil(round_value);
                    } else {
                        convert_value = Math.floor(round_value);
                    }
                    return parseFloat(convert_value).toFixed(2);
                } else {
                    var convert_value = 0;
                    if (type == 'ask') {
                        convert_value = Math.ceil(round_value / round_method) * round_method;
                    } else {
                        convert_value = Math.floor(round_value / round_method) * round_method;
                    }
                    return parseFloat(convert_value).toFixed(2);
                }

            }

            function fnStartClock() {

                try {
                    refreshData();
                    oInterval = setInterval(refreshData, 800);
                } catch (e) {}
            }

            function refreshData() {
                CallWebServiceFromJquery();
            }

            function CallWebServiceFromJquery() {
                try {
                    jQuery.ajax({
                        type: "POST",
                        url: '<?php echo Globals::$bcurl; ?>',
                        dataType: "text",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({
                            "client": '<?php echo Globals::$bcclient; ?>'
                        }),
                        crossDomain: true,
                        processData: false,
                        success: OnSuccess,
                        error: OnError,
                        cache: false
                    });
                } catch (e) {}

            }

            function OnError(request, status, error) {
                //alert("Webservice Error: " + request.statusText + " " + error);
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

            function OnSuccess(data, status) {
                try {
                    // var $ = jQuery.noConflict();
                    var datetime = getCurrentDateTime();

                    var messagesDesktopp = "";
                    messagesDesktopp = data.split("\n");
                    if (typeof oldData == 'undefined') {
                        oldData = data.toString();
                    }
                    var messagesOldDesktop = oldData.split("\n");
                    for (var i = 0; i < messagesDesktopp.length; i++) {
                        var retDesktop = messagesDesktopp[i].split("\t");
                        var oldRetDesktop;
                        oldRetDesktop = messagesOldDesktop[i].split("\t");
                        if (typeof retDesktop[1] != 'undefined') {
                            if (retDesktop[0] == 3) {
                                var user_changed = flag_userChange;
                                $("#liveratetable").find('tbody > tr').each(function(i, el) {
                                    var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
                                        com_type = parseInt($(this).find('td:last div:eq(1)').html()),
                                        com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
                                        com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
                                        com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
                                        com_roundoff = parseFloat($(this).find('td:last div:eq(26)').html()),
                                        prem_sel_premium = parseFloat($(this).find('td:last div:eq(38)').html()),
                                        prem_buy_premium = parseFloat($(this).find('td:last div:eq(39)').html()),
                                        prem_comsell_active = parseFloat($(this).find('td:last div:eq(40)').html()),
                                        prem_combuy_active = parseFloat($(this).find('td:last div:eq(41)').html());
                                    if (retDesktop[1] == com_id) {

                                        var selling_rate = (com_sel_active && prem_comsell_active) ? (parseFloat(retDesktop[4]) - parseFloat(prem_sel_premium)).toFixed(com_roundoff) : '-';

                                        var buying_rate = (com_buy_active && prem_combuy_active) ? (parseFloat(retDesktop[3]) - parseFloat(prem_buy_premium)).toFixed(com_roundoff) : '-';

                                        if (buying_rate > parseFloat($(this).find('td:eq(1)').html())) {
                                            $(this).find('td:eq(1)').css('color', '#FFFFFF');
                                            $(this).find('td:eq(1)').css('background-color', '#008000');
                                        } else if (buying_rate < parseFloat($(this).find('td:eq(1)').html())) {
                                            $(this).find('td:eq(1)').css('color', '#FFFFFF');
                                            $(this).find('td:eq(1)').css('background-color', '#FF0000');
                                        } else {
                                            $(this).find('td:eq(1)').css('color', '');
                                            $(this).find('td:eq(1)').css('background-color', '');
                                        }
                                        $(this).find('td:eq(1)').html(buying_rate);

                                        if (selling_rate > parseFloat($(this).find('td:eq(2)').html())) {
                                            $(this).find('td:eq(2)').css('color', '#FFFFFF');
                                            $(this).find('td:eq(2)').css('background-color', '#008000');
                                        } else if (selling_rate < parseFloat($(this).find('td:eq(2)').html())) {
                                            $(this).find('td:eq(2)').css('color', '#FFFFFF');
                                            $(this).find('td:eq(2)').css('background-color', '#FF0000');
                                        } else {
                                            $(this).find('td:eq(2)').css('color', '');
                                            $(this).find('td:eq(2)').css('background', '');
                                        }
                                        $(this).find('td:eq(2)').html(selling_rate);

                                        var styleSell = "";
                                        var onclickSell = "";
                                        var styleBuy = "";
                                        var onclickBuy = "";
                                        var tooltip_title = "";
                                        var statusbuy = 0;
                                        var statussell = 0;
                                        var buymoq = 0;
                                        var sellmoq = 0;
                                        var buyClass = "";
                                        var sellClass = "";
                                        var removeSellClass = "";
                                        var removeBuyClass = "";
                                        var prem_buy_premium = 0;
                                        var prem_sel_premium = 0;

                                        // 	if($("#userid").val() != '')
                                        // {
                                        $(trade_status[0]).each(function(j, value) {
                                            if (value.cus_id == $("#userid").val()) {
                                                if (parseInt($(el).find(".com_id").html()) == parseInt(value.trade_status_id)) {
                                                    if (enable_trade == 1) {
                                                        if ((value.trade_status_sell == 1 && !isNaN(selling_rate))) {
                                                            styleSell = "pointer";
                                                            onclickSell = "show_values(this,1)";
                                                            sellClass = "sellEnabled";
                                                            removeSellClass = "sellDisabled";
                                                        } else {
                                                            styleSell = "not-allowed";
                                                            onclickSell = "";
                                                            sellClass = "sellDisabled";
                                                            removeSellClass = "sellEnabled";
                                                        }
                                                        if ((value.trade_status_buy == 1 && !isNaN(buying_rate))) {
                                                            styleBuy = "pointer";
                                                            onclickBuy = "show_values(this,0)";
                                                            buyClass = "buyEnabled";
                                                            removeBuyClass = "buyDisabled";
                                                        } else {
                                                            styleBuy = "not-allowed";
                                                            onclickBuy = "";
                                                            buyClass = "buyDisabled";
                                                            removeBuyClass = "buyEnabled";
                                                        }
                                                        if (value.trade_status_sell == 1 && !isNaN(selling_rate)) {
                                                            statussell = 1;
                                                        } else {
                                                            statussell = 0;
                                                        }
                                                        if (value.trade_status_buy == 1 && !isNaN(buying_rate)) {
                                                            statusbuy = 1;
                                                        } else {
                                                            statusbuy = 0;
                                                        }

                                                        buymoq = value.buymoq;
                                                        sellmoq = value.sellmoq;

                                                    } else {
                                                        styleBuy = "pointer";
                                                        onclickBuy = "trade_disable()";
                                                        styleSell = "pointer";
                                                        onclickSell = "trade_disable()";
                                                        buyClass = "buyDisabled";
                                                        sellClass = "sellDisabled";
                                                        removeSellClass = "sellEnabled";
                                                        removeBuyClass = "buyEnabled";
                                                    }


                                                    prem_buy_premium = value.prem_buy_premium;

                                                    prem_sel_premium = value.prem_sel_premium;
                                                    return false;
                                                }
                                            }
                                        });
                                        // }
                                        $(el).attr('id', $(el).find(".com_id").html());
                                        $(el).find('td:nth-child(2)').attr('onClick', onclickBuy);
                                        $(el).find('td:nth-child(2)').removeClass(removeBuyClass).addClass(buyClass);
                                        $(el).find('td:nth-child(2)').css('cursor', styleBuy);
                                        $(el).find('td:nth-child(3)').attr('onClick', onclickSell);
                                        $(el).find('td:nth-child(3)').removeClass(removeSellClass).addClass(sellClass);
                                        $(el).find('td:nth-child(3)').css('cursor', styleSell);
                                        $(el).find(".statusbuy").html(statusbuy);
                                        $(el).find(".statussell").html(statussell);

                                    }
                                });

                            }
                        }
                    }

                    $("#liveratetable2 tbody").empty();
                    for (var i = 0; i < messagesDesktopp.length; i++) {
                        var retDesktop = messagesDesktopp[i].split("\t");
                        var oldRetDesktop;
                        oldRetDesktop = messagesOldDesktop[i].split("\t");
                        //console.log(oldRetDesktop);
                        if (typeof retDesktop[1] != 'undefined' && (retDesktop[0] == 4 || retDesktop[0] == 1 || retDesktop[0] == 2)) {
                            if (retDesktop[0] == 4) {
                                if ((retDesktop[3] == 0 || retDesktop[4] == 1)) {
                                    market_status = 0;
                                    if (retDesktop[3] == 0) {
                                        document.getElementById("onoffmessage").style.display = "block";
                                        document.getElementById("messagebox").style.display = "none";
                                        document.getElementById("divrate").style.display = "none";
                                    } else if (retDesktop[4] == 1) {
                                        document.getElementById("onoffmessage").style.display = "none";
                                        document.getElementById("divrate").style.display = "none";
                                        document.getElementById("messagebox").style.display = "block";
                                        $("#messageboxtext").html(retDesktop[5]);
                                    }
                                } else {
                                    market_status = 1;
                                    document.getElementById("onoffmessage").style.display = "none";
                                    document.getElementById("messagebox").style.display = "none";
                                    document.getElementById("divrate").style.display = "block";
                                }
                            }

                            if (retDesktop[0] == 1) {
                                if (retDesktop[1] == "SPOT-GOLD") {
                                    if (retDesktop[3] > $("#gold_bid").html()) {
                                        $("#gold_bid").css('color', '#FFFFFF');
                                        $("#gold_bid").css('background-color', '#008000');
                                    } else if (retDesktop[3] < $("#gold_bid").html()) {
                                        $("#gold_bid").css('color', '#FFFFFF');
                                        $("#gold_bid").css('background-color', '#FF0000');
                                    } else {
                                        $("#gold_bid").css('color', '');
                                        $("#gold_bid").css('background-color', '');
                                    }
                                    $("#gold_bid").html(parseFloat(retDesktop[3]).toFixed(2));
                                    if (retDesktop[4] > $("#gold_ask").html()) {
                                        $("#gold_ask").css('color', '#FFFFFF');
                                        $("#gold_ask").css('background-color', '#008000');
                                    } else if (retDesktop[4] < $("#gold_ask").html()) {
                                        $("#gold_ask").css('color', '#FFFFFF');
                                        $("#gold_ask").css('background-color', '#FF0000');
                                    } else {
                                        $("#gold_ask").css('color', '');
                                        $("#gold_ask").css('background-color', '');
                                    }
                                    $("#gold_ask").html(parseFloat(retDesktop[4]).toFixed(2));
                                    if (retDesktop[5] > $("#gold_high").html()) {
                                        $("#gold_high").css('color', '#FFFFFF');
                                        $("#gold_high").css('background-color', '#008000');
                                    } else if (retDesktop[5] < $("#gold_high").html()) {
                                        $("#gold_high").css('color', '#FFFFFF');
                                        $("#gold_high").css('background-color', '#FF0000');
                                    } else {
                                        $("#gold_high").css('color', '');
                                        $("#gold_high").css('background-color', '');
                                    }
                                    $("#gold_high").html(parseFloat(retDesktop[5]).toFixed(2));
                                    if (retDesktop[6] > $("#gold_low").html()) {
                                        $("#gold_low").css('color', '#FFFFFF');
                                        $("#gold_low").css('background-color', '#008000');
                                    } else if (retDesktop[6] < $("#gold_low").html()) {
                                        $("#gold_low").css('color', '#FFFFFF');
                                        $("#gold_low").css('background-color', '#FF0000');
                                    } else {
                                        $("#gold_low").css('color', '');
                                        $("#gold_low").css('background-color', '');
                                    }
                                    $("#gold_low").html(parseFloat(retDesktop[6]).toFixed(2));
                                } else if (retDesktop[1] == "SPOT-SILVER") {
                                    if (retDesktop[3] > $("#silver_bid").html()) {
                                        $("#silver_bid").css('color', '#FFFFFF');
                                        $("#silver_bid").css('background-color', '#008000');
                                    } else if (retDesktop[3] < $("#silver_bid").html()) {
                                        $("#silver_bid").css('color', '#FFFFFF');
                                        $("#silver_bid").css('background-color', '#FF0000');
                                    } else {
                                        $("#silver_bid").css('color', '');
                                        $("#silver_bid").css('background-color', '');
                                    }
                                    $("#silver_bid").html(parseFloat(retDesktop[3]).toFixed(2));
                                    if (retDesktop[4] > $("#silver_ask").html()) {
                                        $("#silver_ask").css('color', '#FFFFFF');
                                        $("#silver_ask").css('background-color', '#008000');
                                    } else if (retDesktop[4] < $("#silver_ask").html()) {
                                        $("#silver_ask").css('color', '#FFFFFF');
                                        $("#silver_ask").css('background-color', '#FF0000');
                                    } else {
                                        $("#silver_ask").css('color', '');
                                        $("#silver_ask").css('background-color', '');
                                    }
                                    $("#silver_ask").html(parseFloat(retDesktop[4]).toFixed(2));
                                    if (retDesktop[5] > $("#silver_high").html()) {
                                        $("#silver_high").css('color', '#FFFFFF');
                                        $("#silver_high").css('background-color', '#008000');
                                    } else if (retDesktop[5] < $("#silver_high").html()) {
                                        $("#silver_high").css('color', '#FFFFFF');
                                        $("#silver_high").css('background-color', '#FF0000');
                                    } else {
                                        $("#silver_high").css('color', '');
                                        $("#silver_high").css('background-color', '');
                                    }
                                    $("#silver_high").html(parseFloat(retDesktop[5]).toFixed(2));
                                    if (retDesktop[6] > $("#silver_low").html()) {
                                        $("#silver_low").css('color', '#FFFFFF');
                                        $("#silver_low").css('background-color', '#008000');
                                    } else if (retDesktop[6] < $("#silver_low").html()) {
                                        $("#silver_low").css('color', '#FFFFFF');
                                        $("#silver_low").css('background-color', '#FF0000');
                                    } else {
                                        $("#silver_low").css('color', '');
                                        $("#silver_low").css('background-color', '');
                                    }
                                    $("#silver_low").html(parseFloat(retDesktop[6]).toFixed(2));
                                } else if (retDesktop[1] == "SPOT-INR") {

                                    if (retDesktop[3] > $("#inr_bid").html()) {
                                        $("#inr_bid").css('color', '#FFFFFF');
                                        $("#inr_bid").css('background-color', '#008000');
                                    } else if (retDesktop[3] < $("#inr_bid").html()) {
                                        $("#inr_bid").css('color', '#FFFFFF');
                                        $("#inr_bid").css('background-color', '#FF0000');
                                    } else {
                                        $("#inr_bid").css('color', '');
                                        $("#inr_bid").css('background-color', '');
                                    }
                                    $("#inr_bid").html(parseFloat(retDesktop[3]).toFixed(2));
                                    if (retDesktop[4] > $("#inr_ask").html()) {
                                        $("#inr_ask").css('color', '#FFFFFF');
                                        $("#inr_ask").css('background-color', '#008000');
                                    } else if (retDesktop[4] < $("#inr_ask").html()) {
                                        $("#inr_ask").css('color', '#FFFFFF');
                                        $("#inr_ask").css('background-color', '#FF0000');
                                    } else {
                                        $("#inr_ask").css('color', '');
                                        $("#inr_ask").css('background-color', '');
                                    }
                                    $("#inr_ask").html(parseFloat(retDesktop[4]).toFixed(2));
                                    if (retDesktop[5] > $("#inr_high").html()) {
                                        $("#inr_high").css('color', '#FFFFFF');
                                        $("#inr_high").css('background-color', '#008000');
                                    } else if (retDesktop[5] < $("#inr_high").html()) {
                                        $("#inr_high").css('color', '#FFFFFF');
                                        $("#inr_high").css('background-color', '#FF0000');
                                    } else {
                                        $("#inr_high").css('color', '');
                                        $("#inr_high").css('background-color', '');
                                    }
                                    $("#inr_high").html(parseFloat(retDesktop[5]).toFixed(2));
                                    if (retDesktop[6] > $("#inr_low").html()) {
                                        $("#inr_low").css('color', '#FFFFFF');
                                        $("#inr_low").css('background-color', '#008000');
                                    } else if (retDesktop[6] < $("#inr_low").html()) {
                                        $("#inr_low").css('color', '#FFFFFF');
                                        $("#inr_low").css('background-color', '#FF0000');
                                    } else {
                                        $("#inr_low").css('color', '');
                                        $("#inr_low").css('background-color', '');
                                    }
                                    $("#inr_low").html(parseFloat(retDesktop[6]).toFixed(2));
                                }
                            }
                            if (retDesktop[0] == 2) {
                                var mcxbidid = "mcxbidnew-" + i;
                                var mcxaskid = "mcxasknew-" + i;
                                var mcxhighid = "mcxhighnew-" + i;
                                var mcxlowid = "mcxlownew-" + i;
                                var tablerow = '<tr class="table2"><td class="ratevaluerightborder"><div class="mcxdesc">' + retDesktop[2] + '</div></td><td class="ratestyle2 rate"><div class="redround1" id="' + mcxbidid + '"><span>' + retDesktop[3] + '</span></div></td><td class="ratestyle2 rate"><div class="redround1" id="' + mcxaskid + '"><span>' + retDesktop[4] + '</span></div></td><td class="ratestyle2"><div class="redround"><span class="mcxhigh" id="' + mcxhighid + '">' + retDesktop[5] + '</span></div></td><td class="ratestyle2"><div class="redround"><span class="mcxlow" id="' + mcxlowid + '">' + retDesktop[6] + '</span></div></td></tr>';

                                $("#liveratetable2 tbody").append(tablerow);

                                if (oldRetDesktop[1] == retDesktop[1]) {
                                    if (parseInt(oldRetDesktop[3]) > parseInt(retDesktop[3])) {
                                        $("#" + mcxbidid).css('color', '#FFFFFF');
                                        $("#" + mcxbidid).css('background-color', '#FF0000');
                                    } else if (parseInt(oldRetDesktop[3]) < parseInt(retDesktop[3])) {
                                        $("#" + mcxbidid).css('color', '#FFFFFF');
                                        $("#" + mcxbidid).css('background-color', '#008000');
                                    } else {
                                        $("#" + mcxbidid).css('color', '');
                                        $("#" + mcxbidid).css('background-color', '');
                                    }
                                    if (parseInt(oldRetDesktop[4]) > parseInt(retDesktop[4])) {
                                        $("#" + mcxaskid).css('color', '#FFFFFF');
                                        $("#" + mcxaskid).css('background-color', '#FF0000');
                                    } else if (parseInt(oldRetDesktop[4]) < parseInt(retDesktop[4])) {
                                        $("#" + mcxaskid).css('color', '#FFFFFF');
                                        $("#" + mcxaskid).css('background-color', '#008000');
                                    } else {
                                        $("#" + mcxaskid).css('color', '');
                                        $(mcxaskid).css('background-color', '');
                                    }
                                    if (parseInt(oldRetDesktop[5]) > parseInt(retDesktop[5])) {
                                        $("#" + mcxhighid).css('color', '#FFFFFF');
                                        $("#" + mcxhighid).css('background-color', '#FF0000');
                                    } else if (parseInt(oldRetDesktop[5]) < parseInt(retDesktop[5])) {
                                        $("#" + mcxhighid).css('color', '#FFFFFF');
                                        $("#" + mcxhighid).css('background-color', '#008000');
                                    } else {
                                        $("#" + mcxhighid).css('color', '');
                                        $("#" + mcxhighid).css('background-color', '');
                                    }
                                    if (parseInt(oldRetDesktop[6]) > parseInt(retDesktop[6])) {
                                        $("#" + mcxlowid).css('color', '#FFFFFF');
                                        $("#" + mcxlowid).css('background-color', '#FF0000');
                                    } else if (parseInt(oldRetDesktop[6]) < parseInt(retDesktop[6])) {
                                        $("#" + mcxlowid).css('color', '#FFFFFF');
                                        $("#" + mcxlowid).css('background-color', '#008000');
                                    } else {
                                        $("#" + mcxlowid).css('color', '');
                                        $("#" + mcxlowid).css('background-color', '');
                                    }
                                }
                            }
                        }
                    }
                    if (user_changed == 1) {
                        show_firstCommodity();
                        user_changed = 0;
                        flag_userChange = 0;
                    }
                    oldData = data.toString();

                } catch (e) {}
            }
            $(document).ready(function() {
                fnStartClock();
            });

            /* for online trade */
            var trade_status = [];
            var allMargins = [];
            var enable_trade = 0;
            var flag_userChange = 0;
            var is_newrequest = false;
            var removed_commodities = [];
            var orderData = {};
            var orders = [];
            var timer, timer_status, timer_flag = 0;
            $(function() {
                $('#userid').change(function() {
                    console.log("userid");
                    flag_userChange = 1;
                    var cusID = $(this).val();
                    $("#usergroup").val("Default");
                    $("#book_cusid").val(cusID);
                    $("#avail_margin").html("");
                    $(allMargins).each(function(k, margins) {
                        if (margins.cus_id == $("#userid").val()) {
                            $("#avail_margin").html(margins.margin_amt);
                            return false;
                        }
                    });
                });
                $('input[type=radio][name=request_type]').change(function() {
                    if (this.value == 0) {
                        $('.ordervalue').css('display', 'none');
                        $('#book_rate').attr('readonly', true);
                        $('.limitno').css('display', 'none');
                        document.getElementById("book_qty").focus();
                        if ($("#buy_type").is(":checked"))
                            $("#buy_sell").html('BUY');
                        else
                            $("#buy_sell").html('SELL');
                    } else if (this.value == 1) {
                        $('#book_rate').attr('readonly', true);
                        $('.ordervalue').css('display', 'block');
                        $('.limitno').css('display', 'none');
                        $("#buy_sell").html('PLACE LIMIT');
                        document.getElementById("order_taken_qty").value = "";
                        document.getElementById("order_taken_rate").value = "";
                        document.getElementById("order_bookno").value = "";
                        $('#order_rate').val("");
                        $('#limitno').val(-1);
                        $('#book_qty').focus();
                        $('#livePrice').prop("checked", true);
                    }
                });
                $('input[type=radio][name=buysell_type]').change(function() {
                    show_firstCommodity();
                });
                // --- Real-time min/max enforcement on numeric inputs ---
                // Helper: enforce max whole digits and max decimal places
                function enforceNumericLimits(el, maxWholeDigits, maxDecimals) {
                    var val = el.val();
                    if (val === '' || val === null) return;
                    // Remove any negative values
                    if (parseFloat(val) < 0) {
                        el.val('');
                        return;
                    }
                    var parts = val.split('.');
                    // Truncate whole part
                    if (parts[0] && parts[0].replace(/^0+/, '').length > maxWholeDigits) {
                        parts[0] = parts[0].substring(0, maxWholeDigits);
                    }
                    // Truncate decimal part
                    if (parts.length > 1 && parts[1].length > maxDecimals) {
                        parts[1] = parts[1].substring(0, maxDecimals);
                    }
                    var newVal = parts.join('.');
                    // Only update if value actually changed to preserve cursor position
                    if (newVal !== val) {
                        el.val(newVal);
                    }
                }

                $(document).on('input', '#book_qty', function() {
                    enforceNumericLimits($(this), 5, 3); // max 99999, 3 decimal places
                });

                $(document).on('input', '#order_rate', function() {
                    enforceNumericLimits($(this), 7, 2); // max 9999999, 2 decimal places
                });

                $(document).on('input', '#book_totamt', function() {
                    enforceNumericLimits($(this), 10, 2); // max 9999999999, 2 decimal places
                });

                $(document).on('input', '#book_rate', function() {
                    enforceNumericLimits($(this), 7, 2); // max 9999999, 2 decimal places
                });

                // Block minus key, 'e', '+' on all trading terminal number inputs
                $(document).on('keydown', '#book_qty, #order_rate, #book_totamt, #book_rate', function(e) {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                        e.preventDefault();
                    }
                });

                // Sanitize pasted content on numeric inputs
                $(document).on('paste', '#book_qty, #order_rate, #book_totamt, #book_rate', function(e) {
                    var el = $(this);
                    setTimeout(function() {
                        var val = el.val().replace(/[^0-9.]/g, ''); // strip non-numeric chars
                        // Keep only first decimal point
                        var dotIndex = val.indexOf('.');
                        if (dotIndex !== -1) {
                            val = val.substring(0, dotIndex + 1) + val.substring(dotIndex + 1).replace(/\./g, '');
                        }
                        el.val(val);
                        el.trigger('input'); // re-trigger to apply limits
                    }, 0);
                });

                // Comment field: enforce maxlength via JS (insurance for maxlength attribute)
                $(document).on('input', '#book_usercomment', function() {
                    if ($(this).val().length > 100) {
                        $(this).val($(this).val().substring(0, 100));
                    }
                });

                // Customer Name: allow only letters, numbers, spaces, hyphens
                $(document).on('input', '#searchname', function() {
                    var cleaned = $(this).val().replace(/[^a-zA-Z0-9\s\-]/g, '');
                    if (cleaned !== $(this).val()) {
                        $(this).val(cleaned);
                    }
                });
                $("body").on("click", "#remark_submit", function() {
                    var remarks = $("#remarks").val();
                    var remarks_bookNo = $("#remarks_bookno").val();
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "<?php echo $this->config->item('base_url'); ?>index.php/c_phonebooking/add_remarks",
                        data: "book_no=" + remarks_bookNo + "&remarks=" + remarks,
                        success: function(data) {
                            if (data.status == 1) {
                                console.log("Remarks updated successfully");
                            } else {
                                console.log("Error occured in updating remarks");
                            }
                        },
                        error: function(request, error) {
                            console.log(error);
                        }
                    });
                });

                $("body").on("keyup", "#searchname", function(e) {

                    if (e.keyCode == 40 || e.keyCode == 38) {
                        var input = $('#username');
                        var current_index = $('.searchSelected').index();
                        var autocomp_list = $('#autocomp_list');
                        var options = autocomp_list.find('.autocomp_data');
                        var items_total = options.length;

                        input.val(current_index);

                        if (e.keyCode == 40) {
                            if (current_index + 1 < items_total) {
                                current_index++;
                                change_selection(current_index);
                            }
                        } else if (e.keyCode == 38) {
                            if (current_index > 0) {
                                current_index--;
                                change_selection(current_index);
                            }
                        }
                    } else if (e.keyCode == 13) {
                        var autocomplete_values = $(".autocomp_data");
                        $(autocomplete_values).each(function(index, value) {
                            if ($(value).hasClass("searchSelected")) {
                                var searchSelectedId = $(value).attr("data-searchId");
                                var searchSelectedName = $(value).html();
                                $("#userid").val(searchSelectedId);
                                $("#searchname").val(searchSelectedName);
                                $('#autocomp_list').empty();
                                $('#autocomp_list').css('display', 'none');
                                flag_userChange = 1;
                                $("#usergroup").val("Default");
                                $("#book_cusid").val(searchSelectedId);
                                $("#avail_margin").html(0.00);
                                get_tradingstatus();
                                $(allMargins).each(function(k, margins) { // BZ-17 fix: allMargins is now flat
                                    if (margins.cus_id == $("#userid").val()) {
                                        $("#avail_margin").html(margins.margin_amt);
                                        return false;
                                    }
                                });
                                return false;
                            }
                        });
                    } else if (e.keyCode == 27) {
                        $('#autocomp_list').empty();
                        $('#autocomp_list').css('display', 'none');
                    } else {
                        var searchedArray = [];
                        var returnArray = [];
                        var searchValue = $.trim($(this).val()).toUpperCase();
                        var matchedItems = 0;
                        if (searchValue.length >= 2 && matchedItems <= 5) {
                            $(customers).each(function(index, value) {
                                var searchName = value.customerName;
                                var matchName = $.trim(searchName).toUpperCase().indexOf(searchValue) == 0;
                                if (matchName) {
                                    var returnArray = {
                                        "searchedName": value.customerName,
                                        "searchedmobileNo": value.mobileNo,
                                        "searchedId": value.customerId
                                    };
                                    searchedArray.push(returnArray);
                                    matchedItems++;
                                } else {
                                    var searchmobileNo = value.mobileNo;
                                    var matchmobileNo = $.trim(searchmobileNo).toUpperCase().indexOf(searchValue) == 0;
                                    if (matchmobileNo) {
                                        var returnArray = {
                                            "searchedName": value.customerName,
                                            "searchedmobileNo": value.mobileNo,
                                            "searchedId": value.customerId
                                        };
                                        searchedArray.push(returnArray);
                                        matchedItems++;
                                    }
                                }
                            });
                        }

                        var myEl = $('#autocomp_list');
                        var items = false;
                        myEl.empty();
                        if (searchedArray.length > 0) {
                            $(searchedArray).each(function(index, value) {
                                if (index == 0)
                                    var appendval = "<div class='autocomp_data searchSelected' data-searchId='" + value.searchedId + "' >" + value.searchedName + " - " + value.searchedmobileNo + "</div>";
                                else
                                    var appendval = "<div class='autocomp_data' data-searchId='" + value.searchedId + "'>" + value.searchedName + " - " + value.searchedmobileNo + "</div>";

                                myEl.append(appendval);
                                items = true;
                            });
                            myEl.slideDown("fast");
                            //myEl.css('display','block');
                        } else {
                            myEl.css('display', 'none');
                        }
                    }
                });

                $("body").on("mousedown", ".autocomp_data", function(e) {
                    var searchSelectedId = $(this).attr("data-searchId");
                    var searchSelectedName = $(this).html();
                    $("#userid").val(searchSelectedId);
                    $("#searchname").val(searchSelectedName);
                    get_tradingstatus();
                    $('#autocomp_list').empty();
                    $('#autocomp_list').css('display', 'none');
                    flag_userChange = 1;
                    $("#usergroup").val("Default");
                    $("#book_cusid").val(searchSelectedId);
                    $("#avail_margin").html("");
                    $(allMargins).each(function(k, margins) { // BZ-17 fix: allMargins is now flat
                        if (margins.cus_id == $("#userid").val()) {
                            $("#avail_margin").html(margins.margin_amt);
                            return false;
                        }
                    });
                });
                $("body").on("blur", "#searchname", function(e) {
                    $('#autocomp_list').empty();
                    $('#autocomp_list').css('display', 'none');
                });
                $("body").on("keyup", "#book", function(e) {
                    if (e.keyCode == 13) {
                        customer_request(0);
                    }
                });
                $("#manualRate").click(function() {
                    enable_editRates();
                });
                $("#livePrice").click(function() {
                    enable_editRates();
                });
                $('#status_modal').on('hidden.bs.modal', function() {
                    $("#searchname").focus();
                });
                $("#limitno").on('change', function() {
                    document.getElementById("order_taken_qty").value = "";
                    document.getElementById("order_taken_rate").value = "";
                    document.getElementById("order_bookno").value = "";
                    $('#order_rate').val("");
                    $('#book_qty').val("");
                    $(orders).each(function(index, value) {

                        if (parseInt(value.order_bookno) == parseInt($("#limitno").val())) {
                            document.getElementById("order_taken_qty").value = value.order_taken_qty;
                            document.getElementById("order_taken_rate").value = value.order_taken_rate;
                            document.getElementById("order_bookno").value = value.order_bookno;
                            $('#order_rate').val($('#order_taken_rate').val());
                            $('#book_qty').val($('#order_taken_qty').val());
                        }

                    });
                });
                $("#book_comname").on('change', function(value) {
                    var book_comid = $(this).val();
                    change_commodity(book_comid);
                });
                $("body").on("click", "#show_all_comm", function() {
                    var com_ids = "";
                    customerCommodities(com_ids);
                });
                $("#searchname").focus();
            });

            function change_selection(current_index) {
                var autocomp_options = $('#autocomp_list').find('.autocomp_data');
                autocomp_options.removeClass('searchSelected');
                autocomp_options.eq(current_index).addClass('searchSelected');
                var search_term = autocomp_options.eq(current_index).html();
                $('#username').val(search_term);
            }

            function enable_editRates() {
                if ($("#livePrice").is(":checked")) {
                    $('#book_rate').attr('readonly', true);
                    document.getElementById('book_rate').style.background = "#EEE";
                } else if ($("#manualRate").is(":checked")) {
                    if (!$("#new_ordertype").is(":checked")) {
                        $('#book_rate').attr('readonly', false);
                        document.getElementById('book_rate').style.background = "#FFF";
                    } else {
                        $("#livePrice").prop('checked', true);
                    }
                }
            }

            function show_firstCommodity() {
                var has_commodity = false;
                var type = $("#buy_type").is(":checked") ? 1 : 0;
                if (type == 1) {
                    $.each($("#liveratetable tbody tr"), function(index, value) {
                        if ($(value).find('.statussell').html() == 1) {
                            var rateid = $(value).find('td:nth-child(2)').attr('id');
                            show_values(document.getElementById(rateid), type);
                            has_commodity = true;
                            return false;
                        }
                    });
                } else {
                    $.each($("#liveratetable tbody tr"), function(index, value) {
                        if ($(value).find('.statusbuy').html() == 1) {
                            var rateid = $(value).find('td:nth-child(3)').attr('id');
                            show_values(document.getElementById(rateid), type);
                            has_commodity = true;
                            return false;
                        }
                    });
                }
                if (!has_commodity && $("#userid").val() != "") {
                    clear_bookingterminal();
                    $("#userid").val("");
                    $("#searchname").val("");
                    $("#avail_margin").html(0.00);
                    alert("No active commodities found with this type. Check whether trading is enabled and commodities are active.");
                }
            }

            function change_commodity(book_comid) {
                $.each($("#liveratetable tbody tr"), function(index, value) {
                    var com_id = $(value).find('.com_id').html();
                    if (com_id == book_comid) {
                        var type = $("#buy_type").is(":checked") ? 1 : 0;
                        if (type == 1) {
                            var rateid = $(value).find('td:nth-child(2)').attr('id');
                        } else {
                            var rateid = $(value).find('td:nth-child(3)').attr('id');
                        }
                        show_values(document.getElementById(rateid), type);
                        return false;
                    }
                });
            }

            function get_tradingstatus() {
                trade_status_id = [];
                trade_status = [];
                allMargins = [];
                enable_trade = 0;
                $.ajax({
                    type: "POST",
                    async: false,
                    dataType: "json",
                    data: {
                        'cus_id': $("#userid").val()
                    },
                    url: "<?php echo $this->config->item('base_url'); ?>index.php/c_phonebooking/get_tradingstatus",
                    success: function(data) {
                        trade_status.push(data.records.status);
                        allMargins = data.allMargins || []; // BZ-17 fix: was .push() causing double-nesting [[...]]
                        enable_trade = data.records.trade_enable;
                        trade_amountpurch = data.trade_amountpurch;
                        var limit_enable = data.records.limit_enable;
                        var clientlimit_enable = data.records.clientlimit_enable;
                        var cus_limitenable = data.records.cus_limitenable;

                        if (limit_enable == 0 || clientlimit_enable == 0 || cus_limitenable == 0) {
                            $("#new_ordertype").attr("disabled", true);
                            if ($("#new_ordertype").is(":checked")) {
                                $("#new_booktype").prop("checked", true).trigger('change');
                            }
                        } else {
                            $("#new_ordertype").attr("disabled", false);
                        }
                        if (data.commoditydetails.length > 0) {
                            $("#liveratetable tbody").empty();
                        }

                        $.each(data.commoditydetails, function(idx, commodity) {

                            if (commodity.com_is_coin != 1) {
                                if (commodity.prem_comsell_active == 1 || commodity.prem_combuy_active == 1) {
                                    var tablerow = '<tr class=""><td class="roundTopLeft rateTitle com_name">' + commodity.com_name + '</td><td class="buy_rates" id="buy_rates[' + idx + ']" ></td><td id="sell_rates[' + idx + ']" class="sell_rates"></td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="prem_sel_premium">' + commodity.prem_sel_premium + '</div><div class="prem_buy_premium">' + commodity.prem_buy_premium + '</div><div class="prem_comsell_active">' + commodity.prem_comsell_active + '</div><div class="prem_combuy_active">' + commodity.prem_combuy_active + '</div></td></tr>';
                                    $("#liveratetable tbody").append(tablerow);
                                }
                            }
                        });
                    },
                    error: function(request, error) {
                        console.log(error);
                    }
                });
            }

            function commodity_update(searchSelectedId) {
                var url = "<?php echo $this->config->item('base_url'); ?>index.php/C_phonebooking/get_tradingstatus1?userid=" + searchSelectedId;
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    data: "",
                    async: false,
                    success: function(data) {
                        console.log("commodityDetails", data.commodity);
                        console.log("ContractDetails", data.contracts);
                        console.log(data);
                        if (data.commoditydetails.length > 0) {
                            $("#liveratetable tbody").empty();
                        }

                        $.each(data.commoditydetails, function(idx, commodity) {

                            if (commodity.com_is_coin != 1) {
                                if (commodity.prem_comsell_active == 1 || commodity.prem_combuy_active == 1) {
                                    var tablerow = '<tr class=""><td class="roundTopLeft rateTitle com_name">' + commodity.com_name + '</td><td class="buy_rates" id="buy_rates[' + idx + ']" ></td><td id="sell_rates[' + idx + ']" class="sell_rates"></td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="prem_sel_premium">' + commodity.prem_sel_premium + '</div><div class="prem_buy_premium">' + commodity.prem_buy_premium + '</div><div class="prem_comsell_active">' + commodity.prem_comsell_active + '</div><div class="prem_combuy_active">' + commodity.prem_combuy_active + '</div></td></tr>';
                                    $("#liveratetable tbody").append(tablerow);
                                }
                            }
                        });
                    },
                    error: function(request, error) {
                        console.log(error);
                    }
                });
            }

            function clear_bookingterminal() {
                cleartime();
                $("#book_comname").html("");
                $("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
                $("#order_rate").val("");
                $("#rate_disp").html("Rate");
                $("#book_totalcost").val("");
                $('#limitno').find('option:gt(0)').remove();
                $(".button-row").removeClass("atv_btn");
                $("#book").css("display", "block");
                $("#buy_sell").html("BUY/SELL");
                $(".maxmin").html("");
                $(".rateval").html("0.00");
                $(".rateval_update").html("0.00");
                $(".ordervalue").css("display", "none");
                $('.limitno').css('display', 'none');
                $("#new_booktype").prop('checked', true);
                $("#liveratetable tbody tr").css('background', '#FFF');
                $("#book_rate").val("");
                $("#book_rate").attr("readonly", true);
                $('#book_rate').css('background', "#EEE");
                $('.qty_type').html("");
                $('.displayLotSize').html("");
                $('#book_usercomment').val("");
                $("#book_totamt").val("");
                $('#book_qty').val("");
            }

            function CurrencyFormatted(nStr) {
                nStr += '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }

            function customer_request() {

                // --- Helper to show validation error ---
                function showError(msg) {
                    $("#ajax_loader").removeClass("show");
                    document.getElementById("book").style.display = "block";
                    showToast(msg, 'danger');
                }

                $("#ajax_loader").addClass("show");

                // 1. Validate user is selected
                var userid_val = $("#userid").val();
                if (!userid_val || userid_val == "") {
                    showError("Please select a customer first.");
                    return;
                }

                // 2. Validate commodity is selected
                var book_comid_val = $("#book_comid").val();
                if (!book_comid_val || book_comid_val == "") {
                    showError("Please select a commodity first.");
                    return;
                }

                // 3. Validate rate is available
                var book_rate_val = parseFloat($("#book_rate").val());
                if (isNaN(book_rate_val) || book_rate_val <= 0) {
                    showError("Rate is not available. Please wait for live rates.");
                    return;
                }

                if ($('#new_booktype').is(':checked')) {
                    var request_type = 0;
                } else if ($('#new_ordertype').is(':checked')) {
                    var request_type = 1;
                }

                // 4. Validate order rate for Limit Order
                if (request_type == 1) {
                    var order_rate_val = parseFloat($("#order_rate").val());
                    if (isNaN(order_rate_val) || order_rate_val <= 0) {
                        showError("Please enter a valid order rate.");
                        return;
                    }
                }

                if ($('#deal_typeweight').is(':checked')) {
                    var request_amt_wt = 0;
                } else if ($('#deal_typeamount').is(':checked')) {
                    var request_amt_wt = 1;
                }

                // 5. Validate qty / amount based on trade mode
                if (request_amt_wt == 1) {
                    var raw_amt = parseFloat($("#book_totamt").val());
                    if (isNaN(raw_amt) || raw_amt <= 0) {
                        showError("Please enter a valid amount.");
                        return;
                    }
                } else {
                    var raw_qty = parseFloat($("#book_qty").val());
                    if (isNaN(raw_qty) || raw_qty <= 0) {
                        showError("Please enter a valid quantity.");
                        return;
                    }
                }

                if (request_amt_wt == 1) {
                    var booked_qty = parseFloat($("#book_qty").val());
                } else {
                    if ($("#bar_selection").val() == 1) {
                        var booked_qty = parseFloat($("#book_qty").val()) / parseFloat(document.getElementById('book_barquantity').value);
                    } else {
                        var booked_qty = parseFloat($("#book_qty").val());
                    }
                }

                var book_cusid = document.getElementById("book_cusid").value;
                var book_comid = document.getElementById("book_comid").value;
                var book_comtype = document.getElementById("book_comtype").value;
                var book_comname = $("#book_comname option:selected").text();
                var book_type = document.getElementById("book_type").value;
                var book_no_bar = booked_qty;
                var margin = document.getElementById("margin").value;
                var margin_type = document.getElementById("margin_type").value;
                var book_commweight = parseFloat(document.getElementById('book_comweight').value);
                var book_rate = parseFloat(document.getElementById("book_rate").value);
                var book_usercomment = document.getElementById("book_usercomment").value;
                var com_bar_type = document.getElementById("com_bar_type").value;
                var qty_conversion = (com_bar_type == 1 ? 1 : 1000);
                var discount_amt = document.getElementById("discount_amt").value;
                var discount_actual = document.getElementById("discount_amt").value;
                //var book_qty   		= parseFloat(parseFloat(booked_qty)*parseFloat(document.getElementById('book_barquantity').value)/qty_conversion).toFixed(6);

                if (request_amt_wt == 1) {
                    if (request_type == 1) {
                        var book_rate = parseFloat(document.getElementById("order_rate").value);
                    } else {
                        var book_rate = document.getElementById("book_rate").value;
                    }

                    var book_totalcost = document.getElementById("book_totamt").value;
                    var bookgrm_rate = parseFloat(book_rate) / parseFloat(book_commweight);
                    var book_qty = parseFloat((parseFloat(book_totalcost) / parseFloat(bookgrm_rate)) * (document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);

                } else {
                    var book_qty = parseFloat(parseFloat(booked_qty) * parseFloat(document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);
                    if (request_type == 1) {
                        var book_rate = parseFloat(document.getElementById("order_rate").value);

                        var book_totalcost = parseFloat(Math.round((book_rate / book_commweight) * (book_qty * 1000)));
                        discount_amt = parseFloat(Math.round((discount_amt / book_commweight) * (book_qty * 1000)));

                    } else {
                        var book_rate = document.getElementById("book_rate").value;

                        var book_totalcost = parseFloat(Math.round((book_rate / book_commweight) * (book_qty * 1000)));
                        discount_amt = parseFloat(Math.round((discount_amt / book_commweight) * (book_qty * 1000)));

                    }
                }


                /* if(request_type == 1) {
                	var book_rate  		= parseFloat(document.getElementById("order_rate").value);
                	var book_totalcost = parseFloat(Math.round((book_rate/book_commweight)  *  (book_qty * 1000)));
                } */

                if ($("#manualRate").is(":checked")) {
                    var book_liveprice = $("#liveprice").val();
                } else {
                    var book_liveprice = "";
                }
                //request_amt_wt = 0;
                document.getElementById("book").style.display = "none";
                cleartime();

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "<?php echo $this->config->item('base_url'); ?>index.php/c_phonebooking/booking_request",
                    data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_qty=" + book_qty + "&book_rate=" + book_rate +
                        "&book_type=" + book_type + "&book_comweight=" + book_commweight + "&book_totalcost=" + book_totalcost + "&book_no_bar=" + book_no_bar + "&margin=" + margin + "&margin_type=" + margin_type + "&request_type=" + request_type + "&book_comtype=" + book_comtype + "&book_liveprice=" + book_liveprice + "&com_bar_type=" + com_bar_type + "&request_amt_wt=" + request_amt_wt + "&book_usercomment=" + book_usercomment + "&discount_amt=" + discount_amt + "&discount_actual=" + discount_actual + "&book_deliverydate=" + $('.displaydate').html(),
                    success: function(data) {
                        $("#ajax_loader").removeClass("show");
                        if (data.status == true && data.success == true) {
                            showToast(data.message, 'success');
                            notifyBooking(data.book_no);
                        } else {
                            showToast(data.message, 'danger');
                        }
                        $("#userid").val("");
                        $("#searchname").val("");
                        $("#avail_margin").html("");
                        $("#searchname").focus();
                        clear_bookingterminal();
                        get_tradingstatus();
                        get_data();
                    },
                    error: function(xhr, status, error) {
                        $("#ajax_loader").removeClass("show");
                        document.getElementById("book").style.display = "block";
                        showToast("Booking failed. Please try again. (" + status + ")", 'danger');
                        console.error("Booking AJAX error:", status, error);
                        clear_bookingterminal();
                    }
                });
            }

            function notifyBooking(book_no) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "<?php echo $this->config->item('base_url'); ?>index.php/c_phonebooking/notifyBooking",
                    data: "book_no=" + book_no,
                    success: function(data) {

                    }
                });
            }

            function calculateTotal(row, is_buy, is_sell) {
                var comid = document.getElementById("book_comtype").value;
                var com_weight = parseFloat(document.getElementById('book_comweight').value);
                var available_margin = parseFloat($("#avail_margin").html());
                var book_bar_qty = parseFloat(document.getElementById('book_barquantity').value);
                var discount_amt = parseFloat(document.getElementById('discount_amt').value);
                var order_rate = parseFloat(document.getElementById("order_rate").value);
                var book_rate = parseFloat(document.getElementById("book_rate").value);
                var deal_typeamount = parseFloat($("#deal_typeamount").val());
                var deal_typeweight = parseFloat($("#deal_typeweight").val());

                if ($('#deal_typeamount').is(':checked')) {
                    var request_amt_wt = 1;
                } else if ($('#deal_typeweight').is(':checked')) {
                    var request_amt_wt = 0;
                }

                var hightol = 0;
                var lowtol = 0;
                var book_totalcost = 0;
                var book_marginhold = 0;

                var liveprice = $("#liveprice").val();
                if (request_amt_wt == 1) {
                    if ($("#bar_selection").val() == 1) {
                        var book_qty = parseFloat($("#book_qty").val()) / book_bar_qty;
                    } else {
                        var book_qty = parseFloat($("#book_qty").val());
                    }
                } else {
                    if ($("#bar_selection").val() == 1) {
                        var book_qty = parseFloat($("#book_qty").val()) / book_bar_qty;
                    } else {
                        var book_qty = parseFloat($("#book_qty").val());
                    }
                }
                if ($('#new_booktype').is(':checked')) {
                    var request_type = 0;
                } else if ($('#new_ordertype').is(':checked')) {
                    var request_type = 1;
                }

                if ($("#book_comtype").val() == 0) {
                    if ($("#gold_high_tol").val() != 0) {
                        hightol = Math.round(parseFloat(liveprice) + (parseFloat(liveprice) * parseFloat($("#gold_high_tol").val()) / 100));
                    } else {
                        hightol = liveprice;
                    }
                    if ($("#gold_low_tol").val() != 0) {
                        lowtol = Math.round(parseFloat(liveprice) - (parseFloat(liveprice) * parseFloat($("#gold_low_tol").val()) / 100));
                    } else {
                        lowtol = liveprice;
                    }
                } else if ($("#book_comtype").val() == 1) {
                    if ($("#silver_high_tol").val() != 0) {
                        hightol = Math.round(parseFloat(liveprice) + (parseFloat(liveprice) * parseFloat($("#silver_high_tol").val()) / 100));
                    } else {
                        hightol = liveprice;
                    }
                    if ($("#silver_low_tol").val() != 0) {
                        lowtol = Math.round(parseFloat(liveprice) - (parseFloat(liveprice) * parseFloat($("#silver_low_tol").val()) / 100));
                    } else {
                        lowtol = liveprice;
                    }
                }
                if (request_amt_wt == 0) {
                    $('.deal_totalamt').css('display', 'none');
                    var number = $("#book_qty").val().toString();
                    var allowed_decimals = $("#allowed_decimals").val();
                    var arr_num = number.split('.');
                    var after_decimal = true;

                    if (typeof arr_num[1] !== 'undefined' && !isNaN(arr_num[1]) && arr_num[1] != '') {
                        if (arr_num[1].length > allowed_decimals) {
                            after_decimal = false;
                        }
                    }
                    if (parseFloat(number) > 0 && after_decimal == true && ((request_type == 1) ? !isNaN(order_rate) && order_rate > 0 : true)) {
                        if (book_qty > 0) {
                            var qty_conversion = $("#com_bar_type").val() == 1 ? 1000 : 1;
                            if (request_type == 1) {
                                if (order_rate != "" && book_qty != "") {
                                    book_totalcost = parseFloat(Math.round((order_rate / com_weight) * (book_qty * book_bar_qty * qty_conversion)));
                                }
                            } else {
                                book_totalcost = parseFloat(Math.round((book_rate / com_weight) * (book_qty * book_bar_qty * qty_conversion)));
                            }

                            document.getElementById("book_totalcost").value = isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2);

                            if ((request_type == 1) ? ((hightol != 0 ? order_rate <= hightol : true) && (lowtol != 0 ? order_rate >= lowtol : true)) : ((hightol != 0 ? book_rate <= hightol : true) && (lowtol != 0 ? book_rate >= lowtol : true))) {
                                document.getElementById("book").style.display = "block";
                            } else {
                                document.getElementById("book").style.display = "none";
                            }
                        } else {
                            document.getElementById("book").style.display = "none";
                            document.getElementById("book_totalcost").value = "0.00";
                        }
                    } else {
                        if (!parseFloat(number) > 0 || !after_decimal) {
                            if ($("#bar_selection").val() == 0) {
                                $("#book_qty").val("");
                            }
                            document.getElementById("book_totalcost").value = "0";
                            document.getElementById("book").style.display = "none";
                        }
                        if (request_type == 1) {
                            if (order_rate == '' || isNaN(order_rate) || order_rate < 0) {
                                document.getElementById("book").style.display = "none";
                                document.getElementById("order_rate").value = '';
                                document.getElementById("book_totalcost").value = "0";
                            }
                        }
                    }
                } else if (request_amt_wt == 1) {
                    $('.deal_totalamt').css('display', 'flex');
                    var number = $("#book_qty").val().toString();
                    var book_totamt = parseFloat($("#book_totamt").val());
                    var book_totamt = isNaN(book_totamt) ? 0 : book_totamt;
                    var allowed_decimals = $("#allowed_decimals").val();
                    var arr_num = number.split('.');
                    var after_decimal = true;

                    if (after_decimal == true && ((request_type == 1) ? !isNaN(order_rate) && order_rate > 0 : true)) {
                        if (book_totamt > 0) {
                            var qty_conversion = $("#com_bar_type").val() == 1 ? 1000 : 1;
                            if (request_type == 1) {
                                if (order_rate != "" && book_totamt != "") {
                                    //book_totalcost = parseFloat(Math.round((order_rate/com_weight)  *  (book_qty * book_bar_qty * qty_conversion)));
                                    var bookgrm_rate = parseFloat(order_rate) / parseFloat(com_weight);
                                    var totalqty = document.getElementById("book_qty").value = parseFloat((parseFloat(book_totamt) / parseFloat(bookgrm_rate)) * book_bar_qty / qty_conversion).toFixed(3);
                                    book_totalcost = book_totamt;
                                }
                            } else {
                                //book_totalcost = parseFloat(Math.round((book_rate/com_weight)  *  (book_qty * book_bar_qty * qty_conversion)));
                                var bookgrm_rate = parseFloat(book_rate) / parseFloat(com_weight);

                                var totalqty = document.getElementById("book_qty").value = parseFloat((parseFloat(book_totamt) / parseFloat(bookgrm_rate)) * book_bar_qty / qty_conversion).toFixed(3);
                                book_totalcost = book_totamt;
                            }

                            document.getElementById("book_totalcost").value = isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2);

                            if ((request_type == 1) ? ((hightol != 0 ? order_rate <= hightol : true) && (lowtol != 0 ? order_rate >= lowtol : true)) : ((hightol != 0 ? book_rate <= hightol : true) && (lowtol != 0 ? book_rate >= lowtol : true))) {
                                document.getElementById("book").style.display = "block";
                            } else {
                                document.getElementById("book").style.display = "none";
                            }
                        } else {
                            document.getElementById("book").style.display = "none";
                            document.getElementById("book_totalcost").value = "0.00";
                        }
                    } else {
                        if (!parseFloat(number) > 0 || !after_decimal) {
                            if ($("#bar_selection").val() == 0) {
                                $("#book_qty").val("");
                            }
                            document.getElementById("book_totalcost").value = "0";
                            document.getElementById("book").style.display = "none";
                        }
                        if (request_type == 1) {
                            if (order_rate == '' || isNaN(order_rate) || order_rate < 0) {
                                document.getElementById("book").style.display = "none";
                                document.getElementById("order_rate").value = '';
                                document.getElementById("book_totalcost").value = "0";
                            }
                        }
                    }
                }
            }

            function show_values() {
                clear_bookingterminal();
                var is_sell = 0;
                var is_buy = 0;
                $("#ajax_loader").addClass("show");
                $("#activate_terminal").css("display", "none");

                if (parseInt(arguments[1]) == 0) {
                    $("#sell_type").prop("checked", true);
                    is_sell = $($(arguments[0]).parent()).find('.statusbuy').html();
                }
                if (parseInt(arguments[1]) == 1) {
                    $("#buy_type").prop("checked", true);
                    is_buy = $($(arguments[0]).parent()).find('.statussell').html();
                }

                $("#new_booktype").prop("checked", true);
                var type = arguments[1];
                var idorder = arguments[2];

                $('.ordervalue').css('display', 'none');
                $('.limitno').css('display', 'none');
                $("#order_rate").val("");

                cleartime();
                document.getElementById("booking_status").innerHTML = '';

                document.getElementById("book_rate").value = '';
                var tableid = document.getElementById("liveratetable");
                var book_cusid = document.getElementById('book_cusid').value;
                var row = arguments[0].parentNode.id;
                var parentRow = arguments[0].parentNode;
                document.getElementById("book_qty").value = "";
                document.getElementById("book_totalcost").value = "0.00";
                document.getElementById("book_totamt").value = "";
                document.getElementById("book").style.display = "none";
                document.getElementById("book_comid").value = $(parentRow).attr('id');
                $('#book_comname').find('option').remove();
                $.each($("#liveratetable > tbody tr"), function(index, value) {
                    var selected = '';
                    var com_id = $(value).find('.com_id').html();
                    var com_name = $(value).find('.com_name').html();
                    var statussell = $(value).find('.statussell').html();
                    var statusbuy = $(value).find('.statusbuy').html();
                    if (statusbuy == 1 && is_sell == 1) {
                        if (document.getElementById("book_comid").value == com_id)
                            var selected = 'selected = "selected"';
                        $('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
                    } else if (statussell == 1 && is_buy == 1) {
                        if (document.getElementById("book_comid").value == com_id)
                            var selected = 'selected = "selected"';
                        $('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
                    }
                });
                var trade_amountpurch = 0; // default: hide
                $(trade_status[0]).each(function(j, value) {
                    if (typeof value.trade_status_id !== 'undefined') {
                        if (value.cus_id == document.getElementById("userid").value) {
                            if (value.trade_status_id == document.getElementById("book_comid").value) {
                                cus_com_amountpurch = parseInt(value.trade_amountpurch) || 0;
                                if (cus_com_amountpurch == 0) {
                                    $('.deal_totalamt').css('display', 'none');
                                    $("#deal_typeweight").prop("checked", true);
                                } else if (cus_com_amountpurch == 1) {
                                    $('.deal_totalamt').css('display', 'flex');
                                }
                                return false; // break
                            }
                        }
                    }
                });

                document.getElementById("book_barquantity").value = $(parentRow).find('.com_bar_quantity').html();
                document.getElementById("book_comtype").value = $(parentRow).find('.com_type').html();
                document.getElementById("margin_type").value = $(parentRow).find('.com_margin_type').html();
                document.getElementById("margin").value = $(parentRow).find('.com_margin_value').html();
                document.getElementById("allowed_decimals").value = $(parentRow).find('.allowed_decimals').html();
                document.getElementById("com_bar_type").value = $(parentRow).find('.com_bar_type').html();
                document.getElementById("bar_selection").value = $(parentRow).find('.bar_selection').html();
                document.getElementById("com_bar_no").value = $(parentRow).find('.com_bar_no').html();

                // Apply amount_purchase / trade_amount_weight visibility
                var bar_sel = parseInt($(parentRow).find('.bar_selection').html()) || 0;
                if (cus_com_amountpurch === 0 || bar_sel === 1) {
                    $('.amount_purchase').css('display', 'none');
                    if (cus_com_amountpurch === 0) {
                        $('.trade_amount_weight').css('display', 'none');
                    } else {
                        $('.trade_amount_weight').css('display', 'flex');
                    }
                } else if (cus_com_amountpurch === 1) {
                    $('.amount_purchase').css('display', 'inline');
                    $('.trade_amount_weight').css('display', 'flex');
                }
                document.getElementById("book_comweight").value = $(parentRow).find('.com_weight').html();
                document.getElementById("premsel_premium").value = $(parentRow).find('.prem_sel_premium').html();
                document.getElementById("prembuy_premium").value = $(parentRow).find('.prem_buy_premium').html();
                document.getElementById("premcomsell_active").value = $(parentRow).find('.prem_comsell_active').html();
                document.getElementById("premcombuy_active").value = $(parentRow).find('.prem_combuy_active').html();
                document.getElementById("book_deliverydate").value = $(parentRow).find('.deliverydays').html();
                document.getElementById('order_disprate').innerHTML = "";
                document.getElementById('rate_disp').innerHTML = "";
                book_comweight = document.getElementById("book_comweight").value;

                if (document.getElementById("book_comtype").value == 0) {
                    document.getElementById('order_disprate').innerHTML = "Order Price(" + parseFloat(book_comweight) + " Grm)";
                    document.getElementById('rate_disp').innerHTML = "Rate(" + parseFloat(book_comweight) + " Grm)";
                } else if (document.getElementById("book_comtype").value == 1) {
                    document.getElementById('order_disprate').innerHTML = "Order At Price(" + parseFloat(parseFloat(book_comweight) / 1000) + " Kg)";
                    document.getElementById('rate_disp').innerHTML = "Rate(" + parseFloat(parseFloat(book_comweight) / 1000) + " Kg)";
                }

                var qtyType = $("#com_bar_type").val() == 0 ? 'Gms' : 'Kg';

                if ($("#bar_selection").val() == 1) {
                    $("#required_qty").html('<select id="book_qty" name="book_qty" class="form-control width-input" tabindex="2"></select>');
                    var bar_weight = parseFloat(document.getElementById("book_barquantity").value);
                    var qty_no = $("#com_bar_no").val();
                    for (i = 1; i <= qty_no; i++) {
                        var total_qty = parseFloat(bar_weight) * parseFloat(i);
                        $('#book_qty').append('<option value="' + total_qty + '">' + total_qty + '</option>');
                    }
                    $(".qty_type").html("(" + qtyType + ")");
                    $(".displayLotSize").html("");
                } else {
                    $("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
                    if ($("#book_barquantity").val() == 1) {
                        $(".qty_type").html("(" + qtyType + ")");
                        $(".displayLotSize").html("");
                    } else {
                        $(".displayLotSize").html("1 Qty = " + $("#book_barquantity").val() + " " + qtyType);
                        $(".qty_type").html("");
                    }
                }

                if (is_buy == 1) {
                    document.getElementById("buy_sell").innerHTML = "BUY";
                    $("#book_type").val(0);
                    $(".displaydate").html($("#book_deliverydate").val());
                    document.getElementById("discount_amt").value = $("#premsel_premium").val();

                } else if (is_sell == 1) {
                    document.getElementById("buy_sell").innerHTML = "SELL";
                    $("#book_type").val(1);
                    $(".displaydate").html($("#book_deliverydate").val());
                    document.getElementById("discount_amt").value = $("#prembuy_premium").val();

                }

                $("#ajax_loader").removeClass("show");

                $(".comm-purchase").addClass("atv_btn");

                $(".button-row").addClass("atv_btn");

                document.getElementById("book_qty").focus();

                timer_flag = 0;

                enable_editRates();

                callbook_rate(row, is_buy, is_sell);
            }

            function cleartime() {
                clearTimeout(timer);
                clearTimeout(timer_status);
                timer_flag = 1;
            }

            function callbook_rate(row, is_buy, is_sell) {
                if ($('#new_booktype').is(':checked')) {
                    var request_type = 0;
                } else if ($('#new_ordertype').is(':checked')) {
                    var request_type = 1;
                }
                var tableid = document.getElementById("liveratetable");
                var currow = document.getElementById(row);
                if (is_buy == 1) {
                    var current_rate_buy = $(currow).find('td:eq(2)').html();
                    if ($("#livePrice").is(":checked")) {
                        if (parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_buy)) {
                            $('#book_rate').css('color', '#FFFFFF');
                            $('#book_rate').css('background', '#FF0000');
                        } else if (parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_buy)) {

                            $('#book_rate').css('color', '#FFFFFF');
                            $('#book_rate').css('background', '#008000');
                        } else {
                            $('#book_rate').css('color', '#000');
                            $('#book_rate').css('background', '');
                        }
                        document.getElementById("book_rate").value = current_rate_buy;
                    }
                    $("#liveprice").val(current_rate_buy);
                }

                if (is_sell == 1) {
                    var current_rate_sell = $(currow).find('td:eq(1)').html();
                    if ($("#livePrice").is(":checked")) {
                        if (parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_sell)) {
                            $('#book_rate').css('color', '#FFFFFF');
                            $('#book_rate').css('background', '#FF0000');
                        } else if (parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_sell)) {
                            $('#book_rate').css('color', '#FFFFFF');
                            $('#book_rate').css('background', '#FF0000');
                        } else {
                            $('#book_rate').css('color', '#000');
                            $('#book_rate').css('background', '');
                        }
                        document.getElementById("book_rate").value = current_rate_sell;
                    }
                    $("#liveprice").val(current_rate_sell);
                }

                if (request_type == 0) {
                    if (is_buy == 1)
                        $(".rateval").html($("#book_rate").val());
                    else if (is_sell == 1)
                        $(".rateval").html($("#book_rate").val());
                    else
                        $(".rateval").html(0.00);
                }
                if (request_type == 1) {
                    if (is_buy == 1)
                        $(".rateval").html($("#order_rate").val());
                    else if (is_sell == 1)
                        $(".rateval").html($("#order_rate").val());
                    else
                        $(".rateval").html(0.00);
                }

                calculateTotal(row, is_buy, is_sell);
                if (timer_flag == 0) {
                    timer = setTimeout("callbook_rate('" + row + "'," + is_buy + "," + is_sell + ")", 600);
                }
            }

            function trade_disable() {
                $('#booking_status').html("Currently trade has been disabled...Please try again later...");
                $('#status_modal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
                $('#status_modal .close').css('display', 'block');
            }

            function reset_terminal() {
                clear_bookingterminal();
                $("#userid").val("");
                $("#searchname").val("");
            }

            function get_tolerance() {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "<?php echo $this->config->item('base_url'); ?>index.php/c_phonebooking/get_tolerance",
                    success: function(data) {
                        $("#gold_high_tol").val(isNaN(data['gold_tol'][0]) || (data['gold_tol'][0] == '') ? 0 : data['gold_tol'][0]);
                        $("#gold_low_tol").val(isNaN(data['gold_tol'][1]) || (data['gold_tol'][1] == '') ? 0 : data['gold_tol'][1]);
                        $("#silver_high_tol").val(isNaN(data['silver_tol'][0]) || (data['silver_tol'][0] == '') ? 0 : data['silver_tol'][0]);
                        $("#silver_low_tol").val(isNaN(data['silver_tol'][1]) || (data['silver_tol'][1] == '') ? 0 : data['silver_tol'][1]);
                    },
                    error: function(request, error) {
                        console.log(error);
                    }
                });
            }

            function getStatusBadge(status) {
                var statusLower = (status || '').toLowerCase().trim();
                var badgeStyle = 'display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;color:#fff;text-align:center;min-width:70px;';
                if (statusLower.indexOf('confirmed') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#28a745;">' + status + '</span>';
                } else if (statusLower.indexOf('delivered') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#6f42c1;">' + status + '</span>';
                } else if (statusLower.indexOf('partial') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#17a2b8;">' + status + '</span>';
                } else if (statusLower.indexOf('pending') !== -1 || statusLower.indexOf('request') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#e6a817;color:#333;">' + status + '</span>';
                } else if (statusLower.indexOf('hold') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#6c757d;">' + status + '</span>';
                } else if (statusLower.indexOf('reject') !== -1 || statusLower.indexOf('cancel') !== -1) {
                    return '<span style="' + badgeStyle + 'background-color:#dc3545;">' + status + '</span>';
                }
                return '<span style="' + badgeStyle + 'background-color:#6c757d;">' + status + '</span>';
            }

            function get_data() {
                try {
                    var thStyle = 'text-align:center;background-color:#2c3e6b;color:#fff;padding:10px 8px;font-size:12px;font-weight:600;border:1px solid #1e2d50;';
                    var table = '';
                    table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="font-size:13px;">';
                    table += '<thead><tr>';
                    table += '<th style="' + thStyle + '">Book No</th>';
                    table += '<th style="' + thStyle + '">Type</th>';
                    table += '<th style="' + thStyle + '">Book Type</th>';
                    table += '<th style="' + thStyle + '">Book Date & Time</th>';
                    table += '<th style="' + thStyle + '">Name</th>';
                    table += '<th style="' + thStyle + '">Mobile No</th>';
                    table += '<th style="' + thStyle + '">Comm. Type</th>';
                    table += '<th style="' + thStyle + '">Comm. Name</th>';
                    table += '<th style="' + thStyle + '">Qty(gms)</th>';
                    table += '<th style="' + thStyle + '">Book Rate</th>';
                    table += '<th style="' + thStyle + '">Amount</th>';
                    table += '<th style="' + thStyle + '">Book by</th>';
                    table += '<th style="' + thStyle + '">Status</th>';
                    table += '</tr></thead><tbody>';
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "<?php echo $this->config->item('base_url'); ?>index.php/C_phonebooking/tradingStatus_dataload/Phonebooking_model",
                        success: function(data) {
                            var table_val = '';
                            var tdStyle = 'text-align:center;padding:8px 6px;vertical-align:middle;';

                            $.each(data, function(i) {
                                var bookType = data[i]['ordertype'] == 0 ? "Book" : "Limit";
                                var commType = data[i]['com_type'] == 1 ? "Silver" : "Gold";
                                var commTypeColor = data[i]['com_type'] == 1 ? '#17a2b8' : '#e6a817';
                                var bookByLabel = data[i]['book_by'] == 1 ? 'Admin' : 'User';
                                var statusBadge = getStatusBadge(data[i]['status']);
                                table_val += '<tr>';
                                table_val += '<td style="' + tdStyle + 'font-weight:600;" class="BookNo">' + data[i]['bookno'] + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + bookType + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + data[i]['book_type'] + '</td>';
                                table_val += '<td style="' + tdStyle + 'white-space:nowrap;">' + data[i]['bookdate'] + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + data[i]['customername'] + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + data[i]['cus_mobile'] + '</td>';
                                table_val += '<td style="' + tdStyle + 'color:' + commTypeColor + ';font-weight:600;">' + commType + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + data[i]['commodityname'] + '</td>';
                                table_val += '<td style="' + tdStyle + '" class="qty">' + parseFloat((data[i]['bookqty'])) + '</td>';
                                table_val += '<td style="' + tdStyle + '" class="rate">' + IND_money_format(parseFloat(data[i]['book_rate'])) + '</td>';
                                table_val += '<td style="' + tdStyle + '" class="amount">' + IND_money_format(parseFloat(data[i]['bookamount'])) + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + bookByLabel + '</td>';
                                table_val += '<td style="' + tdStyle + '">' + statusBadge + '</td>';
                                table_val += '</tr>';
                            });

                            table += table_val;
                            table += '</tbody>';
                            table += '</table>';
                            $('.report').empty().append(table);
                        },
                        error: function(request, error) {
                            setTimeout("get_data()", 5000);
                        }
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }

            function handleSearchInput(input) {
                let value = input.value.trim();

                // mobile number mode
                if (/^\d+$/.test(value)) {
                    input.maxLength = 10;
                    // Remove any non-digit characters
                    // input.value = value.replace(/\D/g, '');
                }
                // name mode
                else {
                    input.maxLength = 30;
                    // Remove digits and special characters except space
                    // input.value = value.replace(/[^a-zA-Z\s]/g, '');
                }
            }
        </script>

        <div class="main-panel" style="margin-top:40px;">
            <div class="content-wrapper">
                <div class="row" id="phoneBook">
                    <div class="col-12 grid-margin">
                        <div id="ajax_loader" class="ajax_loader"><img
                                src="<?php echo dirname(base_url()); ?>/assets/images/ajax_load.gif" /></div>
                        <div class="card">
                            <div class="card-body">
                                <div class="row form-sample1">
                                    <div class="col-md-7 phone_bookdiv">
                                        <div id="divrate"
                                            style="<?php echo $comdata['rpaneldata']['market_status'] == 1 || $comdata['rpaneldata']['rate_display'] == 0 ? 'display:none;' : ''; ?>">
                                            <div class="table-responsive1">
                                                <table id="liveratetable" class="table table-hover1 rateTable">
                                                    <thead>
                                                        <tr>
                                                            <th class="titleheading1">Commodity</th>
                                                            <th>Buying Rate</th>
                                                            <th class="phonebook_head">Selling Rate</th>
                                                            <th style="display:none">Delivery Date</th>
                                                            <label align="center" id="connectionmsg"
                                                                class="connectionmsg"
                                                                style="display: none; color: rgb(204, 0, 0); margin-top: 54px; font-size:32px; background-color:#000000; position:absolute; line-height:86px;"></label>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="commodity_listing commodity_listing1">
                                                        <?php
                                                        $i = 0;
                                                        foreach ($comdata['commoditydetails'] as $com => $comrow) {
                                                            if ($comrow['com_is_coin'] != 1 && ($comrow['cus_com_sell'] == '1' || $comrow['cus_com_buy'] == 1)) { ?>
                                                                <tr>
                                                                    <td class="roundTopLeft rateTitle com_name">
                                                                        <?php echo $comrow['com_name']; ?>
                                                                    </td>
                                                                    <td id="buy_rates[<?php echo $i; ?>]" class="buy_rates">
                                                                    </td>
                                                                    <td id="sell_rates[<?php echo $i; ?>]" class="sell_rates">
                                                                    </td>
                                                                    <td class="roundTopRight" style="display:none">
                                                                        <?php echo $comrow['deliverydays']; ?>
                                                                    </td>
                                                                    <td style="display:none;">
                                                                        <div class="com_id"><?php echo $comrow['com_id']; ?>
                                                                        </div>
                                                                        <div class="com_type"><?php echo $comrow['com_type']; ?>
                                                                        </div>
                                                                        <div class="com_weight">
                                                                            <?php echo $comrow['com_weight']; ?>
                                                                        </div>
                                                                        <div class="com_other_charges">
                                                                            <?php echo $comrow['com_other_charges']; ?>
                                                                        </div>
                                                                        <div class="com_correction_type">
                                                                            <?php echo $comrow['com_correction_type']; ?>
                                                                        </div>
                                                                        <div class="com_sel_premium">
                                                                            <?php echo $comrow['com_sel_premium']; ?>
                                                                        </div>
                                                                        <div class="com_buy_premium">
                                                                            <?php echo $comrow['com_buy_premium']; ?>
                                                                        </div>
                                                                        <div class="com_premium_type">
                                                                            <?php echo $comrow['com_premium_type']; ?>
                                                                        </div>
                                                                        <div class="com_sel_active">
                                                                            <?php echo $comrow['com_sel_active']; ?>
                                                                        </div>
                                                                        <div class="com_buy_active">
                                                                            <?php echo $comrow['com_buy_active']; ?>
                                                                        </div>
                                                                        <div class="com_delverydays">
                                                                            <?php echo $comrow['com_delverydays']; ?>
                                                                        </div>
                                                                        <div class="com_isregion">
                                                                            <?php echo $comrow['com_isregion']; ?>
                                                                        </div>
                                                                        <div class="com_calpurity">
                                                                            <?php echo $comrow['com_calpurity']; ?>
                                                                        </div>
                                                                        <div class="com_tax"><?php echo $comrow['com_tax']; ?>
                                                                        </div>
                                                                        <div class="com_octroi">
                                                                            <?php echo $comrow['com_octroi']; ?>
                                                                        </div>
                                                                        <div class="com_stamduty">
                                                                            <?php echo $comrow['com_stamduty']; ?>
                                                                        </div>
                                                                        <div class="deliverydays">
                                                                            <?php echo $comrow['deliverydays']; ?>
                                                                        </div>
                                                                        <div class="displyname">
                                                                            <?php echo $comrow['displyname']; ?>
                                                                        </div>
                                                                        <div class="mcxsymbol">
                                                                            <?php echo $comrow['mcxsymbol']; ?>
                                                                        </div>
                                                                        <div class="banksymbol">
                                                                            <?php echo $comrow['banksymbol']; ?>
                                                                        </div>
                                                                        <div class="rcomid"><?php echo $comrow['rcomid']; ?>
                                                                        </div>
                                                                        <div class="trade_type">
                                                                            <?php echo $comrow['trade_type']; ?>
                                                                        </div>
                                                                        <div class="sell_diff">
                                                                            <?php echo $comrow['sell_diff']; ?>
                                                                        </div>
                                                                        <div class="buy_diff"><?php echo $comrow['buy_diff']; ?>
                                                                        </div>
                                                                        <div class="sell_rate">
                                                                            <?php echo $comrow['sell_rate']; ?>
                                                                        </div>
                                                                        <div class="com_display_purity">
                                                                            <?php echo $comrow['com_display_purity']; ?>
                                                                        </div>
                                                                        <div class="com_roundoff">
                                                                            <?php echo $comrow['com_roundoff']; ?>
                                                                        </div>
                                                                        <div class="com_is_coin">
                                                                            <?php echo $comrow['com_is_coin']; ?>
                                                                        </div>
                                                                        <div class="com_bar_quantity">
                                                                            <?php echo $comrow['com_bar_quantity']; ?>
                                                                        </div>
                                                                        <div class="com_margin_type">
                                                                            <?php echo $comrow['com_margin_type']; ?>
                                                                        </div>
                                                                        <div class="com_margin_value">
                                                                            <?php echo $comrow['com_margin_value']; ?>
                                                                        </div>
                                                                        <div class="allowed_decimals">
                                                                            <?php echo $comrow['allowed_decimals']; ?>
                                                                        </div>
                                                                        <div class="com_bar_type">
                                                                            <?php echo $comrow['com_bar_type']; ?>
                                                                        </div>
                                                                        <div class="bar_selection">
                                                                            <?php echo $comrow['bar_selection']; ?>
                                                                        </div>
                                                                        <div class="com_bar_no">
                                                                            <?php echo $comrow['com_bar_no']; ?>
                                                                        </div>
                                                                        <div class="com_unit"><?php echo $comrow['com_unit']; ?>
                                                                        </div>
                                                                        <div class="statusbuy">0</div>
                                                                        <div class="statussell">0</div>
                                                                        <div class="prem_sel_premium">
                                                                            <?php echo $comrow['prem_sel_premium']; ?>
                                                                        </div>
                                                                        <div class="prem_buy_premium">
                                                                            <?php echo $comrow['prem_buy_premium']; ?>
                                                                        </div>
                                                                        <div class="prem_comsell_active">
                                                                            <?php echo $comrow['prem_comsell_active']; ?>
                                                                        </div>
                                                                        <div class="prem_combuy_active">
                                                                            <?php echo $comrow['prem_combuy_active']; ?>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                        <?php $i++;
                                                            }
                                                            // }
                                                        }
                                                        ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div style="display:none;">
                                            <table class="table table_responstive1">
                                                <thead>
                                                    <tr class="headertable3">
                                                        <th class="ratevalue6">DESCRIPTION</th>
                                                        <th class="ratevalue7">BID</th>
                                                        <th class="ratevalue7">ASK</th>
                                                        <th class="ratevalue7">HIGH</th>
                                                        <th class="ratevalue7">LOW</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php foreach ($rpanelcontract as $key => $contract) {
                                                        if ($contract['userpage_status'] == 1) {
                                                            echo '<tr class="table7"><td width="166px" class="">' .
                                                                $contract['userpage_displayname'] .
                                                                '</td><td width="116px" class="ratevalue8"><div class="txtlabel ' .
                                                                $contract['contract_symbol'] .
                                                                '_bid" id="' .
                                                                $contract['contract_symbol'] .
                                                                '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="bid">-</div></td><td width="116px" class="ratevalue8"><div class="txtlabel ' .
                                                                $contract['contract_symbol'] .
                                                                '_ask" id="' .
                                                                $contract['contract_symbol'] .
                                                                '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="ask">-</div></td><td width="116px" class="ratevalue9"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] . '" data-field="high">-</div></td><td width="116px" class="ratevalue9"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] . '" data-field="low">-</div></td></tr>';
                                                        }
                                                    } ?>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style="display:none;">
                                            <table class="table table_responstive1">
                                                <thead>
                                                    <tr class="headertable3">
                                                        <th class="ratevalue6">DESCRIPTION</th>
                                                        <th class="ratevalue7">BID</th>
                                                        <th class="ratevalue7">ASK</th>
                                                        <th class="ratevalue7">HIGH</th>
                                                        <th class="ratevalue7">LOW</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php foreach ($rpanelcontract as $key => $contract) {
                                                        if ($contract['userpage_status'] == 1) {
                                                            echo '<tr class="table7"><td width="166px" class="">' .
                                                                $contract['userpage_displayname'] .
                                                                '</td><td width="116px" class="ratevalue8"><div class="txtlabel ' .
                                                                $contract['contract_symbol'] .
                                                                '_bid" id="' .
                                                                $contract['contract_symbol'] .
                                                                '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="bid">-</div></td><td width="116px" class="ratevalue8"><div class="txtlabel ' .
                                                                $contract['contract_symbol'] .
                                                                '_ask" id="' .
                                                                $contract['contract_symbol'] .
                                                                '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="ask">-</div></td><td width="116px" class="ratevalue9"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="high">-</div></td><td width="116px" class="ratevalue9"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                                $contract['contract_symbol'] .
                                                                '" data-field="low">-</div></td></tr>';
                                                        }
                                                    } ?>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="messagebox" id="messagebox"
                                            style="<?php echo $comdata['rpaneldata']['market_status'] == 1 && $comdata['rpaneldata']['rate_display'] != 1 ? '' : 'display:none;'; ?>"
                                            align="center">
                                            <table width="500px" border="0" height="170px" style="border-top:0px;">
                                                <tr height="100px">
                                                    <td id="messageboxtext" style="color:#000000; text-align: center">
                                                        <?php echo $comdata['rpaneldata']['market_closed']; ?>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div id="onoffmessage" class="onoffmessage" align="center"
                                            style="<?php echo $comdata['rpaneldata']['rate_display'] == 0 ? '' : 'display:none;'; ?>">
                                            <table width="500px" border="0" height="250px">
                                                <tr height="50px">
                                                    <td id="onoffmessagetext" style="color:#000000; text-align: center">
                                                        Please wait market will be open shortly.</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div style="display:none;">
                                            <div class="market_closed">
                                                <?php echo $comdata['rpaneldata']['market_status']; ?>
                                            </div>
                                            <div class="rate_display">
                                                <?php echo $comdata['rpaneldata']['rate_display']; ?>
                                            </div>
                                        </div>
                                        <table id="liveratetable2" class="table table-hover1 rateTable">
                                            <thead>
                                                <tr class="title">
                                                    <th class="titleheading1">Symbol</th>
                                                    <th>Bid</th>
                                                    <th>Ask</th>
                                                    <th>High</th>
                                                    <th class="phonebook_head">Low</th>
                                                </tr>
                                            </thead>
                                            <tbody class="commodity_listing2">
                                                <?php foreach ($comdata['rpanel_contracts'] as $key => $contract) {
                                                    echo '<tr><td class="rateheading">' .
                                                        $contract['displayname'] .
                                                        '<input type="hidden" name="fv[rpcontract][' .
                                                        $contract['contract_symbol'] .
                                                        '][contract]" value="' .
                                                        $contract['contract_id'] .
                                                        '" /></td><td><div class="txtlabel ' .
                                                        $contract['contract_symbol'] .
                                                        '_bid" id="' .
                                                        $contract['contract_symbol'] .
                                                        '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                        $contract['contract_symbol'] .
                                                        '" data-field="bid">-</div></td><td><div class="txtlabel ' .
                                                        $contract['contract_symbol'] .
                                                        '_ask" id="' .
                                                        $contract['contract_symbol'] .
                                                        '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                        $contract['contract_symbol'] .
                                                        '" data-field="ask">-</div></td><td><div class="txtlabel ' .
                                                        $contract['contract_symbol'] .
                                                        '_high" id="' .
                                                        $contract['contract_symbol'] .
                                                        '_high" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                        $contract['contract_symbol'] .
                                                        '" data-field="high">-</div></td><td><div class="txtlabel ' .
                                                        $contract['contract_symbol'] .
                                                        '_low" id="' .
                                                        $contract['contract_symbol'] .
                                                        '_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="' .
                                                        $contract['contract_symbol'] .
                                                        '" data-field="low">-</div></td></tr>';
                                                } ?>
                                            </tbody>
                                        </table>
                                        <table class="table table-hover1 rateTable">
                                            <thead>
                                                <tr class="title">
                                                    <th width="20%" class="titleheading1">Description</th>
                                                    <th width="20%">Bid</th>
                                                    <th width="20%">Ask</th>
                                                    <th width="20%">High</th>
                                                    <th width="20%" class="phonebook_head">Low</th>
                                                </tr>
                                            </thead>
                                            <tbody class="commodity_listing2">
                                                <tr>
                                                    <td class="roundTopLeft rateTitle">GOLD($)</td>
                                                    <td>
                                                        <div id="gold_bid" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-GOLD"
                                                            data-field="bid">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="gold_ask" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-GOLD"
                                                            data-field="ask">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="gold_high" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-GOLD"
                                                            data-field="high">-</div>
                                                    </td>
                                                    <td class="roundTopRight">
                                                        <div id="gold_low" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-GOLD"
                                                            data-field="low">-</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="roundTopLeft rateTitle">SILVER($)</td>
                                                    <td>
                                                        <div id="silver_bid" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-SILVER"
                                                            data-field="bid">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="silver_ask" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-SILVER"
                                                            data-field="ask">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="silver_high" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-SILVER"
                                                            data-field="high">-</div>
                                                    </td>
                                                    <td class="roundTopRight">
                                                        <div id="silver_low" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-SILVER"
                                                            data-field="low">-</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="roundTopLeft rateTitle">INR</td>
                                                    <td>
                                                        <div id="inr_bid" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-INR"
                                                            data-field="bid">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="inr_ask" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-INR"
                                                            data-field="ask">-</div>
                                                    </td>
                                                    <td>
                                                        <div id="inr_high" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-INR"
                                                            data-field="high">-</div>
                                                    </td>
                                                    <td class="roundTopRight">
                                                        <div id="inr_low" data-source="lightstreamer"
                                                            data-grid="bidaskrates" data-item="SPOT-INR"
                                                            data-field="low">-</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="box-content col-md-5 phone_bookpage">
                                        <div class="form-group row">
                                            <div class="col-md-12 requst_heading trade-section"
                                                style="margin:0 0px 0 0px;">
                                                <div class="margin-container">
                                                    Trading Terminal
                                                </div>
                                            </div>
                                            <div class="col-md-12 comm-purchase">
                                                <input type="hidden" name="book_cusid" id="book_cusid" value="" />
                                                <input type="hidden" name="book_comid" id="book_comid" value="" />
                                                <input type="hidden" name="book_comweight" id="book_comweight"
                                                    value="" />
                                                <input type="hidden" name="confirmation_for" id="confirmation_for"
                                                    value="" />
                                                <input type="hidden" name="book_barquantity" id="book_barquantity"
                                                    value="" />
                                                <input type="hidden" name="book_type" id="book_type" value="" />
                                                <input type="hidden" name="book_comtype" id="book_comtype" value="" />
                                                <input type="hidden" name="margin" id="margin" value="" />
                                                <input type="hidden" name="margin_type" id="margin_type" value="" />
                                                <input type="hidden" name="openmargin" id="openmargin" value="" />
                                                <input type="hidden" name="openmargintype" id="openmargintype"
                                                    value="" />
                                                <input type="hidden" name="maxqty" id="maxqty" value="" />
                                                <input type="hidden" name="reversedmargin_amt" id="reversedmargin_amt"
                                                    value="" />
                                                <input type="hidden" name="order_taken_rate" id="order_taken_rate"
                                                    value="" />
                                                <input type="hidden" name="order_taken_qty" id="order_taken_qty"
                                                    value="" />
                                                <input type="hidden" name="order_bookno" id="order_bookno" value="" />
                                                <input type="hidden" name="gold_high_tol" id="gold_high_tol" value="" />
                                                <input type="hidden" name="gold_low_tol" id="gold_low_tol" value="" />
                                                <input type="hidden" name="silver_high_tol" id="silver_high_tol"
                                                    value="" />
                                                <input type="hidden" name="silver_low_tol" id="silver_low_tol"
                                                    value="" />
                                                <input type="hidden" name="allowed_decimals" id="allowed_decimals"
                                                    value="0" />
                                                <input type="hidden" name="com_bar_type" id="com_bar_type" value="" />
                                                <input type="hidden" name="bar_selection" id="bar_selection" value="" />
                                                <input type="hidden" name="com_bar_no" id="com_bar_no" value="" />
                                                <input type="hidden" name="premsel_premium" id="premsel_premium"
                                                    value="0" />
                                                <input type="hidden" name="prembuy_premium" id="prembuy_premium"
                                                    value="" />
                                                <input type="hidden" name="premcombuy_active" id="premcombuy_active"
                                                    value="" />
                                                <input type="hidden" name="premcomsell_active" id="premcomsell_active"
                                                    value="" />
                                                <input type="hidden" name="discount_amt" id="discount_amt" value="" />
                                                <input type="hidden" name="book_deliverydate" id="book_deliverydate"
                                                    value="" />
                                                <div class="row form-sample1">
                                                    <div class="col-md-12 request-rows">
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Customer Name
                                                            </div>
                                                            <div class="col-md-8 request-value"
                                                                style="padding-left: 0px; padding-right: 0px;">
                                                                <input type="hidden" id="userid" />
                                                                <input type="text" id="searchname"
                                                                    placeholder="Search Customer Name or Mobile No"
                                                                    class="form-control form-book" tabindex="1"
                                                                    maxlength="50"
                                                                    oninput="handleSearchInput(this)" />
                                                            </div>
                                                            <div class="col-md-4">

                                                            </div>
                                                            <div class="col-md-8" style="padding: 0px">
                                                                <div id="autocomp_list"></div>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Request Type
                                                            </div>
                                                            <div class="radiorates radiobuysell col-md-8"
                                                                style="margin-top: 5px;font-size: 11px;padding-left: 0px;padding-right:0px;">
                                                                <input checked type="radio" value="0"
                                                                    name="buysell_type" id="buy_type"
                                                                    class="option-input radio" checked /> <label
                                                                    for="buy_type">BUY</label>
                                                                <input type="radio" value="1" name="buysell_type"
                                                                    id="sell_type" class="option-input radio" /> <label
                                                                    for="sell_type"
                                                                    style="padding-right: 5px;border-right: 1px solid;">SELL</label>

                                                                <input checked type="radio" value="0"
                                                                    name="manuallive_price" id="manualRate"
                                                                    class="option-input radio"
                                                                    style="margin-left: 5px;" /> <label
                                                                    for="manualRate">MANUAL RATE</label>
                                                                <input type="radio" value="1" name="manuallive_price"
                                                                    id="livePrice" class="option-input radio" /> <label
                                                                    for="livePrice">LIVE PRICE</label>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group" <?php if ($disp_margin == 0) { ?> style="display:none" <?php } ?>>
                                                            <div class="col-md-4 request-text">
                                                                Available Margin
                                                            </div>
                                                            <div class="col-md-8" id="avail_margin">
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Commodity Name
                                                            </div>
                                                            <div class="col-md-8"
                                                                style="padding-left: 0px; padding-right: 0px;">
                                                                <select id="book_comname"
                                                                    class="form-control   width-input">

                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Type
                                                            </div>
                                                            <div class="col-md-8">
                                                                <div style="display:inline;" class="radiorates1">
                                                                    <input checked type="radio" value="0"
                                                                        name="request_type" id="new_booktype"
                                                                        class="option-input radio" />
                                                                    <label for="new_booktype">MARKET</label>
                                                                    <input type="radio" value="1" name="request_type"
                                                                        id="new_ordertype" class="option-input radio" />
                                                                    <label for="new_ordertype"
                                                                        style="padding-right: 10px">LIMIT</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group limitno"
                                                            style="display:none">
                                                            <div class="col-md-4 request-text">
                                                                Order No
                                                            </div>
                                                            <div class="col-md-8 request-value qty"
                                                                style="padding-left: 0px;padding-right: 0px;">
                                                                <select id="limitno" class="form-control  width-input">
                                                                    <option value="-1">-Select Order No-</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <!--<div class="form-group row phone_group limitno" style="display:none">
													<div class="col-md-4 request-text">
														Trade based on
													</div>
													<div class="col-md-8 request-value qty" style="padding-left: 0px;padding-right: 0px;">
														<div style="display:inline;" class="radiorates">
															<input checked type="radio" value="0" name="deal_type" id="deal_typeweight" class="option-input radio" />
															<label for="deal_typeweight">Weight</label>
															<input type="radio" value="1" name="deal_type"  id="deal_typeamount" class="option-input radio" />
															<label for="deal_typeamount" style="padding-right: 10px">Amount</label>
														</div>
													</div>
												</div>-->
                                                        <!-- <div class="form-group row phone_group trade_amount_weight">
                                                            <div class="col-md-4 request-btn-text">
                                                                Trade based on
                                                            </div>
                                                            <div class="col-md-8 request-btn-value type">
                                                                <input checked type="radio" value="0" name="deal_type" id="deal_typeweight" />
                                                                <label for="deal_typeweight">Weight</label>
                                                                <input type="radio" value="1" name="deal_type" id="deal_typeamount" /> <label for="deal_typeamount">Amount</label>
                                                            </div>
                                                        </div> -->
                                                        <div class="form-group row phone_group trade_amount_weight">
                                                            <div class="col-md-4 request-btn-text">
                                                                Trade based on
                                                            </div>
                                                            <div class="col-md-8 request-btn-value type">
                                                                <input checked type="radio" value="0" name="deal_type" id="deal_typeweight" />
                                                                <label for="deal_typeweight">Weight</label>

                                                                <div class="amount_purchase" style="display:inline; margin-left:8px;">
                                                                    <input type="radio" value="1" name="deal_type" id="deal_typeamount" />
                                                                    <label for="deal_typeamount">Amount</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group deal_totalamt"
                                                            id="deal_totalamt" style="display:none">
                                                            <div class="col-md-4 request-text">
                                                                Total Amount
                                                            </div>
                                                            <div class="col-md-8 request-value qty"
                                                                style="padding-left: 0px;padding-right: 0px;"
                                                                id="required_amount">
                                                                <input id="book_totamt" name="book_totamt" type="number"
                                                                    class="form-control width-input" min="0" step="0.01"
                                                                    onkeydown="validateKeyPress(event, this,1,10,2)" />
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Qty <label class="qty_type"></label>
                                                            </div>
                                                            <div class="col-md-8 request-value qty"
                                                                style="padding-left: 0px;padding-right: 0px;"
                                                                id="required_qty">
                                                                <input id="book_qty" name="book_qty" type="number"
                                                                    class="form-control width-input" tabindex="2" min="0" step="0.001"
                                                                    onkeydown="validateKeyPress(event, this,2,10,2)" />
                                                            </div>
                                                        </div>
                                                        <div class="displayLotSize"></div>
                                                        <div class="col-md-12 maxmin"></div>
                                                        <div class="form-group row phone_group edit-rate-container">
                                                            <div class="col-md-4 request-text" id="rate_disp">
                                                                Rate
                                                            </div>
                                                            <div class="col-md-8 request-value qty"
                                                                style="padding-left: 0px; padding-right: 0px;">
                                                                <input class="form-control  width-input"
                                                                    name="book_rate" id="book_rate" type="number"
                                                                    readOnly tabindex="3" min="0" step="0.01"
                                                                    onkeydown="validateKeyPress(event, this,2,10,2)" />
                                                            </div>
                                                        </div>
                                                        <div class="ordervalue" style="display:none">
                                                            <div class="form-group row phone_group ">
                                                                <div class="col-md-4 request-text" id="order_disprate">
                                                                    Order Rate
                                                                </div>
                                                                <div class="col-md-8 request-value qty"
                                                                    style="padding-left: 0px; padding-right: 0px;">
                                                                    <input class="form-control  width-input"
                                                                        name="order_rate" id="order_rate" type="number"
                                                                        tabindex="4" min="0" step="0.01" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group">
                                                            <div class="col-md-4 request-text">
                                                                Comment
                                                            </div>
                                                            <div class="col-md-8 request-value qty"
                                                                style="padding-left: 0px; padding-right: 0px;">
                                                                <input id="book_usercomment" name="book_usercomment"
                                                                    type="text" class="form-control width-input"
                                                                    tabindex="5"
                                                                    maxlength="100" />
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group" id="estimation_content">
                                                            <div class="col-md-4 request-text">
                                                                Estimation
                                                            </div>
                                                            <div class="col-md-8 request-value estimations">
                                                                <input id="book_totalcost" readonly="true"
                                                                    class="form-control width-input" type="text" />
                                                            </div>
                                                        </div>
                                                        <div class="form-group row phone_group delivery_date">
                                                            <div class="col-md-4 request-text">
                                                                Delivery Date
                                                            </div>
                                                            <div class="col-md-8 request-value estimations">
                                                                <div class="displaydate estimations"
                                                                    style="padding-left: 10px;font-weight:bold;font-size:18px">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style="display:none">
                                                            <input type="hidden" id="liveprice">
                                                        </div>
                                                        <div class="button-row">
                                                            <div class="form-group row phone_group">
                                                                <div class="col-md-4 request-text button-book button-center"
                                                                    id="book">
                                                                    <div class=" request-value buysellrates"
                                                                        onclick="customer_request();" tabindex="5">
                                                                        <div class="col-md-12 rateval">0.00</div>
                                                                        <span id="buy_sell">BUY/SELL</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div onclick="reset_terminal()" class="reset col-md-12">Reset</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body">
                                <div class="col-md-12">
                                    <div class="report">
                                    </div>
                                </div>
                                <div id="status_modal" class="modal fade" tabindex="-1" role="dialog"
                                    aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-body">
                                                <button type="button" class="close" data-dismiss="modal"
                                                    style="display:none" aria-label="Close"><span
                                                        aria-hidden="true">&times;</span></button>
                                                <div align="center" style="color:#000000" id="booking_status"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <?php $this->load->view("include/footer"); ?>
