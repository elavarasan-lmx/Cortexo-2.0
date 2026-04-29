<?php
$this->load->view('include/header.php');
$this->load->helper('common');
$base_url = $this->config->item('base_url');
?>

<style>
    .image-uploader-box {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border: 1px dashed #ced4da;
        margin-top: 20px;
    }

    .uploaded-images-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 15px;
    }

    .img-item {
        width: 120px;
        position: relative;
        border: 1px solid #ddd;
        padding: 5px;
        background: #fff;
    }

    .img-item img {
        width: 100%;
        height: 80px;
        object-fit: cover;
    }

    .img-item .img-path {
        font-size: 10px;
        word-break: break-all;
        margin-top: 5px;
        display: block;
        background: #eee;
        padding: 2px;
    }

    .editor-mode-toggle {
        margin-bottom: 15px;
    }

    .code-editor-container {
        display: none;
    }

    .code-editor-container.active {
        display: block;
    }

    #editor {
        width: 100%;
        height: 500px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .ace_editor {
        font-size: 14px !important;
    }
</style>

<style>
    #ajax_loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        z-index: 9999;
        display: none;
        justify-content: center;
        align-items: center;
    }

    #ajax_loader.show {
        display: flex !important;
    }

    #ajax_loader img {
        height: 100px;
    }

    .typcn-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-12 grid-margin">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="card-title mb-0"><?php echo ($type == 'add_new') ? 'Add New Page' : 'Edit Page: ' . $page_title; ?></h4>
                            <?php if (isset($page_slug) && $page_slug != '') {
                                // Determine view link
                                $slug = $page_slug;
                                $method = ucfirst(str_replace('-', '', $slug));
                                if ($slug == 'about-us') $method = 'Aboutus';
                                else if ($slug == 'home') $method = 'Home';
                                else if ($slug == 'contact-us') $method = 'Contactus';

                                $view_url = $base_url . '../index.php/C_client_main/' . $method;
                            ?>
                                <a href="<?php echo $view_url; ?>" target="_blank" class="btn btn-info btn-sm">View Live Page <i class="typcn typcn-eye"></i></a>
                            <?php } ?>
                        </div>

                        <?php
                        $status = $type;
                        $id = ($type == 'add_new') ? '0' : $page_slug;
                        $attributes = array('class' => 'form-horizontal', 'id' => 'pageForm');
                        echo form_open('C_other_pages/DB_Controller/Other_pages_model/' . $status . '/' . $id, $attributes); ?>

                        <?php if ($type != 'add_new'): ?>
                            <div class="alert alert-info small">
                                <strong>Mode:</strong> File-based editing. Content saved to <code><?php echo $file_path; ?></code>.
                            </div>
                        <?php endif; ?>

                        <?php
                        if (isset($db_error_msg) && $db_error_msg != '') {
                            echo '<div class="alert alert-danger alert-dismissible fade show" role="alert">
										<strong>Error!</strong> ' . $db_error_msg . '
										<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
									</div>';
                        }
                        ?>

                        <div class="row form-sample1">
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Page Title*</label>
                                    <div class="col-sm-8">
                                        <input type="text" class="form-control" name="fv[page_title]" tabindex="1" id="page_title" value="<?php echo set_value('page_title', $page_title); ?>" required maxlength="50" onkeydown="validateKeyPress(event, this, 4)" data-validate="no-repeats" />
                                        <span class="help-block">Display name of the page.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group row">
                                    <label class="col-sm-4 col-form-label">Page Slug*</label>
                                    <div class="col-sm-8">
                                        <input type="text" class="form-control" name="fv[page_slug]" tabindex="2" id="page_slug" value="<?php echo set_value('page_slug', $page_slug); ?>" required maxlength="50" data-no-spaces <?php echo ($type == 'edit') ? 'readonly' : 'onkeydown="validateKeyPress(event, this, 7)"'; ?> placeholder="e.g. news-updates" />
                                        <span class="help-block">URL identifier (no spaces, e.g. 'my-page').</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1">
                            <div class="col-12">
                                <div class="editor-mode-toggle">
                                    <button type="button" class="btn btn-sm btn-primary" id="toggle_visual" onclick="switchEditor('visual')">
                                        <i class="typcn typcn-edit"></i> Visual Editor
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="toggle_code" onclick="switchEditor('code')">
                                        <i class="typcn typcn-code"></i> Code Editor
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1">
                            <div class="col-12">
                                <div class="form-group">
                                    <label class="form-label">Page Content*</label>

                                    <div id="visual_editor_container" class="editor-container active">
                                        <textarea name="fv[page_content]" id="page_content_visual" class="form-control"><?php echo htmlspecialchars($page_content ?? ''); ?></textarea>
                                    </div>

                                    <div id="code_editor_container" class="code-editor-container">
                                        <div id="editor"><?php echo htmlspecialchars($page_content ?? ''); ?></div>
                                        <textarea name="page_content_code_hidden" id="page_content_code_hidden" style="display:none;"></textarea>
                                    </div>

                                    <span class="help-block">
                                        <strong>Shortcuts in Code Editor:</strong>
                                        <code>bscontainer</code>, <code>bsrow</code>, <code>bscol</code>, <code>bsbtn</code>, <code>bscard</code>, <code>bsimg</code> + Tab
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1">
                            <div class="col-12">
                                <div class="image-uploader-box">
                                    <h5><i class="typcn typcn-image"></i> Quick Image Upload</h5>
                                    <div class="input-group">
                                        <input type="file" id="upload_img" class="form-control" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp">
                                        <button type="button" class="btn btn-info" id="btn_upload">Upload Now</button>
                                    </div>
                                    <div id="upload_status" class="mt-2"></div>
                                    <div class="uploaded-images-list" id="uploaded_images"></div>
                                </div>
                            </div>
                        </div>

                        <div class="row form-sample1" style="margin-top:30px;">
                            <div class="col-md-12 text-center">
                                <button type="submit" id="btn_save" class="btn btn1 btn-success btn-md">
                                    <span id="btn_save_text"><?php echo ($type == 'add_new') ? 'Create Page' : 'Save and Update File'; ?></span>
                                </button>
                                <button type="button" onclick="location.href = '<?php echo $base_url; ?>index.php/C_other_pages/open_listingform'" class="btn btn1 btn-secondary btn-md">Cancel</button>
                            </div>
                        </div>
                        <?php echo form_close(); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.2/ace.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.2/ext-language_tools.min.js"></script>

<script>
    var currentEditor = 'visual';
    var aceEditor;
    var tinyEditor;
    var baseUrl = '<?php echo $base_url; ?>';

    $(document).ready(function() {
        // Initialize TinyMCE
        tinymce.init({
            selector: '#page_content_visual',
            height: 500,
            base_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2',
            suffix: '.min',
            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image media link | code | help',
            content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
            relative_urls: false,
            remove_script_host: false,
            image_advtab: true,
            image_title: true,
            automatic_uploads: true,
            images_upload_handler: function(blobInfo, progress) {
                return new Promise(function(resolve, reject) {
                    var xhr, formData;
                    xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', baseUrl + 'index.php/C_other_pages/upload_image');

                    xhr.upload.onprogress = function(e) {
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
                        // Resolve with the full URL
                        resolve(baseUrl + json.url);
                    };

                    xhr.onerror = function() {
                        reject('Image upload failed due to a network error.');
                    };

                    formData = new FormData();
                    formData.append('upload_img', blobInfo.blob(), blobInfo.filename());
                    xhr.send(formData);
                });
            },
            setup: function(editor) {
                tinyEditor = editor;
                editor.on('init', function() {
                    console.log('TinyMCE Initialized');
                });
            }
        });

        // Initialize Ace Editor
        aceEditor = ace.edit("editor");
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode("ace/mode/html");
        aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showPrintMargin: false,
            wrap: true,
            fontSize: 14,
            tabSize: 2,
            useSoftTabs: true,
            enableEmmet: true
        });
        aceEditor.setBehavioursEnabled(true);
        aceEditor.session.setUseWorker(true);

        var snippetManager = ace.require("ace/snippets").snippetManager;
        var bootstrapSnippets = [{
                name: "container",
                content: '<div class="container">\n\t$1\n</div>',
                tabTrigger: "bscontainer"
            },
            {
                name: "row",
                content: '<div class="row">\n\t$1\n</div>',
                tabTrigger: "bsrow"
            },
            {
                name: "col",
                content: '<div class="col-md-${1:6}">\n\t$2\n</div>',
                tabTrigger: "bscol"
            },
            {
                name: "button",
                content: '<button type="button" class="btn btn-${1:primary}">$2</button>',
                tabTrigger: "bsbtn"
            },
            {
                name: "card",
                content: '<div class="card">\n\t<div class="card-body">\n\t\t$1\n\t</div>\n</div>',
                tabTrigger: "bscard"
            },
            {
                name: "img",
                content: '<img src="${1:<?php echo $base_url; ?>assets/images/}" alt="$2" class="img-fluid">',
                tabTrigger: "bsimg"
            }
        ];
        snippetManager.register(bootstrapSnippets, "html");

        $('#pageForm').on('submit', function(e) {
            // Sync editor content before submit
            if (currentEditor === 'visual' && tinyEditor) {
                tinymce.triggerSave();
            } else {
                $('#page_content_visual').val(aceEditor.getValue());
            }
            // Show loader and disable button
            var btn = $('#btn_save');
            btn.prop('disabled', true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
            $('#ajax_loader').addClass('show');
            // Allow native submit to proceed (no AJAX needed — form posts normally)
        });

        $('#btn_upload').on('click', function() {
            var file_data = $('#upload_img').prop('files')[0];

            // Use shared General.js validator — image only, max 5MB
            if (!validateFileInput(file_data, {
                inputId:  'upload_img',
                label:    'Image',
                maxSizeMB: 5
            })) return;

            var form_data = new FormData();
            form_data.append('upload_img', file_data);
            $('#upload_status').html('<span class="text-info">Uploading...</span>');
            $.ajax({
                url: baseUrl + 'index.php/C_other_pages/upload_image',
                type: 'post',
                data: form_data,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(response) {
                    if (response.status == 1) {
                        var fullUrl = baseUrl + '../' + response.url;
                        var phpCode = baseUrl + response.url;
                        var html = '<div class="img-item"><img src="' + fullUrl + '"><span class="img-path">' + response.url + '</span><button type="button" class="btn btn-xs btn-primary mt-1 w-100 insert-to-editor" data-php="' + phpCode + '">Insert</button></div>';
                        $('#uploaded_images').prepend(html);
                        $('#upload_status').html('<span class="text-success">✓ Uploaded!</span>');
                        $('#upload_img').val('');
                    } else {
                        $('#upload_status').html('<span class="text-danger">' + response.error + '</span>');
                    }
                }
            });
        });

        $(document).on('click', '.insert-to-editor', function() {
            var phpCode = $(this).data('php');
            var tag = '<img src="' + phpCode + '" alt="" style="max-width:100%;">';
            if (currentEditor === 'visual' && tinyEditor) {
                tinyEditor.insertContent(tag);
            } else {
                aceEditor.insert(tag);
            }
        });
    });

    function switchEditor(mode) {
        if (mode === 'visual') {
            if (currentEditor === 'code') {
                if (tinyEditor) {
                    tinyEditor.setContent(aceEditor.getValue());
                } else {
                    $('#page_content_visual').val(aceEditor.getValue());
                }
            }
            $('#visual_editor_container').show();
            $('#code_editor_container').hide();
            $('#toggle_visual').removeClass('btn-outline-primary').addClass('btn-primary');
            $('#toggle_code').removeClass('btn-secondary').addClass('btn-outline-secondary');
            currentEditor = 'visual';
        } else {
            if (currentEditor === 'visual') {
                if (tinyEditor) {
                    tinymce.triggerSave();
                }
                aceEditor.setValue($('#page_content_visual').val(), -1);
            }
            $('#visual_editor_container').hide();
            $('#code_editor_container').show();
            $('#toggle_code').removeClass('btn-outline-secondary').addClass('btn-secondary');
            $('#toggle_visual').removeClass('btn-primary').addClass('btn-outline-primary');
            currentEditor = 'code';
        }
    }
</script>

<?php $this->load->view("include/footer"); ?>
