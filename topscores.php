<?php
$fullname = $_REQUEST['fullname'];
$wordcount = intval($_REQUEST['wordcount']);
if ($wordcount < 9) {
    $wordcount = 9;
}
if ($wordcount > 15) {
    $wordcount = 15;
}

$list = array();
if (($handle = fopen("datafile", "r")) !== FALSE) {
    while (($data = fgetcsv($handle)) !== FALSE) {
        $list[] = $data;
    }
    fclose($handle);
}


foreach ($list as $key => $item) {
    $item = json_decode($item[0]);
    if ($wordcount == $item->wordcount) {
        $data[] = $item;
    }
}
function data_sort($a, $b) {
    if ($a->score >= $b->score) return -1;
    return 1;
 }

$top_score = '';
$high_score = '';
usort($data, 'data_sort');
$top_score = $data[0]->score;
foreach ($data as $key => $item) {
    if ($item->fullname == $fullname) {
        $high_score = $item->score;
        break;
    }
}
?>{"HS":"<?=$high_score?>", "TS":"<?=$top_score?>"}