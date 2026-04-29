<?php $this->load->view('include/header.php'); 
$model_name = "serv_model";
$controller_name="c_serv_master";
?>
<script language="javascript">
	function submitForm(e) {
		e.preventDefault();
		
		let form = $("#serv_entry");
		let btn = form.find('button[type="submit"]');
		let formData = new FormData(form[0]);

		btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
		$("#ajax_loader").addClass("show");

		$.ajax({
			url: form.attr("action"),
			type: "POST",
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			data: formData,
			processData: false,
			contentType: false,
			dataType: "json",
			success: function(response) {
				$("#ajax_loader").removeClass("show");
				if (response.status === "success") {
					// toastr.success(response.message);
					// setTimeout(function() {
						window.location.href = response.redirect;
					// }, 1000);
				} else {
					btn.prop("disabled", false).text("Update");
					showToast(response.message, 'danger');
				}
			},
			error: function(xhr, status, error) {
				$("#ajax_loader").removeClass("show");
				btn.prop("disabled", false).text("Update");
				showToast("Server error: " + error, 'danger');
			}
		});
		return false;
	}
</script>
<style>
.footer{padding:0px 10px}
</style>

<!-- AJAX LOADER -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title" data-original-title="">Service Master List </h4>
						
						<div class="table-responsive">  
							<?php
							$attributes 		=	array('class' => 'form-horizontal', 'id' => 'serv_entry');
							echo form_open('C_serv_master/DB_Controller/serv_model/',$attributes); ?>
							<table  class="table table-hover1">
								<thead>
									<tr>
										<th>ID</th>
										<th>Service</th>
										<th>EMail</th>
										<th>SMS </th>
										<th>Whatsapp </th>
									</tr>
								</thead>
								<tbody class="commodity_listing">
									<?php 
										$result_set=$this->serv_model->set_data();
										$index=0;
										foreach($result_set->result() as $row){
											$email_checked=$row->serv_email==1?"checked=checked":"";
											$sms_checked=$row->serv_sms==1?"checked=checked":"";
											$whatsapp_checked=$row->serv_whatsapp==1?"checked=checked":"";
											$table="<tr>";
											$table.="<td><input type='hidden' name='fv[".$row->serv_id."][serv_id]' value='".$row->serv_id."'/>".$row->serv_id."</td>";
											$table.="<td>".$row->serv_name."</td>";
											$table.="<td align=center ><input type=checkbox value=1 id=email name='fv[".$row->serv_id."][serv_email]' ".$email_checked." /></td>";
											$table.="<td align=center ><input type=checkbox value=1 id=sms name='fv[".$row->serv_id."][serv_sms]' ".$sms_checked." /></td>";
											$table.="<td align=center ><input type=checkbox value=1 id=whatsapp name='fv[".$row->serv_id."][serv_whatsapp]' ".$whatsapp_checked." /></td>";
											$table.="</tr>";
											echo $table; 
											$index++;
										}
									?>
								</tbody>
							</table>
						</div>
						
						<div class="row form-sample1" style="margin-top:20px;">
							<div class="col-md-3"></div>
							<div class="col-md-6">
								<?php if($userrights["edit"] == 1) { ?>
								<button type="submit" onclick="submitForm(event)" class="btn btn1 btn-success btn-md btn-md1">Update</button>
								<?php } else if($userrights["add"] == 1) { ?>
								<button type="submit" onclick="submitForm(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
								<?php } ?>
								<button type="button" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage'" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button>
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
