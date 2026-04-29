<?php
class Email_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function send_email($email_to, $email_subject, $email_message)
    {
        $company_name = "";
        $mail_server = "";
        $mail_password = "";
        $resultset = $this->db->query("select * from dt_generalsettings");
        foreach ($resultset->result() as $row) {
            $company_name = $row->admin_company_name;
            $mail_server = $row->admin_mail_server;
            $mail_password = $row->admin_mail_password;
        }
        $resultset->free_result();
        $config = array(
            'protocol'  => 'smtp',
            'smtp_host' => 'ssl://smtp.googlemail.com',
            'smtp_port' => 465,
            'smtp_user' => $mail_server,
            'smtp_pass' => $mail_password,
            'mailtype'  => 'html',
            'charset'   => 'iso-8859-1'
        );
        $this->load->library('email', $config);
        $this->email->set_newline("\r\n");
        $this->email->from($mail_server, $company_name);
        $this->email->to($email_to);
        $this->email->subject($email_subject);
        $this->email->message($email_message);
        return $this->email->send();
    }

    public function send_enquiry($email_to, $email_cc, $email_subject, $email_message)
    {
        $company_name = "";
        $mail_server = "";
        $mail_password = "";
        $resultset = $this->db->query("select * from dt_generalsettings");
        foreach ($resultset->result() as $row) {
            $company_name = $row->admin_company_name;
            $mail_server = $row->admin_mail_server;
            $mail_password = $row->admin_mail_password;
            $admin_mail = $row->admin_mail;
        }
        $resultset->free_result();

        $config = array(
            'protocol'  => 'smtp',
            'smtp_host' => 'ssl://smtp.googlemail.com',
            'smtp_port' => 465,
            'smtp_user' => $mail_server,
            'smtp_pass' => $mail_password,
            'mailtype'  => 'html',
            'charset'   => 'iso-8859-1'
        );
        $this->load->library('email', $config);
        $this->email->set_newline("\r\n");
        $this->email->from($mail_server, $company_name);
        $this->email->to($admin_mail);
        $this->email->subject($email_subject);
        $this->email->message($email_message);
        return $this->email->send();
    }
}
