<?php
/**
 * Dynamic Hedge Helper
 * Handles dynamic hedging based on hedge master configuration
 */

function get_all_hedge_configs($metalType) {
    $CI =& get_instance();
    
    $query = $CI->db->query("
        SELECT hm_id, hm_hedgetype, hm_hedgesymbol, hm_apiurl, hm_fromslots, hm_toslots, hm_com_type
        FROM dt_hedgemaster 
        WHERE hm_commodity = ? 
        AND hm_hedgestatus = 1 
        ORDER BY hm_toslots DESC
    ", [$metalType]);
    
    return $query->result_array();
}

function execute_hedge($hedge_config, $qty_grams, $book_no, $metalType = 0) {
    $CI =& get_instance();
    
    $orderData = [
        'book_qty' => $qty_grams / 1000,
        'contact_symbol' => $hedge_config['hm_hedgesymbol'],
        'book_no' => $book_no,
        'metalType' => $metalType,
        'hedge_url' => $hedge_config['hm_apiurl'],
        'book_type' => 0
    ];
    
    if ($hedge_config['hm_hedgetype'] == 0) {
        $CI->load->model('Mt5_model');
        return $CI->Mt5_model->execute($orderData);
    } else {
        $CI->load->model('Motilal_model');
        return $CI->Motilal_model->login_motilal_oswal($orderData);
    }
}
?>
