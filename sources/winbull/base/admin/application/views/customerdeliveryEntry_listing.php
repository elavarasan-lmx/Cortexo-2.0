<?php $this->load->view('include/header.php'); 
	$model_name = "customerdelivery_model";
	$controller_name = "C_customerDelivery";
	$this->load->view('include/confirm');
?>
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="index.php/C_main/load_mainpage">Admin</a>            </li>
            <li>
                <a href="#">Transaction</a>            </li>
			 <li>
                <a href="#">Delivery</a>            </li>
        </ul>
</div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Delivery Entry Listing</h2>
                    
              </div>
				<div class="box-content">
                    <?php
					$delivery_entry = ($this->$model_name->get_deliverydata($id)->result_array());	
					?>
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
						<thead>
						<tr>
						   <th width="15%">Delivery No</th>
						   <th width="15%">Book No</th>
							<th width="25%">Delivery Date</th>
							<th width="25%">Customer Name</th>
							<th width="20%">Actions</th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach (  $delivery_entry as $val ) 
								{
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_delivery_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_delivery_entryform/'.$model_name.'/delete/';
										
										    echo '<tr>
														<td>'. $val['invoice_delcode'].'</td>
														<td>'. $val['invoice_bookno'].'</td>
														<td>'. $val['deliverydate'].'</td>
														<td>'. $val['cus_name'].'</td>
														<td><a class="btn btn-info" href='.$editLink.$val['invoice_delcode'].'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Edit
															</a>
															<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$val['invoice_delcode'].'>
																<i class="glyphicon glyphicon-trash icon-white"></i>
																Delete
															</a>
													   </td>
													</tr>';
								}
								
									
							  ?>
								
							</tbody>
    </table>
<div id="hidden"></div>	

					 <!-- page content end-->
              </div>
            </div>
        </div>
        <!--/span-->
    </div><!--/row-->
<?php $this->load->view('include/footer.php'); ?>
