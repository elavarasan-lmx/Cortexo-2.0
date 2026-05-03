<?php
// Prevent error output from breaking the image
error_reporting(0);
ini_set('display_errors', 0);

@session_start();

$width = 130;
$height = 42;

// Create image
$image = @imagecreatetruecolor($width, $height);

// Setup colors
$bg_color = imagecolorallocate($image, 250, 250, 250); // Light gray/white background
$text_color = imagecolorallocate($image, 139, 0, 0);   // Dark red text color
$noise_color = imagecolorallocate($image, 200, 200, 200); 

// Fill background
imagefilledrectangle($image, 0, 0, $width, $height, $bg_color);

// Generate random 6 character code (no confusing chars like l, 1, 0, o, O)
$chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
$code = '';
for ($i = 0; $i < 6; $i++) {
    $code .= $chars[mt_rand(0, strlen($chars) - 1)];
}

// Ensure it matches the session expectation (strtolower because the controller checks strtolower)
$_SESSION['6_letters_code'] = strtolower($code);

// Add some random noise lines
for ($i = 0; $i < 6; $i++) {
    imageline($image, mt_rand(0, $width), mt_rand(0, $height), mt_rand(0, $width), mt_rand(0, $height), $noise_color);
}

// Add dots
for ($i = 0; $i < 50; $i++) {
    imagesetpixel($image, mt_rand(0, $width), mt_rand(0, $height), $noise_color);
}

// Write the code to the image
// Using built-in font size 5
$font_size = 5;
$char_width = imagefontwidth($font_size);
$char_height = imagefontheight($font_size);
$total_width = $char_width * strlen($code);

$x = ($width - $total_width) / 2;
$y = ($height - $char_height) / 2;

// Draw characters with slight random vertical offset
for ($i = 0; $i < strlen($code); $i++) {
    $y_offset = $y + mt_rand(-3, 3);
    imagestring($image, $font_size, $x + ($i * $char_width), $y_offset, $code[$i], $text_color);
}

// Output the image
header('Content-Type: image/png');
header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past

imagepng($image);
imagedestroy($image);
