<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/tcstds.css">
<div class="banner">
		<img src="<?php echo $this->config->item('base_url'); ?>assets/images/tcs_tds.jpg" style="width: 100%;" >
	</div>
<div class="container-fluid contentContainer">
	
	<div class="container contenttds">
		<div class="row">

			<div class="col-md-12 col-xs-12">
				<div class="col-md-1"></div>
				<div class="col-md-10  col-xs-12 tds">
					<h3 class="tds_title">TDS Calculation</h3>
					<!-- Option start-->
					<div class="col-md-12 col-xs-12">
						<div class="col-md-4"></div>
						<div class="col-md-4 col-xs-12" style="text-align: center;">
							<div class="Option1 col-xs-6">
								<input type="radio" id="tds_opt" name="optradio" value="0" checked="" onclick="get_values()"><label for="tds_opt">TDS</label>
							</div>
							<div class="Option2  col-xs-6">
								<input type="radio" id="tcs_opt" name="optradio" value="1" onclick="get_values()"><label for="tcs_opt">TCS</label>
							</div>
						</div>
						<div class="col-md-4"></div>
					</div>
					<!-- Option End-->
					<table class="table rateTable1" style="margin-bottom: 10px;" id="tdscalc">
						<thead class="headertable1">
							<tr>
								<th width="30%" class="">Weight (g)</th>
								<th width="15%" class="">Purity (%)</th>
								<th width="30%" class="">Rate / Gm</th>
								<th width="20%" class=""><span class='tcstdslable'></span></th>
								<th width="20%" class="">Option</th>
							</tr>
						</thead>
					</table>
					<div class="tdsnote" style="font-weight: 900 !important;">Note: including <?php echo $return_value['admin_igst']; ?>% of GST.</div>

					<!-- <div class="tdsnote">Note: <?php echo $return_value['tds_value']; ?>% <span class='tcstdslable'></span> calculated on taxable amount (<span id='tcstdsgst'></span> GST).</div> -->
					<!--<div class="col-md-12">
						<a href='javascript:;addnewrow();'><button class="btn success">Add More</button></a>
					</div>-->
					<table class="table amount_1">
						<tbody>
							<tr>
								<td class="amount1">Total Weight (Gm) &nbsp; </td>
								<td class="amount3">: </td>
								<td class="amount2">&nbsp; <span id="tot_weight"></span></td>
							</tr>
							<tr>
								<td class="amount1">Total Amount </td>
								<td class="amount3">: </td>
								<td class="amount2"><span id="total_amt"></span></td>
							</tr>
							<tr>
								<td class="amount1">Total <span class='tcstdslable_new'></span>&nbsp; </td>
								<td class="amount3">: </td>
								<td class="amount2"><span id="tcs_amt"></span></td>
							</tr>
							<tr>
								<td class="amount1">Payable &nbsp; </td>
								<td class="amount3">: </td>
								<td class="amount2"><span id="pay_amt"></span></td>
							</tr>

						</tbody>
					</table>
				</div>
				<div class="col-md-1"></div>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript">
	$(document).ready(function() {
		var $ = jQuery.noConflict();
		addnewrow();
		$('.tcstdslable').html("TDS (%)");
		$('.tcstdslable_new').html("TDS");
		$('#tcstdsgst').html("execluding");
	});
	$("#grid").hide();

	function number_format(inr) {
		var x = inr;
		x = x.toString();
		var afterPoint = '';
		if (x.indexOf('.') > 0)
			afterPoint = x.substring(x.indexOf('.'), x.length);
		x = Math.floor(x);
		x = x.toString();
		var lastThree = x.substring(x.length - 3);
		var otherNumbers = x.substring(0, x.length - 3);
		if (otherNumbers != '')
			lastThree = ',' + lastThree;
		var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

		return res;
	}

	// function purityformat(val) {
	// 	/* $('input[id='+arguments[0].id+']').inputmask({
	// 		'alias': 'decimal',
	// 		'mask': "99[.99]"
	// 	}); */
	// 	if (isNaN(val.value)) {
	// 		val.value = "";
	// 	} else {
	// 		if (Number(val.value) > 100) {
	// 			val.value = 100
	// 		}
	// 	}
	// }

	function purityformat(val) {
		val.value = val.value.replace(/[eE\-]/g, '');
		if (isNaN(val.value)) {
			val.value = "";
		} else {
			if (Number(val.value) > 100) {
				val.value = 100;
			}
			let parts = val.value.split('.');
			if (parts[1] && parts[1].length > 2) {
				val.value = parts[0] + '.' + parts[1].substring(0, 2);
			}
		}
	}

	function get_values() {
		var tds_opt = document.getElementById('tds_opt');
		var tcs_val = <?php echo $return_value['tds_value']; ?>;
		var $ = jQuery.noConflict();
		if (tds_opt.checked == true) {
			var gst_val = <?php echo $return_value['admin_igst']; ?>;
			$('.tcstdslable').html("TDS (%)");
			$('.tcstdslable_new').html("TDS");
			$('#tcstdsgst').html("execluding");
		} else {
			var gst_val = 0;
			$('.tcstdslable').html("TCS (%)");
			$('.tcstdslable_new').html("TCS");
			$('#tcstdsgst').html("including");
		}
		var tableName = document.getElementById('tdscalc');
		var weight_row = 0;
		var purity_row = 0;
		var rateper_row = 0;
		var total_rate_row = 0;
		var total_rate = 0;
		var tds_amt = 0;
		var tds_total = 0;
		var pay_amt = 0;
		var tot_weight = 0;
		var pay_total = 0;
		for (var i = 1; i < tableName.rows.length; i++) {
			weight_row = isNaN(parseFloat(tableName.rows[i].cells[0].children[0].value)) ? 0 : tableName.rows[i].cells[0].children[0].value;
			purity_row = isNaN(parseFloat(tableName.rows[i].cells[1].children[0].value)) ? 0 : tableName.rows[i].cells[1].children[0].value;
			rateper_row = isNaN(parseFloat(tableName.rows[i].cells[2].children[0].value)) ? 0 : tableName.rows[i].cells[2].children[0].value;
			total_rate_row = ((weight_row * rateper_row) * (purity_row / 100)).toFixed(2);
			total_rate = (parseFloat(total_rate_row) + parseFloat(total_rate));
			if (tds_opt.checked == true) {
				// tds_amt = (total_rate_row * 100 / (gst_val + 100) * (tcs_val / 100)).toFixed(2);
				tds_amt = (total_rate_row * 100 / (gst_val + 100) * (isNaN(parseFloat(tableName.rows[i].cells[3].children[0].value)) ? 0 : tableName.rows[i].cells[3].children[0].value / 100)).toFixed(2);
				pay_amt = parseFloat(total_rate_row) - parseFloat(tds_amt);
			} else {
				// tds_amt = (total_rate_row * (tcs_val / 100)).toFixed(2);
				tds_amt = (total_rate_row * (isNaN(parseFloat(tableName.rows[i].cells[3].children[0].value)) ? 0 : tableName.rows[i].cells[3].children[0].value / 100)).toFixed(2);
				pay_amt = parseFloat(total_rate_row) + parseFloat(tds_amt);
			}

			tds_total = parseFloat(tds_total) + parseFloat(tds_amt);
			pay_total = parseFloat(pay_amt) + parseFloat(pay_total);
			tot_weight = parseFloat(tot_weight) + parseFloat(weight_row);

		}

		$('#total_amt').html("₹ " + number_format(Math.round(total_rate)));
		$('#tcs_amt').html("₹ " + number_format(Math.round(tds_total)));
		$('#pay_amt').html("₹ " + number_format(Math.round(pay_total)));
		$('#tot_weight').html(number_format(Math.round(tot_weight)));
	}

	function validateKeyPress(event, input, type, maxLength, decimalLength) {
		const key = event.key;
		const value = input.value;
		const cursorStart = input.selectionStart;
		const cursorEnd = input.selectionEnd;
		const newValue = value.slice(0, cursorStart) + key + value.slice(cursorEnd);
		const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'];
		const specialChars = ['-'];

		// Block emojis or non-ASCII symbols
		if (/[\u{1F600}-\u{1F6FF}]/u.test(key) || /[^\x00-\x7F]/.test(key)) return event.preventDefault();

		// Respect input maxlength attribute
		if (input.maxLength > 0 && value.length >= input.maxLength && !allowedKeys.includes(key)) {
			event.preventDefault();
			return;
		}

		// Allow navigation/control keys
		if (allowedKeys.includes(key)) return;
		// ==========================================
		// TYPE 2 → DECIMAL (only positive, up to 3dp)
		// ==========================================

		if (type === 2) {
			// Allow only digits and one dot
			if (!/[\d.]/.test(key)) return event.preventDefault();
			if (key === '.' && value.includes('.')) return event.preventDefault();
			if (value === '' && key === '.') return event.preventDefault(); // prevent starting with '.'

			// Predict the new value
			const newValue = value + key;
			const [integerPart = '', decimalPart = ''] = newValue.split('.');

			// Restrict integer part length (before '.')
			if (!value.includes('.') && integerPart.length > maxLength) {
				return event.preventDefault();
			}

			// Restrict decimal part (after '.')
			if (decimalPart && decimalPart.length > decimalLength) {
				return event.preventDefault();
			}
		}
	}

	function addnewrow() {
		var $ = jQuery.noConflict();
		var tableName = document.getElementById('tdscalc');
		var flag = validate_row();
		var html = "";
		var row_id = tableName.rows.length;
		var rowid = $('.tdscalc tr').length;
		if (flag == true) {
			html = "<tr class='tds_cal' id='" + row_id + "' style='border: 1px solid #dbbd6e;background:#EAEAEA'><td width='20%'><input type='number'  id='weight[]'  onkeydown='validateKeyPress(event, this, 2, 11,3)' onkeyup='get_values(this);' onchange='get_values(this);' name='tdscalc[weight][]' value='' class='tds_input'  /></td><td width='20%'><input type='tel'  id='ratepergm" + rowid + "' oninput='purityformat(this);get_values(this);' name='tdscalc[ratepergm][]' value=''  class='tds_input' size='4' maxlength='5' /></td><td width='20%'><input type='number' onkeydown='validateKeyPress(event, this, 2, 11,2)'  id='ratepergm[]' onkeyup='get_values(this);' onchange='get_values(this);' name='tdscalc[ratepergm][]' value='' class='tds_input' /></td><td width='20%'><input type='tel'  id='ratepergm[]' oninput='purityformat(this);get_values(this);' name='tdscalc[ratepergm][]' value='' class='tds_input' maxlength='5' /></td><td width='20%'><a href='javascript:;addnewrow();'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/add-icon.png' style='width: 25px;height: 25px;' alt='ADD' /></a><a href='javascript:;delete_row(" + row_id + ");get_values();'><img src='<?php echo $this->config->item('base_url'); ?>assets/images/delete-icon.png' alt='Delete' class='delete' style='width: 25px;height: 25px;' /></a></td></tr>";
			$('#tdscalc').append(html);
		} else {
			$(".modal-body p").html(flag);
			$("#myAlert").show();
		}
	}

	function validate_row() {
		var tableName = document.getElementById('tdscalc');
		var flag = true;
		for (var i = 1; i < tableName.rows.length; i++) {
			if (tableName.rows[i].cells[0].childNodes[0].value.length == 0 || tableName.rows[i].cells[1].childNodes[0].value.length == 0 || tableName.rows[i].cells[2].childNodes[0].value.length == 0) {
				flag = false;
			}
		}
		return flag;
	}

	function delete_row() {
		var tableName = document.getElementById('tdscalc');
		for (var i = 1; i < tableName.rows.length; i++) {
			if (tableName.rows.length > 2) {
				if (tableName.rows[i].id == arguments[0]) {
					tableName.deleteRow(i);
				}
			}
		}
	}
</script>