<!DOCTYPE html>
<html>
<head>
    <title>File Manager</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <style>
        body { padding: 20px; background: #f4f7f6; }
        .image-card {
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
            height: 100%;
        }
        .image-card:hover .delete-btn { display: flex; }
        .delete-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 24px;
            height: 24px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            z-index: 10;
        }
        .delete-btn:hover { background: #dc3545; transform: scale(1.1); }
        .image-card:hover { border-color: #25b9d7; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .image-container {
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafafa;
            padding: 10px;
        }
        .image-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .image-name {
            padding: 8px;
            font-size: 11px;
            text-align: center;
            word-break: break-all;
            color: #666;
            background: #fff;
            border-top: 1px solid #eee;
        }
        .header-bar {
            position: sticky;
            top: -20px;
            z-index: 100;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
    </style>
</head>
<body>

<div class="header-bar">
    <h5 class="m-0">Image Browser</h5>
    <div class="d-flex gap-2">
        <form id="uploadForm" class="d-flex gap-2">
            <input type="file" name="upload_img" id="uploadInput" class="form-control form-control-sm" accept="image/*" style="width: auto;">
            <button type="submit" class="btn btn-sm btn-primary" id="uploadBtn">Upload New</button>
        </form>
        <button class="btn btn-sm btn-outline-secondary" onclick="window.close()">Close</button>
    </div>
</div>

<div id="imageGrid" class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
    <?php if ($images): ?>
        <?php foreach ($images as $img): ?>
            <div class="col">
                <div class="image-card">
                    <div class="delete-btn" title="Delete Image" onclick="event.stopPropagation(); deleteImage('<?php echo $img; ?>')">
                        &times;
                    </div>
                    <div onclick="selectImage('<?php echo 'assets/images/' . $img; ?>', '<?php echo $img; ?>')">
                        <div class="image-container">
                            <img src="<?php echo base_url(); ?>../assets/images/<?php echo $img; ?>">
                        </div>
                        <div class="image-name"><?php echo $img; ?></div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <div class="col-12 text-center py-5">
            <p class="text-muted">No images found in assets/images/</p>
        </div>
    <?php endif; ?>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    // List of existing files for duplicate check
    var existingFiles = <?php echo json_encode($images ?: []); ?>;

    function selectImage(url, fileName) {
        // Construct clear absolute URL
        var siteBase = '<?php echo base_url(); ?>../';
        var fullUrl = siteBase + url;
        
        // Clean URL (resolve all ../ and merge slashes)
        var absoluteUrl = new URL(fullUrl).href;
        
        if (window.opener) {
            window.opener.postMessage({
                mceAction: 'insertCustomImage',
                url: absoluteUrl,
                name: fileName
            }, '*');
            window.close();
        }
    }

    function deleteImage(fileName) {
        if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

        $.ajax({
            url: '<?php echo base_url(); ?>index.php/C_other_pages/delete_image',
            type: 'POST',
            data: { file_name: fileName },
            dataType: 'json',
            success: function(response) {
                if (response.status == 1) {
                    location.reload();
                } else {
                    showToast('Error: ' + response.message, "warning");
                }
            },
            error: function() {
                showToast('An error occurred during deletion.', "warning");
            }
        });
    }

    $(document).ready(function() {
        $('#uploadForm').on('submit', function(e) {
            e.preventDefault();
            var fileInput = $('#uploadInput')[0];
            if (fileInput.files.length === 0) {
                showToast('Please select a file first.', "warning");
                return;
            }

            var fileName = fileInput.files[0].name.replace(/\s+/g, '_');
            // Duplicate check
            if (existingFiles.includes(fileName)) {
                if (!confirm('A file named "' + fileName + '" already exists. Do you want to overwrite it?')) {
                    return;
                }
            }

            var formData = new FormData(this);
            var btn = $('#uploadBtn');
            btn.html('Uploading...').prop('disabled', true);

            $.ajax({
                url: '<?php echo base_url(); ?>index.php/C_other_pages/upload_image',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(response) {
                    btn.html('Upload New').prop('disabled', false);
                    if (response.status == 1) {
                        location.reload();
                    } else {
                        alert('Upload failed: ' + (response.error || 'Unknown error'));
                    }
                },
                error: function() {
                    btn.html('Upload New').prop('disabled', false);
                    showToast('An error occurred during upload.', "warning");
                }
            });
        });
    });
</script>

</body>
</html>
