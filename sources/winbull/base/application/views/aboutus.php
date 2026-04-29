<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['about-us']) ? $all_content['about-us'] : [];
}

// Fallback to defaults if not found
$banner_image = isset($page_content['banner_image']) && !empty($page_content['banner_image']) 
	? $page_content['banner_image'] 
	: 'assets/images/aboutus.jpg';

$page_title = isset($page_content['title']) && !empty($page_content['title']) 
	? $page_content['title'] 
	: 'About Us';

$content_text = isset($page_content['content']) && !empty($page_content['content']) 
	? $page_content['content'] 
	: 'is chartered by reputed bussiness man of jewel industry. We are Proficient in the trade of Precious metals. We will be the one-step solution for your investement and queries. Enter our door for timely service and value for your money. We are experienced in market analysis and will ensure your satisfication.';

$side_image = isset($page_content['side_image']) && !empty($page_content['side_image']) 
	? $page_content['side_image'] 
	: 'assets/images/ad32.jpg';
?>

<div class="banner">
	<img src="<?php echo $this->config->item('base_url'); ?><?php echo $banner_image; ?>" style="width: 100%;">
</div>
<div class="container-fluid contant">
	<div class="row paddingTopBottom15">
		<div class="container">
			<div class="col-md-12 col-xs-12 aboutus_head">
				<div class="col-md-12 col-xs-12 aboutus_content">
					<?php echo $content_text; ?>
				</div>
			</div>
		</div>
	</div>
</div>