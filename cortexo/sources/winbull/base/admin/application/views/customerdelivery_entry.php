<?php $this->view('include/header.php'); 
?>
<script type="text/javascript">
		function validate() 
		{ 
				var tableName = document.getElementById('deliveryinvoice');
				var total_amt = document.getElementById('TotalAmt').value;
				var available_amt = document.getElementById('availableBalance').innerHTML;
				var total_qty = document.getElementById('cusdel_deliveryqty').value;
				var total_deliveryqty = tableName.rows[tableName.rows.length-1].cells[2].innerHTML;
				
				if(parseFloat(total_amt) > parseFloat(available_amt)) 
				{
					showToast("Required Amount is greater than Available Balance!", "warning");
					return false;
				}
				else if(parseFloat(total_deliveryqty) != parseFloat(total_qty)) 
				{
					showToast("Entered qty should be equal to Delivery qty", "warning");
					document.getElementById('cusdel_deliveryqty').focus();
					document.getElementById('cusdel_deliveryqty').style.borderColor='#FF0000';
					return false;									
				}
				var tableId = document.getElementById('deliveryinvoice');
					for(i=1;i<tableId.rows.length-1;i++)
					{
						if(tableId.rows[i].cells[2].childNodes[0].value == 0)
						{
							showToast("Delivery Qty should not be Zero", "warning");
							tableId.rows[i].cells[2].childNodes[0].focus();
							tableId.rows[i].cells[2].childNodes[0].style.borderColor='#FF0000';
							return false;
						}
					}
				return true;
			}
	
		var date = new Date();

 jQuery(function() {
		  $('#datetimepicker1').datetimepicker({
					maxDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59,59)
				});
 });

function calculate_totalAmount() 
{
	var tableName  = document.getElementById('deliveryinvoice');
	var TotalAmt = document.getElementById('TotalAmt');
	var row = arguments[0].parentNode.parentNode.id;
	var penalty = isNaN(parseFloat(tableName.rows[row].cells[4].childNodes[0].value)) ? 0.00 : parseFloat(tableName.rows[row].cells[4].childNodes[0].value);
	var paymentAmt = isNaN(tableName.rows[row].cells[3].innerHTML) ? 0.00 : parseFloat(tableName.rows[row].cells[3].innerHTML);
	tableName.rows[row].cells[5].childNodes[0].value = isNaN(penalty) ? 0 : parseFloat(penalty) + parseFloat(paymentAmt);
	var total	   =0;
	for(var i=1; i<tableName.rows.length-1; i++) 
	{
		total+= isNaN(parseFloat(tableName.rows[i].cells[5].childNodes[0].value)) ? 0.00 : parseFloat(tableName.rows[i].cells[5].childNodes[0].value);		
	}
	tableName.rows[tableName.rows.length-1].cells[5].innerHTML = isNaN(parseFloat(total)) ? 0.00 : parseFloat(total).toFixed(2);
	TotalAmt.value=isNaN(parseFloat(total)) ? 0.00 : parseFloat(total).toFixed(2);		
}


function calculate_PaymentCost() 
{
	var tableName  = document.getElementById('deliveryinvoice');
	var TotalAmt = document.getElementById('TotalAmt');
	var row = arguments[0].parentNode.parentNode.id;
	var total =0;
	var total_deliveryQty =0;
	
	//Calculation for delivery qty amount
	var qty = isNaN(parseFloat(tableName.rows[row].cells[2].childNodes[0].value)) ? 0.00 : parseFloat(tableName.rows[row].cells[2].childNodes[0].value);
	var total_qty = isNaN(parseFloat(tableName.rows[row].cells[0].childNodes[3].value)) ? 0.00 : parseFloat(tableName.rows[row].cells[0].childNodes[3].value);
	var total_amt = isNaN(parseFloat(tableName.rows[row].cells[0].childNodes[2].value)) ? 0.00 : parseFloat(tableName.rows[row].cells[0].childNodes[2].value);
	var row_deliveryqtyamt = (total_amt/total_qty)*(qty);
	tableName.rows[row].cells[0].childNodes[1].value = isNaN(row_deliveryqtyamt) ? 0.00 : parseFloat(row_deliveryqtyamt).toFixed(2);
	tableName.rows[row].cells[3].innerHTML = isNaN(row_deliveryqtyamt) ? 0.00 : parseFloat(row_deliveryqtyamt).toFixed(2);
	var penalty = isNaN(tableName.rows[row].cells[4].childNodes[0].value) ? 0.00 : parseFloat(tableName.rows[row].cells[4].childNodes[0].value);
	tableName.rows[row].cells[5].childNodes[0].value = parseFloat(penalty) + parseFloat(row_deliveryqtyamt);
	
	for(var i=1; i<tableName.rows.length-1; i++) 
	{
		total+= isNaN(parseFloat(tableName.rows[i].cells[5].childNodes[0].value)) ? 0.00 : parseFloat(tableName.rows[i].cells[5].childNodes[0].value);
		total_deliveryQty+= isNaN(parseFloat(tableName.rows[i].cells[2].childNodes[0].value)) ? 0.00 : parseFloat(tableName.rows[i].cells[2].childNodes[0].value);
	}
	tableName.rows[tableName.rows.length-1].cells[5].innerHTML = isNaN(parseFloat(total)) ? 0.00 : parseFloat(total).toFixed(2);
	tableName.rows[tableName.rows.length-1].cells[2].innerHTML = isNaN(parseFloat(total_deliveryQty)) ? 0.00 : parseFloat(total_deliveryQty).toFixed(6);
	TotalAmt.value=isNaN(parseFloat(total)) ? 0.00 : parseFloat(total).toFixed(2);
			
}

function validateDecimal()
{
	if(isNaN(arguments[0].value))
	{
		arguments[0].value = '0';
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
            <a href="#">Customer Delivery Entry</a>        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">

                <div class="box-icon">
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerdelivery/open_listingform" class="btn btn-close btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
          </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">      
					<?php
					 
					$status				=	$type;
					$model_name			=	"customerdelivery_model";
					$id					=	$_POST['fv']['cusdel_code']==NULL ? NULL : $_POST['fv']['cusdel_code'] ;
					$attributes 		=	array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm', 'autocomplete' => 'off');
					
					$cur_userid = $this->login_model->get_userid();
					if($cur_userid == 3) $disable_coin = '';
					else $disable_coin = 'style="display:none" ';
					//Opening form
					echo form_open('C_customerDelivery/DB_Controller/customerdelivery_model/'.$status.'/'.$id,$attributes); ?>
				
						<fieldset>
							<legend>Customer Delivery</legend>
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
										<label class="control-label col-sm-2">Booking No   </label>
										<div class="col-sm-3">
										<strong><?php echo $cusdel_bookno; ?><input type="hidden" name="fv[cusdel_bookno]" value="<?php echo $cusdel_bookno; ?>" class="form-control" placeholder="" /></strong>
											<span class="help-block">Book No.</span>
										</div>
										<label class="control-label col-sm-2">Delivery Date</label>
										<div class="col-sm-3">
										<div class='input-group date' id='datetimepicker1' >
											<input data-date-format="DD-MM-YYYY hh:mm A" class="form-control" placeholder="" type="text" id="cusdel_date" maxlength="" readonly="true"  size="25" name="fv[cusdel_date]" tabindex="1" value="<?php echo set_value('cusdel_date',$cusdel_date); ?>" />
										<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>
										</div>
											<span class="help-block">Delivery Date.</span>
										</div>
										
									   
									</div>
									
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Customer Name </label>
										<div class="col-sm-3">
											<strong><?php echo $cusdeal_intname; ?> <input type="hidden" name="fv[cusdel_cusname]" value="<?php echo $cusdel_cusname; ?>" /> <input type="hidden" name="fv[cusdeal_comname]" value="<?php echo $cusdeal_comname; ?>" /> </strong> 
											<span class="help-block">Party name.</span>
										</div>
									    <label class="control-label col-sm-2">Booked Qty</label>

										<div class="col-sm-3">
											<label ><?php echo $cusdeal_qty; ?></label>
											<span class="help-block">Booked Qty</span>									  </div>
										</div>
									</div>
									<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Available Balance </label>
										<div class="col-sm-3">
											<label id="availableBalance"><?php echo $AvailableBalance; ?></label>
											<span class="help-block">Available balance .</span>
										</div>
									    <label class="control-label col-sm-2">Delivery Qty * </label>
									  <div class="col-sm-3">
										 <input  class="form-control" type="text" name="fv[cusdel_deliveryqty]" id="cusdel_deliveryqty" value="<?php echo set_value('cusdel_deliveryqty',$cusdel_deliveryqty); ?>" />
											<span class="help-block">Enter Delivery Qty.</span>									  </div>
										</div>
									</div>
									
								<div class="row">
								  <div class="form-group">
										<label class="control-label col-sm-2">Delivery Type</label>
										<div class="col-sm-3">
												<label>
													<strong><?php echo $book_type==0 ? "Sell" : "Buy"; ?></strong><input type="hidden" name="book_type" value="<?php echo $book_type; ?>"  /></strong> 
												</label>
												
											<span class="help-block">Delivery Type.</span>
										</div>
										<!--grid content -->
												
									</div>
								</div>
				<div class="table" id="div_delivery_bookings">
            <table class="table table-striped table-bordered bootstrap-datatable datatable responsive"  id="delivery_bookings" cellpadding="0" cellspacing="0" width="100%">
              <tr id="0">
                  <th width="5%" class="first">S.No</th>
			      <th width="15%" >Sales Reference No </th>
			      <th width="20%">Book Date</th>
			      <th width="10%">Quantity</th>
			      <th width="20%">Amount</th>
				  <th width="10%">Balance Qty</th>
				  <th width="20">Balance Amount</th>
              </tr>
              <?php if($type =="add_new") { 
	  				echo $this->load->$model_name->get_delivery_reference_listing($_POST); 
	   			}else {
	   				echo $this->load->$model_name->get_delivery_reference_listing_onEdit($id); 
	   			} ?>
            </table>
          </div>
		   <div class="table">
              <table class="table table-striped table-bordered bootstrap-datatable datatable responsive"  id="deliveryinvoice" cellpadding="0" cellspacing="0" width="100%">
                <tr>
				  <th width="5%" class="first">SNO</th>
                  <th width="20%">Book No</th>
                  <th width="15%">Delivery Qty</th>
                  <th width="20%">Amount</th>
                  <th width="20%">Penalty</th>
                  <th width="20%">Total Amount</th>
				  </tr>
               		<?php if($type =="add_new") { 
	  				echo $this->load->$model_name->get_delivery_invoicereference_listing($_POST); 
	   			}else {
	   				echo $this->load->$model_name->get_delivery_invoicereference_listing_onEdit($id); 
	   			} ?>
              </table>
          </div>
                <div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                <button  <?php if($type !='delete'){ ?> onclick="javascript:return validate()"  <?php } ?> type="submit"  name="submit" id="submit"  class="btn btn-success" <?php if($status=="view") { ?> style="display:none" <?php } ?> ><?php if($type=='delete'){ ?> Delete <?php } else {?> Save <?php } ?> </button>
            
                <button type="reset" class="btn btn-danger">Cancel</button>
				<p align="right">* Required fields </p>
            </div>
        </div>
					  </fieldset>
					  <input type="hidden" name="cusdel_validation" id="cusdel_validation" value=""  />	
					</form>

				</div>	
				<!-- Content End -->
            </div>
        </div>
    </div>
</div><!--/row-->


<?php $this->view('include/footer.php'); ?>