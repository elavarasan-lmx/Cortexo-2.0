<?php
// Load content from JSON
$content_file = APPPATH . '../admin/application/config/page_content.json';
$page_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
	$page_content = isset($all_content['disclaimer']) ? $all_content['disclaimer'] : [];
}

// Fallback to defaults if not found
$banner_image = isset($page_content['banner_image']) && !empty($page_content['banner_image']) 
	? $page_content['banner_image'] 
	: 'assets/images/Disclaimer.jpg';

$page_title = isset($page_content['title']) && !empty($page_content['title']) 
	? $page_content['title'] 
	: 'Disclaimer';

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
					<!-- Default Disclaimer Content -->
					<h3 class="policy">Disclaimer</h3><hr class="welcome1"></hr>
					<p align="justify"><?php echo Globals::$web_title ?> Liverates provides gold & silver prices obtained from various sources believed to be reliable, but we do not guarantee their accuracy. Our gold & silver price data are provided without warranty or claim of reliability. It is accepted by the site visitor on the condition that errors or omissions shall not be made the basis for any claim, demand or cause for action.</p>
					<p align="justify"><?php echo Globals::$web_title ?> owns the copyright to all the contents of this website, including images. All trademarks, logo and other intellectual property are owned or licensed by us (unless otherwise specified).</p>
					<p align="justify">You may not copy, reproduce, distribute, republish, download, display, post or transmit any part of the website without written consent from us.You may print or download any page(s) for your own personal and non-commercial use only.</p>
					<p align="justify">While our website is as accurate as possible, we cannot accept responsibility for any inaccuracies or errors beyond our reasonable control.</p>
					<p align="justify">In particular, neither the website owner nor any third party or data or content provider shall be liable in any way to you or to any other person, firm or corporation whatsoever for any loss, liability, damage (whether direct or consequential), personal injury or expense of any nature whatsoever arising from any delays, inaccuracies, errors in, or omission of any share price information or the transmission thereof, or for any actions taken in reliance thereon or occasioned thereby or by reason of non-performance or interruption, or termination thereof.</p>
					<br><br><br><br><br><br>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>