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
    $(function() {
        $('#from_date').datetimepicker({
            pickTime: false
        });
        $('#to_date').datetimepicker({
            pickTime: false
        });
        $("#refresh_page").click(function(event) {
            event.preventDefault();
            get_data();
        });
    });
    jQuery(document).ready(function() {
        document.getElementById('from_date').value = "<?php echo date("d-m-Y"); ?>";
        document.getElementById('to_date').value = "<?php echo date("d-m-Y"); ?>";
        get_data();
    });
</script>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-lg-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Non Booking User List ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )</h4>
                        <p class="card-description"> </p>

                        <div class="table-responsive box-content">
                            <div class="filterings" style="height: 43px;text-align: center; margin-bottom: 20px;">
                                <div>
                                    <input type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" />
                                    <input type="text" name="to_date" id="to_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" />&nbsp;<i style="cursor:pointer" onclick="get_data();" class="glyphicon glyphicon-search"></i>
                                </div>
                            </div>

                            <table id="grid-data" class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">Sno</th>
                                        <th>Customer Name</th>
                                        <th style="width: 120px;">Mobile</th>
                                        <th style="width: 150px;">Registered Date</th>
                                        <th style="width: 120px;">Inactive Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- partial -->
</div>
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
    function get_data() {
        try {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/inactive_user/" . $model_name; ?>/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value,
                success: function(data) {
                    // Destroy existing DataTable if it exists
                    if ($.fn.DataTable.isDataTable('#grid-data')) {
                        $('#grid-data').DataTable().destroy();
                    }

                    // Clear table body
                    $('#grid-data tbody').empty();

                    // Populate table with data
                    var table_val = '';
                    if (data && data.length > 0) {
                        $.each(data, function(i, row) {
                            table_val += '<tr>';
                            table_val += '<td class="table_data">' + (i + 1) + '</td>';
                            table_val += '<td class="table_data">' + (row.cus_name || '-') + '</td>';
                            table_val += '<td class="table_data">' + (row.cus_mobile || '-') + '</td>';
                            table_val += '<td class="table_data">' + (row.cus_register_on || '-') + '</td>';
                            table_val += '<td class="table_data">' + (row.inactive_on || '-') + '</td>';
                            table_val += '</tr>';
                        });
                    } else {
                        table_val = '<tr><td colspan="5" class="text-center">No inactive customers found</td></tr>';
                    }

                    $('#grid-data tbody').html(table_val);

                    // Initialize DataTable
                    $('#grid-data').DataTable({
                        "lengthChange": true,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": false,
                        "pageLength": 25,
                        "lengthMenu": [
                            [10, 25, 50, 100, -1],
                            [10, 25, 50, 100, "All"]
                        ],
                        "language": {
                            "lengthMenu": "Show _MENU_ entries",
                            "search": "Search:",
                            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                            "infoEmpty": "Showing 0 to 0 of 0 entries",
                            "infoFiltered": "(filtered from _MAX_ total entries)",
                            "paginate": {
                                "first": "First",
                                "last": "Last",
                                "next": "Next",
                                "previous": "Previous"
                            }
                        },
                        "order": [
                            [0, 'asc']
                        ]
                    });
                },
                error: function(request, error) {
                    console.log("Error:", error);
                    showToast("Failed to load data. Please try again.", "error");
                }
            });
        } catch (ex) {
            console.log("Exception:", ex);
            showToast("An error occurred: " + ex.message, "error");
        }
    }
</script>