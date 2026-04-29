<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['contact-us']) ? $all_content['contact-us'] : [];
}

// Fallback logic
$banner_image = isset($page_content['banner_image']) && !empty($page_content['banner_image']) 
	? $page_content['banner_image'] 
	: 'assets/images/contactus.jpg';
?>
	<script type="text/javascript">function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}
function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

	//To Check Mobile Number
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


//For resetting fields
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
function refreshCaptcha()
{
	var img = document.images['captchaimg'];
	img.src = img.src.substring(0,img.src.lastIndexOf("?"))+"?rand="+Math.random()*1000;
}

</script> 
		<div class="banner">
			<?php if(!empty($page_content['banner_image'])): ?>
				<img src="<?php echo $this->config->item('base_url') . '../' . str_replace('\\\\/', '/', $page_content['banner_image']); ?>" width="100%" />
			<?php endif; ?>
		</div>
		<div class="container-fluid contact_background contant">
			<div class="row">
				<div class="container">
					<div class="col-md-8 col-xs-12">
						<div class="enquiry">
							<h3>Enquiry Form</h3>
							<?php
							$attributes 		=	array('class' => 'fixed', 'id' => 'contact-form', 'name' => 'contact-form', 'autocomplete' => 'off');
							//Opening form
							echo form_open('C_client_main/contactussubmit',$attributes); 
							?>
							<form>
									
								<div class="contentform">
								<?php if($this->session->userdata('flag_register') == -1) { ?>
									<span style="color:#FF0000">Invalid Captcha</span>
									<?php
											$this->session->unset_userdata('flag_register');
											} 
									?>
									<div class="leftcontact">
										<div class="form-group">
											
											<span class="icon-case"><i class="fa fa-user"></i></span>
												<input  class="form-groupinput input_cont" required id="name1" type="name" name="name" placeholder="Name" />
												<div class="validation"></div>
										</div>
										<!--<div class="form-group">
											<p>Company Name<span>*</span></p>
											<span class="icon-case"><i class="fa fa-home"></i></span>
												<input  required id="email-id" type="email" name="email" placeholder="Email" >
												<div class="validation"></div>
										</div>-->
										<div class="form-group">
											
											<span class="icon-case"><i class="fa fa-envelope-o"></i></span>
												<input class="form-groupinput input_cont" required id="email-id" type="email" name="email" placeholder="Email" onChange="check_Email(this)" >
												<div class="validation"></div>
										</div>	
										<div class="form-group">
											
											<span class="icon-case"><i class="fa fa-phone"></i></span>
												<input class="form-groupinput input_cont"required id="phone-no" type="number" name="phone" placeholder="Phone no" onChange="check_Mobile(this)">
												<div class="validation"></div>
										</div>
										<div class="form-group">
											
											<span class="icon-case"><i class="fa fa-comments-o"></i></span>
												<textarea class="form-groupinput" required id="comments" name="comments" placeholder="Message" onFocus="this.value = '';"></textarea>
											<div class="validation"></div>
										</div>
										<div class="form-group">
											
											<span class="icon-case"><i class="fa fa-lock"></i></span>
												<input id="answer" class="form-groupinput captcha input_cont" type="text" name="answer" value="Captcha" onFocus="this.value = '';" onBlur="if (this.value == '') {this.value = 'Captcha';}" /><img src="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/get_captcha?rand=<?php echo rand(); ?>" id='captchaimg' class="captcha-img" /><a href='javascript: refreshCaptcha();'><img src="<?php echo $this->config->item('base_url'); ?>assets/images/refresh.png" height="50" width="50" title="Refresh"/></a>
												<div class="validation"></div>
										</div>
									</div>
									<p style="text-align:center"><button id="submit" type="submit" name="Submit"  value="Submit" class="bouton-contact">Send</button><button  id="reset" type="reset" name="Reset" type="reset" value="Clear" class="bouton-contact" style="    margin-left: 20px;">Reset</button></p>
								</form>						
							</div>
						</div>
					</div>
					<div class="col-md-4 col-xs-12 contact_us"> 
						<div class="contactus">
							<?php 
							$locations = [];
							if (!empty($page_content['content_4'])) {
								$locations = json_decode($page_content['content_4'], true);
							}
							
							$flat_blocks = [];
							if (!empty($locations) && is_array($locations)) {
								foreach ($locations as $loc) {
									if (isset($loc['address']) || isset($loc['phone']) || isset($loc['email'])) {
										if (!empty($loc['address'])) $flat_blocks[] = ['title' => 'Get in Touch', 'type' => 'address', 'value' => $loc['address']];
										if (!empty($loc['phone'])) $flat_blocks[] = ['title' => 'Booking', 'type' => 'phone', 'value' => $loc['phone']];
										if (!empty($loc['email'])) $flat_blocks[] = ['title' => 'Email', 'type' => 'email', 'value' => $loc['email']];
									} else if (isset($loc['title'])) {
										$flat_blocks[] = $loc;
									}
								}
							}
							
							if (empty($flat_blocks)): 
							?>
								<div class="getintouchTitle">
									Get in Touch
								</div>
								<div class="location">
									 <div style="display:flex; margin-bottom: 15px;">
										<div style="margin-right: 10px;"><i class="fa fa-map-marker" aria-hidden="true" style="font-size:20px;"></i></div> 
										<div><?php echo !empty($page_content['content']) ? $page_content['content'] : 'No 1, Main Street, <br>Your City'; ?></div>
									 </div>
								</div>

								<div class="getintouchTitle">
									Booking
								</div>
								<div class="contact1">
									 <div style="display:flex; margin-bottom: 15px;">
										<div style="margin-right: 10px;"><i class="fa fa-phone" aria-hidden="true" style="font-size:20px;"></i></div> 
										<div><?php echo !empty($page_content['content_2']) ? $page_content['content_2'] : '+91 1234567890 <br> +91 0987654321'; ?></div>
									 </div>
								</div> 

								<div class="getintouchTitle">
									Billing
								</div>
								<div class="contact1">
									 <div style="display:flex; margin-bottom: 15px;">
										<div style="margin-right: 10px;"><i class="fa fa-phone" aria-hidden="true" style="font-size:20px;"></i></div> 
										<div><?php echo !empty($page_content['content_3']) ? $page_content['content_3'] : '+91 5555555555'; ?></div>
									 </div>
								</div> 

								<!-- Email (We can just use email from DB or fallback) -->
								<div class="email">
									 <div style="display:flex;">
										<div style="margin-right: 10px;"><i class="fa fa-envelope-o" aria-hidden="true" style="font-size:20px;"></i></div> 
										<div><a href="mailto:info@yourdomain.com">info@yourdomain.com</a></div>
									 </div>
								</div>
							<?php else: ?>
								<?php foreach ($flat_blocks as $index => $block): 
									if (empty($block['value'])) continue;

									$icon = 'fa-info-circle';
									if ($block['type'] == 'address') $icon = 'fa-map-marker';
									else if ($block['type'] == 'phone') $icon = 'fa-phone';
									else if ($block['type'] == 'whatsapp') $icon = 'fa-whatsapp';
									else if ($block['type'] == 'email') $icon = 'fa-envelope-o';
									else if ($block['type'] == 'fax') $icon = 'fa-fax';
									else if ($block['type'] == 'gst') $icon = 'fa-file-text-o';

									$val_br = nl2br(htmlspecialchars($block['value']));
									$display_value = $val_br;
									if ($block['type'] == 'phone') {
										$phone_lines = explode("\n", $block['value']);
										$display_links = [];
										foreach ($phone_lines as $pline) {
											$clean_num = preg_replace('/[^0-9+]/', '', $pline);
											if (!empty($clean_num)) {
												$display_links[] = '<a href="tel:'.$clean_num.'" style="color:inherit">'.htmlspecialchars(trim($pline)).'</a>';
											} else if (!empty(trim($pline))) {
												$display_links[] = htmlspecialchars(trim($pline));
											}
										}
										$display_value = implode('<br>', $display_links);
									} else if ($block['type'] == 'whatsapp') {
										$wa_lines = explode("\n", $block['value']);
										$display_links = [];
										foreach ($wa_lines as $pline) {
											$clean_num = preg_replace('/[^0-9+]/', '', $pline);
											if (!empty($clean_num)) {
												$display_links[] = '<a href="https://api.whatsapp.com/send?phone='.$clean_num.'" target="_blank" style="color:inherit">'.htmlspecialchars(trim($pline)).'</a>';
											} else if (!empty(trim($pline))) {
												$display_links[] = htmlspecialchars(trim($pline));
											}
										}
										$display_value = implode('<br>', $display_links);
									} else if ($block['type'] == 'email') {
										$display_value = '<a href="mailto:'.trim(htmlspecialchars($block['value'])).'" style="color:inherit">'.$val_br.'</a>';
									}
								?>
								<div class="getintouchTitle" <?php echo $index > 0 ? 'style="margin-top: 20px;"' : ''; ?>>
									<?php echo htmlspecialchars($block['title']); ?>
								</div>
								<div class="contact1">
									 <div style="display:flex; margin-bottom: 15px;">
										<div style="margin-right: 10px;"><i class="fa <?php echo $icon; ?>" aria-hidden="true" style="font-size:20px;"></i></div> 
										<div style="word-break: break-word;"><?php echo $display_value; ?></div>
									 </div>
								</div>
								<?php endforeach; ?>
							<?php endif; ?>

						</div>
					</div>		
				</div>
			</div>
			
		</div>