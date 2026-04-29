<?php 

$controller_name = "C_customerservice"; 
$model_name = "Customerservice_model";
$this->view('include/header.php'); 

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
.table {
margin-bottom:0px !important;
}
</style>
<!--<div>
    <ul class="breadcrumb">
		<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Sms / Email</a></li>
		<li> <a href="#">Send News Letters</a></li>
    </ul>
</div>-->

<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">  
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerservice/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php 
							$status				=	$type;
							$id					=	$_POST['fv']['serv_group_id']==NULL ? NULL : $_POST['fv']['serv_group_id'] ;	
							$attributes 		=	array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm');
							//Opening form
							echo form_open($controller_name.'/DB_Controller/'.$model_name.'/'.$status.'/'.$id,$attributes);					
						?>
						<form class="form-sample">
							<p class="card-description card-description1">Send News Letters</p>
							<?php 
								if(isset($db_error_msg) && $db_error_msg != '')
								{
									echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> '.$db_error_msg.'
											</div>';
								}	
							
							?>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Group Name</label>
										<div class="col-sm-7">
											<?php echo set_value('serv_group_name',$serv_group_name); ?>
											<span class="help-block">Group Name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Email</label>
										<div class="col-sm-7">
											<label>
												<input type="checkbox" id="serv_group_email" name="fv[serv_group_email]" value="1" <?php echo $serv_group_email==1?"checked=checked":""; ?> disabled="disabled" />
											</label>
											<span class="help-block">Email status.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">SMS</label>
										<div class="col-sm-7">
											<label>
												<input type="checkbox" id="serv_group_sms" name="fv[serv_group_sms]" value="1" <?php echo $serv_group_sms==1?"checked=checked":""; ?> disabled="disabled"  />
											</label>
											<span class="help-block">sms status.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Desc</label>
										<div class="col-sm-7">
											<?php echo set_value('serv_group_desc',$serv_group_desc); ?>
											<span class="help-block">Description.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Active</label>
										<div class="col-sm-7">
											<label>
												<input type="checkbox" id="serv_group_active" name="fv[serv_group_active]" value="1" <?php echo $serv_group_active==1?"checked=checked":""; ?> disabled="disabled" />
											 </label>
											<span class="help-block"> group status.</span>
										</div>
									</div>
								</div>
							</div>
							<div  class="table-responsive">
								<table  id="data_grid_header" class="table table-hover1">
									<thead>
										<tr>
											<th><input type="checkbox" id="selectall" name="selectall" onchange="selectAll(this,'data_grid',0);" /></th>
											<th width="20%">Customer</th>
											<th width="25%">Company</th>
											<th width="20%">Mobile No</th>
											<th width="30%">Email ID</th>
										</tr>
									</thead>
									<tbody>
										<td></td>
										<td align="center"><input type="text" name="customersearch" id="customersearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50"/></td>
										<td align="center"><input type="text" name="companysearch" id="companysearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50"/></td>
										<td align="center"><input type="text" name="mobilesearch" id="mobilesearch" value="" class="listsearchinput" onkeyup="searchdata()" onkeydown="validateKeyPress(event, this,1)" maxlength="10"/></td>
										<td align="center"><input type="text" name="emailsearch" id="emailsearch" value="" class="listsearchinput" onkeyup="searchdata()" maxlength="50"/></td>
									</tbody>
								</table>
							</div>
							<div style="height:300px;overflow:auto;" class="table-responsive">					
								<table id="data_grid" class="table table-hover1">
										  <?php 
								   $tabindex=3;
								   $result_set=$this->$model_name->load_customer($id);
										//echo($sql);
										foreach ($result_set->result_array() as $row)	{
									?>
														<tr height="20px;"> 	  	
										<td style="text-align:center;" width="5%"><input type="checkbox" id="csg_cusid" name="fv[csg_cusid][]" value="<?php echo $row['cus_id']; ?>" <?php echo $row['cus_id']==$row['csg_cusid']?"checked=checked":""; ?> /></td>
										<td style="text-align:left;" width="20%"><?php echo $row['cus_name']; ?></td>							
										<td style="text-align:left;" width="25%"><?php echo $row['cus_company_name']; ?></td>
										<td style="text-align:left;" width="20%"><?php echo $row['cus_mobile']; ?></td>							
										<td style="text-align:left;" width="30%"><?php echo $row['cus_email']; ?></td>			
									  </tr>      
								  <?php 
									}
								  ?>		
								</table>
							</div>
									
							<div class="row form-sample1" style="margin-top:30px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if($status == "edit" && $userrights["edit"] == 1) { ?>
									<button type="submit" id="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } else if($status == "add_new" && $userrights["add"] == 1) { ?>
									<button type="submit" id="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">
									
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
