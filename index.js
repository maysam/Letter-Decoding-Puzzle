if (!('indexOf' in Array.prototype)) {
	Array.prototype.indexOf= function(find, i /*opt*/) {
		if (i === undefined)
			i = 0
		if (i<0)
			i += this.length
		if (i<0)
			i = 0
		for (var n= this.length; i<n; i++)
			if (i in this && this[i]===find)
				return i
		return -1
	}
}

document.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, false); 

$(window).bind('touchstart', function(e){
       var now = new Date().getTime();
       var lastTouch = $(this).data('lastTouch') || now + 1 /** the first time this will make delta a negative number */;
       var delta = now - lastTouch;
       if(delta<200 && delta>0){
               // the second touchend event happened within half a second. Here is where we invoke the double tap code
               mouseDoubleClick(e)
       } else {
               // A click/touch action could be invoked here but wee need to wait half a second before doing so.
               mouseClick(e)
       }
       $(this).data('lastTouch', now);
})
function makeTree() {
	for (var i = 0; i < dictionary.length; i++) {
		_word = dictionary[i];
		if( _word.length<3 || _word.length>9)
			continue;
		temp = tree;
		for (var j = 0; j < _word.length; j++) {
			//	where should the character be listed at
			index = _word[j]; //	.charCodeAt(0)-65;
			//	is this number in the list yet?
			last = temp.indexOf(index) + 1;
			if ( last == 0 ) {
				// if not, add the ascii code and push an empty array after it
				last = temp.push(index);
				temp.push([j+1,temp]);
			}
			//	now temp is holding the new array or old one for this word
			temp = temp[last];

		};
		//	push something to indicated if you are up to here, you have a valid word
		/*
			CHASES
			DINE
			FASTED
			GRAPE
			ITS
			SOL 
		*/
		if(_.indexOf(temp, 'YES') == -1) {
			//	make sure it's not a duplicated word
			temp.push('YES');
		}
		//	if tree has yes then take it as a word
	}
}
var high_score = ''
var top_score = ''
var dictionary = easyList
var tree = [0,null]
makeTree()

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function newGame() {
	MIN_LENGTH = 3
	MAX_LENGTH = 5
	tries = 0
	resetGuessList()
	do {
		tries++
		if (tries>10000)
			break
		//console.log('tries: ', tries)
		init();
		var board = puzzle.slice(0);
		for(var i=0; i<COLUMNS; i++) {
			board[i] = board[i].slice(0);
		}		
		if(wordList.length>0) {
			isConnected(board, wordList[0].startx, wordList[0].starty);
		}
		notConnected = false;
		for(var i=0; i<COLUMNS; i++) {
			for(var j=0; j<ROWS; j++) {
				if (board[i][j] != null && board[i][j] != -1) {
					notConnected = true;
					break;
				}
			}
		}
	} while (notConnected || wordCount != $("#number_of_words:checked").val());
	timing = true
	time = 0
	$.ajax({
	  url: 'topscores.php',
	  dataType: 'json',
	  async: true,
	  data: {"wordcount": wordCount, "fullname": $('#fullname').val()},
	  success: function(data) {
	    high_score = data.HS
	    top_score=data.TS
	    drawPuzzle()
	    $('#loading_panel').hide()
	  }
	})
}

$(window).load(function () {
	$("#setting_panel").hide()
	$("#number_of_words[value=15]").attr('checked', true);
	if (supports_html5_storage()) {
		if(localStorage.fullname)
			$('#fullname').val(localStorage.fullname)
	}

	window.ondblclick = mouseDoubleClick
	function mouseMove(e) {
		if(e.originalEvent)
        	e=e.originalEvent
        e = e || window.event;
        if (!e.which && e.button) {
            if      (e.button & 1) e.which = 1;
            else if (e.button & 4) e.which = 2;
            else if (e.button & 2) e.which = 3;
        }
        if (e.buttons != undefined)
        	button = e.buttons
        else
        	button = e.which
        if (button) {
        	//	scroll if scrollbar is there

			var x = (e.touches) ? e.touches[0].pageX : e.pageX;
			var y = (e.touches) ? e.touches[0].pageY : e.pageY;

			x = x - $("#canvas").offset().left
			y = y - $("#canvas").offset().top

			for (var i = events.length - 1; i >= 0; i--) {
				var ev = events[i]
				if (ev[0] <= x && x <= ev[0] + ev[2] && ev[1] <= y && y <= ev[1] + ev[3]) {
					ev[4](x, y)
					drawPuzzle()
					continue
				}
			}

        }
	}
	$(window).bind('click', mouseClick)
	window.onmousemove = mouseMove
	$('#saveButton')[0].onclick = function () {
		if ($('#submit_details').is(':checked')) {
			if ($('#fullname').val() == '') {
				alert('Please fill the name field')
				return false
			}
			if (supports_html5_storage()) {
				localStorage.fullname = $('#fullname').val()
				localStorage.email = $('#email').val()
			}
		}
		$('#setting_panel').hide();
	}
	newGame()
})