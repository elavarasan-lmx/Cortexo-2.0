<style type="text/css">
	input[type=radio], input[type=checkbox] {
    margin: 4px 0 0;
    margin-top: 1px \9;
    line-height: normal;
}
input[type=checkbox], input[type=radio] {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0;
}
.cus_tcs{
	height: 15px;
	width : 0;
}
</style>

<script type="text/javascript">
function validate_image()
	{
		if(arguments[0].files[0].size > 1048576)
		{
		  alert('File size cannot be greater than 1 MB');
		  arguments[0].value = "";
		}
		else
		{
			var fileName =arguments[0].value;
			var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
			ext = ext.toLowerCase();
			if(ext != "jpg" && ext != "png" && ext != "jpeg")
			{
				alert("Upload JPG or PNG Images only");
				arguments[0].value = "";
			}
		}
}
function validateEmail(email) {
 var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test( email );
}
function check_Mobileno(objMobileNo)
{
	if(objMobileNo.value!="")
	{
		var incomingString=objMobileNo.value;
		if(incomingString.length > 12 || incomingString.search(/[^0-9\-()+]/g) != -1 || incomingString.length < 10)
			{
			alert("Enter valid mobile number");
			arguments[0].value="";
			arguments[0].focus();
			}
		else
			{
				checkClientMobileNo(objMobileNo);
			}
	}
}
function checkClientMobileNo(Mobno)
{
	var $ = jQuery.noConflict();
	$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_userregistration/chech_phoneno",
		data: "mob_id="+Mobno.value,
		success: function(data) { 
			//client_sendsms(data);
			if(data!=0)
			{
			alert("This Mobile Number Already Exists");
			Mobno.value="";
			Mobno.focus();
			}
		},
		error: function(request,error) {
			console.log(error);
		}
	});
}	
function  checkEmailclient(elementValue)
{
	var $ = jQuery.noConflict();
$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_userregistration/chech_email",
		data: "group_id="+elementValue.value,
		success: function(data) {
			//client_sendsms(data);
			if(data!=0)
			{
			alert("This Email ID already Exists");
			document.getElementById('cus_email').value="";
			document.getElementById('cus_email').focus();
			}
		},
		error: function(request,error) {
			console.log(error);
		}
	});
}

function refreshCaptcha()
{
	var img = document.images['captchaimg'];
	img.src = img.src.substring(0,img.src.lastIndexOf("?"))+"?rand="+Math.random()*1000;
}
function validate_form(e) 
{
	e.preventDefault();
	document.getElementById("btnsubmit").disabled=true;
	var flag = 0;
	var $ = jQuery.noConflict();
	$("#error_cus_company_name").html("");
	$("#error_cus_address").html("");
	$("#error_cus_name").html("");
	$("#error_cus_mobile").html("");
	$("#error_cus_phone1").html("");
	$("#error_cus_email").html("");
	$("#error_cus_bnkname").html("");
	$("#error_cus_bnkbranch").html("");
	$("#error_cus_accno").html("");
	$("#error_cus_ifsc").html("");
	$("#error_cus_tin_no").html("");
	$("#error_cus_panno").html("");
	$("#error_cus_addrcopy").html("");
	$("#error_cus_pancopy").html("");
	$("#error_cus_tincopy").html("");
	// $("#error_cus_dealcopy").html("");
	$("#error_btnsubmit").html("");
	// $("#error_cus_tcstds").html("");
	
	if($.trim($("#cus_company_name").val()) == ''){
		$("#error_cus_company_name").html("Required Field...!");
		flag = 1;
	}
	if($.trim($("#cus_address").val()) == '') {
		$("#error_cus_address").html("Required Field...!");
		flag = 1;
	}
	if($.trim($("#cus_name").val()) == '') {
		$("#error_cus_name").html("Required Field...!");
		flag = 1;
	}
	if($.trim($("#cus_mobile").val()) == '') {
		$("#error_cus_mobile").html("Required Field...!");
		flag = 1;
	} else if ($("#cus_mobile").val().length > 12 || $("#cus_mobile").val().search(/[^0-9\-()+]/g) != -1 || $("#cus_mobile").val().length < 10) {
		$("#error_cus_mobile").html("Enter valid mobile number...!");
		flag = 1;
	}
	if($.trim($("#cus_phone1").val()) == '') {
		$("#error_cus_phone1").html("Required Field...!");
		flag = 1;
	} else if ($("#cus_phone1").val().length < 6 || $("#cus_phone1").val().search(/[^0-9\-()+]/g) != -1 || $("#cus_phone1").val().length > 20) {
		$("#error_cus_phone1").html("Enter valid number...!");
		flag = 1;
	}
	if($.trim($("#cus_email").val()) == '') {
		$("#error_cus_email").html("Required Field...!");
		flag = 1;
	} else if(!validateEmail($("#cus_email").val())) {
		$("#error_cus_email").html("Enter valid email!");
		flag = 1;
	}
	
	if($.trim($("#cus_bnkname").val()) == ''){
		$("#error_cus_bnkname").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_bnkbranch").val()) == ''){
		$("#error_cus_bnkbranch").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_accno").val()) == ''){
		$("#error_cus_accno").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_panno").val()) == ''){
		$("#error_cus_panno").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_ifsc").val()) == ''){
		$("#error_cus_ifsc").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_tin_no").val()) == ''){
		$("#error_cus_tin_no").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_addrcopy").val()) == ''){
		$("#error_cus_addrcopy").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_pancopy").val()) == ''){
		$("#error_cus_pancopy").html("Required Field...!");
			flag = 1;
	}
	if($.trim($("#cus_tincopy").val()) == ''){
		$("#error_cus_tincopy").html("Required Field...!");
			flag = 1;
	}
	// if($.trim($("#cus_dealcopy").val()) == ''){
	// 	$("#error_cus_dealcopy").html("Required Field...!");	
	// 		flag = 1;
	// }
	// if($.trim($("#cus_tcstds").val()) == ''){
	// 	$("#error_cus_tcstds").html("Required Field...!");
	// 		flag = 1;
	// }
	
	$.ajax({                                                
               type: "POST",                                                           
               url: "<?php echo $this->config->item('base_url'); ?>index.php/C_userregistration/check_captcha",
               data:'captcha_answer='+$('#answer').val(),
			   async:false,
               success: function(captcha_flag){
                               //console.log(captcha_flag);
						   if(captcha_flag==1)
						   {
						   }
						   else
						   {
						   	      flag = 1;
								   document.getElementById("btnsubmit").disabled=false;
								  $("#error_btnsubmit").html("Enter valid captcha...!");
								   $("#answer").val("");
						   }
               },
               error: function(request,error) {
                       console.log(error);
               }
       });
	   
	if(flag == 0)
	  document.getElementById('iframeForm').submit();
	else
	{
		document.getElementById("btnsubmit").disabled=false; 
		return false;
	}
}
function btnenable() { 
	if(document.getElementById("chkaccept").checked){
		document.getElementById("btnsubmit").disabled=false;
	}
	else{
		document.getElementById("btnsubmit").disabled=true;
	}
}

</script>	
<div class="container-fluid ">
		<div class="banner_info">
			<img src="<?php echo $this->config->item('base_url'); ?>assets/images/kyc.jpg" alt="KYC"/>
		</div>
		<div class="container">	
			<div class="row">
				<div class="col-md-1"></div>
				<div  class="col-md-10 loginTableContainer kyc " style="">
					<h1 align="center" style="font-size:16px; font-weight:bold; height:60px; line-height:2; color:#fff">KYC REGISTRATION</h1>
					<?php
					$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm','autocomplete' => 'off');
						echo form_open_multipart('C_kyc/DB_Controller/',$attributes); ?>
						<fieldset>	
							
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">Company Name * </label>
									<div class="col-sm-3">
										<input type="text" name="fv[cus_company_name]" id="cus_company_name" class="form-control form-control1" />
										<span id="error_cus_company_name"  style="color:#FF0000; margin-left:1%"></span>
									</div>
									<label class="control-label col-sm-2">Address  *</label>
									
									<div class="col-sm-3">
										<textarea name="fv[cus_address]" id="cus_address" class="form-control form-control1"  ></textarea>
										<span id="error_cus_address"  style="color:#FF0000; margin-left:1%"></span>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label1 col-sm-12" style=""><u>Proprietor/Partner's Name</u></label>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">Name1 *</label>
								  
								  <div class="col-sm-3">
										<input type="text" name="fv[cus_name]" id="cus_name" class="form-control form-control1"  />
										<span id="error_cus_name" style="color:#FF0000; margin-left:1%"></span>
									</div>
								   <label class="control-label col-sm-2">Mobile *</label>
									<div class="col-sm-3">
										<input onchange="check_Mobileno(this)" type="number"  name="fv[cus_mobile]" id="cus_mobile" class="form-control form-control1"  placeholder=""  />
										<span id="error_cus_mobile" style="color:#FF0000; margin-left:1%"></span>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
								<label class="control-label col-sm-3">Name 2 </label>
									<div class="col-sm-3">
										<input type="text"  name="fv[cus_name2]"  id="cus_name2" class="form-control form-control1"  />
										<span id="error_cus_name2"  style="color:#FF0000; margin-left:1%"></span>
									</div>
									
								  <label class="control-label col-sm-2">Mobile</label>
									<div class="col-sm-3">
										<input onchange="check_Mobileno(this)" type="number" name="fv[cus_mobile2]" id="cus_mobile2"  placeholder=""  class="form-control form-control1"  />
										<span id="error_cus_mobile2"  style="color:#FF0000; margin-left:1%"></span>

									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label1 col-sm-12" style=""><u>Phone Number</u></label>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">Office 1 *</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_phone1]" id="cus_phone1" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_phone1"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  <label class="control-label col-sm-2">Office2</label>
									<div class="col-sm-3">
										<input type="text" name="fv[cus_phone2]" id="cus_phone2"  placeholder=""  class="form-control form-control1"/>
										<span id="error_cus_phone2"  style="color:#FF0000; margin-left:1%"></span>

									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">Residence</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_res_phone]" id="cus_res_phone" class="form-control form-control1"  placeholder=""/>
										<span id="error_cus_res_phone"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  <label class="control-label col-sm-2">E mail *</label>
									<div class="col-sm-3">
										<input type="email" name="fv[cus_email]" id="cus_email"  placeholder=""  class="form-control form-control1" onchange="checkEmailclient(this)" />
										<span id="error_cus_email"  style="color:#FF0000; margin-left:1%"></span>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label1 col-sm-12" style=""><u>Bank Details</u></label>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">Name *</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_bnkname]" id="cus_bnkname" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_bnkname"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  <label class="control-label col-sm-2">Branch *</label>
									<div class="col-sm-3">
										<input type="text" name="fv[cus_bnkbranch]" id="cus_bnkbranch"  placeholder=""  class="form-control form-control1" />
										<span id="error_cus_bnkbranch"  style="color:#FF0000; margin-left:1%"></span>

									</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">A/C No *</label>
								  <div class="col-sm-3">
										<input type="number"  name="fv[cus_accno]" id="cus_accno" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_accno"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								<label class="control-label col-sm-2">IFSC Code *</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_ifsc]" id="cus_ifsc" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_ifsc"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-3">GSTin No *</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_tin_no]" id="cus_tin_no" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_tin_no"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								 <label class="control-label col-sm-2">Pan No *</label>
								  <div class="col-sm-3">
										<input type="text"  name="fv[cus_panno]" id="cus_panno" class="form-control form-control1"  placeholder="" />
										<span id="error_cus_panno"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
								<label class="control-label col-sm-3">Reference</label>
									  <div class="col-sm-3">
											<input type="text"  name="fv[cus_ref]" id="cus_ref" class="form-control form-control1"  placeholder=""/>
											<span id="error_cus_ref"  style="color:#FF0000; margin-left:1%"></span>
									</div>
								<label class="control-label col-sm-2">Type</label>
									 <div class="col-sm-2" style="width:10%">	
									 <input checked type="radio" style="width:auto;height:25px;" value="0" name="cus_tcstds" id="cus_tcs" />&nbsp;<label for="cus_tcs">TCS</label>&nbsp;
									</div><div class="col-sm-2" style="width:10%">	
									 <input type="radio" value="1" style="width:auto;height:25px;" name="cus_tcstds"  id="cus_tds" /> &nbsp;<label for="cus_tds">TDS</label>     
									 <span id="error_cus_tcstds"  style="color:#FF0000; margin-left:1%"></span>
									 </div>
									
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label1 col-sm-12" style=""><u>Documents Required</u></label>
								</div>
							</div>
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label control-pan col-sm-3">Address proof copy *</label>
								  <div class="col-sm-3">
										<input type="file"  name="fv[cus_addrcopy]" id="cus_addrcopy" placeholder="" onchange="validate_image(this)" class="form-control1" />
										<span id="error_cus_addrcopy"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  <label class="control-label control-pan col-sm-2">PanNo scan copy *</label>
									<div class="col-sm-3">
										<input type="file" name="fv[cus_pancopy]" id="cus_pancopy"  placeholder="" onchange="validate_image(this)" class="form-control1" />
										<span id="error_cus_pancopy"  style="color:#FF0000; margin-left:1%"></span>

									</div>
								</div>
							</div> 
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label control-pan col-sm-3">GSTinNo scan copy *</label>
								  <div class="col-sm-3">
										<input type="file"  name="fv[cus_tincopy]" id="cus_tincopy"  placeholder=""  onchange="validate_image(this)" class="form-control1" />
										<span id="error_cus_tincopy"  style="color:#FF0000; margin-left:1%"></span>
								</div>
								  <label class="control-label control-pan col-sm-2">Partnership Deal copy</label>
									<div class="col-sm-3">
										<input type="file" name="fv[cus_dealcopy]" id="cus_dealcopy"  placeholder="" onchange="validate_image(this)"  class="form-control1" />
										<span id="error_cus_dealcopy"  style="color:#FF0000; margin-left:1%"></span>

									</div>
								</div>
							</div>
							<p></p> 
							<div class="row">
								<div class="form-group form-kyc">
									<label class="control-label col-sm-2">Captcha</label>
								  <div class="col-sm-4">
										<img src="<?php echo $this->config->item('base_url'); ?>captcha_code_file.php?rand=<?php echo rand(); ?>" id='captchaimg' style="margin-bottom: 5px;" alt="shivsahai" /><a href='javascript: refreshCaptcha();'><img src="<?php echo $this->config->item('base_url'); ?>assets/images/refresh.png" alt="shivsahai" height="50" width="50" title="Refresh" /></a>
									</div>
									<label class="control-label col-sm-2">Enter captcha *</label>
									<div class="col-sm-3">
										<input type="text" id="answer" name="answer" style="" placeholder="Enter captcha here" class="form-control form-control1"  />
										<span id="error_btnsubmit"  style="color:#FF0000; margin-left:1%"></span>
									</div>
								</div>
							</div>
								<p></p>
							<div class="row">
								<div class="form-group form-kyc">
								<!--<label class="control-label col-sm-3"></label>-->
									<div class="col-sm-6" align="center" style="display:inline">
										<input type="checkbox"  tabindex="7" name="checkbox" id="chkaccept" onchange="btnenable();" />
										<label for="chkaccept"  class="chkaccept1" style="display:inline; cursor:pointer">
											I agree with the <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/terms" target="_blank">Terms and Conditions</a> of Ganapathy Bullion.</label>
									</div>
								<label class="control-label col-sm-2"></label>
									<div class="col-sm-3">
										<input id="btnsubmit" value="Register" type="button" onclick="validate_form(event)" class="btn-primary img-rounded btn btn-disabled" style="border:none; width:120px; height:30px;">
									</div>
								</div>
							</div>
						</fieldset>
					</form>
				</div>
				<div class="col-md-1"></div>
			</div>
		</div>	
  <script type="text/javascript">
    $('#btnsubmit').prop('disabled', true);
   </script>	