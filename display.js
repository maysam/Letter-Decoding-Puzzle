function calculateScore() {
	var points = 0;
	if (!wordList)
		return 0;
	for (var i = 0; i < wordList.length; i++) {
		points += (guesses[i][0].length - wordList[i].hint.join('').length)*(guesses[i].length-1)
	}
	return points;
}

function calculateGuesses() {
	var guess_count = 0
	if (guesses) {
		for (var i = guesses.length - 1; i >= 0; i--) {
			guess_count += guesses[i].length - 1
		}
	}
	return guess_count
}

function countLetters() {
	var letters = 0;
	for(var i=0; i<COLUMNS; i++) {
		for(var j=0; j<ROWS; j++) {
			if (puzzle[i][j] != null && puzzle[i][j] != -1) {
				letters ++
			}
		}
	}
	return letters
}

var events = []

function drawMenu() {
	var left_offset = 0
	if (isiOS) {
    	var left = PUZZLE_LEFT-.33*SIZE
    	var top = PUZZLE_TOP+SIZE*(ROWS+6)
		context.drawImage($('#backButton')[0], left, top, SIZE*0.9, SIZE*0.9)
		events.push([left, top, SIZE*0.9, SIZE*0.9, function () { history.go(-1) }])
		left_offset = SIZE
	}

	var left = PUZZLE_LEFT-.33*SIZE + left_offset;
	var top = PUZZLE_TOP+SIZE*(ROWS+6);
	context.drawImage($('#settings-button')[0], left, top, SIZE*0.9, SIZE*0.9)
	events.push([left, top, SIZE*0.9, SIZE*0.9, function () { $('#setting_panel').show() }])
	
	var left = PUZZLE_LEFT + SIZE*0.75 + left_offset;
	var top = PUZZLE_TOP + SIZE*(ROWS+6);
	var score = calculateScore()
	var guess_count = calculateGuesses()

	if (repeatFlag) {
		context.font = 'bold 14px sans-serif';
		context.fillStyle    = "#ff0000";
		context.fillText( 'REPEATED!', left + SIZE*3.2,top + SIZE/2.5);
		repeatFlag = false;
	};

	context.drawImage($('#new-button')[0], left, top, SIZE*1.6, SIZE*0.8)
	events.push([left, top, SIZE*1.6, SIZE*0.8, function () { newGame() }])

	if (timing && redWords && redWords.length == 0 && guess_count > 0) {
		context.drawImage($('#stop-button')[0], left, top, SIZE*1.6, SIZE*0.8)
		events.push([left, top, SIZE*1.6, SIZE*0.8, function () { stopGame() }])
	}
	left = width - SIZE*2
	context.fillStyle    = "#cccccc";
	context.fillRect(left, top, SIZE*1.8, SIZE*0.8);
	context.strokeStyle    = "#666666";
	context.strokeRect(left, top, SIZE*1.8, SIZE*0.8);
	context.fillStyle = COLORS[0];
	context.font = 'bold 16px sans-serif';
	context.fillText( score, left + SIZE*0.9,top + SIZE*0.4);
}

function drawPuzzle() {
	events = []
	context.canvas.width = context.canvas.width;	
	context.textBaseline = 'middle';
    context.textAlign = "center";
    context.lineWidth = 1

	context.fillStyle = COLORS[0];
	context.fillRect(PUZZLE_LEFT-SIZE/4, PUZZLE_TOP-SIZE/4, SIZE*COLUMNS+SIZE/2, SIZE*ROWS+SIZE/2);
	context.strokeStyle  = "#ffCCff";
    context.lineWidth = 5;
	context.strokeRect(PUZZLE_LEFT-SIZE/8, PUZZLE_TOP -SIZE/8, SIZE*COLUMNS+SIZE/4, SIZE*ROWS+SIZE/4);
    context.stroke();
    context.strokeStyle = COLORS[0];

    redWords = []
    redLetters = []
    function Point(i, j) {
    	this.x = i
    	this.y = j
    }
    possible_empty_spots = []
	for(var j=0; j<ROWS; j++) {
		var is_empty = 0
		for(var i=0; i<COLUMNS; i++) {
			var left = PUZZLE_LEFT+SIZE*i;
			var top = PUZZLE_TOP+SIZE*j;
			var textLeft = left + SIZE/2;
			var textTop = top + SIZE/2;
			//	show the chosen alphabet in the puzzle
			//	if multiple words, just the last one, 				
			index1 = detectWord(i,j,-1);
			if (index1 == -1) {
				//	empty spot
				is_empty++
				if (is_empty>=2) {
					possible_empty_spots.push(new Point(left - SIZE, top))
				}
				continue
			}
			is_empty = 0
			//	so there is a word
			//	is there another word
			index2 = detectWord(i,j,index1)
			//	there are guesses for word 1
			has_guess_1 = (guesses[index1] != undefined && guesses[index1].length > 1);
			//	there are guesses for word 2
			has_guess_2 = (guesses[index2] != undefined && guesses[index2].length > 1);

			if ( hints[i][j] != null ) {
				//	if there is a hint, just go ahead with it
				context.drawImage($('#white-tile')[0], left, top, SIZE, SIZE)

				context.fillStyle = COLORS[0];
				context.font = 'bold 20px sans-serif';
            	context.fillText(hints[i][j], textLeft, textTop);

				//	also red word if the hint is not in the guesses
            	if (index1 != -1) {
					list1 = [];
					word1 = wordList[index1];
					var k1 = i + j - word1.startx - word1.starty;
					if (has_guess_1) {
						for (var m = 0; m < guesses[index1].length-1; m++) {
							list1.push(guesses[index1][m][k1])
						}
					}
					if (list1.indexOf(hints[i][j]) == -1 && word1.data.join() !=  word1.hint.join()) {
						redWords[index1]=index1
					}
					if (index2 != index1) {
						list2 = [];
						word2 = wordList[index2];
						var k2 = i + j - word2.startx - word2.starty;
						if (has_guess_2) {
							for (var m = 0; m < guesses[index2].length-1; m++) {
								list2.push(guesses[index2][m][k2])
							}
						}
						if (list2.indexOf(hints[i][j]) == -1  && word2.data.join() !=  word2.hint.join()) {
							redWords[index2]=index2
						}
					}
				}
            	continue;
			}

			if(puzzle[i][j] != null && puzzle[i][j] != -1) {
				g = GROUP[puzzle[i][j].charCodeAt(0)-65];
			} else {
				g = 0;
				continue
			}

			context.drawImage($('#'+COLORS[g]+'-tile')[0], left, top, SIZE, SIZE)


			if (index1 != index2) {
				//	determine if red box is needed around the words
				list1 = [];
				word1 = wordList[index1];
				var k1 = i + j - word1.startx - word1.starty;
				if (has_guess_1) {
					for (var m = 0; m < guesses[index1].length-1; m++) {
						list1.push(guesses[index1][m][k1])
					}
				}
				list2 = [];
				word2 = wordList[index2];
				var k2 = i + j - word2.startx - word2.starty;
				if (has_guess_2) {
					for (var m = 0; m < guesses[index2].length-1; m++) {
						list2.push(guesses[index2][m][k2])
					}
				}
				for (var m = 0; m < list1.length; m++) {
					if ( list2.indexOf(list1[m]) == -1 ) {
						redWords[index2]=index2
					}
				}
				//	also red word if the hint is not in the guesses
				if (hints[i][j] != null && list2.indexOf(hints[i][j]) == -1 ) {
					redWords[index2]=index2
				}
			
				if (redLetters[index2] == undefined) {
					redLetters[index2] = []
				}
				redLetters[index2][k2] = list1

				for (var m = 0; m < list2.length; m++) {
					if ( list1.indexOf(list2[m]) == -1 ) {
						redWords[index1] = index1
					}
				}
				//	also red word if the hint is not in the guesses
				if (hints[i][j] != null && list1.indexOf(hints[i][j]) == -1 ) {
					redWords[index1]=index1
				}
				if (redLetters[index1] == undefined) {
					redLetters[index1] = []
				}
				redLetters[index1][k1] = list2
			}

			//	to eliminate when there is no guesses
			if (!has_guess_1 && !has_guess_2) {
				//	nothing to show
				//	no guess
				continue;
			}
			if (!has_guess_1 && has_guess_2) {
				index1 = index2;
				has_guess_1 = has_guess_2;
			} else if (!has_guess_2 && has_guess_1) {
				index2 = index1;
				has_guess_2 = index1;
			}
			var ch1 = '';
			var ch2 = '';
			
			if (index1 != -1) {
				_word = wordList[index1];
				//	show the last guess
				l = guesses[index1].length-1;
				if ( l>0 ) {
					l--;
				}
				k = i + j - _word.startx - _word.starty;
				ch1 = guesses[index1][l][k];
				if (ch1 == undefined)
					ch1 = null;
			}
			if(index2 != index1) {
				_word = wordList[index2];
				//	show the last guess
				l = guesses[index2].length-1;
				if ( l>0 ) {
					l--;
				}
				k = i + j - _word.startx - _word.starty;
				ch2 = guesses[index2][l][k];

				if (ch1 == ch2 || ch2 == undefined) {
					index1 = index2;
					has_guess_1 = has_guess_2;
				}
				if (ch1 == null) {
					ch1 = ch2;
					index1 = index2;
					has_guess_1 = has_guess_2;
				}
			}
			if (ch1 != null) {
				if (index1 != index2) {
					//	only show last guess
					//	-2 since last guess is not final yet
					gi1 = getGuessIndex(index1, guesses[index1].length-2)
					gi2 = getGuessIndex(index2, guesses[index2].length-2)
					if (gi2 > gi1) {
						index1 = index2
						ch1 = ch2
					}
				}
				context.fillStyle = COLORS[0];
				context.font = 'bold 20px sans-serif';
            	context.fillText(ch1, textLeft, textTop);

			}
		}
	}

	for(var j=0; j<ROWS; j++) {
		for(var i=0; i<COLUMNS; i++) {
			var left = PUZZLE_LEFT+SIZE*i;
			var top = PUZZLE_TOP+SIZE*j;
			if(puzzle[i][j] != null && puzzle[i][j] != -1) {
				continue
			}
			context.drawImage($('#black-tile')[0], left, top, SIZE, SIZE)
		}
	}
	// draw site name on empty place

	//	empty_spot = possible_empty_spots[Math.floor(possible_empty_spots.length*Math.random())]
	empty_spot = possible_empty_spots[Math.floor(possible_empty_spots.length/2)]
	context.fillStyle = COLORS[6]
	context.font = 'bold 12px sans-serif'

	context.drawImage($('#black-tile-logo')[0], empty_spot.x, empty_spot.y , 2*SIZE, SIZE)
	
	//	draw red rectangle around words needing attention

	for (var i = 0; i < redWords.length; i++) {
		if (redWords[i] == i) {
			_word = wordList[redWords[i]]
	    	context.lineWidth = 3;
	        context.strokeStyle = "#ff2233";
	        context.strokeRect(PUZZLE_LEFT+_word.startx*SIZE+1, PUZZLE_TOP+_word.starty*SIZE+1, _word.xp*_word.length*SIZE+SIZE, _word.yp*_word.length*SIZE+SIZE);
	        context.stroke()
	    }
	}

	x_top = null
	x_left = null

    if (word) {
    	//	draw line around the selected word to highlight

    	context.lineWidth = 3;
        context.strokeStyle = "#ffffff";
        context.strokeRect(PUZZLE_LEFT+word.startx*SIZE+1, PUZZLE_TOP+word.starty*SIZE+1, word.xp*word.length*SIZE+SIZE, word.yp*word.length*SIZE+SIZE);
        context.stroke();

    	offset = 0;
        while(offset <= word.length) {
            index = puzzle[word.startx + offset*word.xp][word.starty + offset*word.yp];
            if (index != null && index != -1) {
				g = GROUP[index.charCodeAt(0)-65];
			} else {
				g = 0;
			}
            drawAlphaBar(g,offset++);
        }
		
		
		max = guesses[current_index].length
		while (scroll_index > max - 5 && scroll_index > 0) {
			scroll_index --
		}
		// draw the guesses with an X at the end so they can be deleted
		_scroll_index = Math.floor(scroll_index)
		for (var old_i = _scroll_index; old_i < 5+_scroll_index && old_i < guesses[current_index].length; old_i++) {
			var i = guesses[current_index].length - old_i - 1
			// if last word is repeated is hint is full, not show it
			var j = old_i - _scroll_index
			if (i==guesses[current_index].length-1) {
				var _guess = guesses[current_index][i];
				if (word.hint.join() == word.data.join() && guesses[current_index].some(function (x) { return (x.join() == _guess.join() && x !== _guess) }))
					continue 
			}
			for (var k = 0; k <= word.length + 1; k++) {
	        	var left = PUZZLE_LEFT + (SIZE+4)*(word.length + 0.7) + k * (SIZE-5) + (4-word.length)*0.75*SIZE + 5;

//	        	var left = PUZZLE_LEFT + (SIZE+4)*(word.length + 0.7) + (word.length+1) * (SIZE-5) + (word.length+1) * (SIZE-5);

	        	var top = PUZZLE_TOP+SIZE*(ROWS+.5 + j);
				if ( k == word.length+1 ) {
					//	refactor
					if (!x_left) {
						x_left = left+2
						x_top = top+2
					}	
				}
				if ( i < guesses[current_index].length-1 && k == word.length+1 ) {
					if (word.hint.join() != word.data.join()) {
						//	can remove only if all are not hinted
//							context.fillText('X', left + SIZE,top + SIZE/2);

						context.lineWidth = 2;
						context.beginPath();
						context.moveTo(left+5, top+5); // give the (x,y) coordinates
						context.lineTo(left+SIZE-11, top+ SIZE-11);
						context.moveTo(left+5, top+ SIZE -11); // give the (x,y) coordinates
						context.lineTo(left+SIZE-11, top+ 5);
						context.closePath();
						context.stroke();
						context.strokeRect(left+2 ,top+2 , SIZE-10, SIZE-10);
					}
				} else {
					if ( guesses[current_index][i][k] != undefined ) {
						//	draw guessed character
						context.font = 'bold 20px sans-serif';
						context.fillText(guesses[current_index][i][k], left + SIZE/2 - 2,top + SIZE/2 - 2 );
					} else if (k <= word.length) {
						//	draw placeholder box
						context.lineWidth = 1;
						context.strokeRect(left+2 ,top+2 , SIZE-10, SIZE-10);
					}
				}			
        	}	//	k
    	} // old i

		if (max > 5) {
			bar_length = (SIZE*5-6) * (5/max)
			bar_offset = scroll_index*(SIZE*5-6-bar_length)/(max - 5)
			context.strokeRect(x_left + SIZE  , x_top  , 10, SIZE*5)
			context.fillRect(x_left + SIZE +3 , x_top +3 +bar_offset  , 4, bar_length)
			events.push([x_left + SIZE - 10, x_top , SIZE, SIZE*5, function (x, y) { 
				max = guesses[current_index].length
				if (max <= 5)
					return false
				var _scroll_index = (y - x_top)/(SIZE*5-6)*(max - 4)
				if (_scroll_index <= max - 5) {
					scroll_index = _scroll_index
				} else {
					scroll_index = max - 5
				}
			}])
		}
		

    }
	context.lineWidth = 1;
    drawMenu()
}

function drawAlphaBar(group, offset) {
    if (group<1 || group>5)
        return;
    var underliners = []
    if (redLetters[current_index] != undefined && redLetters[current_index][offset] != undefined)
    	underliners = redLetters[current_index][offset]
    var selected_data = ALPHA[group];
	var left = PUZZLE_LEFT + (SIZE+4.5)*(offset-0.25) + (4-word.length)*0.5*SIZE + 1;
	var _top = PUZZLE_TOP+SIZE*(ROWS+0.5);    
	
	var _group = group
	if(word.hint[offset]) {
    	_group = 6
    }
	context.drawImage($('#'+COLORS[_group]+'-decoder')[0], left, _top, SIZE, SIZE*5)
    
    for (var i=0; i<5; i++) {
    	//	drawing the decoders under the puzzle
    	var top = PUZZLE_TOP+SIZE*(i+ROWS+0.5);
        context.fillStyle = "#000000";
        if ( i == 4 && group == 5) {
            context.font = 'bold 15px sans-serif';
            context.fillText(selected_data[i], left + SIZE/4, top + SIZE*.35);
            context.font = 'bold 15px sans-serif';
            context.fillText(selected_data[i+1], left + SIZE*3/4, top + SIZE*.65);

	    	context.beginPath();
	        context.strokeStyle = "#000000";
	        context.lineWidth = 2
	        if (underliners.indexOf(selected_data[i]) != -1) {
			    context.moveTo(left+SIZE*.1,top+SIZE*.65);
			    context.lineTo(left+SIZE*.45,top+SIZE*.65);
			}

	        if (underliners.indexOf(selected_data[i+1]) != -1) {
			    context.moveTo(left+SIZE*.6,top+SIZE*.9);
			    context.lineTo(left+SIZE*.9,top+SIZE*.95);
			}
		    context.closePath();
		    context.stroke();
        } else {
            context.font = 'bold 20px sans-serif';
            context.fillText(selected_data[i], left + SIZE/2,top + SIZE/2);

	        if (underliners.indexOf(selected_data[i]) != -1) {
		    	context.beginPath();
		        context.strokeStyle = "#000000";
		        context.lineWidth = 3
			    context.moveTo(left+SIZE*.15,top+SIZE*.85);
			    context.lineTo(left+SIZE*.85,top+SIZE*.85);
			    context.closePath();
			    context.stroke();
			}
        }
    }

    for (var i=0; i<5; i++) {
    	//	drawing boxes to indicate the selected letter
    	var left = PUZZLE_LEFT + (SIZE+4.5)*(offset-0.25) + (4-word.length)*0.5*SIZE +1;
    	var top = PUZZLE_TOP+SIZE*(i+ROWS+0.5);
        context.strokeStyle = "#000000";
        context.lineWidth = 1;
        if ( i == 4 && group == 5) {
        	//	drawing rectangles for Q and Z
        	if (current_guess[offset] == selected_data[i]) {
            	//	Q
				context.beginPath();
				context.moveTo(left+1, top+1); // give the (x,y) coordinates
				context.lineTo(left+SIZE-1, top+1);
				context.lineTo(left+1, top+SIZE-1);
				context.closePath();
				context.stroke();
            }
        	if (current_guess[offset] == selected_data[i+1]) {
            	//	Z
				context.beginPath();
				context.moveTo(left+SIZE-1, top+SIZE-1); // give the (x,y) coordinates
				context.lineTo(left+SIZE-1, top+1);
				context.lineTo(left+1, top+SIZE-1);
				context.closePath();
				context.stroke();
            }
        } else {
        	if (current_guess[offset] == selected_data[i]) {
	            context.strokeRect(left+1, top+1, SIZE-2, SIZE-2);
            }
    	}
    }
}