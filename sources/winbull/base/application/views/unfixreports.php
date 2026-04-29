<?php 
$tradeObj = new Trading();
$settings = $tradeObj->get_settings(); 
?>
<link href='<?php echo $this->config->item('base_url'); ?>assets/css/bootstrap-datetimepicker.css' rel='stylesheet'>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-datetimepicker.min.js"></script>
<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" />
<script src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>
<!--<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>-->
<script type="text/javascript">
$(function() {
	load_report(1);
	
	$(".refresh_report").click(function(){
		var report_call = $(".headings.headings-active").attr("onclick");
		eval(report_call);
	});
});
function load_report(report_type)
{
 	if(report_type == 1)
	{
		$('#pendingdelv').css("display", "none");
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_trade_history").addClass("headings-active");
		try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Date</th><th>Weight</th><th>Rate</th><th>Amount</th><thead><tbody>';
		$.ajax({
			type: "POST",
			dataType: "json",	
			data: {"report_type": 1},				   
			url:"<?php echo $this->config->item('base_url') ?>index.php/C_trade/get_unfix_payment",
			success: function(data)
			{
				console.log(data);
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				
				var table_val='';
				$.each (data, function (i) {
				
				table_val += '<tr><td>'+data[i]['date']+'</td><td>'+data[i]['pure_weight']+'</td><td>'+data[i]['rate']+'</td><td>'+data[i]['amount']+'</td></tr>';
			
			});
				if(table_val == '')
				{
					table_val = '<tr><td colspan="4">No data available in table</td></tr>';
					row_length = false;
				}

				table += table_val;	
				table += '</tbody>';
				table += '<table>';
				$('#reports').empty().append(table);
				$('.report_table').DataTable({"aaSorting": []});
			},
			error: function(request,error) {
			}
		});
		}catch(ex)
		{
			console.log(ex);
		}
	}
	else if (report_type == 2)
	{
		$('#pendingdelv').css("display", "none");
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_pending_deal").addClass("headings-active");
  	    try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Trade No</th><th>Booking Date</th><th>BKD WGT</th><th>Rate</th><th>Amount</th></tr><thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",	
			data: {"report_type": 2},
			url:"<?php echo $this->config->item('base_url'); ?>index.php/C_trade/get_unfix_payment",
			success: function(data)
			{
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				
				var table_val='';
				var ratetr = '';
				$.each(data, function (i)
				{
					
					table_val += '<tr ><td>'+data[i]['book_no']+'</td><td>'+data[i]['book_datetime']+'</td><td>'+data[i]['book_qty']+'</td><td>'+data[i]['book_rate']+'</td><td>'+data[i]['book_totalcost']+'</td></tr>';
					
				});
				if(table_val == '')
				{
					table_val = '<tr><td colspan="5">No data available in table</td></tr>';
					row_length = false;
				}
				
				table += table_val;	
				table += '</tbody>';
				table += '<table>';
				$('#reports').empty().append(table);
				$('.report_table').DataTable({"aaSorting": []});
			},
			error: function(request,error) {
			}
		});
		}catch(ex)
		{
			console.log(ex);
		}
  }
 }
</script>
<style>
    .dataTables_filter input{
        float: right;
    }
</style>
<!-- Main -->
<div id="main">
<!-- Portfolio -->
<section class="allReports allReports1">
	<div class="container " style="">
            <section>
                <div class="col-md-12 contant"  style="">
                    <div>    
						<div class="col-md-12 tab-content" style="padding:0px">
							<div class="col-md-12 reports-container reports-container1">
								<div class="col-md-12 report-heading paddingzero row reportss">
									<div class="col-md-2 col-sm-12 headings headings-active" onclick="load_report(1)" id="rep_trade_history">
										Unfix Payment
									</div>
									<div class="col-md-2 col-sm-12 headings" onclick="load_report(2)" id="rep_pending_deal">
										Unfix Booking
									</div>
									
									<div class="col-md-2 col-sm-12 refresh_report1">
									 ( <i class="fa fa-refresh refresh_report" title="Click here to refresh"></i> )
									</div>
								</div>

							</div>
							
							
							<div id="reports" class="reports1">
								<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Trade No</th><th>Date</th><th>Weight</th><th>Rate</th><th>Amount</th></tr></thead><thead></thead><tbody><tr><td colspan="5">No records found in table</td></tr></tbody></table>
							</div>
							
						</div>
					</div>
				</div>
          </section> 
	
	</div>
</section>
</div>