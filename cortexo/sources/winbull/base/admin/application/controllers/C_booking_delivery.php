<?php
class C_booking_delivery extends My_Controller {
	public function __construct()
	{
		parent::__construct();
		$this->load->model("bookingdelivery_model");			
	}	
	function index()
	{
		
	}
	function open_listingform() {
		$this->load->view('booking_delivery');
	}
	// grid coding
	function grid_dataload($model_name = "", $from_date = "", $to_date = "") {
		//$this->header_content();				
		$this->load->model('bookingdelivery_model');
        $req_param = array (
                "sort_by" 			=> 	$this->input->post( "sidx", TRUE ),
                "sort_direction" 	=> 	$this->input->post( "sord", TRUE ),
                "page" 				=> 	$this->input->post( "page", TRUE ),
                "num_rows" 			=> 	$this->input->post( "rows", TRUE ),
                "search" 			=> 	$this->input->post( "_search", TRUE ),
                "search_field" 		=> 	$this->input->post( "searchField", TRUE ),
                "search_operator" 	=> 	$this->input->post( "searchOper", TRUE ),
                "search_str" 		=> 	$this->input->post( "searchString", TRUE )
        );
        $data->page 		= 	$this->input->post( "page", TRUE );
        $data->records 		= 	count ($this->$model_name->get_data($req_param,"all", 0, $from_date, $to_date)->result_array());
        $data->total 		= 	ceil ($data->records / $this->input->post( "rows", TRUE ));
		if( $data->records > 0 ) {
			$total_pages = ceil($data->records / $this->input->post( "rows", TRUE ));
		} else {
			$total_pages = 0;
		}
		if ($data->page > $total_pages) $data->page=$total_pages;
		$start = ($this->input->post( "rows", TRUE ) * $this->input->post( "page", TRUE )) - $this->input->post( "rows", TRUE ); 
		
        $records 			= 	$this->$model_name->get_data($req_param, "", $start, $from_date, $to_date)->result_array();
        $data->rows 		= 	$records;		
        echo json_encode ($data);	
		//$query->free_result();
		exit(0);			
    }	
	
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */