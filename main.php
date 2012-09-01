var <?php echo $argv[1]; ?>  = [<?php
do {
		$current_line = fgets(STDIN,1024);
		$current_line = strtoupper(trim($current_line));
		$len = strlen($current_line);
		if ($len >= 3 && $len <= 6) {
			echo "'$current_line',";
		}
} while ($current_line != '');
?>]