<?php $this->load->view('include/header'); ?>

<style>
    .maint-wrapper { padding: 15px; }
    .maint-card {
        background: #fff; border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        margin-bottom: 24px; overflow: hidden;
        border: 1px solid #e8eef3; transition: box-shadow 0.3s ease;
    }
    .maint-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    .maint-card-header {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff; padding: 16px 20px;
        display: flex; align-items: center; justify-content: space-between;
    }
    .maint-card-header h5 {
        margin: 0; font-size: 16px; font-weight: 600;
        display: flex; align-items: center; gap: 10px;
    }
    .maint-card-header .badge-info {
        background: rgba(255,255,255,0.2); border-radius: 20px;
        padding: 3px 12px; font-size: 11px; font-weight: 400;
    }
    .maint-card-body { padding: 24px; }
    .page-title-box {
        background: linear-gradient(135deg, #b71c1c 0%, #e53935 100%);
        color: #fff; padding: 20px 24px; border-radius: 12px;
        margin-bottom: 24px;
    }
    .page-title-box h4 {
        margin: 0; font-size: 20px; font-weight: 700;
        display: flex; align-items: center; gap: 10px;
    }
    .page-title-box .subtitle { font-size: 13px; opacity: 0.8; margin-top: 4px; }

    .toggle-card {
        background: #f8f9fc; border-radius: 12px;
        padding: 20px 24px; display: flex;
        align-items: center; justify-content: space-between;
        border: 1px solid #e8eef3; margin-bottom: 16px;
        transition: all 0.3s ease;
    }
    .toggle-card:hover { border-color: #c5cae9; background: #f0f2ff; }
    .toggle-card.active-maintenance { border-color: #ef9a9a; background: #ffebee; }
    .toggle-card .toggle-info { display: flex; align-items: center; gap: 16px; }
    .toggle-card .toggle-icon {
        width: 48px; height: 48px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; color: #fff; flex-shrink: 0;
    }
    .toggle-card .toggle-icon.web { background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%); }
    .toggle-card .toggle-icon.android { background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%); }
    .toggle-card .toggle-icon.ios { background: linear-gradient(135deg, #37474f 0%, #546e7a 100%); }
    .toggle-card .toggle-details h6 { margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .toggle-card .toggle-details p { margin: 0; font-size: 12px; color: #6c757d; }
    .toggle-card .status-badge {
        display: inline-block; padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 600; margin-top: 4px;
    }
    .status-badge.online { background: #e8f5e9; color: #2e7d32; }
    .status-badge.maintenance { background: #ffebee; color: #c62828; }

    .custom-switch { position: relative; display: inline-block; width: 56px; height: 30px; flex-shrink: 0; }
    .custom-switch input { opacity: 0; width: 0; height: 0; }
    .switch-slider {
        position: absolute; cursor: pointer; inset: 0;
        background-color: #4caf50; border-radius: 30px; transition: all 0.4s ease;
    }
    .switch-slider:before {
        content: ""; position: absolute; height: 24px; width: 24px;
        left: 3px; bottom: 3px; background-color: white;
        border-radius: 50%; transition: all 0.4s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .custom-switch input:checked + .switch-slider { background-color: #e53935; }
    .custom-switch input:checked + .switch-slider:before { transform: translateX(26px); }

    .message-textarea {
        width: 100%; min-height: 100px; border: 1px solid #d0d5dd;
        border-radius: 10px; padding: 12px 16px; font-size: 14px;
        resize: vertical; transition: all 0.3s ease; font-family: inherit;
    }
    .message-textarea:focus { outline: none; border-color: #1a237e; box-shadow: 0 0 0 3px rgba(26,35,126,0.1); }
    .btn-save-msg {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff; border: none; border-radius: 8px;
        padding: 10px 24px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.3s ease;
        display: inline-flex; align-items: center; gap: 6px; margin-top: 12px;
    }
    .btn-save-msg:hover { background: linear-gradient(135deg, #283593 0%, #3949ab 100%); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,35,126,0.3); color: #fff; }
    .btn-reset-msg {
        background: #fff; color: #6c757d; border: 1px solid #d0d5dd;
        border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 500;
        cursor: pointer; transition: all 0.3s ease;
        display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; margin-left: 8px;
    }
    .btn-reset-msg:hover { background: #f5f5f5; border-color: #bbb; }

    .preview-container {
        background: #f8f9fc; border: 2px dashed #d0d5dd; border-radius: 12px;
        padding: 40px 20px; text-align: center; min-height: 280px;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 16px;
    }
    .preview-container .preview-logo img { max-width: 160px; max-height: 80px; object-fit: contain; }
    .preview-container .preview-title { font-size: 24px; font-weight: 700; color: #b71c1c; margin: 0; }
    .preview-container .preview-message { font-size: 15px; color: #555; max-width: 400px; line-height: 1.6; }
    .preview-container .preview-icon { font-size: 48px; color: #e53935; }

    .info-box {
        background: #e3f2fd; border-radius: 10px; padding: 14px 18px;
        font-size: 13px; color: #0d47a1; margin-top: 16px;
        display: flex; align-items: flex-start; gap: 10px;
    }
    .info-box i { font-size: 18px; margin-top: 1px; flex-shrink: 0; }

    @media (max-width: 768px) {
        .toggle-card { flex-direction: column; gap: 16px; text-align: center; }
        .toggle-card .toggle-info { flex-direction: column; }
    }
</style>

<div class="maint-wrapper">
    <div class="page-title-box">
        <div>
            <h4><i class="bi bi-gear-wide-connected"></i> Maintenance Settings</h4>
            <div class="subtitle">Control maintenance mode for Website, Android App, and iOS App</div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-7">
            <div class="maint-card">
                <div class="maint-card-header" style="background: linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%);">
                    <h5><i class="bi bi-toggles"></i> Maintenance Mode Controls</h5>
                    <span class="badge-info">ON/OFF Toggles</span>
                </div>
                <div class="maint-card-body">
                    <!-- Website Toggle -->
                    <div class="toggle-card <?php echo (isset($settings['website_maintenance']) && $settings['website_maintenance'] == 1) ? 'active-maintenance' : ''; ?>" id="webToggleCard">
                        <div class="toggle-info">
                            <div class="toggle-icon web"><i class="bi bi-globe2"></i></div>
                            <div class="toggle-details">
                                <h6>Website Maintenance Mode</h6>
                                <p>When enabled, visitors will see the maintenance page instead of the website.</p>
                                <span class="status-badge <?php echo (isset($settings['website_maintenance']) && $settings['website_maintenance'] == 1) ? 'maintenance' : 'online'; ?>" id="webStatus">
                                    <?php echo (isset($settings['website_maintenance']) && $settings['website_maintenance'] == 1) ? '⚠ Under Maintenance' : '✓ Online'; ?>
                                </span>
                            </div>
                        </div>
                        <label class="custom-switch">
                            <input type="checkbox" id="toggleWebsite" <?php echo (isset($settings['website_maintenance']) && $settings['website_maintenance'] == 1) ? 'checked' : ''; ?>>
                            <span class="switch-slider"></span>
                        </label>
                    </div>

                    <!-- Android Toggle -->
                    <div class="toggle-card <?php echo (isset($settings['android_maintenance']) && $settings['android_maintenance'] == 1) ? 'active-maintenance' : ''; ?>" id="androidToggleCard">
                        <div class="toggle-info">
                            <div class="toggle-icon android"><i class="bi bi-android2"></i></div>
                            <div class="toggle-details">
                                <h6>Android App Maintenance Mode</h6>
                                <p>When enabled, Android app users will see the maintenance screen.</p>
                                <span class="status-badge <?php echo (isset($settings['android_maintenance']) && $settings['android_maintenance'] == 1) ? 'maintenance' : 'online'; ?>" id="androidStatus">
                                    <?php echo (isset($settings['android_maintenance']) && $settings['android_maintenance'] == 1) ? '⚠ Under Maintenance' : '✓ Online'; ?>
                                </span>
                            </div>
                        </div>
                        <label class="custom-switch">
                            <input type="checkbox" id="toggleAndroid" <?php echo (isset($settings['android_maintenance']) && $settings['android_maintenance'] == 1) ? 'checked' : ''; ?>>
                            <span class="switch-slider"></span>
                        </label>
                    </div>

                    <!-- iOS Toggle -->
                    <div class="toggle-card <?php echo (isset($settings['ios_maintenance']) && $settings['ios_maintenance'] == 1) ? 'active-maintenance' : ''; ?>" id="iosToggleCard">
                        <div class="toggle-info">
                            <div class="toggle-icon ios"><i class="bi bi-apple"></i></div>
                            <div class="toggle-details">
                                <h6>iOS App Maintenance Mode</h6>
                                <p>When enabled, iOS app users will see the maintenance screen.</p>
                                <span class="status-badge <?php echo (isset($settings['ios_maintenance']) && $settings['ios_maintenance'] == 1) ? 'maintenance' : 'online'; ?>" id="iosStatus">
                                    <?php echo (isset($settings['ios_maintenance']) && $settings['ios_maintenance'] == 1) ? '⚠ Under Maintenance' : '✓ Online'; ?>
                                </span>
                            </div>
                        </div>
                        <label class="custom-switch">
                            <input type="checkbox" id="toggleIos" <?php echo (isset($settings['ios_maintenance']) && $settings['ios_maintenance'] == 1) ? 'checked' : ''; ?>>
                            <span class="switch-slider"></span>
                        </label>
                    </div>

                    <div class="info-box">
                        <i class="bi bi-info-circle-fill"></i>
                        <div><strong>Note:</strong> Admin panel access is never blocked by maintenance mode.</div>
                    </div>
                </div>
            </div>

            <!-- Custom Message -->
            <div class="maint-card">
                <div class="maint-card-header" style="background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);">
                    <h5><i class="bi bi-chat-left-text"></i> Custom Maintenance Message</h5>
                    <span class="badge-info">Optional</span>
                </div>
                <div class="maint-card-body">
                    <form action="<?php echo base_url(); ?>index.php/C_maintenance_settings/save_message" method="post">
                        <label style="font-weight:600; color:#344054; font-size:14px; margin-bottom:8px; display:block;">
                            Custom Message <span style="font-weight:400; color:#999;">(leave blank for default)</span>
                        </label>
                        <textarea name="maintenance_message" class="message-textarea" placeholder="We are under maintenance. Please check back later."><?php echo isset($settings['maintenance_message']) ? htmlspecialchars($settings['maintenance_message']) : ''; ?></textarea>
                        <div style="font-size:12px; color:#6c757d; margin-top:6px;">
                            <i class="bi bi-info-circle"></i> Default: "We are under maintenance. Please check back later."
                        </div>
                        <div>
                            <button type="submit" class="btn-save-msg"><i class="bi bi-check-lg"></i> Save Message</button>
                            <button type="button" class="btn-reset-msg" onclick="document.querySelector('.message-textarea').value='';"><i class="bi bi-arrow-counterclockwise"></i> Clear</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-md-5">
            <!-- Live Preview -->
            <div class="maint-card">
                <div class="maint-card-header" style="background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);">
                    <h5><i class="bi bi-eye"></i> Maintenance Page Preview</h5>
                </div>
                <div class="maint-card-body">
                    <div class="preview-container">
                        <div class="preview-logo">
                            <?php
                            $logo = isset($settings['website_logo']) ? $settings['website_logo'] : '';
                            $custom_on = isset($settings['custom_logo_enabled']) ? $settings['custom_logo_enabled'] : 0;
                            $logo_path = ($custom_on && !empty($logo)) ? dirname(base_url()) . '/assets/images/' . $logo : dirname(base_url()) . '/assets/images/logo.png';
                            ?>
                            <img src="<?php echo $logo_path; ?>?t=<?php echo time(); ?>" alt="Company Logo">
                        </div>
                        <i class="bi bi-gear-wide-connected preview-icon"></i>
                        <h3 class="preview-title">Maintenance Mode</h3>
                        <p class="preview-message" id="previewMessage">
                            <?php echo (isset($settings['maintenance_message']) && !empty($settings['maintenance_message'])) ? htmlspecialchars($settings['maintenance_message']) : 'We are under maintenance. Please check back later.'; ?>
                        </p>
                    </div>
                    <div style="margin-top: 12px; font-size: 12px; color: #888; text-align: center;">
                        <i class="bi bi-info-circle"></i> This is how the maintenance page will appear to visitors
                    </div>
                </div>
            </div>

            <!-- Info Card -->
            <div class="maint-card">
                <div class="maint-card-header" style="background: linear-gradient(135deg, #37474f 0%, #546e7a 100%);">
                    <h5><i class="bi bi-lightbulb"></i> How It Works</h5>
                </div>
                <div class="maint-card-body">
                    <div style="font-size: 13px; color: #555; line-height: 2;">
                        <p><strong><i class="bi bi-globe2" style="color:#1565c0"></i> Website</strong><br>
                        When enabled, all website pages show the maintenance page. Admin panel remains accessible.</p>
                        <p><strong><i class="bi bi-android2" style="color:#2e7d32"></i> Android App</strong><br>
                        When enabled, Android app receives a maintenance flag via API.</p>
                        <p><strong><i class="bi bi-apple" style="color:#37474f"></i> iOS App</strong><br>
                        When enabled, iOS app receives a maintenance flag via API.</p>
                        <p><strong><i class="bi bi-chat-left-text" style="color:#0d47a1"></i> Custom Message</strong><br>
                        Set a custom message or leave blank for default.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Confirm Modal -->
<div class="modal fade" id="confirmMaintenanceModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #b71c1c 0%, #e53935 100%); color: #fff; border: none;">
                <h5 class="modal-title" id="confirmModalTitle">Confirm Action</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding: 24px;">
                <p style="font-size: 14px;" id="confirmModalMessage"></p>
            </div>
            <div class="modal-footer" style="border-top: 1px solid #eee; padding: 16px 24px;">
                <div class="row w-100 g-2">
                    <div class="col-md-6"><button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Cancel</button></div>
                    <div class="col-md-6"><button type="button" class="btn btn-danger w-100" id="confirmMaintenanceBtn"><i class="bi bi-check-lg"></i> Yes, Confirm</button></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
var pendingToggle = null;

function toggleMaintenance(type, checkbox) {
    var isChecked = checkbox.checked;
    var labels = { 'website': 'Website', 'android': 'Android App', 'ios': 'iOS App' };
    var modalHeader = document.querySelector('#confirmMaintenanceModal .modal-header');
    if (isChecked) {
        pendingToggle = { type: type, checkbox: checkbox, status: 1 };
        $('#confirmModalTitle').html('<i class="bi bi-exclamation-triangle"></i> Enable Maintenance Mode');
        $('#confirmModalMessage').html('<i class="bi bi-exclamation-circle" style="color:#c62828;font-size:18px;"></i> Are you sure you want to <strong>enable</strong> maintenance mode for <strong>' + labels[type] + '</strong>?<br><small class="text-muted">Users will not be able to access ' + labels[type] + ' while maintenance is active.</small>');
        modalHeader.style.background = 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)';
        $('#confirmMaintenanceBtn').removeClass('btn-success').addClass('btn-danger').html('<i class="bi bi-check-lg"></i> Yes, Enable');
    } else {
        pendingToggle = { type: type, checkbox: checkbox, status: 0 };
        $('#confirmModalTitle').html('<i class="bi bi-check-circle"></i> Disable Maintenance Mode');
        $('#confirmModalMessage').html('<i class="bi bi-check-circle" style="color:#2e7d32;font-size:18px;"></i> Are you sure you want to <strong>disable</strong> maintenance mode for <strong>' + labels[type] + '</strong>?<br><small class="text-muted">' + labels[type] + ' will become accessible to all users again.</small>');
        modalHeader.style.background = 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)';
        $('#confirmMaintenanceBtn').removeClass('btn-danger').addClass('btn-success').html('<i class="bi bi-check-lg"></i> Yes, Disable');
    }
    var modal = new bootstrap.Modal(document.getElementById('confirmMaintenanceModal'));
    modal.show();
}

function doToggle(type, status, checkbox) {
    var urls = {
        'website': base_url + 'index.php/C_maintenance_settings/toggle_website_maintenance',
        'android': base_url + 'index.php/C_maintenance_settings/toggle_android_maintenance',
        'ios': base_url + 'index.php/C_maintenance_settings/toggle_ios_maintenance'
    };
    var cardIds = { 'website': 'webToggleCard', 'android': 'androidToggleCard', 'ios': 'iosToggleCard' };
    var statusIds = { 'website': 'webStatus', 'android': 'androidStatus', 'ios': 'iosStatus' };

    $.ajax({
        url: urls[type], type: 'POST', data: { status: status }, dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                showFlashMessage(response.message, '');
                var card = document.getElementById(cardIds[type]);
                var badge = document.getElementById(statusIds[type]);
                if (status == 1) {
                    card.classList.add('active-maintenance');
                    badge.className = 'status-badge maintenance';
                    badge.innerHTML = '⚠ Under Maintenance';
                } else {
                    card.classList.remove('active-maintenance');
                    badge.className = 'status-badge online';
                    badge.innerHTML = '✓ Online';
                }
            }
        },
        error: function() {
            checkbox.checked = !checkbox.checked;
            showFlashMessage('', 'Failed to update. Please try again.');
        }
    });
}

$(document).ready(function() {
    $('#toggleWebsite').on('change', function() { toggleMaintenance('website', this); });
    $('#toggleAndroid').on('change', function() { toggleMaintenance('android', this); });
    $('#toggleIos').on('change', function() { toggleMaintenance('ios', this); });

    $('#confirmMaintenanceBtn').on('click', function() {
        if (pendingToggle) {
            doToggle(pendingToggle.type, pendingToggle.status, pendingToggle.checkbox);
            bootstrap.Modal.getInstance(document.getElementById('confirmMaintenanceModal')).hide();
            pendingToggle = null;
        }
    });

    $('#confirmMaintenanceModal').on('hidden.bs.modal', function() {
        if (pendingToggle) {
            pendingToggle.checkbox.checked = pendingToggle.status === 1 ? false : true;
            pendingToggle = null;
        }
    });

    $('.message-textarea').on('input', function() {
        var val = $(this).val().trim();
        $('#previewMessage').text(val === '' ? 'We are under maintenance. Please check back later.' : val);
    });
});
</script>

<?php $this->load->view('include/footer'); ?>
