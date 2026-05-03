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
	'content' => '',
	'side_image' => '',
	'content_2' => '',
	'image_2' => '',
	'content_3' => '',
	'image_3' => ''
];
?>

<style>
	.content-section {
		background: #fff;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 25px;
		margin-bottom: 20px;
	}
	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #495057;
		margin-bottom: 15px;
		padding-bottom: 10px;
		border-bottom: 2px solid #e9ecef;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.image-upload-area {
		border: 2px dashed #ced4da;
		border-radius: 8px;
		padding: 40px 20px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		background: #f8f9fa;
		min-height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.image-upload-area:hover {
		border-color: #007bff;
		background: #e7f3ff;
	}
	.image-upload-area img {
		max-width: 100%;
		max-height: 200px;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}
	.upload-placeholder {
		color: #6c757d;
	}
	.upload-placeholder i {
		font-size: 48px;
		color: #007bff;
		margin-bottom: 10px;
	}
	.label-required {
		color: #dc3545;
		margin-left: 3px;
	}
	.btn-save-content {
		padding: 12px 40px;
		font-size: 16px;
		font-weight: 500;
	}
	.optional-badge {
		font-size: 11px;
		background: #6c757d;
		color: white;
		padding: 2px 8px;
		border-radius: 3px;
		font-weight: normal;
	}
	.remove-image-btn {
		margin-top: 10px;
	}
	
	/* intl-tel-input PERFECT CODEPEN MATCH OVERRIDES */
	.iti { 
		position: relative !important; 
		display: block !important; 
		width: 100% !important; 
	}
	.iti__flag-container { 
		position: absolute !important; 
		top: 0; 
		bottom: 0; 
		left: 0; 
		z-index: 99 !important; 
	}
	.iti__selected-flag {
		background-color: #f8f9fa !important;
		border-right: 1px solid #ced4da !important;
		border-top-left-radius: 4px !important;
		border-bottom-left-radius: 4px !important;
		padding: 0 10px 0 12px !important;
		height: 100% !important;
		display: flex !important;
		align-items: center !important;
	}
	.iti__selected-dial-code { font-weight: 500; color: #495057; margin-left: 6px !important; }
	input.phone-input { 
		padding-left: 100px !important; 
	}
	
	/* Dropdown list sizing and native fixes */
	ul.iti__country-list { 
		box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; 
		border: 1px solid #ced4da !important;
		border-radius: 4px !important;
		max-height: 250px !important;
		overflow-y: auto !important;
		overflow-x: hidden !important;
		z-index: 999999 !important; /* Ensure the list sits on top and is fully clickable */
	}
	/* Prevent theme from injecting bullets if it targets plain ul/li */
	.iti__country-list li { list-style: none !important; list-style-type: none !important; }
	.iti__country-list li:before { content: none !important; display: none !important; }
	.iti__country-list li:hover { background-color: #f1f1f1 !important; cursor: pointer !important; }
</style>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<!-- Header -->
						<div class="d-flex justify-content-between align-items-center mb-4">
							<div>
								<h4 class="card-title mb-1">Edit Page Content</h4>
								<p class="text-muted mb-0">Add text, images, and additional sections</p>
							</div>
							<?php 
							$slug = $page_slug;
							$method = ucfirst(str_replace('-', '', $slug));
							if ($slug == 'about-us') $method = 'Aboutus';
							else if ($slug == 'home') $method = 'Home';
							else if ($slug == 'contact-us') $method = 'Contactus';
							$view_url = $base_url . '../index.php/C_client_main/' . $method;
							?>
							<a href="<?php echo $view_url; ?>" target="_blank" class="btn btn-outline-primary">
								<i class="typcn typcn-eye"></i> Preview Page
							</a>
						</div>

						<form id="contentForm" method="post" enctype="multipart/form-data">
							<input type="hidden" name="page_slug" value="<?php echo $page_slug; ?>">

							<!-- Page Title -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-document-text"></i> Page Title</span>
								</div>
								<input type="text" class="form-control form-control-lg" name="title" 
									value="<?php echo htmlspecialchars($page_data['title'] ?? ''); ?>" 
									placeholder="Enter page title" required>
							</div>

							<?php if ($page_slug != 'contact-us'): ?>
							<!-- Banner Image -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-image"></i> Banner Image</span>
								</div>
								<div class="image-upload-area" onclick="document.getElementById('banner_input').click()">
									<?php if (!empty($page_data['banner_image'])): ?>
										<img src="<?php echo $base_url . '../' . str_replace('\\/', '/', $page_data['banner_image']); ?>" id="banner_preview">
									<?php else: ?>
										<div class="upload-placeholder" id="banner_placeholder">
											<i class="typcn typcn-cloud-storage"></i><br>
											<strong>Click to upload banner image</strong><br>
											<small>Recommended: 1920x400px</small>
										</div>
									<?php endif; ?>
								</div>
								<input type="file" id="banner_input" name="banner_image_file" accept="image/*" style="display:none">
								<input type="hidden" name="banner_image" value="<?php echo $page_data['banner_image'] ?? ''; ?>">
							</div>

							<!-- Main Content Section -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-edit"></i> Main Content<span class="label-required">*</span></span>
								</div>
								<textarea class="form-control tinymce-editor" name="content" rows="8" 
									placeholder="Enter your content here..." required><?php echo htmlspecialchars($page_data['content'] ?? ''); ?></textarea>
							</div>

							<!-- Side Image -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-image-outline"></i> Side Image</span>
									<span class="optional-badge">Optional</span>
								</div>
								<div class="image-upload-area" onclick="document.getElementById('side_input').click()">
									<?php if (!empty($page_data['side_image'])): ?>
										<img src="<?php echo $base_url . '../' . str_replace('\\/', '/', $page_data['side_image']); ?>" id="side_preview">
									<?php else: ?>
										<div class="upload-placeholder" id="side_placeholder">
											<i class="typcn typcn-cloud-storage"></i><br>
											<strong>Click to upload side image</strong>
										</div>
									<?php endif; ?>
								</div>
								<input type="file" id="side_input" name="side_image_file" accept="image/*" style="display:none">
								<input type="hidden" name="side_image" value="<?php echo $page_data['side_image'] ?? ''; ?>">
							</div>

							<!-- Additional Section 2 -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-edit"></i> Additional Content Section 2</span>
									<span class="optional-badge">Optional</span>
								</div>
								<textarea class="form-control tinymce-editor" name="content_2" rows="6" 
									placeholder="Add another content section (optional)"><?php echo htmlspecialchars($page_data['content_2'] ?? ''); ?></textarea>
							</div>

							<!-- Additional Image 2 -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-image-outline"></i> Additional Image 2</span>
									<span class="optional-badge">Optional</span>
								</div>
								<div class="image-upload-area" onclick="document.getElementById('image2_input').click()">
									<?php if (!empty($page_data['image_2'])): ?>
										<img src="<?php echo $base_url . '../' . str_replace('\\/', '/', $page_data['image_2']); ?>" id="image2_preview">
									<?php else: ?>
										<div class="upload-placeholder" id="image2_placeholder">
											<i class="typcn typcn-cloud-storage"></i><br>
											<strong>Click to upload additional image</strong>
										</div>
									<?php endif; ?>
								</div>
								<input type="file" id="image2_input" name="image_2_file" accept="image/*" style="display:none">
								<input type="hidden" name="image_2" value="<?php echo $page_data['image_2'] ?? ''; ?>">
							</div>

							<!-- Additional Section 3 -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-edit"></i> Additional Content Section 3</span>
									<span class="optional-badge">Optional</span>
								</div>
								<textarea class="form-control tinymce-editor" name="content_3" rows="6" 
									placeholder="Add another content section (optional)"><?php echo htmlspecialchars($page_data['content_3'] ?? ''); ?></textarea>
							</div>

							<!-- Additional Image 3 -->
							<div class="content-section">
								<div class="section-title">
									<span><i class="typcn typcn-image-outline"></i> Additional Image 3</span>
									<span class="optional-badge">Optional</span>
								</div>
								<div class="image-upload-area" onclick="document.getElementById('image3_input').click()">
									<?php if (!empty($page_data['image_3'])): ?>
										<img src="<?php echo $base_url . '../' . str_replace('\\/', '/', $page_data['image_3']); ?>" id="image3_preview">
									<?php else: ?>
										<div class="upload-placeholder" id="image3_placeholder">
											<i class="typcn typcn-cloud-storage"></i><br>
											<strong>Click to upload additional image</strong>
										</div>
									<?php endif; ?>
								</div>
								<input type="file" id="image3_input" name="image_3_file" accept="image/*" style="display:none">
								<input type="hidden" name="image_3" value="<?php echo $page_data['image_3'] ?? ''; ?>">
							</div>
							<?php else: ?>
								<!-- CONTACT US LOCATIONS REPEATER -->
								<div class="content-section">
									<div class="section-title">
										<span><i class="typcn typcn-map"></i> Contact Details</span>
									</div>
									<div id="locations-container">
										<!-- Dynamic locations will be loaded here -->
									</div>
									
									<div class="row mt-2">
										<div class="col-md-3 mb-2">
											<button type="button" class="btn btn-success w-100 p-2 text-white" style="background-color: #218838; border-color: #1e7e34; font-size:15px;" onclick="addContactBlock('Get in Touch', 'address', '')"><i class="typcn typcn-location"></i> + Add Location</button>
										</div>
										<div class="col-md-3 mb-2">
											<button type="button" class="btn btn-info w-100 p-2 text-white" style="background-color: #17a2b8; border-color: #117a8b; font-size:15px;" onclick="addContactBlock('Mobile', 'phone', '')"><i class="typcn typcn-phone"></i> + Add Phone</button>
										</div>
										<div class="col-md-3 mb-2">
											<button type="button" class="btn w-100 p-2 text-white" style="background-color: #25D366; border-color: #1ebe57; font-size:15px;" onclick="addContactBlock('WhatsApp', 'whatsapp', '')"><i class="typcn typcn-social-at-circular"></i> + Add WhatsApp</button>
										</div>
										<div class="col-md-3 mb-2">
											<button type="button" class="btn btn-primary w-100 p-2 text-white" style="background-color: #007bff; border-color: #0062cc; font-size:15px;" onclick="addContactBlock('Email', 'email', '')"><i class="typcn typcn-mail"></i> + Add Email</button>
										</div>
									</div>

									<textarea id="locations_json" name="content_4" style="display:none;"><?php echo htmlspecialchars($page_data['content_4'] ?? '[]'); ?></textarea>
								</div>

								<!-- MOBILE APP NUMBERS SECTION -->
								<div class="content-section" style="border-left: 4px solid #25D366; margin-top: 10px;">
									<div class="section-title" style="border-bottom: 2px solid #d4f5e1;">
										<span><i class="typcn typcn-device-phone" style="color:#25D366;"></i>&nbsp; Mobile App Quick Links </span>
									</div>
									<div id="mobile-app-container">
										<!-- Mobile app phone/whatsapp blocks will be loaded here -->
									</div>

									<div class="row mt-2">
										<div class="col-md-6 mb-2">
											<button type="button" class="btn btn-info w-100 p-2 text-white" style="background-color: #17a2b8; border-color: #117a8b; font-size:15px;" onclick="addMobileBlock('Mobile', 'phone', '')"><i class="typcn typcn-phone"></i> + Add Phone</button>
										</div>
										<div class="col-md-6 mb-2">
											<button type="button" class="btn w-100 p-2 text-white" style="background-color: #25D366; border-color: #1ebe57; font-size:15px;" onclick="addMobileBlock('WhatsApp', 'whatsapp', '')"><i class="typcn typcn-social-at-circular"></i> + Add WhatsApp</button>
										</div>
									</div>

									<textarea id="mobile_app_json" name="content_5" style="display:none;"><?php echo htmlspecialchars($page_data['content_5'] ?? '[]'); ?></textarea>
								</div>
							<?php endif; ?>

							<!-- Action Buttons -->
							<div class="row mt-4 mb-4" style="background: #fdfdfd; padding: 20px; border: 1px solid #eaeaea; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin: 0;">
								<div class="col-3 pl-0">
									<a href="<?php echo $base_url; ?>index.php/C_other_pages/open_listingform" class="btn w-100" style="background-color: #fff; border: 1px solid #ced4da; padding: 12px; font-weight: 500; font-size: 14px; color: #555; text-transform: uppercase;">CANCEL</a>
								</div>
								<div class="col-5">
									<button type="button" id="btnSavePreview" class="btn w-100 text-white" style="background-color: #3bc0c3; border-color: #3bc0c3; padding: 12px; font-weight: 500; font-size: 14px; text-transform: uppercase; box-shadow: none;">SAVE AND PREVIEW</button>
								</div>
								<div class="col-4 pr-0">
									<button type="submit" class="btn-save-content btn w-100 text-white" style="background-color: #3bc0c3; border-color: #3bc0c3; padding: 12px; font-weight: 500; font-size: 14px; text-transform: uppercase; box-shadow: none;">SAVE</button>
								</div>
							</div>
						</form>

					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- TinyMCE -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"></script>

<!-- intl-tel-input -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/css/intlTelInput.css">
<script src="https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/intlTelInput.min.js"></script>

<script>
var baseUrl = '<?php echo $base_url; ?>';

$(document).ready(function() {
	tinymce.init({
		selector: '.tinymce-editor',
		height: 250,
		menubar: false,
		plugins: 'lists link code',
		toolbar: 'code | undo redo | bold italic underline | bullist numlist | link',
		branding: false,
		statusbar: false
	});

	// Image previews
	$('#banner_input').on('change', function() { previewImage(this, 'banner'); });
	$('#side_input').on('change', function() { previewImage(this, 'side'); });
	$('#image2_input').on('change', function() { previewImage(this, 'image2'); });
	$('#image3_input').on('change', function() { previewImage(this, 'image3'); });

	// Form submission
	var autoPreview = false;
	$('#btnSavePreview').click(function(e) {
		e.preventDefault();
		autoPreview = true;
		$('#contentForm').submit();
	});

	$('#contentForm').on('submit', function(e) {
		e.preventDefault();
		tinymce.triggerSave();
		if (typeof buildLocationsJson === 'function') {
			var valid = buildLocationsJson();
			if (!valid) return;
		}
		
		var formData = new FormData(this);
		
		$.ajax({
			url: baseUrl + 'index.php/C_other_pages/save_content_only',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			dataType: 'json',
			beforeSend: function() {
				$('.btn-save-content').first().html('<i class="typcn typcn-refresh"></i> Saving...').prop('disabled', true);
				$('#btnSavePreview').html('<i class="typcn typcn-refresh"></i> Saving...').prop('disabled', true);
			},
			success: function(response) {
				$('.btn-save-content').first().html('<i class="typcn typcn-tick"></i> Save Changes').prop('disabled', false);
				$('#btnSavePreview').html('<i class="typcn typcn-tick"></i> <i class="typcn typcn-eye"></i> Save & Preview').prop('disabled', false);
				
				if (response.status == 1) {
					showAlert('success', 'All content saved successfully!');
					if (autoPreview) {
						window.open('<?php echo $view_url; ?>', '_blank');
						autoPreview = false;
					} else {
						setTimeout(function() {
							window.location.href = baseUrl + 'index.php/C_other_pages/open_listingform';
						}, 1000);
					}
				} else {
					showAlert('danger', 'Error: ' + response.message);
					autoPreview = false;
				}
			},
			error: function(xhr, status, error) {
				$('.btn-save-content').first().html('<i class="typcn typcn-tick"></i> Save All Changes').prop('disabled', false);
				showAlert('danger', 'Failed to save! Server says: ' + error + '. Check console for details.');
				console.error("AJAX Error response: ", xhr.responseText);
			}
		});
	});
});

function previewImage(input, type) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var previewId = type + '_preview';
			var placeholderId = type + '_placeholder';
			
			$('#' + placeholderId).hide();
			if ($('#' + previewId).length) {
				$('#' + previewId).attr('src', e.target.result).show();
			} else {
				$(input).closest('.content-section').find('.image-upload-area').html('<img src="' + e.target.result + '" id="' + previewId + '">');
			}
		}
		reader.readAsDataURL(input.files[0]);
	}
}

function showAlert(type, message) {
	var alertHtml = '<div class="alert alert-' + type + ' alert-dismissible fade show position-fixed" style="top:80px;right:20px;z-index:9999;min-width:350px;">' +
		'<strong>' + message + '</strong>' +
		'<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
		'</div>';
	$('body').append(alertHtml);
	setTimeout(function() {
		$('.alert').fadeOut(function() { $(this).remove(); });
	}, 3000);
}

// DYNAMIC CONTACT STRIP LOGIC
var blockCount = 0;

function loadExistingLocations() {
	if (!document.getElementById('locations_json')) return;
	var existing = $('#locations_json').val();
	try {
		var locs = JSON.parse(existing);
		if (!Array.isArray(locs) || locs.length == 0) {
			addContactBlock(); // init empty
			return;
		}
		locs.forEach(function(l) {
			if (l.title !== undefined) {
				// new format
				addContactBlock(l.title, l.type, l.value);
			} else {
				// legacy mapping
				if (l.address) addContactBlock('Get in Touch', 'address', l.address);
				if (l.phone) addContactBlock('Booking', 'phone', l.phone);
				if (l.email) addContactBlock('Email', 'email', l.email);
			}
		});
	} catch(e) {
		addContactBlock();
	}
}

function addContactBlock(title = '', type = 'phone', value = '') {
	blockCount++;
	var isPhone = (type === 'phone' || type === 'whatsapp' || type === 'fax');
	var isMulti = (isPhone || type === 'email');
	
	var inputHtml = '';
	if (isMulti) {
	    var vals = value ? value.split('\n') : [''];
	    if (vals.length === 0) vals = [''];
	    
	    vals.forEach(function(val, index) {
	        var fid = 'fld_' + Math.random().toString(36).substr(2, 9);
	        inputHtml += '<div class="d-flex multi-item mb-2 align-items-center">';
	        
            var btnHtml = '';
            if (index === 0) {
                btnHtml = '<button type="button" class="btn btn-outline-success btn-sm ms-2" style="border:1px solid #28a745; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="addMultiItem(this)"><i class="typcn typcn-plus"></i></button>';
            } else {
                var destroyCall = type === 'email' ? '' : `destroyIti($(this).parent().find('input')[0]); `;
                btnHtml = `<button type="button" class="btn btn-outline-danger btn-sm ms-2" style="border:1px solid #dc3545; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="${destroyCall}$(this).parent().remove()"><i class="typcn typcn-minus"></i></button>`;
            }

	        if (type === 'email') {
	            inputHtml += `<input type="email" class="form-control block-value email-input" placeholder="Email address" value="${val.replace(/"/g, '&quot;')}" onblur="onContactBlur(this)">`;
	        } else {
	            inputHtml += `<input type="tel" class="form-control block-value phone-input" id="${fid}" placeholder="Phone number" value="${val.replace(/"/g, '&quot;')}" oninput="onContactInput(this)">`;
	        }
            inputHtml += btnHtml + '</div>';
	    });
	} else {
	    inputHtml = `<textarea class="form-control block-value" rows="2" placeholder="Enter details..." oninput="onContactInput(this)" onblur="onContactBlur(this)">${value}</textarea>`;
	}

	var html = `
	<div class="card mb-3 block-item" id="block_${blockCount}" draggable="true" ondragstart="dragBlock(event)" ondrop="dropBlock(event)" ondragover="allowDropBlock(event)" style="cursor: move; border-left: 4px solid #218838;">
		<div class="card-body p-3 position-relative">
			<div title="Drag to reorder" style="position: absolute; right: 8px; top: 8px; color: #aaa;"><i class="typcn typcn-arrow-move"></i></div>
			<div class="row align-items-center">
				<div class="col-md-2">
					<label class="mb-1 text-muted"><small>Title/Header</small></label>
					<input type="text" class="form-control block-title" placeholder="e.g. Booking" value="${title.replace(/"/g, '&quot;')}">
				</div>
				<div class="col-md-3">
					<label class="mb-1 text-muted"><small>Icon/Type</small></label>
					<select class="form-control block-type" onchange="onContactTypeChange(this)">
						<option value="address" ${type=='address'?'selected':''}>📍 Location Address</option>
						<option value="phone" ${type=='phone'?'selected':''}>📞 Phone Number</option>
						<option value="email" ${type=='email'?'selected':''}>✉️ Email ID</option>
						<option value="whatsapp" ${type=='whatsapp'?'selected':''}>💬 WhatsApp</option>
						<option value="fax" ${type=='fax'?'selected':''}>📠 Fax Number</option>
						<option value="gst" ${type=='gst'?'selected':''}>📄 GST / Document</option>
					</select>
				</div>
				<div class="col-md-6">
					<label class="mb-1 text-muted"><small>Details / Value</small></label>
					<div class="input-container">${inputHtml}</div>
					<small class="text-danger field-error" style="display:none;"></small>
				</div>
				<div class="col-md-1 text-center mt-3">
					<button type="button" class="btn btn-danger btn-sm" onclick="$('#block_${blockCount}').find('.phone-input').each(function(){destroyIti(this);}); $('#block_${blockCount}').remove()"><i class="typcn typcn-trash"></i></button>
				</div>
			</div>
		</div>
	</div>`;
	$('#locations-container').append(html);
	if (isMulti && isPhone) {
		$('#block_' + blockCount).find('.phone-input').each(function() {
		    initIti(this);
		});
	}
}

var itiInstances = {};

function initIti(el) {
	if (itiInstances[el.id]) return; 
	var iti = window.intlTelInput(el, {
		separateDialCode: true,
		initialCountry: "in",
		utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js",
	});
	itiInstances[el.id] = iti;
}

function destroyIti(el) {
	if (itiInstances[el.id]) {
		itiInstances[el.id].destroy();
		delete itiInstances[el.id];
	}
}

function onContactTypeChange(selectEl) {
	var type = $(selectEl).val();
	var row = $(selectEl).closest('.row');
	var container = row.find('.input-container');
	
	container.find('.phone-input').each(function() {
		destroyIti(this);
	});

	container.empty();
	var errEl = row.find('.field-error');
	errEl.hide().text('');

	var isMulti = (type === 'phone' || type === 'whatsapp' || type === 'fax' || type === 'email');
	if (isMulti) {
	    var uId = 'fld_' + Math.random().toString(36).substr(2, 9);
	    var inputHtml = '<div class="d-flex multi-item mb-2 align-items-center">';
	    if (type === 'email') {
	        inputHtml += '<input type="email" class="form-control block-value email-input" placeholder="Email address" onblur="onContactBlur(this)">';
	    } else {
	        inputHtml += '<input type="tel" class="form-control block-value phone-input" id="'+uId+'" placeholder="Phone number" oninput="onContactInput(this)">';
	    }
        inputHtml += '<button type="button" class="btn btn-outline-success btn-sm ms-2" style="border:1px solid #28a745; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="addMultiItem(this)"><i class="typcn typcn-plus"></i></button></div>';
		
		container.html(inputHtml);
		if (type !== 'email') {
		    initIti(container.find('input')[0]);
		}
	} else {
		container.html('<textarea class="form-control block-value" rows="2" placeholder="Enter details..." oninput="onContactInput(this)" onblur="onContactBlur(this)"></textarea>');
	}
}

function addMultiItem(btn, isMobileApp = false) {
    var container = $(btn).closest('.input-container');
    var blockType = isMobileApp 
        ? $(btn).closest('.row').find('.mobile-block-type').val() 
        : $(btn).closest('.row').find('.block-type').val();
    
    var uId = 'fld_' + Math.random().toString(36).substr(2, 9);
    var inputClass = isMobileApp ? "form-control mobile-block-value phone-input" : "form-control block-value phone-input";
    if (blockType === 'email') {
        inputClass = "form-control block-value email-input";
    }
    
    var html = '<div class="d-flex multi-item mb-2 align-items-center">';
    if (blockType === 'email') {
        html += '<input type="email" class="'+inputClass+'" placeholder="Email address" onblur="onContactBlur(this)">';
        html += '<button type="button" class="btn btn-outline-danger btn-sm ms-2" style="border:1px solid #dc3545; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="$(this).parent().remove()"><i class="typcn typcn-minus"></i></button></div>';
    } else {
        html += '<input type="tel" class="'+inputClass+'" id="'+uId+'" placeholder="Phone number" oninput="onContactInput(this)">';
        html += '<button type="button" class="btn btn-outline-danger btn-sm ms-2" style="border:1px solid #dc3545; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="if(this.parentNode.querySelector(\'input\').id) destroyIti(document.getElementById(this.parentNode.querySelector(\'input\').id)); $(this).parent().remove()"><i class="typcn typcn-minus"></i></button></div>';
    }
    
    container.append(html);
    
    if (blockType === 'phone' || blockType === 'whatsapp' || blockType === 'fax') {
        initIti(document.getElementById(uId));
    }
}

function onContactInput(el) {
	var isPhone = $(el).hasClass('phone-input');
	if (isPhone) {
		// Only allow numbers
		el.value = el.value.replace(/[^0-9]/g, '');
		
		// Clear errors
		$(el).css('border-color', '');
		$(el).closest('.col-md-5').find('.field-error').hide();
		$(el).closest('.col-md-4').find('.field-error').hide();
	}
}

function onContactBlur(el) {
	var type = $(el).closest('.row').find('.block-type').val();
	if (type === 'email') {
		validateEmailInput(el);
	}
}

// Drag functionality for contact blocks
var draggedBlock = null;

function dragBlock(ev) {
	draggedBlock = ev.target.closest('.block-item');
	if(ev.dataTransfer) {
		ev.dataTransfer.setData("text/plain", draggedBlock.id);
		ev.dataTransfer.effectAllowed = "move";
	}
	setTimeout(function() {
		draggedBlock.style.opacity = '0.5';
	}, 0);
}

function allowDropBlock(ev) {
	ev.preventDefault(); 
	if(ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
}

function dropBlock(ev) {
	ev.preventDefault();
	var targetBlock = ev.target.closest('.block-item');
	if (draggedBlock && targetBlock && draggedBlock !== targetBlock) {
		var container = document.getElementById('locations-container');
		var children = Array.from(container.children);
		var draggedIndex = children.indexOf(draggedBlock);
		var targetIndex = children.indexOf(targetBlock);
		
		if (draggedIndex < targetIndex) {
			targetBlock.parentNode.insertBefore(draggedBlock, targetBlock.nextSibling);
		} else {
			targetBlock.parentNode.insertBefore(draggedBlock, targetBlock);
		}
	}
	if (draggedBlock) draggedBlock.style.opacity = '1';
}

document.addEventListener('dragend', function(e) {
	if (e.target && e.target.classList && e.target.classList.contains('block-item')) {
		e.target.style.opacity = '1';
	}
});

// ── Email: validate format on blur ────────────────────────────────────────
function isValidEmail(val) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function validateEmailInput(el) {
	var val   = $(el).val().trim();
	var errEl = $(el).closest('.col-md-5').find('.field-error');
	if (val === '') { $(el).css('border-color', ''); errEl.hide(); return true; }
	if (!isValidEmail(val)) {
		$(el).css('border-color', '#dc3545');
		errEl.text('⚠ Enter a valid email (e.g. name@example.com)').show();
		return false;
	}
	$(el).css('border-color', '#28a745'); errEl.hide(); return true;
}

// ── Used at save time ─────────────────────────────────────────────────────
function validateContactField(el) {
	var type  = $(el).closest('.row').find('.block-type').val();
	var val   = $(el).val().trim();
	var errEl = $(el).closest('.col-md-5').find('.field-error');
	if (val === '') { $(el).css('border-color', ''); errEl.hide(); return true; }
	
	if (type === 'phone' || type === 'whatsapp' || type === 'fax') {
		var iti = itiInstances[el.id];
		if (iti && !iti.isValidNumber()) {
			$(el).css('border-color', '#dc3545');
			errEl.text('⚠ Invalid country number format').show();
			return false;
		}
		$(el).css('border-color', '#28a745'); errEl.hide(); return true;
	} else if (type === 'email') {
		return validateEmailInput(el);
	}
	return true;
}

function validateMobileField(el) {
	var val   = $(el).val().trim();
	var errEl = $(el).closest('.col-md-4').find('.field-error');
	if (val === '') { $(el).css('border-color', ''); errEl.hide(); return true; }
	
	var iti = itiInstances[el.id];
	if (iti && !iti.isValidNumber()) {
		$(el).css('border-color', '#dc3545');
		errEl.text('⚠ Invalid country number format').show();
		return false;
	}
	$(el).css('border-color', '#28a745'); errEl.hide(); return true;
}

function buildLocationsJson() {
	if (!document.getElementById('locations_json')) return true;
	var arr = [];
	var hasError = false;
	$('#locations-container .block-item').each(function() {
		var type     = $(this).find('.block-type').val();
		var isMulti  = (type === 'phone' || type === 'whatsapp' || type === 'fax' || type === 'email');
		
		var finalVals = [];
		if (isMulti) {
		    $(this).find('.block-value').each(function() {
		        var el = this;
		        if (!validateContactField(el)) hasError = true;
		        var val = $(el).val().trim();
		        if (val === '') return; // skip empty
		        if (type !== 'email') {
		            var iti = itiInstances[el.id];
		            if (iti) {
		                if (!iti.isValidNumber()) {
		                    $(el).css('border-color','#dc3545');
		                    hasError = true;
		                } else {
		                    val = iti.getNumber();
		                }
		            }
		        }
		        finalVals.push(val);
		    });
		} else {
		    var el = $(this).find('.block-value')[0];
		    if (!validateContactField(el)) hasError = true;
		    finalVals.push($(el).val());
		}
		
		var finalVal = finalVals.join('\n');
		
		arr.push({
			title: $(this).find('.block-title').val(),
			type:  type,
			value: finalVal
		});
	});
	if (hasError) {
		showAlert('danger', '⚠ Please fix validation errors before saving.');
		return false;
	}
	$('#locations_json').val(JSON.stringify(arr));

	// Also build mobile app JSON
	return buildMobileJson();
}

// ─── Mobile App Numbers ──────────────────────────────────────────────────────
var mobileBlockCount = 0;

function addMobileBlock(title, type, value) {
	title = title || '';
	type  = type  || 'phone';
	value = value || '';
	mobileBlockCount++;
	var borderColor = type === 'whatsapp' ? '#25D366' : '#17a2b8';
	
	var vals = value ? value.split('\n') : [''];
	if (vals.length === 0) vals = [''];
	
	var inputHtml = '';
	vals.forEach(function(val, index) {
	    var fid = 'mphone_' + Math.random().toString(36).substr(2, 9);
	    inputHtml += '<div class="d-flex multi-item mb-2 align-items-center">';
	    inputHtml += `<input type="tel" class="form-control mobile-block-value phone-input" id="${fid}" placeholder="Phone number" value="${val.replace(/"/g, '&quot;')}" oninput="onContactInput(this)">`;
	    
        if (index === 0) {
            inputHtml += '<button type="button" class="btn btn-outline-success btn-sm ms-2" style="border:1px solid #28a745; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="addMultiItem(this, true)"><i class="typcn typcn-plus"></i></button></div>';
        } else {
            inputHtml += '<button type="button" class="btn btn-outline-danger btn-sm ms-2" style="border:1px solid #dc3545; padding: 4px 0; width: 32px; font-size: 14px; border-radius: 4px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center;" onclick="if(document.getElementById(\''+fid+'\')) destroyIti(document.getElementById(\''+fid+'\')); $(this).parent().remove()"><i class="typcn typcn-minus"></i></button></div>';
        }
	});
	
	var html = `
	<div class="card mb-3 mobile-block-item" id="mblock_${mobileBlockCount}" style="border-left: 4px solid ${borderColor};">
		<div class="card-body p-3">
			<div class="row align-items-center">
				<div class="col-md-3">
					<label class="mb-1 text-muted"><small>Title/Label</small></label>
					<input type="text" class="form-control mobile-block-title" placeholder="e.g. Mobile" value="${title.replace(/"/g, '&quot;')}">
				</div>
				<div class="col-md-2">
					<label class="mb-1 text-muted"><small>Type</small></label>
					<select class="form-control mobile-block-type" onchange="var cc=$(this).closest('.row'); cc.find('.mobile-block-value').css('border-color',''); cc.find('.field-error').hide();">
						<option value="phone"    ${type==='phone'?'selected':''}>📞 Phone Number</option>
						<option value="whatsapp" ${type==='whatsapp'?'selected':''}>💬 WhatsApp</option>
					</select>
				</div>
				<div class="col-md-6">
					<label class="mb-1 text-muted"><small>Phone Number</small></label>
					<div class="input-container">${inputHtml}</div>
					<small class="text-danger field-error" style="display:none;"></small>
				</div>
				<div class="col-md-1 text-center mt-3">
					<button type="button" class="btn btn-danger btn-sm" onclick="$('#mblock_${mobileBlockCount}').find('.phone-input').each(function(){destroyIti(this);}); $('#mblock_${mobileBlockCount}').remove()"><i class="typcn typcn-trash"></i></button>
				</div>
			</div>
		</div>
	</div>`;
	$('#mobile-app-container').append(html);
	$('#mblock_' + mobileBlockCount).find('.phone-input').each(function() {
	    initIti(this);
	});
}

function buildMobileJson() {
	if (!document.getElementById('mobile_app_json')) return true;
	var arr = [];
	var hasError = false;
	$('#mobile-app-container .mobile-block-item').each(function() {
	    var finalVals = [];
	    $(this).find('.mobile-block-value').each(function() {
	        var el = this;
	        if (!validateMobileField(el)) hasError = true;
	        var val = $(el).val().trim();
	        if (val === '') return;
	        var iti = itiInstances[el.id];
	        if (iti) {
	            if (!iti.isValidNumber()) {
	                $(el).css('border-color', '#dc3545');
	                hasError = true;
	            } else {
	                val = iti.getNumber();
	            }
	        }
	        finalVals.push(val);
	    });
		
		arr.push({
			title: $(this).find('.mobile-block-title').val(),
			type:  $(this).find('.mobile-block-type').val(),
			value: finalVals.join('\n')
		});
	});
	if (hasError) {
		showAlert('danger', '⚠ Please fix validation errors in Mobile App Numbers before saving.');
		return false;
	}
	$('#mobile_app_json').val(JSON.stringify(arr));
	return true;
}

function loadExistingMobileBlocks() {
	if (!document.getElementById('mobile_app_json')) return;
	var existing = $('#mobile_app_json').val();
	try {
		var items = JSON.parse(existing);
		if (Array.isArray(items) && items.length > 0) {
			items.forEach(function(item) {
				addMobileBlock(item.title, item.type, item.value);
			});
		}
	} catch(e) { /* ignore parse errors */ }
}

$(document).ready(function() {
	loadExistingLocations();
	loadExistingMobileBlocks();
});

</script>

<?php $this->load->view("include/footer"); ?>
