	<div class="container-fluid footer animate fade-up delay-6">
		<div class="container">
			<div class="row">
				<div class="col-md-4 col-xs-12 copyright">
					<p><?php echo Globals::$web_copyright ?></p>
				</div>
				<div class="col-md-4 col-xs-12 terms">
					<p><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/Terms">Terms and Conditions</a> | <a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/Disclaimer">Disclaimer</a> | <a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/Privacy">Privacy Policy</a></p>
				</div>
				<div class="col-md-4 col-xs-12 powerdby">
					<p>Powered by <a href="http://www.logimaxindia.com" target="_blank"><img src="<?php echo $this->config->item('base_url'); ?>assets/images/logimax.png"></a></p>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Menu Logic -->
	<script>
		document.addEventListener('DOMContentLoaded', function () {
			var toggle = document.getElementById('mobileMenuToggle');
			var sidebar = document.getElementById('mobileSidebar');
			var overlay = document.getElementById('mobileOverlay');
			var closeBtn = document.getElementById('sidebarClose');

			function openMenu() {
				if (sidebar) sidebar.classList.add('active');
				if (overlay) overlay.classList.add('active');
				if (toggle) toggle.classList.add('active');
				document.body.style.overflow = 'hidden';
			}

			function closeMenu() {
				if (sidebar) sidebar.classList.remove('active');
				if (overlay) overlay.classList.remove('active');
				if (toggle) toggle.classList.remove('active');
				document.body.style.overflow = '';
			}

			if (toggle) toggle.addEventListener('click', openMenu);
			if (closeBtn) closeBtn.addEventListener('click', closeMenu);
			if (overlay) overlay.addEventListener('click', closeMenu);
		});
	</script>