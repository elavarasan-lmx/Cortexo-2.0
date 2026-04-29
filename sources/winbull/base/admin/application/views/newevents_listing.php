<?php 
	$this->load->view('include/header.php'); 
	$model_name = "userevent_model";
	$controller_name="C_userevent";
?>

<script>

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
 <div>
     <ul class="breadcrumb">
        <li>
            <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
         </li>
        <li>
            <a href="#">Events</a>
        </li>
        </ul>
    </div>
    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Event List</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_userevent/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>  
                </div>
                <div class="box-content">
                     <!-- page content start-->
						<?php
							$records=$this->$model_name->get_data()->result_array();
							
							$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
							
							$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
							
							
							$tradingLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_activateentryform/'.$model_name.'/'; 
						?>
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
									<th width="5%">Eve.ID</th>
									<th width="10%">Event Name</th>
									<th width="10%">Event.Date</th>
									<th width="10%">Event Description</th>
									<th width="10%" data-sortable="false">Action</th>
								</tr>
							</thead>
							<tbody>
							<?php	
								 foreach ($records as $event ) 
								 {
											
										    echo '<tr>
													<td>'.$event['eve_id'].'</td>
													<td>'.$event['eve_name'].'</td>
													<td>'.$event['eve_date'].'</td>
													<td>'.$event['eve_description'].'</td>
													<td>
														<a class="btn btn-info btn-sm"  href='.$editLink.$event['eve_id'].'><i class="glyphicon glyphicon-edit icon-white"></i> Edit</a>
														  
														<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete"  href='.$deleteLink.$event['eve_id'].'><i class="glyphicon glyphicon-trash icon-white"></i> Delete</a>
												</td>					</tr>';
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