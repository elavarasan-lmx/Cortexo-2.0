
<?php 
	$this->load->view('include/header.php'); 
	$model_name = "bank_model";
	$controller_name="C_bank";
?>
	<link href="<?php echo $this->config->item('base_url'); ?>assets/jquery.bootgrid-1.0.0/jquery.bootgrid.css" rel="stylesheet">
    <script src="<?php echo $this->config->item('base_url'); ?>assets/jquery.bootgrid-1.0.0/jquery.bootgrid.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/jquery.bootgrid-1.0.0/jquery.bootgrid.min.js"></script>
		
 <script type="text/javascript"> 
		

    var grid = $("#grid-data").bootgrid({
    ajax: true,
    post: function ()
    {
		return {
		id: "b0df282a-0d67-40e5-8558-c9e93b7befed"
		};
    },
	url: "<?php echo $this->config->item('base_url')."index.php/C_main/grid_dataload/".$model_name; ?>",
		formatters: {
		"commands": function(column, row)
			{
				return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> " +
				"<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-trash-o\"></span></button>";
			}
		}
    }).on("loaded.rs.jquery.bootgrid", function()
    {
    /* Executes after data is loaded and rendered */
    grid.find(".command-edit").on("click", function(e)
    {
		alert("You pressed edit on row: " + $(this).data("row-id"));
		}).end().find(".command-delete").on("click", function(e)
		{
			alert("You pressed delete on row: " + $(this).data("row-id"));
		});
    });


	</script>
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">Bank Listing</a>
            </li>
        </ul>
    </div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i> Bank List</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/C_bank/open_entryform/".$model_name."/add_new/"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>
                    
                </div>
                <div class="box-content">
                     <!-- page content start-->
						<?php
                                  $banks=$this->$model_name->get_data()->result_array();
                                 
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
										   
										   
										
						?>


						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
								<th width="10%">Bank Code</th>
								<th width="20%">Bank Name</th>
								<th width="20%">Branch</th>
								<th  width="20%">Account No</th>
								<th  width="10%">Status</th>
								
								<th  width="20%" data-column-id="commands" data-formatter="commands" data-sortable="false">Action</th>
								</tr>
							</thead>
							<tbody>
								<?php	
								 foreach ( $banks as $bank ) 
								{
											
										    echo '<tr>
													<td>'.$bank['bnk_code'].'</td>
													<td>'.$bank['bnk_name'].'</td>
													<td>'.$bank['bnk_branch'].'</td>
													<td>'.$bank['bnk_accno'].'</td>
													<td>'.$bank['bnk_status'].'</td>
													<td>
														<a class="btn btn-info" href='.$editLink.$bank['bnk_code'].'><i class="glyphicon glyphicon-edit icon-white"></i> Edit</a>
														<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$bank['bnk_code'].'>
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