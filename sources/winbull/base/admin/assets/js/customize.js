$(document).ready(function () {
	$('[checked="checked"]').parent().addClass("active");
});	

//for confirm delete dialog
	$('.btn-confirm').click(function (e) {
	e.preventDefault();
	var link=$(this).attr('href');
	$('#myDialog').find('#confirm').attr('href',link);
	$('#myDialog').modal('show');
});

//for delete operation
$('#myDialog #confirm').click(function(){
	   $('#myDialog').modal('hide');
	   $('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
	   window.location.href = $(this).attr('href');
	   return false;
	});
//to hide and remove modal styles	
$('#myDialog .clx').click(function(e){
	e.preventDefault();
	$('#myDialog').modal('hide');
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
});
function IND_money_format(x)
{
	if(typeof x != 'undefined' && x != null)
	{
		x=x.toString();
		var afterPoint = '';
		if(x.indexOf('.') > 0)
		   afterPoint = x.substring(x.indexOf('.'),x.length);
		x = Math.floor(x);
		x=x.toString();
		var lastThree = x.substring(x.length-3);
		var otherNumbers = x.substring(0,x.length-3);
		if(otherNumbers != '')
			lastThree = ',' + lastThree;
		var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

		return res;
	}
	else
	{
		return x;
	}
	
}
function remove_commas(string)
{
	if(typeof string != 'undefined' && string.length > 0)
	{
		return parseFloat(string.replace(/,/g, ''), 10);
	}
	else
	{
		return string;
	}
}