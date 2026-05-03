<?php 
	$this->load->view('include/header.php'); 
	$controller_name = "C_customerDelivery"; 
	$model_name = "Customerdelivery_model";
?>
<!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Transaction</a>
            </li>
			 <li>
                <a href="#">Pending Delivery</a>
            </li>
        </ul>
    </div>-->
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
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Customer Margin Report</h4>
                        <p class="card-description"> </p>
                        <?php
							$cus_margin = $this->$model_name->get_customermarginreport()->result_array();	
						?>
                        <div class="table-responsive">  
                            <table id="grid-data" class="table table-hover">
                                <thead>  
                                    <tr>
                                        <th>Customer</th>
                                        <th>Company Name</th>
                                        <th>Mobile</th>
                                        <th class="align-3">Margin paid</th>
                                        <th class="align-3">Available balance</th>
                                        <!-- BZ-33: Added missing date column -->
                                        <th>Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
											foreach ( $cus_margin as $val ) 
											{
												echo '<tr>
														<td>'. $val['cus_name'].'</td>
														<td>'. $val['cus_company_name'] .'</td>
														<td>'. $val['cus_mobile'].'</td>
														<td class="align-3">'. $val['margin_paid'].'</td>
														<td class="align-3">'. $val['available_balance'].'</td>
									<td>'. $val['last_trans_date'].'</td>
													</tr>';
											}
										  ?>
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

<script type="text/javascript">
$(document).ready(function() {
    $('#grid-data').dataTable({
        aaSorting: [[0, 'asc']]
    });
});
</script>
<?php $this->load->view('include/footer.php'); ?>