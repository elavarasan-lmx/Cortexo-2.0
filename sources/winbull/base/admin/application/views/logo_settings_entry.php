<?php $this->load->view('include/header'); ?>

<style>
    .logo-settings-wrapper {
        padding: 15px;
    }
    .logo-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        margin-bottom: 24px;
        overflow: hidden;
        border: 1px solid #e8eef3;
        transition: box-shadow 0.3s ease;
    }
    .logo-card:hover {
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .logo-card-header {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .logo-card-header h5 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .logo-card-header .badge-info {
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 3px 12px;
        font-size: 11px;
        font-weight: 400;
    }
    .logo-card-body {
        padding: 24px;
    }
    .preview-container {
        background: #f8f9fc;
        border: 2px dashed #d0d5dd;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: all 0.3s ease;
        margin-bottom: 16px;
        position: relative;
    }
    .preview-container:hover {
        border-color: #1a237e;
        background: #f0f2ff;
    }
    .preview-container img {
        max-width: 200px;
        max-height: 120px;
        object-fit: contain;
        border-radius: 4px;
    }
    .preview-container.favicon-preview img {
        max-width: 100px;
        max-height: 100px;
        image-rendering: pixelated;
    }
    .preview-container .no-image {
        color: #98a6ad;
        font-size: 14px;
    }
    .preview-container .no-image i {
        font-size: 40px;
        display: block;
        margin-bottom: 8px;
        color: #c5cdd5;
    }
    .upload-area {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }
    .upload-area .form-control {
        flex: 1;
        min-width: 200px;
        border-radius: 8px;
        border: 1px solid #d0d5dd;
        padding: 8px 12px;
        font-size: 13px;
    }
    .upload-area .form-control:focus {
        border-color: #1a237e;
        box-shadow: 0 0 0 3px rgba(26,35,126,0.1);
    }
    .btn-upload {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }
    .btn-upload:hover {
        background: linear-gradient(135deg, #283593 0%, #3949ab 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26,35,126,0.3);
        color: #fff;
    }
    .btn-reset {
        background: #fff;
        color: #dc3545;
        border: 1px solid #dc3545;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }
    .btn-reset:hover {
        background: #dc3545;
        color: #fff;
        transform: translateY(-1px);
    }
    .file-info {
        font-size: 11px;
        color: #6c757d;
        margin-top: 8px;
    }
    .file-info i {
        color: #1a237e;
    }
    .current-file {
        display: inline-block;
        background: #e8f5e9;
        color: #2e7d32;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        margin-top: 4px;
    }
    .toggle-section {
        background: #f8f9fc;
        border-radius: 10px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        border: 1px solid #e8eef3;
    }
    .toggle-section label {
        font-weight: 600;
        color: #344054;
        margin: 0;
        font-size: 14px;
    }
    .toggle-section .form-text {
        font-size: 12px;
        color: #6c757d;
        margin-top: 2px;
    }
    .form-switch {
        display: inline-block;
    }
    .form-switch .form-check-input {
        width: 44px;
        height: 24px;
        cursor: pointer;
        border-radius: 12px;
        border: 2px solid #d0d5dd;
        background-color: #d0d5dd;
        transition: all 0.3s ease;
    }
    .form-switch .form-check-input:checked {
        background-color: #1a237e;
        border-color: #1a237e;
    }
    .page-title-box {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff;
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .page-title-box h4 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .page-title-box .subtitle {
        font-size: 13px;
        opacity: 0.8;
        margin-top: 4px;
    }
    .action-btns {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 12px;
    }
    /* Toast override for this page */
    .toast-success { background-color: #2e7d32 !important; }
    .toast-error { background-color: #c62828 !important; }

    @media (max-width: 768px) {
        .upload-area {
            flex-direction: column;
        }
        .upload-area .form-control {
            width: 100%;
        }
        .page-title-box {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>

<div class="logo-settings-wrapper">
    <!-- Page Title -->
    <div class="page-title-box">
        <div>
            <h4><i class="bi bi-image"></i> Logo & Icon Settings</h4>
            <div class="subtitle">Manage website and admin panel logos, and browser favicon</div>
        </div>
    </div>

    <!-- Enable/Disable Toggle -->
    <div class="toggle-section">
        <div>
            <label>Enable Custom Logos</label>
            <div class="form-text">When disabled, the system will use default logos</div>
        </div>
        <div class="form-switch form-check">
            <input class="form-check-input" type="checkbox" id="toggleCustomLogo"
                <?php echo (isset($settings['custom_logo_enabled']) && $settings['custom_logo_enabled'] == 1) ? 'checked' : ''; ?>>
        </div>
    </div>

    <div class="row">
        <!-- Website Logo -->
        <div class="col-md-6">
            <div class="logo-card">
                <div class="logo-card-header">
                    <h5><i class="bi bi-globe2"></i> Website Logo (Frontend)</h5>
                    <span class="badge-info">Recommended: PNG/SVG</span>
                </div>
                <div class="logo-card-body">
                    <div class="preview-container" id="websiteLogoPreview">
                        <?php
                        $web_logo = isset($settings['website_logo']) ? $settings['website_logo'] : '';
                        $web_logo_path = dirname(base_url()) . '/assets/images/' . $web_logo;
                        if (!empty($web_logo)) { ?>
                            <img src="<?php echo $web_logo_path; ?>?t=<?php echo time(); ?>" alt="Website Logo" id="websiteLogoImg">
                            <div class="current-file"><i class="bi bi-check-circle"></i> <?php echo $web_logo; ?></div>
                        <?php } else { ?>
                            <div class="no-image">
                                <i class="bi bi-image"></i>
                                <span>No website logo uploaded</span>
                                <small>Using default: assets/images/logo.png</small>
                            </div>
                        <?php } ?>
                    </div>

                    <form action="<?php echo base_url(); ?>index.php/C_logo_settings/upload_website_logo" method="post" enctype="multipart/form-data">
                        <div class="upload-area">
                            <input type="file" name="website_logo" class="form-control" accept=".png,.jpg,.jpeg,.svg"
                                onchange="previewImage(this, 'websiteLogoPreview', 'websiteLogoImg')" required>
                            <button type="submit" class="btn btn-upload">
                                <i class="bi bi-cloud-arrow-up"></i> Upload
                            </button>
                            <?php if (!empty($web_logo)) { ?>
                                <button type="button" class="btn btn-reset" onclick="resetLogo('website_logo')">
                                    <i class="bi bi-arrow-counterclockwise"></i> Reset
                                </button>
                            <?php } ?>
                        </div>
                        <div class="file-info">
                            <i class="bi bi-info-circle"></i> Allowed: PNG, JPG, JPEG, SVG | Max: 5MB
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Admin Logo (Auto-synced with Website Logo) -->
        <div class="col-md-6">
            <div class="logo-card">
                <div class="logo-card-header" style="background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);">
                    <h5><i class="bi bi-shield-lock"></i> Admin Panel Logo (Backend)</h5>
                    <span class="badge-info">Auto-synced</span>
                </div>
                <div class="logo-card-body">
                    <div class="preview-container" id="adminLogoPreview">
                        <?php
                        $web_logo_for_admin = isset($settings['website_logo']) ? $settings['website_logo'] : '';
                        $admin_preview_path = dirname(base_url()) . '/assets/images/' . $web_logo_for_admin;
                        if (!empty($web_logo_for_admin)) { ?>
                            <img src="<?php echo $admin_preview_path; ?>?t=<?php echo time(); ?>" alt="Admin Logo" id="adminLogoImg">
                            <div class="current-file"><i class="bi bi-check-circle"></i> Synced: <?php echo $web_logo_for_admin; ?></div>
                        <?php } else { ?>
                            <div class="no-image">
                                <i class="bi bi-image"></i>
                                <span>Using default: assets/img/logoicon.png</span>
                                <small>Upload a Website Logo to update both</small>
                            </div>
                        <?php } ?>
                    </div>

                    <div style="background: #e8f5e9; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #2e7d32;">
                        <i class="bi bi-link-45deg" style="font-size: 16px;"></i>
                        <strong>Auto-Synced:</strong> The Admin Panel logo automatically uses the same logo as the Website (Frontend).
                        When you upload a Website Logo, the Admin Panel logo updates automatically.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Favicon -->
    <div class="row">
        <div class="col-md-6">
            <div class="logo-card">
                <div class="logo-card-header" style="background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);">
                    <h5><i class="bi bi-window-sidebar"></i> Browser Favicon</h5>
                    <span class="badge-info">100×100 pixels</span>
                </div>
                <div class="logo-card-body">
                    <div class="preview-container favicon-preview" id="faviconPreview">
                        <?php
                        $favicon = isset($settings['website_favicon']) ? $settings['website_favicon'] : '';
                        $favicon_path = dirname(base_url()) . '/favicon/' . $favicon;
                        if (!empty($favicon)) { ?>
                            <img src="<?php echo $favicon_path; ?>?t=<?php echo time(); ?>" alt="Favicon" id="faviconImg" style="width:64px;height:64px;">
                            <div class="current-file"><i class="bi bi-check-circle"></i> <?php echo $favicon; ?></div>
                        <?php } else { ?>
                            <div class="no-image">
                                <i class="bi bi-window-sidebar"></i>
                                <span>No custom favicon uploaded</span>
                                <small>Using default: favicon.ico</small>
                            </div>
                        <?php } ?>
                    </div>

                    <form action="<?php echo base_url(); ?>index.php/C_logo_settings/upload_favicon" method="post" enctype="multipart/form-data">
                        <div class="upload-area">
                            <input type="file" name="favicon_file" class="form-control" accept=".png,.jpg,.jpeg,.svg,.ico"
                                onchange="previewImage(this, 'faviconPreview', 'faviconImg')" required>
                            <button type="submit" class="btn btn-upload">
                                <i class="bi bi-cloud-arrow-up"></i> Upload
                            </button>
                            <?php if (!empty($favicon)) { ?>
                                <button type="button" class="btn btn-reset" onclick="resetLogo('website_favicon')">
                                    <i class="bi bi-arrow-counterclockwise"></i> Reset
                                </button>
                            <?php } ?>
                        </div>
                        <div class="file-info">
                            <i class="bi bi-info-circle"></i> Allowed: PNG, JPG, JPEG, SVG, ICO | Max: 5MB | Will be resized to 100×100 and converted to .ico
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Info Card -->
        <div class="col-md-6">
            <div class="logo-card">
                <div class="logo-card-header" style="background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);">
                    <h5><i class="bi bi-lightbulb"></i> Information</h5>
                </div>
                <div class="logo-card-body">
                    <div style="font-size: 13px; color: #555; line-height: 2;">
                        <p><strong><i class="bi bi-check-circle-fill" style="color:#2e7d32"></i> Website Logo</strong><br>
                        Displayed on the frontend website header and mobile menu. Stored in <code>assets/images/</code></p>

                        <p><strong><i class="bi bi-check-circle-fill" style="color:#2e7d32"></i> Admin Logo</strong><br>
                        Automatically uses the same logo as the Website. No separate upload needed — they stay in sync.</p>

                        <p><strong><i class="bi bi-check-circle-fill" style="color:#2e7d32"></i> Favicon</strong><br>
                        Browser tab icon for both frontend and admin. Auto-resized to 100×100 pixels and converted to .ico format. Stored in <code>favicon/</code></p>

                        <p><strong><i class="bi bi-exclamation-triangle-fill" style="color:#f0ad4e"></i> Note</strong><br>
                        If no custom logo is uploaded, the system will use the default logos. You can reset anytime.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Confirm Reset Modal -->
<div class="modal fade" id="resetConfirmModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #c62828 0%, #e53935 100%); color: #fff; border: none;">
                <h5 class="modal-title"><i class="bi bi-exclamation-triangle"></i> Confirm Reset</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding: 24px;">
                <p style="font-size: 14px;">Are you sure you want to reset this to the default? This action cannot be undone.</p>
            </div>
            <div class="modal-footer" style="border-top: 1px solid #eee;">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirmResetBtn">
                    <i class="bi bi-arrow-counterclockwise"></i> Yes, Reset
                </button>
            </div>
        </div>
    </div>
</div>

<script>
var resetType = '';

function previewImage(input, containerId, imgId) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        var allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];

        if (allowed.indexOf(file.type) === -1 && !file.name.match(/\.(png|jpg|jpeg|svg|ico)$/i)) {
            alert('Invalid file type! Only PNG, JPG, JPEG, SVG files are allowed.');
            input.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit!');
            input.value = '';
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var container = document.getElementById(containerId);
            var existingImg = document.getElementById(imgId);
            if (existingImg) {
                existingImg.src = e.target.result;
            } else {
                container.innerHTML = '<img src="' + e.target.result + '" alt="Preview" id="' + imgId + '">' +
                    '<div class="current-file" style="background:#fff3e0;color:#e65100;"><i class="bi bi-clock-history"></i> Pending upload</div>';
            }
        };
        reader.readAsDataURL(file);
    }
}

function resetLogo(type) {
    resetType = type;
    var modal = new bootstrap.Modal(document.getElementById('resetConfirmModal'));
    modal.show();
}

$(document).ready(function() {
    // Handle toggle
    $('#toggleCustomLogo').on('change', function() {
        var status = $(this).is(':checked') ? 1 : 0;
        $.ajax({
            url: base_url + 'index.php/C_logo_settings/toggle_custom_logo',
            type: 'POST',
            data: { status: status },
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    showFlashMessage(status ? 'Custom logos enabled.' : 'Custom logos disabled. Using defaults.', '');
                }
            }
        });
    });

    // Handle confirm reset
    $('#confirmResetBtn').on('click', function() {
        $.ajax({
            url: base_url + 'index.php/C_logo_settings/reset_logo',
            type: 'POST',
            data: { type: resetType },
            dataType: 'json',
            success: function(response) {
                var modal = bootstrap.Modal.getInstance(document.getElementById('resetConfirmModal'));
                modal.hide();
                if (response.status === 'success') {
                    showFlashMessage(response.message, '');
                    setTimeout(function() { location.reload(); }, 1000);
                } else {
                    showFlashMessage('', response.message);
                }
            }
        });
    });
});
</script>

<?php $this->load->view('include/footer'); ?>
