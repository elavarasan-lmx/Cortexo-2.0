<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['terms']) ? $all_content['terms'] : [];
}

// Fallback to defaults if not found
$banner_image = isset($page_content['banner_image']) && !empty($page_content['banner_image']) 
	? $page_content['banner_image'] 
	: 'assets/images/terms.jpg';

$page_title = isset($page_content['title']) && !empty($page_content['title']) 
	? $page_content['title'] 
	: 'Terms & Conditions';

$content_text = isset($page_content['content']) && !empty($page_content['content']) 
	? $page_content['content'] 
	: 'Please read these terms and conditions carefully before using our services.';
?>

<?php if(!empty($banner_image)): ?>
<div class="banner">
	<img src="<?php echo $this->config->item('base_url'); ?><?php echo $banner_image; ?>" style="width: 100%;">
</div>
<?php endif; ?>

<div class="container-fluid contant">
	<div class="row paddingTopBottom15">
		<div class="container">
			<div class="col-md-12 col-xs-12 policy">
				<?php echo $content_text; ?>
			</div>
		</div>
	</div>
</div>