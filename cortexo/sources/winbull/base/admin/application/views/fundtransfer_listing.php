<?php $this->load->view('include/header.php'); 
	$controller_name = "C_fundtransfer"; 
	$model_name = "fundtransfer_model";
	$this->load->view('include/confirm');
?>
    <div>
        <ul class="breadcrumb">
            <li>
                 <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>            
			</li>
            <li>
                <a href="#">Transaction</a>            </li>
			 <li>
                <a href="#">Fund Transfer Listing</a>            </li>
        </ul>
</div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Fund Transfer Listing</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_fundtransfer/open_entryform/fundtransfer_model/add_new/0"; ?>" class="btn btn-primary btn-sm" role="button"><i class="glyphicon glyphicon-plus-sign"></i></a>
				  </div>
                    
              </div>
				<div class="box-content">
                    <?php
					$fund_transfer = ($this->$model_name->get_data()->result_array());	
					?>
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
						<thead>
						<tr>
						   <th width="10%">ID </th>
						   <th width="25%">Date </th>
							<th width="25%">Customer Name </th>
							<th width="20%">Amount</th>
							<th width="20%">Actions</th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach (  $fund_transfer as $val ) 
								{
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
										
										    echo '<tr>
														<td>'. $val['ft_code'].'</td>
														<td>'. $val['ft_date'].'</td>
														<td>'. $val['cus_name'].'</td>
														<td>'. $val['ft_amount'].'</td>
														<td><a class="btn btn-info" href='.$editLink.$val['ft_code'].'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Edit
															</a>
															<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$val['ft_code'].'>
																<i class="glyphicon glyphicon-trash icon-white"></i>
																Delete
															</a>
													   </td>
													</tr>';
								}
							  ?>
								
							</tbody>
    </table>
					 <!-- page content end-->
              </div>
            </div>
        </div>
        <!--/span-->
    </div><!--/row-->
<?php $this->load->view('include/footer.php'); ?>
