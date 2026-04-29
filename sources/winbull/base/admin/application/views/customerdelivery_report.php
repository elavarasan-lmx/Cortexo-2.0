<!DOCTYPE html>
<html lang="en">

<head>
    <?php
    $cur_userid = $this->login_model->get_userid();
    $tradingStatus = $this->login_model->get_tradingEnable();
    ?>
    <meta charset="utf-8">
    <title>Delivery Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Winbull Lite, a fully featured, responsive,">

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

    <?php
    $controller_name = "C_customerDelivery";
    $model_name = "Customerdelivery_model";
    ?>
    <script type="text/javascript">
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

            // BZ-31: Removed duplicate click handlers for "More Details" and "Filter Details".
            // These buttons are now handled globally by admin/assets/js/lmx.js.
            // Having duplicates here caused them to fire simultaneously and cancel the toggle effect.
        });
        jQuery(document).ready(function() {

            <?php
            $result_set = $this->$model_name->get_transactiondate();
            foreach ($result_set->result() as $row) {
            ?>
                document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
                document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
            <?php
            }
            $result_set->free_result();
            ?>
        });
    </script>
    <?php
    $attributes         =     array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
    echo form_open('C_customerDelivery/print_record/RT/' . $model_name, $attributes);
    ?>
    <div id="DelNos"></div>
    <input type="hidden" id="clickid" name="clickprocess" value="">
    </form>
    <?php
    $attributes         =     array('class' => 'form-horizontal', 'id' => 'delivery_listing', 'name' => 'iframeForm', 'autocomplete' => 'off');
    //echo form_open('C_customerDelivery/open_delivery_entryform/'.$model_name.'/add_new',$attributes);
    echo form_open('C_customerDelivery/close_record/' . $model_name . '/add_new', $attributes);
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
                transports: ["websocket"], // 🔥 FORCE WEBSOCKET ONLY
                upgrade: false, // 🔥 DO NOT FALL BACK
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
        .dataTables_filter input {
            margin-left: -65px;
        }

        .edit_values,
        .edit_value,
        .select_status,
        .select_comtype {
            /* text-decoration: underline !important; */
            color: #007bff !important;
            cursor: pointer;
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

        .btn-success {
            color: #fff;
            background-color: #21bf06;
            border-color: #21bf06;
        }

        /* ===== VERTICAL SCROLLBAR ON RIGHT SIDE ===== */
        .table-responsive.box-content {
            max-height: 600px;
            overflow-y: auto;
            overflow-x: auto;
        }

        .table-responsive.box-content::-webkit-scrollbar {
            width: 14px;
            height: 12px;
        }

        .table-responsive.box-content {
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
        }
    </style>
    <script>
        $(document).ready(function() {
            let currentPopover = null;

            function showPopover(element, content) {
                if (currentPopover) currentPopover.popover('dispose');
                element.popover({
                    content: content,
                    html: true,
                    placement: 'bottom',
                    trigger: 'manual',
                    sanitize: false
                }).popover('show');
                currentPopover = element;
            }

            function closePopover() {
                if (currentPopover) currentPopover.popover('dispose');
            }

            $(document).on('click', '.edit_values', function(e) {
                e.stopPropagation();
                let element = $(this),
                    id = element.data('pk'),
                    field = element.data('name'),
                    value = element.text().trim();

                showPopover(element, `
                <input type="text" class="form-control edit-input" value="${value}">
                <div class="mt-2 d-flex">
                    <button class="btn btn-sm btn-success save-btn" data-id="${id}" data-name="${field}">OK</button>
                    <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
                </div>
            `);
            });

            $(document).on('click', '.save-btn', function() {
                let newValue = $('.edit-input').val(),
                    pk = $(this).data('id'),
                    field = $(this).data('name');
                if (newValue === '') {
                    showToast('This field is required', "error");
                    return;
                }
                $('#ajax_loader').show();
                $.post('<?php echo $this->config->item('base_url'); ?>index.php/c_customerDelivery/deliveryinline_update', {
                    pk: pk,
                    name: field,
                    value: newValue
                }, function(response) {
                    $('#ajax_loader').hide();
                    try {
                        let data = typeof response === 'string' ? JSON.parse(response) : response;
                        if (data.status == 1 || response == 1) {
                            $(`.edit_values[data-pk="${pk}"][data-name="${field}"]`).text(newValue);
                            calc_total();
                            showToast('Updated successfully', "success");
                        } else {
                            showToast(data.message || 'Update failed', "error");
                        }
                    } catch (e) {
                        if (response == 1) {
                            $(`.edit_values[data-pk="${pk}"][data-name="${field}"]`).text(newValue);
                            calc_total();
                            showToast('Updated successfully', "success");
                        } else {
                            showToast(response || 'Update failed', "error");
                        }
                    }
                    closePopover();
                }).fail(function(xhr) {
                    $('#ajax_loader').hide();
                    let errorMsg = 'Update failed. Please try again';
                    try {
                        let error = JSON.parse(xhr.responseText);
                        errorMsg = error.message || errorMsg;
                    } catch (e) {
                        errorMsg = xhr.responseText || errorMsg;
                    }
                    showToast(errorMsg, "error");
                    closePopover();
                });
            });

            $(document).on('click', '.cancel-btn', closePopover);
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.popover, .edit_values').length) closePopover();
            });
        });
    </script>
</head>

<body>
    <?php if (!isset($no_visible_elements) || !$no_visible_elements) { ?>
        <div class="container-scroller">
            <nav class="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                <div class="navbar-brand-wrapper d-flex justify-content-center">
                    <div class="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
                        <a class="navbar-brand brand-logo" href="#"><img
                                src="<?php echo $this->config->item('base_url'); ?>assets/img/logo.png" alt="logo" /></a>
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
                                    <span><?php echo $this->general_model->get_companyname(); ?></span></a>
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav navbar-nav-right">
                        <li class="nav-item nav-date dropdown">
                            <a class="nav-link d-flex justify-content-center align-items-center" href="javascript:;">
                                <h6 class="date mb-0">Trade : <div style="display:inline;" class="radiorates">
                                        <input checked type="radio" value="0" name="trade_OnOff" id="trade_enable_on" class="option-input radio" <?php if ($tradingStatus == 1) { ?> checked <?php } ?> /> <label for="trade_enable_on"> On</label>
                                        <input type="radio" value="1" name="trade_OnOff" id="trade_enable_off" class="option-input radio" <?php if ($tradingStatus == 0) { ?> checked <?php } ?> /> <label for="trade_enable_off">Off</label>
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
                                <i class="typcn typcn-user"></i><span class="hidden-sm hidden-xs"> <?php echo $this->session->userdata('username'); ?></span>
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
                                <p class="mb-0"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage" style="color:#fff">Home</a></p>
                                <i class="typcn typcn-chevron-right"></i>
                                <p class="mb-0">Delivery Report</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        <?php } ?>
        <?php
        $cus_group = "Default";
        ?>
        <a style="display:none" class="btn btn-primary noty"
            data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
            <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
        </a>


        <div class="main-panel" style="margin-top:40px;">
            <div class="content-wrapper">
                <div class="row">
                    <div class="col-lg-12 grid-margin stretch-card">
                        <div class="card">
                            <div class="card-body">
                                <!-- <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Customer Delivery Report
                                    <span id="expand"
                                        style="cursor: pointer; color: #001737;margin-left: 25vh;border: 1px solid black;padding: 5px;border-radius: 6px;">More
                                        Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
										<span id="expand_filter" style="cursor: pointer; color: #001737;border: 1px solid black;padding: 5px;border-radius: 6px;">filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                    <a href="" class="btn btn-primary btn-sm add_new" role="button" id="clickexcel"><i
                                            class="typcn typcn-document btn-icon-append"></i> Excel</a>
                                    <a onclick="print_form(event)" class="btn btn-primary btn-sm add_new Print"
                                        href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                                    </a>
                                </h4> -->
                                <div class="header-container">
                                    <h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Customer Delivery Report</h4>
                                    <div class="d-flex align-items-center" style="gap: 10px; display: flex;">
                                        <span id="expand" class="morefilter-btn">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                        <span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                        <a href="" class="btn btn-danger btn-sm" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
                                        <a onclick="print_form(event)" class="btn btn-primary btn-sm" href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                                    </div>
                                </div>
                                <p class="card-description"> </p>
                                <div class="row form-sample1" id="expand_details"
                                    style="margin-top:30px;display: none;">
                                    <div class="col-md-3 col-sm-6 col-xs-12">
                                        <div class="col-md-12">
                                            <span class="label-total">Sell gold D.Qty(gms) : </span> <span
                                                class="values-total" id="del_sellgoldqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span> <span class="values-total"
                                                id="del_sellgoldavg">0.00</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                        <div class="col-md-12">
                                            <span class="label-total">Sell silver D.Qty(Kg) : </span> <span
                                                class="values-total" id="del_sellsilverqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg :</span> <span class="values-total"
                                                id="del_sellsilveravg">0.00</span>
                                        </div>
                                    </div>

                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px">
                                        <div class="col-md-12">
                                            <span class="label-total">Buy gold D.Qty(gms) : </span> <span
                                                class="values-total" id="del_buygoldqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span><span class="values-total"
                                                id="del_buygoldavg">0.00</span>
                                        </div>
                                    </div>

                                    <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                        <div class="col-md-12">
                                            <span class="label-total">Buy silver D.Qty(Kg) : </span> <span
                                                class="values-total" id="del_buysilverqty">0</span>
                                        </div>
                                        <div class="col-md-12">
                                            <span class="label-total">Avg : </span> <span class="values-total"
                                                id="del_buysilveravg">0.00</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="filter-card" style="display: none;" id="expand_filter_details">
                                        <div class="row align-items-end">
                                            <div class="col-md-2">
                                                <label class="label-total">Commodity Type</label>
                                                <select id="comType" class="form-control mb-0">
                                                    <option value="-1">All</option>
                                                    <option value="0">GOLD</option>
                                                    <option value="1">SILVER</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label class="label-total">Trade Type</label>
                                                <select onchange="get_data();" id="book_type" class="form-control mb-0">
                                                    <option value="-1" selected="selected">All</option>
                                                    <option value="0">Sell</option>
                                                    <option value="1">Buy</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label class="label-total">Commodity Name</label>
                                                <select onchange="get_data();" id="comID" class="form-control mb-0">
                                                    <?php
                                                    $i = 0;
                                                    foreach ($comm as $val) {
                                                        if ($i == 0)
                                                            $comID = $val['com_id'];
                                                    ?>
                                                        <option value="<?php echo $val['com_id'] ?>">
                                                            <?php echo $val['com_name'] ?></option>
                                                    <?php
                                                        $i++;
                                                    }
                                                    ?>
                                                    <option value="-1" selected="selected">All</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label class="label-total">From Date</label>
                                                <input type="text" name="from_date" id="from_date" size="20"
                                                    readonly="true" value="" data-date-format="DD-MM-YYYY"
                                                    class="form-control mb-0" />
                                            </div>
                                            <div class="col-md-2">
                                                <label class="label-total">To Date</label>
                                                <input type="text" name="to_date" id="to_date" size="20" readonly="true"
                                                    value="" data-date-format="DD-MM-YYYY"
                                                    class="form-control mb-0" />
                                            </div>
                                            <div class="col-md-2 text-right">
                                                <button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
                                            </div>
                                        </div>
                                </div>
                                <div class="box-content">
                                    <?php
                                    $cus_del = $this->$model_name->get_customerdeliveryreport($row->from_date, $row->to_date, $comID)->result_array();
                                    ?>
                                    <table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
                                        <thead>
                                            <tr>
                                                <th>B.No </th>
                                                <th>Req Type </th>
                                                <th>Book Type </th>
                                                <th>B.Date </th>
                                                <th>Name</th>
                                                <th>Company</th>
                                                <th>Mobile No</th>
                                                <th>Com.Type </th>
                                                <th>Commodity </th>
                                                <th>B.Qty(gms) </th>
                                                <th>Book Rate </th>
                                                <th>Total </th>
                                                <th>Del.Qty(gms) </th>
                                                <th>Delivered On </th>
                                                <th>User Comment</th>
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
            <div class="modal fade" id="delDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
                aria-hidden="true">

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
        </div>

        <?php
        $attributes         =     array('id' => 'delete_bookings');
        echo form_open('C_customerDelivery/delete_selectedRecords', $attributes);  ?>
        <div id="booking_numbers"></div>
        </form>
        <!--/span-->
        </div>
        <!--/row-->
        <script type="text/javascript">
            $(window).load(function() {
                get_data();
                $('#clickpdf').on('click', function(e) {
                    e.preventDefault();
                    var flag = false;
                    var data = document.getElementById('DelNos');
                    data.innerHTML = "";

                    $("#grid-data tbody").find("tr").each(function(index, value) {
                        if ($(this).find(".cusdel_code").val()) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='del_nos[]' value='" + $(this)
                                .find(".cusdel_code").val() + "'/>";
                        } else {
                            flag = false;
                        }
                    });
                    $('#clickid').val(1);
                    document.forms["printForm"].submit();
                });
                $('#clickexcel').on('click', function(e) {
                    e.preventDefault();
                    var flag = false;
                    var data = document.getElementById('DelNos');
                    data.innerHTML = "";

                    $("#grid-data tbody").find("tr").each(function(index, value) {
                        if ($(this).find(".BookNo").html()) {
                            flag = true;
                            data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this)
                                .find(".BookNo").html() + "' />";
                        } else {
                            flag = false;
                        }
                    });
                    $('#clickid').val(2);
                    document.forms["printForm"].submit();
                });
            });

            function calc_total() {
                var del_sellgoldqty = 0;
                var del_sellsilverqty = 0;

                var del_buygoldqty = 0;
                var del_buysilverqty = 0;

                var del_sellgoldavg = 0;
                var del_sellsilveravg = 0;

                var del_buygoldavg = 0;
                var del_buysilveravg = 0;

                var del_sellgoldtotal = 0;
                var del_sellsilvertotal = 0;

                var del_buygoldtotal = 0;
                var del_buysilvertotal = 0;



                if (typeof oTable != 'undefined') {
                    oTable.$('tr', {
                        "filter": "applied"
                    }).each(function(index, value) {

                        var book_type = $(this).find('.book_type').html().toUpperCase();
                        var comType = parseFloat($(this).attr('data-comtype')) || 0;

                        if (book_type == 'SELL') {
                            if (comType == 1) {
                                del_sellsilverqty = parseFloat(del_sellsilverqty) + parseFloat($(this).find(".delqty")
                                    .text());
                                del_sellsilvertotal = del_sellsilvertotal + ((parseFloat(remove_commas($(this).find(
                                    ".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat(
                                    $(this).find(".delqty").text()));
                            } else {
                                del_sellgoldqty = parseFloat(del_sellgoldqty) + parseFloat($(this).find(".delqty")
                                    .text());
                                del_sellgoldtotal = del_sellgoldtotal + ((parseFloat(remove_commas($(this).find(
                                    ".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat(
                                    $(this).find(".delqty").text()));
                            }
                        } else {
                            if (comType == 1) {
                                del_buysilverqty = parseFloat(del_buysilverqty) + parseFloat($(this).find(".delqty")
                                    .text());
                                del_buysilvertotal = del_buysilvertotal + ((parseFloat(remove_commas($(this).find(
                                    ".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat(
                                    $(this).find(".delqty").text()));
                            } else {
                                del_buygoldqty = parseFloat(del_buygoldqty) + parseFloat($(this).find(".delqty")
                                    .text());
                                del_buygoldtotal = del_buygoldtotal + ((parseFloat(remove_commas($(this).find(".amount")
                                    .html())) / parseFloat($(this).find(".qty").html())) * parseFloat($(this)
                                    .find(".delqty").text()));
                            }
                        }
                    });

                    del_sellgoldavg = del_sellgoldqty > 0 ? del_sellgoldtotal / del_sellgoldqty : 0.00;
                    del_sellsilveravg = del_sellsilverqty > 0 ? del_sellsilvertotal / del_sellsilverqty : 0.00;

                    del_buygoldavg = del_buygoldqty > 0 ? del_buygoldtotal / del_buygoldqty : 0.00;
                    del_buysilveravg = del_buysilverqty > 0 ? del_buysilvertotal / del_buysilverqty : 0.00;
                }

                del_sellgoldqty = isNaN(del_sellgoldqty) ? 0.00 : del_sellgoldqty.toFixed(3);
                del_sellgoldavg = isNaN(del_sellgoldavg) ? 0.00 : del_sellgoldavg.toFixed(2);
                del_sellsilverqty = isNaN(del_sellsilverqty) ? 0.00 : (del_sellsilverqty / 1000).toFixed(3);
                del_sellsilveravg = isNaN(del_sellsilveravg) ? 0.00 : (del_sellsilveravg * 1000).toFixed(2);

                del_buygoldqty = isNaN(del_buygoldqty) ? 0.00 : del_buygoldqty.toFixed(3);
                del_buygoldavg = isNaN(del_buygoldavg) ? 0.00 : del_buygoldavg.toFixed(2);
                del_buysilverqty = isNaN(del_buysilverqty) ? 0.00 : (del_buysilverqty / 1000).toFixed(3);
                del_buysilveravg = isNaN(del_buysilveravg) ? 0.00 : (del_buysilveravg * 1000).toFixed(2);

                $("#del_sellgoldqty").html(del_sellgoldqty);
                $("#del_sellgoldavg").html(IND_money_format(del_sellgoldavg));

                $("#del_sellsilverqty").html(del_sellsilverqty);
                $("#del_sellsilveravg").html(IND_money_format(del_sellsilveravg));

                $("#del_buygoldqty").html(del_buygoldqty);
                $("#del_buygoldavg").html(IND_money_format(del_buygoldavg));

                $("#del_buysilverqty").html(del_buysilverqty);
                $("#del_buysilveravg").html(IND_money_format(del_buysilveravg));
            }

            function print_form(e) {
                e.preventDefault();
                var flag = false;
                var data = document.getElementById('DelNos');
                data.innerHTML = "";
                $("#grid-data tbody").find("tr").each(function(index, value) {
                    if ($(this).find(".BookNo").html()) {
                        flag = true;
                        data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".BookNo")
                            .html() + "' />";
                    } else {
                        flag = false;
                    }
                });
                var order_by = " ORDER BY ";
                if (flag == true) {
                    if (oTable.fnSettings().aaSorting[0][0] == 0)
                        order_by = order_by + " book_no ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 2)
                        order_by = order_by + " book_datetime ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 3)
                        order_by = order_by + " cus_name ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 4)
                        order_by = order_by + " cus_company_name ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 5)
                        order_by = order_by + " com_mobile ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 6)
                        order_by = order_by + " com_type ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 7)
                        order_by = order_by + " book_qty ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 7)
                        order_by = order_by + " book_rate ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 8)
                        order_by = order_by + " round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) ";
                    else if (oTable.fnSettings().aaSorting[0][0] == 10)
                        order_by = order_by + " cusdel_date ";
                    else
                        order_by = order_by + " book_no ";
                    order_by = order_by + oTable.fnSettings().aaSorting[0][1];
                    data.innerHTML += "<input type='hidden' name='order_by' value='" + order_by + "' />";
                    $('#clickid').val(3);
                    document.forms["printForm"].submit();
                }
            }

            function get_data() {
                try {
                    $('#ajax_loader').show();
                    var table = '';
                    table += '<table id="grid-data" class="table table-bordered bootstrap-datatable datatable responsive">';
                    table +=
                        '<thead><tr><th style="text-align:center">B.No</th><th>Req Type </th><th>Book Type </th><th style="text-align:center">B.Date</th><th style="text-align:center">Book cus</th><th style="text-align:center">Book Company</th><th style="text-align:center">Delivery Customer</th><th style="text-align:center">Delivery  company</th><th style="text-align:center">Mobile No</th><th>Com.Type</th><th style="text-align:center">Commodity</th><th style="text-align:center">B.Qty(gms)</th><th style="text-align:center">Book Rate</th><th style="text-align:center">Total</th><th style="text-align:center">Del.Qty(gms)</th><th style="text-align:center">Delivered On</th><th style="text-align:center">User Comment</th><th style="display:none"></th></tr></thead><tbody>';
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/customerdelivery_dataload/" . $model_name; ?>/" +
                            document.getElementById('from_date').value + "/" + document.getElementById('to_date')
                            .value + "/" + document.getElementById('comID').value + "/" + document.getElementById(
                                'comType').value + "/" + document.getElementById('book_type').value,
                        success: function(data) {
                            $('#ajax_loader').hide();
                            $("#total_qty").html('');
                            $("#total_amt").html('');
                            var table_val = '';
                            var status = '';
                            var delstatus = '';
                            $.each(data, function(i) {

                                var del_revert = '';
                                var oType = data[i]['ordertype'] == 0 ? "Book" : "Limit";
                                var commType = data[i]['com_type'] == 1 ? "Silver" : "Gold";

                                var del_link =
                                    "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/delete_booking/1/<?php echo $model_name; ?>/" +
                                    data[i]['bookno'] + "/" + data[i]['ordertype'];

                                var revert_link =
                                    "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/revert_delivery/<?php echo $model_name; ?>/" +
                                    data[i]['bookno'];
                                if (data[i]['ordertype'] == 0) {
                                    status = (data[i]['book_status'] == 0 ?
                                        '<span class="label label-warning">Pending</span>' : (data[i][
                                            'book_status'
                                        ] == 2 ? '<span class="label label-info">Hold</span>' : (
                                            data[i]['book_status'] == 1 ?
                                            '<span class="label label-success">Confirmed</span>' :
                                            '<span class="label label-danger">Rejected</span>')));
                                } else {
                                    status = (data[i]['book_status'] == 0 ?
                                        '<span class="label label-warning">Pending</span>' : (data[i][
                                                'book_status'
                                            ] == 2 ?
                                            '<span class="label label-danger">Cancelled by user</span>' :
                                            (data[i]['book_status'] == 1 ?
                                                '<span class="label label-success">Confirmed</span>' :
                                                '<span style="background-color:#8A0300" class="label">Cancelled by admin</span>'
                                            )));
                                }
                                if (data[i]['book_status'] == 1) {
                                    if (data[i]['bookqty'] == data[i]['BalanceQty']) {
                                        delstatus = '<span class="label label-info">Pending</span>';
                                    } else if (data[i]['BalanceQty'] <= 0) {
                                        delstatus =
                                            '<span class="label" style="background-color:#2D5A17">Delivered</span>';

                                        /*del_revert = '<a class="btn btn-warning btn-sm" data-toggle="modal" href='+revert_link+'>Del. Revert</a>';*/
                                        del_revert = '';
                                    } else if (data[i]['BalanceQty'] > 0) {
                                        delstatus =
                                            '<span class="label" style="background-color:#00BB27">Partially Delivered</span>';
                                    }
                                } else {
                                    delstatus = '-';
                                }

                                var delivqtydata =
                                    '<a href="#" class="edit_values book_qty" data-name="book_qty" data-pk="' +
                                    parseFloat(data[i]['cusdel_code']) +
                                    '" data-type="text" data-placement="right" data-title="Update Qty">' +
                                    parseFloat(data[i]['deliveryqty']) + '</a>';
                                const bgColor = data[i]['unfix'] === '1' ?
                                    'style="background-color:#FFCCCB;"' : '';

                                table_val += '<tr data-comtype="' + (data[i]['com_type'] || '0') + '" ' + bgColor + '><td class="BookNo">' + data[i]['bookno'] +
                                    '</td><td>' + oType + '</td><td class="book_type">' + data[i][
                                        'book_type'
                                    ] + '</td><td>' + data[i]['bookdate'] + '</td><td>' + data[i][
                                        'customername'
                                    ] + '</td><td>' + data[i]['cus_company_name'] + '</td><td>' + data[i][
                                        'deliverycustomer'
                                    ] + '</td><td>' + data[i]['delivery_cus_company'] + '</td><td>' + data[
                                        i]['cus_mobile'] + '</td><td>' + commType + '</td><td>' + data[i][
                                        'commodityname'
                                    ] + '</td><td class="qty">' + parseFloat(
                                        (parseFloat(data[i]['bookqty']) * 1000).toFixed(3)
                                    ) + '</td><td class="rate">' + (IND_money_format(
                                        parseFloat(data[i]['book_rate']))) + '</td><td class="amount">' + (
                                        IND_money_format(parseFloat(data[i]['bookamount']))) +
                                    '</td><td class="delqty">' + delivqtydata + '</td><td>' + data[i][
                                        'cusdeliverydate'
                                    ] + '</td><td>' + (data[i]['book_usercomment'] || '') + '</td><td style="display:none"><span class="com_type">' + data[i][
                                        'com_type'
                                    ] + '</span></td></tr>';
                            });
                            $('#grid-data').remove();
                            $('#grid-data_wrapper').remove();

                            if (table_val == '') {
                                $('#clickexcel').hide();
                                $('.Print').hide();
                            } else if (table_val != '') {
                                $('#clickexcel').show();
                                $('.Print').show();
                            }

                            table += table_val;
                            table += '</tbody>';
                            table += '</table>';
                            $('.box-content').append(table);
                            oTable = $('#grid-data').dataTable({
                                // "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
                                // "sPaginationType": "bootstrap",
                                // "iDisplayLength": "200",
                                "order": [
                                    [13, "desc"]
                                ],
                                bSort: true,
                                bInfo: true,
                                bDestroy: true,
                                scrollX: '100%',
                                lengthMenu: [
                                    [10, 25, 50, 100, 250, -1],
                                    [10, 25, 50, 100, 250, "All"]
                                ],
                                // "buttons": [
                                // 	{
                                // 		extend: 'print',
                                // 		footer: true,
                                // 		title: 'Limit Order',
                                // 	},
                                // 	{
                                // 		extend: 'excel',
                                // 		footer: true,
                                // 		title: 'Limit Order',
                                // 	}
                                // ],
                                columnDefs: [
                                    // {
                                    //     targets: [0, 1, 2, 3, 4, 5, 6],
                                    //     className: 'dt-left'
                                    // },
                                    // {
                                    //     targets: [7, 8, 9],
                                    //     className: 'dt-right'
                                    // },
                                    {
                                        width: "100px",
                                        targets: [3, 4]
                                    }
                                ]
                                // "oLanguage": {
                                //     "sLengthMenu": "_MENU_ records per page"
                                // },
                            });

                            $("#grid-data thead th").attr("data-sortable", function(i, val) {
                                if (val != 'false') {
                                    $("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor',
                                        'pointer');
                                }
                            });
                            $('#grid-data_filter label :input').keyup(function(event) {
                                calc_total();
                            });
                            $('.btn-confirm').on('click', function(e) {
                                e.preventDefault();
                                var link = $(this).attr('href');
                                $('#myDialog').find('#confirm').attr('href', link);
                                $('#myDialog').modal('show');
                            });

                            //for delete operation
                            $('#myDialog #confirm').on('click', function() {
                                $('#myDialog').modal('hide');
                                $('body').removeClass('modal-open');
                                $('.modal-backdrop').remove();
                                window.location.href = $(this).attr('href');
                                return false;
                            });

                            calc_total();
                        },
                        error: function(request, error) {
                            $('#ajax_loader').hide();
                        }
                    });
                } catch (ex) {
                    console.log(ex);
                }


            }
        </script>
        </div>
</body>

</html>
<?php $this->load->view("include/footer"); ?>
