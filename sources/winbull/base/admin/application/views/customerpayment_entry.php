<?php $this->view('include/header.php'); 
?>
<script type="text/javascript">
var date = new Date();
 jQuery(function() {
          $('#datetimepicker1').datetimepicker({
			maxDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59,59)
		});
 });


	</script>
	<script type="text/javascript">
function load_balance()
		{
			var customer	=	document.getElementById('cuspay_cuscode').value;
			var date 		= 	document.getElementById('cuspay_date').value;
			var cus_type 	=	$('#cuspay_paytype').val();
			if(customer	!=	-1)	{
				$.ajax({						
					type: "POST",	
					dataType: "json",				   
					url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/get_balance",
					data: "model_name=customerpayment_model&method_name=load_balance&customer="+customer+"&date="+date+"&type="+cus_type,
					success: function(data)
					{
						document.getElementById('avail_bal').innerHTML=data;	
					}
				});
			}	 			
		}
function display_cash() {

		var cash_payment=document.getElementById('denomination');
		var cash_display="none";
		if(arguments[0].checked==true) 
			cash_display="block";	
		else
			clear_denomination();				
		cash_payment.style.display=cash_display;
    	calculate_cash_total();	
}

function display_others() {

		var others_payment=document.getElementById('div_other_payments');
		var others_display="none";
		if(arguments[0].checked==true) 
			others_display="block";
		else
			clear_check();
		others_payment.style.display=others_display;		
		get_other_payment_total();
	
}
function clear_check()
{
	var tableName	=	document.getElementById('otherpayment');
	for(var i=1; i<tableName.rows.length; i++) 
		tableName.rows[i].cells[4].childNodes[0].value=0;
	get_other_payment_total();
}
function calculate_cash_total() 
{
	var tableName  = document.getElementById('denomination');
	var cash_total = document.getElementById('cash_total');
	var cash_amount= 0;
	var total	   = 0;
	for(var i=1; i<tableName.rows.length-2; i++) 
	{
		total	   = isNaN(parseFloat(tableName.rows[i].cells[4].innerHTML)) ? 0 : tableName.rows[i].cells[4].innerHTML;		
		cash_amount= parseFloat(cash_amount)+parseFloat(total);
	}
	cash_total.innerHTML=isNaN(parseFloat(cash_amount)) ? "0.00" : parseFloat(cash_amount).toFixed(2);	
	calculate_total_amount()	
}

function calculate_denomination() 
{
	var tableName 	 = document.getElementById('denomination');
	var row_id	  	 = arguments[0].parentNode.parentNode.id;
	var denomination = isNaN(tableName.rows[row_id].cells[1].innerHTML) ? 0 : tableName.rows[row_id].cells[1].innerHTML;
	var bundles	  	 = isNaN(tableName.rows[row_id].cells[2].childNodes[0].value) ? 0 : tableName.rows[row_id].cells[2].childNodes[0].value;
	var loos	  	 = isNaN(tableName.rows[row_id].cells[3].childNodes[0].value) ? 0 : tableName.rows[row_id].cells[3].childNodes[0].value;	
	var total	  	 = 0;
	
	var bundle_total = parseFloat(bundles)*100*parseFloat(denomination);
	var loos_total   = parseFloat(loos)*parseFloat(denomination);
	
	bundle_total	 = isNaN(parseFloat(bundle_total)) ? 0 : parseFloat(bundle_total); 
	loos_total		 = isNaN(parseFloat(loos_total)) ? 0 : parseFloat(loos_total); 

	total=parseFloat(bundle_total)+parseFloat(loos_total);
	
	tableName.rows[row_id].cells[4].innerHTML=isNaN(parseFloat(total)) ? "0.00" : parseFloat(total).toFixed(2);
	
	calculate_cash_total();
}

function clear_denomination() 
{
	var tableName	=	document.getElementById('denomination');
	for(var i=1; i<tableName.rows.length-2; i++) {
		tableName.rows[i].cells[2].childNodes[0].value="";
		tableName.rows[i].cells[3].childNodes[0].value="";
		tableName.rows[i].cells[4].innerHTML="";
	}
	calculate_cash_total();	
}

function validate_otherpayment() {
	var tableName=document.getElementById('otherpayment');
	var flag=true;
	for(var i=1; i<tableName.rows.length; i++) 
	{
		if(tableName.rows[i].cells[1].childNodes[0].value.length==0 || tableName.rows[i].cells[2].childNodes[0].value.length==0 || tableName.rows[i].cells[3].childNodes[0].value==-1 || tableName.rows[i].cells[4].childNodes[0].value == '' || tableName.rows[i].cells[4].childNodes[0].value == 0) 
		{
			showToast('Required Some Fields', "warning");
			flag=false;
		}
	}
	return flag;
}

function delete_other_payment_row() {	
	var tableName=document.getElementById('otherpayment');
	for(var i=1;i<tableName.rows.length;i++) {
		if(tableName.rows[i].id==arguments[0]) {		 	
			var answer = confirm("Are you sure want to remove this row?")
			if (answer){			
				tableName.deleteRow(i);
			}								
			break;					
		}
	}
	tableName.rows[tableName.rows.length-1].cells[5].innerHTML="<a href='javascript:;add_other_payment();'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/add-icon.gif' alt='ADD' /></a>";
	get_other_payment_total();
}

function get_other_payment_total() 
{
	var tableName	  		= document.getElementById('otherpayment');
	var otherpayment_total  = document.getElementById('otherpayment_total');
	var pmt_total=0;
	for(var i=1;i<tableName.rows.length;i++) 
	{
		if(tableName.rows[i].cells[4].childNodes[0].value.length>0) 
		{
			pmt_total=parseFloat(pmt_total)+parseFloat(tableName.rows[i].cells[4].childNodes[0].value);
		}
	}
	otherpayment_total.value=isNaN(parseFloat(pmt_total)) ? "0.00" : parseFloat(pmt_total).toFixed(2);
	calculate_total_amount();
}

function calculate_total_amount() {	
	var otherpayment_total  = document.getElementById('otherpayment_total').value;
	var cash_total 			= document.getElementById('cash_total');
	var total_amount		= 0;
	total_amount			= (parseFloat(isNaN(parseFloat(otherpayment_total)) ? "0.00" : parseFloat(otherpayment_total).toFixed(2))+parseFloat(isNaN(parseFloat(cash_total.innerHTML)) ? "0.00" : parseFloat(cash_total.innerHTML).toFixed(2)));
	document.getElementById('total_amount').value	= isNaN(parseFloat(total_amount)) ? "0.00" : parseFloat(total_amount).toFixed(2);

}

function validateDecimal()
{
	if(isNaN(arguments[0].value))
	{
		arguments[0].value = '';
	}
}

function save_form()
{
document.getElementById('total_cash').value = document.getElementById('cash_total').innerHTML;

var form=arguments[0];

if(document.getElementById('cuspay_cuscode').value == '-1')
{
	showToast('Please Select the Customer', "warning");
	return false;
	
}


if(document.getElementById('cuspay_amount').value == '' || document.getElementById('cuspay_amount').value == 0)
{
	showToast('Please enter Payment Amount', "warning");
	return false;
	
}

	var cash_checkbox = document.getElementById("cuspay_cash");
	var other_chkbox  = document.getElementById("cuspay_others");
	
if(cash_checkbox.checked == false && other_chkbox.checked == false )
	{
		showToast("Check Any one mode of Payment: Cash / Others ", "warning");
		return false;	
	}
	else if(cash_checkbox.checked == true) 
	{ 
		if(document.getElementById('cash_total').innerHTML == 0)
		{
			showToast('Please enter Denomination Details', "warning");
			return false;
		} 
	}
if(parseFloat(document.getElementById('total_amount').value) != parseFloat(document.getElementById('cuspay_amount').value))
{
	showToast('Payment Amount and Amount entered should be equal', "warning");
	return false;
}

var tablename = document.getElementById('otherpayment');
var row_id	 = tablename.rows.length;
var i;

  if(row_id>1 && document.iframeForm.cuspay_others.checked)
  {
     for(var i=1; i < tablename.rows.length; i++)
	 {
	 	if(tablename.rows[i].cells[1].childNodes[0].value == '')
		{				
				showToast("Enter Cheque No", "warning");
				tablename.rows[i].cells[1].childNodes[0].focus();
				tablename.rows[i].cells[1].childNodes[0].style.borderColor='#FF0000';
				return false;
				
	 	}
	 
	 	if(tablename.rows[i].cells[3].childNodes[0].value == -1)
		{
			
			showToast("Enter Bank Name", "warning");
			tablename.rows[i].cells[3].childNodes[0].focus();
			tablename.rows[i].cells[3].childNodes[0].style.borderColor='#FF0000';
			return false;
				
		}
		
		if(tablename.rows[i].cells[4].childNodes[0].value == '' || tablename.rows[i].cells[4].childNodes[0].value ==0)
		{
			showToast("Enter Amount", "warning");
			tablename.rows[i].cells[4].childNodes[0].focus();
			tablename.rows[i].cells[4].childNodes[0].style.borderColor='#FF0000';
			return false;
			
		}
	  	
	  }	
	
	if(row_id>2 && flag==0)
 				{	  
 				 for(var p=1;p<tablename.rows.length && flag==0;p++)
					{ 
						for(var q=1;q<tablename.rows.length;q++)
						{
	 						if(tablename.rows[p].cells[1].childNodes[0].value == tablename.rows[q].cells[1].childNodes[0].value && p != q)
							{	
									showToast("cheque numbers should not be same", "warning");
									tablename.rows[q].cells[1].childNodes[0].focus();
									tablename.rows[q].cells[1].childNodes[0].style.borderColor='#FF0000';
									return false;
								
							}
							
								
						}
					}	 
 				}  	  
}

  	var theForm=document.getElementById("iframeForm");		
	theForm.submit();
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
            <a href="#">Customer Payment Entry</a>        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">

                <div class="box-icon">
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_customerpayment/open_listingform" class="btn btn-close btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
          </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">      
					<?php 
					$status				=	$type;
					$model_name			=	"customerpayment_model";
					$id					=	$_POST['fv']['cuspay_code']==NULL ? NULL : $_POST['fv']['cuspay_code'] ;
					$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');
					echo form_open('C_customerpayment/DB_Controller/customerpayment_model/'.$status.'/'.$id,$attributes); 
					?>
						<fieldset>
							<legend>Customer Payment</legend>
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
										<label class="control-label col-sm-2">Payment Date * </label>
										<div class="col-sm-3">
										<div class='input-group date' id='datetimepicker1' >
											<input  data-date-format="DD-MM-YYYY hh:mm A"  type="text"  id="cuspay_date" name="fv[cuspay_date]" maxlength="" readonly="true"  class="form-control" placeholder="" value="<?php echo set_value('cuspay_date',$cuspay_date); ?>"  tabindex="1" />
										<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>
										</div>
											<span class="help-block">Select the payment date.</span>
										</div>
										<label class="control-label col-sm-2">Payment Type</label>
										<div class="col-sm-3">
											<select id="cuspay_paytype" onChange="load_balance();" name="fv[cuspay_paytype]" class="form-control" ><option value="0">Receive</option><option value="1">Payment</option></select>
											<span class="help-block">Select the payment type.</span>
										</div>
										
									   
									</div>
									
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Party Name *</label>
										<div class="col-sm-3">
											<select name="fv[cuspay_cuscode]" id="cuspay_cuscode" onchange="load_balance()" class="form-control" >
											 <?php echo $this->load->$model_name->load_customer($cuspay_cuscode); ?>
											</select>
											<span class="help-block">Select the party name.</span>
										</div>
									    <label class="control-label col-sm-2">Available Balance</label>
										<div class="col-sm-3">
											<label  id="avail_bal"></label>
											<span class="help-block">Available balance.</span>									  </div>
										</div>
									</div>
								
								
									<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Payment Amount *</label>
										<div class="col-sm-3">
											<input  id="cuspay_amount" name="fv[cuspay_amount]" value="<?php echo set_value('cuspay_amount',$cuspay_amount); ?>"  onkeyup="validateDecimal(this)" type="text" class="form-control" placeholder=""/>
											<span class="help-block">Enter payment amount .</span>
										</div>
									    <label class="control-label col-sm-2">Payment Type</label>
										<div class="col-sm-3">
										<div data-toggle="buttons">
													<label class="btn btn-primary  <?php if($cuspay_others==1){ ?> active<?php } ?>">
													<input  type="checkbox" name="fv[cuspay_others]" id="cuspay_others" <?php if($cuspay_others==1){ ?> checked="checked" <?php } ?> onchange="display_others(this);" >Others </label>
												<label class="btn btn-primary  <?php if($cuspay_cash==1){ ?> active<?php } ?>">
													<input  type="checkbox" name="fv[cuspay_cash]" id="cuspay_cash" <?php if($cuspay_cash==1){ ?> checked="checked" <?php } ?> onchange="display_cash(this);" >Cash </label>
											</div>
											
											<span class="help-block">Select the payment type.</span>									  </div>
										</div>
									</div>
				<div class="table" id="div_other_payments">					
              <table  id="otherpayment" class="table table-striped table-bordered bootstrap-datatable">
							<thead>
								<tr>
									<th>Type</th>
									<th>Number</th>
									<th>Date</th>
									<th>Bank</th>
									<th>Amount</th>
									<th width="10%" align="center"><?php if($type=="add_new") { ?>
									<a href="javascript:;add_other_payment();"><img src="<?php echo $this->config->item('base_url'); ?>assets/images/add-icon.gif" alt="ADD" /></a>
								    <?php } ?></th>
									<th width="7%" class="last"></th>
								</tr>
								</thead>
								<tbody>
								 <?php if($type!="add_new") { 
	  			echo $this->load->$model_name->fetch_other_payments_onEdit($id); 
	  		 } ?>
			 				
								</tbody>								
						</table>
						 <input name="hidden" type="hidden" id="otherpayment_total" value=""/>
						</div>
				
          <div class="table">
              <table  class="table table-striped table-bordered bootstrap-datatable datatable responsive"  id="denomination" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <th  data-field="id" data-halign="right" data-align="center" width="4%" class="first">S.No</th>
                  <th width="33%">Denomination</th>
                  <th width="19%">Bundles</th>
                  <th width="19%">Loose Pcs</th>
                  <th style="text-align:right; font-weight:bold" >Total</th>
				  </tr>
                <?php $records = $this->load->$model_name->get_denomination($id); 	
			  for($i=0; $i<count($records); $i++)
			  {	
					echo "<tr id='".($i+1)."'> 
					<td>".($i+1)."<input type='hidden' name='den[denomination][]' value='".$records[$i][0]."' /></td>
					<td>".$records[$i][1]."</td>
					<td><input type='text' style='text-align:right' name='den[bundles][]' value='".$records[$i][2]."' class='numeric' onkeyup='calculate_denomination(this);validateDecimal(this);' /></td>
					<td><input type='text' style='text-align:right' name='den[loos][]' value='".$records[$i][3]."' class='numeric' onkeyup='calculate_denomination(this);validateDecimal(this);' /></td>
					<td class='last' id='cl'  style='text-align:right; font-weight:bold' >".$records[$i][4]."</td>
					</tr>";				
			  } 
					echo "<tr id='".($i+1)."'> 
					<td></td>
					<td></td>
					<td></td>
					<td><strong>Total</strong></td>
					<td class='last' style='text-align:right; font-weight:bold' id='cash_total'></td>
					
					</tr>";				
		?>
		 <tr >
	    <td colspan="3">&nbsp;</td>
	    <td ><strong>Net Amount </strong></td>
	    <td style="padding-left:110px";colspan="2"><input style="width:100px; text-align:right; border:none; background:inherit; font-weight:bold"  type="text" readonly="true" name="total_amount" id="total_amount" value=""  />	</td>
	    </tr>
              </table>
          </div>
			<div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                <button  type="submit"  name="submit" id="submit"  class="btn btn-success"  onclick="javascript:;return save_form();" <?php if($status=="view") { ?>style="display:none;" <?php } ?>>Save</button>
            
                <button type="reset" class="btn btn-danger">Cancel</button>
				<p align="right">* Required fields </p>
            </div>
        </div>
					  </fieldset>
					  <input type="hidden" name="total_cash" id="total_cash" value=""  />	
					</form>

				</div>	
				<!-- Content End -->
            </div>
        </div>
    </div>
</div><!--/row-->


<?php $this->view('include/footer.php'); ?>

<script type="text/javascript">	
	<?php if($type=="add_new")
			{
	?>
			display_cash(document.getElementById('cuspay_cash'));
			display_others(document.getElementById('cuspay_others'));
	<?php
			} 
			else 
			{
	?>			
				calculate_total_amount();
				load_balance();
				if(document.getElementById('cuspay_cash').checked == false) {
					document.getElementById('denomination').style.display = "none";
				}
				if(document.getElementById('cuspay_others').checked == false) {
					document.getElementById('div_other_payments').style.display = "none";
				}
				var tableName = document.getElementById('otherpayment');
				var no_rows = tableName.rows.length-1;
				if(no_rows > 0)
				{
				tableName.rows[no_rows].cells[5].innerHTML = "<a href='javascript:;add_other_payment();'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/add-icon.gif' alt='ADD' /></a>";
				}
				get_other_payment_total();		
				calculate_cash_total();	
	<?php			
			}
	?>	
	
function add_other_payment() {
	var tableName= document.getElementById('otherpayment');
	var flag	 = validate_otherpayment();
	var newRow	 = "";
	var row_id	 = tableName.rows.length;
	
	if(flag==true) {
		var pay_date_id = "other_pmt_date"+row_id;	
		tableName.rows[tableName.rows.length-1].cells[5].innerHTML="";
		newRow = $("<tr id='"+row_id+"'><td class='first'  style='text-align:center'><select name='cuspay_others[pmt_type][]' id='pmt_type' ><option value='1'>Cheque</option><option value='2'>RTGS</option></select></td><td  style='text-align:center'><input type='text' value='' size='10' name='cuspay_others[pmt_no][]' id='pmt_no' /></td><td  style='text-align:center'><input type='text' size='10' value='"+"<?php echo date('d-m-Y'); ?>"+"' name='cuspay_others[pmt_date][]' id="+pay_date_id+" /></td><td  style='text-align:center'>"+"<?php echo $this->load->$model_name->get_bank("others"); ?>"+"</td><td  style='text-align:center'><input style='width:160px;text-align: right' type='text' value='' size='10' name='cuspay_others[pmt_amount][]' id = 'pmt_amount' onkeyup='get_other_payment_total();validateDecimal(this)' /></td><td  style='text-align:center'><a href='javascript:;add_other_payment();'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/add-icon.gif' alt='ADD' /></a></td><td  style='text-align:center'><a href='javascript:;delete_other_payment_row("+row_id+");'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/hr.gif' alt='Delete' class='delete' /></a></td></tr>");
		$("#otherpayment").append(newRow);
		$("#"+pay_date_id).datepicker({dateFormat: 'dd-mm-yy'});				   													
	}
}

</script>