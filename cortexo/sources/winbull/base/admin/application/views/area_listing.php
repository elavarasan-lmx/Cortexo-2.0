<?php 
	$this->load->view('include/header.php'); 
	$model_name = "area_model";
	$controller_name="C_area";
?>
	
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Settings</a></li>
			 <li>
                <a href="#">Area Listing</a></li>
        </ul>
    </div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i> Area List</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_area/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>
                    
                </div>
				
				<div class="box-content">
                     <!-- page content start-->
						<?php
				         	      $area=$this->$model_name->get_data()->result_array();
							      $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
									?>

						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
    <thead>
								<tr>
									<th width="5%">ID</th>
									<th width="55%">Area Name </th>
									<th width="20%">Status</th>								
									<th width="20%" data-column-id="commands" data-formatter="commands" data-sortable="false">Action</th>
								</tr>
							</thead>
    <tbody>
	<?php
	foreach (  $area as $area ) 
								{ 	?>
								 <tr>	
									<td><?php echo $area['ar_sno'] ?></td>
									<td><?php echo $area['ar_name'] ?></td>
									<td><?php echo $area['ar_active'] == 0 ? 'Inactive':'Active'; ?></td>
									<td><a class="btn btn-info" href='<?php echo $editLink.$area['ar_sno'] ?>'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Edit
															</a>
															<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='<?php echo $deleteLink.$area['ar_sno'] ?>'>
																<i class="glyphicon glyphicon-trash icon-white"></i>
																Delete
															</a>
									</td>								
								 </tr>	
							 <?php	}	?>
    </tbody>
    </table>


					 <!-- page content end-->
                </div>
            </div>
        </div>
        <!--/span-->
    </div><!--/row-->

   






<?php $this->load->view('include/footer.php'); ?>