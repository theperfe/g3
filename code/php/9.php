
<?php
//This is same as 1.php except that here I modified the code to get requests through 'POST' method in contrast with the 'GET' method used in 1.php file. It is working, but when I save the graph using 'Save the graph', button it is saving, but no indication is shown. I will handle it in 3.php file.
?>

<?php
$json_dir = "../json";
$output = $json_dir."/9.json";
//echo $output;
$fh = fopen($output, 'w') or die("can't open file");
fwrite($fh,"{");
foreach($_POST as $key => $value)
{
	fwrite($fh,'"'.$key.'"'.":".$value.",");
}
fwrite($fh,'"graph":1');
fwrite($fh,"}");
fclose($fh);
echo "Successfully saved the graph."
?>
