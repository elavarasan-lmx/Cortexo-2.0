<?php
$controller_name = "C_customerDelivery";
$model_name      = "Customerdelivery_model";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <!--
        ===
        This comment should NOT be removed.

        Winbull Lite v2.0.0

        Copyright 2012-2014 Logimax Technologies

    -->
    <?php
    $cur_userid    = $this->login_model->get_userid();
    $tradingStatus = $this->login_model->get_tradingEnable();
    ?>
    <meta charset="utf-8">
    <title>Deal Register</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Winbull Lite, a fully featured, responsive,">
    <meta name="author" content="Logimax Technologies">

    <!-- === STYLESHEETS ===-->
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/typicons/typicons.css">
    <link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/new/style.css">
    <link id="bs-css" href="<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-cerulean.min.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/lmx-app.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/customize.css" rel="stylesheet">
    <link href="<?php echo base_url(); ?>assets/css/radiobuttons.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/bower_components/responsive-tables/responsive-tables.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.min.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/elfinder.theme.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/jquery.iphone.toggle.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/uploadify.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/animate.min.css" rel="stylesheet">
    <!--<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-glyphicons/1.0.0/css/bootstrap-glyphicons.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">-->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap-icons.min.css" rel="stylesheet">
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/all.min.css" rel="stylesheet">
    <link rel="shortcut icon" href="<?php echo $this->config->item('base_url'); ?>favicon.ico">
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-datetimepicker.css' rel='stylesheet'>
    <link href="<?php echo $this->config->item('base_url'); ?>assets/toaster/toastr.css" rel="stylesheet">

    <!-- === JAVASCRIPT ====-->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
    <!--<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>-->
    <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap.min.css" rel="stylesheet">
    <script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/bootstrap.bundle.min.js'></script>

    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-datetimepicker.min.js"></script>

    <!--<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>-->
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/socket.io.min.js"></script>

    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/off-canvas.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/hoverable-collapse.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/template.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/settings.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/new/todolist.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/General.js"></script>
    <script src="<?php echo base_url(); ?>assets/js/select2/select2.full.min.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/toaster/toastr.js"></script>
    <script>
        var base_url = "<?php echo $this->config->item('base_url'); ?>";
    </script>

    <script type="text/javascript">
        function IND_money_format(x) {
            if (typeof x != 'undefined' && x != null) {
                x = x.toString();
                var afterPoint = '';
                if (x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'), x.length);
                x = Math.floor(x);
                x = x.toString();
                var lastThree = x.substring(x.length - 3);
                var otherNumbers = x.substring(0, x.length - 3);
                if (otherNumbers != '')
                    lastThree = ',' + lastThree;
                var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

                return res;
            } else {
                return x;
            }
        }

        $(function() {
            $('#from_date').datetimepicker({
                pickTime: false
            });
            $('#to_date').datetimepicker({
                pickTime: false
            });
            $("#comType").change(function() {
                get_data();
            });
            $("#refresh_page").click(function(event) {
                event.preventDefault();
                get_data();
            });

            // BZ-28 and BZ-29: Removed inline click handlers for #expand and #expand_filter.
            // These buttons are now handled globally by admin/assets/js/lmx.js.
            // Having duplicates here caused them to fire simultaneously and cancel the toggle effect.
        });

        jQuery(document).ready(function() {
            <?php
            $result_set = $this->$model_name->get_transactiondate();
            foreach ($result_set->result() as $row) {
            ?>
                document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
                document.getElementById('to_date').value = "<?php echo $row->to_date; ?>";
            <?php
            }
            $result_set->free_result();
            ?>
        });
    </script>

    <?php
    // BZ-26: Removed the duplicate, unclosed "printForm" block that was causing
    // the "Excel" button to send an empty "clickprocess" and fall back to print view.
    ?>
    <script type="text/javascript">
        $(document).ready(function() {
            $("#trade_enable_off").on("click", function(e) {
                e.preventDefault();
                $('#tradeCloseAlert').modal('show');
            });
            $("#trade_enable_on").on("click", function(e) {
                e.preventDefault();
                window.location = "<?php echo base_url() ?>index.php/c_main/enable_trade/1/0";
            });

            var socket_url = '<?php echo Globals::$socket_base_url ?>';
            	var socket = io(socket_url, {
		path: "/socket.io/",
		transports: ["websocket"],     // 🔥 FORCE WEBSOCKET ONLY
		upgrade: false,                // 🔥 DO NOT FALL BACK
		reconnection: true,
		reconnectionAttempts: Infinity, // keep retrying forever
		reconnectionDelay: 2000,
		timeout: 20000
	});
            socket.on("<?php echo Globals::$evt_trdstatusupdate ?>", function(data) {
                console.log(data);
                if (typeof data.updatedata !== 'undefined') {
                    var tradingstatus = data.updatedata;
                    $(tradingstatus).each(function(count_i, status) {
                        if (status.client == '<?php echo Globals::$client ?>') {
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
        });
    </script>

    <style type="text/css">
        /* Fix DataTable scroll wrappers to be responsive on zoom in/out */
        .dataTables_scrollHeadInner,
        .dataTables_scrollBody table {
            width: 100% !important;
        }

        .dataTables_filter input {
            margin-left: -65px;
        }

        /* Add space below Search and Show Entries */
        .dataTables_filter,
        .dataTables_length {
            margin-bottom: 10px !important;
        }

        #ajax_loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
        }

        #ajax_loader img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .morefilter-btn {
            cursor: pointer;
            color: #001737;
            border: 1px solid #ced4da;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            background: #fff;
            transition: all 0.2s;
            display: inline-block;
        }

        .morefilter-btn:hover {
            background: #f8f9fa;
            border-color: #adb5bd;
            text-decoration: none;
        }

        .label-total {
            font-weight: 600;
            color: #6c757d;
            font-size: 13px;
        }

        .values-total {
            font-weight: 700;
            color: #343a40;
            margin-left: 5px;
        }

        .filter-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .add_new {
            margin-top: 0px;
        }

        .excel,
        .Print {
            margin-right: 0px;
        }

    </style>
</head>

<body>
    <!-- Global Toast Container -->
    <div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>
    <?php if (! isset($no_visible_elements) || ! $no_visible_elements) { ?>
        <!-- topbar starts -->
        <div class="container-scroller">
            <nav class="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                <div class="navbar-brand-wrapper d-flex justify-content-center">
                    <div class="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
                        <a class="navbar-brand brand-logo" href="#"><img src="<?php echo $this->config->item('base_url'); ?>assets/img/logo.png" alt="logo" style="" /></a>
                        <button class="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
                            <span class="typcn typcn-th-menu"></span>
                        </button>
                    </div>
                </div>
                <div class="navbar-menu-wrapper d-flex align-items-center justify-content-end">
                    <ul class="navbar-nav mr-lg-2">
                        <li class="nav-item nav-profile dropdown">
                            <a class="nav-link" href="#" data-toggle="dropdown" id="profileDropdown">
                                <a class="navbar-brand navbar-brand1" href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">
                                    <span style=""><?php echo $this->general_model->get_companyname(); ?></span></a>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
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
                                        <input checked type="radio" value="0" name="trade_OnOff" id="trade_enable_on" class="option-input radio" <?php if ($tradingStatus == 1) { ?> checked<?php } ?> /> <label for="trade_enable_on"> On</label>
                                        <input type="radio" value="1" name="trade_OnOff" id="trade_enable_off" class="option-input radio" <?php if ($tradingStatus == 0) { ?> checked<?php } ?> /> <label for="trade_enable_off">Off</label>
                                    </div>
                                </h6>
                            </a>
                        </li>
                        <li class="nav-item nav-date dropdown">
                            <a class="nav-link d-flex justify-content-center align-items-center" href="<?php echo dirname($this->config->item('base_url')); ?>" target="_blank">
                                <i class="typcn typcn-home"></i>
                            </a>
                        </li>
                        <li class="nav-item dropdown mr-0">
                            <a class="nav-link count-indicator dropdown-toggle d-flex align-items-center justify-content-center" id="notificationDropdown" href="#" data-toggle="dropdown">
                                <i class="typcn typcn-user"></i><span class="hidden-sm hidden-xs"><?php echo $this->session->userdata('username'); ?></span>
                                <span class="caret"></span>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
                                <a class="preview-item preview-item1">
                                    <div class="preview-thumbnail">
                                        <div class="preview-icon bg-success">
                                            <i class="typcn typcn-lock-closed mx-0"></i>
                                        </div>
                                    </div>
                                    <div class="preview-item-content preview-item-content1">
                                        <h6 class="preview-subject font-weight-normal"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_change_psw/open_entry_form">Change Password</a></h6>
                                    </div>
                                </a>
                                <a class="preview-item preview-item1 preview-item2">
                                    <div class="preview-thumbnail">
                                        <div class="preview-icon bg-warning">
                                            <i class="typcn typcn-cog-outline mx-0"></i>
                                        </div>
                                    </div>
                                    <div class="preview-item-content preview-item-content1 preview-item-content2">
                                        <h6 class="preview-subject font-weight-normal"><a href='<?php echo $this->config->item('base_url'); ?>index.php/C_main/logout'>Logout</a></h6>
                                    </div>
                                </a>
                            </div>
                        </li>
                    </ul>
                    <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
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
                                <p class="mb-0"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage" style="color:#fff">Home</a></p>
                                <i class="typcn typcn-chevron-right"></i>
                                <p class="mb-0">Deal Register</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        <?php } ?>

        <?php
        $cus_group = "Default";
        ?>

        <a style="display:none" class="btn btn-primary noty" data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
            <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
        </a>

        <div class="main-panel" style="margin-top:40px;">
            <div class="content-wrapper">
                <div class="row">
                    <div class="col-lg-12 grid-margin stretch-card">
                        <div class="card antigravity">
                            <div class="card-body">

                                <div class="header-container">
                                    <h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Deal Register (<i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i>)</h4>
                                    <div class="d-flex align-items-center" style="gap: 10px; display: flex;">
                                        <!-- Column Visibility Dropdown -->
                                        <div class="dropdown">
                                            <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="colVisDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                Col Visibility
                                            </button>
                                            <div class="dropdown-menu" aria-labelledby="colVisDropdown" style="max-height: 300px; overflow-y: auto;">
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="0" checked> Checkbox</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="1" checked> B.No</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="2" checked> Req Type</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="3" checked> Book Type</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="4" checked> B.Date</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="5" checked> Book cus</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="6" checked> Book Company</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="7" checked> Mobile No</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="8" checked> Com.Type</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="9" checked> Com.Name</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="10" checked> B.Qty(gms)</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="11" checked> Del.Qty(gms)</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="12" checked> Book Rate</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="13" checked> Total</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="14" checked> User Comment</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="15" checked> Admin Comment</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="16" checked> B.Status</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="17" checked> Del.Status</label></a>
                                                <a class="dropdown-item"><label><input type="checkbox" class="col-toggle" data-column="19" checked> Action</label></a>
                                            </div>
                                        </div>

                                        <span id="expand" class="morefilter-btn">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                        <span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                        <!-- BZ-26: Changed href to # so only JS handler fires (was pointing to wrong pending_deliveryexcel URL) -->
                                        <a href="#" class="btn btn-danger btn-sm" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
                                        <a onclick="print_form(event)" class="btn btn-primary btn-sm" href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                                        <?php if ($userrights["delete"] == 1) { ?>
                                            <a onclick="delete_selectedRecords(event)" class="btn btn-warning btn-sm deliver">
                                                <i class="typcn typcn-delete-outline btn-icon-append"></i> Delete
                                            </a>
                                        <?php } ?>
                                    </div>
                                </div>

                                <p class="card-description"> </p>

                                <?php
                                $attributes = ['class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank'];
                                echo form_open('C_customerDelivery/print_record/DR/' . $model_name, $attributes);
                                ?>
                                <input type="hidden" id="clickid" name="clickprocess" value="">
                                <div id="BookNos"></div>

                                <div class="col-md-12">
                                    <?php if ($this->session->flashdata('success')) { ?>
                                        <script>
                                            showToast('<?php echo addslashes($this->session->flashdata('success')); ?>', 'success');
                                        </script>
                                    <?php } else if ($this->session->flashdata('error')) { ?>
                                        <script>
                                            showToast('<?php echo addslashes($this->session->flashdata('error')); ?>', 'danger');
                                        </script>
                                    <?php } ?>
                                </div>

                                <div class="row form-sample1" id="expand_details" style="margin-top:30px;display: none;">
                                    <div class="col-md-3 col-sm-6 col-xs-12">
                                        <div class="col-md-12">
                                            <span class="label-total">Sell gold B.Qty(gms) : </span> <span class="values-total" id="sellgoldqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span> <span class="values-total" id="sellgoldavg">0.00</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                        <div class="col-md-12">
                                            <span class="label-total">Sell silver B.Qty(Kg) : </span> <span class="values-total" id="sellsilverqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg :</span> <span class="values-total" id="sellsilveravg">0.00</span>
                                        </div>
                                    </div>

                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px">
                                        <div class="col-md-12">
                                            <span class="label-total">Buy gold B.Qty(gms) : </span> <span class="values-total" id="buygoldqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span><span class="values-total" id="buygoldavg">0.00</span>
                                        </div>
                                    </div>

                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                        <div class="col-md-12">
                                            <span class="label-total">Buy silver B.Qty(Kg) : </span> <span class="values-total" id="buysilverqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span> <span class="values-total" id="buysilveravg">0.00</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="box-content">
                                    <div class="filter-card card" style="display: none; margin-top: 20px; border: 1px solid #ced4da; background: #fdfdfd; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" id="expand_filter_details">
                                        <div class="card-body" style="padding: 15px;">
                                            <div class="row">
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Commodity Type</label>
                                                        <select id="comType" class="form-control form-control-sm">
                                                            <option value="-1">All</option>
                                                            <option value="0">GOLD</option>
                                                            <option value="1">SILVER</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Book Type</label>
                                                        <select onchange="get_data();" id="oType" class="form-control form-control-sm">
                                                            <option value="-1" selected="selected">All</option>
                                                            <option value="0">Book</option>
                                                            <option value="1">Limit</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Trade Type</label>
                                                        <select onchange="get_data();" id="book_type" class="form-control form-control-sm">
                                                            <option value="-1" selected="selected">All</option>
                                                            <option value="0">Sell</option>
                                                            <option value="1">Buy</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Commodity Name</label>
                                                        <select onchange="get_data();" id="comID" class="form-control form-control-sm">
                                                            <?php foreach ($comm as $val) { ?>
                                                                <option value="<?php echo $val['com_id']; ?>"><?php echo $val['com_name']; ?></option>
                                                            <?php } ?>
                                                            <option value="-1" selected="selected">All</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Customer</label>
                                                        <select onchange="get_data();" id="customer_id" class="form-control form-control-sm">
                                                            <option value="-1" selected="selected">All</option>
                                                            <?php foreach ($customers as $val) { ?>
                                                                <option value="<?php echo $val['cus_id']; ?>"><?php echo $val['customer']; ?></option>
                                                            <?php } ?>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">Status</label>
                                                        <select onchange="get_data();" id="status" class="form-control form-control-sm">
                                                            <option value="-1" selected="selected">All</option>
                                                            <option value="0">Confirmed</option>
                                                            <option value="1">Pending</option>
                                                            <option value="2">Delivered</option>
                                                            <option value="3">Partial Delivered</option>
                                                            <option value="4">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">From Date</label>
                                                        <div class="input-group">
                                                            <input type="text" name="from_date" id="from_date" readonly="true" value="" data-date-format="DD-MM-YYYY" class="form-control form-control-sm" />
                                                            <span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total">To Date</label>
                                                        <div class="input-group">
                                                            <input type="text" name="to_date" id="to_date" readonly="true" value="" data-date-format="DD-MM-YYYY" class="form-control form-control-sm" />
                                                            <span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="form-group">
                                                        <label class="label-total" style="visibility: hidden;">Search</label>
                                                         <button type="button" class="btn btn-info btn-sm btn-block" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
                                        <thead>
                                            <tr>
                                                <th style="text-align:center"><input type="checkbox" class="check_all" /></th>
                                                <th style="text-align:center">B.No</th>
                                                <th style="text-align:center">Req Type</th>
                                                <th style="text-align:center">Book Type</th>
                                                <th style="text-align:center">B.Date</th>
                                                <th style="text-align:center">Book cus</th>
                                                <th style="text-align:center">Book Company</th>
                                                <th style="text-align:center">Mobile No</th>
                                                <th style="text-align:center">Com.Type</th>
                                                <th style="text-align:center">Com.Name</th>
                                                <th style="text-align:center">B.Qty(gms)</th>
                                                <th style="text-align:center">Del.Qty(gms)</th>
                                                <th style="text-align:center">Book Rate</th>
                                                <th style="text-align:center">Total</th>
                                                <th style="text-align:center">User Comment</th>
                                                <th style="text-align:center">Admin Comment</th>
                                                <th style="text-align:center">B.Status</th>
                                                <th style="text-align:center">Del.Status</th>
                                                <th style="display:none"></th>
                                                <th style="text-align:center">Action</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- AJAX LOADER OVERLAY -->
            <div id="ajax_loader">
                <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
            </div>
            <!-- partial -->
        </div>

        <div class="modal fade" id="delDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">

            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close clx" data-dismiss="modal">�</button>
                        <h3>Delete</h3>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure! You want to delete the record(s)...</p>
                    </div>
                    <div class="modal-footer">
                        <a href="#" class="btn btn-danger" id="confirm_del" data-dismiss="modal">Confirm</a>
                        <a href="#" class="btn btn-primary clx" data-dismiss="modal">Cancel</a>
                    </div>
                </div>
            </div>
        </div>


        <?php echo form_close(); ?>
        <?php
        $attributes = ['id' => 'delete_bookings'];
        echo form_open('C_customerDelivery/delete_selectedRecords', $attributes); ?>
        <div id="booking_numbers"></div>
        </form>

        <script type="text/javascript">
            calc_total();

            // Column Visibility Handler
            $(document).on("change", ".col-toggle", function(e) {
                e.preventDefault();
                if (typeof oTable !== 'undefined' && oTable !== null) {
                    var api = oTable.api ? oTable.api() : oTable;
                    var colIdx = parseInt($(this).attr('data-column'));
                    var column = api.column(colIdx);
                    column.visible(!column.visible());
                    // Recalculate column widths after toggle
                    api.columns.adjust().draw(false);
                }
            });

            // Stop dropdown from closing on click
            $(document).on('click', '.dropdown-menu', function(e) {
                e.stopPropagation();
            });

            $('#clickexcel').on('click', function(e) {
                e.preventDefault();
                var flag = false;
                var data = document.getElementById('BookNos');
                data.innerHTML = "";
                if (typeof oTable !== 'undefined' && oTable !== null) {
                    var api = oTable.api ? oTable.api() : oTable;
                    api.rows({ search: 'applied' }).nodes().each(function(row) {
                        var bookNo = $(row).find(".BookNo").text().trim();
                        if (bookNo !== "" && bookNo !== "-" && !isNaN(bookNo)) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + bookNo + "' />";
                        }
                    });
                } else {
                    $("#grid-data tbody").find("tr").each(function(index, value) {
                        var bookNo = $(this).find(".BookNo").text().trim();
                        if (bookNo !== "" && bookNo !== "-" && !isNaN(bookNo)) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + bookNo + "' />";
                        }
                    });
                }
                if (!flag) {
                    showToast("No records found to export.");
                    return;
                }
                // Add Report Header Information
                var clientName = "<?php echo $this->session->userdata('company_name'); ?>";
                var fromDate = $("#from_date").val();
                var toDate = $("#to_date").val();
                var printTime = new Date().toLocaleString();
                data.innerHTML += "<input type='hidden' name='report_client' value='" + clientName + "' />";
                data.innerHTML += "<input type='hidden' name='report_from_date' value='" + fromDate + "' />";
                data.innerHTML += "<input type='hidden' name='report_to_date' value='" + toDate + "' />";
                data.innerHTML += "<input type='hidden' name='report_generated_on' value='" + printTime + "' />";
                $('#clickid').val(2);
                document.forms["printForm"].submit();
            });

            $(window).load(function() {
                get_data();
            });



            $(document).on("click", ".check_all", function() {
                if ($(this).is(":checked")) {
                    $(".chkbox").prop('checked', true);
                } else {
                    $(".chkbox").prop('checked', false);
                }
            });

            function print_form(e) {
                e.preventDefault();
                var flag = false;
                var data = document.getElementById('BookNos');
                data.innerHTML = "";
                if (typeof oTable !== 'undefined' && oTable !== null) {
                    var api = oTable.api ? oTable.api() : oTable;
                    api.rows({ search: 'applied' }).nodes().each(function(row) {
                        var bookNo = $(row).find(".BookNo").text().trim();
                        if (bookNo !== "" && bookNo !== "-" && !isNaN(bookNo)) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + bookNo + "' />";
                        }
                    });
                } else {
                    $("#grid-data tbody").find("tr").each(function(index, value) {
                        var bookNo = $(this).find(".BookNo").text().trim();
                        if (bookNo !== "" && bookNo !== "-" && !isNaN(bookNo)) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + bookNo + "' />";
                        }
                    });
                }

                if (!flag) {
                    showToast("No records found to print.");
                    return;
                }

                var order_by = " ORDER BY ";
                if (oTable.fnSettings().aaSorting[0][0] == 1)
                    order_by = order_by + " book_no ";
                else if (oTable.fnSettings().aaSorting[0][0] == 2)
                    order_by = order_by + " ordertype ";
                else if (oTable.fnSettings().aaSorting[0][0] == 3)
                    order_by = order_by + " book_datetime ";
                else if (oTable.fnSettings().aaSorting[0][0] == 4)
                    order_by = order_by + " cus_alise_name ";
                else if (oTable.fnSettings().aaSorting[0][0] == 5)
                    order_by = order_by + " cus_city ";
                else if (oTable.fnSettings().aaSorting[0][0] == 7)
                    order_by = order_by + " com_name ";
                else if (oTable.fnSettings().aaSorting[0][0] == 8)
                    order_by = order_by + " book_qty ";
                else if (oTable.fnSettings().aaSorting[0][0] == 9)
                    order_by = order_by + " book_rate ";
                else if (oTable.fnSettings().aaSorting[0][0] == 10)
                    order_by = order_by + " round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) ";
                else
                    order_by = order_by + " book_no ";
                order_by = order_by + oTable.fnSettings().aaSorting[0][1];
                data.innerHTML += "<input type='hidden' name='order_by' value='" + order_by + "' />";

                // Add Report Header Information
                var clientName = "<?php echo $this->session->userdata('company_name'); ?>";
                var fromDate = $("#from_date").val();
                var toDate = $("#to_date").val();
                var printTime = new Date().toLocaleString();

                data.innerHTML += "<input type='hidden' name='report_client' value='" + clientName + "' />";
                data.innerHTML += "<input type='hidden' name='report_from_date' value='" + fromDate + "' />";
                data.innerHTML += "<input type='hidden' name='report_to_date' value='" + toDate + "' />";
                data.innerHTML += "<input type='hidden' name='report_generated_on' value='" + printTime + "' />";

                $('#clickid').val(3);
                document.forms["printForm"].submit();
            }

            function calc_total() {
                var sellgoldqty = 0;
                var sellsilverqty = 0;

                var buygoldqty = 0;
                var buysilverqty = 0;

                var sellgoldavg = 0;
                var sellsilveravg = 0;

                var buygoldavg = 0;
                var buysilveravg = 0;

                var sellgoldtotal = 0;
                var sellsilvertotal = 0;

                var buygoldtotal = 0;
                var buysilvertotal = 0;

                if (typeof oTable != 'undefined') {
                    oTable.$('tr', {
                        "filter": "applied"
                    }).each(function(index, value) {

                        var book_type = $(this).find('.book_type').html().toUpperCase();
                        var comType = parseFloat($(this).attr('data-comtype')) || 0;
                        if (book_type == 'SELL') {
                            if (comType == 1) {
                                sellsilverqty = parseFloat(sellsilverqty) + parseFloat($(this).find(".qty").html());
                                sellsilvertotal = parseFloat(sellsilvertotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                            } else {
                                sellgoldqty = parseFloat(sellgoldqty) + parseFloat($(this).find(".qty").html());
                                sellgoldtotal = parseFloat(sellgoldtotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                            }
                        } else {
                            if (comType == 1) {
                                buysilverqty = parseFloat(buysilverqty) + parseFloat($(this).find(".qty").html());
                                buysilvertotal = parseFloat(buysilvertotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                            } else {
                                buygoldqty = parseFloat(buygoldqty) + parseFloat($(this).find(".qty").html());
                                buygoldtotal = parseFloat(buygoldtotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                            }
                        }
                    });

                    sellgoldavg = sellgoldqty > 0 ? sellgoldtotal / sellgoldqty : 0.00;
                    sellsilveravg = sellsilverqty > 0 ? sellsilvertotal / sellsilverqty : 0.00;

                    buygoldavg = buygoldqty > 0 ? buygoldtotal / buygoldqty : 0.00;
                    buysilveravg = buysilverqty > 0 ? buysilvertotal / buysilverqty : 0.00;
                }
                sellgoldqty = isNaN(sellgoldqty) ? 0.00 : sellgoldqty.toFixed(3);
                sellgoldavg = isNaN(sellgoldavg) ? 0.00 : sellgoldavg.toFixed(2);
                sellsilverqty = isNaN(sellsilverqty) ? 0.00 : (sellsilverqty / 1000).toFixed(3);
                sellsilveravg = isNaN(sellsilveravg) ? 0.00 : (sellsilveravg * 1000).toFixed(2);

                buygoldqty = isNaN(buygoldqty) ? 0.00 : buygoldqty.toFixed(3);
                buygoldavg = isNaN(buygoldavg) ? 0.00 : buygoldavg.toFixed(2);
                buysilverqty = isNaN(buysilverqty) ? 0.00 : (buysilverqty / 1000).toFixed(3);
                buysilveravg = isNaN(buysilveravg) ? 0.00 : (buysilveravg * 1000).toFixed(2);

                $("#sellgoldqty").html(sellgoldqty);
                $("#sellgoldavg").html(IND_money_format(sellgoldavg));

                $("#sellsilverqty").html(sellsilverqty);
                $("#sellsilveravg").html(IND_money_format(sellsilveravg));

                $("#buygoldqty").html(buygoldqty);
                $("#buygoldavg").html(IND_money_format(buygoldavg));

                $("#buysilverqty").html(buysilverqty);
                $("#buysilveravg").html(IND_money_format(buysilveravg));
            }

            function delete_selectedRecords(e) {
                e.preventDefault();

                let flag = false;
                let data = $("#booking_numbers");
                data.empty();

                $("#grid-data tbody tr").each(function(i, row) {

                    if ($(row).find(".chkbox").is(":checked")) {
                        flag = true;

                        let bookno = $(row).find(".BookNo").text().trim();

                        data.append(
                            "<input type='hidden' name='book_nos[]' value='" + bookno + "' />"
                        );
                    }
                });

                if (flag) {
                    showConfirmModal(
                        'Delete Confirmation',
                        'Are you sure you want to delete the selected booking(s)?',
                        function() {
                            $('#ajax_loader').show();
                            $("#delete_bookings").submit();
                        }
                    );
                } else {
                    showToast("Please select the booking!");
                }
            }


            function get_data() {
                try {
                    $('#ajax_loader').show();
                    var table = '';
                    table += '<table id="grid-data" class="table table-bordered bootstrap-datatable datatable responsive">';
                    table += '<thead><tr>' +
                        '<th style="text-align:center"><input type="checkbox" class="check_all" /></th>' +
                        '<th style="text-align:center">B.No</th>' +
                        '<th style="text-align:center">Req Type</th>' +
                        '<th style="text-align:center">Book Type</th>' +
                        '<th style="text-align:center">B.Date</th>' +
                        '<th style="text-align:center">Book cus</th>' +
                        '<th style="text-align:center">Book Company</th>' +
                        '<th style="text-align:center">Mobile No</th>' +
                        '<th style="text-align:center">Com.Type</th>' +
                        '<th style="text-align:center">Com.Name</th>' +
                        '<th style="text-align:center">B.Qty<br>(gms)</th>' +
                        '<th style="text-align:center">Del.Qty<br>(gms)</th>' +
                        '<th style="text-align:center">Book Rate</th>' +
                        '<th style="text-align:center">Total</th>' +
                        '<th style="text-align:center">User Comment</th>' +
                        '<th style="text-align:center">Admin Comment</th>' +
                        '<th style="text-align:center">B.Status</th>' +
                        '<th style="text-align:center">Del.Status</th>' +
                        '<th style="display:none"></th>' +
                        '<th style="text-align:center">Action</th>' +
                        '</tr></thead><tbody>';
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/tradingStatus_dataload/" . $model_name; ?>/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value + "/" + document.getElementById('oType').value + "/" + document.getElementById('status').value + "/" + document.getElementById('comID').value + "/" + document.getElementById('comType').value + "/" + document.getElementById('book_type').value + "/" + document.getElementById('customer_id').value,
                        success: function(data) {
                            $('#ajax_loader').hide();
                            var table_val = '';
                            var status = '';
                            var delstatus = '';
                            var delivstatus = 0;

                            // Safe value helpers - prevent "null" and "NaN" display
                            var sv = function(val, def) { return (val !== null && val !== undefined && val !== '') ? val : (def || '-'); };
                            var sn = function(val) { var n = parseFloat(val); return isNaN(n) ? 0 : n; };

                            $.each(data.opening, function(index, opening) {
                                var commType = opening.com_type == 1 ? "Silver" : "Gold";

                                table_val += '<tr data-comtype="' + sv(opening.com_type, '0') + '">' +
                                    '<td></td>' +
                                    '<td>Opening Balance</td>' +
                                    '<td>-</td>' +
                                    '<td>-</td>' +
                                    '<td>-</td>' +
                                    '<td>' + sv(opening.customername) + '</td>' +
                                    '<td>' + sv(opening.cus_alise_name) + '</td>' +
                                    '<td>-</td>' +
                                    '<td>' + commType + '</td>' +
                                    '<td>' + sv(opening.commodityname) + '</td>' +
                                    '<td class="qty">' + sn(sn(opening.cus_open_qty) * 1000) + '</td>' +
                                    '<td>-</td>' +
                                    '<td class="rate">' + IND_money_format(sn(opening.cus_open_rate)) + '</td>' +
                                    '<td class="amount">' + IND_money_format(sn(opening.book_totalcost)) + '</td>' +
                                    '<td>-</td>' +
                                    '<td>-</td>' +
                                    '<td>-</td>' +
                                    '<td>-</td>' +
                                    '<td style="display:none" class="com_type">' + sv(opening.com_type, '0') + '</td>' +
                                    '<td>-</td>' +
                                    '</tr>';
                            });

                            var data = data.trade;
                            $.each(data, function(i) {
                                var del_revert = '';
                                var oType = data[i]['ordertype'] == 0 ? "Book" : "Limit";
                                var commType = data[i]['com_type'] == 1 ? "Silver" : "Gold";

                                var del_link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/delete_booking/1/<?php echo $model_name; ?>/" + data[i]['bookno'];

                                var revert_link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/revert_delivery/<?php echo $model_name; ?>/" + data[i]['bookno'];
                                if (data[i]['book_status'] > 0 || data[i]['ordertype'] == 0) {
                                    status = (data[i]['book_status'] == 0 ? '<span class="badge" style="background-color:#ffc107; color:#000; padding:5px 10px; font-size:11px;">Pending</span>' : (data[i]['book_status'] == 2 ? '<span class="badge" style="background-color:#17a2b8; color:#fff; padding:5px 10px; font-size:11px;">Hold</span>' : (data[i]['book_status'] == 1 ? '<span class="badge" style="background-color:#28a745; color:#fff; padding:5px 10px; font-size:11px;">Confirmed</span>' : '<span class="badge" style="background-color:#dc3545; color:#fff; padding:5px 10px; font-size:11px;">Rejected</span>')));

                                    if ($.trim(data[i]['book_liveprice']) != '')
                                        var order_title = "Actual Live Price at the time of booking : " + IND_money_format(data[i]['book_liveprice']);
                                    else
                                        var order_title = "";
                                } else {
                                    status = (data[i]['orderstatus'] == 0 ? '<span class="badge" style="background-color:#ffc107; color:#000; padding:5px 10px; font-size:11px;">Pending</span>' : (data[i]['orderstatus'] == 2 ? '<span class="badge" style="background-color:#dc3545; color:#fff; padding:5px 10px; font-size:11px;">Cancelled by user</span>' : (data[i]['orderstatus'] == 1 ? '<span class="badge" style="background-color:#28a745; color:#fff; padding:5px 10px; font-size:11px;">Confirmed</span>' : (data[i]['orderstatus'] == 3 ? '<span class="badge" style="background-color:#8B0000; color:#fff; padding:5px 10px; font-size:11px;">Cancelled by admin</span>' : (data[i]['orderstatus'] == 4 ? '<span class="badge" style="background-color:#6c757d; color:#fff; padding:5px 10px; font-size:11px;">Expired</span>' : (data[i]['orderstatus'] == 5 ? '<span class="badge" style="background-color:#6c757d; color:#fff; padding:5px 10px; font-size:11px;">Cancelled, Insufficient margin</span>' : ''))))));

                                    var order_title = "Order Rate : " + IND_money_format(data[i]['book_rate']) + ", Actual Price : " + IND_money_format(data[i]['order_actualprice']) + ", Live Price :" + IND_money_format(data[i]['order_liveprice']);
                                }

                                if (data[i]['book_status'] == 1) {
                                    if (sn(data[i]['bookqty']) == sn(data[i]['BalanceQty'])) {
                                        delstatus = '<span class="badge" style="background-color:#ffc107; color:#000; padding:5px 10px; font-size:11px;">Pending</span>';
                                        delivstatus = 0;
                                    } else if (sn(data[i]['BalanceQty']) <= 0) {
                                        delstatus = '<span class="badge" style="background-color:#155724; color:#fff; padding:5px 10px; font-size:11px;">Delivered</span>';

                                        /*del_revert = '<a class="btn btn-warning btn-sm" data-toggle="modal" href='+revert_link+'>Del. Revert</a>';*/
                                        del_revert = '';
                                        delivstatus = 1;
                                    } else if (sn(data[i]['BalanceQty']) > 0) {
                                        delstatus = '<span class="badge" style="background-color:#28a745; color:#fff; padding:5px 10px; font-size:11px;">Partially Delivered</span>';
                                        delivstatus = 1;
                                    }
                                } else {
                                    delstatus = '<span class="badge" style="background-color:#e9ecef; color:#6c757d; padding:5px 10px; font-size:11px;">-</span>';
                                }

                                if (delivstatus == 0) {
                                    deal_transfer = '<a class="dealtransferDialog btn btn-primary btn-sm" data-toggle="modal" data-target="#dealtransferDialog" data-bookid="' + data[i]['bookno'] + '" data-cusid="' + sv(data[i]['bookcusid']) + '" href="#" style="display:none"><i class="glyphicon glyphicon-random icon-white"> </i> Transfer </a>';
                                } else {
                                    deal_transfer = "";
                                }
                                const bgColor = data[i]['unfix'] === '1' ? 'style="background-color:#FFCCCB;"' : '';

                                table_val += '<tr data-comtype="' + sv(data[i]['com_type'], '0') + '" ' + bgColor + '><td><input type="checkbox" class="chkbox" /></td><td class="BookNo">' + sv(data[i]['bookno']) + '</td><td>' + oType + '</td><td class="book_type">' + sv(data[i]['book_type']) + '</td><td>' + sv(data[i]['bookdate']) + '</td><td>' + sv(data[i]['customername']) + '</td><td>' + sv(data[i]['cus_company_name']) + '</td><td>' + sv(data[i]['cus_mobile']) + '</td><td>' + commType + '</td><td>' + sv(data[i]['commodityname']) + '</td><td class="qty">' + sn(sn(data[i]['bookqty']) * 1000) + '</td><td style="text-align:right;">' + sn(sn(data[i]['deliveredqty']) * 1000) + '</td><td class="rate" title="' + order_title + '">' + IND_money_format(sn(data[i]['book_rate'])) + '</td><td class="amount">' + IND_money_format(sn(data[i]['bookamount'])) + '</td><td>' + sv(data[i]['book_usercomment']) + '</td><td>' + sv(data[i]['book_narration']) + '</td><td style="text-align:center;">' + status + '</td><td style="text-align:center;">' + delstatus + '</td><td style="display:none" class="com_type">' + sv(data[i]['com_type'], '0') + '</td><td><?php if ($userrights["delete"] == 1) { ?>' + del_revert + '&nbsp;&nbsp;&nbsp;<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href=' + del_link + '> Delete</a> &nbsp; ' + deal_transfer + '<?php } ?></td></tr>';
                            });

                            //FixedHeader.destroy();
                            $('#grid-data').remove();
                            $('#grid-data_wrapper').remove();
                            var row_length = true;
                            if (table_val == '') {
                                table_val = '<tr><td colspan="16">No data available in table</td></tr>';
                                row_length = false;
                            }

                            table += table_val;
                            table += '</tbody>';
                            table += '</table>';
                            $('.box-content').append(table);

                            // $('.btn-confirm').on('click', function(e) {
                            //     e.preventDefault();
                            //     var link = $(this).attr('href');
                            //     $('#myDialog').find('#confirm').attr('href', link);
                            //     $('#myDialog').modal('show');
                            // });

                            // //for delete operation
                            // $('#myDialog #confirm').on('click', function() {
                            //     $('#myDialog').modal('hide');
                            //     $('body').removeClass('modal-open');
                            //     $('.modal-backdrop').remove();
                            //     window.location.href = $(this).attr('href');
                            //     return false;
                            // });

                            if (row_length) {
                                oTable = $('#grid-data').dataTable({
                                    "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
                                    "sPaginationType": "bootstrap",
                                    "order": [
                                        [1, "desc"]
                                    ],
                                    bSort: true,
                                    bInfo: true,
                                    bDestroy: true,
                                    scrollX: true,
                                    autoWidth: false,
                                    lengthMenu: [
                                        [10, 25, 50, 100, 250, -1],
                                        [10, 25, 50, 100, 250, "All"]
                                    ],
                                    "oLanguage": {
                                        "sLengthMenu": "_MENU_ records per page"
                                    },
                                    "columnDefs": [{
                                        "orderable": false,
                                        "targets": 0
                                    }, {
                                        targets: [10, 11, 12, 13], // Qty, D.Qty, Rate, Total
                                        className: 'dt-right'
                                    }, {
                                        "visible": false,
                                        "targets": 18
                                    }]
                                });
                            }

                            calc_total();
                            $("#grid-data thead th").attr("data-sortable", function(i, val) {
                                if (val != 'false') {
                                    $("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
                                }
                            });
                            $('#grid-data_filter label :input').keyup(function(event) {
                                calc_total();
                            });

                            $(document).on('click', '.btn-confirm', function(e) {
                                e.preventDefault();
                                var link = $(this).attr('href');
                                showConfirmModal(
                                    'Delete Confirmation',
                                    'Are you sure! You want to delete the record...',
                                    function() {
                                        $('#ajax_loader').show();
                                        window.location.href = link;
                                    }
                                );
                            });

                            calc_total();

                            // Recalculate column widths on window resize/zoom
                            $(window).off('resize.dtResize').on('resize.dtResize', function() {
                                clearTimeout(window._dtResizeTimer);
                                window._dtResizeTimer = setTimeout(function() {
                                    if (typeof oTable !== 'undefined' && oTable !== null) {
                                        var api = oTable.api ? oTable.api() : oTable;
                                        api.columns.adjust();
                                    }
                                }, 200);
                            });
                        },
                        error: function(request, error) {
                            $('#ajax_loader').hide();
                        }
                    });
                } catch (ex) {
                    //console.log(ex);
                }
            }

            $(document).on("click", ".dealtransferDialog", function() {
                var myBookId = $(this).data('bookid');
                var myCusId = $(this).data('cusid');
                $(".modal-body #deal_book_id").val(myBookId);
                $(".modal-body #deal_book_cusid").val(myCusId);
                $("#newcusID").val(-1);
            });

            $(document).on("click", "#deal-confirm", function(e) {
                e.preventDefault();
                if ($('#deal_book_cusid').val() != "" && $('#deal_book_id').val() != "" && $('#newcusID').val() != '-1' && $("#book_narration").val() != "") {
                    try {
                        NProgress.start();
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/deal_transfer",
                            data: {
                                "cust_id": $('#deal_book_cusid').val(),
                                "book_id": $("#deal_book_id").val(),
                                "newcusid": $('#newcusID').val(),
                                "narration": $("#book_narration").val()
                            },
                            success: function(data) {
                                if (data.success == true) {
                                    // toastr["success"](data.message);
                                    showToast(data.message, 'success');
                                    setTimeout(function() {
                                        window.location.reload(true);
                                    }, 2000);
                                } else {
                                    showToast("OOPS! Something error", 'danger');
                                    // toastr["error"](data.message);
                                }
                            },
                            error: function(request, error) {
                                // toastr["error"](error);
                                showToast("OOPS! Something error", 'danger');
                            }
                        }).done(function() {
                            NProgress.done();
                        });
                    } catch (ex) {
                        // toastr["error"](ex);
                        showToast("OOPS! Something error", 'danger');
                    }
                } else {
                    showToast("Please enter valid details", 'danger');
                    // toastr["error"]("Please enter valid details");
                }
            });
        </script>

        <?php $cus = $this->$model_name->get_active_customers(); ?>
        <div class="modal fade" id="dealtransferDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">

            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close clx" data-dismiss="modal">�</button>
                        <h3>Deal Transfer</h3>
                    </div>
                    <div class="modal-body deal-transfer-model">
                        <p>Are you sure! You want to transfer? If so select customer and enter the narration.</p>
                        <div class="row">
                            <div class="form-group">
                                <input type="hidden" id="deal_book_id" name="dealtras_bookid" />
                                <input type="hidden" id="deal_book_cusid" name="dealtras_cusid" />
                                <label for="recipient-name" class="col-sm-5 control-label">Customer Name</label>
                                <label class="col-sm-1  control-label">:</label>
                                <label class="col-sm-6" for="book_cusname">
                                    <select id="newcusID" class="form-control" style="font-weight:bold">
                                        <?php
                                        foreach ($cus as $val) {
                                        ?>
                                            <option value="<?php echo $val['cus_id'] ?>"><?php echo $val['customer'] ?></option>
                                        <?php
                                        }
                                        ?>
                                        <option value="-1" selected='selected'> - SELECT - </option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group">
                                <label for="recipient-name" class="col-sm-5 control-label">Narration</label>
                                <label class="col-sm-1 control-label">:</label>
                                <label class="col-sm-6" for="book_narration"><input class="form-control" id="book_narration" type="text" /></label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="#" class="btn btn-danger" id="deal-confirm">Confirm</a>
                        <a href="#" class="btn btn-primary clx" data-dismiss="modal">Cancel</a>
                    </div>
                </div>
            </div>
        </div>

        <?php $this->load->view("include/footer"); ?>
</body>

</html>
