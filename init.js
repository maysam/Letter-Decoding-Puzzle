"use strict";

var HORIZONTAL = 1;
var VERTICAL = 2;
var MIN_LENGTH = 3;
var MAX_LENGTH = 5;

function getWord(node) {
	//	converts tree node to word
	var parent = node[1];
	if (parent == null)
		return '';
	var last = _.indexOf(parent, node);
	var letter = parent[last-1];
	return getWord(parent) + letter;
}

function isEmpty(arr) {
	if ( !arr || arr.length==0 ) {
		return true
	}
	for (var i = 0; i < arr.length; i++) {
		if(arr[i])
			return false;
	};
	return true;
}
function isFull(arr) {
	if ( !arr || arr.length==0 ) {
		return false
	}
	for (var i = 0; i < arr.length; i++) {
		if(!arr[i])
			return false
	}
	return true;
}

function getRandomWord() {
	//	gets random word directly from the dictionary
	return dictionary[_.random(dictionary.length-1)]
}

var COLORS = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'white'];

var ALPHA = new Array(
    new Array(),
    new Array('A', 'D', 'N', 'F', 'W'),
    new Array('E', 'C', 'P', 'K', 'J'),
    new Array('I', 'S', 'B', 'Y', 'X'),
    new Array('O', 'M', 'R', 'H', 'V'),
    new Array('U', 'T', 'L', 'G', 'Q', 'Z')
);
var GROUP = new Array(1,3,2,1,2,1,5,4,3,2,2,5,4,1,4,2,5,4,3,5,5,4,1,3,3,5);
function group(char) {
	return GROUP[char.charCodeAt(0)-65]
}

var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //	ALPHA[GROUP['B'.charCodeAt(0)-65]]
    //	not needed actually
    //	use String.fromCharCode(65) instead

var puzzle, wordCount, wordList, word;	//	word is the selected code
var redWords;	//	list of indices of words which need fix
    //	list of words in red box

//	is the last guess repeated word
var repeatFlag

var current_guess
var guesses, hints

var scroll_index

var guessList = []
function resetGuessList() {
	guessList = []
}
function addGuess(word_index) {
	var guess = _.last(guesses[word_index]).join('')
	var key = word_index+' '+guess
	guessList.push(key)
}
function getGuessIndex(word_index, guess_index) {
	var guess = guesses[word_index][guess_index].join('')
	var key = word_index+' '+guess
	return _.indexOf(guessList, key)
}
function removeGuess(word_index, guess_index) {
	var index = getGuessIndex(word_index, guess_index)
	if (index >= 0) {
		guessList.splice(index, 1)
	}
  guesses[word_index].splice(guess_index, 1)
}

var time = 0, timing = false

var clockHandle = setInterval(function clock() {
	if (timing) {
		time ++
		drawPuzzle()
	}
}, 1000)



function Word() {
	this.index = 0;
	//	start point
	this.startx = 0;
	this.starty = 0;
	//	end point
	this.endx = 0;
	this.endy = 0;
	//	direction xp=1 is horizontal yp=1 is vertical , logically of course
	this.xp = 0;
	this.yp = 0;
	this.length = 0;
	this.data = [];
	this.hint = [];
}

function init() {
	//	create puzzle
	puzzle = [];
	guesses = [];
	hints = [];
	for (var i=0; i<COLUMNS; i++) {
		puzzle[i] = [];
		hints[i] = [];
	}
	//	initialize puzzle
	for (var i=0; i<COLUMNS; i++) {
		for(var j=0; j<ROWS; j++) {
			puzzle[i][j] = null;
			hints[i][j] = null;
		}
	}

  wordList = [];	//	information about the words in the puzzle
  						//	{ startx:0, starty:0, xp:0, yp:0, endx:0, endy:0, length:0, data:Array(), choices:Array() };
  wordCount = 0;		//	number of words
  word = null;		//	selected word

	for(var i=0; i<COLUMNS && wordCount*2+2 <= $("#number_of_words:checked").val(); i+=2+Math.floor(Math.random()*1.1)) {
		obj = new Word();
		//	choose a word
		var _word = getRandomWord();

		//	then put it in the row randomly
		j = Math.floor(Math.random()*(ROWS-_word.length+1));
		obj.startx = i;
		obj.starty = j;
		obj.length = _word.length-1;
		obj.yp = 1;
		obj.endx = i;
		obj.endy = j + obj.length;
		obj.index = wordCount;
		guesses[wordCount] = [[]];
		wordList[wordCount++] = obj;

		if (j > 0) {
			puzzle[i][j-1] = -1;
		}
		if (j +obj.length +1 < ROWS) {
			puzzle[i][j+obj.length+1] = -1;
		};
		for (var counter = 0; counter < _word.length; counter++) {
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
	return wordCount
}
function fillHorizontals() {
	var count = 0;
	for(var j=0; j<ROWS; j++) {
		var tube = [];
		var last_start = 0;
		for(var i=0; i<COLUMNS; i++) {
			if ( puzzle[i][j] != -1 ) {
				tube.push(puzzle[i][j])
			} else {
				count += processTube(last_start, j,tube)
				tube = []	//	empty tube, maybe we can fit in more
				last_start = i+1
			}
		}
		count += processTube(last_start, j,tube)
	}
	return count;
}
function processTube(i, j, tube) {
	if(tube.length < MIN_LENGTH || wordCount == $("#number_of_words:checked").val()) {
		return 0;
	}
	var original_length = tube.length	//	copy tube array into variable called original
	var originali = i
	//	tube must be connected, so check if it has value?
	var output = [];
	var choices = [];

	while(tube != null && tube.length >= 3 && _.some(tube)) {
		//	process tube
		var example = [tree];
		var lastCrossing = -1;
		for (var k = 0; k < tube.length; k++) {
			//	no word longer than MAX_LENGTH
			var temp_example = [];
			for (var n = 0; n < example.length; n++) {
				var next = example[n];
				if(!next) continue;
				if (_.contains(next, 'YES') && tube[k]==null) {
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
					var index = _.indexOf(next, tube[k]);
					if (index != -1) {
						temp_example.push(next[index+1]);
					}
				}
			};
			example = temp_example;
		};
		for (var n = 0; n < example.length; n++) {
			if(!example[n]) continue;
			if (_.contains(example[n], 'YES')) {
				if (lastCrossing != -1 && tube.length==example[n][0]) {	//	and far enough
					output.push(i, example[n]);
				}
			}
		}
		i++;
		while(tube.shift() != null)
			i++;
	}
	if (output.length == 0)
		return 0
	var c = 0
	var max = '';
	var maxi = -1;
	for (var k = 1; k < output.length; k+=2) {
		var _word = getWord(output[k]);
		if(max.length<_word.length || (max.length==_word.length && Math.random()>0.5)) {
			//	find the biggest possible word
			maxi = output[k-1];
			max = _word;
		}
	}
	if (maxi != -1) {
		//	check to see if we have more than 3 sq on either side to work on
		choices.push(maxi, max)
		if(maxi-originali>3) {
			//	fit one before
			max = ''
			maxi = -1
			for (var k = 1; k < output.length; k+=2) {
				var _word = getWord(output[k])
				if (_.contains(wordList, _word)  || _.contains(choices, _word) ) {
					//	try another word
					continue;
				};
				var _wordi = output[k-1];
				if(_wordi+_word.length< choices[0])
				if(max.length<_word.length || (max.length==_word.length && Math.random()>0.5)) {
					maxi = output[k-1]
					max = _word
				}
			};
			if(maxi != -1) {
				choices.push(maxi, max)
			}
		}
		if(original_length-max.length-choices[0]>3) {
			//	fit one after
			max = ''
			maxi = -1
			for (var k = 1; k < output.length; k+=2) {
				var _word = getWord(output[k])
				if (_.contains(wordList, _word) || _.contains(choices, _word)) {
					//	try another word
					continue
				}
				var _wordi = output[k-1]
				if(choices[0]+choices[1].length<_wordi)
				if(max.length<_word.length || (max.length==_word.length && Math.random()>0.5)) {
					maxi = _wordi
					max = _word
				}
			}
			if(maxi != -1) {
				choices.push(maxi, max)
			}
		}
		for (; c < choices.length; c+=2) {
			if (wordCount < $("#number_of_words:checked").val()) {
				maxi = choices[c]
				max = choices[c+1]
				//	create word for it
				var obj = new Word()
				//	choose a word
				_word = max
				//	then put it in the row randomly
				obj.startx = maxi
				obj.starty = j
				obj.length = _word.length-1
				obj.xp = 1
				obj.endx = maxi + obj.length
				obj.endy = j
				obj.index = wordCount
				guesses[wordCount] = [[]]
				wordList[wordCount++] = obj
				if (maxi> 0) {
					puzzle[maxi-1][j] = -1
				}
				if (maxi +obj.length +1 < COLUMNS) {
					puzzle[maxi+obj.length+1][j] = -1
				}
				for (var counter = 0; counter < _word.length; counter++) {
					puzzle[maxi+counter][j] = _word[counter]
					obj.data[counter] = _word[counter]
					if(j>0)
						if(puzzle[maxi+counter][j-1] == null)
							puzzle[maxi+counter][j-1] = -1
					if(j<ROWS-1)
						if(puzzle[maxi+counter][j+1] == null)
							puzzle[maxi+counter][j+1] = -1
				}
			} else {
				c = choices.length
			}
		}
	}
	return c/2
}


