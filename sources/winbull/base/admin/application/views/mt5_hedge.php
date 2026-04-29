<?php
$this->load->view('include/header.php');
$controller_name = "C_customerDelivery";
$model_name = "Customerdelivery_model";
?>
<style type="text/css">
    .table_data {
        text-align: center;
    }
</style>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery-play-sound.js"></script>
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
    });
    jQuery(document).ready(function() {


        <?php
        $result_set = $this->$model_name->get_transactiondate();
        foreach ($result_set->result() as $row) {
        ?>
            document.getElementById('from_date').value = "<?php echo date("d-m-Y"); ?>";
            document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
        <?php
        }
        $result_set->free_result();
        ?>
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
</script>
<?php
$attributes = array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
echo form_open('C_customerDelivery/print_record/MT5/' . $model_name, $attributes);
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
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> MT5 Hedge ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )
                            <a href="#" class="btn btn-primary btn-sm add_new" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
                            <a onclick="print_form(event)" class="btn btn-primary btn-sm add_new Print" href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
                        </h4>
                        <p class="card-description"> </p>
                        <div class="col-md-12">
                            <?php if ($this->session->flashdata('success')) { ?>
                                <div class="alert alert-success" style="text-align:center">
                                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                                    <p><?php echo $this->session->flashdata('success'); ?></p>
                                </div>
                            <?php } else if ($this->session->flashdata('error')) { ?>
                                <div class="alert alert-danger" style="text-align:center">
                                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                                    <p><?php echo $this->session->flashdata('error'); ?></p>
                                </div>
                            <?php } ?>
                        </div>


                        <?php
                        $attributes         =     array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
                        echo form_open('C_customerDelivery/print_record/TT/' . $model_name, $attributes);  ?>
                        <div id="BookNos"></div>
                        </form>
                        <div class="table-responsive box-content">
                            <div class="filterings" style="height: 43px;text-align: center;">
                                <div>
                                    <input type="text" name="from_date" id="from_date" size="20" readonly="true"
                                        value="" data-date-format="DD-MM-YYYY" />
                                    <input type="text" name="to_date" id="to_date" size="20" readonly="true" value=""
                                        data-date-format="DD-MM-YYYY" />&nbsp;<i style="cursor:pointer"
                                        onclick="get_data();" class="glyphicon glyphicon-search"></i>
                                </div>

                            </div>
                            <table id="grid-data" class="table">
                                <thead>
                                    <tr>
                                        <th>Hedge ID </th>
                                        <th>Book No</th>
                                        <th>Customer</th>
                                        <th>Booked Qty(Grms)</th>
                                        <th>Booked Rate</th>
                                        <th>Hedge QTY(Grms)</th>
                                        <th>Price</th>
                                        <th>Symbol</th>
                                        <th>Bid</th>
                                        <th>Ask</th>
                                        <th>Booked on</th>
                                        <th>Deal ID </th>
                                        <th>Req ID</th>
                                        <th>Comment</th>
                                        <th style="display:none;">Booked By</th>
                                        <th style="display:none;">Order For</th>
                                        <th data-sortable="false">Action</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="delDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">

                <div class="modal-dialog">
                    <div class="modal-content">
                        <!--<div class="modal-header">
                            <button type="button" class="close clx" data-dismiss="modal">�</button>
                            <h3>Delete</h3>
                        </div>-->
                        <div class="modal-body">
                            <p>Are you sure! You want to delete the record(s)...</p>
                        </div>
                        <div class="modal-footer">
                            <a href="#" class="btn btn-danger" id="confirm_del" data-bs-dismiss="modal">Confirm</a>
                            <a href="#" class="btn btn-primary clx" data-bs-dismiss="modal">Cancel</a>
                        </div>
                    </div>
                </div>

            </div>

            <a style="display:none" class="btn btn-primary noty" data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
                <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
            </a>
        </div>
    </div>
    <!-- partial -->
</div>
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
    $(window).load(function() {
        get_data();
        $("body").on('keyup', '#grid-data_filter label :input', function(event) {
            calc_total();
        });

    });

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
                    showToast("Failed to update. Please try again.", 'danger');
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
            if ($(this).find(".hedgid").html()) {
                flag = true;
                data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".hedgid")
                    .html() + "' />";
            } else {
                flag = false;
            }
        });
        var order_by = " ORDER BY ";
        $('#clickid').val(3);
        document.forms["printForm"].submit();
    }
    $('#clickexcel').on('click', function(e) {
        e.preventDefault();
        var flag = false;
        var data = document.getElementById('BookNos');
        data.innerHTML = "";
        $("#grid-data tbody").find("tr").each(function(index, value) {
            if ($(this).find(".hedgid").html()) {
                flag = true;
                data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".hedgid")
                    .html() + "' />";
            } else {
                flag = false;
            }
        });
        $('#clickid').val(2);
        document.forms["printForm"].submit();
        console.log(data);

    });

    function get_data() {
        //var from_date = "<?php echo date("Y-m-d"); ?>";
        //var to_date = "<?php echo date("Y-m-d"); ?>";

        try {
            var table = '';
            table += '<table id="grid-data" class="table">';
            //table +='<thead><tr><th>Hedge ID </th><th>Deal ID </th><th>Order ID </th><th>QTY (Grms) </th><th>Price</th><th>Bid</th><th>Ask</th><th>Req ID</th><th>Symbol</th><th>Book No</th><th>Booked on</th><th>Comment</th><th style="display:none">Booked By</th><th style="display:none">Order For</th><th>Action</th></tr></thead><tbody>';
            table += '<thead><tr><th>Hedge ID </th><th>Book No</th><th>Customer</th><th>Booked Qty(Grms)</th><th>Booked Rate</th><th>Hedge QTY(Grms)</th><th>Price</th><th>Symbol</th><th>Bid</th><th>Ask</th><th>Booked on</th><th>Deal ID </th><th>Req ID</th><th>Comment</th><th style="display:none">Booked By</th><th style="display:none">Order For</th><th data-sortable="false">Action</th></tr></thead><tbody>';
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/mt5_hedge/" . $model_name; ?>/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value,
                success: function(data) {
                    var table_val = '';
                    $.each(data, function(i) {
                        var del_link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/delete_mt5hedge/0/<?php echo $model_name; ?>/" + data[i]['hedgid'] + "/0";

                        table_val += '<tr><td class="table_data">' + data[i]['hedgid'] +
                            '</td><td class="table_data">' + data[i]['cusbookid'] +
                            '</td><td class="table_data">' + data[i]['cus_name'] +
                            '</td><td class="table_data">' + data[i]['book_qty'] +
                            '</td><td class="table_data">' + data[i]['book_rate'] +
                            '</td><td class="table_data">' + data[i]['volume'] +
                            '</td><td class="table_data">' + data[i]['price'] +
                            '</td><td class="table_data">' + data[i]['symbol'] +
                            '</td><td class="table_data">' + data[i]['bid'] +
                            '</td><td class="table_data">' + data[i]['ask'] + '</td><td class="">' + data[i]['bookedon'] + '</td><td class="table_data">' + data[i]['dealid'] +
                            '</td><td class="table_data">' + data[i]['request_id'] +
                            '</td><td class="table_data">' + data[i]['comment'] +
                            '</td><td style="display:none;" class="table_data">' + data[i]['bookedby'] +
                            '</td><td style="display:none;" class="table_data">' + data[i]['orderfor'] +
                            '</td><td ><?php if ($userrights["delete"] == 1) { ?><a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href=' + del_link + '>Delete</a><?php } ?></td></tr>';
                    });

                    $('#grid-data').remove();
                    $('#grid-data_wrapper').remove();
                    var row_length = true;
                    if (table_val == '') {
                        // table_val = '<tr><td colspan="17">No data available in table</td></tr>';
                        // row_length = false;
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

                    //oTable = $('#grid-data').dataTable();

                    if (row_length) {
                        oTable = $('#grid-data').dataTable({
                            "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
                            "sPaginationType": "bootstrap",
                            "iDisplayLength": "50",
                            "scrollY": "500px",
                            "scrollX": true,
                            "scrollCollapse": true,
                            "oLanguage": {
                                "sLengthMenu": "_MENU_ records per page"
                            },
                            lengthMenu: [
                                [25, 50, 100, 250, -1],
                                [25, 50, 100, 250, "All"]
                            ],
                            dom: 'lBfrtip',
                            // "order": [[0, "desc"]],
                            // "buttons": [
                            //         {
                            //             extend: 'print',
                            //             footer: true,
                            //             title: 'Limit Order',
                            //         },
                            //         {
                            //             extend: 'excel',
                            //             footer: true,
                            //             title: 'Limit Order',
                            //         }
                            //     ],
                            columnDefs: [{
                                    targets: [2, 7, 10],
                                    className: 'dt-left'
                                },
                                {
                                    targets: [0, 1, 3, 4, 5, 6, 8, 9, 11, 12],
                                    className: 'dt-right'
                                },
                                {
                                    width: "100px",
                                    targets: [2]
                                }
                            ]
                        });
                        $("#grid-data thead th").attr("data-sortable", function(i, val) {
                            if (val != 'false') {
                                $("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor',
                                    'pointer');
                            }
                        });
                        oTable.fnSort([
                            [0, 'desc']
                        ]);
                        oTable.fnDraw();
                    }


                    $('.btn-confirm').click(function(e) {
                        e.preventDefault();
                        var link = $(this).attr('href');
                        $('#myDialog').find('#confirm').attr('href', link);
                        $('#myDialog').modal('show');
                    });

                    //for delete operation
                    $('#myDialog #confirm').click(function() {
                        $('#myDialog').modal('hide');
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
                        window.location.href = $(this).attr('href');
                        return false;
                    });
                },
                error: function(request, error) {
                    console.log(error);
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    }
</script>
