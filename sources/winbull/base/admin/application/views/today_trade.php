<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$controller_name = "C_customerDelivery";
$model_name = "Customerdelivery_model";
?>
<style>
    .edit_values,
    .edit_value,
    .select_status,
    .select_comtype {
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
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery-play-sound.js"></script>
<script type="text/javascript">
    function get_data() {
        var from_date = "<?php echo date('Y-m-d'); ?>";
        var to_date = "<?php echo date('Y-m-d'); ?>";

        try {
            var table = '';
            table += '<table id="grid-data" class="table text-center">';
            table += '<thead><tr>' +
                '<th style="text-align:center;width: 56px">Book No</th>' +
                '<th style="width: 59px">Req Type</th>' +
                '<th style="text-align:center;width: 100px;">Book Date</th>' +
                '<th style="text-align:center;width: 67px;">Book Type</th>' +
                '<th style="text-align:center;width: 100px;">Name</th>' +
                '<th style="text-align:center;width: 68px;">Mobile No</th>' +
                '<th style="text-align:center;width: 80px;">Comp Name</th>' +
                '<th style="text-align:center;width: 87px;">Comm. Name</th>' +
                '<th style="text-align:center;width: 59px;">Qty(gms)</th>' +
                '<th style="text-align:center;width: 65px;">Book Rate</th>' +
                '<th style="text-align:center;display:none">Book Status</th>' +
                '<th style="text-align:center;display:none">Delivery Status</th>' +
                '<th style="text-align:center;width: 56px;">Amount</th>' +
                '<th style="display:none">com Type</th>' +
                '<th style="width: 52px;">Book By</th>' +
                '<th style="width: 95px;">User Comment</th>' +
                '<th style="width: 95px;">Is Hedged</th>' +
                '<th style="display: none;">DeliveryDate</th>' +
                '<th style="width: 150px">Narration</th>' +
                '<th style="display:none;">Unfix</th>' +
                '<th data-sortable="false" style="display:none;">Hedge</th>' +
                '<th data-sortable="false" style="width: 100px">Action</th>' +
                '</tr></thead><tbody>';
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . 'index.php/C_customerDelivery/todays_trade/' . $model_name; ?>/" +
                    from_date + "/" + to_date + "/" +
                    document.getElementById('oType').value + "/" +
                    document.getElementById('status').value + "/" +
                    document.getElementById('comID').value + "/" +
                    document.getElementById('comType').value + "/" +
                    document.getElementById('bookType').value,
                success: function(data) {
                    var table_val = '';

                    $.each(data, function(i) {
                        var item = data[i];
                        var oType = item['ordertype'] == 0 ? "Book" : "Limit";
                        var book_ishedge = item['book_ishedge'] == 0 ? "No" : "Yes";
                        var commType = item['com_type'] == 1 ? "Silver" : "Gold";
                        var book_by = item['book_by'] == 1 ? "App" : (item['book_by'] == 0 ? "Web" : "Admin");

                        var del_link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/delete_booking/0/<?php echo $model_name; ?>/" + item['bookno'] + "/0";

                        var status = '';
                        var delstatus = '';
                        var order_title = '';
                        if (item['ordertype'] == 0) {
                            status = item['book_status'] == 0 ? '<span class="label label-warning">Pending</span>' :
                                item['book_status'] == 2 ? '<span class="label label-info">Hold</span>' :
                                item['book_status'] == 1 ? '<span class="label label-success">Confirmed</span>' :
                                '<span class="label label-danger">Rejected</span>';
                            order_title = $.trim(item['book_liveprice']) !== '' ?
                                "Actual Live Price at the time of booking : " + item['book_liveprice'] : "";
                        } else {
                            status = item['book_status'] == 0 ? '<span class="label label-warning">Pending</span>' :
                                item['book_status'] == 2 ? '<span class="label label-danger">Cancelled by user</span>' :
                                item['book_status'] == 1 ? '<span class="label label-success">Confirmed</span>' :
                                '<span style="background-color:#8A0300" class="label">Cancelled by admin</span>';
                            order_title = "Order Rate : " + item['book_rate'] +
                                ", Actual Price : " + item['order_actualprice'] +
                                ", Live Price :" + item['order_liveprice'];
                        }

                        var narration = '<textarea class="book_narration form-control">' + item.book_narration + '</textarea>';
                        var bookqtydata = '<a href="#" class="edit_values book_qty" data-name="book_qty" data-pk="' +
                            parseFloat(item['bookno']) + '" data-type="text" data-placement="right" data-title="Update Qty">' +
                            parseFloat(item['bookqty'] * 1000).toFixed(3) + '</a>';
                        var bookamtdata = '<a href="#" class="edit_values book_price" data-name="book_rate" data-pk="' +
                            parseFloat(item['bookno']) + '" data-type="text" data-placement="right" data-title="Update rate">' +
                            parseFloat(item['book_rate']) + '</a>';

                        var unfix = item['cus_fix'] == '1' ?
                            (item['unfix'] == '0' ?
                                '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="unfix_fixNarration(this,1)" href="#"> Is Unfix ?</a>' :
                                '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="unfix_fixNarration(this,0)" href="#"> Fix</a>') :
                            '<p class="text-center">-</p>';

                        var hedgestatus = item['book_ishedge'] == 0 ?
                            (item['book_hedgemanual'] == 0 ?
                                '<a class="btn btn-sm btn-danger" data-toggle="modal" onClick="save_manualhedge(this)" href="#">Pending</a>' :
                                '<a class="btn btn-sm btn-primary" data-toggle="modal" href="#">Manual</a>') :
                            '<a class="btn btn-sm btn-success" data-toggle="modal" href="#">Auto</a>';

                        var save = '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="save_chargeNarration(this)" href="#">Save</a>';

                        var bgColor = item['unfix'] === '1' ?
                            (item['ordertype'] === '1' ? 'style="background-color:#FFCCCB;color:blue;"' :
                                'style="background-color:#FFCCCB;"') :
                            (item['ordertype'] === '1' ? 'style="color: blue;"' : '');

                        table_val += '<tr ' + bgColor + '>' +
                            '<td class="BookNo">' + item['bookno'] + '</td>' +
                            '<td>' + oType + '</td>' +
                            '<td>' + item['bookdate'] + '</td>' +
                            '<td class="book_type">' + item['book_type'] + '</td>' +
                            '<td>' + item['customername'] + '</td>' +
                            '<td>' + item['cus_mobile'] + '</td>' +
                            '<td>' + item['cus_company_name'] + '</td>' +
                            '<td>' + item['commodityname'] + '</td>' +
                            '<td class="qty">' + bookqtydata + '</td>' +
                            '<td class="rate" title="' + order_title + '">' + bookamtdata + '</td>' +
                            '<td style="display:none">' + status + '</td>' +
                            '<td style="display:none">' + delstatus + '</td>' +
                            '<td class="amount">' + IND_money_format(parseFloat(item['bookamount'])) + '</td>' +
                            '<td style="display:none" class="com_type">' + item['com_type'] + '</td>' +
                            '<td>' + book_by + '</td>' +
                            '<td>' + item['book_usercomment'] + '</td>' +
                            '<td>' + book_ishedge + '</td>' +
                            '<td style="display: none;">' + item['book_deliverydate'] + '</td>' +
                            '<td>' + narration + '</td>' +
                            '<td style="display:none;">' + unfix + '</td>' +
                            '<td style="display:none;">' + hedgestatus + '</td>' +
                            '<td style="">' + save +
                            ' <?php if ($userrights["delete"] == 1) { ?>' +
                            '<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href=' + del_link + '>' +
                            'Delete </a><?php } ?></td></tr>';
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
                    table += '</tbody></table>';
                    $('.box-content').append(table);

                    oTable = $('#grid-data').dataTable({
                        bSort: true,
                        bInfo: true,
                        bDestroy: true,
                        scrollX: '100%',
                        "order": [
                            [0, "desc"]
                        ],
                        lengthMenu: [
                            [10, 25, 50, 100, 250, -1],
                            [10, 25, 50, 100, 250, "All"]
                        ],
                        columnDefs: [{
                                targets: [17, 20],
                                width: "150px"
                            },
                            {
                                targets: [2, 4],
                                width: "100px"
                            }
                        ]
                    });

                    $("#grid-data thead th").attr("data-sortable", function(i, val) {
                        if (val != 'false') {
                            $("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
                        }
                    });

                    $('.btn-confirm').click(function(e) {
                        e.preventDefault();
                        var link = $(this).attr('href');
                        showConfirmModal(
                            'Delete Confirmation',
                            'Are you sure you want to delete this record?',
                            function() {
                                window.location.href = link;
                            }
                        );
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

    jQuery(document).ready(function() {
        get_data();

        document.getElementById('from_date').value = "<?php echo date("Y-m-d"); ?>";
        document.getElementById('to_date').value = "<?php echo date("Y-m-d"); ?>";

        $("#comID").change(function() {
            get_data();
        });
        $("#comType, #bookType, #oType").change(function() {
            get_data();
        });
        $("#refresh_page").click(function(event) {
            event.preventDefault();
            get_data();
        });
        $('#from_date').datetimepicker({
            pickTime: false
        });
        $('#to_date').datetimepicker({
            pickTime: false
        });
        socket.on("<?php echo Globals::$evt_bookupdate ?>", function(data) {
            console.log("Confirm Type " + data.updatedata.confirm_type);
            if (data.updatedata.confirm_type == 1) {
                console.log("Table Refreshed");
                $.playSound("<?php echo $this->config->item('base_url'); ?>assets/sounds/request");
                var options = $.parseJSON($('.noty').attr('data-noty-options'));
                noty(options);
                get_data();
            }
        });
    });

    $(document).ready(function() {
        let currentPopover = null;

        function showPopover(element, content) {
            // Dispose old popover if open
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

        // Handle inline edit click
        $(document).on('click', '.edit_values', function(e) {
            e.stopPropagation();

            let element = $(this),
                id = element.data('pk'),
                field = element.data('name'),
                value = element.text().trim();

            // Escape quotes in value
            value = $('<div/>').text(value).html();

            showPopover(element, `
            <input type="text" class="form-control edit-input" value="${value}">
            <div class="mt-2 d-flex">
                <button class="btn btn-sm btn-success save-btn" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);

            // Attach input validation only once per field
            $('.edit-input').off('keydown').on('keydown', function(event) {
                if (field === 'book_qty' || field === 'book_price') {
                    validateKeyPress(event, this, 2);
                }
            });
        });

        // Save button click
        $(document).on('click', '.save-btn', function() {
            let newValue = $('.edit-input').val().trim(),
                pk = $(this).data('id'),
                field = $(this).data('name');

            if (newValue === '') {
                showToast('This field is required', 'danger');
                return;
            }

            updateField(pk, field, newValue, `.edit_values[data-pk="${pk}"][data-name="${field}"]`);
        });

        function updateField(pk, field, value, selector) {
            $.post(
                '<?php echo $this->config->item('base_url'); ?>index.php/c_customerDelivery/todayinline_update', {
                    pk,
                    value,
                    name: field
                },
                function(response) {
                    if (response === "1" || response === 1) {
                        $(selector).text(value);
                    } else {
                        showToast("Update failed: " + response, 'danger');
                    }
                    closePopover();
                },
                'json'
            ).fail(() => {
                showToast("Updating failed. Please try again.", 'danger');
                closePopover();
            });
        }

        // Cancel button click
        $(document).on('click', '.cancel-btn', closePopover);

        // Close popover when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.popover, .edit_values, .select_status').length) {
                closePopover();
            }
        });
    });
</script>

<!-- Sound Notification Start
<div id="enable-sound-modal" style="display: none;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,0.5);z-index: 1000;justify-content: center;align-items: center;">
    <div style="background: #007bff;color: white;padding: 20px 30px;border-radius: 10px;text-align: center;font-family: Arial, sans-serif;cursor: pointer;box-shadow: 0 4px 12px rgba(0,0,0,0.3);max-width: 300px;" id="enable-sound-button">🔔 Enable Notifications & Sound</div>
</div>

<script>
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
<?php
$attributes = array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
echo form_open('C_customerDelivery/print_record/TT/' . $model_name, $attributes);
?>
<div id="BookNos"></div>
<input type="hidden" id="clickid" name="clickprocess" value="">

<script>
    <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
        showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
    <?php endif; ?>
</script>
<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-lg-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <!-- <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Today Trade
                        ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer"
                                class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )
                                <span id="expand" style="cursor: pointer; color: #001737;margin-left: 25vh;border: 1px solid black;padding: 5px;border-radius: 6px;">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <span id="expand_filter" style="cursor: pointer; color: #001737;border: 1px solid black;padding: 5px;border-radius: 6px;">filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <a href="#" class="btn btn-primary btn-sm add_new" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
                                <a onclick="print_form(event)" href="#" class="btn btn-primary btn-sm add_new Print" data-target="#confirm-clear" role="button"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                        </h4> -->
                        <div class="header-container">
                            <h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Today Trade ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )</h4>
                            <div class="d-flex align-items-center" style="gap: 10px; display: flex;">
                                <span id="expand" class="morefilter-btn">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                                <a href="#" class="btn btn-danger btn-sm" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
                                <a onclick="print_form(event)" href="#" class="btn btn-primary btn-sm Print" data-target="#confirm-clear" role="button"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                            </div>
                        </div>
                        <p class="card-description"> </p>



                        <div class="row form-sample1" id="expand_details" style="margin-top:40px;display: none;">
                            <div class="col-md-3 col-sm-6 col-xs-12">
                                <div class="col-md-12">
                                    <span class="label-total">Sell gold qty(gms) : </span> <span class="values-total"
                                        id="sellgoldqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span> <span class="values-total"
                                        id="sellgoldavg">0.00</span>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                <div class="col-md-12">
                                    <span class="label-total">Sell silver qty(Kg) : </span> <span class="values-total"
                                        id="sellsilverqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg :</span> <span class="values-total"
                                        id="sellsilveravg">0.00</span>
                                </div>
                            </div>

                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px">
                                <div class="col-md-12">
                                    <span class="label-total">Buy gold qty(gms) : </span> <span class="values-total"
                                        id="buygoldqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span><span class="values-total"
                                        id="buygoldavg">0.00</span>
                                </div>
                            </div>

                            <div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
                                <div class="col-md-12">
                                    <span class="label-total">Buy silver qty(Kg) : </span> <span class="values-total"
                                        id="buysilverqty">0</span>
                                </div>
                                <div class="col-md-12">
                                    <span class="label-total">Avg : </span> <span class="values-total"
                                        id="buysilveravg">0.00</span>
                                </div>
                            </div>
                        </div>
                        <?php
                        $attributes         =     array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
                        echo form_open('C_customerDelivery/print_record/TT/' . $model_name, $attributes);  ?>
                        <div id="BookNos"></div>
                        </form>
                        <div class="box-content">
                            <div class="filter-card" style="display: none;" id="expand_filter_details">
                                <!-- Hidden inputs required by JavaScript -->
                                <input type="hidden" name="from_date" id="from_date" value="" data-date-format="DD-MM-YYYY" />
                                <input type="hidden" name="to_date" id="to_date" value="" data-date-format="DD-MM-YYYY" />
                                <input type="hidden" name="status" id="status" value="0" />

                                <div class="row align-items-end">
                                    <div class="col-md-2">
                                        <label class="label-total">Book Type</label>
                                        <select id="oType" class="form-control mb-0">
                                            <option value="-1">All</option>
                                            <option value="0">Book</option>
                                            <option value="1">Limit</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="label-total">Trade Type</label>
                                        <select id="bookType" class="form-control mb-0">
                                            <option value="-1">All</option>
                                            <option value="0">Sell</option>
                                            <option value="1">Buy</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="label-total">Commodity Name</label>
                                        <select id="comID" class="form-control mb-0">
                                            <option selected="selected" value="-1">All</option>
                                            <?php
                                            $i = 0;
                                            foreach ($comm as $val) {
                                            ?>
                                                <option value="<?php echo $val['com_id'] ?>"><?php echo $val['com_name'] ?>
                                                </option>
                                            <?php
                                                $i++;
                                            }
                                            ?>
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
                                    <div class="col-md-2 text-right">
                                        <button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
                                    </div>
                                </div>
                            </div>
                            <table id="grid-data" class="table table-striped table-bordered nowrap" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Book No </th>
                                        <th>Req Type </th>
                                        <th>Book Date </th>
                                        <th>Book Type </th>
                                        <th>Name</th>
                                        <th>Mobile No</th>
                                        <th>Comp Name</th>
                                        <th>Com. Name</th>
                                        <th>Qty(gms)</th>
                                        <th>Book Rate</th>
                                        <th>Amount</th>
                                        <th>Book By</th>
                                        <th>Is Hedged</th>
                                        <th>User Comment</th>
                                        <th style="display: none;">DeliveryDate</th>
                                        <th>Narration</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- partial -->
    </div>

    <div class="modal fade" id="deliveryChargeModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <!--<div class="modal-header">
                    <button type="button" class="close clx" data-dismiss="modal">×</button>
                    <h3>Add Manual Hedge</h3>
                </div>-->
                <div class="modal-body">
                    <div class="row">
                        <div class="form-group">
                            <label class="control-label col-sm-2">Book No </label>
                            <div class="col-sm-3">
                                <label class="cusbookidlab" />

                            </div>
                            <label class="control-label col-md-6"></label>

                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group">
                            <label class="control-label col-sm-2">Deal Id </label>
                            <div class="col-sm-3">
                                <input type="number" class="form-control" id="dealid" placeholder="Deal ID"
                                    maxlength="30" />
                                <input type='hidden' id="cusbookid" name='cusbookid' value='' />
                                <span class="help-block">Enter Hedge Deal Id</span>
                            </div>
                            <label class="control-label col-md-3">Order ID</label>
                            <div class="col-sm-3">
                                <input type="number" class="form-control" id="orderid" placeholder="Order ID"
                                    maxlength="30" />
                                <span class="help-block">Enter Hedge Order Id</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group">
                            <label class="control-label col-sm-2">Hedge Amount </label>
                            <div class="col-sm-3">
                                <input type="number" class="form-control" id="price" placeholder="Hedge Amount"
                                    maxlength="30" />
                                <span class="help-block">Enter Hedge Amount</span>
                            </div>
                            <label class="control-label col-md-3">Hedge Qty</label>
                            <div class="col-sm-3">
                                <input type="number" class="form-control" id="volume" placeholder="Hedge Qty"
                                    maxlength="30" />
                                <span class="help-block">Enter Hedge Qty</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="#" class="btn btn-danger" onclick="process_manualhedge()">Manual</a>
                    <a href="#" class="btn btn-primary clx" data-bs-dismiss="modal">Cancel</a>
                </div>
            </div>
        </div>
    </div>
</div>


<a style="display:none" class="btn btn-primary noty"
    data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
    <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
</a>
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
    $(window).load(function() {
        $("body").on('keyup', '#grid-data_filter label :input', function(event) {
            calc_total();
        });

    });

    function save_manualhedge(obj) {
        console.log($(obj).parent().parent().find(".BookNo").html());
        console.log($(obj).parent().parent().find(".book_qty").html());
        var cusbookid = $(obj).parent().parent().find(".BookNo").html();
        var bookqty = $(obj).parent().parent().find(".book_qty").html();
        document.getElementById("cusbookid").value = cusbookid;
        document.getElementById("volume").value = bookqty;
        $(".cusbookidlab").html(cusbookid);
        $("#deliveryChargeModal").modal("show");
    }

    function save_chargeNarration(obj) {
        var book_narration = $(obj).parent().parent().find(".book_narration").val();
        var book_no = $(obj).parent().parent().find(".BookNo").html();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "<?php echo $this->config->item('base_url') ?>index.php/C_customerDelivery/save_booknarration/1",
            data: "book_narration=" + book_narration + "&book_no=" + book_no,
            success: function(result) {
                if (result) {
                    showToast("Updated successfully.", 'success');
                    get_data();
                } else {
                    showToast("Failed to update. Please try again.", 'error');
                    get_data();
                }
            }
        });
    }

    function process_manualhedge() {
        var dealid = document.getElementById("dealid").value;
        var orderid = document.getElementById("orderid").value;
        var volume = document.getElementById("volume").value;
        var price = document.getElementById("price").value;
        var cusbookid = document.getElementById("cusbookid").value;

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "<?php echo $this->config->item('base_url') ?>index.php/C_customerDelivery/save_manualhedge/1",
            data: "cusbookid=" + cusbookid + "&dealid=" + dealid + "&orderid=" + orderid + "&volume=" + volume +
                "&price=" + price,
            success: function(result) {
                if (result) {
                    showToast("Updated successfully.", 'success');
                    $("#deliveryChargeModal").modal("hide");
                    get_data();
                } else {
                    showToast("Failed to update. Please try again.", 'danger');
                    $("#deliveryChargeModal").modal("hide");
                    get_data();
                }
            }
        });
    }

    function print_form(e) {
        e.preventDefault();
        var flag = false;
        var data = document.getElementById('BookNos');
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
            else if (oTable.fnSettings().aaSorting[0][0] == 1)
                order_by = order_by + " ordertype ";
            else if (oTable.fnSettings().aaSorting[0][0] == 2)
                order_by = order_by + " book_datetime ";
            else if (oTable.fnSettings().aaSorting[0][0] == 3)
                order_by = order_by + " cus_alise_name ";
            else if (oTable.fnSettings().aaSorting[0][0] == 4)
                order_by = order_by + " cus_city ";
            else if (oTable.fnSettings().aaSorting[0][0] == 6)
                order_by = order_by + " com_name ";
            else if (oTable.fnSettings().aaSorting[0][0] == 7)
                order_by = order_by + " book_qty ";
            else if (oTable.fnSettings().aaSorting[0][0] == 8)
                order_by = order_by + " book_rate ";
            else if (oTable.fnSettings().aaSorting[0][0] == 9)
                order_by = order_by + " round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) ";
            else
                order_by = order_by + " book_no ";
            order_by = order_by + oTable.fnSettings().aaSorting[0][1];
            data.innerHTML += "<input type='hidden' name='order_by' value='" + order_by + "' />";
            $('#clickid').val(3);
            document.forms["printForm"].submit();
        }
    }
    $('#clickexcel').on('click', function(e) {
        e.preventDefault();
        var flag = false;
        var data = document.getElementById('BookNos');
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
        $('#clickid').val(2);
        document.forms["printForm"].submit();
        console.log(data);

    });

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
                    if (parseFloat($(this).find('.com_type').html()) == 1) {
                        sellsilverqty = parseFloat(sellsilverqty) + parseFloat($(this).find(".edit_values").html());
                        sellsilvertotal = parseFloat(sellsilvertotal) + parseFloat(remove_commas($(this).find(
                            ".amount").html()));
                    } else {
                        sellgoldqty = parseFloat(sellgoldqty) + parseFloat($(this).find(".edit_values").html());
                        sellgoldtotal = parseFloat(sellgoldtotal) + parseFloat(remove_commas($(this).find(".amount")
                            .html()));
                    }
                } else {
                    if (parseFloat($(this).find('.com_type').html()) == 1) {
                        buysilverqty = parseFloat(buysilverqty) + parseFloat($(this).find(".edit_values").html());
                        buysilvertotal = parseFloat(buysilvertotal) + parseFloat(remove_commas($(this).find(
                            ".amount").html()));
                    } else {
                        buygoldqty = parseFloat(buygoldqty) + parseFloat($(this).find(".edit_values").html());
                        buygoldtotal = parseFloat(buygoldtotal) + parseFloat(remove_commas($(this).find(".amount")
                            .html()));
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



    function unfix_fixNarration(obj, sts) {

        var book_no = $(obj).parent().parent().find(".BookNo").html();
        if (sts == 0) {
            var result = window.confirm("Are you sure you want to revert the Unfix booking?");
        } else {
            var result = window.confirm("Are you sure you want to Unfix booking?");
        }
        if (result) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/updatefix_unfix/" . $model_name; ?>",
                data: {
                    "book_no": book_no,
                    'sts': sts
                },

                success: function(data) {
                    if (data.statuscode == 0) {
                        showToast('Unfix Reverted', "info");
                        get_data();
                    } else {
                        get_data();
                        showToast('Booked Unfix', "info");
                    }
                },
                error: function(request, error) {}
            });
        }


    }
</script>