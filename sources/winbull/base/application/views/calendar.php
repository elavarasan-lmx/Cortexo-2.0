
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.min.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/fullcalendar/1.5.4/fullcalendar.js"></script>
<script src="https://cdn.jsdelivr.net/fullcalendar/1.5.4/gcal.js"></script>
<link href="https://cdn.jsdelivr.net/fullcalendar/1.5.4/fullcalendar.css" rel="stylesheet"/>
<style>
	#calendar 
	{
		max-width: 900px;
		margin: 0 auto;
	}
	.fc-other-month .fc-day-number { display:none;}
</style>
<script type="text/javascript">


$(document).ready(function() 
{
	/*RB*/
	eventvalue = [];	
	$.ajax(
	{		
		url:"<?php echo $this->config->item('base_url')?>index.php/C_client_main/get_entryeventdata/booking_model/",
		type:"POST",
		dataType:"json",
		async:false,
		success:function(data)
		{
			$.each(data,function(index,obj)
			{
				var evename         =(obj.eve_name);
				var eve_date        =(obj.eve_date);
				var eve_timeam      =(obj.eve_timeam);
				var eve_timepm      =(obj.eve_timepm);
				var eve_description =(obj.eve_description);
				var eve_id          =(obj.eve_id);
				
				item ={"title" : evename,"start" : eve_date,"evetimeam" : eve_timeam,"evetimepm":eve_timepm,"evntdescription": eve_description,"constrain":eve_timepm,"evid":eve_id}
				
				eventvalue.push(item); 	
			});
			console.log(eventvalue); 
		}	
	});
	$('#calendar').fullCalendar(
	{
		header: 
		{
			left: 	'prev,next today',
			center: 'title',
			right: 	'month,agendaWeek,agendaDay,listMonth'	
		},
		navLinks: true,
		navLinkDayClick: function(date,jsEvent) 
		{
			console.log('day', date.format()); 				// date is a moment
			console.log('coords', jsEvent.pageX,jsEvent.pageY);
		},
		eventAfterRender:function(event,element,view) 
		{
			$(element).css('width','120');
			$(element).css('height','30');
		},
		navLinks: true, 		// can click day/week names to navigate views
		businessHours: true, 	// display business hours
		editable: false,
		events: eventvalue,	
		eventClick: function(calEvent,jsEvent,view) 
		{	
			console.log(eventvalue);
			var xpos = jsEvent.pageX;
			var ypos = jsEvent.pageY;
		
			$(".title").html(calEvent.title);
			$(".start").html(calEvent.start._i);
			$(".evetimeam").html(calEvent.evetimeam);
			$(".evetimepm").html(calEvent.evetimepm);
			$(".constrain").html(calEvent.constrain);
			$(".evntdescription").html(calEvent.evntdescription);
			$(".evid").html(calEvent.evid);
			
			$(".eventContent").css('display', 'block');
			$(".eventContent").css('left', '90%');
			$(".eventContent").css('width', '19%');
			$(".eventContent").css('height', '17%');
			$(".eventContent").css('margin-top', '15%');
			$(".eventContent").css('background-color', 'lightble');
			$(".eventContent").css('font-color', 'block');
			$(".eventContent").css('font-size', '84%');
			$(".eventContent").css('top', '30%');			
			return false;
		},	
	});
	$(".eventContent").click(function() 
	{
		$(".eventContent").css('display','none');      
    });
});	
/*RB*/	
</script>
<div class="container-fluid">
	<div class="row ">
		<div class="container contant2">
			<div class="col-md-12">
				<div id='calendar' style="color:#000;background-color:#ffff;margin-top: 18px;">
					<div id="eventContent" class="eventContent" style="display: block; border: 1px solid #005eb8; position: absolute; background: #fcf8e3; width: 20%; opacity: 1.0; padding: 4px; color: #005eb8; z-index: 2000; line-height: 1.1em;">
						<a style="float: right;"><i class="fa fa-times closeEvent" style="color:red"aria-hidden="true"	></i></a><br/>
						<p style="margin-top:-13px;color:red;"><center>***Event Details***</center></p>
						Event Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:<span id="title" class="title"></span><br/>
						Event Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:<span id="start._i" class="start"></span><br/>
						Event Auspicious Time(AM):<span id="evetimeam" class="evetimeam"></span><br/>
						Event Auspicious Time(PM):<span id="evetimepm" class="evetimepm"></span><br/>		
						Description&nbsp;:<span id="evntdescription" class="evntdescription"></span><br/>		
					</div>
				</div>
			</div>	
		</div>	
	</div>	
</div><br>
