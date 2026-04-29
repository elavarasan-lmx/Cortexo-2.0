<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php'); // Shared confirmation modal
$model_name = "commodity_model";
$controller_name = "C_commodity_master";
?>
<style>
    .edit_values,
    .edit_value,
    .select_status,
    .select_comtype {
        /* text-decoration: underline !important; */
        color: #007bff !important;
    }

    table {
        table-layout: fixed;
        width: 100%;
        /* optional but recommended */
    }

    th,
    td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
<script>
    // Delete function with limit order pre-check
    function deleteCommodity(id) {
        // First check for active limit orders
        $.ajax({
            url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/check_commodity_limits',
            type: 'POST',
            dataType: 'json',
            data: { com_id: id, com_active: 0 },
            success: function(limitResp) {
                var title = 'Delete Confirmation';
                var message = 'Are you sure you want to delete this commodity?';

                if (limitResp.has_limits === true) {
                    title = '⚠️ Active Limit Orders Found';
                    message = limitResp.message + '\n\nThis commodity will also be permanently deleted.';
                }

                showConfirmModal(title, message, function() {
                    $.ajax({
                        url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id,
                        type: 'POST',
                        dataType: 'json',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        success: function(response) {
                            if (response.status === 'success') {
                                showToast(response.message, 'success');
                                setTimeout(function() { window.location.reload(); }, 1000);
                            } else if (response.blocked) {
                                showDeleteBlockedModal(response.message);
                            } else {
                                showToast(response.message, 'danger');
                            }
                        },
                        error: function(xhr, status, error) {
                            showToast('Delete failed: ' + error, 'danger');
                        }
                    });
                });
            },
            error: function() {
                // Fallback: proceed without limit check
                showConfirmModal('Delete Confirmation', 'Are you sure you want to delete this commodity?', function() {
                    $.ajax({
                        url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id,
                        type: 'POST',
                        dataType: 'json',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        success: function(response) {
                            if (response.status === 'success') {
                                showToast(response.message, 'success');
                                setTimeout(function() { window.location.reload(); }, 1000);
                            } else if (response.blocked) {
                                showDeleteBlockedModal(response.message);
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
        });
    }

    $(document).ready(function() {
        let currentPopover = null;

        function showPopover(element, content) {
            if (currentPopover) currentPopover.popover('dispose');
            element.popover({
                content: content,
                html: true,
                placement: 'bottom',
                trigger: 'manual',
                sanitize: false
            }).popover('show');
            currentPopover = element;
        }

        function closePopover() {
            if (currentPopover) currentPopover.popover('dispose');
        }

        // Editable Text Field
        $(document).on('click', '.edit_values', function(e) {
            e.stopPropagation();
            let element = $(this),
                id = element.data('pk'),
                field = element.data('name'),
                value = element.text().trim();

            showPopover(element, `
            <input type="text" class="form-control edit-input" value="${value}">
            <div class="mt-2 d-flex">
                <button class="btn btn-sm btn-success save-btn" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);
            setTimeout(function() {
                $('.edit-input').on('keydown', function(event) {
                    let fieldName = field;
                    console.log(fieldName, 'fieldName');

                    if (fieldName === 'com_name') {
                        validateKeyPress(event, this, 4);
                        $(this).attr('maxlength', '50');
                        $(this).attr('minlength', '4');
                    } else if (fieldName === 'com_weight') {
                        validateKeyPress(event, this, 2);
                    } else if (fieldName === 'com_order_number') {
                        validateKeyPress(event, this, 1);
                        $(this).attr('maxlength', '2');
                    }
                });

                // Add input event listener for minlength check during typing or blurring
                $('.edit-input').on('input blur', function() {
                     let fieldName = field;
                     if (fieldName === 'com_name') {
                        let val = $(this).val();
                        if(val.length < 4) {
                             $(this).css('border', '1px solid red');
                             // Optionally disable save button or show error
                             $('.save-btn').prop('disabled', true);
                        } else {
                             $(this).css('border', '');
                             $('.save-btn').prop('disabled', false);
                        }
                     }
                });
            }, 100);
        });

        $(document).on('click', '.edit_value', function(e) {
            e.stopPropagation();
            let element = $(this),
                id = element.data('pk'),
                field = element.data('weight'),
                value = element.text().trim();

            showPopover(element, `
            <input type="text" class="form-control edit-input" value="${value}">
            <div class="mt-2 d-flex">
                <button class="btn btn-sm btn-success save-btns" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);
            setTimeout(function() {
                $('.edit-input').on('keydown', function(event) {
                    let fieldName = field;
                    console.log(fieldName, 'fieldName');

                    if (fieldName === 'com_name') {
                        validateKeyPress(event, this, 4);
                        $(this).attr('maxlength', '50');
                    } else if (fieldName === 'com_weight') {
                        validateKeyPress(event, this, 2);
                    } else if (fieldName === 'com_order_number') {
                        validateKeyPress(event, this, 1);
                        $(this).attr('maxlength', '2');
                    }
                });
            }, 100);
        });
        // Editable Select Dropdown
        $(document).on('click', '.select_status', function(e) {
            e.stopPropagation();
            let element = $(this),
                id = element.data('pk'),
                field = element.data('name'),
                value = element.text().trim();

            showPopover(element, `
            <select class="form-select edit-select">
                <option value="1" ${value === "Active" ? "selected" : ""}>Active</option>
                <option value="0" ${value === "Disabled" ? "selected" : ""}>Disabled</option>
            </select>
            <div class="mt-2 d-flex">
                <button class="btn btn-sm btn-success save-select" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);
        });

        $(document).on('click', '.select_comtype', function(e) {
            e.stopPropagation();
            let element = $(this),
                id = element.data('pk'),
                field = element.data('name'),
                value = element.text().trim();
            <?php $com_types = $this->$model_name->getrpanelcommodities(); ?>
            var com_types = <?php echo $com_types ?>;
            console.log(com_types, 'com_types'); // 
            let options = com_types.map(c =>
                `<option value="${c.value}" ${c.text === value ? 'selected' : ''}>${c.text}</option>`
            ).join('');

            showPopover(element, `
           	<select class="form-select edit-select">
                    ${options	}
            </select>
            <div class="mt-2 d-flex">
                <button class="btn btn-sm btn-success save-select" data-id="${id}" data-name="${field}">OK</button>
                <button class="btn btn-sm btn-danger cancel-btn ms-2">Cancel</button>
            </div>
        `);
        });

        // Save Text Input
        $(document).on('click', '.save-btn', function() {
            let newValue = $('.edit-input').val(),
                pk = $(this).data('id'),
                field = $(this).data('name');
            if (newValue === '') {
                showFlashMessage(null, 'This field is required');
                return;
            }
            updateData(pk, field, newValue, `.edit_values[data-pk="${pk}"][data-name="${field}"]`);
        });

        $(document).on('click', '.save-btns', function() {
            let newValue = $('.edit-input').val(),
                pk = $(this).data('id'),
                field = $(this).data('name');
            console.log(field, 'field');

            if (newValue === '') {
                showFlashMessage(null, 'This field is required');
                return;
            }
            updateWeight(pk, field, newValue, `.edit_value[data-id="${pk}"][data-name="${field}"]`);
        });

        // Save Select Dropdown
        $(document).on('click', '.save-select', function() {
            let newValue = $('.edit-select').val(),
                id = $(this).data('id'),
                field = $(this).data('name');
            updateStatus(id, field, newValue, `.select_status[data-pk="${id}"][data-name="${field}"]`);
        });

        function updateWeight(pk, field, value, selector) {
            $.post('<?php echo $this->config->item('base_url'); ?>index.php/C_commodity_master/update_weight', {
                        com_id: pk,
                        com_rest_weight: value,
                        com_weight: field
                    },
                    function(response) {
                        if (response === "1" || response == 1) {
                            $(selector).text(value);
                            showToast("Updated successfully", "success");
                        } else {
                            showToast("Update failed: " + response, "danger");
                        }
                        closePopover();
                    }, 'json')
                .fail(() => showToast("Updating failed", "danger"));
        }

        function updateData(pk, field, value) {
            $.post(
                base_url + "index.php/C_commodity_master/inline_update", {
                    pk: pk,
                    name: field,
                    value: value
                },
                function(response) {
                    if (response.success) {
                        let selector = `.edit_values[data-pk="${pk}"][data-name="${field}"]`;
                        $(selector).html(value);
                        showToast("Updated successfully", "success");
                    } else {
                        showToast(response.error, "danger");
                    }
                    closePopover();
                },
                "json"
            ).fail(() => showToast("Updating failed", "danger"));
        }

        // function updateStatus(pk, field, value) {
        //     $.post(
        //         base_url + "index.php/C_commodity_master/inline_update", {
        //             pk: pk,
        //             name: field,
        //             value: value
        //         },
        //         function(response) {
        //             if (response.success) {
        //                 let selector = `.select_status[data-pk="${pk}"][data-name="${field}"]`;
        //                 let label = value == "1" ? "Active" : "Disabled";
        //                 $(selector).html(label);
        //                 showToast("Updated successfully", "success");
        //             } else {
        //                 showToast(response.error, "danger");
        //             }
        //             closePopover();
        //         },
        //         "json"
        //     );
        // }

        function updateStatus(pk, field, value) {

            $.post(
                base_url + "index.php/C_commodity_master/inline_update", {
                    pk: pk,
                    name: field,
                    value: value
                },
                function(response) {

                    // ─── BZ: Limit Order Guard ───
                    // If backend returns a warning about active limit orders,
                    // show confirmation dialog before proceeding
                    if (response.warning === true) {
                        closePopover();
                        showConfirmModal(
                            '⚠️ Active Limit Orders Found',
                            response.message + '\n\nAll pending limit orders for this commodity will be cancelled.',
                            function() {
                                // Admin confirmed — resend with force_cancel flag
                                $.post(
                                    base_url + "index.php/C_commodity_master/inline_update", {
                                        pk: pk,
                                        name: field,
                                        value: value,
                                        force_cancel: 1
                                    },
                                    function(forceResponse) {
                                        if (forceResponse.success === true) {
                                            let selector = `.select_status[data-pk="${pk}"][data-name="${field}"]`;
                                            $(selector).html("Disabled");
                                            showToast("Commodity deactivated. " + (forceResponse.cancelled || '') + " limit order(s) cancelled.", "success");
                                        } else {
                                            showToast(forceResponse.error || "Deactivation failed", "danger");
                                        }
                                    },
                                    "json"
                                );
                            }
                        );
                        return;
                    }

                    if (response.success === true) {

                        // Choose correct selector based on field name
                        let selector =
                            field === "com_active" ?
                            `.select_status[data-pk="${pk}"][data-name="${field}"]` :
                            `.select_comtype[data-pk="${pk}"][data-name="${field}"]`;

                        // If type dropdown, use text label from options
                        if (field === "com_type") {
                            let selectedText = $('.edit-select option:selected').text();
                            $(selector).html(selectedText);
                        }

                        // If status dropdown
                        if (field === "com_active") {
                            let displayText = value == "1" ? "Active" : "Disabled";
                            $(selector).html(displayText);
                        }

                        showToast("Updated successfully", "success");
                    } else {
                        showToast(response.error, "danger");
                    }
                    closePopover();
                },
                "json"
            );
        }


        // Close popover on clicking outside or cancel button
        $(document).on('click', '.cancel-btn', closePopover);
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.popover, .edit_values, .select_status').length) closePopover();
        });
    });
</script>
<script>
    <?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
        showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
    <?php endif; ?>
</script>
<div class="main-panel">
    <div class="content-wrapper">
        <div class="row">
            <div class="col-lg-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Commodity List <a href="<?php echo $this->config->item('base_url') . "index.php/C_commodity_master/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> </h4>
                        <p class="card-description"> </p>
                        <div class="table-responsive">
                            <?php
                            $commodities = ($this->$model_name->get_data()->result_array());
                            $editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
                            $deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
                            ?>
                            <table id="grid-data" class="table table-hover1 datatable">
                                <thead>
                                    <tr>
                                        <th style="width: 20px;">ID</th>
                                        <th style="width: 120px;">Product</th>
                                        <th style="width: 20px;">Type</th>
                                        <th style="width: 30px;">Weight</th>
                                        <th style="width: 30px;">Order No</th>
                                        <th style="display: none;">Update Wt</th>
                                        <th style="display: none;">Bal Weight</th>
                                        <th style="width: 40px;">Status</th>
                                        <th data-sortable="false" style="width: 90px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="commodity_listing">
                                    <?php
                                    foreach ($commodities as $com) {

                                        $com_type_status = ($com['com_active'] == "Active" ? 1 : 0);
                                        echo '<tr>
													<td>' . $com['com_id'] . '</td>
													<td class="edit_values" data-name="com_name" data-pk="' . $com['com_id'] . '" data-type="text" data-placement="right" data-title="Enter Commodity name">' . $com['com_name'] . '</td>
													<td class="select_comtype" data-name="com_type" data-pk="' . $com['com_id'] . '" data-type="select" data-placement="right" data-title="Enter Commodity type"  data-value="' . $com['com_type'] . '">' . $com['rcom_disname'] . '</td>
													<td class="edit_values" data-name="com_weight" data-pk="' . $com['com_id'] . '" data-type="text" data-placement="right" data-title="Enter weight">' . $com['com_weight'] . '</td>
													<td class="edit_values" data-name="com_order_number" data-pk="' . $com['com_id'] . '" data-type="text" data-placement="right" data-title="Enter sequence number">' . $com['com_order_number'] . '</td>
													<td style="display: none;" class="edit_value" data-weight="' . $com['com_rest_wt'] . '" data-name="update_weight" data-pk="' . $com['com_id'] . '" data-type="text" data-placement="right" data-title="Enter update number">' . $com['update_weight'] . '</td>
													<td style="display: none;">' . $com['com_rest_wt'] . '</td>
													<td class="select_status" data-name="com_active" data-type="select" data-pk="' . $com['com_id'] . '" data-placement="right" data-title="Select Status"   data-value="' . $com_type_status . '">' . $com['com_active'] . '</td>
													<td>
														<a class="btn btn-success btn-sm btn-sm1" href=' . $editLink . $com['com_id'] . '>
															<i class="typcn typcn-edit btn-icon-append"></i>
															Edit
														</a>
														<a class="btn btn-danger btn-sm btn-sm1" onclick="deleteCommodity(' . $com['com_id'] . '); return false;" href="#">
															<i class="typcn typcn-delete-outline btn-icon-append"></i>
															Delete
														</a>
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