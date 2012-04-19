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
    //	not needed actually
    //	use String.fromCharCode(65) instead

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
				puzzle[i][j] = null;
			}
		}

	    wordList = Array();	//	information about the words in the puzzle 
	    						//	{ startx:0, starty:0, xp:0, yp:0, endx:0, endy:0, length:0, data:Array(), choices:Array() };
	    wordCount = 0;		//	number of words
	    word = null;		//	selected word

		for(var i=0; i<COLUMNS; i+=2) {
			obj = { index:0, startx:0, starty:0, endx:0, xp:0, yp:0, endy:0, length:0, data:Array(), choices:Array() };
			//	choose a word
			_word = getRandomWord(ROWS-3);
			_word = _word.word;
			//	then put it in the row randomly
			j = Math.floor(Math.random()*(ROWS-_word.length));
			console.log(i,j,_word);
			obj.startx = i;
			obj.starty = j;
			obj.length = _word.length-1;
			obj.yp = 1;
			obj.endx = i;
			obj.endy = j + obj.length;
			obj.index = wordCount;
			wordList[wordCount++] = obj;
			if (j > 0) {
				puzzle[i][j-1] = -1;
			}
			if (j +obj.length +1 < ROWS) {
				puzzle[i][j+obj.length+1] = -1;
			};
			for (counter = 0; counter < _word.length; counter++) {
				puzzle[i][j+counter] = _word[counter];
				obj.data[counter] = _word[counter];
			}
		}
		var count = fillHorizontals();
		// look for single 
		for (var i = 0; i < wordCount; i++) {

			var single = true;
			var obj = wordList[i];
			if(obj.yp == 0)
				continue;
			for (var j = 0; j < obj.length+1; j++) {
				if(obj.startx>0 && puzzle[obj.startx-1][obj.starty+j] != null && puzzle[obj.startx-1][obj.starty + j] != -1) {
					single = false
					break
				}
				if(obj.startx<COLUMNS-1 && puzzle[obj.startx+1][obj.starty+j] != null && puzzle[obj.startx+1][obj.starty + j] != -1) {
					single = false
					break
				}

			};
			if(single) {
				//	remove word and try filling again
				wordCount--;
				wordList.splice(i,1);
				i--;
				if(obj.starty>0)
					puzzle[obj.startx][obj.starty-1] = null;
				if(obj.endy<ROWS-1)
					puzzle[obj.startx][obj.endy+1] = null;
				for (var j = 0; j <= obj.length; j++) {
					puzzle[obj.startx][obj.starty+j] = null;
				}
				
			}
		};
	};
	function fillHorizontals() {
		var count = 0;
		for(var j=0; j<ROWS; j++) {
			added = false;
			tube = new Array();
			last_start = 0;
			for(var i=0; i<COLUMNS; i++) {
				if ( puzzle[i][j] == -1 ) {
					if(processTube(last_start, j,tube)) {
						//	true means something was added
						count++;
						added = true;
					}
						
					//	empty tube, maybe we can fit in more
					tube = new Array();
					//	puzzle[i][j] = null;
					last_start = i+1;
				} else {
					tube.push(puzzle[i][j]);
					
				}
			}
			if(processTube(last_start, j,tube)) {
				//	true means something was added
				count++;
				added = true;
			};
			if (added) {
				j++;
			};
		}
		return count;
	}
	function processTube(i, j, tube) {
	//	tube must be connected, so check if it has value?
	output = new Array();
			
	while(tube != null && tube.length >= 3 && tube.some(function (x) { return (x != null) })) {

		//	process tube
		example = new Array(tree);
		lastCrossing = -1;
		for (var k = 0; k < tube.length; k++) {
			//console.log(example.length, ':', output.length);
			temp_example = new Array();
			for (var n = 0; n < example.length; n++) {
				next = example[n];
				//console.log(n,example.length);
				if (next.lastIndexOf('YES') != -1 && tube[k]==null) {
					if (lastCrossing != -1 ) {	//	and far enough
						output.push(i,next);
					}
					// but it can be part of longer word as well
				}
				if (tube[k] == null) {
					//if(k>0 && )
					for (var m = 3; m < next.length; m+=2) {
						temp_example.push(next[m]);
					}
				} else {
					lastCrossing = k;
					index = next.lastIndexOf(tube[k]);
					if (index != -1) {
						temp_example.push(next[index+1]);
					}
				}
				if(0)
				if(tube.length-k>3) {
					if(tube)
					temp_example.push(tree);
				}
			};
			example = temp_example;
		};
		for (var n = 0; n < example.length; n++) {
			if (example[n].lastIndexOf('YES') != -1) {
				if (lastCrossing != -1 ) {	//	and far enough
					output.push(i, example[n]);
				}
			}
		}
		
		//console.log('try', i, tube.slice(0), output.length);
		i++;
		while(tube.shift() != null)
			i++;
	}
	if(output.length>0) {
		max = '';
		maxi = -1;
		for (var k = 1; k < output.length; k+=2) {
			_word = getWord(output[k]);
			if(max.length<_word.length || (max.length==_word.length && Math.random()>0.5)) {
				maxi = output[k-1];
				max = _word;
			}
		};
		if (max.length>0) {
			//	create word for it
			obj = { index:0, startx:0, starty:0, endx:0, xp:0, yp:0, endy:0, length:0, data:Array(), choices:Array() };
			//	choose a word
			_word = max;
			//	then put it in the row randomly
			console.log(maxi,j,_word);
			obj.startx = maxi;
			obj.starty = j;
			obj.length = _word.length-1;
			obj.xp = 1;
			obj.endx = maxi + obj.length;
			obj.endy = j;
			obj.index = wordCount;
			wordList[wordCount++] = obj;
			if (maxi> 0) {
				puzzle[maxi-1][j] = -1;
			}
			if (maxi +obj.length +1 < COLUMNS) {
				puzzle[maxi+obj.length+1][j] = -1;
			};
			for (counter = 0; counter < _word.length; counter++) {
				puzzle[maxi+counter][j] = _word[counter];
				obj.data[counter] = _word[counter];
			}
			return true;
		}
		return false;
	}	//	if
}
