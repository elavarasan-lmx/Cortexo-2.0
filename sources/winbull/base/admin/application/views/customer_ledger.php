<?php
$this->load->view('include/header.php');
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
</style>
<script type="text/javascript">
    // BZ-34: Removed inline toggle logic. 
    // The filter toggle is handled globally by admin/assets/js/lmx.js on id="expand_filter".
    // Previously, having BOTH an inline onclick and the global listener caused them to cancel each other out.

    $(document).ready(function() {
        $('#cus_id').on('change', function() {
            if ($(this).val() != '-1') {
                get_data();
            }
        });
        // BZ-34: Also trigger search when dates change
        $('#from_date, #to_date').on('dp.change', function() {
            if ($('#cus_id').val() != '-1') {
                get_data();
            }
        });
    });

    function get_data() {
        try {
            var table = '';
            table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive"><thead><tr><th>Date Time</th><th>Deal No</th><th>Reference</th><th class="align-2">Credit(Rs)</th><th class="align-2">Debit(Rs)</th><th class="align-2">Closing Balance(Rs)</th></tr><thead><tbody>';
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . "index.php/" . $controller_name . "/TransactionReport_dataload/" . $model_name; ?>/" + document.getElementById('cus_id').value + "/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value,
                success: function(data) {
                    var size = $(data).length;
                    var table_val = '';
                    $.each(data, function(i, value) {
                        classbal = "";
                        if (i == (size - 1)) {
                            classbal = "report_availbal";
                        }
                        table_val += '<tr ><td>' + value.trans_date + '</td><td>' + value.trans_book_code + '</td><td>' + value.trans_desc + '</td><td class="align-3">' + value.credit + '</td><td class="align-3">' + value.debit + '</td><td class="align-3 ' + classbal + '">' + value.closing_balance + '</td></tr>';
                    });

                    $('#grid-data').remove();
                    $('#grid-data_wrapper').remove();

                    table += table_val;
                    table += '</tbody>';
                    table += '<table>';
                    $('.box-content').append(table);
                    // oTable = $('#grid-data').dataTable();
                    $(document).ready(function() {
                        $('#grid-data').DataTable({
                            "order": [
                                [1, "desc"]
                            ]
                        });
                    });


                },
                error: function(request, error) {}
            });
        } catch (ex) {
            console.log(ex);
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
    });
    jQuery(document).ready(function() {
        // Set default dates using JS (today for to_date, 30 days ago for from_date)
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var todayStr = dd + '-' + mm + '-' + yyyy;

        var past = new Date();
        past.setDate(past.getDate() - 30);
        var pdd = String(past.getDate()).padStart(2, '0');
        var pmm = String(past.getMonth() + 1).padStart(2, '0');
        var pyyyy = past.getFullYear();
        var pastStr = pdd + '-' + pmm + '-' + pyyyy;

        if (document.getElementById('from_date')) document.getElementById('from_date').value = pastStr;
        if (document.getElementById('to_date'))   document.getElementById('to_date').value   = todayStr;
    });
</script>
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
                        <div class="header-container">
                            <h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Customer Ledger</h4>
                            <div class="d-flex align-items-center" style="gap: 10px; display: flex;">
                                <span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
                            </div>
                        </div>


                        <div class="box-content">
                            <div class="filter-card" id="expand_filter_details" style="display: none; margin-bottom: 15px;">
                                <div class="row align-items-end">
                                    <?php $customers =  $this->$model_name->get_active_customers(); ?>
                                    <div class="col-md-3">
                                        <label class="label-total">Customer</label>
                                        <select id="cus_id" class="form-control">
                                            <option value="-1" selected='selected'> - SELECT - </option>
                                            <?php foreach ($customers as $val) { ?>
                                                <option value="<?php echo $val['cus_id'] ?>"><?php echo $val['customer'] ?></option>
                                            <?php } ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="label-total">From Date</label>
                                        <input type="text" name="from_date" id="from_date" class="form-control" readonly="true"
                                            value="" data-date-format="DD-MM-YYYY" placeholder="From Date" />
                                    </div>
                                    <div class="col-md-3">
                                        <label class="label-total">To Date</label>
                                        <input type="text" name="to_date" id="to_date" class="form-control" readonly="true"
                                            value="" data-date-format="DD-MM-YYYY" placeholder="To Date" />
                                    </div>
                                    <div class="col-md-3 text-right">
                                        <button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
                                    </div>
                                </div>
                            </div>
                            <div class="table-responsive" style="margin-top: 20px;">
                                <table id="grid-data"
                                    class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
                                    <thead>
                                        <tr>
                                            <th>Date and Time </th>
                                            <th>ID </th>
                                            <th>Reference </th>
                                            <th>Credit</th>
                                            <th>Debit</th>
                                            <th>Closing Balance</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>

                            <!-- page content end-->
                        </div>
                    </div>
                </div>
            </div>
            <!--/span-->
        </div>
    </div>
    <!-- partial -->
</div>
<!--/row-->
<?php $this->load->view('include/footer.php'); ?>