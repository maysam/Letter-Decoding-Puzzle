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

(function($) {
     $.fn.doubleTap = function(doubleTapCallback) {
         return this.each(function(){
			var elm = this
			var lastTap = 0
			$(elm).bind('vmousedown', function (e) {
				var now = (new Date()).valueOf()
				var diff = (now - lastTap)
				lastTap = now ;
				if (diff < 250) {
					if($.isFunction( doubleTapCallback )) {
		                       doubleTapCallback.call(elm)
		            }
				}
			})
        })
    }
})(jQuery);
//  put class="doubleTap" on the elements you need to double tap
$("#canvas").doubleTap(function(e){
			// 'this' is the element that was double tap
			mouseDoubleClick(e)
  })
document.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, false); 

$(window).bind('touchstart', function(e){
       var now = new Date().getTime();
       var lastTouch = $(this).data('lastTouch') || now + 1 /** the first time this will make delta a negative number */;
       var delta = now - lastTouch;
       if(delta<500 && delta>0){
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
		if(temp.indexOf('YES') == -1) {
			//	make sure it's not a duplicated word
			temp.push('YES');
		}
		//	if tree has yes then take it as a word
	}
}
var dictionary = easyList;

var tree = [0,null];
makeTree();

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function newGame() {
	MIN_LENGTH = 3
	MAX_LENGTH = $("#maximum_word_size").val()
	tries = 0
	resetGuessList()
	do {
		tries++
		if (tries>100)
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
	} while (notConnected || wordCount != $("#number_of_words").val());
	timing = true
	time = 0
	drawPuzzle()
}
var ge

$(window).load(function () {
	$("#rules_div").hide()
	$("#setting_panel").hide()
	//$("#maximum_word_size").val(4)
	$("#number_of_words").val(15)
	if (supports_html5_storage()) {
		if(localStorage.fullname)
			$('#fullname').val(localStorage.fullname)
		if (localStorage.email)
			$('#email').val(localStorage.email)
	}

	$(window).bind('touchstart click', mouseClick);
	//	window.onclick = mouseClick
	window.ondblclick = mouseDoubleClick;
	function mouseMove(e) {
		ge = e
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
	window.onmousemove = mouseMove
	$("#rules_image")[0].onclick = function() {
		$("#rules_div").hide();
	}

	$("#number_of_words")[0].onchange = function(){
		if (this.value<9 || ~this.value == -1) {
			alert('Minimum number of words is 9');
			this.value = 9;
		}
		if (this.value>15) {
			alert('Maximum number of words is 15');
			this.value = 15;
		}
		return true;
	}
	$("#maximum_word_size")[0].onchange = function(){
		if (this.value<4 || ~this.value == -1) {
			alert('Minimum word size is 4');
			this.value = 4;
		}
		if (this.value>9) {
			alert('Maximum word size is 9');
			this.value = 9;
		}
		return true;
	}
	$('#saveButton')[0].onclick = function () {
		if ($('#submit_details').is(':checked')) {
			if ($('#fullname').val() == '') {
				alert('Please fill the name field')
				return false
			}
			/*
			if ($('#email').val() == '') {
				alert('Please fill the email field')
				return false
			}
			*/
			if (supports_html5_storage()) {
				localStorage.fullname = $('#fullname').val()
				localStorage.email = $('#email').val()
			}
		}
		$('#setting_panel').hide();
	}
	newGame()
})