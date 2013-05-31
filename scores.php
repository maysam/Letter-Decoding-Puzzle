<?php
error_reporting(-1);
//	54.251.62.84
//	QJ6T!yybCq

$original = $list = array();
$new_record = false;

if (($handle = fopen("datafile", "r")) !== FALSE) {
    while (($data = fgetcsv($handle)) !== FALSE) {
        $list[] = $data;
    }
    fclose($handle);
}

if ($_REQUEST['fullname'] || $_REQUEST['email'] || $_REQUEST['wordcount'] || $_REQUEST['maxsize'] ||
    $_REQUEST['letters'] || $_REQUEST['time'] || $_REQUEST['score']) {
    $html_display = false;
} else {
    $html_display = true;
}

if ($_REQUEST['fullname'] && $_REQUEST['email'] && $_REQUEST['wordcount'] && $_REQUEST['letters'] && $_REQUEST['time'] && $_REQUEST['score']) {

    $_REQUEST['date'] = time();
    $md5 = $_REQUEST['id'] = md5($_REQUEST['fullname'].$_REQUEST['email'].$_REQUEST['wordcount'].$_REQUEST['letters'].$_REQUEST['time'].$_REQUEST['score'].$_REQUEST['date']);
    $score = $_REQUEST['score'];
    $time = $_REQUEST['time'];
    $wordcount = $_REQUEST['wordcount'];
    $list[][] = json_encode($_REQUEST);

    $new_record = $md5;

}

foreach ($list as $key => $item) {
    $item = json_decode($item[0]);
    $original[] = $item;
    $data[$item->wordcount][] = $item;
}

if($data)
    krsort($data);

const MAX_COUNT = 1000;

if ($new_record) {
    if (count($data[$wordcount]) > MAX_COUNT) {
        //  remove list item with id = $data[$wordcount][MAX_COUNT]['id']
        usort($data[$wordcount], 'data_sort');
        $remove_id = $data[$wordcount][MAX_COUNT]->id;
        unset($data[$wordcount][MAX_COUNT]);
    }
    # code...
    if(($fp = fopen('datafile', 'w')) !== FALSE) {
        foreach ($list as $item) {
            $item_de = json_decode($item[0]);
            if (isset($remove_id) && $item_de->id == $remove_id) {
                //  ignore
            } else {
                fputcsv($fp, $item);
            }
        }
        fclose($fp);
    }
}
function data_sort($a, $b) {
    if ($a->score > $b->score) return -1;
    if ($a->score < $b->score) return 1;
    //  scores are the same
    if ($a->time < $b->time) return -1;
    if ($a->time > $b->time) return 1;
    //  equal times
    if ($a->date < $b->date) return -1;
    if ($a->date > $b->date) return 1;
    //  first person to score is higher
    return +1;
}

function time_sort($a, $b) {
    if ($a->time < $b->time) return -1;
    if ($a->time > $b->time) return 1;
    //  equal times
    if ($a->date < $b->date) return -1;
    if ($a->date > $b->date) return 1;
    //  first person to score is higher
    if ($a->score > $b->score) return -1;
    if ($a->score < $b->score) return 1;
    //  scores are the same
    return +1;
}

if ($html_display) {
    ?>
<html>
<head>
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
</head>
<body>
    <?php
}
if($original) {
    usort($original, 'time_sort');
    if ($html_display) {
        echo "<h1>Fastest Time</h1>";
    }
    foreach ($original as $counter => $item) {
        if ($counter < 10) {
            if ($html_display) {
                echo ($counter+1)."- Time: {$time_string}, Score: {$item->score}, {$item->fullname}<br/>";
            }
        }
        if ($new_record == $item->id ) {
            $time_ranking = $counter + 1;
            break;
        }
    }
}
if($data)
foreach ($data as $wordcount => $list) {
    usort($list, 'data_sort');
    $data[$wordcount] = $list;
    if ($html_display)
        echo "<h3>$wordcount word puzzles</h3>";
    $counter = 0;
    foreach ($list as $key => $item) {
        # code...
        if ($counter++ <= MAX_COUNT) {
            if ($html_display) {
                $time_data = $item->time;
                $time_string = $time_data % 60;
                $time_data = floor($time_data/60);
                    $time_string = ($time_data % 60) . ':' . $time_string;
                if ($time_data>0) {
                    $time_data = floor($time_data/60);
                    if ($time_data) {
                        $time_string = $time_data . ':' . $time_string;
                    }
                }
                echo "$counter- Score: {$item->score}, Time: {$time_string} {$item->fullname}<br/>";
            }
        }
        if ($new_record == $item->id ) {
            $ranking = $counter;
        }
    }
}
if ($html_display) {
    ?>
    </body>
    <?php
}
if ($new_record) {
    if ($ranking) {
        echo 'Vow, you ranked '.$ranking;
    } else {
        echo 'Next time, be faster';
    }
    if($time_ranking <= 10) {
        if($ranking)
            echo "\r\n";
        echo "Your time ranked in the top $time_ranking";

    }
}
?>
