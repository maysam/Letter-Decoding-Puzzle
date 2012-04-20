	function mouseDoubleClick(e){
		console.log('double');
	}
	function mouseClick(e){
		var x = Math.floor((e.pageX-$("#canvas").offset().left -PUZZLE_LEFT) / SIZE);
		var y = Math.floor((e.pageY-$("#canvas").offset().top -PUZZLE_TOP) / SIZE);
		if (0<=x && x< COLUMNS && 0<=y && y< ROWS) {
            //  selecting a new word-code in the puzzle
            oldid = -1;
            if (word) {
            	oldid = word.index;
            }
            newid = detectWord(x, y, oldid);
            if (newid != -1) {	//	there is something selected
                if (!word || newid != word.index) {	//	something new
					word = wordList[newid];
					word.index = newid;	//	fix for removing single words
	        		current_guess = new Array();
					if(guesses[newid] == undefined) {
						guesses[newid] = new Array();
					}
	            }
        	}
        } else {
        	//	check if the bars are clicked
//        	...
        }

		if (word) {
		    var x = Math.floor((e.pageX-$("#canvas").offset().left - PUZZLE_LEFT )/(SIZE+5));
			var y = Math.floor((e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE) - (ROWS+1);
			var char = '';
			if ( 0 <= x && x <= word.length) {
				if ( 0 <= y && y < 5 ) {
					g = GROUP[word.data[x].charCodeAt(0)-65];
					if((g == 5) && (y==4)) {
						// Q Z
					    var tx = (e.pageX-$("#canvas").offset().left - PUZZLE_LEFT )/(SIZE+5) - x;
						var ty = (e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE - y - (ROWS+1);
						if((tx+ty)>1) {
							char = ALPHA[g][y+1];
						} else {
							char = ALPHA[g][y];
						}
					} else {
						char = ALPHA[g][y];
					}
				}
			}
			if (char != '') {
				//	toggle char on choices index x
				current_guess[x] = char;
				_word = '';
				for (var i = 0; i < current_guess.length; i++) {
					 _word = _word + current_guess[i];
				};
				if(_word.length > word.length) {
					found = dictionary.lastIndexOf(_word.toUpperCase());
					if ( found != -1) {
						//	is it a new guess?
						repeated = false;
						for (var i = 0; i < guesses[word.index].length; i++) {
							if(guesses[word.index][i].join() == current_guess.join()) {
								console.log('repeated');
								repeated = true;
							}
						};
						if(!repeated) {
							//	add to the list
							guesses[word.index].push(current_guess);
							current_guess = new Array();
						}
					}
				}
			}
			//	else check if the cross next to the guesses has been clicked
			for (var i = 0; i < guesses[word.index].length; i++) {
				k = word.length + 1;
				{
		        	var left = PUZZLE_LEFT + SIZE + (2*SIZE)*(word.length + 1);
		        	var top = PUZZLE_TOP+SIZE*(ROWS+1 + i);
					var x = e.pageX-$("#canvas").offset().left - left;
					var y = e.pageY-$("#canvas").offset().top - top;
					if( 0 <= x && x <= SIZE && 0 <= y && y <= SIZE) {
						guesses[word.index].splice(i,1);
						console.log('x clicked');
					}
            	};
        	};
		}
		drawPuzzle();		
	};
    function detectWord(i, j, current_choice) {
		if (puzzle[i][j]==0)
			//	not a word
			return -1;
		for (var k = 0; k < wordCount; k++) {
			if (k != current_choice) {
				tmp_word = wordList[k];
				if(tmp_word.startx <= i && i<= tmp_word.endx && tmp_word.starty <= j && j<= tmp_word.endy) { 
					return k;
				}
			}
		};
   		return current_choice;
	};