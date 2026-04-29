<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['privacy']) ? $all_content['privacy'] : [];
}

// Fallback to defaults if not found
$banner_image = isset($page_content['banner_image']) && !empty($page_content['banner_image']) 
	? $page_content['banner_image'] 
	: 'assets/images/Privacypolicy.jpg';

$page_title = isset($page_content['title']) && !empty($page_content['title']) 
	? $page_content['title'] 
	: 'Privacy Policy';

$content_text = isset($page_content['content']) && !empty($page_content['content']) 
	? $page_content['content'] 
	: '';
?>

<?php if(!empty($banner_image)): ?>
<div class="banner">
	<img src="<?php echo $this->config->item('base_url'); ?><?php echo $banner_image; ?>" style="width: 100%;">
</div>
<?php endif; ?>

<div class="container-fluid contant">
	<div class="container">
		<div class="row contant1">
			<div class="col-md-12 col-xs-12 policy">
				<?php if(!empty($content_text)): ?>
					<?php echo $content_text; ?>
				<?php else: ?>
					<!-- Default Privacy Policy Content -->
					<h3 class="policy">Privacy Policy</h3>
					<hr class="welcome1">
					<p align="justify">This privacy policy sets out <?php echo Globals::$web_title ?> uses and protects any information that you give to <?php echo Globals::$web_title ?> when you use this website.</p>
					<p align="justify">We collect personally identifiable information (email address, name phone number, etc.) from you when you set up a free account with <?php echo Globals::$web_title ?>.</p>
					<p align="justify">We value the trust you place in <?php echo Globals::$web_title ?>. That's why we insist upon the highest standards for secure transactions and customer information privacy.</p>
					<p align="justify"><?php echo Globals::$web_title ?> is committed to ensuring that your privacy is protected.</p>
					<p align="justify">Our site has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access.<br><br><br><br><br><br><br></p>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>