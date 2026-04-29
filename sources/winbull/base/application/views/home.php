<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['home']) ? $all_content['home'] : [];
}

// Fallback to defaults if not found
$page_title = isset($page_content['title']) && !empty($page_content['title']) 
	? $page_content['title'] 
	: 'Home';

// Load slider images from JSON (supporting unlimited images with any names)
$slider_images = [];
if (isset($page_content['slider_images']) && !empty($page_content['slider_images'])) {
	// If stored as JSON string, decode it
	if (is_string($page_content['slider_images'])) {
		$slider_images = json_decode($page_content['slider_images'], true);
	} else {
		$slider_images = $page_content['slider_images'];
	}
}

// Fallback to default images if none are set
if (empty($slider_images)) {
	$slider_images = [
		'assets/images/slider1.jpg',
		'assets/images/slider2.jpg',
		'assets/images/slider3.jpg'
	];
}

$content_text = isset($page_content['content']) && !empty($page_content['content']) 
	? $page_content['content'] 
	: '';
?>

<script type="text/javascript">
			var j = jQuery.noConflict();
			j(document).ready(function () {
				j('#slider').nivoSlider();
				 
			});
		</script>

<div class="contant">
	<div class="headerslider elegant-animate anim-fade-in">
		<div class="slider-wrapper theme-default">
			<div id="slider" class="nivoSliderheaderContainer"> 
				<?php foreach($slider_images as $slider_image): ?>
					<img src="<?php echo $this->config->item('base_url'); ?><?php echo $slider_image; ?>" style="width: 100%;">
				<?php endforeach; ?>
			</div>
		</div>
	</div>
	
<div class="container-fluid contant">
	<div class="row paddingTopBottom15">
		<div class="container">
			<div class="col-md-12 col-xs-12 policy">
				<?php if(!empty($content_text)): ?>
					<?php echo $content_text; ?>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>
	
</div>