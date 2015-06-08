<?php
$output_dir = "../json";
$output_file = "1.json";
$file_to_write = $output_dir."/".$output_file;
//echo $file_to_write;
$fh = fopen($file_to_write , 'a') or die("can't open file");
foreach($_POST as $key=>$value)
{

	echo "success";
	if ($key == "count")
		{
			$count = $value;
			for ($i=0; $i<3; $i++)
			{
				fwrite($fh, "hello\n");
			}
			echo ++$count."\n";
		}
		
}
fclose($fh);
?>


