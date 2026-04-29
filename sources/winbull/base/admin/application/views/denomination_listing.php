<?php 
	$this->load->view('include/header.php'); 
	$model_name = "denomination_model";
	$controller_name="c_denomination";
?>
	
 
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">Denomination Listing</a>
            </li>
        </ul>
    </div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i> Denomination List</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_denomination/open_entryform/".$model_name."/add_new/"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>
                    
                </div>
                <div class="box-content">
                     <!-- page content start-->
						<?php
					        $denominations=$this->$model_name->get_data()->result_array();
                      
							  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
							  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
						?>

						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
								<th width="25%">Denomination Code</th>
								<th width="30%">Denomination Name</th>
								<th width="25%">Status</th>
								<th width="20%">Action</th>
								</tr>
							</thead>
							<tbody>
							<?php	
								 foreach ( $denominations as $denomination ) 
								{
											
										    echo '<tr>
													<td>'.$denomination['den_code'].'</td>
													<td>'.$denomination['den_name'].'</td>
													<td>'.$denomination['den_status'].'</td>
													<td>
														<a class="btn btn-info" href='.$editLink.$denomination['den_code'].'><i class="glyphicon glyphicon-edit icon-white"></i> Edit</a>
														<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$denomination['den_code'].'>
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