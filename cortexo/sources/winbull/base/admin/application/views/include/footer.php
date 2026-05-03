<?php if (!isset($no_visible_elements) || !$no_visible_elements) { ?>

	<?php $this->load->view('include/dialog.php'); ?>
	<?php $this->load->view('common/confirm_modal.php'); ?>
	<footer class="footer">
		<div class="card">
			<div class="card-body">
				<div class="d-sm-flex justify-content-center justify-content-sm-between">
					<span class="text-muted text-center text-sm-left d-block d-sm-inline-block"><a
							href="<?php echo dirname($this->config->item('base_url')); ?>"
							target="_blank"><?php echo $this->general_model->get_companyname(); ?></a>
						<?php echo date("Y"); ?>. All rights reserved.</span>
					<span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center text-muted">Admin Version <?php echo Globals::$admin_web_version; ?></span>
					<span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center text-muted">Powered by: <a
							href="http://logimaxindia.com">Logimax Technologies</a></span>
				</div>
			</div>
		</div>
	</footer>
<?php } ?>

</div>
<!-- main-panel ends -->
</div>
<!-- page-body-wrapper ends -->
</div>


<script type="text/javascript">
	var basePath = "<?php echo $this->config->item('base_url'); ?>";
</script>

<!-- external javascript -->
<!-- Bootstrap 3 jQuery plugins (required for .tab(), .tooltip(), .popover() etc. used by lmx.js) -->
<script
	src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>

<!-- library for cookie management -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.cookie.js"></script>
<!-- calender plugin -->
<script src='<?php echo $this->config->item('base_url'); ?>assets/bower_components/moment/min/moment.min.js'></script>
<script
	src='<?php echo $this->config->item('base_url'); ?>assets/bower_components/fullcalendar/dist/fullcalendar.min.js'></script>
<script type="text/javascript"
	src="<?php echo dirname($this->config->item('base_url')); ?>/assets/js/jquery.xml2json.js"></script>
<!-- data table plugin -->
<link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/jquery.dataTables.min.css" rel="stylesheet">
<link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/buttons.dataTables.min.css" rel="stylesheet">

<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/jquery.dataTables.min.js'></script>
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/dataTables.buttons.min.js'></script>
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/jszip.min.js'></script>
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/pdfmake.min.js'></script>
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/vfs_fonts.js'></script>
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/buttons.html5.min.js'></script>

<!-- select or dropdown enhancer -->
<script
	src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/chosen/chosen.jquery.min.js"></script>

<!-- plugin for gallery image view -->
<script
	src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/colorbox/jquery.colorbox-min.js"></script>
<!-- notification plugin -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.noty.js"></script>
<!-- library for making tables responsive -->
<script
	src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/responsive-tables/responsive-tables.js"></script>
<!-- tour plugin -->
<script
	src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/bootstrap-tour/build/js/bootstrap-tour.min.js"></script>
<!-- star rating plugin -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.raty.min.js"></script>
<!-- for iOS style toggle switch -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.iphone.toggle.js"></script>
<!-- autogrowing textarea plugin -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.autogrow-textarea.js"></script>
<!-- multiple file upload plugin -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.uploadify-3.1.min.js"></script>
<!-- history.js for cross-browser state change on ajax -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.history.js"></script>
<!-- application script for logimax demo -->
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/lmx.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/customize.js"></script>



<!-- Toastr (Disabled in favor of Pro Max Toaster) -->
<!-- <link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/toastr.min.css" rel="stylesheet">
<script src='<?php echo $this->config->item('base_url'); ?>assets/js/cdn/toastr.min.js'></script> -->

<link href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap-timepicker.css" rel="stylesheet">
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/bootstrap-timepicker.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>assets/js/buttons.print.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>assets/js/dataTables.buttons.min.js"></script>


<!-- Global: Replace browser "Please fill out this field" with showToast -->
<script>
document.addEventListener('DOMContentLoaded', function() {
	// Track if we already showed a toast for this submit attempt
	var validationToastShown = false;

	// Listen for form submit to reset the flag
	document.addEventListener('submit', function() {
		validationToastShown = false;
	}, true);

	// Intercept HTML5 validation 'invalid' events globally
	document.addEventListener('invalid', function(e) {
		e.preventDefault(); // Stop browser's default tooltip

		if (!validationToastShown) {
			validationToastShown = true;
			var fieldName = e.target.getAttribute('placeholder') 
				|| e.target.previousElementSibling && e.target.previousElementSibling.textContent
				|| e.target.name || 'field';
			
			// Clean up field name
			fieldName = fieldName.replace(/[*:]/g, '').trim();
			if (fieldName.indexOf('fv[') === 0) {
				fieldName = fieldName.replace('fv[', '').replace(']', '').replace(/_/g, ' ');
			}

			if (typeof showToast === 'function') {
				showToast('Please fill out: ' + fieldName, 'warning');
			} else if (typeof toastr !== 'undefined') {
				toastr.warning('Please fill out: ' + fieldName);
			}

			// Focus the invalid field
			e.target.focus();

			// Reset flag after a short delay so next submit attempt can show again
			setTimeout(function() { validationToastShown = false; }, 2000);
		}
	}, true); // 'true' = capture phase to intercept before browser
});
</script>
<?php $this->load->view('_support_widget'); ?>
</body>


</html>
<!-- <?php // disable_autocomplete_script(); ?> -->