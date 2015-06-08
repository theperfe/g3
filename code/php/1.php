<html>
<body>
<?php
$json_dir = "../json";
//$json_dir = ".";
$output = $json_dir."/1.json";
//echo $output;
$fh = fopen($output, 'w') or die("can't open file");
fwrite($fh,"{");
foreach($_GET as $key => $value)
{
	fwrite($fh,'"'.$key.'"'.":".$value.",");
}
fwrite($fh,'"graph":1');
fwrite($fh,"}");
fclose($fh);
echo "Successfully saved the graph. Go to "
?>
<a href="../html/31.html">previous page</a>
