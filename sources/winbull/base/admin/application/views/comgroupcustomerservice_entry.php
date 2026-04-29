<?php 
	$this->load->view("include/header"); 
	$controller_name = "C_commoditygroupcustomer";
	$model_name = "CommodityGroupCustomerservice_model";
?>
<script type="text/javascript">
function searchdata()	{
		var regexp,regexp1,regexp2,regexp3;
		
		var tableId=document.getElementById('data_grid');
		var uppertableId=document.getElementById('data_grid_header');
		
		for(var i=0; i<tableId.rows.length; i++)	{
			regexp=new RegExp(uppertableId.rows[1].cells[1].childNodes[0].value);
			regexp1=new RegExp(uppertableId.rows[1].cells[2].childNodes[0].value);
			regexp2=new RegExp(uppertableId.rows[1].cells[3].childNodes[0].value);
			regexp3=new RegExp(uppertableId.rows[1].cells[4].childNodes[0].value);
			if(regexp.test((tableId.rows[i].cells[1].innerHTML).toLowerCase()) 
			&& regexp1.test((tableId.rows[i].cells[2].innerHTML).toLowerCase())
			&& regexp2.test((tableId.rows[i].cells[3].innerHTML).toLowerCase())
			&& regexp3.test((tableId.rows[i].cells[4].innerHTML).toLowerCase()))	{
				tableId.rows[i].style.display="table-row";
			}
			else	{
				tableId.rows[i].style.display="none";
			}
		}				 
		
	}
</script>
<style>
.footer{padding:0px 10px}
.EnableDisableComm {
	display:none;
}
.com-barQuantities {
	padding: 0px;
}
</style>
<!--<div>
    <ul class="breadcrumb">
			<li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		 <li>
            <a href="#">Customers</a>
        </li>
		<li>
            <a href="#">Send Rates</a>
        </li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_commoditygroupcustomer/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						 <?php
							$status				=	$type;
							$id					=	$_POST['fv']['serv_group_id']==NULL ? NULL : $_POST['fv']['serv_group_id'] ;
							$attributes 		=	array('class' => 'form-horizontal');
							//Opening form
							echo form_open($controller_name.'/DB_Controller/'.$model_name.'/'.$status.'/'.$id,$attributes); ?>
						<form class="form-sample">
							<p class="card-description card-description1 quick1">Send Rates</p>
							<?php 
								if(isset($db_error_msg) && $db_error_msg != '')
								{
									echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> '.$db_error_msg.'
											</div>';
								}	
							
							?>
							<div class="row form-sample1 sendrate_label">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Group Name :</label>
										<div class="col-sm-7">
											<label class="control-label con-sm-2"><?php echo set_value('serv_group_name',$serv_group_name); ?></label>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  <label class="col-sm-3 col-form-label">Description :</label>
										<div class="col-sm-7">
											<label class="control-label con-sm-2"><?php echo set_value('serv_group_desc',$serv_group_desc); ?></label>
										</div>
									</div>
								</div>
							</div>
							<div class="table-responsive" style="margin-top:0px;">
								<table class="table table-hover1 sendrates_table">
									<thead>
										<tr>
											<th>Gold-1</th>
											<th>Gold-2</th>
											<th>Gold-3</th>
											<th>Silver</th>
										</tr>
									</thead>
									<tbody>
										<?php 
											$result_set=$this->$model_name->load_commoditydetails($id);
											if($result_set->num_rows() > 0)
											{ ?>
												<tr align="justify">
													<td><ol>
														<?php foreach ($result_set->result_array() as $row)	{ ?>
															<?php if($row['com_type'] == 0) echo "<li>".$row['comname']."</li>"; ?></li>
														<?php } ?></ol>
													</td>
													<td><ol>
														<?php foreach ($result_set->result_array() as $row)	{ ?>
															<?php if($row['com_type'] == 2) echo "<li>".$row['comname']."</li>"; ?></li>
														<?php } ?></ol>
													</td>
													<td><ol>
														<?php foreach ($result_set->result_array() as $row)	{ ?>
															<?php if($row['com_type'] == 3) echo "<li>".$row['comname']."</li>"; ?></li>
														<?php } ?></ol>
													</td>
													<td><ol>
														<?php foreach ($result_set->result_array() as $row)	{ ?>
															<?php if($row['com_type'] == 1) echo "<li>".$row['comname']."</li>"; ?></li>
														<?php } ?></ol>
													</td>
												</tr>
											<?php }
										?>
									</tbody>
								</table>
							</div>
							<div class="table-responsive">
								<table id="data_grid_header" class="table table-hover1">
									<thead>
										<tr>
										<th width="5%"><input type="checkbox" id="selectall" name="selectall" onchange="selectAll(this,'data_grid',0);" /></th>
										<th width="20%">Customer</th>
										<th width="25%">Company</th>
										<th width="20%">Mobile No</th>
										<th width="30%">Email ID</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td></td>
											<td align="center"><input type="text" name="customersearch" id="customersearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50" /></td>
											<td align="center"><input type="text" name="companysearch" id="companysearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50"/></td>
											<td align="center"><input type="text" name="mobilesearch" id="mobilesearch" value="" class="listsearchinput" onkeyup="searchdata()" onkeydown="validateKeyPress(event, this,1)"/></td>
											<td align="center"><input type="text" name="emailsearch" id="emailsearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50"/></td>
										</tr>
									</tbody>
								</table>
							</div>
							 <div class="table-responsive" style="height:300px;overflow:auto;">	
								<table id="data_grid" class="table table-hover1">
									<thead>
										<?php 
									   $tabindex=3;
									   $result_set=$this->$model_name->load_customer($id);
											//echo($sql);
											foreach ($result_set->result_array() as $row)	{
										?>
										  <tr height="20px;"> 	  	
											<td style="text-align:center;" width="5%"><input type="checkbox" id="cgc_cusid" name="fv[cgc_cusid][]" value="<?php echo $row['cus_id']; ?>" <?php echo $row['cus_id']==$row['cgc_cusid']?"checked=checked":""; ?> /></td>
											<td style="text-align:left;" width="20%"><?php echo $row['cus_name']; ?></td>							
											<td style="text-align:left;" width="25%"><?php echo $row['cus_company_name']; ?></td>
											<td style="text-align:left;" width="20%"><?php echo $row['cus_mobile']; ?></td>							
											<td style="text-align:left;" width="30%"><?php echo $row['cus_email']; ?></td>			
										  </tr>      
									  <?php 
										}
									  ?>
									</thead>
								</table>
							</div>
											
							<div class="row form-sample1" style="margin-top:30px;">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-4">
									
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<?php $this->load->view("include/footer"); ?>
