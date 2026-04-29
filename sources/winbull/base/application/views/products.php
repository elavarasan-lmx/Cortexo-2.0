<link rel="stylesheet" href="<?php echo $this->config->item('base_url');?>assets/css/nanoscroller.css"> 
<style>
div.wrapper{
	position:relative; /* important(so we can absolutely position the description div */ 
}
div.description{
	position:absolute; /* absolute position (so we can position it where we want)*/
	bottom:0px; /* position will be on bottom */
	left:0px;
	display:none; /* hide it */
	/* styling bellow */
	background-color:#faf6ed;
	font-family: 'tahoma';
	font-size:12px;
	font-weight: bold;
	color:#89836d;
	width:165px;
}
div.description_content{
	padding:10px;
	float:right;
}
#prod-thumbs tr td{
/*float:left;*/
}
.products {
	opacity: 0.6; 
}
.products:hover {	
	opacity: 1; 
}
/*#easyTooltip{
	margin:0 10px 1em 0;
	width:180px;
	padding:8px;
	background:#fcfcfc;
	border:1px solid #e1e1e1;
	line-height:130%;				
	}
#easyTooltip h3{
	margin:0 0 .5em 0;
	font:13px Arial, Helvetica, sans-serif;
	text-transform:uppercase;
}	

#easyTooltip p{
	margin:0 0 .5em 0;
}
#easyTooltip img{
		background:#fff;
		padding:1px;
		border:1px solid #e1e1e1;
		float:left;
		margin-right:10px;
}		
#item{display:none;}*/
.dvbdy1 { background:#FFFFFF; border:3px solid #F8F1E5;padding:5px;width:180px;height:auto;float:left;}
.grey {
color: #4D4848;
}
.ttip-lt{width:50%;}
.ttip-rt{width:50%;}
.ttip2-lt{width:30%;}
.ttip2-rt{width:30%;}
.ttip2-mid{width:30%;}
.flotlt{float:left;}
.flotrt{float:right;}
.fnt-bold{font-weight:bold;}
.fnt-normal{font-weight:normal;}
.red {
color: #DF4349;
}
#main {
height: 500px;
width: 330px;
margin: auto;
}	
</style>
<!-- <script type="text/javascript" src="/assets/js/jquery-1.7.min.js"></script> -->
<script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>assets/js/easyTooltip.js"></script>
<script type="text/javascript" src="<?php echo base_url().'assets/js/';?>jquery.nanoscroller.js"></script>
<script type="text/javascript">
$(window).load(function(){
	//for each description div...
	$('div.description').each(function(){
		//...set the opacity to 0...
		$(this).css('opacity', 0);
		//..set width same as the image...
		$(this).css('width', $(this).siblings('img').width());
		//...get the parent (the wrapper) and set it's width same as the image width... '
		$(this).parent().css('width', $(this).siblings('img').width());
		//...set the display to block
		$(this).css('display', 'block');
	});
	
	$('.wrapper').hover(function(){
		//when mouse hover over the wrapper div
		//get it's children elements with class descriptio
		//and show it using fadeTo
		$(this).children('.description').stop().fadeTo(100, 0.7);
	},function(){
		//when mouse out of the wrapper div
		//use fadeTo to hide the div
		$(this).children('.description').stop().fadeTo(100, 0);
	});
	
});
$(document).ready(function(){	
	$("a.primage").easyTooltip();
});

$(function(){

  $('.nano').nanoScroller({
    preventPageScrolling: true
  });
    $(".nano").nanoScroller();


});
</script>

<tr>
    <td><div class="content-container">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
			<td>
				<table width="100%" border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td align="left" valign="top" style="padding-right:5px;">
					
					<?php 
					function rstrstr($haystack,$needle)
					{
						return substr($haystack, 0,strpos($haystack, $needle));
					}
					if(!function_exists('mimeinfo')) require(BASEPATH."application/libraries/filelib.php"); 
					if(file_exists(BASEPATH."../".$intro_img)) {
						$mimetype = mimeinfo('type',$intro_img);
						$mimetype2 = rstrstr($mimetype,'/');
						if($mimetype2=='image'){
					?>
					<img src="<?php echo base_url().$intro_img;?>" width="640" height="495" alt="Products" />
					<?php } 
						else {
							echo ' <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="495" align="absbottom" id="myId5">
								<param name="movie" value="'.base_url().$intro_img.'" />
								<!--[if !IE]>-->
								<object data="'.base_url().$intro_img.'" type="application/x-shockwave-flash" width="640" height="495" align="absbottom">
									<param name="wmode" value="opaque" />
									<!--<![endif]-->
									<div>
										<h1>Alternative content</h1>
										<p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p>
									</div>
									<!--[if !IE]>-->
								</object>
								<!--<![endif]-->
							</object>';
						}
					}
					//<!-- <img src="images/products-img.jpg" width="640" height="495" alt="Products" />-->
					?>
					
					
					</td>
					<td valign="top" id="main">
					<div class="nano">
					  <div class="overthrow content"><p>	
						<table width="100%" border="0" cellpadding="0" cellspacing="0" id="prod-thumbs">
						<tr>
							
							<?php
								if(is_array($cat)) {
										foreach($cat as $key=>$catarr) {
											$class = '';
											if($key%2==0) echo '<tr>';
											else $class = ' class="col2"';
											echo '<td'.$class.' align="right">
											<div class="wrapper">
											<a href="'.base_url().'index.php/products/cat/'.$catarr['id'].'"><img src="'.base_url().$catarr['thumbnail'].'" alt="'.$catarr['name'].'" name="Image10" width="165" height="120" border="0" id="Image10" /></a>
											<div class="description">
												<div class="description_content">'.$catarr['name'].'</div>
											</div></div>
											</td>
											';
											if($key%2==1) echo '</tr>';
										}
										if(isset($key) && $key%2==0) echo '</tr>';
									}
									if(is_array($products)) {
										foreach($products as $key=>$productarr) {
											$class = '';
											if($key%2==0) echo '<tr>';
											else $class = ' class="col2"';
											echo '<td'.$class.' align="left">
											<a class="primage" href="'.base_url()."index.php/products/detail/".$productarr['id'].'" title="'.htmlspecialchars('<div class="dvbdy1"><div class="grey"><p class="ttip-lt flotlt fnt-12 fnt-bold red" style="width:100%">'.$productarr['name'].'</p>'.'</div></div>').'"><img src="'.base_url().$productarr['thumbnail'].'" alt="'.$productarr['name'].'" name="Image10" width="165" height="120" border="0" id="Image10" class="products" /></a>
											</td>
											';//(($productarr['price']>0)?'<p class="ttip-lt flotlt fnt-12">Price:</p><p class="ttip-rt flotlt fnt-12">Rs. '.$productarr['price'].'</p>':'').
											if($key%2==1) echo '</tr>';
										}
										if(isset($key) && $key%2==0) echo '</tr>';
									}
							?>
						</tr>
					</table>
					</p></div></div>
					</td>
				</tr>
			</table>
			</td>
		</tr>
	 </table></div>
	</td> 	
</tr>
