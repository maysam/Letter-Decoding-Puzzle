	var HORIZONTAL = 1;
	var VERTICAL = 2;
	var MIN_LENGTH = 3;
	var MAX_LENGTH = 6;
	var SIZE = 30;
	var COLUMNS = 11;
	var ROWS = 9;
	
	var PUZZLE_LEFT = 50;
	var PUZZLE_TOP = 70;
	
	var COLORS = Array( '#000000', '#ef3e44', '#fe8700', '#fdff00', '#26e122', '#585aed' );
    var ALPHA = Array(
                    Array(),
                    Array('A', 'D', 'N', 'F', 'W'),
                    Array('E', 'C', 'P', 'K', 'J'),
                    Array('I', 'S', 'B', 'Y', 'X'),
                    Array('O', 'M', 'R', 'H', 'V'),
                    Array('U', 'T', 'L', 'G', 'Q', 'Z')
                );
    var GROUP = Array(1,3,2,1,2,1,5,4,3,2,2,5,4,1,4,2,5,4,3,5,5,4,1,3,3,5);
    var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //	ALPHA[GROUP['B'.charCodeAt(0)-65]]

    var puzzle, wordCount, wordList, word;	//	word is the selected code
	var current_guess;
	var guesses = new Array();

    function init() {
		//	create puzzle
			puzzle = new Array();

		for(var i=0; i<COLUMNS; i++) {
			puzzle[i] = new Array();
		}
		//	initialize puzzle
		for(var i=0; i<COLUMNS; i++) {
			for(var j=0; j<ROWS; j++) {
				puzzle[i][j] = 0;
			}
		}

	    wordList = Array();	//	information about the words in the puzzle 
	    						//	{ startx:0, starty:0, xp:0, yp:0, endx:0, endy:0, length:0, data:Array(), choices:Array() };
	    wordCount = 0;		//	number of words
	    word = null;		//	selected word

		for(var i=0; i<COLUMNS; i+=2) {
			started = false;
			length = MIN_LENGTH;
			done = false;
			obj = { index:0, startx:0, starty:0, endx:0, xp:0, yp:0, endy:0, length:0, data:Array(), choices:Array() };
			//	choose a word
			_word = getRandomWord()

			//	then put it in the row randomly
			for(var j=0; j<ROWS && !done; j++) {
				if (Math.random()>0.5  || (length>0 && started) || (!started && j+length==ROWS)) {
					puzzle[i][j] = Math.ceil(Math.random()*5);
					obj.data[MIN_LENGTH-length] = puzzle[i][j];
					if (!started) {
						obj.startx = i;
						obj.starty = j;
						started = true;					
					}
					obj.endx = i;
					obj.endy = j;
					length--;
					if (MIN_LENGTH-length==MAX_LENGTH || j+1 == ROWS) {
						done = true;
					}
				} else if (started) {
					done = true;
				}
				if (done) {				obj.length = obj.endx + obj.endy - obj.startx - obj.starty;
					obj.yp = 1;
					if ( obj.length > 0 ) {
						obj.index = wordCount;
						wordList[wordCount++] = obj;
					}
				}
			}
		}

		for(var j=0; j<ROWS; j+=2) {
			started = false;
			length = MIN_LENGTH;
			done = false;
			obj = { index:0, startx:0, starty:0, xp:0, yp:0, endx:0, endy:0, length:0, data:Array(), choices:Array() };
			for(var i=0; i<COLUMNS && !done; i++) {
				if (Math.random()>0.5/(i+1) || (length>0 && started) || (!started && j+length==ROWS)) {

					puzzle[i][j] = puzzle[i][j] || Math.ceil(Math.random()*5);
					obj.data[MIN_LENGTH-length] = puzzle[i][j];
					if (!started) {
						obj.startx = i;
						obj.starty = j;
						started = true;					
					}
					obj.endx = i;
					obj.endy = j;
					length--;
					if (MIN_LENGTH-length==MAX_LENGTH || i+1 == COLUMNS) {
						done = true;
					}
				} else if (started) {
					done = true;
				}
				if (done) {
					obj.xp = 1;
					obj.length = obj.endx + obj.endy - obj.startx - obj.starty;
					if ( obj.length > 0 ) {
						obj.index = wordCount;
						wordList[wordCount++] = obj;
					}
				}
			}
		}

		//	encompass adjacent tiles in the words

		for (var i = 0; i < wordCount; i++) {
			obj = wordList[i];
			//	first going backwards
			while (	obj.startx - obj.xp >= 0 && 
					obj.starty - obj.yp >= 0 &&
					puzzle[obj.startx - obj.xp][obj.starty - obj.yp] > 0
					) {
				obj.startx -= obj.xp;
				obj.starty -= obj.yp;
				obj.length ++;
				obj.data.unshift(puzzle[obj.startx][obj.starty]);
				//	append to begin of data
			};
			//	then moving forwards
			while (	obj.endx + obj.xp < COLUMNS && 
					obj.endy + obj.yp < ROWS &&
					puzzle[obj.endx + obj.xp][obj.endy + obj.yp] > 0
					) {
				obj.endx += obj.xp;
				obj.endy += obj.yp;
				obj.length ++;
				obj.data.push(puzzle[obj.endx][obj.endy]);
				//	append to begin of data
			};
		};
	};