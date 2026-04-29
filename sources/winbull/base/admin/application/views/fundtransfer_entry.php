<?php $this->view('include/header.php'); 
?>
<script type="text/javascript">
var date = new Date();
        	$(function() {
			$('#datetimepicker1').datetimepicker({
					maxDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59,59)
				});
		    });
			
function load_balance_amount()
{
	//alert('I have been calling load_balance_amount');
		var cust_code	=	document.getElementById('ft_intcode').value;
		var acc_type	=	document.getElementById('ft_from').value;
		$.ajax({						
		type: "POST",	
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/getFundRemaining",			
		data: "model_name=Fundtransfer_model&method_name=getFundRemaining&cust_code="+cust_code+"&acc_type="+acc_type,	   
			success: function(data){			
				document.getElementById('ft_balance_amt').innerHTML 	= 	data;	
				document.getElementById('ft_balance').value 			=	data;		
			}
		});
}

	function chkTransferAmount() {
		if(parseFloat(arguments[0].value) > parseFloat(document.getElementById('ft_balance_amt').innerHTML)) {
			showToast("Transfer has been exceeded than balance", "warning");
			arguments[0].value="";
		}
	}
	function ACtransfer() {	
		if(document.getElementById('ft_to').value==0) {
			document.getElementById('ft_from').value=1;
		} else if(document.getElementById('ft_from').value==1) {
			document.getElementById('ft_from').value=0;
		}		
	}		
	
	function transferAC() {	
		if(document.getElementById('ft_from').value==0) {
			document.getElementById('ft_to').value=1;
		} else if(document.getElementById('ft_from').value==1) {
			document.getElementById('ft_to').value=0;
		}					
	}	
	
</script>
<div>
    <ul class="breadcrumb">
        <li>
             <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a> 
        </li>
        <li>
            <a href="#">Transaction</a>        </li>
		<li>
            <a href="#">Fund Transfer Entry</a>        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">

                <div class="box-icon">
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_fundtransfer/open_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
          </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">      
					<?php
					$status				=	$type;
					$id					=	$_POST['fv']['fd_id']==NULL ? NULL : $_POST['fv']['fd_id'] ;
					$attributes 		=	array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm');
					$model_name			=	"fundtransfer_model";
					//Opening form
					echo form_open('C_fundtransfer/DB_Controller/Fundtransfer_model/'.$status.'/'.$id,$attributes); ?>
				
						<fieldset>
							<legend>Fund Transfer</legend>
							    <div class="row">
									<?php 
										if(isset($db_error_msg) && $db_error_msg != '')
										{
											echo '<div class="alert alert-danger">
													<a href="#" class="close" data-dismiss="alert">&times;</a>
													<strong>Warning!</strong> '.$db_error_msg.'
													</div>';
										}	
									
									?>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Customer Name  * </label>
										<div class="col-sm-3">
										<select required name="fv[ft_intcode]" id="ft_intcode" onchange="load_balance_amount()" tabindex="2" class="form-control"  >
											<?php echo $this->$model_name->load_customer($ft_intcode); ?>
										</select>
											<span class="help-block">Select customer name.</span>
										</div>
										<label class="control-label col-sm-2">Date</label>
										<div class="col-sm-3">
										<div class='input-group date' id='datetimepicker1' >
											<input  data-date-format="DD-MM-YYYY hh:mm A"   class="form-control" placeholder="" type="text" id="ft_date" maxlength="" readonly="true"  size="25" name="fv[ft_date]" tabindex="1" value="<?php echo set_value('ft_date',$ft_date); ?>" />
										<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>
										</div>
											<span class="help-block">Transfer date.</span>
										</div>
										
									   
									</div>
									
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">From A/c* </label>
										<div class="col-sm-3">
											<select name="fv[ft_from]" id="ft_from" tabindex="3" onchange="load_balance_amount();transferAC()" class="form-control">
											<option value="1" <?php echo $ft_from==1?"selected=selected":""; ?> >Margin A/C</option>
											<option value="0" <?php echo $ft_from==0?"selected=selected":""; ?> >AD A/C</option>
											</select>
											<span class="help-block">Select the account.</span>
										</div>
									    <label class="control-label col-sm-2">To A/c* </label>

										<div class="col-sm-3">
											<select name="fv[ft_to]" id="ft_to" tabindex="4" onchange="load_balance_amount();ACtransfer()"  class="form-control">
											<option value="1" <?php echo $ft_to==1?"selected=selected":""; ?> >Margin A/C</option>
											<option value="0" <?php echo $ft_to==0?"selected=selected":""; ?> >AD A/C</option>
											</select>
											<span class="help-block">Select the account.</span></div>
										</div>
									</div>
									<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Balance *</label>
										<div class="col-sm-3">
											<label id="ft_balance_amt"><?php echo $ft_balance; ?></label>
											<span class="help-block">Available balance .</span>
										</div>
									    <label class="control-label col-sm-2">Amount: </label>
										<div class="col-sm-3">
										<input type="number" step="any" min="1" id="ft_amount" name="fv[ft_amount]" value="<?php echo set_value('ft_amount',$ft_amount); ?>" tabindex="6" onkeyup="chkTransferAmount(this)" class="form-control" required ><input type="hidden" id="ft_balance" name="fv[ft_balance]" value="<?php echo set_value('ft_balance',$ft_balance); ?>" />
											<span class="help-block">Enter transfer amount.</span></div>
									  </div>
									</div>
				                    <div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                <button  type="submit"  name="submit" id="submit"  class="btn btn-success" >Save</button>
            
                <button type="reset" class="btn btn-danger">Cancel</button>
				<p align="right">* Required fields </p>
            </div>
        </div>
					  </fieldset>
				</div>	
				<!-- Content End -->
            </div>
        </div>
    </div>
</div><!--/row-->


<?php $this->view('include/footer.php'); ?>