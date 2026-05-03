<?php 
	$this->load->view('include/header.php'); 
	$model_name = "category_model";
	$controller_name="C_categories";
?>
    <!-- x-editable (bootstrap version) -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-tooltip.js"></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-popover.js"></script>
	<link href="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet"/>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
	<script type="text/javascript">
	$(document).ready(function() {
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'popup';
    
    //make username editable
    $('.edit_name').editable({
	    url: '<?php echo $this->config->item('base_url') ?>index.php/C_categories/inline_update',
		validate: function(value) {
			if($.trim(value) == '') {
			return 'This field is required';
			}
		},
		success: function(response, newValue) {
			if(response != 1) return response; //msg will be shown in editable form
		}
	});
	 $('.select_status').editable({
		source: [
		{value: 1, text: 'Active'},
		{value: 0, text: 'Disabled'}
		],
		validate: function(value) {
			if($.trim(value) == '') {
			return 'This field is required';
			}
		},
	    url: '<?php echo $this->config->item('base_url') ?>index.php/C_categories/inline_update',
		success: function(response, newValue) {
			if(response != 1) return response; //msg will be shown in editable form
		}
	});
});
</script>
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Catalog</a>
            </li>
			 <li>
                <a href="#">Category Listing</a>
            </li>
        </ul>
    </div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i> Category List</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_categories/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>
                    
                </div>
                <div class="box-content">
                     <!-- page content start-->
						<?php
                                  $categories=($this->$model_name->get_data()->result_array());
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
										   
										   
										
									?>
					
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
									<th width="10%">ID</th>
									<th width="40%">Category Name</th>
									<th width="30%">Status</th>
									<th width="20%">Actions</th>
								</tr>
							</thead>
							<tbody>
							<?php
							    foreach (  $categories as $cat ) 
								{
											$com_type_status = ($cat['cat_status'] == "Active" ? 1 : 0);
										    echo '<tr>
													<td>'. $cat['cat_id'].'</td>
														<td><a href="#" class="edit_name" data-name="cat_name" data-pk="'.$cat['cat_id'].'" data-type="text" data-placement="right" data-title="Enter Category name">'. $cat['cat_name'].'</a></td>
														<td><a href="#" class="select_status" data-name="cat_status" data-type="select" data-pk="'. $cat['cat_id'].'" data-placement="right" data-title="Select Status"   data-value="'.$com_type_status.'">'. $cat['cat_status'].'</a></td>
														<td><a class="btn btn-info" href='.$editLink.$cat['cat_id'].'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Edit
															</a>
															<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$cat['cat_id'].'>
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