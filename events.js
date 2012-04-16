	function mouseClick(e){
		var x = Math.floor((e.pageX-$("#canvas").offset().left -PUZZLE_LEFT) / SIZE);
		var y = Math.floor((e.pageY-$("#canvas").offset().top -PUZZLE_TOP) / SIZE);
		if (0<=x && x< COLUMNS && 0<=y && y< ROWS) {
            //  selecting a new word-code in the puzzle
            newid = detectWord(x,y);
            if (!word || newid != word.index) {
				word = wordList[newid];
				current_guess = new Array();
				if(guesses[newid] == undefined) {
					guesses[newid] = new Array();
				}
            }
        } else {
        	//	check if the bars are clicked
//        	...
        }

	    var x = Math.floor((e.pageX-$("#canvas").offset().left - PUZZLE_LEFT - SIZE)/(SIZE+5));
		var y = Math.floor((e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE) - (ROWS+1);
		var char = '';
		if (word) {
			if ( 0 <= x && x <= word.length) {
				if ( 0 <= y && y < 5 ) {
					if((word.data[x] == 5) && (y==4)) {
						// Q Z
					    var tx = (e.pageX-$("#canvas").offset().left - PUZZLE_LEFT - SIZE)/(SIZE+5) - Math.floor((e.pageX-$("#canvas").offset().left - PUZZLE_LEFT - SIZE)/(SIZE+5));
						var ty = (e.pageY-$("#canvas").offset().top - PUZZLE_TOP )/SIZE - Math.floor((e.pageY-$("#canvas").offset().top - PUZZLE_TOP)/SIZE);
						if((tx+ty)>1) {
							char = ALPHA[word.data[x]][y+1];
						} else {
							char = ALPHA[word.data[x]][y];
						}
					} else {
						char = ALPHA[word.data[x]][y];
					}
					//	toggle char on choices index x
					current_guess[x] = char;

					if(false) {
						charIndex = choices[word.startx + x*word.xp][word.starty + x*word.yp][word.xp].indexOf(char);
					
						if (charIndex==-1) {
							//	add to the list
							choices[word.startx + x*word.xp][word.starty + x*word.yp].push(char);
						} else {
							//	remove from the list
							choices[word.startx + x*word.xp][word.starty + x*word.yp].splice(charIndex,1);
						}
					}
				}
			}
			_word = '';
			console.log(current_guess);
			for (var i = 0; i < current_guess.length; i++) {
				 _word = _word + current_guess[i];
			};
			if(_word.length > word.length) {
				found = dictionary.lastIndexOf(_word.toUpperCase());
				if ( found >= 0) {
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
						console.log(_word);
					}
				}
			}
		}
		drawPuzzle();		
	};
    function detectWord(i,j) {
		if (puzzle[i][j]==0)
			//	not a word
			return -1;
		for (var k = 0; k < wordCount; k++) {
			tmp_word = wordList[k];
			if (word != tmp_word)
			if(tmp_word.startx <= i && i<= tmp_word.endx && tmp_word.starty <= j && j<= tmp_word.endy) { 
				return k;
			}
		};
		if(word) {
       		return word.index;
       	} else {
       		//	this should never happen;
       		return -1;
       	}
	};