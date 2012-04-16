var dictionary = new Array();
<?php
do {
		$current_line = fgets(STDIN,1024);
		$current_line = strtoupper(trim($current_line));
		if ($current_line != '') {
			echo "dictionary.push('$current_line');\r\n";
		}
} while ($current_line != '');
?>
dictionary.sort(function(a,b){return b.length - a.length})