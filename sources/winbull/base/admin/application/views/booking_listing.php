<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = "booking_model";
$controller_name = "C_booking";
?>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery-play-sound.js"></script>
<script type="text/javascript">
    function get_data() {
        try {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url'); ?>index.php/C_booking/get_bookingdata",
                success: function(data) {
                    if ($.fn.DataTable.isDataTable('#grid-data')) {
                        $('#grid-data').DataTable().destroy();
                    }
                    $('#grid-data tbody').empty();
                    var table_val = '';

                    $.each(data, function(i) {
                        var conf = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/confirm/" +
                            data[i]['book_no'] + "/" + data[i]['cus_id'] + "/" + data[i]['book_totalcost'] + "/" + data[i]['book_status'];

                        var hold = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/hold/" +
                            data[i]['book_no'] + "/" + data[i]['cus_id'] + "/" + data[i]['book_totalcost'] + "/" + data[i]['book_status'];

                        var reject = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/reject/" +
                            data[i]['book_no'] + "/" + data[i]['cus_id'] + "/" + data[i]['book_totalcost'] + "/" + data[i]['book_status'];

                        var confirmBtn = '<?php if ($userrights["edit"] == 1) { ?><a href="#" class="btn btn-success btn-sm" onclick="processBooking(\'Confirm Booking\', \'Are you sure you want to confirm this booking?\', \'' + conf + '\')">Confirm</a><?php } ?>';
                        var rejectBtn = '<?php if ($userrights["edit"] == 1) { ?><a href="#" class="btn btn-danger btn-sm" onclick="processBooking(\'Reject Booking\', \'Are you sure you want to reject this booking?\', \'' + reject + '\')">Reject</a><?php } ?>';

                        var bookInfo = 'Book No: ' + data[i]['book_no'] + ' | ' + data[i]['cus_name'] + ' | ' + data[i]['com_name'] + ' | Qty: ' + (parseFloat(data[i]['book_qty']) * 1000) + ' gms | Rate: ' + IND_money_format(parseFloat(data[i]['book_rate'])) + ' | ' + data[i]['book_type'];
                        var bookNoLink = '<a href="#" style="color:#007bff;text-decoration:underline;" onclick="showToast(\'' + bookInfo.replace(/'/g, '\\&apos;') + '\', \'info\'); return false;">' + data[i]['book_no'] + '</a>';

                        table_val += '<tr><td>' + bookNoLink + '</td>' +
                            '<td>' + data[i]['book_datetime'] + '</td>' +
                            '<td>' + data[i]['cus_name'] + '</td>' +
                            '<td>' + (data[i]['cus_company_name'] || '') + '</td>' +
                            '<td>' + data[i]['cus_mobile'] + '</td>' +
                            '<td>' + data[i]['com_name'] + '</td>' +
                            '<td>' + (parseFloat(data[i]['book_qty']) * 1000) + '</td>' +
                            '<td>' + IND_money_format(parseFloat(data[i]['book_rate'])) + '</td>' +
                            '<td>' + data[i]['book_type'] + '</td>' +
                            '<td>' + IND_money_format(parseFloat(data[i]['book_totalcost'])) + '</td>' +
                            '<td>' + data[i]['book_status'] + '</td>' +
                            '<td>' + (data[i]['book_usercomment'] || '') + '</td>' +
                            '<td>' + confirmBtn + '</td>' +
                            '<td>' + rejectBtn + '</td></tr>';
                    });

                    $('#grid-data tbody').html(table_val);
                    oTable = $('#grid-data').DataTable({
                        bSort: true,
                        bInfo: true,
                        bDestroy: true,
                        scrollX: '100%',
                        "order": [
                            [0, "desc"]
                        ],
                        lengthMenu: [
                            [25, 50, 100, 250, -1],
                            [25, 50, 100, 250, "All"]
                        ],
                        columnDefs: [{
                                targets: [0, 1, 2, 3, 4, 5, 8, 10],
                                className: 'dt-left'
                            },
                            {
                                targets: [6, 7, 9],
                                className: 'dt-right'
                            },
                            {
                                width: "100px",
                                targets: [1, 2, 3, 4, 5, 8, 11, 12, 13]
                            }
                        ]
                    });
                },
                error: function(xhr, status, error) {
                    console.log('AJAX Error:', error);
                    console.log('Response:', xhr.responseText);
                    showToast('Failed to load booking data', 'error'); // P-ALERT fix
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    }

    function processBooking(title, message, url) {
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
        socket.on('<?php echo Globals::$evt_bookupdate ?>', function(data) {
            console.log("Confirm Type " + data.updatedata.confirm_type);
            if (data.updatedata.confirm_type == 2) {
                console.log("Table Refreshed");
                $.playSound("<?php echo $this->config->item('base_url'); ?>assets/sounds/request");
                var options = $.parseJSON($('.noty').attr('data-noty-options'));
                noty(options);
                get_data();
            }
        });
        $("#refresh_page").click(function(event) {
            event.preventDefault();
            get_data();
        });
    });
</script>
<?php
$model_name = "booking_model";
$controller_name = "C_booking";
?>
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
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Booking Request ( <i
                                id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer"
                                class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )</h4>
                        <p class="card-description"> </p>
                        <div class="table-responsive box-content">
                            <table id="grid-data" class="table table-striped table-bordered nowrap" style="width:100%">
                                <thead class="">
                                    <tr>
                                        <th>ID</th>
                                        <th>Date & Time</th>
                                        <th>Name</th>
                                        <th>Company</th>
                                        <th>Mobile No</th>
                                        <th>Commodity</th>
                                        <th>Qty(gms)</th>
                                        <th>Rate</th>
                                        <th>Type</th>
                                        <th>Total Cost</th>
                                        <th>Status</th>
                                        <th>User Comment</th>
                                        <th>Confirm</th>
                                        <th>Reject</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>

                            <!-- page content end-->
                        </div>
                    </div>
                </div>
                <!--/span-->
            </div>
        </div>
        <!--/row-->

        <a style="display:none" class="btn btn-primary noty"
            data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
            <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
        </a>
    </div>
</div>
<!-- partial -->
<!--/.fluid-container-->
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
    <?php if ($this->session->flashdata('mrgmessage')) { ?>
        toastr["error"]("<?php echo $this->session->flashdata('mrgmessage'); ?>");
    <?php } ?>
</script>
