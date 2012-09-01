function calculateScore() {
	var points = 0;
	if (!wordList)
		return 0;
	for (var i = 0; i < wordList.length; i++) {
		points += (guesses[i][0].length)*(guesses[i].length-1)-wordList[i].hint.join('').length
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

function update_time() {
	var left = PUZZLE_LEFT + 6.4*SIZE;
	left = width - SIZE*4.2
	var top = PUZZLE_TOP+SIZE*(ROWS+6);

	context.fillStyle    = "#cccccc";
	context.fillRect(left, top, SIZE*2.0, SIZE*0.8);
	context.strokeStyle    = "#666666";
	context.strokeRect(left, top, SIZE*2.0, SIZE*0.8);

	if (redWords && redWords.length) {
		context.fillStyle = 'red'
	} else {
		context.fillStyle = 'green'
	}
	context.font = 'bold 18px sans-serif';
	display_time = time
	if (display_time>3600) {
		display_time = Math.floor(display_time/60)
	}
	seconds = display_time % 60
	if (seconds<10)
		seconds = '0' + seconds
	minutes = Math.floor(display_time / 60)
	if (minutes<10)
		minutes = '0' + minutes
	context.fillText( minutes+':'+seconds, left + SIZE*1.0, top + SIZE*0.4)
}
var events = []

function drawMenu() {
	events = []
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
	context.drawImage($('#options')[0], left, top, SIZE*0.9, SIZE*0.9)
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

	context.fillStyle    = "#ffaacc";
	context.fillRect(left, top, SIZE*1.5, SIZE*0.8);
	context.strokeStyle    = "#666666";
	context.strokeRect(left, top, SIZE*1.5, SIZE*0.8);
	context.fillStyle = COLORS[0];
	context.font = 'bold 16px sans-serif';
	context.fillText( 'NEW', left + SIZE*0.75 ,top + SIZE*0.45);
	events.push([left, top, SIZE*1.5, SIZE*0.8, function () { newGame() }])

	left += SIZE*1.65

	if (false) {
		context.fillStyle    = "#ffaacc";
		context.fillRect(left, top, SIZE*2.1, SIZE*0.8);
		context.strokeRect(left, top, SIZE*2.1, SIZE*0.8);
		context.fillStyle = COLORS[0];
		context.fillText( 'RULES', left + SIZE*1.05 ,top + SIZE*0.45);
	}

	left += SIZE*2.25
	left = width - SIZE*6
	if (timing && redWords && redWords.length == 0 && guess_count > 0) {
		context.fillStyle    = "#ffaacc";
		context.fillRect(left, top, SIZE*1.6, SIZE*0.8);
		context.strokeRect(left, top, SIZE*1.6, SIZE*0.8);
		context.fillStyle = COLORS[0];
		context.fillText( 'STOP', left + SIZE*0.8 ,top + SIZE*0.45);
		events.push([left, top, SIZE*1.6, SIZE*0.8, function () { stopGame() }])
	}
	left += SIZE*3.9
	left = width - SIZE*2
	context.fillStyle    = "#cccccc";
	context.fillRect(left, top, SIZE*1.75, SIZE*0.8);
	context.strokeStyle    = "#666666";
	context.strokeRect(left, top, SIZE*1.75, SIZE*0.8);
	context.fillStyle = COLORS[0];
	context.font = 'bold 16px sans-serif';
	context.fillText( score, left + SIZE*0.75,top + SIZE*0.45);
}
function setShadow(status, color) {
	if (status) {
		if (color == undefined) {
			color = 'white'
		}
	    context.shadowColor = color
	    context.shadowOffsetX = 2
	    context.shadowOffsetY = 2
	    context.shadowBlur = 10
	} else {
		if (color == undefined) {
			color = 'black'
		}
	    context.shadowColor = color
	    context.shadowOffsetX = 0
	    context.shadowOffsetY = 0
	    context.shadowBlur = 0		
	}
}
function drawPuzzle() {
	context.canvas.width = context.canvas.width;	
	context.textBaseline = 'middle';
    context.textAlign = "center";
    context.lineWidth = 1

    setShadow(true)

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
					possible_empty_spots.push(new Point(left, textTop))
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
				context.fillStyle = '#ffffff';
				context.fillRect(left ,top ,SIZE,SIZE);
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
			w = 1.5
			context.fillStyle = COLORS[g];
			context.fillRect(left+w ,top ,SIZE-w,SIZE-w);
            context.lineWidth = w
            //context.strokeStyle = COLORS[0]
            //context.strokeRect(left, top, SIZE, SIZE)
            context.strokeStyle = '#999999'
            context.strokeRect(left, top+w/2, w, SIZE-w/2)
            context.strokeStyle = '#cccccc'
            context.strokeRect(left+w/2, top+SIZE-w, SIZE-w/2, w)
			context.strokeStyle = COLORS[g];
			context.strokeRect(left+w ,top ,SIZE-w,SIZE-w);

			if (i>0 && g>0 && puzzle[i-1][j] != null && puzzle[i-1][j] != -1 && g==GROUP[puzzle[i-1][j].charCodeAt(0)-65]) {
				// draw a vertical line between similar color tiles                    
                context.strokeRect(PUZZLE_LEFT+SIZE*i-.5,PUZZLE_TOP+SIZE*j,0,SIZE);
			}
			if (j>0 && g>0 && puzzle[i][j-1] != null && puzzle[i][j-1] != -1 && g==GROUP[puzzle[i][j-1].charCodeAt(0)-65]) {
				// draw a horizontal line between similar color tiles
                context.strokeRect(PUZZLE_LEFT+SIZE*i-.5,PUZZLE_TOP+SIZE*j,SIZE,0);
			}

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
				if (index1 == index2 ) {
					//	one word
					_word = wordList[index1];
					//	show the last guess
					l = guesses[index1].length-1;
					k = i + j - _word.startx - _word.starty;
					//	show letter by letter
					x = _word.startx + k*_word.xp;
					y = _word.starty + k*_word.yp;
					left = PUZZLE_LEFT+SIZE*x;
					top = PUZZLE_TOP+SIZE*y;
					
					context.fillStyle = COLORS[0];
					context.font = 'bold 20px sans-serif';
	            	context.fillText(ch1, textLeft, textTop);
				} else {
					//	show both
					_word = wordList[index1];
					//	show the last guess
					l = guesses[index1].length-1;
					k = i + j - _word.startx - _word.starty;
					//	show letter by letter
					x = _word.startx + k*_word.xp;
					y = _word.starty + k*_word.yp;
					left = PUZZLE_LEFT+SIZE*x;
					top = PUZZLE_TOP+SIZE*y;
					
					context.fillStyle = COLORS[0];
					context.font = 'bold 14px sans-serif';
	            	context.fillText(ch1, textLeft - SIZE/4 , textTop - SIZE/4);

					//	show guess 2
					_word = wordList[index2];
					//	show the last guess
					l = guesses[index2].length-1;
					k = i + j - _word.startx - _word.starty;
					//	show letter by letter
					x = _word.startx + k*_word.xp;
					y = _word.starty + k*_word.yp;
					left = PUZZLE_LEFT+SIZE*x;
					top = PUZZLE_TOP+SIZE*y;
					
					context.fillStyle = COLORS[0];
					context.font = 'bold 14px sans-serif';
	            	context.fillText(ch2, textLeft + SIZE/4, textTop + SIZE/4);
					//	two word intersection
				}
			}
		}
	}

	setShadow(false)

	for(var j=0; j<ROWS; j++) {
		var is_empty = 0
		for(var i=0; i<COLUMNS; i++) {
			var left = PUZZLE_LEFT+SIZE*i;
			var top = PUZZLE_TOP+SIZE*j;
			if(puzzle[i][j] != null && puzzle[i][j] != -1) {
				continue
			} 

			w = 1.5
			context.fillStyle = COLORS[0];
			context.fillRect(left+w ,top ,SIZE,SIZE);
		}
	}
	// draw site name on empty place

	//	empty_spot = possible_empty_spots[Math.floor(possible_empty_spots.length*Math.random())]
	empty_spot = possible_empty_spots[Math.floor(possible_empty_spots.length/2)]
	context.fillStyle = COLORS[6]
	context.font = 'bold 12px sans-serif'
	context.fillText('dcode-it',empty_spot.x, empty_spot.y)
	
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
		
		// draw the guesses with an X at the end so they can be deleted
		for (var i = 0; i < guesses[word.index].length; i++) {
			// if last word is repeated is hint is full, not show it
			if (i==guesses[word.index].length-1) {
				var _guess = guesses[word.index][i];
				if (word.hint.join() == word.data.join() && guesses[word.index].some(function (x) { return (x.join() == _guess.join() && x !== _guess) }))
					continue 
			}
			for (var k = 0; k <= word.length + 1; k++) {
	        	var left = PUZZLE_LEFT + (SIZE+4)*(word.length + 0.7) + k * (SIZE-5) + (4-word.length)*0.75*SIZE;

//	        	var left = PUZZLE_LEFT + (SIZE+4)*(word.length + 0.7) + (word.length+1) * (SIZE-5) + (word.length+1) * (SIZE-5);

	        	var top = PUZZLE_TOP+SIZE*(ROWS+.5 + i);
				if ( i < guesses[word.index].length-1 && k == word.length+1 ) {
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
						if (!x_left) {
							x_left = left+2
							x_top = top+2
						}
					}
				} else {
					if ( guesses[word.index][i][k] != undefined ) {
						context.font = 'bold 20px sans-serif';
						context.fillText(guesses[word.index][i][k], left + SIZE/2 - 2,top + SIZE/2 - 2 );
					} else if (k <= word.length) {
						context.lineWidth = 0.5;
						context.strokeRect(left+2 ,top+2 , SIZE-10, SIZE-10);
					}
				}
        	}
    	}
    }
	context.lineWidth = 1;
	update_time()
    drawMenu()
}

function drawAlphaBar(group, offset) {
    if (group<1 || group>5)
        return;
    var underliners = []
    if (redLetters[word.index] != undefined && redLetters[word.index][offset] != undefined)
    	underliners = redLetters[word.index][offset]
    var selected_data = ALPHA[group];
	var left = PUZZLE_LEFT + (SIZE+4.5)*(offset-0.25) + (4-word.length)*0.5*SIZE;
	var _top = PUZZLE_TOP+SIZE*(ROWS+0.5);
    for (var i=0; i<5; i++) {
    	//	drawing the decoders under the puzzle
    	var top = PUZZLE_TOP+SIZE*(i+ROWS+0.5);
        
        if(word.hint[offset]) {
        	context.fillStyle = '#ffffff';
        } else {
	        context.fillStyle = COLORS[group];
        }
        context.fillRect(left, top, SIZE, SIZE);
    
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
    	var left = PUZZLE_LEFT + (SIZE+4.5)*(offset-0.25) + (4-word.length)*0.5*SIZE;
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
    setShadow(true, 'black')
    context.strokeRect(left, _top, SIZE, SIZE*5);
    setShadow(false)
}
function drawAlphaBar_new(group, offset) {
	w = 2
    if (group<1 || group>5)
        return;
    var underliners = []
    if (redLetters[word.index] != undefined && redLetters[word.index][offset] != undefined)
    	underliners = redLetters[word.index][offset]
    var selected_data = ALPHA[group];
    for (var i=0; i<5; i++) {
    	//	drawing the decoders under the puzzle
    	var left = PUZZLE_LEFT + (SIZE+4.5)*(offset-0.25) + (4-word.length)*0.5*SIZE;
    	var top = PUZZLE_TOP+SIZE*(i+ROWS+0.5);
        
        if(word.hint[offset]) {
        	context.fillStyle = '#ffffff';
        } else {
	        context.fillStyle = COLORS[group];
        }
        context.strokeStyle = "#000000"
        context.lineWidth = 2

        if ( i == 4 && group == 5) {	
		    context.fillRect(left, top, SIZE-w, SIZE-w);

        	context.fillStyle = "#000000"
        	if (current_guess[offset] == selected_data[i]) {
            	context.font = 'bold 14px sans-serif';
				context.fillRect(left, top+SIZE-w, SIZE-w, w/2);
        	} else {
        		context.font = '12px sans-serif';
        	}
            context.fillText(selected_data[i], left + SIZE*.275, top + SIZE*.275);
        	if (current_guess[offset] == selected_data[i+1]) {
            	context.font = 'bold 14px sans-serif';
		    	context.fillRect(left, top, w/2, SIZE-w);
        	} else {
        		context.font = '12px sans-serif';
        	}
            context.fillText(selected_data[i+1], left + SIZE*.65, top + SIZE*.6);

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

		    //	drawing the diagonal line between Q and Z
			context.beginPath();
	        context.strokeStyle = "#000000";
	        context.lineWidth = 2
			context.moveTo(left+SIZE-w, top+1);
			context.lineTo(left+1, top+SIZE-w);
			context.stroke();

		    context.strokeRect(left, top, SIZE-w, SIZE-w);
        } else {
        	if (current_guess[offset] == selected_data[i]) {
        		//	selected
	            context.font = 'bold 20px sans-serif';
		        context.fillRect(left, top, SIZE-w, SIZE-w);
		        context.fillStyle = COLORS[0]
		    	context.fillRect(left + SIZE - w, top, w/4, SIZE-w);
		        context.fillRect(left, top, SIZE-w, w/4);
		        context.strokeRect(left, top, SIZE-w, SIZE-w);
		        context.fillStyle = "#000000";
            } else {
            	//	not selected = normal
            	context.font = '18px sans-serif';	
		        context.fillRect(left, top, SIZE-w, SIZE-w);
		        context.fillStyle = COLORS[0]
		    	context.fillRect(left, top, w/2, SIZE-w);
		        context.fillRect(left, top+SIZE-w, SIZE-w, w/2);
		        context.strokeRect(left, top, SIZE-w, SIZE-w);
		        context.fillStyle = "#333333";
            }

            context.fillText(selected_data[i], left + SIZE/2-w/2,top + SIZE/2-w/2);

	        if (underliners.indexOf(selected_data[i]) != -1) {
		    	context.beginPath();
		        context.strokeStyle = "black";
		        context.lineWidth = 3
			    context.moveTo(left+SIZE*.15,top+SIZE*.85-w/2-1);
			    context.lineTo(left+SIZE*.85-w,top+SIZE*.85-w/2-1);
			    context.stroke();
			}
        }
    }
}