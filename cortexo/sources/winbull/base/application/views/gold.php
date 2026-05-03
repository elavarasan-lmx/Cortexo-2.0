
<script type="text/javascript">
$(document).ready(function(){
	var $ = jQuery.noConflict();
		$.ajax({
			url : "<?php echo $this->config->item('base_url'); ?>index.php/C_booking/getgallerygold",
			type : "GET",
			dataType : "json",
			data: "",
			async: false,
			success: function(xmlDoc){
				var gallery_img = "<div class='col-md-12'>";
				$.each(xmlDoc,function(key,value)
				{
						console.log(value);
						gallery_img += '<div id="sendto" style="cursor: pointer;" class="col-md-3 container_img"><a><img src="<?php echo $this->config->item('base_url'); ?>'+value.location+'"  height="auto" style="width:100%";/></a><div class="text-block" style="text-align: center;padding: 11px;background: #1b1b31;font-size: 18px;margin-bottom: 12px;">'+value.name+'</div><button id="sendto" name="sendtomsgg" class="sendtomsgg" style="margin-top: -10px;padding: 7px;text-align: center;background: #000;color: #FFF;    margin-bottom: 14px;cursor: pointer;width: 100%;">Enquiry Now</button></div>';
				});
				gallery_img += "</div>";
				$('.gallery_img').html(gallery_img);
			},
			error: function(request,error){
				console.log(error);
			}
		});
		$("#sendto").on("click",function(e)
		{
			console.log("babu24");
			e.preventDefault();
			$('#sendtomsg').modal('show');				
		});
});
function check_Mobile()
{
	if(arguments[0].value !="")
	{
		var incomingString=arguments[0].value;
		if(incomingString.length > 10 || incomingString.search(/[^0-9\-()+]/g) != -1 || incomingString.length < 10 )
		{
			alert('Please enter valid mobile number');
			arguments[0].value="";
								
			window.setTimeout(function ()
			{
				document.getElementById('mobile').focus();
			}, 0);
			return false;
		} 
	}
}
//To Check Email
function check_Email(elementValue)
{      
	var status = false;
	var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
     if (elementValue.value.search(emailRegEx) == -1) 
	 {
	      alert("Please enter a valid email address.");
 			 elementValue.value="";
			 //elementValue.focus();
		 window.setTimeout(function ()
 		   {
        	document.getElementById('email').focus();
    		}, 0);
    		return false;
		 //setTimeout("elementValue.focus();",0); 
	 }
}
//To check valid name
function check_Name()
{
	if ((arguments[0].value).search( /^[a-zA-Z .]*$/) === -1) 
	{
		document.getElementById('name').value = '';
  		alert("Please enter only alphabets.");
		window.setTimeout(function ()
 		   {
        	document.getElementById('name').focus();
    		}, 0);
    		return false;
	}
}
function reset_Fields()
{
	required = ["name", "address","mobile","email","message"];
	 for (i=0;i<required.length;i++)
	    {
			var input = $('#'+required[i]);
			input.css('border-color','#600');
			//input.style.borderColor='#E9E9E9';
			input.val("");
		 }
}
</script>
<style>
.form-control {
    display: block;
    width: 100%;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
    -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
}
.modal-body {
    background: #ff8b009e;
    text-align: center;
    position: relative;
    padding: 22px;
}
.modal-header {
    color: #FFF;
    padding: 15px;
    border-bottom: 1px solid #e5e5e5;
    background: #010111;
}
.modal-header .close {
    color: #fb0707 !important;
    margin-top: -2px;
}
</style>
	<div class="banner">
		<img src="<?php echo $this->config->item('base_url'); ?>assets/images/Products.jpg" width="100%">
	</div>
<div class="modal fade" id="sendtomsg" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close clx" data-dismiss="modal">×</button>
				<h3>Enquiry Product..!</h3>
			</div>
			
			<div class="modal-body">
				<?php
					$attributes 		=	array('class' => 'fixed', 'id' => 'contact-form', 'name' => 'contact-form', 'autocomplete' => 'off');
					//Opening form
					echo form_open('C_client_main/contactussubmitt',$attributes); 
				?>
				<form>
					<div class="form-group">
						<span class="icon-case"><i class="fa fa-user"></i></span>
						<input  class="form-groupinput" required id="name1" type="name" name="name" placeholder="Name" />
						<div class="validation"></div>
					</div>
					<div class="form-group">
						<span class="icon-case"><i class="fa fa-envelope-o"></i></span>
						<input class="form-groupinput" required id="email-id" type="email" name="email" placeholder="Email" onChange="check_Email(this)" >
						<div class="validation"></div>
					</div>
					<div class="form-group">				
						<span class="icon-case"><i class="fa fa-phone"></i></span>
						<input  id="mobile-num" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" type = "number"maxlength = "10" class="form-groupinput" required  name="phone" placeholder="Phone no" onChange="check_Mobile(this)"  />
						<div class="validation"></div>
					</div>
					<div class="form-group">
						<span class="icon-case" style="margin-left: -15px;"><i class="fa fa-comments-o"></i></span>
						<textarea  class="form-groupinput" required id="comments" name="comments" placeholder="Message" onFocus="this.value = '';"></textarea>
						<div class="validation"></div>
					</div>					
					<button id="submit" type="submit" name="Submit"  value="Submit"  class="btn btn-danger" >SEND</button>
					<button id="reset" type="reset" name="Reset" type="reset" value="Clear"  class="btn btn-success btn-sm" >CLEAR</button>
				</form>
			</div>
		</div>
	</div>
</div>
<div class="container-fluid">
	<div class="row">
		<div class="container">
			<div class="gallery_img" >

			</div>
		</div>
	</div>
</div>
