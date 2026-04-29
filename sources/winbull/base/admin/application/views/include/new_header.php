<?php
$client = isset(Globals::$client) ? Globals::$client : '';
$cur_userid = $this->login_model->get_userid();

// Load dynamic logo/favicon settings
$_logo_settings = $this->db->select('website_logo, admin_logo, website_favicon, custom_logo_enabled')->get('dt_generalsettings')->row_array();
$_custom_enabled = isset($_logo_settings['custom_logo_enabled']) ? $_logo_settings['custom_logo_enabled'] : 0;
// Admin uses same website logo - when user uploads website logo, admin logo changes automatically
$_admin_logo_file = ($_custom_enabled && !empty($_logo_settings['website_logo'])) ? '../assets/images/' . $_logo_settings['website_logo'] : 'assets/img/logoicon.png';
$_favicon_file = ($_custom_enabled && !empty($_logo_settings['website_favicon'])) ? '../favicon/' . $_logo_settings['website_favicon'] : 'favicon.ico';
?>
<!DOCTYPE html>
<html lang="en">

<head>

    <?php
    $cur_userid = $this->login_model->get_userid();
    $tradingStatus = $this->login_model->get_tradingEnable();
    ?>
    <?php
    $mainTitle = "Admin";

    $segment1 = strtolower($this->uri->segment(1) ?? '');
    $segment2 = strtolower($this->uri->segment(2) ?? '');
    $segment3 = strtolower($this->uri->segment(3) ?? '');

    if ($segment1 == 'c_main' && $segment2 == 'load_mainpage') {
        $title = 'Home - ' . $mainTitle;
    } elseif ($segment1 == 'c_userregistration' && $segment2 == 'open_listingform') {
        $title = 'Trader Listing - ' . $mainTitle;
    } elseif ($segment1 == 'c_userregistration' && $segment2 == 'open_entryform') {
        $title = 'Trader Entry - ' . $mainTitle;
    } elseif ($segment1 == 'c_userregistration' && $segment2 == 'open_activateentryform') {
        $title = 'Trader Activation - ' . $mainTitle;
    } elseif ($segment1 == 'c_customergroup' && $segment2 == 'open_listingform') {
        $title = 'Customer Group Listing - ' . $mainTitle;
    } elseif ($segment1 == 'c_customergroup' && $segment2 == 'open_entryform') {
        $title = 'Customer Group Entry - ' . $mainTitle;
    } elseif ($segment1 == 'c_customergroup' && $segment2 == 'open_entryform') {
        $title = 'Customer Group Entry - ' . $mainTitle;
    } elseif ($segment1 == 'c_commodity_master' && $segment2 == 'open_listingform') {
        $title = 'Commodity Listing - ' . $mainTitle;
    } elseif ($segment1 == 'c_commodity_master' && $segment2 == 'open_entryform') {
        $title = 'Commodity Entry - ' . $mainTitle;
    } elseif ($segment1 == 'c_com_group' && $segment2 == 'open_listingform') {
        $title = 'Commodity Group Listing - ' . $mainTitle;
    } elseif ($segment1 == 'c_com_group' && $segment2 == 'open_entryform') {
        $title = 'Commodity Group Entry - ' . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 5) {
        $title = "Today's Trade - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 11) {
        $title = "MT5 Hedge - " . $mainTitle;
    } elseif ($segment1 == 'c_booking' && $segment2 == 'open_listingform' && $segment3 == 1) {
        $title = "Limit Order - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'open_listingform') {
        $title = "Pending Delivery - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 0) {
        $title = "Delivery Invoice - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'knockoff' && $segment3 == 'list') {
        $title = "KnockOff Listing - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'knockoff' && $segment3 == 'creditdebit') {
        $title = "Credit Debit Note - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'deliverylist') {
        $title = "Delivery Listing - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 7) {
        $title = "Customer Margin Report - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 8) {
        $title = "Outstanding Report - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'sms_report') {
        $title = "SMS Report - " . $mainTitle;
    } elseif ($segment1 == 'c_customersms' && $segment2 == 'open_entry_form') {
        $title = "Quick SMS - " . $mainTitle;
    } elseif ($segment1 == 'c_serv_group' && $segment2 == 'open_listingform') {
        $title = "Templates Listing - " . $mainTitle;
    } elseif ($segment1 == 'c_serv_group' && $segment2 == 'open_entryform') {
        $title = "Templates Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_commoditygroupcustomer' && $segment2 == 'open_listingform') {
        $title = "Send Rates - " . $mainTitle;
    } elseif ($segment1 == 'c_commoditygroupcustomer' && $segment2 == 'open_entryform') {
        $title = "Send Rates Update - " . $mainTitle;
    } elseif ($segment1 == 'c_customerservice' && $segment2 == 'open_listingform') {
        $title = "Send News Letters - " . $mainTitle;
    } elseif ($segment1 == 'c_customerservice' && $segment2 == 'open_entryform') {
        $title = "News Letters Update - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_user' && $segment2 == 'open_listingform') {
        $title = "Admin User Listing - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_user' && $segment2 == 'open_entryform') {
        $title = "Admin User Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_rpanel' && $segment2 == 'open_entry_form') {
        $title = "RPanel Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_rpanel' && $segment2 == 'general_entry_form') {
        $title = "General Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_sms_api' && $segment2 == 'open_listingform') {
        $title = "SMS API Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_sms_api' && $segment2 == 'open_entryform') {
        $title = "SMS API Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_serv_master' && $segment2 == 'open_entry_form') {
        $title = "Service List(sms & email) - " . $mainTitle;
    } elseif ($segment1 == 'c_marqueetext' && $segment2 == 'open_listingform') {
        $title = "Marquee List - " . $mainTitle;
    } elseif ($segment1 == 'c_news' && $segment2 == 'open_listingform') {
        $title = "News & Events List - " . $mainTitle;
    } elseif ($segment1 == 'c_news' && $segment2 == 'open_entryform') {
        $title = "News & Events Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_advertisements' && $segment2 == 'open_listingform') {
        $title = "Advertisements List - " . $mainTitle;
    } elseif ($segment1 == 'c_advertisements' && $segment2 == 'open_entryform') {
        $title = "Advertisements Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_email_settings' && $segment2 == 'open_listingform') {
        $title = "Email Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_email_settings' && $segment2 == 'open_entry_form') {
        $title = "Email Settings Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_sms_settings' && $segment2 == 'open_listingform') {
        $title = "SMS Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_sms_settings' && $segment2 == 'open_entry_form') {
        $title = "SMS Settings Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_popup' && $segment2 == 'open_listingform') {
        $title = "Popup Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_popup' && $segment2 == 'open_entryform') {
        $title = "Popup Settings Entry - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_rpanel' && $segment2 == 'invoice_settings_form') {
        $title = "Invoice Settings - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_unfix' && $segment2 == 'open_listingcus_form') {
        $title = "Unfix Ledger - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_unfix' && $segment2 == 'cus_unfix_payment') {
        $title = "Unfix Ledger - " . $mainTitle;
    } elseif ($segment1 == 'c_admin_unfix' && $segment2 == 'open_entryform') {
        $title = "R-Panel Bank - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 2) {
        $title = "Customer Ledger - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 3) {
        $title = "Deal Register - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 6) {
        $title = "Pending Delivery - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 9) {
        $title = "Delivery Report - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing' && $segment3 == 10) {
        $title = "Margin Report - " . $mainTitle;
    } elseif ($segment1 == 'c_customerdelivery' && $segment2 == 'listing') {
        $title = "Unfix Report - " . $mainTitle;
    } elseif ($segment1 == 'c_prem_group') {
        $title = "Premium Group - " . $mainTitle;
    } elseif ($segment1 == 'c_booking' && $segment2 == 'open_listingform' && $segment3 == 0) {
        $title = "Booking Request - " . $mainTitle;
    } elseif ($segment1 == 'c_logo_settings') {
        $title = 'Logo & Icon Settings - ' . $mainTitle;
    } else {
        $title = $mainTitle;
    }
    ?>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <title><?php echo $title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Winbull Lite, a fully featured, responsive,">

    <!-- === STYLESHEETS ===-->

    <!-- Base Styles -->
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/typicons/typicons.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/style.css">
    <link id="bs-css" href="<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-cerulean.min.css"
        rel="stylesheet">

    <!-- Custom Styles -->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/lmx-app.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/customize.css?v=2.0" rel="stylesheet">
    <link href="<?php echo base_url(); ?>assets/css/radiobuttons.css" rel="stylesheet">

    <!-- Third-Party CSS Libraries -->

    <link
        href="<?php echo $this->config->item('base_url'); ?>assets/bower_components/responsive-tables/responsive-tables.css"
        rel="stylesheet">

    <!-- Notification and File Manager -->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.min.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.theme.css" rel="stylesheet">

    <!-- Miscellaneous Styles -->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/jquery.iphone.toggle.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/uploadify.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/animate.min.css" rel="stylesheet">

    <!-- External Fonts & Icons -->
    <!--<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-glyphicons/1.0.0/css/bootstrap-glyphicons.min.css"
		rel="stylesheet">

	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">-->

    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/all.min.css" rel="stylesheet">

    <!-- Favicon -->
    <link rel="shortcut icon" href="<?php echo $this->config->item('base_url') . $_favicon_file; ?>?v=<?php echo time(); ?>">


    <!-- === JAVASCRIPT ====-->

    <!-- jQuery -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>

    <!-- Bootstrap 5 (Latest) -->
    <!--<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>-->

    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap.min.css" rel="stylesheet">
    <script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/bootstrap.bundle.min.js'></script>

    <!-- ApexCharts -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <!-- Local JS Libraries -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-datetimepicker.min.js"></script>

    <!-- Socket.io -->
    <!-- <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script> -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/socket.io.min.js"></script>

    <!-- App-Specific JS -->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/off-canvas.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/hoverable-collapse.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/template.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/settings.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/todolist.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/General.js?v=2.0"></script>

    <!-- select2 -->
    <script src="<?php echo base_url(); ?>assets/js/select2/select2.full.min.js"></script>

    <!-- =======-->


    <script type="text/javascript">
        $(document).ready(function() {
            $("#trade_enable_off").on("click", function(e) {
                e.preventDefault();
                $('#tradeCloseAlert').modal('show');
            });
            $("#trade_enable_on").on("click", function(e) {
                e.preventDefault();
                window.location = "<?php echo base_url(); ?>index.php/c_main/enable_trade/1/0";
            });
            var socket_url = '<?php echo Globals::$socket_base_url; ?>';
            var socket = io(socket_url, {
                path: "/socket.io/",
                transports: ["websocket"], // 🔥 FORCE WEBSOCKET ONLY
                upgrade: false, // 🔥 DO NOT FALL BACK
                reconnection: true,
                reconnectionAttempts: Infinity, // keep retrying forever
                reconnectionDelay: 2000,
                timeout: 20000
            });
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

            <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
                showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
            <?php endif; ?>

            // Force Sidebar Accordion Behavior
            $(document).on('show.bs.collapse', '#sidebar-accordion .collapse', function() {
                $('#sidebar-accordion .collapse.show').not(this).collapse('hide');
            });
        });
    </script>
    <style type="text/css">
        .tradeOnOff {
            padding-top: 10px;
            font-size: 16px;
            color: #fafafa;
            float: right;
            padding-right: 50px;
        }

        .tradeOnOff .radiorates {
            padding-left: 20px;
        }

        .tradeOnOff .radiorates label {
            cursor: pointer;
        }

        .menu-arrow {
            float: right;
            margin-right: 10px;
            font-size: 12px;
        }
    </style>
    <script>
        var base_url = "<?php echo $this->config->item('base_url'); ?>";
    </script>

</head>

<body>
    <!-- Global Toast Container -->
    <div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>
    <?php if (!isset($no_visible_elements) || !$no_visible_elements) { ?>
        <!-- topbar starts -->
        <div class="container-scroller">
            <nav class="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                <div class="navbar-brand-wrapper d-flex justify-content-center">
                    <div class="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
                        <a class="navbar-brand brand-logo" href="#"><img
                                src="<?php echo $this->config->item('base_url') . $_admin_logo_file; ?>?v=<?php echo time(); ?>" alt="logo"
                                style="" /></a>
                        <a class="navbar-brand brand-logo-mini" href="#"><img
                                src="<?php echo $this->config->item('base_url') . $_admin_logo_file; ?>?v=<?php echo time(); ?>" alt="logo"
                                style="" /></a>
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
                                <!-- <img src="<?php echo $this->config->item('base_url'); ?>assets/img/logoicon.png" alt="profile"/> -->
                                <a class="navbar-brand navbar-brand1"
                                    href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">
                                    <span style=""><?php echo $this->general_model->get_companyname(); ?></span></a>
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
                        <!--<li class="nav-item nav-user-status dropdown">
			  <p class="mb-0 visitsite"><a href="<?php echo dirname($this->config->item('base_url')); ?>" target="_blank"> <i class="typcn typcn-home"></i> Visit Site</a></p>
		  </li>-->
                    </ul>
                    <ul class="navbar-nav navbar-nav-right">
                        <?php
                        $lite_trade = $this->db->select('lite_trade')->from('dt_generalsettings')->get()->row()->lite_trade ?? 0;

                        if (isset($lite_trade) && $lite_trade == 1) { ?>
                            <li class="nav-item nav-date dropdown">
                                <a class="nav-link d-flex justify-content-center align-items-center" href="javascript:;">
                                    <h6 class="date mb-0" style="align-items: center;display: flex;justify-content: center;">
                                        Trade : <div style="display:inline;" class="radiorates">
                                            <input checked type="radio" value="0" name="trade_OnOff" id="trade_enable_on"
                                                class="option-input radio" <?php if ($tradingStatus == 1) { ?> checked <?php } ?> /> <label for="trade_enable_on"> On</label>
                                            <input type="radio" value="1" name="trade_OnOff" id="trade_enable_off"
                                                class="option-input radio" <?php if ($tradingStatus == 0) { ?> checked <?php } ?> /> <label for="trade_enable_off">Off</label>
                                        </div>
                                    </h6>

                                </a>
                            </li>
                        <?php } ?>
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
                        <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/listing/3" title="Deal Register"><i class="typcn typcn-document-text"></i></a>
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
                                <p class="mb-0">Main Dashboard</p>
                            </div>
                        </li>
                    </ul>
                    <!--<ul class="navbar-nav navbar-nav-right">
		  <li class="nav-item nav-search d-none d-md-block mr-0">
			<div class="input-group">
			  <input type="text" class="form-control" placeholder="Search..." aria-label="search" aria-describedby="search">
			  <div class="input-group-prepend">
				<span class="input-group-text" id="search">
				  <i class="typcn typcn-zoom"></i>
				</span>
			  </div>
			</div>
		  </li>
		</ul>-->
                </div>

            </nav>
        <?php } ?>
        <div class="container-fluid page-body-wrapper">

            <?php if (!isset($no_visible_elements) || !$no_visible_elements) { ?>

                <!-- left menu starts -->
                <nav class="sidebar sidebar-offcanvas" id="sidebar">
                    <?php
                    $menu = $this->login_model->menu_generation($cur_userid);
                    if (isset($menu)) {
                        echo $menu;
                    }
                    ?>
                    <ul class="nav help_disk" style="margin-bottom: 0px !important; padding-top: 0px !important;">
						<li class="nav-item">
							<a class="nav-link" href="<?php echo $this->config->item('base_url'); ?>index.php/C_career_applications/listing">
								<i class="typcn typcn-group-outline menu-icon" style="color:#2fa4e7; margin-right:15px; font-size:18px;"></i>
								<span class="menu-title">Career Applications</span>
							</a>
						</li>
					</ul>
                    <ul class="nav help_disk">
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <i class="glyphicon glyphicon-phone-alt" style="color:#2fa4e7"></i>
                                <span class="menu-title">Help Desk</span>
                            </a>
                        </li>
                    </ul>
                    <ul class="nav" style="margin-top:0px;">
                        <li class="nav-item">
                            <a class="nav-link" href="tel:+919585554799">
                                <i class="glyphicon glyphicon-phone" style="color:#2fa4e7"></i>
                                <span class="menu-title">+91 9585554799</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="tel:+919585554899">
                                <i class="glyphicon glyphicon-phone" style="color:#2fa4e7"></i>
                                <span class="menu-title">+91 9585554899</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="tel:+919585554999">
                                <i class="glyphicon glyphicon-phone" style="color:#2fa4e7"></i>
                                <span class="menu-title">+91 9585554999</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                <!-- Help Desk -->


                <div class="modal fade" id="tradeCloseAlert" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close clx" data-bs-dismiss="modal">×</button>
                                <h3>Trade close alert!</h3>
                            </div>
                            <div class="modal-body">
                                <p>You are about to close the trade.Do you want to clear pending limit orders?
                                </p>
                                <div><b>Yes</b> -> Cancel any pending limit orders and close the trade.</div>
                                <div><b>No</b> -> Trade will be closed. Limit orders can still be executed on trade close.
                                </div>
                                <div><b>Cancel</b> -> Just to close this dialog box.</div>
                            </div>
                            <div class="modal-footer">
                                <a href="<?php echo base_url(); ?>index.php/c_main/enable_trade/0/1"
                                    class="btn btn-danger">Yes</a>
                                <a href="<?php echo base_url(); ?>index.php/c_main/enable_trade/0/0"
                                    class="btn btn-success btn-sm">No</a>
                                <a href="#" class="btn btn-primary" data-bs-dismiss="modal">Cancel</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!--/span-->
                <!-- left menu ends -->

                <noscript>
                    <div class="alert alert-block col-md-12">
                        <h4 class="alert-heading">Warning!</h4>

                        <p>You need to have <a href="http://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a>
                            enabled to use this site.</p>
                    </div>
                </noscript>

                <div id="content" class="col-lg-10 col-sm-12">
                    <!-- content starts -->
                <?php } ?>
