/*
fear of judgement stems from over identifying urself, accept that you dont know urself either and you might not be who you think you are
although beleiving in u drives u forward, you should be beleive so much so to oppose conscience change or learning of truth about yourself
dont confuse completing the job with proving your worth
*/
function newGuess(wordIndex) {
	var guess = [];
	var _word = wordList[wordIndex];
	//	fix the hints
	for (var i = 0; i <= _word.length; i++) {
		guess[i] = _word.hint[i];
	}
	return guess;		
}

function stopGame() {
	if (redWords.length == 0 && timing) {
		timing = false
		//	unset the clockHandle
		word = null
		if ($('#submit_details').is(':checked')) {
			var score = calculateScore()
			var letters = countLetters()
			$.get('http://www.dcode-it.com/test/scores.php?time='+time+'&score='+score+'&fullname='+$('#fullname').val()+'&email='+$('#email').val()+'&wordcount='+ wordCount + '&maxsize=' + $('#maximum_word_size').val() + '&letters=' + letters , function(data) { if(data) alert(data) } )
			//	send data, store recoords
		}
	}
}

function mouseDoubleClick(e){
	if(e.originalEvent)
		e=e.originalEvent
	if ( !puzzle || $('#setting_panel').css('display') == 'block' ) {
		return true;
	}

	var x = (e.touches) ? e.touches[0].pageX : e.pageX;
	var y = (e.touches) ? e.touches[0].pageY : e.pageY;

	x = Math.floor((x-$("#canvas").offset().left -PUZZLE_LEFT) / SIZE);
	y = Math.floor((y-$("#canvas").offset().top -PUZZLE_TOP) / SIZE);

	if (0<=x && x< COLUMNS && 0<=y && y< ROWS) {
		if ( puzzle[x][y] != null && puzzle[x][y] != -1 && hints[x][y] == null) {
			hint = hints[x][y] = puzzle[x][y];
			//	remove all guesses without this hint
			i = -1
			while (i < (i = detectWord(x,y,i))) {
				var _word = wordList[i]
				//	check if the hint is for this word
				k = x + y - _word.startx - _word.starty;
				_word.hint[k] = hint
				for (var j = guesses[i].length - 2; j >= 0; j--) {
					_guess = guesses[i][j]
					if (_guess[k] != hint) {
						//	remove guess
						removeGuess(i, j)
						guesses[i].splice(j,1)
					}
				}
				var _guess = guesses[i][guesses[i].length -1]
				_guess[k] = hint
				//	if everything is not hinted, and guess is complete, check for word
				if (_word.hint.join('').length == _word.length + 1) {
					// remove guess if repeated
					// no need to remove, we don't show the last guess for full hints if repeated
//					continue
					repeatFlag = guesses[i].some(function (x) { return (x.join() == _guess.join() && x !== _guess) })
					if (repeatFlag) {
						guesses[i].pop()
						if (word === _word) {
							current_guess = guesses[i][guesses[i].length -1]
						}
						addGuess(i)
						guesses[i].push(newGuess(i))
						current_guess = guesses[i][guesses[i].length -1]
					}
					continue
				}
				if (_guess.join('').length == _word.length + 1 ) {
					//	check the guess

					if(_guess.join('').length > word.length) {
						found = checkList.indexOf(_guess.join(''));
						if ( found != -1) {
							//	is it a new guess?
							repeatFlag = guesses[i].some(function (x) { return (x.join() == _guess.join() && x !== _guess) })
							if(!repeatFlag) {
								//	add to the list
								addGuess(i)
								var g = guesses[i].push(newGuess(i));
								if (word === _word) {
									current_guess = guesses[i][g-1];
								}
							}
						}
					}
						

				}
			}
		}
	}
	drawPuzzle()
	return false;
}

function mouseClick(e){
	e=e.originalEvent
	if ( $('#setting_panel').css('display') == 'block' ) {
		return true
	}

	var x = (e.touches) ? e.touches[0].pageX : e.pageX;
	var y = (e.touches) ? e.touches[0].pageY : e.pageY;

	x = x - $("#canvas").offset().left
	y = y - $("#canvas").offset().top

	for (var i = events.length - 1; i >= 0; i--) {
		var ev = events[i]
		if (ev[0] <= x && x <= ev[0] + ev[2] && ev[1] <= y && y <= ev[1] + ev[3]) {
			ev[4](x, y)
			continue
		}
	}

	if (!timing) {
		//	nothing to do here
		drawPuzzle()
		return false
	}

	var x = Math.floor((e.pageX-$("#canvas").offset().left -PUZZLE_LEFT) / SIZE);
	var y = Math.floor((e.pageY-$("#canvas").offset().top -PUZZLE_TOP) / SIZE);
	if (0<=x && x< COLUMNS && 0<=y && y< ROWS) {
        //  selecting a new word-code in the puzzle
        var oldid = -1;
        if (word) {
        	oldid = word.index;
        }
        var newid = detectWord(x, y, oldid);
        if (newid != -1 && newid != oldid) {	//	something new
			word = wordList[newid];
			word.index = newid;	//	fix for removing single words
			if(!guesses[newid]) {
				guesses[newid] = [newGuess(newid)];
			}
    		current_guess = guesses[newid][guesses[newid].length-1];
    		current_index = newid
    		scroll_index = 0
    	}
    } else {
    	//	check if the bars are clicked
//        	...
    }
//?? click on side bar
if (word) {
		var x = Math.floor((e.pageX-$("#canvas").offset().left - PUZZLE_LEFT -  (4-word.length)*0.5*SIZE )/(SIZE+4.5)+0.25)
		var y = Math.floor((e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE - ROWS-0.5)
		var char = '';
		if ( 0 <= x && x <= word.length) {
			//	ignore if this column is hinted already
			if (!word.hint[x]) {
				if ( 0 <= y && y < 5 ) {
					g = GROUP[word.data[x].charCodeAt(0)-65];
					if((g == 5) && (y==4)) {
						// Q Z
					    var tx = (e.pageX-$("#canvas").offset().left - PUZZLE_LEFT-  (4-word.length)*0.5*SIZE )/(SIZE+4.5) +.25 - x 
						var ty = (e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE - (ROWS+0.5) - y
						if((tx+ty)>0.85) {
							char = ALPHA[g][y+1];
						} else {
							char = ALPHA[g][y];
						}
					} else {
						char = ALPHA[g][y];
					}
					if (char != '') {
						//	toggle char on choices index x
						current_guess[x] = char;
						_word = current_guess.join('');
						if(_word.length > word.length) {
							found = checkList.indexOf(_word);
							if ( found != -1) {
								//	is it a new guess?
								repeatFlag = guesses[current_index].some(function (x) { return (x.join() == current_guess.join() && x !== current_guess) })
								if(!repeatFlag) {
									//	add to the guess list
									addGuess(current_index)
/*
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
									current_guess[0] = String.fromCharCode(65+Math.random()*26)
									guesses[current_index].push(current_guess.join().split(','));
*/
									current_guess = newGuess(current_index);
									var g = guesses[current_index].push(current_guess);
								}
							}
						}
					}
				}
			}
		}
		
		//	else check if the cross next to the guesses has been clicked
		//	only if there is anything to guess
		_scroll_index = Math.floor(scroll_index)
		for (var i = _scroll_index; i < guesses[current_index].length  && i < 5+_scroll_index; i++) 
		if ( i > 0 ) {
			var actual_i = guesses[current_index].length - i - 1
			var left = x_left
        	var top = x_top + SIZE*(i - _scroll_index);
			var x = e.pageX-$("#canvas").offset().left - left;
			var y = e.pageY-$("#canvas").offset().top - top;
			if( 0 <= x && x <= SIZE-10 && 0 <= y && y <= SIZE-10) {
				removeGuess(current_index, actual_i)
				guesses[current_index].splice(actual_i,1)
			}
    	}
	}
	drawPuzzle()
}
function detectWord(i, j, current_choice) {
	//	returns the index of the word which lays on (i,j)
	if (!puzzle || puzzle[i][j]==0)
		//	not a word
		return -1
	for (var k = 0; k < wordCount; k++) {
		if (k != current_choice) {
			tmp_word = wordList[k]
			if(tmp_word.startx <= i && i<= tmp_word.endx && tmp_word.starty <= j && j<= tmp_word.endy) { 
				return k
			}
		}
	}
	return current_choice
}
