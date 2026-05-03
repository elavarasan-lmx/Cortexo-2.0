<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = "news_model";
$controller_name = "c_news";

?>
<!--<div>
        <ul class="breadcrumb">
             <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
            <li><a href="#">Settings</a></li>
			<li><a href="#">News And Events Listing</a></li>
        </ul>
    </div>-->
<script>
    <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
        showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
    <?php endif; ?>
</script>
<script>
    function deleteNews(id) {
        showConfirmModal('Delete News', 'Are you sure you want to delete this news item?', function() {
            $.ajax({
                url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id,
                type: 'POST',
                dataType: 'json',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function(response) {
                    if (response.status === 'success') {
                        showToast(response.message, 'success');
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showToast(response.message, 'danger');
                    }
                },
                error: function(xhr, status, error) {
                    showToast('Delete failed: ' + error, 'danger');
                }
            });
        });
    }
</script>

<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-lg-12 grid-margin stretch-card">
                <div class="card antigravity">
                    <div class="card-body">
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> News And Event List
                            <?php if ($userrights["add"] == 1) { ?>
                                <a href="<?php echo $this->config->item('base_url') . "index.php/C_news/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
                            <?php } ?>
                        </h4>
                        <p class="card-description"> </p>

                        <div class="table-responsive">
                            <?php
                            $news = ($this->$model_name->get_data()->result_array());
                            $editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
                            $deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
                            ?>
                            <table id="grid-data" class="table table-hover1 datatable">
                                <thead>
                                    <tr>
                                        <th data-column-id="com_name" width="50">ID</th>
                                        <th data-column-id="com_type">News Title</th>
                                        <th data-column-id="com_type">Status</th>
                                        <th width="200" data-column-id="commands" data-formatter="commands" data-sortable="false">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="commodity_listing">
                                    <?php
                                    foreach ($news as $new) {
                                        if ($new['status'] == 1) {
                                            $status = "Active";
                                        } else {

                                            $status = "InActive";
                                        }
                                        $editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $new['news_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
                                        $deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" href="#" onclick="deleteNews(' . $new['news_id'] . '); return false;">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
                                        echo '<tr>
													<td>' . $new['news_id'] . '</td>
													<td>' . $new['news'] . '</td>
													<td>' . $status . '</td>
													<td>
														' . $editLink . '
														' . $deleteLink . '
													</td>
												</tr>';
                                    }
                                    ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- partial -->
</div>
<?php $this->load->view('include/footer.php'); ?>
