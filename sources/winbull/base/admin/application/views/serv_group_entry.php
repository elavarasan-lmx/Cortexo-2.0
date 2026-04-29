<?php $this->load->view('include/header.php'); ?>

	$(document).ready(function() {
		// AJAX form submit
		$("#iframeForm").on("submit", function(e) {
			e.preventDefault();
			let form = this;

			// 1. Standard Validation
			if (!validateForm(e, form)) {
				return false;
			}

			let btn = $(form).find('button[type="submit"]');
			let formData = new FormData(form);

			btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: $(form).attr("action"),
				type: "POST",
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				},
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show");

					if (response.status === "success") {
						showToast(response.message, 'success');
						setTimeout(function() {
							window.location.href = "<?php echo $this->config->item('base_url'); ?>index.php/C_serv_group/open_listingform";
						}, 1000);
					} else {
						btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
						showToast(response.message || "Operation failed!", 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
					showToast("Server error: " + error, 'danger');
				}
			});
		});
	});

	function selectAll() {
		chbox = arguments[0];
		type = arguments[1];
		table = document.getElementById("com_table");

		if (type == 'sel') {
			active_cell = 1;
		} else {
			active_cell = 2;
		}
		rowCount = table.rows.length - 1;
		for (i = 1; i <= rowCount; i++) {
			chkBox = table.rows[i].cells[active_cell].childNodes[0];
			chkBox.checked = chbox.checked;
		}
	}

	function enable_commodity() {
		greetings_flag = document.getElementById("is_greetings").checked;
		if (greetings_flag) {
			document.getElementById("table_schedule").style.display = "none";
			document.getElementById("serv_group_date").readOnly = false;
		} else {
			document.getElementById("table_schedule").style.display = "block";
			document.getElementById("serv_group_date").value = "";
			document.getElementById("serv_group_date").readOnly = true;
		}
	}
	$(function() {
		$('#datetimepicker1').datetimepicker({
			pickTime: false
		});
	});

	function resetDuration() {
		var table_id = document.getElementById("data_grid");
		var row = arguments[0].parentNode.parentNode.id;
		if (arguments[0].checked == false) {
			table_id.rows[row].cells[5].childNodes[0].value = "-1";
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
        <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Sms / Email</a></li>
		<li> <a href="#">Template</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title" data-original-title=""><!--<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_serv_group/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						<?php 
						$status				=$type;
						$serv_goup_id		=$_POST['fv']['serv_group_id'];
						$serv_group_name	=$_POST['fv']['serv_group_name'];
						$serv_group_email	=$_POST['fv']['serv_group_email'];
						$serv_group_sms		=$_POST['fv']['serv_group_sms'];
						$serv_group_active	=$_POST['fv']['serv_group_active'];
						$serv_group_header	=$_POST['fv']['serv_group_header'];
						$serv_group_footer	=$_POST['fv']['serv_group_footer'];
						$is_greetings		=$_POST['fv']['is_greetings'];
						$serv_group_com		=$_POST['fv']['serv_group_com'];
						
						
						
						$attributes 		=	array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm', 'novalidate' => 'novalidate');
						//Opening form
						echo form_open('C_serv_group/DB_Controller/serv_group_model/'.$status.'/'.$serv_goup_id,$attributes); ?>
						 <input type="hidden" id="serv_group_id" name="fv[serv_group_id]" value="<?php echo set_value('serv_group_id',$serv_group_id); ?>" />
						<form class="form-sample">
							<p class="card-description card-description1 quick1"> Templates</p>
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
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-12 col-form-label">Group Name * </label>
										<div class="col-sm-7 col-xs-12">
											<input type="text" name="fv[serv_group_name]" id="serv_group_name" value="<?php echo set_value('serv_group_name',$serv_group_name); ?>" class="form-control" required onkeydown="validateKeyPress(event, this,4)" maxlengt="50"/>
											<span class="help-block">  It is name of the group</span>
										</div>
									</div>
								</div>
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
									  <label class="col-sm-4 col-xs-12 col-form-label">Header</label>
										<div class="col-sm-7 col-xs-12">
											<textarea class="form-control"  id="serv_group_header" name="fv[serv_group_header]" ><?php echo set_value('serv_group_header',$serv_group_header); ?></textarea>
											<span class="help-block">Will be availbale in top of the received SMS</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-12 col-form-label">Subject (Email)</label>
										<div class="col-sm-7 col-xs-12">
											<textarea class="form-control"  name="fv[serv_group_desc]" id="serv_group_desc" onkeydown="validateKeyPress(event, this,4)" maxlength="50"><?php echo set_value('serv_group_desc',$serv_group_desc); ?></textarea>
											<span class="help-block">  This is the subject of the E mail</span>
										</div>
									</div>
								</div>
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-12 col-form-label">Footer</label>
										<div class="col-sm-7 col-xs-12">
											<textarea class="form-control"  id="serv_group_footer" name="fv[serv_group_footer]" onkeydown="validateKeyPress(event, this,4)" maxlength="50"><?php echo set_value('serv_group_footer',$serv_group_footer); ?></textarea>
											<span class="help-block">Will be availbale in bottom of the received SMS</span>
										</div>
									</div>
								</div>
							</div>
							
							<div class="row form-sample1">
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-6 col-form-label">Email</label>
										<div class="col-sm-7 col-xs-6">
											<label>
												<input type="checkbox" id="serv_group_email" name="fv[serv_group_email]" <?php echo $serv_group_email==1?"checked=checked":""; ?> >
											</label>
											<span class="help-block">Sends as E Mail</span>
										</div>
									</div>
								</div>
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-6 col-form-label">SMS</label>
										<div class="col-sm-7 col-xs-6">
											<label>
												<input type="checkbox" id="serv_group_sms" name="fv[serv_group_sms]" <?php echo $serv_group_sms==1?"checked=checked":""; ?> >
											</label>
											<span class="help-block">Sends as SMS</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-6 col-form-label">Active</label>
										<div class="col-sm-7 col-xs-6">
											<label>
												<input type="checkbox" id="serv_group_active" name="fv[serv_group_active]" <?php echo $serv_group_active==1?"checked=checked":""; ?> >
											</label>
											<span class="help-block">Activates this template</span>
										</div>
									</div>
								</div>
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-6 col-form-label">News Letter</label>
										<div class="col-sm-7 col-xs-6">
											<label>
												<input type="checkbox" id="is_greetings" name="fv[is_greetings]"  <?php echo $is_greetings==1?"checked=checked":""; ?> onclick="enable_commodity();">
											</label>
											<span class="help-block">It sends only content without rates</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6 col-xs-12">
									<div class="form-group row">
										<label class="col-sm-4 col-xs-6 col-form-label">Date</label>
										<div class="col-sm-7 col-xs-6">
											<div class='input-group date' id='datetimepicker1' >
												<input   data-date-format="DD-MM-YYYY" type="text"name="fv[serv_group_date]" id="serv_group_date" value="<?php echo set_value('serv_group_date',$serv_group_date); ?>"  class="form-control" placeholder=""/>
												<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>
											</div>
											<span class="help-block">On this date it will be sent</span>		
										</div>
									</div>
								</div>
								<div class="col-md-6 col-xs-12" style="display:none;">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 col-xs-12 page_footer">
									<?php if($status == "edit" && $userrights["edit"] == 1) { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if($status == "add_new" && $userrights["add"] == 1) { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-4">
									
								</div>
							</div>
						</form>
						<div class="table-responsive">
							<table id="com_table" style="display:none" cellpadding="0" cellspacing="0" class="table table-hover1 datatable">
								 <tr>
									<th width="5%" class="first">Commodity Type</th>
									<th width="20%"><input type="checkbox" id="all_sel_rate" name="all_sel_rate" value="1" onclick="selectAll(this,'sel')"  />Selling Rate</th>
									<th width="15%"><input type="checkbox" id="all_buy_rate" name="all_buy_rate" value="1" onclick="selectAll(this,'buy')"  />Buying Rate</th>
								 </tr>
								<?php 
									$tabindex=12;
									foreach($serv_group_com as $com){
										$sel_rate=$com['serv_sel_rate']==1?"checked=checked":"";
										$buy_rate=$com['serv_buy_rate']==1?"checked=checked":"";
										$table="<tr>";
										$table.="<input type=hidden name='fv[serv_group_com][".$com['serv_com_id']."][serv_com_id]' value='".$com['serv_com_id']."'/>";
										$table.="<td>".$com['com_name']."</td>";
										$table.="<td align=center ><input type=checkbox id=serv_sel_rate name='fv[serv_group_com][".$com['serv_com_id']."][serv_sel_rate]' value=1 ".$sel_rate." tabindex='".$tabindex++."' /></td>";
										$table.="<td align=center ><input type=checkbox id=serv_buy_rate name='fv[serv_group_com][".$com['serv_com_id']."][serv_buy_rate]' value=1 ".$buy_rate." tabindex='".$tabindex++."' /></td>";				
										$table.="</tr>";
										echo $table; 
									}
								?>
							</table>
						</div>
						<div id="table_schedule">
							<script>
								enable_commodity();
							</script>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>