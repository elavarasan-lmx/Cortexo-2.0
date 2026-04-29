<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="">
<!--<![endif]-->

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
	<title><?php echo $title ?></title>
	<meta name="description" content="">
	<meta name='viewport' content='width=device-width, maximum-scale=1.0, minimum-scale=1.0, initial-scale=1.0' />
	<link rel="apple-touch-icon" href="<?php echo $this->config->item('base_url'); ?>assets/images/favicon.ico">
	<!-- CSS Files -->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/bootstrap.min.css">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-theme.min.css">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/font-awesome.min.css">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/cdn/OpenSans.css">
	<!--<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet' type='text/css'>
	<link href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' rel='stylesheet' type='text/css'>-->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/nivo-slider.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/themes/default/default.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/themes/light/light.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/themes/dark/dark.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/themes/bar/bar.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/flex/flexslider.css" type="text/css" media="screen" />
	<!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">-->
	<link href="<?php echo $this->config->item('base_url'); ?>assets/css/slicknav.css" rel="stylesheet">
	<!-- Magnific Popup core CSS file -->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/magnific-popup/magnific-popup.css">
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/magnific-popup/popup.css" type="text/css" media="screen" />
	<link href="<?php echo $this->config->item('base_url'); ?>assets/css/slicknav.css" rel="stylesheet">
	<!-- Custom CSS -->
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/main.css?vs=" .$version>
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/media.css?vs=" .$version>
	<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/trade/main.css?vs=" .$version>
	<!-- Js files -->
	<!--<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>-->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/jquery.min.js?vs=" .$version></script>

	<script src="<?php echo $this->config->item('base_url'); ?>assets/nivo-slider/jquery.nivo.slider.pack.js?vs=" .$version type="text/javascript"></script>
	<!--<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>-->
	<script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>assets/flex/jquery.flexslider.js?vs=" .$version></script>
	<!-- Magnific Popup core JS file -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/magnific-popup/jquery.magnific-popup.js?vs=" .$version></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/socket.io.min.js?vs=" .$version></script>
	<!-- Include all compiled plugins (below), or include individual files as needed -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/cdn/bootstrap.min.js?vs=" .$version></script>
	<!-- mobile responsive script -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/modernizr.min.js?vs=" .$version></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.slicknav.js?vs=" .$version></script>
	<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async='async'></script>
	<!-- Custom js -->
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/custom/common.js?vs=<?php echo $version ?>"></script>
	<script src="<?php echo $this->config->item('base_url'); ?>assets/js/main.js?vs=<?php echo $version ?>"></script>
</head>

<body>
	<!--[if lt IE 8]>
			<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
		<![endif]-->
	<!-- Mobile Top Bar (visible only on mobile) -->
	<div class="visible-xs mobile-nav-wrapper" style="position: sticky; top: 0; z-index: 1040;">
		<div class="mobile-topbar" style="background: #a90000; display: flex; align-items: center; justify-content: space-between; padding: 8px 15px;">
			<a href="<?php echo $this->config->item('base_url'); ?>" style="display:flex; align-items:center; text-decoration:none;">
				<img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="Maharaj Gold Smith" style="height: 45px; width: auto;">
			</a>
			<button type="button" id="mobileMenuToggle" style="border:none; background:transparent; padding:6px 8px; cursor:pointer;">
				<span style="display:block; width:26px; height:2px; background:#fff; margin-bottom:5px;"></span>
				<span style="display:block; width:26px; height:2px; background:#fff; margin-bottom:5px;"></span>
				<span style="display:block; width:26px; height:2px; background:#fff;"></span>
			</button>
		</div>
	</div>

	<!-- Sidebar Overlay -->
	<div class="mobile-overlay" id="mobileOverlay"></div>

	<!-- Slide-in Sidebar -->
	<div class="mobile-sidebar" id="mobileSidebar">
		<div class="mobile-sidebar-header">
			<img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="Maharaj Gold Smith" class="sidebar-logo">
			<button type="button" class="sidebar-close" id="sidebarClose" aria-label="Close menu">
				<span></span><span></span>
			</button>
		</div>
		<?php
		$this->load->library('session');
		// echo $this->session->userdata('username');exit;
		if ($this->session->userdata('username') && $this->session->userdata('username') != 'guest') {
		?>
			<ul class="mobile-nav-links">
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home"><i class="fa fa-home"></i> Home</a></li>
				<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>"><i class="fa fa-line-chart"></i>Live Rate</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'viewreport' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_trade/viewreport"><i class="fa fa-file" aria-hidden="true"></i> Reports</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank"><i class="fa fa-university"></i> Bank Details</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'tcs_tds' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/tcs_tds_calc"><i class="fa fa-calculator"></i> TCS & TDS Calculations</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus"><i class="fa fa-phone"></i> Contact Us</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/aboutus"><i class="fa fa-info-circle"></i> About Us</a></li>
				<li <?php echo $this->uri->segment(2) == 'index' ? 'class="active"' : ""; ?>><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/logout" style="border-right: none;"><i class="fa fa-sign-out" aria-hidden="true"></i> Logout</a></li>
			</ul>
		<?php
		} else {
		?>
			<ul class="mobile-nav-links">
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home"><i class="fa fa-home"></i> Home</a></li>
				<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>"><i class="fa fa-line-chart"></i>Live Rate</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank"><i class="fa fa-university"></i> Bank Details</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus"><i class="fa fa-phone"></i> Contact Us</a></li>
				<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Aboutus"><i class="fa fa-info-circle"></i> About Us</a></li>
				<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/tcs_tds_calc"><i class="fa fa-calculator"></i> TCS & TDS Calculations</a></li>
				<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/index"><i class="fa fa-line-chart"></i> Online Trading</a></li>
				<!-- <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/index"><i class="fa fa-sign-in"></i> Log In</a></li> -->
			</ul>
		<?php
		}
		?>
	</div>

	<!-- Desktop Header (hidden on mobile) -->
	<header class="main-header hidden-xs">
		<div class="">
			<div class="row" style="display: flex; align-items: center;">
				<div class="col-md-2 col-sm-3"></div>
				<div class="col-md-7 col-sm-6 text-center">
					<a href="<?php echo $this->config->item('base_url'); ?>">
						<img src="<?php echo $this->config->item('base_url'); ?>assets/images/logo.svg" alt="MAHARAJ GOLD SMITH" class="img-responsive logo-main">
					</a>
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
					<?php
					$this->load->library('session');
					// echo $this->session->userdata('username');exit;
					if ($this->session->userdata('username') && $this->session->userdata('username') != 'guest') {
					?>
						<ul class="menu">
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home">Home</a></li>
							<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>"><i class="fa fa-line-chart"></i>Live Rate</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'viewreport' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_trade/viewreport">Reports</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank"><i class="fa fa-university"></i> Bank Details</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/aboutus">About Us </a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus">Contact Us</a></li>
							<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/tcs_tds_calc"> TCS & TDS Calculations</a></li>

						</ul>
					<?php
					} else {
					?>
						<ul class="menu">
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Home' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/home">Home</a></li>
							<li class="<?php echo ($this->uri->segment(1) == '' || $this->uri->segment(1) == 'index.php') ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>">Live Rate</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Bank' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Bank">Bank Details</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment)  == 'Contactus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/Contactus">Contact Us</a></li>
							<li class="<?php echo ($segment = $this->uri->segment(2)) !== null && ucfirst($segment) == 'Aboutus' ? 'active' : '' ?>"><a href="<?php echo $this->config->item('base_url'); ?>index.php/c_client_main/aboutus">About Us </a></li>
							<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/tcs_tds_calc">TCS & TDS Calculations</a></li>
							<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/index" class="btn-online-trading-v2"><i class="fa fa-chart-bar"></i>ONLINE TRADING</a></li>
						</ul>
					<?php
					}
					?>
				</div>
			</div>
		</div>
	</nav>