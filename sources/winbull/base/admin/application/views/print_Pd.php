<?php
$controller_name = "C_customerDelivery";
$model_name = "Customerdelivery_model";
$companydetail = $this->$model_name->get_invoicevalue();
function moneyFormatIndia($num)
{
    $nums = explode(".", $num);
    if (count($nums) > 2) {
        return "0";
    } else {
        if (count($nums) == 1) {
            $nums[1] = "00";
        }
        $num = $nums[0];
        $explrestunits = "";
        if (strlen($num) > 3) {
            $lastthree = substr($num, strlen($num) - 3, strlen($num));
            $restunits = substr($num, 0, strlen($num) - 3);
            $restunits = (strlen($restunits) % 2 == 1) ? "0" . $restunits : $restunits;
            $expunit = str_split($restunits, 2);
            for ($i = 0; $i < sizeof($expunit); $i++) {
                if ($i == 0) {
                    $explrestunits .= (int)$expunit[$i] . ",";
                } else {
                    $explrestunits .= $expunit[$i] . ",";
                }
            }
            $thecash = $explrestunits . $lastthree;
        } else {
            $thecash = $num;
        }
        return $thecash . "." . $nums[1];
    }
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <title><?php echo $companydetail['admin_company_name']; ?></title>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/js/customize.js"></script>
    <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
    <style type="text/css">
        #grid-data tr,
        #grid-data td,
        #grid-data tr,
        #grid-data th {
            border: 1px solid #000;
            border-collapse: collapse;
            font-size: 11px;
        }

        #grid-data tbody .values {
            text-align: center;
        }

        @page {
            size: A4 landscape;
            margin: 8mm;
        }

        @media print {

            #grid-data td,
            #grid-data th {
                page-break-inside: avoid;
                font-size: 9px;
            }

            body {
                font-size: 9px;
            }
        }
    </style>
</head>

<body>
    <div style="text-align:center; margin-bottom:6px;">
        <div style="font-size:14px; font-weight:bold;"><?php echo $this->session->userdata('company_name'); ?></div>
        <div style="font-size:12px; font-weight:bold;">Pending Delivery</div>
        <div style="font-size:11px;">Printed On: <?php echo date('d-m-Y H:i:s'); ?></div>
    </div>
    <div>
        <?php
        $sum_pd = [
            'sell_gold'   => ['dqty' => 0, 'total' => 0],
            'sell_silver' => ['dqty' => 0, 'total' => 0],
            'buy_gold'    => ['dqty' => 0, 'total' => 0],
            'buy_silver'  => ['dqty' => 0, 'total' => 0],
        ];
        foreach ($records as $r) {
            $isSell_pd   = (strtolower($r['book_type']) == 'sell');
            $isSilver_pd = ($r['com_type'] == 1);
            $key_pd = ($isSell_pd ? 'sell' : 'buy') . '_' . ($isSilver_pd ? 'silver' : 'gold');
            $sum_pd[$key_pd]['dqty']  += floatval($r['BalanceQty']) * 1000;
            $sum_pd[$key_pd]['total'] += floatval($r['bookamount']);
        }
        function pd_avg_cal($t, $d)
        {
            return ($d == 0) ? 0 : ($t / ($d / 1000));
        }
        ?>
        <!-- <table style="border-collapse:collapse;width:100%;margin:8px 0 10px;font-size:11px;border:1px solid #aaa;">
<tr>
<td style="width:25%;padding:5px 8px;border:1px solid #aaa;vertical-align:top;">
  <b>Sell gold</b><br>
  D.Qty(gms) : <b><?php echo number_format($sum_pd['sell_gold']['dqty'], 3); ?></b><br>
  Avg : <b><?php echo moneyFormatIndia(number_format(pd_avg_cal($sum_pd['sell_gold']['total'], $sum_pd['sell_gold']['dqty']), 2, '.', '')); ?></b><br>
  Total : <b><?php echo moneyFormatIndia(number_format($sum_pd['sell_gold']['total'], 2, '.', '')); ?></b>
</td>
<td style="width:25%;padding:5px 8px;border:1px solid #aaa;vertical-align:top;">
  <b>Sell silver</b><br>
  D.Qty(Kg) : <b><?php echo number_format($sum_pd['sell_silver']['dqty'] / 1000, 3); ?></b><br>
  Avg : <b><?php echo moneyFormatIndia(number_format(pd_avg_cal($sum_pd['sell_silver']['total'], $sum_pd['sell_silver']['dqty']), 2, '.', '')); ?></b><br>
  Total : <b><?php echo moneyFormatIndia(number_format($sum_pd['sell_silver']['total'], 2, '.', '')); ?></b>
</td>
<td style="width:25%;padding:5px 8px;border:1px solid #aaa;vertical-align:top;">
  <b>Buy gold</b><br>
  D.Qty(gms) : <b><?php echo number_format($sum_pd['buy_gold']['dqty'], 3); ?></b><br>
  Avg : <b><?php echo moneyFormatIndia(number_format(pd_avg_cal($sum_pd['buy_gold']['total'], $sum_pd['buy_gold']['dqty']), 2, '.', '')); ?></b><br>
  Total : <b><?php echo moneyFormatIndia(number_format($sum_pd['buy_gold']['total'], 2, '.', '')); ?></b>
</td>
<td style="width:25%;padding:5px 8px;border:1px solid #aaa;vertical-align:top;">
  <b>Buy silver</b><br>
  D.Qty(Kg) : <b><?php echo number_format($sum_pd['buy_silver']['dqty'] / 1000, 3); ?></b><br>
  Avg : <b><?php echo moneyFormatIndia(number_format(pd_avg_cal($sum_pd['buy_silver']['total'], $sum_pd['buy_silver']['dqty']), 2, '.', '')); ?></b><br>
  Total : <b><?php echo moneyFormatIndia(number_format($sum_pd['buy_silver']['total'], 2, '.', '')); ?></b>
</td>
</tr>
</table> -->
        <table id="grid-data" border="1" style="border-collapse:collapse; margin-top:20px; width:100%">

            <thead>
                <tr>
                    <th>Ref No </th>
                    <th>Book Date </th>
                    <th>Book Type</th>
                    <th>Req Type</th>
                    <th>Name </th>
                    <th>Company </th>
                    <th>Deliver To</th>
                    <th>Mobile</th>
                    <th>Commodity Name </th>
                    <th>Qty(gms)</th>
                    <th>Book Rate</th>
                    <th>Amount</th>
                    <th>Reporter</th>
                    <th>User Comment</th>
                    <th>Narration</th>
                    <th>Balance Qty(gms)</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $i = 1;
                foreach ($records as $val) {
                    $amount = $val['bookamount'] + 0;
                    $bookamountt = moneyFormatIndia($amount + 0);

                    $rate = $val['book_rate'] + 0;
                    $bookratee = moneyFormatIndia($rate + 0);

                    $qty = $val['bookqty'] * 1000;
                    $bookqtyy = $qty;

                    $blnqty =  $val['BalanceQty'];
                    $Balanceqtyy = $blnqty;

                    $blnamount =  $val['BalanceAmount'];
                    $Balanceamountt = moneyFormatIndia($blnamount + 0);
                    $bqty =  $val['BalanceQty'] + 0;
                    $Balnceqtyy = $bqty * 1000;

                    $delLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/del_delivery/';

                    $closeLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/close/' . $val['bookno'] . '/' . $val['cuscode'] . '/' . $val['BalanceAmount'] . '/' . $val['BalanceQty'] . '/' . $val['comcode'];

                    if ($val['BalanceQty'] <= 0) {
                        $disabled = 'disabled="disabled"';
                        $status = '<span class="label label-success">Delivered</span>';
                    } else {
                        $disabled = '';
                        $status = '<span class="label label-warning">Pending</span>';
                    }
                    echo '<tr>
										<td class="BookNo values">' . $val['bookno'] . '</td>
										<td class="values">' . $val['bookdate'] . '</td>
										<td class="values">' . $val['book_type'] . '</td>
										<td class="values">' . ($val['ordertype'] == 0 ? 'Book' : 'Limit') . '</td>
										<td class="values">' . htmlspecialchars($val['customername']) . '</td>
										<td class="values">' . (!empty($val['cus_company_name']) ? htmlspecialchars($val['cus_company_name']) : '-') . '</td>
										<td class="values">' . (!empty($val['deliverto_name']) ? htmlspecialchars($val['deliverto_name']) : '-') . '</td>
										<td class="values">' . (!empty($val['cus_mobile']) ? $val['cus_mobile'] : '-') . '</td>
										<td class="values">' . htmlspecialchars($val['commodityname']) . '</td>
										<td class="qty" style="text-align:right">' . $bookqtyy . '</td>
										<td class="rate" style="text-align:right">' . $bookratee . '</td>
										<td class="amount" style="text-align:right">' . $bookamountt . '</td>
										<td class="values">' . (!empty($val['book_by']) ? $val['book_by'] : '-') . '</td>
										<td class="values">' . (!empty($val['book_usercomment']) ? htmlspecialchars($val['book_usercomment']) : '-') . '</td>
										<td class="values">' . (!empty($val['book_narration']) ? htmlspecialchars($val['book_narration']) : '-') . '</td>
										<td style="text-align:right">' . $Balnceqtyy . '<span class="comType" style="display:none">' . $val['com_type'] . '</span></td>
									</tr>';
                    $i++;
                }
                ?>
            </tbody>
            <tfoot style="display:none">
                <?php
                echo '<tr>
												<td class="values">Total</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td id="total_qty" style="text-align:right"></td>
												<td id="avg_rate" style="text-align:right"></td>
												<td id="total_amt" style="text-align:right"></td>
												<td></td>
												<td></td>
												<td id="bal_qty" style="text-align:right"></td>
											</tr>';
                ?>
            </tfoot>
        </table>
    </div>
</body>

</html>
<script type="text/javascript">
    jQuery(document).ready(function() {
        window.print();
    });
    //calc_total();
    function calc_total() {
        var totalQty = 0;
        var totalAmount = 0;
        var avg_rate = 0;
        var total_rate = 0;
        var i = 0;
        var calc_rate = true;

        $("#grid-data tbody").find("tr").each(function(index, value) {
            i = parseInt(i) + 1;
            totalQty = parseFloat(parseFloat(totalQty) + parseFloat($(this).find(".qty").html())).toFixed(6);
            totalAmount = parseFloat(totalAmount) + parseFloat(remove_commas($(this).find(".amount").html()));
            total_rate = parseFloat(total_rate) + parseFloat(remove_commas($(this).find(".rate").html()));
            if (i == 1) {
                com_type = $(this).find(".comType").html();
            } else {
                if (parseInt(com_type) != parseInt($(this).find(".comType").html())) {
                    calc_rate = false;
                }
            }

        });
        avg_rate = calc_rate == true ? parseFloat(total_rate) / i : "-";
        //avg_rate = parseFloat(parseFloat(totalAmount)/parseFloat(totalQty)) * 10;
        $("#total_qty").html(isNaN(totalQty) ? 0 : IND_money_format(parseFloat(totalQty)));
        $("#total_amt").html(isNaN(totalAmount) ? 0 : IND_money_format(parseFloat(totalAmount).toFixed(2)));
        $("#avg_rate").html(isNaN(avg_rate) ? "-" : IND_money_format(parseFloat(avg_rate).toFixed(2)));
    }
</script>
