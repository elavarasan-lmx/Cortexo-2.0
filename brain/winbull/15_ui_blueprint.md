# Winbull — UI Blueprint (Brain Artifact 15)

> Single source of truth for every visual pattern.
> Every listing page, entry form, button, and interaction must match this blueprint.
> Read before writing any view file or JS save handler.

---

## 1. Button Colors & Classes

| Action | Class | Color |
|--------|-------|-------|
| Add New | `btn btn-primary` | Blue `#007bff` |
| Edit | `btn btn-warning btn-sm` | Yellow `#ffc107` |
| Delete | `btn btn-danger btn-sm` | Red `#dc3545` |
| Save | `btn btn-success` | Green `#28a745` |
| Update | `btn btn-success` | Green `#28a745` |
| Cancel | `btn btn-light` | Light grey |
| Back to List | `btn btn-secondary` | Grey `#6c757d` |
| Activate | `btn btn-success btn-sm` | Green |
| Deactivate | `btn btn-secondary btn-sm` | Grey |
| Export Excel | `btn btn-success btn-sm` | Green |
| Print | `btn btn-info btn-sm` | Cyan `#17a2b8` |
| View / Details | `btn btn-info btn-sm` | Cyan |

---

## 2. Status Badges

| Status | Badge Class |
|--------|------------|
| Active | `badge badge-success` |
| Inactive | `badge badge-danger` |
| Pending | `badge badge-warning text-dark` |
| Processing | `badge badge-info` |
| Confirmed | `badge badge-primary` |
| Cancelled | `badge badge-secondary` |
| KYC Approved | `badge badge-success` |
| KYC Pending | `badge badge-warning text-dark` |
| KYC Rejected | `badge badge-danger` |

---

## 3. DataTable Config (Standard)

```javascript
$('#grid-data').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": { "url": base_url + "index.php/C_Module/DB_Controller/model/listing", "type": "POST" },
    "columns": [
        { "data": "DT_RowIndex", "orderable": false, "searchable": false, "width": "5%" },
        { "data": "name" },
        { "data": "status", "orderable": false, "searchable": false },
        { "data": "action", "orderable": false, "searchable": false, "width": "20%" }
    ],
    "order": [[1, "asc"]],
    "pageLength": 25,
    "lengthMenu": [10, 25, 50, 100],
    "language": {
        "emptyTable": "No records found",
        "zeroRecords": "No matching records found",
        "processing": '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>'
    },
    "responsive": true
});

// Search input — maxlength + special char block
$('#grid-data').on('init.dt', function() {
    var $s = $(this).closest('.dataTables_wrapper').find('input[type="search"]');
    $s.attr('maxlength', 30);
    $s.on('input keyup', function() {
        var val = $(this).val();
        if (val.length > 0 && !/[a-zA-Z0-9]/.test(val)) {
            showToast('Search must contain at least one letter or number.', 'warning');
            $(this).val(''); $('#grid-data').DataTable().search('').draw();
        }
    });
});
```

---

## 4. Delete Function (Standard)

```javascript
function deleteRecord(id) {
    showConfirmModal('Delete Confirmation', 'Are you sure you want to delete this record?', function() {
        $.ajax({
            url: base_url + 'index.php/C_Module/DB_Controller/model/delete/' + id,
            type: 'POST',
            dataType: 'json',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            success: function(response) {
                if (response.status === 'success') {
                    showToast(response.message, 'success');
                    setTimeout(function() { window.location.reload(); }, 1000);
                } else if (response.type === 'blocked') {
                    showDeleteBlockedModal(response.message);
                } else {
                    showToast(response.message, 'danger');
                }
            },
            error: function(xhr, status, error) { showToast('Delete failed: ' + error, 'danger'); }
        });
    });
}
```

---

## 5. AJAX Loader

```html
<!-- Before <div class="main-panel"> -->
<div id="ajax_loader">
    <img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<style>
#ajax_loader { position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,.5); z-index:9999; display:none;
    justify-content:center; align-items:center; }
#ajax_loader.show { display:flex; }
</style>
```

```javascript
$("#ajax_loader").addClass("show");   // show
$("#ajax_loader").removeClass("show"); // hide
```

---

## 6. AJAX Form Submit Handler (Standard)

```javascript
$("#iframeForm").on("submit", function(e) {
    e.preventDefault();
    var form = $(this);
    var btn = form.find('button[type="submit"]');
    var btnText = btn.text();
    btn.prop('disabled', true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
    $("#ajax_loader").addClass("show");

    $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize(),
        dataType: 'json',
        success: function(response) {
            $("#ajax_loader").removeClass("show");
            if (response.status === 'success') {
                showToast(response.message, 'success');
                setTimeout(function() {
                    window.location.href = base_url + 'index.php/C_Module/open_listingform';
                }, 1000);
            } else {
                btn.prop('disabled', false).text(btnText);
                showToast(response.message || 'Failed to save.', 'error');
            }
        },
        error: function() {
            $("#ajax_loader").removeClass("show");
            btn.prop('disabled', false).text(btnText);
            showToast('Server error. Please try again.', 'error');
        }
    });
});
```

---

## 7. Controller Response Formats

### Add New — Flashdata + Redirect
```php
$result = $this->$model->insert_record($id);
if ($result['status'] == 1) {
    $this->session->set_flashdata('success', 'Record added successfully.');
} else {
    $this->session->set_flashdata('error', $result['message'] ?? 'Failed.');
}
redirect('C_Module/open_listingform');
```

### Edit — Return JSON
```php
$result = $this->$model->update_record($id);
if ($this->db->trans_status() === TRUE) { $this->db->trans_commit(); }
else { $this->db->trans_rollback(); echo json_encode(['status'=>'error','message'=>'DB error.']); return; }
echo json_encode(['status' => 'success', 'message' => 'Saved successfully.']);
```

### Delete — Return JSON
```php
$result = $this->$model->delete_record($id);
if (empty($result['status'])) {
    $this->db->trans_rollback();
    echo json_encode(['status'=>'error','type'=>$result['type']??'error','message'=>$result['message']??'Delete failed.']);
    return;
}
$this->db->trans_commit();
echo json_encode(['status' => 'success', 'message' => 'Record deleted successfully!']);
```

---

## 8. Save Button — Conditional Label
```php
<button type="submit" id="btn_save" class="btn btn-success">
    <?= ($status == 'edit') ? 'Update' : 'Save'; ?>
</button>
```

---

## 🚫 BANNED Patterns

| ❌ Never Use | ✅ Use Instead |
|-------------|---------------|
| `alert('message')` | `showToast(msg, 'error')` |
| `confirm('sure?')` | `showConfirmModal()` |
| `window.location.href` for delete | AJAX + `showToast` |
| `id="submit"` on save button | `id="btn_save"` |
| Hardcoded "Save" on edit page | Conditional `Update`/`Save` |
| Model sets `set_flashdata` | Controller sets flashdata, model returns array |
| Raw `<form>` tag | `form_open()` with CSRF |
| `$this->db->query("... $var ...")` | Query builder: `get_where()`, `where()` |
