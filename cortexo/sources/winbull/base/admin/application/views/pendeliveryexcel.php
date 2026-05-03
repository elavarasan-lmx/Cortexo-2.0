<?php
$model_name = "customerdelivery_model";
$controller_name = "C_customerDelivery";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <title>Pending Delivery</title>
</head>
<p style="text-align: center">
<div style="text-align: center">
    <span style="font-size:12px; font-weight:bold;"><?php echo $this->session->userdata('company_name'); ?></span><br />
    <span style="font-size:11px;">Pending Delivery &nbsp;|&nbsp; Printed On: <?php echo date('d-m-Y H:i:s'); ?></span>
</div>
</p>
<style type="text/css">
    #grid-data tr,
    #grid-data td,
    #grid-data tr,
    #grid-data th {
        border: 1px solid #000;
        border-collapse: separate;
        font-size: 11px;
    }

    #grid-data tbody .values {
        text-align: center;
    }

    table {
        border-collapse: collapse;
    }

    table,
    th,
    td {
        border: 1px solid black;
    }

    @media print {

        #grid-data td,
        #grid-data th {
            page-break-inside: avoid;
        }
    }
</style>

<body>

    <body>

        <?php
        $sum = [
            "sell_gold"   => ["dqty" => 0, "total" => 0],
            "sell_silver" => ["dqty" => 0, "total" => 0],
            "buy_gold"    => ["dqty" => 0, "total" => 0],
            "buy_silver"  => ["dqty" => 0, "total" => 0],
        ];
        foreach ($customers as $r) {
            $isSell   = (strtolower($r['book_type']) == 'sell');
            $isSilver = ($r['com_type'] == 1);
            $k = ($isSell ? 'sell' : 'buy') . '_' . ($isSilver ? 'silver' : 'gold');
            $sum[$k]['dqty']  += floatval($r['BalanceQty']) * 1000;
            $sum[$k]['total'] += floatval($r['bookamount']);
        }
        function xls_avg($t, $d)
        {
            return $d == 0 ? 0 : $t / ($d / 1000);
        }
        function xls_fmt($n)
        {
            $n2 = number_format(floatval($n), 2, '.', '');
            $p  = explode('.', $n2);
            $int = $p[0];
            $dec = $p[1];
            if (strlen($int) > 3) {
                $last3 = substr($int, -3);
                $rest  = substr($int, 0, strlen($int) - 3);
                $rest  = (strlen($rest) % 2 == 1) ? '0' . $rest : $rest;
                $chunks = str_split($rest, 2);
                $chunks[0] = (int)$chunks[0];
                $int = implode(',', $chunks) . ',' . $last3;
            }
            return $int . '.' . $dec;
        }
        ?>
        <!-- <table style="border-collapse:collapse;width:100%;margin:8px 0 10px;font-size:11px;border:1px solid #999;font-family:Arial,sans-serif;">
		<tr>
		<td style="width:25%;padding:5px 8px;border:1px solid #999;vertical-align:top;">
		  <b>Sell gold</b><br>
		  D.Qty(gms) : <b><?php echo number_format($sum['sell_gold']['dqty'], 3); ?></b><br>
		  Avg : <b><?php echo xls_fmt(xls_avg($sum['sell_gold']['total'], $sum['sell_gold']['dqty'])); ?></b><br>
		  Total : <b><?php echo xls_fmt($sum['sell_gold']['total']); ?></b>
		</td>
		<td style="width:25%;padding:5px 8px;border:1px solid #999;vertical-align:top;">
		  <b>Sell silver</b><br>
		  D.Qty(Kg) : <b><?php echo number_format($sum['sell_silver']['dqty'] / 1000, 3); ?></b><br>
		  Avg : <b><?php echo xls_fmt(xls_avg($sum['sell_silver']['total'], $sum['sell_silver']['dqty'])); ?></b><br>
		  Total : <b><?php echo xls_fmt($sum['sell_silver']['total']); ?></b>
		</td>
		<td style="width:25%;padding:5px 8px;border:1px solid #999;vertical-align:top;">
		  <b>Buy gold</b><br>
		  D.Qty(gms) : <b><?php echo number_format($sum['buy_gold']['dqty'], 3); ?></b><br>
		  Avg : <b><?php echo xls_fmt(xls_avg($sum['buy_gold']['total'], $sum['buy_gold']['dqty'])); ?></b><br>
		  Total : <b><?php echo xls_fmt($sum['buy_gold']['total']); ?></b>
		</td>
		<td style="width:25%;padding:5px 8px;border:1px solid #999;vertical-align:top;">
		  <b>Buy silver</b><br>
		  D.Qty(Kg) : <b><?php echo number_format($sum['buy_silver']['dqty'] / 1000, 3); ?></b><br>
		  Avg : <b><?php echo xls_fmt(xls_avg($sum['buy_silver']['total'], $sum['buy_silver']['dqty'])); ?></b><br>
		  Total : <b><?php echo xls_fmt($sum['buy_silver']['total']); ?></b>
		</td>
		</tr>
		</table> -->
        <div style="font-size:11px;margin-bottom:6px;">Date : <b><?php echo date('d-m-Y'); ?></b></div>

        <table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-20px;">
            <thead>
                <tr>
                    <th width="10%">B.No</th>
                    <th width="15%">Book Date</th>
                    <th width="10%">Book Type</th>
                    <th width="10%">Req Type</th>
                    <th width="15%">Name</th>
                    <th width="20%">Company</th>
                    <th width="15%">Deliver To</th>
                    <th width="10%">Mobile</th>
                    <th width="15%">Commodity</th>
                    <th width="10%">Qty(gms)</th>
                    <th width="10%">D.Qty(gms)</th>
                    <th width="10%">B.Rate</th>
                    <th width="10%">Amount</th>
                    <th width="15%">Reporter</th>
                    <th width="20%">User Comment</th>
                    <th width="20%">Narration</th>
                </tr>
            </thead>
            <tbody>
                <?php
                foreach ($customers as $customer) {
                    $oType     = $customer['ordertype'] == 0 ? "Book" : "Limit";
                    $deliverTo = !empty($customer['deliverto_name']) ? htmlspecialchars($customer['deliverto_name']) : '-';
                    $userComment = !empty($customer['book_usercomment']) ? htmlspecialchars($customer['book_usercomment']) : '-';
                    $narration   = !empty($customer['book_narration'])   ? htmlspecialchars($customer['book_narration'])   : '-';
                    $bookedBy    = !empty($customer['book_by'])          ? $customer['book_by']                           : '-';
                    $mobile      = !empty($customer['cus_mobile'])       ? $customer['cus_mobile']                        : '-';
                    $company     = !empty($customer['cus_company_name']) ? htmlspecialchars($customer['cus_company_name']) : '-';
                    $rate        = !empty($customer['book_rate'])        ? $customer['book_rate']                         : '-';
                    $amount      = !empty($customer['bookamount'])       ? $customer['bookamount']                        : '-';
                    echo '<tr>
							<td style="text-align:center;">' . $customer['bookno'] . '</td>
							<td style="text-align:center;">' . $customer['bookdate'] . '</td>
							<td style="text-align:center;">' . $customer['book_type'] . '</td>
							<td style="text-align:center;">' . $oType . '</td>
							<td style="text-align:center;">' . htmlspecialchars($customer['customername']) . '</td>
							<td style="text-align:center;">' . $company . '</td>
							<td style="text-align:center;">' . $deliverTo . '</td>
							<td style="text-align:center;">' . $mobile . '</td>
							<td style="text-align:center;">' . htmlspecialchars($customer['commodityname']) . '</td>
							<td style="text-align:center;">' . round($customer['bookqty'] * 1000, 3) . '</td>
							<td style="text-align:center;">' . round($customer['BalanceQty'] * 1000, 3) . '</td>
							<td style="text-align:right;">' . $rate . '</td>
							<td style="text-align:right;">' . $amount . '</td>
							<td style="text-align:center;">' . $bookedBy . '</td>
							<td style="text-align:center;">' . $userComment . '</td>
							<td style="text-align:center;">' . $narration . '</td>
						</tr>';
                }
                ?>
            </tbody>
        </table>
    </body>

</html>
<script type="text/javascript">
    window.print();
</script>
