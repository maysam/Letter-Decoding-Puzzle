	function drawPuzzle() {
		context.canvas.width = context.canvas.width;	
		context.fillStyle    = '#000000';
		context.fillRect(180,5,180,50);
		context.fillStyle    = '#ffffff';
		context.font         = '24px sans-serif';
		context.textBaseline = 'top';
		context.fillText  ('DCODE-IT!', 210, 10);
		for(var i=0; i<5; i++) {
			context.fillStyle    = COLORS[5-i];
			context.fillRect(180 + 15 + 30*i,40,30,5);
		}
		context.beginPath();
		context.fillStyle = COLORS[0];
		context.fillRect(PUZZLE_LEFT-10, PUZZLE_TOP-10, SIZE*COLUMNS+20, SIZE*ROWS+20);
		context.strokeStyle  = "#ffCCff";
        context.lineWidth = 5;
		context.strokeRect(PUZZLE_LEFT-6, PUZZLE_TOP-6, SIZE*COLUMNS+12, SIZE*ROWS+12);
        context.stroke();
        context.strokeStyle = COLORS[0];
		for(var i=0; i<COLUMNS; i++) {
			for(var j=0; j<ROWS; j++) {
				var left = PUZZLE_LEFT+SIZE*i;
				var top = PUZZLE_TOP+SIZE*j;
				if(puzzle[i][j] != null && puzzle[i][j] != -1) {
					g = GROUP[puzzle[i][j].charCodeAt(0)-65];
				} else {
					g = 0;
				}
                context.lineWidth = 0.5;			
				context.fillStyle = COLORS[g];
				context.fillRect(left ,top ,SIZE,SIZE);

				if (i>0 && g>0 && puzzle[i-1][j] != null && puzzle[i-1][j] != -1 && g==GROUP[puzzle[i-1][j].charCodeAt(0)-65]) {
					// draw a vertical line between similar color tiles                    
                    context.strokeRect(PUZZLE_LEFT+SIZE*i-.5,PUZZLE_TOP+SIZE*j,0,SIZE);
				}
				if (j>0 && g>0 && puzzle[i][j-1] != null && puzzle[i][j-1] != -1 && g==GROUP[puzzle[i][j-1].charCodeAt(0)-65]) {
					// draw a horizontal line between similar color tiles
                    context.strokeRect(PUZZLE_LEFT+SIZE*i-.5,PUZZLE_TOP+SIZE*j,SIZE,0);
				}

				//	show the chosen alphabet in the puzzle
				//	if multiple words, just the last one, 				
				index1 = detectWord(i,j,-1);
				if (index1 == -1)
					continue;
				//	so there is a word
				index2 = detectWord(i,j,index1);
				//	is there another word
				
				guess1 = (guesses[index1] != undefined && guesses[index1].length > 0);
				guess2 = (guesses[index2] != undefined && guesses[index2].length > 0);
				//	to eliminate when there is no guesses
				if (!guess1 && !guess2) {
					//	has there been any guesses
					context.fillStyle = COLORS[0];
					context.font = 'bold 10px sans-serif';
            		context.fillText(puzzle[i][j], left + SIZE/4,top + SIZE/8);
					continue;
				}
				if (!guess1 && guess2) {
					index1 = index2;
					guess1 = guess2;
				} else if (!guess2 && guess1) {
					index2 = index1;
					guess2 = index1;
				}
				var ch1 = '';
				var ch2 = '';
				if (index1 != -1) {
					_word = wordList[index1];
					//	show the last guess
					l = guesses[index1].length-1;
					k = i + j - _word.startx - _word.starty;
					ch1 = guesses[index1][l][k];
				}
				if(index2 != index1) {
					_word = wordList[index2];
					//	show the last guess
					l = guesses[index2].length-1;
					k = i + j - _word.startx - _word.starty;
					ch2 = guesses[index2][l][k];
					if (ch1 == ch2) {
						index1 = index2;
						guess1 = guess2;
					}
				}
				if (index1 == index2) {
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
	            	context.fillText(ch1, left + SIZE/4,top + SIZE/8);
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
	            	context.fillText(ch1, left + SIZE/4 - SIZE/8,top + SIZE/8 - SIZE/8);

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
	            	context.fillText(ch2, left + SIZE/4 + SIZE/4,top + SIZE/8 + SIZE/4);
					//	two word intersection
				}
			}
		}
				function drawLetterOnBoard(index, i,j) {

				}

        if (word) {
        	//	draw line around the selected word to highlight
        	context.lineWidth = 3;
            context.strokeStyle = "#ffffff";
            context.strokeRect(PUZZLE_LEFT+word.startx*SIZE-1, PUZZLE_TOP+word.starty*SIZE-1, word.xp*word.length*SIZE+SIZE+2, word.yp*word.length*SIZE+SIZE+2);
            context.stroke();
            /* no need to clear anymore	
            context.fillStyle = "#BBBBBB";
            context.fillRect(PUZZLE_LEFT, PUZZLE_TOP+SIZE*(ROWS+1), SIZE*COLUMNS, SIZE*5);
            */
            offset = 0;
            while(offset <= word.length) {
                index = puzzle[word.startx + offset*word.xp][word.starty + offset*word.yp];
                if (index != null) {
					g = GROUP[index.charCodeAt(0)-65];
				} else {
					g = 0;
				}
                drawAlphaBar(g,offset++);
            }
			
			// draw the guesses with an X at the end so they can be deleted
			for (var i = 0; i < guesses[word.index].length; i++) {
				for (var k = 0; k <= word.length + 1; k++) {
		        	var left = PUZZLE_LEFT + SIZE + (SIZE+5)*(word.length + 1) + k * (SIZE-5);
		        	var top = PUZZLE_TOP+SIZE*(ROWS+1 + i);
					if ( guesses[word.index][i] != undefined && guesses[word.index][i][k] != undefined ) {
						context.font = 'bold 20px sans-serif';
						context.fillText(guesses[word.index][i][k], left + SIZE*3/8,top );
					} else {
						context.fillText('X', left + SIZE*3/8+1,top+2 );
						context.strokeRect(left+2 ,top+2 , SIZE-5-4, SIZE-5-4);
					}
            	};
        	};
        }
	}
	
    function drawAlphaBar(group, offset) {
        if (group<1 || group>5)
            return;
        var selected_data = ALPHA[group];
        for (var i=0; i<5; i++) {
        	//	drawing the decoders under the puzzle
        	var left = PUZZLE_LEFT + (SIZE+5)*offset;
        	var top = PUZZLE_TOP+SIZE*(i+ROWS+1);
            context.fillStyle = COLORS[group];
            context.fillRect(left, top, SIZE, SIZE);
            context.fillStyle = "#000000";
            context.textAlign = "center";
//            context.textBaseline = "top";
            if ( i == 4 && group == 5) {
                context.font = 'bold 15px sans-serif';
                context.fillText(selected_data[i], left + SIZE/4, top + SIZE/8);
                context.font = 'bold 15px sans-serif';
                context.fillText(selected_data[i+1], left + SIZE*3/4, top + SIZE*3/8);
            } else {
                context.font = 'bold 20px sans-serif';
                context.fillText(selected_data[i], left + SIZE/2,top + SIZE/8);
            }
        }
        for (var i=0; i<5; i++) {
        	//	drawing boxes to indicate the selected letter
        	var left = PUZZLE_LEFT + (SIZE+5)*offset;
        	var top = PUZZLE_TOP+SIZE*(i+ROWS+1);
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