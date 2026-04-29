<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');

$model_name = "Booking_model";
$controller_name = "C_booking";
?>
<style>
    .edit_values,
    .edit_value,
    .select_status,
    .select_comtype {
        /* text-decoration: underline !important; */
        color: #007bff !important;
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
<!-- Sound Notification Start -->
<div id="enable-sound-modal" style="display: none;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,0.5);z-index: 1000;justify-content: center;align-items: center;">
    <div style="background: #007bff;color: white;padding: 20px 30px;border-radius: 10px;text-align: center;font-family: Arial, sans-serif;cursor: pointer;box-shadow: 0 4px 12px rgba(0,0,0,0.3);max-width: 300px;" id="enable-sound-button">
        🔔 Enable Notifications & Sound
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('enable-sound-modal');
        const btn = document.getElementById('enable-sound-button');
        console.log(Notification.permission, 'Notification.permission');


        // ✅ Only show once per tab
        if (!sessionStorage.getItem('soundModalShown')) {

            // Use modern API to check permission
            if (navigator.permissions) {
                navigator.permissions.query({
                    name: 'notifications'
                }).then((result) => {
                    if (result.state === 'denied' || result.state === 'prompt') {
                        modal.style.display = "flex";
                    }
                });
            } else {
                // Fallback for older browsers
                if (Notification.permission === "denied" || Notification.permission === "default") {
                    modal.style.display = "flex";
                }
            }

            sessionStorage.setItem('soundModalShown', 'true');
        }

        // 🔊 Play sound on click
        btn.addEventListener('click', function() {
            const audio = new Audio("<?php echo $this->config->item('base_url'); ?>assets/sounds/request.mp3");
            audio.preload = "auto";
            audio.play().catch(function(err) {
                console.error("Playback failed:", err);
            });

            modal.style.display = "none";
        });
    });
</script>
<!-- Sound Notification End -->
<script type="text/javascript">
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
    $(function() {
        get_data();

        $('#from_date').datetimepicker({
            pickTime: false
        });
        $('#to_date').datetimepicker({
            pickTime: false
        });

        // BZ-19: slideToggle handlers for More Details / Filter Details
        // Removed inline click handlers for #expand and #expand_filter.
        // These buttons are now handled globally by admin/assets/js/lmx.js.
        $('.confirm_clearorder').click(function(e) {
            e.preventDefault();
            var url = $(this).attr('href');
            showConfirmModal('Clear Pending Limits', 'Do you want to clear all pending limit orders?', function() {
                $("#ajax_loader").addClass("show");
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: function(response) {
                        $("#ajax_loader").removeClass("show");
                        if (response.status === 'success') {
                            showToast(response.message, 'success');
                            get_data();
                        } else {
                            showToast(response.message, 'danger');
                        }
                    },
                    error: function(xhr, status, error) {
                        $("#ajax_loader").removeClass("show");
                        showToast('Delete failed: ' + error, 'danger');
                    }
                });
            });
        });
        $("#comType, #bookType").change(function() {
            get_data();
        });
        $("#refresh_page").click(function(event) {
            event.preventDefault();
            get_data();
        });

        socket.on("<?php echo Globals::$evt_limitupdate ?>", function(data) {
            console.log("Limit Table Refreshed");
            $.playSound("<?php echo $this->config->item('base_url'); ?>assets/sounds/request");
            var options = $.parseJSON($('.noty').attr('data-noty-options'));
            noty(options);
            get_data();
        });
    });
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
            if (currentPopover) {
                currentPopover.popover('dispose');
                currentPopover = null;
            }
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
                <button class="btn btn-sm btn-success save-btns" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);
            $('.edit-input').off('keydown').on('keydown', function(event) {
                if (field === 'book_qty' || field === 'book_price') {
                    validateKeyPress(event, this, 2);
                }
            });
        });

        // $(document).on('click', '.save-btns', function() {
        // 	let newValue = $('.edit-input').val(),
        // 		pk = $(this).data('id'),
        // 		field = $(this).data('name');

        // 	if (newValue === '') {
        // 		showFlashMessage(null, 'This field is required');
        // 		return;
        // 	}
        // 	updateWeight(pk, field, newValue, `.edit_values[data-pk="${pk}"][data-name="${field}"]`);

        // });

        // function updateWeight(pk, field, value, selector) {
        // 	$.post('<?php echo $this->config->item('base_url'); ?>index.php/c_booking/inline_update', {
        // 			pk: pk,
        // 			value: value,
        // 			fname: field
        // 		},
        // 		function(response) {
        // 			if (response === "1" || response == 1) {
        // 				$(selector).text(value);
        // 				showFlashMessage("Updated successfully", null);
        // 			} else {
        // 				showFlashMessage(null, "Update failed: " + response);
        // 			}
        // 			closePopover();
        // 		}, 'json')
        // 	.fail(() => showFlashMessage(null, "Updating failed"));
        // }

        $(document).on('click', '.save-btns', function() {
            let pk = $(this).data('id');
            let field = $(this).data('name');
            let cus_id = $(this).data('cusid');
            let book_comid = $(this).data('bookcomid');
            let com_type = $(this).data('comtype');
            let value = $('.edit-input').val();
            if (value === '') {
                showFlashMessage(null, 'Value required');
                return;
            }

            $.ajax({
                url: '<?php echo $this->config->item('base_url'); ?>index.php/c_booking/inline_update',
                type: 'POST',
                dataType: 'json',
                data: {
                    pk: pk,
                    fname: field,
                    value: value,
                    book_cusid: cus_id,
                    book_comid: book_comid,
                    book_type: com_type
                },
                success: function(res) {
                    console.log(res, 'ressss');

                    if (res.status == true) {
                        $('.edit_values[data-pk="' + pk + '"][data-name="' + field + '"]').text(value);
                        showFlashMessage('Updated successfully', null);
                    } else if (res.status == false) {
                        showFlashMessage(null, res.message == null ? 'Update failed' : res.message);
                    } else if (res === 1 || res === '1') {
                        $('.edit_values[data-pk="' + pk + '"][data-name="' + field + '"]').text(value);
                    }
                    closePopover();
                },
                error: function() {
                    showFlashMessage(null, 'Server error');
                    closePopover();
                }
            });
        });

        // Close popover on clicking outside or cancel button
        $(document).on('click', '.cancel-btn', closePopover);
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.popover, .edit_values, .select_status').length) closePopover();
        });


    });
</script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery-play-sound.js"></script>
<!-- Sound Notification Start -->
<div id="enable-sound-modal" style="display: none;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,0.5);z-index: 1000;justify-content: center;align-items: center;">
    <div style="background: #007bff;color: white;padding: 20px 30px;border-radius: 10px;text-align: center;font-family: Arial, sans-serif;cursor: pointer;box-shadow: 0 4px 12px rgba(0,0,0,0.3);max-width: 300px;" id="enable-sound-button">🔔 Enable Notifications & Sound</div>
</div>

<!-- <script>
    window.addEventListener('load', () => {
        const modal = document.getElementById('enable-sound-modal');
        const btn = document.getElementById('enable-sound-button');

        // Show modal if notifications are denied
        if (Notification.permission === "denied") {
            modal.style.display = "flex"; // use flex to center
        }

        // Click handler for the modal button
        btn.addEventListener('click', function() {
            const audio = new Audio("<?php echo $this->config->item('base_url'); ?>assets/sounds/request.mp3");
            audio.preload = "auto";
            audio.play().catch(function(err) {
                console.error("Playback failed:", err);
            });

            modal.style.display = "none"; // hide modal after click
        });
    });
</script> -->
<!-- Sound Notification End -->
<input type="hidden" value="0" id="bookupdatetime" />

<script>
    <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
        showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
    <?php endif; ?>
</script>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-lg-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <div class="header-container">
                            <h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Limit Orders ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )</h4>
                            <div class="d-flex align-items-center" style="gap: 10px; display: flex;">
                                <span id="expand" class="morefilter-btn">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_booking/clear_order" class="btn btn-warning btn-sm confirm_clearorder" data-target="#confirm-clear" role="button">CLEAR LIMITS</a>
                            </div>
                        </div>
                        <p class="card-description"> </p>
                        <div class="row form-sample1" id="expand_details" style="margin-top:40px;display: none;">
                            <div class="col-md-3 col-sm-6 col-xs-12">
                                <div class="col-md-12">
                                    <span class="label-total">Sell gold qty(gms) : </span> <span class="values-total" id="sellgoldqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span> <span class="values-total" id="sellgoldavg">0.00</span>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                <div class="col-md-12">
                                    <span class="label-total">Sell silver qty(Kg) : </span> <span class="values-total" id="sellsilverqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg :</span> <span class="values-total" id="sellsilveravg">0.00</span>
                                </div>
                            </div>

                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px">
                                <div class="col-md-12">
                                    <span class="label-total">Buy gold qty(gms) : </span> <span class="values-total" id="buygoldqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span><span class="values-total" id="buygoldavg">0.00</span>
                                </div>
                            </div>

                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                <div class="col-md-12">
                                    <span class="label-total">Buy silver qty(Kg) : </span> <span class="values-total" id="buysilverqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span> <span class="values-total" id="buysilveravg">0.00</span>
                                </div>
                            </div>
                        </div>

                        <div class="box-content">
                            <div class="filter-card" style="display: none;" id="expand_filter_details">
                                <!-- Hidden date inputs required by JavaScript -->
                                <input type="hidden" name="from_date" id="from_date" value="" data-date-format="DD-MM-YYYY" />
                                <input type="hidden" name="to_date" id="to_date" value="" data-date-format="DD-MM-YYYY" />

                                <div class="row align-items-end">
                                    <div class="col-md-3">
                                        <label class="label-total">Book Type</label>
                                        <select id="bookType" class="form-control mb-0">
                                            <option value="-1">All</option>
                                            <option value="0">Sell</option>
                                            <option value="1">Buy</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="label-total">Commodity Type</label>
                                        <select id="comType" class="form-control mb-0">
                                            <option value="-1">All</option>
                                            <option value="0">GOLD</option>
                                            <option value="1">SILVER</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 text-right">
                                        <button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
                                    </div>
                                </div>
                            </div>
                            <table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date & Time</th>
                                        <th>Type</th>
                                        <th>Name</th>
                                        <th>Company</th>
                                        <th>Mobile No</th>
                                        <th>Commodity</th>
                                        <th>Qty(gms)</th>
                                        <th>Rate</th>
                                        <th>Total Cost</th>
                                        <th>User Comment</th>
                                        <th>Live price</th>
                                        <th data-sortable="false">Action</th>
                                    </tr>
                                </thead>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- partial -->
</div>

<div class="modal fade" id="ClearDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
    aria-hidden="true">

    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-body">
                <p>Do you want to clear Pending Limit Orders?</p>
            </div>
            <div class="modal-footer">
                <a href="#" class="btn btn-danger" id="confirm" data-bs-dismiss="modal">Confirm</a>
                <a href="#" class="btn btn-primary clx" data-bs-dismiss="modal">Cancel</a>
            </div>
        </div>
    </div>
</div>

<a style="display:none" class="btn btn-primary noty"
    data-noty-options="{&quot;text&quot;:&quot;Order details updated...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
    <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
</a>
<script type="text/javascript">
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

                if (book_type == 'SELL') {
                    if (parseFloat($(this).find('.com_type').val()) == 1) {
                        sellsilverqty = parseFloat(sellsilverqty) + parseFloat($(this).find(".book_qty").html());
                        sellsilvertotal = parseFloat(sellsilvertotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                    } else {
                        sellgoldqty = parseFloat(sellgoldqty) + parseFloat($(this).find(".book_qty").html());
                        sellgoldtotal = parseFloat(sellgoldtotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                    }
                } else {
                    if (parseFloat($(this).find('.com_type').val()) == 1) {
                        buysilverqty = parseFloat(buysilverqty) + parseFloat($(this).find(".book_qty").html());
                        buysilvertotal = parseFloat(buysilvertotal) + parseFloat(remove_commas($(this).find(".amount").html()));
                    } else {
                        buygoldqty = parseFloat(buygoldqty) + parseFloat($(this).find(".book_qty").html());
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

    function get_data() {
        try {
            var table = '';
            table += '<table id="grid-data" class="table">';
            table += '<thead><tr><th>Order No</th><th>Date & Time</th><th>Type</th><th>Name</th><th>Company</th><th>Mobile No</th><th  style="display:none">City</th><th>Commodity</th><th>Qty(gms)</th><th>Rate</th><th>Total Cost</th><th>Live price</th><th>User Comment</th><th data-sortable="false">Action</th></tr></thead><tbody>';
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . "index.php/C_booking/get_orderdata/" . $model_name; ?>/" + document.getElementById('comType').value + "/" + document.getElementById('bookType').value,
                success: function(data) {
                    var table_val = '';

                    $.each(data, function(i) {

                        var confirm = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/confirmation/" + data[i]['book_no'];
                        var cancel = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/cancel/" + data[i]['book_no'] + "/" + data[i]['cus_id'] + "/" + data[i]['book_totalcost'] + "/" + data[i]['orderstatus'];

                        var confirmBtn = '<?php if ($userrights["edit"] == 1) { ?><a class="btn btn-success btn-sm" onclick="processOrder(\'Confirm Order\', \'Are you sure you want to confirm this booking?\', \'' + confirm + '\')">Confirm</a><?php } ?>';
                        var cancelBtn = '<?php if ($userrights["edit"] == 1) { ?><a class="btn btn-danger btn-sm" onclick="processOrder(\'Cancel Order\', \'Are you sure you want to cancel this booking?\', \'' + cancel + '\')">Cancel</a><?php } ?>';

                        table_val += '<tr>' +
                            '<td>' + data[i]['book_no'] + '</td>' +
                            '<td>' + data[i]['book_datetime'] + '</td>' +
                            '<td class="book_type">' + data[i]['book_type'] + '</td>' +
                            '<td>' + data[i]['cus_name'] + '</td>' +
                            '<td>' + data[i]['cus_company_name'] + '</td>' +
                            '<td>' + data[i]['cus_mobile'] + '</td>' +
                            '<td style="display:none">' + data[i]['cus_city'] + '</td>' +
                            '<td>' + data[i]['com_name'] + '</td>' +
                            '<td class="qty edit_values book_qty" data-name="book_qty" data-pk="' + parseFloat(data[i]['book_no']) + '" data-type="text" data-placement="right" data-title="Update Qty">' + parseFloat(data[i]['book_qty'] * 1000).toFixed(3) + '</td>' +
                            '<td class="rate edit_values book_price" data-name="book_rate" data-pk="' + parseFloat(data[i]['book_no']) + '" data-type="text" data-placement="right" data-title="Update rate">' + parseFloat(data[i]['book_rate']) + '</td>' +
                            '<td class="amount">' + IND_money_format(parseFloat(data[i]['book_totalcost'])) + '</td>' +
                            '<td class="live_price">' + (parseFloat(data[i]['book_liveprice']) > 0 ? IND_money_format(parseFloat(data[i]['book_liveprice'])) : '-') + '</td>' +
                            '<td>' + data[i]['book_usercomment'] + '</td>' +
                            '<td>' +
                            '<div class="d-flex">' +
                            confirmBtn +
                            '<div class="d-flex" style="margin-right: 10px;"></div>' +
                            cancelBtn +
                            '<input type="hidden" class="book_comid" value="' + data[i]['book_comid'] + '" />' +
                            '<input type="hidden" class="com_type" value="' + data[i]['com_type'] + '" />' +
                            '</div>' +
                            '</td>' +
                            '</tr>';
                    });


                    $('#grid-data').remove();
                    $('#grid-data_wrapper').remove();

                    table += table_val;
                    table += '</tbody>';
                    table += '</table>';
                    $('.box-content').append(table);

                    	var report_client = "<?php echo isset($header_info['report_client']) ? addslashes($header_info['report_client']) : ''; ?>";
                    	var report_from = "<?php echo isset($header_info['report_from_date']) ? $header_info['report_from_date'] : ''; ?>";
                    	var report_to = "<?php echo isset($header_info['report_to_date']) ? $header_info['report_to_date'] : ''; ?>";
                    	var report_time = "<?php echo isset($header_info['report_generated_on']) ? $header_info['report_generated_on'] : date('d-m-Y H:i:s'); ?>";
                    	var printed_by = "<?php echo $this->session->userdata('username') ? $this->session->userdata('username') : 'Admin'; ?>";

                    	var headerMessage = report_client + "\n" +
                    						"Limit Order Report\n" +
                    						"Printed By: " + printed_by + "    Generated On: " + report_time;
                    	
                    	var headerHtml = "<div style='text-align:center; font-size:16px; font-weight:bold; margin-bottom:5px;'>" + report_client + "</div>" +
                    					 "<div style='text-align:center; font-size:14px; font-weight:bold; margin-bottom:10px;'>Limit Order Report</div>" +
                    					 "<div style='font-size:12px; margin-bottom:15px; display:flex; justify-content:space-between;'>" +
                    					 "<span><strong>Printed By:</strong> " + printed_by + "</span>" +
                    					 "<span><strong>Generated On:</strong> " + report_time + "</span></div>";

                        oTable = $('#grid-data').dataTable({
                            bSort: true,
                            bInfo: true,
                            bDestroy: true,
                            scrollX: '100%',
                            lengthMenu: [
                                [25, 50, 100, 250, -1],
                                [25, 50, 100, 250, "All"]
                            ],
                            dom: 'lBfrtip',
                            "order": [
                                [0, "desc"]
                            ],
                            "buttons": [{
                                    extend: 'print',
                                    footer: true,
                                    title: '', // BZ-22: Removed default title to use messageTop instead
                                    messageTop: headerHtml,
                                    exportOptions: {
                                        columns: ':visible:not(:last-child)' // BZ-19: exclude hidden City col + Action column
                                    },
                                    customize: function(win) {
                                        // BZ-19: Force landscape and smaller font for full row visibility
                                        $(win.document.body).css('font-size', '10px');
                                        $(win.document.body).find('table')
                                            .addClass('compact')
                                            .css({
                                                'font-size': '9px',
                                                'width': '100%',
                                                'table-layout': 'auto'
                                            });
                                        $(win.document.body).find('table th, table td').css({
                                            'padding': '4px 6px',
                                            'white-space': 'nowrap'
                                        });
                                        // Force landscape print
                                        var style = win.document.createElement('style');
                                        style.textContent = '@page { size: landscape; margin: 5mm; }';
                                        win.document.head.appendChild(style);
                                    }
                                },
                                {
                                    extend: 'excel',
                                    footer: true,
                                    filename: 'Limit Order ' + report_time.replace(/[:]/g, '-'), // BZ-22: Explicitly set downloaded file name
                                    title: '', // BZ-22: Prevent default title row from taking up space
                                    exportOptions: {
                                        columns: ':visible:not(:last-child)' // BZ-20: exclude hidden City col + Action column
                                    },
                                    customize: function(xlsx) {
                                        var sheet = xlsx.xl.worksheets['sheet1.xml'];
                                        var numrows = 4;

                                        // Shift all existing rows down by numrows
                                        $('row', sheet).each(function() {
                                            var attr = $(this).attr('r');
                                            var ind = parseInt(attr);
                                            $(this).attr("r", ind + numrows);
                                        });

                                        // Shift all column references down
                                        $('row c', sheet).each(function() {
                                            var attr = $(this).attr('r');
                                            var pre = attr.match(/[A-Z]+/)[0];
                                            var ind = parseInt(attr.match(/[0-9]+/)[0]);
                                            $(this).attr("r", pre + (ind + numrows));
                                        });

                                        // Helper: plain row
                                        function Addrow(index, data) {
                                            var msg = '<row r="' + index + '">';
                                            for (var i = 0; i < data.length; i++) {
                                                var key = data[i].key;
                                                var value = data[i].value;
                                                msg += '<c t="inlineStr" r="' + key + index + '">';
                                                msg += '<is><t><![CDATA[' + value + ']]></t></is>';
                                                msg += '</c>';
                                            }
                                            msg += '</row>';
                                            return msg;
                                        }

                                        // Insert header rows — E is centre of 12-col table (A-L)
                                        var r1 = Addrow(1, [{ key: 'E', value: report_client }]);
                                        var r2 = Addrow(2, [{ key: 'E', value: 'Limit Order Report' }]);
                                        var r3 = Addrow(3, [{ key: 'A', value: 'Printed By: ' + printed_by }, { key: 'C', value: 'Generated On: ' + report_time }]);
                                        var r4 = '<row r="4"></row>'; // Blank row

                                        $('sheetData', sheet).prepend(r1 + r2 + r3 + r4);
                                    }
                                }
                        ],
                        columnDefs: [{
                                targets: [0, 1, 2, 3, 4, 5, 6],
                                className: 'dt-left'
                            },
                            {
                                targets: [7, 8, 9],
                                className: 'dt-right'
                            },
                            {
                                width: "100px",
                                targets: [1, 3, 4, 7, 10, 11]
                            }
                        ]
                    });

                    $('.btn-confirm').click(function(e) {
                        e.preventDefault();
                        var link = $(this).attr('href');
                        $('#myDialog').find('#confirm').attr('href', link);
                        $('#myDialog').modal('show');
                    });
                    $('#grid-data_filter label :input').keyup(function(event) {
                        calc_total();
                    });

                    calc_total();
                },
                error: function(request, error) {
                    console.log(error);
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    }

    function processOrder(title, message, url) {
        showConfirmModal(title, message, function() {
            $("#ajax_loader").addClass("show");
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function(response) {
                    $("#ajax_loader").removeClass("show");
                    if (response.status === 'success') {
                        showToast(response.message, 'success');
                        setTimeout(get_data, 1000);
                    } else {
                        showToast(response.message, 'danger');
                    }
                },
                error: function(xhr, status, error) {
                    $("#ajax_loader").removeClass("show");
                    showToast('Operation failed: ' + error, 'danger');
                }
            });
        });
    }
</script>
<?php $this->load->view('include/footer.php'); ?>
