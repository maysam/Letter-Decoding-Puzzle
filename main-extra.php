var <? echo $argv[1]; ?> = <?php
//error_reporting(0);
//	var tree = new Array();
//	read the file
$words = array();
do {
		$current_line = fgets(STDIN,1024);
		$current_line = strtoupper(trim($current_line));
		if ($current_line != '') {
			$words[] = $current_line;
		}
} while ($current_line != '');
//	construct the tree
$tree = array('level' => 0, 'parent' => null);
foreach ($words as $word) {
	if(strlen($word)<3 || strlen(($word)>9))
		continue;
	# code...
	$temp =&$tree;
	for ($j=0; $j < strlen($word); $j++) { 
		$index = (ord($word[$j])-65)*2+2;
//		error_log($word[$j].': checking '.$index.' in '.$temp[$index]. ' at '.$j);
		if ( !isset($temp[$index]) ) {
			$temp[$index] = $word[$j];
			$temp[$index+1] = array('level' => $j+1, 'parent' => null);
		}
		$temp =&$temp[$index+1];
	}
	$temp['YES'] = true;
	//echo '.';	ob_flush();
}
function process ( $node ) {
	$s = '['.$node['level'].',null';
	foreach ($node as $i => $value) {
		if($i % 2 == 0 && $i >= 2 && $i <= 54) {
			$s .= ',\''.$value.'\','.process($node[$i+1]);
		}
	}
	if($node['YES']) {
		$s.= ',\'YES\'';
	}
	$s .= ']';
	return $s;
}
echo process($tree);
?>;
function setParent(node) {
	for (var i = 3; i < node.length; i+=2) {
		if (node[i]) {
			node[i][1] = node;
			setParent(node[i]);
		}
	}
}
setParent(<?=$argv[1]?>);