<?php $this->load->view('include/header.php'); 
	$model_name = "customerbalancedetails_model";
?>
    <div>
        <ul class="breadcrumb">
            <li>
                <a href="index.php/C_main/load_mainpage">Admin</a>            </li>
            <li>
                <a href="#">Transaction</a>            </li>
			 <li>
                <a href="#">Customer Balance</a>            </li>
        </ul>
</div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Customer Balance </h2>
              </div>	
				<div class="box-content">
                    <?php
					
					$cus_bal = $this->$model_name->get_data()->result_array();	
					?>
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
						<thead>
						<tr>
						   <th width="15%">Customer ID</th>
							<th width="25%">Customer Name </th>
							<th width="25%">Trading Balance</th>
							<th width="10%">Margin Balance</th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach (  $cus_bal as $val ) 
								{
										
										    echo '<tr>
														<td>'. $val['cusid'].'</td>
														<td>'. $val['cusname'].'</td>
														<td>'. $val['cusbalance'].'</td>
														<td>'. $val['cusmargin'].'</td>
													</tr>';
								}
							  ?>
								
							</tbody>
    </table>
					 <!-- page content end-->
              </div>
            </div>
        </div>
        <!--/span-->
    </div><!--/row-->
<?php $this->load->view('include/footer.php'); ?>