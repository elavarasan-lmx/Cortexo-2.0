<?php
// Add this test script in the `index.php` file temporarily to check logging.
$logFile = __DIR__ . '/storage/logs/test-log.log';
file_put_contents($logFile, "Log test at: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

exit('Log file test complete.');
?>