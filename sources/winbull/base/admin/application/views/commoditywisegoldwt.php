<?php $this->load->view('include/header.php');  ?>

<!--<div>
    <ul class="breadcrumb">
        <li><a href="#">Masters</a></li>
        <li><a href="#">Commodity Weight </a></li>
    </ul>
</div>-->
<script>

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin ">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_commodity_wisegold_weight/com_wise_wtlist" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						 <?php
							$status				=	$type;
							$com_group_id=$_POST['fv']['com_group_id'];
							$attributes 		=	array('class' => 'form-horizontal');
							//Opening form
							echo form_open('C_commodity_wisegold_weight/DB_Controller/comwise_goldwt_model/'.$status.'/'.$userrights['add']); 
						?>
						<form class="form-sample">
							<p class="card-description card-description1"> Commodity Weight</p>
							<table  id="com_table" class="table table-striped table-bordered ">
									<thead>
										<tr>
											<th width="15%" class="text-center align-middle">Commodity</th>
											<th width="8%" class="text-center align-middle">Weight (gms)</th> 
										</tr>
									</thead>
									<tbody>
										<?php
										foreach($com_Wt as $com){
												$table="<tr>";
												$table.="<input type='hidden' name='fv[com_group_wt][".$com['com_id']."][com_id]' value='".$com['com_id']."'/>";
												$table.="<td>".$com['com_name']."</td>";				
												$table.="<td style=text-align:center; ><input type= number step=any class=form-control id=com_buy_premium".$com['com_id']." name='fv[com_group_wt][".$com['com_id']."][com_totalweight]'  value='".set_value('com_totalweight',$com['com_totalweight'])."'   /></td>";
												$table.="</tr>";
												echo $table; 				
											}
										?>
									</tbody>
								 </table>
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
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
