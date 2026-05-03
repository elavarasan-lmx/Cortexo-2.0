<?php
$this->load->view('include/header.php');
$this->load->helper('common');
$base_url = $this->config->item('base_url');

// Load page content from JSON
$content_file = APPPATH . 'config/page_content.json';
$all_content = [];
if (file_exists($content_file)) {
	$all_content = json_decode(file_get_contents($content_file), true);
}
$page_data = isset($all_content[$page_slug]) ? $all_content[$page_slug] : [
	'banner_image' => '',
	'title' => $page_title ?? '',
	'meta_title' => '',
	'meta_description' => '',
	'meta_keywords' => '',
	'content' => '',
	'side_image' => '',
	'displayed' => 1,
	'indexation' => 1
];
?>

<style>
	.cms-form-section {
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
		margin-bottom: 20px;
	}
	.cms-section-header {
		background: #f8f9fa;
		padding: 12px 15px;
		border-bottom: 1px solid #e5e5e5;
		font-weight: 600;
		color: #363a41;
	}
	.cms-section-body {
		padding: 20px;
	}
	.form-group {
		margin-bottom: 20px;
	}
	.form-group label {
		font-weight: 500;
		color: #363a41;
		margin-bottom: 8px;
		display: block;
	}
	.form-group .help-text {
		font-size: 12px;
		color: #6c868e;
		margin-top: 5px;
	}
	.form-control {
		border-radius: 4px;
	}
	.image-upload-box {
		border: 2px dashed #ccc;
		border-radius: 8px;
		padding: 30px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s;
		background: #fafafa;
	}
	.image-upload-box:hover {
		border-color: #25b9d7;
		background: #f0fafc;
	}
	.image-upload-box img {
		max-width: 100%;
		max-height: 150px;
		border-radius: 4px;
	}
	.image-upload-box .upload-text {
		color: #6c868e;
	}
	.image-upload-box .upload-text i {
		font-size: 40px;
		display: block;
		margin-bottom: 10px;
		color: #25b9d7;
	}
	.switch-toggle {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.switch-toggle .form-check-input {
		width: 50px;
		height: 26px;
		cursor: pointer;
	}
	.switch-toggle .form-check-input:checked {
		background-color: #25b9d7;
		border-color: #25b9d7;
	}
	.page-header-bar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 25px;
	}
	.page-header-bar h4 {
		margin: 0;
		font-weight: 600;
	}
	.page-header-bar .breadcrumb {
		background: none;
		padding: 0;
		margin: 5px 0 0;
	}
	.page-header-bar .breadcrumb a {
		color: rgba(255,255,255,0.8);
	}
	.btn-primary {
		background-color: #25b9d7;
		border-color: #25b9d7;
	}
	.btn-primary:hover {
		background-color: #1fa9c6;
		border-color: #1fa9c6;
	}
	.btn-info {
		background-color: #25b9d7;
		border-color: #25b9d7;
		opacity: 0.85;
	}
	.btn-info:hover {
		background-color: #1fa9c6;
		border-color: #1fa9c6;
		opacity: 1;
	}
	.btn-outline-secondary {
		border-color: #bbcdd2;
		color: #6c868e;
	}
	.btn-cms-save, .btn-cms-cancel {
		padding: 8px 15px;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 13px;
	}
	.nav-tabs .nav-link {
		color: #363a41;
		font-weight: 500;
	}
	.nav-tabs .nav-link.active {
		color: #25b9d7;
		border-bottom: 2px solid #25b9d7;
	}
</style>

<div class="main-panel">
	<div class="content-wrapper">
		
		<!-- Page Header -->
		<div class="page-header-bar">
			<div class="d-flex justify-content-between align-items-center">
				<div>
					<h4><i class="typcn typcn-document-text"></i> CMS Page Editor</h4>
					<nav aria-label="breadcrumb">
						<ol class="breadcrumb mb-0">
							<li class="breadcrumb-item"><a href="<?php echo $base_url; ?>index.php/C_other_pages/open_listingform">Pages</a></li>
							<li class="breadcrumb-item active"><?php echo $page_title; ?></li>
						</ol>
					</nav>
				</div>
				<div>
					<?php 
					$slug = $page_slug;
					$method = ucfirst(str_replace('-', '', $slug));
					if ($slug == 'about-us') $method = 'Aboutus';
					else if ($slug == 'home') $method = 'Home';
					else if ($slug == 'contact-us') $method = 'Contactus';
					$view_url = $base_url . '../index.php/C_client_main/' . $method;
					?>
					<a href="<?php echo $view_url; ?>" target="_blank" class="btn btn-light btn-sm">
						<i class="typcn typcn-eye"></i> Preview Page
					</a>
				</div>
			</div>
		</div>

		<form id="cmsForm" method="post" enctype="multipart/form-data">
			<input type="hidden" name="page_slug" value="<?php echo $page_slug; ?>">
			
			<div class="row">
				<!-- Main Content Column -->
				<div class="col-lg-12">
					
					<!-- Page Content Section -->
					<div class="cms-form-section">
						<div class="cms-section-header">
							<i class="typcn typcn-edit"></i> Page Content
						</div>
						<div class="cms-section-body">
							<div class="form-group">
								<label>Page Title <span class="text-danger">*</span></label>
								<input type="text" class="form-control form-control-lg" name="title" id="page_title" 
									value="<?php echo htmlspecialchars($page_data['title'] ?? ''); ?>" 
									placeholder="Enter page title" required>
							</div>

							<div class="form-group">
								<label>Page Content <span class="text-danger">*</span></label>
								<textarea class="form-control" name="content" id="page_content" rows="20" 
									placeholder="Enter your page content here..."><?php echo htmlspecialchars($page_data['content'] ?? ''); ?></textarea>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Slider Images Section (Home Page Only) -->
			<?php if($page_slug == 'home'): ?>
			<div class="row">
				<div class="col-lg-12">
					<div class="cms-form-section mt-3">
						<div class="cms-section-header">
							<i class="typcn typcn-image"></i> Slider Images (Home Page Only)
						</div>
						<div class="cms-section-body">
							<p class="text-muted mb-3">Add unlimited images for the home page slider (any format: jpg, png, gif, etc.)</p>
							
							<!-- Slider Images List -->
							<div id="sliderImagesList">
								<?php 
								$slider_images = isset($page_data['slider_images']) ? json_decode($page_data['slider_images'], true) : [];
								if(empty($slider_images)) {
									$slider_images = ['assets/images/slider1.jpg', 'assets/images/slider2.jpg', 'assets/images/slider3.jpg'];
								}
								foreach($slider_images as $index => $image): 
								?>
								<div class="slider-image-item mb-3 p-3" style="border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">
									<div class="d-flex align-items-center gap-2">
										<span class="badge bg-secondary"><?php echo $index + 1; ?></span>
										<input type="text" class="form-control slider-image-path" name="slider_images[]" 
											value="<?php echo htmlspecialchars($image); ?>" readonly>
										<button type="button" class="btn btn-sm btn-outline-primary" onclick="browseSliderImage(this)">
											<i class="typcn typcn-folder"></i> Browse
										</button>
										<button type="button" class="btn btn-sm btn-outline-danger" onclick="removeSliderImage(this)">
											<i class="typcn typcn-times"></i> Remove
										</button>
									</div>
								</div>
								<?php endforeach; ?>
							</div>

							<!-- Add New Slider Image Button -->
							<button type="button" class="btn btn-sm btn-success mt-2" onclick="addSliderImage()">
								<i class="typcn typcn-plus"></i> Add New Slider Image
							</button>
						</div>
					</div>
				</div>
			</div>
			<?php endif; ?>

			<!-- Action Buttons (PrestaShop Style) -->
			<div class="row mt-4 mb-5">
				<div class="col-12 text-center">
					<div class="cms-form-section">
						<div class="cms-section-body d-flex justify-content-center align-items-center">
							<a href="<?php echo $base_url; ?>index.php/C_other_pages/open_listingform/" class="btn btn-outline-secondary btn-cms-cancel mx-2 px-4">
								Cancel
							</a>
							<button type="submit" class="btn btn-info btn-cms-save mx-2 px-4" id="savePreviewBtn">
								Save and preview
							</button>
							<button type="submit" class="btn btn-primary btn-cms-save mx-2 px-4">
								Save
							</button>
						</div>
					</div>
				</div>
			</div>

		</form>

	</div>
</div>

<!-- TinyMCE for Content Editor -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"></script>

<script>
var baseUrl = '<?php echo $base_url; ?>';

$(document).ready(function() {
	// Initialize TinyMCE
	tinymce.init({
		selector: '#page_content',
		height: 450,
		base_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2',
		suffix: '.min',
		plugins: 'lists link image table code fullscreen preview emoticons',
		toolbar: 'code | image | preview | undo redo',
		menubar: false,
		branding: false,
		content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.6; }',
		image_title: true,
		automatic_uploads: true,
		relative_urls: false,
		remove_script_host: false,
		convert_urls: false,
		file_picker_types: 'image',
		file_picker_callback: function (cb, value, meta) {
			var width = window.innerWidth * 0.8;
			var height = window.innerHeight * 0.8;
			var left = (window.innerWidth - width) / 2;
			var top = (window.innerHeight - height) / 2;
			
			window.open(baseUrl + 'index.php/C_other_pages/file_manager', 'FileManager', 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
			
			// Listen for message from popup
			const messageListener = function(event) {
				if (event.data.mceAction === 'insertCustomImage') {
					console.log("Selected Image:", event.data.url);
					
					// Fill the source field
					cb(event.data.url, { 
						text: event.data.name,
						alt: event.data.name,
						title: event.data.name
					});
					
					// Remove this listener
					window.removeEventListener('message', messageListener);
				}
			};
			
			window.addEventListener('message', messageListener);
		},
		images_upload_handler: function (blobInfo, progress) {
			return new Promise(function (resolve, reject) {
				var xhr, formData;
				xhr = new XMLHttpRequest();
				xhr.withCredentials = false;
				xhr.open('POST', baseUrl + 'index.php/C_other_pages/upload_image');

				xhr.upload.onprogress = function (e) {
					progress(e.loaded / e.total * 100);
				};

				xhr.onload = function() {
					var json;
					if (xhr.status != 200) {
						reject('HTTP Error: ' + xhr.status);
						return;
					}
					try {
						json = JSON.parse(xhr.responseText);
					} catch (e) {
						reject('Invalid JSON response from server');
						return;
					}
					if (!json || typeof json.url != 'string') {
						reject('Upload failed: Invalid response format');
						return;
					}
					// Resolve with the full URL (handling the base_url prefix if needed)
					var imageUrl = (json.url.indexOf('http') === 0) ? json.url : baseUrl + '../' + json.url;
					resolve(imageUrl);
				};

				xhr.onerror = function () {
					reject('Image upload failed due to a network error.');
				};

				formData = new FormData();
				formData.append('upload_img', blobInfo.blob(), blobInfo.filename());
				xhr.send(formData);
			});
		}
	});

	// Toggle switch text updates
	$('#displayed').on('change', function() {
		$('#displayed_text').text($(this).is(':checked') ? 'Yes' : 'No');
	});
	$('#indexation').on('change', function() {
		$('#indexation_text').text($(this).is(':checked') ? 'Yes' : 'No');
	});

	// Image preview on upload
	$('#banner_file').on('change', function() {
		previewImage(this, 'banner');
	});
	$('#side_file').on('change', function() {
		previewImage(this, 'side');
	});

	// Form submit
	$('#cmsForm').on('submit', function(e) {
		e.preventDefault();
		
		var isPreview = ($(document.activeElement).attr('id') == 'savePreviewBtn');
		
		// Trigger TinyMCE save
		tinymce.triggerSave();
		
		var formData = new FormData(this);
		
		$.ajax({
			url: baseUrl + 'index.php/C_other_pages/save_cms_content',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			dataType: 'json',
			beforeSend: function() {
				$('.btn-cms-save').prop('disabled', true);
				$('.btn-cms-save').first().html('<i class="typcn typcn-refresh"></i> Saving...');
			},
			success: function(response) {
				$('.btn-cms-save').prop('disabled', false);
				$('#savePreviewBtn').text('Save and preview');
				$('.btn-cms-save').last().text('Save');

				if (response.status == 1) {
					showNotification('success', 'Page saved successfully!');
					if (isPreview) {
						window.open('<?php echo $view_url; ?>', '_blank');
					} else {
						setTimeout(function() {
							window.location.href = baseUrl + 'index.php/C_other_pages/open_listingform';
						}, 1000);
					}
				} else {
					showNotification('error', 'Error: ' + response.message);
				}
			},
			error: function() {
				$('.btn-cms-save').prop('disabled', false);
				showNotification('error', 'Failed to save. Please try again.');
			}
		});
	});
});

function previewImage(input, type) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			if (type == 'banner') {
				$('#banner_upload_text').hide();
				if ($('#banner_preview_img').length) {
					$('#banner_preview_img').attr('src', e.target.result);
				} else {
					$(input).closest('.cms-section-body').find('.image-upload-box').html('<img src="' + e.target.result + '" id="banner_preview_img">');
				}
			} else {
				$('#side_upload_text').hide();
				if ($('#side_preview_img').length) {
					$('#side_preview_img').attr('src', e.target.result);
				} else {
					$(input).closest('.cms-section-body').find('.image-upload-box').html('<img src="' + e.target.result + '" id="side_preview_img">');
				}
			}
		}
		reader.readAsDataURL(input.files[0]);
	}
}

function removeBanner() {
	$('input[name="banner_image"]').val('');
	$('.image-upload-box').first().html('<div class="upload-text" id="banner_upload_text"><i class="typcn typcn-cloud-storage"></i>Click to upload banner image<br><small>Recommended: 1920x400px</small></div>');
}

// Add a new slider image row
function addSliderImage() {
	var sliderList = $('#sliderImagesList');
	var count = sliderList.find('.slider-image-item').length + 1;
	
	var html = '<div class="slider-image-item mb-3 p-3" style="border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">' +
		'<div class="d-flex align-items-center gap-2">' +
			'<span class="badge bg-secondary">' + count + '</span>' +
			'<input type="text" class="form-control slider-image-path" name="slider_images[]" value="" placeholder="Select an image..." readonly>' +
			'<button type="button" class="btn btn-sm btn-outline-primary" onclick="browseSliderImage(this)">' +
				'<i class="typcn typcn-folder"></i> Browse' +
			'</button>' +
			'<button type="button" class="btn btn-sm btn-outline-danger" onclick="removeSliderImage(this)">' +
				'<i class="typcn typcn-times"></i> Remove' +
			'</button>' +
		'</div>' +
	'</div>';
	
	sliderList.append(html);
	updateSliderNumbers();
}

// Remove a slider image row
function removeSliderImage(button) {
	if (confirm('Are you sure you want to remove this slider image?')) {
		$(button).closest('.slider-image-item').remove();
		updateSliderNumbers();
	}
}

// Update slider numbers after add/remove
function updateSliderNumbers() {
	$('#sliderImagesList .slider-image-item').each(function(index) {
		$(this).find('.badge').text(index + 1);
	});
}

// Browse for a slider image
function browseSliderImage(button) {
	var width = window.innerWidth * 0.8;
	var height = window.innerHeight * 0.8;
	var left = (window.innerWidth - width) / 2;
	var top = (window.innerHeight - height) / 2;
	
	var inputField = $(button).siblings('.slider-image-path');
	
	window.open(baseUrl + 'index.php/C_other_pages/file_manager', 'FileManager', 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
	
	// Listen for message from popup
	const sliderListener = function(event) {
		if (event.data.mceAction === 'insertCustomImage') {
			// Extract just the relative path (e.g., assets/images/image.jpg)
			var url = event.data.url;
			var relativePath = url;
			
			// Try to extract relative path from full URL
			if (url.indexOf('assets/images/') > -1) {
				relativePath = url.substring(url.indexOf('assets/images/'));
			}
			
			// Fill the slider image field
			inputField.val(relativePath);
			
			// Remove this listener
			window.removeEventListener('message', sliderListener);
		}
	};
	
	window.addEventListener('message', sliderListener);
}

function showNotification(type, message) {
	var alertClass = type == 'success' ? 'alert-success' : 'alert-danger';
	var html = '<div class="alert ' + alertClass + ' alert-dismissible fade show position-fixed" style="top:20px;right:20px;z-index:9999;min-width:300px">' +
		message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
	$('body').append(html);
	setTimeout(function() { $('.alert').fadeOut(); }, 4000);
}
</script>

<?php $this->load->view("include/footer"); ?>
