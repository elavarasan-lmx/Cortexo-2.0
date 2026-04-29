<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<?php
	$version = Globals::$web_version;
	$title = Globals::$web_title;
	?>
	<script type='text/javascript'>
		var SITE_BASE_URL = "<?php echo $this->config->item('base_url'); ?>";
	</script>
	<title><?php echo Globals::$web_title ?></title>

	<meta name="description" content="<?php echo Globals::$web_title ?> is leading gold and silver market in tamilnadu">
	<meta name="keywords" content="">
	<meta name="author" content="">
	<meta name='viewport' content='width=device-width, maximum-scale=1.0, minimum-scale=1.0, initial-scale=1.0' />
	<link rel="apple-touch-icon" href="apple-touch-icon.png">
	<!-- CSS Files -->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap.min.css">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-theme.min.css">
	<!-- Custom CSS -->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/trade/main.css?vs=<?php echo $version ?>">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/main.css?vs=<?php echo $version ?>">
	<!--<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/trade/style.css?vs=<?php echo $version ?>">-->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/media.css?vs=<?php echo $version ?>">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/trade/media.css?vs=<?php echo $version ?>">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/toast.css?vs=<?php echo $version ?>">

	<!-- Js files -->
	<link href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' rel='stylesheet' type='text/css'>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap.min.js"></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/socket.io.min.js"></script>
	<!--Datatables-->
	<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4/dt-1.10.16/af-2.2.2/b-1.4.2/r-2.2.0/datatables.min.css" />
	<script type="text/javascript" src="https://cdn.datatables.net/v/bs4/dt-1.10.16/af-2.2.2/b-1.4.2/r-2.2.0/datatables.min.js"></script>
	<!-- Custom js -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/custom/common.js?vs=" .$version></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/main.js?vs=" .$version></script>

	<script>
		// WEB INSTANT LOGOUT LOGIC
		var userid = "<?php echo $this->session->userdata('userid'); ?>";
		var uuid = "<?php echo $this->session->userdata('client_uuid'); ?>";
		var logoutUrl = "<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/logout";

		if (userid && !uuid) {
			window.location.href = logoutUrl;
		}
		if (userid && uuid) {
			var socket_url = "<?php echo Globals::$socket_base_url; ?>";
			// var socket = io(socket_url);

			var socket = io(socket_url, {
				path: "/socket.io/",
				transports: ["websocket"], // 🔥 FORCE WEBSOCKET ONLY
				upgrade: false, // 🔥 DO NOT FALL BACK
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 2000,
				timeout: 20000
			});
			var mrq_update = "<?php echo Globals::$evt_marqueeupdate; ?>";

			socket.on(mrq_update, function(data) {
				handleLogoutEvent(data, "ForceLogoutClass");
			});
			// var terminateuser = "<?php echo Globals::$evt_terminateuser; ?>";

			// socket.on(terminateuser, function (data) {
			// 		handleLogoutEvent(data, "ForceLogoutClass");
			// });

			function handleLogoutEvent(data, source) {
				var eventData = data.updatedata ? data.updatedata : data;

				if (eventData && eventData.userid == userid) {
					if (uuid && eventData.uuid == uuid) {
						alert("Your session has been terminated because you logged in on another device.");
						window.location.href = logoutUrl;
					}
				}
			}
		}
	</script>

</head>

<body>
	<!--[if lt IE 8]>
				<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
			<![endif]-->
	<!-- Mobile Navigation -->
	<div class="visible-xs mobile-nav-wrapper">
		<div class="mobile-topbar">
			<a href="#" class="mobile-logo"><img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="Maharaj Gold Smith"></a>
			<button type="button" class="hamburger" id="mobileMenuToggle" aria-label="Open menu">
				<span class="ham-bar ham-bar--top"></span>
				<span class="ham-bar ham-bar--mid"></span>
				<span class="ham-bar ham-bar--bot"></span>
			</button>
		</div>
	</div>

	<!-- Sidebar Overlay -->
	<div class="mobile-overlay" id="mobileOverlay"></div>

	<!-- Slide-in Sidebar -->
	<div class="mobile-sidebar" id="mobileSidebar">
		<div class="mobile-sidebar-header">
			<img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="Ganesh Jewellery" class="sidebar-logo">
			<button type="button" class="sidebar-close" id="sidebarClose" aria-label="Close menu">
				<span></span><span></span>
			</button>
		</div>
		<ul class="mobile-nav-links">
			<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home"><i class="fa fa-home"></i> Home</a></li>
			<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>"><i class="fa fa-line-chart"></i>Live Rate</a></li>
			<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'viewreport' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_trade/viewreport"><i class="fa fa-file" aria-hidden="true"></i> Reports</a></li>
			<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank"><i class="fa fa-university"></i> Bank Details</a></li>
			<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/aboutus"><i class="fa fa-info-circle"></i> About Us</a></li>
			<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus"><i class="fa fa-phone"></i> Contact Us</a></li>
			<li <?php echo $this->uri->segment(2) == 'index' ? 'class="active"' : ""; ?>><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/logout" style="border-right: none;"><i class="fa fa-sign-out" aria-hidden="true"></i> Logout</a></li>
		</ul>
	</div>

	<!-- Desktop Header (hidden on mobile) -->
	<header class="main-header hidden-xs">
		<div class="">
			<div class="row" style="display: flex; align-items: center;">
				<div class="col-md-2 col-sm-3"></div>
				<div class="col-md-7 col-sm-6 text-center">
					<img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="MAHARAJ GOLD SMITH" class="img-responsive logo-main">
				</div>
				<div class="col-md-3 col-sm-3 text-right">
					<div class="bis-logo-box">
						<img src="<?php echo $this->config->item('base_url'); ?>assets/images/bis.png" alt="BIS Logo">
					</div>
				</div>
			</div>
		</div>
	</header>
	<!-- Desktop Navigation Bar (hidden on mobile) -->
	<nav class="nav-marquee-bar">
		<div class="container-fluid" style="padding: 0;">
			<div style="display: flex; align-items: center; width: 100%;">
				<div class="welcome-msg-container" style="">
					<div class="latestUpdatesContainer marque marquee" id="marquee"></div>
				</div>
				<div class="navbar-links-container hidden-xs" style="">
					<ul class="menu">
						<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home">Home</a></li>
						<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>"><i class="fa fa-line-chart"></i>Live Rate</a></li>
						<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'viewreport' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_trade/viewreport"> Reports</a></li>
						<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank"> Bank Details</a></li>
						<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/aboutus">About Us </a></li>
						<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus">Contact Us</a></li>
						<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/tcs_tds_calc"> TCS & TDS Calculations</a></li>
						<li <?php echo $this->uri->segment(2) == 'index' ? 'class="active"' : ""; ?>><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/logout" style="border-right: none;">Logout</a></li>
					</ul>
				</div>
			</div>
		</div>
	</nav>
	<?php if ($this->session->userdata('login_success')) :
		$this->session->unset_userdata('login_success');
	?>
		<div id="login-toast" class="show">
			<div class="toast-icon-container">
				<i class="fa fa-check"></i>
			</div>
			<div class="toast-message">Login Successfully.</div>
			<div class="toast-close" onclick="document.getElementById('login-toast').classList.remove('show')">&times;</div>
		</div>
		<style>

		</style>
		<script>
			setTimeout(function() {
				var x = document.getElementById("login-toast");
				if (x) x.classList.remove("show");
			}, 5000);
		</script>
	<?php endif; ?>
