<?php $this->load->view('include/header.php'); ?>
<!-- <script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>assets/tiny_mce/tiny_mce.js"></script> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.0/tinymce.min.js"></script>

<script type="text/javascript">
	var SITE_URL = "<?php echo site_url(); ?>";

	// tinyMCE.init({
	// 	// General options
	// 	mode : "textareas",
	// 	theme : "advanced",
	// });  
	tinymce.init({
		selector: "#news",
		setup: function(editor) {
			editor.on('keyup change', function() {
				validateEditor();
			});
		}
	});

	function validateEditor() {
		var content = tinymce.get("news").getContent({
			format: "text"
		}).trim();
		if (content === "") {
			$("#news_error").show();
			return false;
		} else {
			$("#news_error").hide();
			return true;
		}
	}

	// Disable save buttons initially
	// $(document).ready(function () {
	//     $(".saveBtn").prop("disabled", true);
	// });          
	// tinyMCE.init({
	// 		// General options
	// 		mode : "textareas",
	// 		theme : "advanced",
	// 		plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

	// 		// Theme options
	// 		theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
	// 		theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
	// 		theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
	// 		theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak,restoredraft,visualblocks",
	// 		theme_advanced_toolbar_location : "top",
	// 		theme_advanced_toolbar_align : "left",
	// 		theme_advanced_statusbar_location : "bottom",
	// 		theme_advanced_resizing : true,

	// 		// Example content CSS (should be your site CSS)
	// 		content_css : "css/content.css",

	// 		// Drop lists for link/image/media/template dialogs
	// 		template_external_list_url : "lists/template_list.js",
	// 		external_link_list_url : "lists/link_list.js",
	// 		external_image_list_url : "lists/image_list.js",
	// 		media_external_list_url : "lists/media_list.js",

	// 		// Style formats
	// 		style_formats : [
	// 			{title : 'Bold text', inline : 'b'},
	// 			{title : 'Red text', inline : 'span', styles : {color : '#ff0000'}},
	// 			{title : 'Red header', block : 'h1', styles : {color : '#ff0000'}},
	// 			{title : 'Example 1', inline : 'span', classes : 'example1'},
	// 			{title : 'Example 2', inline : 'span', classes : 'example2'},
	// 			{title : 'Table styles'},
	// 			{title : 'Table row 1', selector : 'tr', classes : 'tablerow1'}
	// 		],

	// 		// Replace values for the template plugin
	// 		template_replace_values : {
	// 			username : "Some User",
	// 			staffid : "991234"
	// 		}
	// 	});
	$(document).ready(function() {
		$("form").on("submit", function(e) {
			e.preventDefault();
			var form = this;
			
			// Sync TinyMCE content to textarea
			tinymce.triggerSave();

			if (!validateEditor()) {
				return false;
			}
			
			// Standard validation (if validateForm is available globally)
			if (typeof validateForm === 'function' && !validateForm(e, form)) {
				return false;
			}

			var btn = $(form).find('button[type="submit"]');
			var formData = new FormData(form);

			btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: $(form).attr("action"),
				type: "POST",
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				},
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show");
					if (response.status === "success") {
						showToast(response.message, 'success');
						setTimeout(function() {
							window.location.href = SITE_URL + "/C_news/open_listingform";
						}, 1000);
					} else {
						btn.prop("disabled", false).text("Save");
						showToast(response.message || "Operation failed!", 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, 'danger');
				}
			});
		});
	});
</script>
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
<style>
	.footer {
		padding: 0px 10px
	}
	#ajax_loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		display: none; /* Hidden by default */
	}

	#ajax_loader.show {
		display: flex;
	}
</style>

<!--<div>
    <ul class="breadcrumb">
        <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li><a href="#">Settings</a></li>
		<li><a href="#">News Entry</a></li>
    </ul>
</div>-->
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url') ?>index.php/C_news/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['news_id'] == NULL ? NULL : $_POST['fv']['news_id'];
						$attributes 		=	array('class' => 'form-horizontal');
						$news = $_POST['fv']['news'];
						//Opening form
						echo form_open('C_news/DB_Controller/News_model/' . $status . '/' . $id, $attributes); ?>
						<input type="hidden" id="news_id" name="news_id" value="<?php echo set_value('news_id', $id); ?>" />
						<form class="form-sample">
							<p class="card-description card-description1">News and Events Entry</p>
							<?php
							if (isset($db_error_msg) && $db_error_msg != '') {
								echo '<div class="alert alert-danger">
												<a href="#" class="close" data-dismiss="alert">&times;</a>
												<strong>Warning!</strong> ' . $db_error_msg . '
												</div>';
							}

							?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">News Title *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" id="newstitle" name="fv[newstitle]" value="<?php echo set_value('newstitle', $newstitle); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="50" required />
											<span class="help-block">Enter the title to display in push notification.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">News Short Description *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" id="newsshortdesc" name="fv[newsshortdesc]" value="<?php echo set_value('newsshortdesc', $newsshortdesc); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="200" required />
											<span class="help-block">Enter short description for display in push notification</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">News Text *</label>
										<div class="col-sm-7">
											<textarea style="width:800px; height:400px" class="form-control" id="news" name="fv[news]"><?php echo set_value('news', $news); ?></textarea>
											<span class="help-block">It allows to add text, images, links etc. Supports images approx. size of 300x300 in JPEG, PNG, GIF formats</span>
											<span class="error text-danger" id="news_error" style="display:none;">News text cannot be empty.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Primary News</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[isprimary]',
												[
													1 => ['label' => 'Yes', 'id' => 'primary_on'],
													0 => ['label' => 'No', 'id' => 'primary_off']
												],
												$isprimary,
												'Showing this tis news on live rate page'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[status]',
												[
													1 => ['label' => 'Yes', 'id' => 'status_on'],
													0 => ['label' => 'No', 'id' => 'status_off']
												],
												$active,
												'News whetehr active or inactive'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1 saveBtn">Save</button>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">

								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<?php $this->load->view("include/footer"); ?>