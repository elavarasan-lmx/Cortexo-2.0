<?php
class C_other_pages extends My_Controller
{
    var $menu_code    = 85;
    var $form_entry = "other_pages_entry";
    var $model_name = 'Other_pages_model';

    public function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
        $this->load->model('Other_pages_model');
    }

    function index() {}

    function open_listingform($db_error_msg = "")
    {
        $data["db_error_msg"] = $db_error_msg;
        $data['records'] = $this->Other_pages_model->get_data()->result_array();
        $data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);

        if ($this->session->userdata("usermenurights")) {
            foreach ($this->session->userdata("usermenurights") as $key => $val) {
                if ($val["menuid"] == $this->menu_code) {
                    $data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
                }
            }
        } else {
            $data["userrights"] = array("view" => 1, "add" => 1, "edit" => 1, "delete" => 1, "sms" => 1, "email" => 1, "notification" => 1);
        }

        if ($data["userrights"]['view'] == 1) {
            $this->load->view('other_pages_listing', $data);
        } else {
            $this->load->view('access_denied');
        }
    }

    function open_entryform($model_name = "", $type = "", $id = "")
    {
        $this->load->model('other_pages_model');
        if ($type == 'add_new') {
            $this->$model_name->empty_record();
            $_POST['fv']['type']    =    $type;
        } else if ($type == 'edit' || $type == 'delete') {
            // $id is the slug now
            $record                    =    $this->$model_name->get_entry_record($id);
            if (!$record) {
                $this->session->set_flashdata('error', 'Page not found.');
                redirect("/C_other_pages/open_listingform/");
            }
            $_POST['fv']            =    $record;
            $_POST['fv']['type']    =    $type;
            $_POST['fv']['code']    =    $id;
        }

        $_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
        if ($this->session->userdata("usermenurights")) {
            foreach ($this->session->userdata("usermenurights") as $key => $val) {
                if ($val["menuid"] == $this->menu_code) {
                    $_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
                }
            }
        } else {
            $_POST['fv']["userrights"] = array("view" => 1, "add" => 1, "edit" => 1, "delete" => 1, "sms" => 1, "email" => 1, "notification" => 1);
        }

        $this->load->view($this->form_entry, $_POST['fv']);
    }

    function DB_Controller($model_name = "", $status = "", $id = "")
    {
        $this->load->model('other_pages_model');
        // Transactions removed as we are not using DB for content
        if ($status == 'add_new') {
            $result = $this->$model_name->insert_record($id);
            $msg = $result['status'] == 1 ? 'Page added successfully.' : 'Failed to add page.';
        } else if ($status == 'edit') {
            $result = $this->$model_name->update_record($id);
            $msg = $result['status'] == 1 ? 'Page updated successfully.' : 'Failed to update page.';
        } else if ($status == 'delete') {
            $result = $this->$model_name->delete_record($id);
            $msg = $result['status'] == 1 ? 'Page deleted successfully.' : 'Failed to delete page.';
        }

        if ($result['status'] == 1) {
            $this->session->set_flashdata('success', $msg);
            redirect("/C_other_pages/open_listingform/");
        } else {
            $db_error_msg = isset($result['error']) ? $result['error'] : 'Operation failed.';
            $this->session->set_flashdata('error', $db_error_msg);

            if ($status == "delete") {
                $this->open_listingform($db_error_msg);
            } else {
                $_POST['fv']['type'] = $status;
                $_POST['fv']['db_error_msg'] = $db_error_msg;
                $this->load->view($this->form_entry, $_POST['fv']);
            }
        }
    }

    function upload_image()
    {
        $this->load->model('Other_pages_model');
        $result = $this->Other_pages_model->upload_image();
        echo json_encode($result);
    }

    // AJAX-safe delete — returns JSON (used by listing page AJAX call)
    function delete_page_ajax()
    {
        header('Content-Type: application/json');

        if (!$this->input->is_ajax_request()) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
            return;
        }

        $slug = $this->uri->segment(3); // URL: C_other_pages/delete_page_ajax/{slug}
        if (empty($slug)) {
            echo json_encode(['status' => 'error', 'message' => 'Page slug is required.']);
            return;
        }

        $this->load->model('Other_pages_model');
        $result = $this->Other_pages_model->delete_record($slug);

        if ($result['status'] == 1) {
            echo json_encode(['status' => 'success', 'message' => 'Page removed successfully.']);
        } else {
            $msg = isset($result['error']) ? $result['error'] : 'Delete failed.';
            echo json_encode(['status' => 'error', 'message' => $msg]);
        }
    }

    // Simple Content Editor (Text & Images only)
    function open_simple_editor($slug = "")
    {
        if (empty($slug)) {
            $this->session->set_flashdata('error', 'Page not specified.');
            redirect("/C_other_pages/open_listingform/");
        }

        $this->load->model('Other_pages_model');
        $record = $this->Other_pages_model->get_entry_record($slug);

        if (!$record) {
            $this->session->set_flashdata('error', 'Page not found.');
            redirect("/C_other_pages/open_listingform/");
        }

        $data = $record;
        $data['type'] = 'edit';
        $data['userrights'] = array("view" => 1, "add" => 1, "edit" => 1, "delete" => 1, "sms" => 1, "email" => 1, "notification" => 1);


        $this->load->view('other_pages_simple', $data);
    }

    // Save CMS Content (AJAX) - PrestaShop Style
    function save_cms_content()
    {
        header('Content-Type: application/json');

        $slug = $this->input->post('page_slug');
        if (empty($slug)) {
            echo json_encode(['status' => 0, 'message' => 'Page not specified.']);
            return;
        }

        $content_file = APPPATH . 'config/page_content.json';
        $all_content = [];
        if (file_exists($content_file)) {
            $all_content = json_decode(file_get_contents($content_file), true);
        }
        $all_content_original = $all_content;

        // Handle image uploads
        $banner_path = isset($all_content[$slug]['banner_image']) ? $all_content[$slug]['banner_image'] : '';
        $side_path = isset($all_content[$slug]['side_image']) ? $all_content[$slug]['side_image'] : '';

        // If banner_image was cleared
        if ($this->input->post('banner_image') === '') {
            $banner_path = '';
        }

        $config['upload_path'] = '../assets/images/';
        $config['allowed_types'] = 'gif|jpg|png|jpeg|webp';
        $config['max_size'] = '5120';
        $config['remove_spaces'] = true;
        $this->load->library('upload', $config);

        if (!empty($_FILES['banner_image_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('banner_image_file')) {
                $data = $this->upload->data();
                $banner_path = 'assets/images/' . $data['file_name'];
            }
        }

        if (!empty($_FILES['side_image_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('side_image_file')) {
                $data = $this->upload->data();
                $side_path = 'assets/images/' . $data['file_name'];
            }
        }

        // Sanitize content to prevent XSS attacks
        $content = $this->input->post('content');

        // Remove dangerous tags but keep safe HTML
        $content = $this->security->xss_clean($content);

        // Additional security: strip script tags, iframes, and dangerous attributes
        $content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $content);
        $content = preg_replace('/<iframe\b[^>]*>(.*?)<\/iframe>/is', '', $content);
        $content = preg_replace('/on\w+\s*=\s*["\'][^"\']*["\']/i', '', $content); // Remove inline JS like onclick, onload
        $content = str_replace(['javascript:', 'vbscript:'], '', $content);

        // Save content to JSON with all CMS fields
        $all_content[$slug] = [
            'banner_image' => $banner_path,
            'title' => $this->security->xss_clean($this->input->post('title')),
            'meta_title' => $this->security->xss_clean($this->input->post('meta_title')),
            'meta_description' => $this->security->xss_clean($this->input->post('meta_description')),
            'meta_keywords' => $this->security->xss_clean($this->input->post('meta_keywords')),
            'content' => $content,
            'side_image' => $side_path,
            'displayed' => isset($all_content[$slug]['displayed']) ? $all_content[$slug]['displayed'] : 1,
            'indexation' => isset($all_content[$slug]['indexation']) ? $all_content[$slug]['indexation'] : 1
        ];

        // Handle slider images for home page
        if ($slug == 'home') {
            $slider_images = $this->input->post('slider_images');
            if (is_array($slider_images) && !empty($slider_images)) {
                $slider_images = array_filter($slider_images, function ($img) {
                    return !empty($img);
                });
                $slider_images = array_values($slider_images);
                $all_content[$slug]['slider_images'] = json_encode($slider_images);
            }
        }

        $old_data = isset($all_content_original[$slug]) ? $all_content_original[$slug] : [];
        $new_data = $all_content[$slug];

        if (file_put_contents($content_file, json_encode($all_content, JSON_PRETTY_PRINT))) {
            $this->load->helper('common');
            $changed_data = get_changed_fields($old_data, $new_data);
            $old_values = array();
            $new_values = array();
            foreach ($changed_data as $field => $values) {
                $old_values[$field] = $values['old'];
                $new_values[$field] = $values['new'];
            }
            if (!empty($changed_data)) {
                log_admin_edit('51', 'Other Pages', $old_values, $new_values, 'Admin - Updated CMS content for page: ' . $slug);
            }

            echo json_encode(['status' => 1, 'message' => 'Content saved successfully!']);
        } else {
            echo json_encode(['status' => 0, 'message' => 'Failed to save content. Please set write permissions (CHMOD 777) on admin/application/config/page_content.json via WinSCP.']);
        }
    }

    // Legacy save function
    function save_simple_content($slug = "")
    {
        $_POST['page_slug'] = $slug;
        $this->save_cms_content();
    }

    // Open Content-Only Editor (Text & Images ONLY)
    function open_content_editor($slug = "")
    {
        if (empty($slug)) {
            $this->session->set_flashdata('error', 'Page not specified.');
            redirect("/C_other_pages/open_listingform/");
        }

        $this->load->model('Other_pages_model');
        $record = $this->Other_pages_model->get_entry_record($slug);

        if (!$record) {
            $this->session->set_flashdata('error', 'Page not found.');
            redirect("/C_other_pages/open_listingform/");
        }

        $data = $record;
        $data['type'] = 'edit';
        $data['userrights'] = array("view" => 1, "add" => 1, "edit" => 1, "delete" => 1, "sms" => 1, "email" => 1, "notification" => 1);

        $this->load->view('other_pages_content_only', $data);
    }

    // Save Content Only (no code, no SEO)
    function save_content_only()
    {
        header('Content-Type: application/json');

        $slug = $this->input->post('page_slug');
        if (empty($slug)) {
            echo json_encode(['status' => 0, 'message' => 'Page not specified.']);
            return;
        }

        $content_file = APPPATH . 'config/page_content.json';
        $all_content = [];
        if (file_exists($content_file)) {
            $all_content = json_decode(file_get_contents($content_file), true);
        }
        $all_content_original = $all_content;

        // Preserve existing data
        $existing = isset($all_content[$slug]) ? $all_content[$slug] : [];

        // Handle image uploads
        $banner_path = isset($existing['banner_image']) ? $existing['banner_image'] : '';
        $side_path = isset($existing['side_image']) ? $existing['side_image'] : '';
        $image2_path = isset($existing['image_2']) ? $existing['image_2'] : '';
        $image3_path = isset($existing['image_3']) ? $existing['image_3'] : '';

        $config['upload_path'] = '../assets/images/';
        $config['allowed_types'] = 'gif|jpg|png|jpeg|webp';
        $config['max_size'] = '5120';
        $config['remove_spaces'] = true;
        $this->load->library('upload', $config);

        // Upload banner image
        if (!empty($_FILES['banner_image_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('banner_image_file')) {
                $data = $this->upload->data();
                $banner_path = 'assets/images/' . $data['file_name'];
            }
        }

        // Upload side image
        if (!empty($_FILES['side_image_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('side_image_file')) {
                $data = $this->upload->data();
                $side_path = 'assets/images/' . $data['file_name'];
            }
        }

        // Upload additional image 2
        if (!empty($_FILES['image_2_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('image_2_file')) {
                $data = $this->upload->data();
                $image2_path = 'assets/images/' . $data['file_name'];
            }
        }

        // Upload additional image 3
        if (!empty($_FILES['image_3_file']['name'])) {
            $this->upload->initialize($config);
            if ($this->upload->do_upload('image_3_file')) {
                $data = $this->upload->data();
                $image3_path = 'assets/images/' . $data['file_name'];
            }
        }

        // Save all content and images
        $save_data = array_merge($existing, [
            'banner_image' => $banner_path,
            'title' => $this->input->post('title'),
            'content' => $this->input->post('content'),
            'side_image' => $side_path,
            'content_2' => $this->input->post('content_2'),
            'image_2' => $image2_path,
            'content_3' => $this->input->post('content_3'),
            'image_3' => $image3_path,
            'content_4' => $this->input->post('content_4'),
            'content_5' => $this->input->post('content_5')
        ]);

        // Handle slider images for home page
        if ($slug == 'home') {
            $slider_images = $this->input->post('slider_images');
            // Debug: Log what we received
            error_log("Slider images received: " . print_r($slider_images, true));

            if (is_array($slider_images)) {
                // Filter out empty values
                $slider_images = array_filter($slider_images, function ($img) {
                    return !empty($img);
                });
                // Re-index array to remove gaps
                $slider_images = array_values($slider_images);
                // Store as JSON string
                $save_data['slider_images'] = json_encode($slider_images);

                // Debug: Log what we're saving
                error_log("Slider images to save: " . $save_data['slider_images']);
            } else {
                error_log("Slider images is not an array or is empty");
            }
        }

        $all_content[$slug] = $save_data;

        $json_data = json_encode($all_content, JSON_PRETTY_PRINT);
        if ($json_data === false) {
            echo json_encode(['status' => 0, 'message' => 'JSON Encoding Error: ' . json_last_error_msg()]);
            return;
        }

        $old_data = isset($all_content_original[$slug]) ? $all_content_original[$slug] : [];
        $new_data = $all_content[$slug];

        if (file_put_contents($content_file, $json_data)) {
            $this->load->helper('common');
            $changed_data = get_changed_fields($old_data, $new_data);
            $old_values = array();
            $new_values = array();
            foreach ($changed_data as $field => $values) {
                $old_values[$field] = $values['old'];
                $new_values[$field] = $values['new'];
            }
            if (!empty($changed_data)) {
                log_admin_edit('51', 'Other Pages', $old_values, $new_values, 'Admin - Updated simple content for page: ' . $slug);
            }

            echo json_encode(['status' => 1, 'message' => 'Content saved successfully!']);
        } else {
            echo json_encode(['status' => 0, 'message' => 'Failed to save content. Please set write permissions (CHMOD 777) on admin/application/config/page_content.json via WinSCP.']);
        }
    }

    // File Manager to browse existing images
    function file_manager()
    {
        $this->load->helper('directory');
        $map = directory_map('../assets/images/');
        $data['images'] = [];
        if ($map) {
            foreach ($map as $file) {
                if (is_string($file) && preg_match("/\.(gif|jpg|jpeg|png|webp)$/i", $file)) {
                    $data['images'][] = $file;
                }
            }
        }
        $this->load->view('file_manager', $data);
    }

    // Delete image from server
    function delete_image()
    {
        header('Content-Type: application/json');
        $file_name = $this->input->post('file_name');
        if (empty($file_name)) {
            echo json_encode(['status' => 0, 'message' => 'No file specified.']);
            return;
        }

        // Security check: only allow deleting from assets/images
        $file_path = '../assets/images/' . $file_name;
        if (file_exists($file_path)) {
            if (unlink($file_path)) {
                echo json_encode(['status' => 1, 'message' => 'Image deleted successfully.']);
            } else {
                echo json_encode(['status' => 0, 'message' => 'Failed to delete file.']);
            }
        } else {
            echo json_encode(['status' => 0, 'message' => 'File not found.']);
        }
    }
}
