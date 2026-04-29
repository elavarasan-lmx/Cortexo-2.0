<script type="text/javascript">
$(document).ready(function(){
	var $ = jQuery.noConflict();
		$.ajax({
			url : "<?php echo $this->config->item('base_url'); ?>index.php/C_booking/getgallery",
			type : "GET",
			dataType : "json",
			data: "",
			async: false,
			success: function(xmlDoc){
				var gallery_img = "<div class='col-md-12'>";
				$.each(xmlDoc,function(key,value){
						gallery_img += '<div class="col-md-3 container_img"><a><img src="<?php echo $this->config->item('base_url'); ?>'+value.location+'"  height="auto" style="width:100%";/></a><div class="text-block" style="text-align: center;padding: 11px;background: #1b1b31;font-size: 18px;margin-bottom: 12px;">'+value.name+'</div></div>';
				});
				gallery_img += "</div>";
				$('.gallery_img').html(gallery_img);
			},
			error: function(request,error){
				console.log(error);
			}
		});
});
</script>
	<div class="banner">
		<img src="<?php echo $this->config->item('base_url'); ?>assets/images/Products.jpg" width="100%">
	</div>
<div class="container-fluid">
	<div class="row">
		<div class="container">
			<div class="gallery_img" >

			</div>
		</div>
	</div>
</div>
