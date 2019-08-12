function calculateScore() {
	var points = 0
	if (!wordList) return 0
	for (var i = 0; i < wordList.length; i++) {
		points +=
			(guesses[i][0].length - wordList[i].hint.join('').length) *
			(guesses[i].length - 1)
	}
	return points
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
	var letters = 0
	for (var i = 0; i < COLUMNS; i++) {
		for (var j = 0; j < ROWS; j++) {
			if (puzzle[i][j] != null && puzzle[i][j] != -1) {
				letters++
			}
		}
	}
	return letters
}

var events = []

function drawMenu() {
	var left_offset = 0
	if (isiOS) {
		var left = PUZZLE_LEFT - 0.33 * SIZE
		var top = PUZZLE_TOP + SIZE * (ROWS + 6)
		context.drawImage($('#backButton')[0], left, top, SIZE * 0.9, SIZE * 0.9)
		events.push([
			left,
			top,
			SIZE * 0.9,
			SIZE * 0.9,
			function() {
				history.go(-1)
			}
		])
		left_offset = SIZE
	}

	var left = PUZZLE_LEFT - 0.33 * SIZE + left_offset
	var top = PUZZLE_TOP + SIZE * (ROWS + 6)
	context.drawImage($('#settings-button')[0], left, top, SIZE * 0.9, SIZE * 0.9)
	events.push([
		left,
		top,
		SIZE * 0.9,
		SIZE * 0.9,
		function() {
			$('#setting_panel').show()
		}
	])

	var left = PUZZLE_LEFT + SIZE * 0.75 + left_offset
	var top = PUZZLE_TOP + SIZE * (ROWS + 6)
	var score = calculateScore()
	var guess_count = calculateGuesses()

	if (repeatFlag) {
		context.font = 'bold 14px sans-serif'
		context.fillStyle = '#ff0000'
		context.fillText('REPEATED!', left + SIZE * 3.2, top + SIZE / 2.5)
		repeatFlag = false
	}

	if (timing && redWords && redWords.length == 0 && guess_count > 0) {
		context.drawImage($('#stop-button')[0], left, top, SIZE * 1.6, SIZE * 0.8)
		events.push([
			left,
			top,
			SIZE * 1.6,
			SIZE * 0.8,
			function() {
				stopGame()
			}
		])
	} else {
		//	can new
		context.drawImage($('#new-button')[0], left, top, SIZE * 1.6, SIZE * 0.8)
		events.push([
			left,
			top,
			SIZE * 1.6,
			SIZE * 0.8,
			function() {
				if (!$('#loading_panel').is(':visible')) {
					$('#loading_panel').show()
					setTimeout(function() {
						newGame()
					}, 1)
				}
			}
		])
	}

	left = width - SIZE * 5
	context.fillStyle = COLORS[0]
	context.strokeStyle = '#666666'
	context.font = 'bold 16px sans-serif'
	text = ''
	if (high_score != '') text += 'HS:' + high_score + ' '
	if (top_score != '') text += 'TS:' + top_score
	context.fillText(text, left + SIZE * 0.5, top + SIZE * 0.4)
	left = width - SIZE * 2.6
	context.fillStyle = '#cccccc'
	context.fillRect(left, top, SIZE * 2.4, SIZE * 0.8)
	context.strokeStyle = '#666666'
	context.strokeRect(left, top, SIZE * 2.4, SIZE * 0.8)
	context.fillStyle = COLORS[0]
	context.font = 'bold 16px sans-serif'
	context.fillText(
		(time % 1000) + ' / ' + score,
		left + SIZE * 1.1,
		top + SIZE * 0.4
	)
}

function drawPuzzle() {
	events = []
	context.canvas.width = context.canvas.width
	context.textBaseline = 'middle'
	context.textAlign = 'center'
	context.lineWidth = 1

	context.fillStyle = COLORS[0]
	context.fillRect(
		PUZZLE_LEFT - SIZE / 4,
		PUZZLE_TOP - SIZE / 4,
		SIZE * COLUMNS + SIZE / 2,
		SIZE * ROWS + SIZE / 2
	)
	context.strokeStyle = '#ffCCff'
	context.lineWidth = 5
	context.strokeRect(
		PUZZLE_LEFT - SIZE / 8,
		PUZZLE_TOP - SIZE / 8,
		SIZE * COLUMNS + SIZE / 4,
		SIZE * ROWS + SIZE / 4
	)
	context.stroke()
	context.strokeStyle = COLORS[0]

	redWords = []
	redLetters = []
	function Point(i, j) {
		this.x = i
		this.y = j
	}
	possible_empty_spots = []
	for (var j = 0; j < ROWS; j++) {
		var is_empty = 0
		for (var i = 0; i < COLUMNS; i++) {
			var left = PUZZLE_LEFT + SIZE * i
			var top = PUZZLE_TOP + SIZE * j
			var textLeft = left + SIZE / 2
			var textTop = top + SIZE / 2
			//	show the chosen alphabet in the puzzle
			//	if multiple words, just the last one,
			word1 = detectWord(i, j, null)
			if (word1 == null) {
				//	empty spot
				is_empty++
				if (is_empty >= 2) {
					possible_empty_spots.push(new Point(left - SIZE, top))
				}
				continue
			}
			is_empty = 0
			//	so there is a word
			//	is there another word
			word2 = detectWord(i, j, word1)
			//	there are guesses for word 1
			has_guess_1 =
				word1 &&
				guesses[word1.index] != undefined &&
				guesses[word1.index].length > 1
			//	there are guesses for word 2
			has_guess_2 =
				word2 &&
				guesses[word2.index] != undefined &&
				guesses[word2.index].length > 1
			index1 = index2 = -1
			index1 = word1 && word1.index
			index2 = word2 && word2.index
			if (hints[i][j] != null) {
				g = 6
				//	also red word if the hint is not in the guesses
				if (word1) {
					list1 = []
					var k1 = i + j - word1.startx - word1.starty
					if (has_guess_1) {
						for (var m = 0; m < guesses[index1].length - 1; m++) {
							list1.push(guesses[index1][m][k1])
						}
					}
					if (
						_.indexOf(list1, hints[i][j]) == -1 &&
						word1.data.join() != word1.hint.join()
					) {
						redWords[index1] = index1
					}
					if (index2 != index1) {
						list2 = []
						word2 = wordList[index2]
						var k2 = i + j - word2.startx - word2.starty
						if (has_guess_2) {
							for (var m = 0; m < guesses[index2].length - 1; m++) {
								list2.push(guesses[index2][m][k2])
							}
						}
						if (
							_.indexOf(list2, hints[i][j]) == -1 &&
							word2.data.join() != word2.hint.join()
						) {
							redWords[index2] = index2
						}
					}
				}
			} else if (puzzle[i][j] != null && puzzle[i][j] != -1) {
				g = GROUP[puzzle[i][j].charCodeAt(0) - 65]
				target_word = word1
				// TODO: add target word to the event
				if (target_word == word && word2) target_word = word2
			} else {
				g = 0
				continue
			}
			if (g != 0) {
				events.push([
					left,
					top,
					SIZE,
					SIZE,
					(function(i, j) {
						return function() {
							var newWord = detectWord(i, j, word)
							if (newWord && newWord != word) {
								//  something new
								word = newWord
								word.index = current_index = current_index = _.indexOf(
									wordList,
									word
								) //  fix for removing single words
								if (!guesses[current_index]) {
									guesses[current_index] = [newGuess(current_index)]
								}
								current_guess = _.last(guesses[current_index])
								scroll_index = 0
							}
						}
					})(i, j)
				])
			}
			context.drawImage($('#' + COLORS[g] + '-tile')[0], left, top, SIZE, SIZE)

			if (g == 6) {
				context.fillStyle = COLORS[0]
				context.font = 'bold 20px sans-serif'
				context.fillText(hints[i][j], textLeft, textTop)
			}

			if (index1 != index2) {
				//	determine if red box is needed around the words
				list1 = []
				word1 = wordList[index1]
				var k1 = i + j - word1.startx - word1.starty
				if (has_guess_1) {
					for (var m = 0; m < guesses[index1].length - 1; m++) {
						list1.push(guesses[index1][m][k1])
					}
				}
				list2 = []
				word2 = wordList[index2]
				var k2 = i + j - word2.startx - word2.starty
				if (has_guess_2) {
					for (var m = 0; m < guesses[index2].length - 1; m++) {
						list2.push(guesses[index2][m][k2])
					}
				}
				for (var m = 0; m < list1.length; m++) {
					if (_.indexOf(list2, list1[m]) == -1) {
						redWords[index2] = index2
					}
				}
				//	also red word if the hint is not in the guesses
				if (hints[i][j] != null && _.indexOf(list2, hints[i][j]) == -1) {
					redWords[index2] = index2
				}

				if (redLetters[index2] == undefined) {
					redLetters[index2] = []
				}
				redLetters[index2][k2] = list1

				for (var m = 0; m < list2.length; m++) {
					if (_.indexOf(list1, list2[m]) == -1) {
						redWords[index1] = index1
					}
				}
				//	also red word if the hint is not in the guesses
				if (hints[i][j] != null && _.indexOf(list1, hints[i][j]) == -1) {
					redWords[index1] = index1
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
				continue
			}
			if (!has_guess_1 && has_guess_2) {
				index1 = index2
				has_guess_1 = has_guess_2
			} else if (!has_guess_2 && has_guess_1) {
				index2 = index1
				has_guess_2 = index1
			}
			var ch1 = ''
			var ch2 = ''

			if (index1 != -1) {
				_word = wordList[index1]
				//	show the last guess
				l = guesses[index1].length - 1
				if (l > 0) {
					l--
				}
				k = i + j - _word.startx - _word.starty
				ch1 = guesses[index1][l][k]
				if (ch1 == undefined) ch1 = null
			}
			if (index2 != index1) {
				_word = wordList[index2]
				//	show the last guess
				l = guesses[index2].length - 1
				if (l > 0) {
					l--
				}
				k = i + j - _word.startx - _word.starty
				ch2 = guesses[index2][l][k]

				if (ch1 == ch2 || ch2 == undefined) {
					index1 = index2
					has_guess_1 = has_guess_2
				}
				if (ch1 == null) {
					ch1 = ch2
					index1 = index2
					has_guess_1 = has_guess_2
				}
			}
			if (ch1 != null) {
				if (index1 != index2) {
					//	only show last guess
					//	-2 since last guess is not final yet
					gi1 = getGuessIndex(index1, guesses[index1].length - 2)
					gi2 = getGuessIndex(index2, guesses[index2].length - 2)
					if (gi2 > gi1) {
						index1 = index2
						ch1 = ch2
					}
				}
				context.fillStyle = COLORS[0]
				context.font = 'bold 20px sans-serif'
				context.fillText(ch1, textLeft, textTop)
			}
		}
	}

	for (var j = 0; j < ROWS; j++) {
		for (var i = 0; i < COLUMNS; i++) {
			var left = PUZZLE_LEFT + SIZE * i
			var top = PUZZLE_TOP + SIZE * j
			if (puzzle && puzzle[i][j] != null && puzzle[i][j] != -1) {
				continue
			}
			context.drawImage($('#black-tile')[0], left, top, SIZE, SIZE)
		}
	}
	// draw site name on empty place

	empty_spot = possible_empty_spots[Math.floor(possible_empty_spots.length / 2)]
	context.fillStyle = COLORS[6]
	context.font = 'bold 12px sans-serif'

	context.drawImage(
		$('#black-tile-logo')[0],
		empty_spot.x,
		empty_spot.y,
		2 * SIZE,
		SIZE
	)

	//	draw red rectangle around words needing attention

	for (var i = 0; i < redWords.length; i++) {
		if (redWords[i] == i) {
			_word = wordList[redWords[i]]
			context.lineWidth = 3
			context.strokeStyle = '#ff2233'
			context.strokeRect(
				PUZZLE_LEFT + _word.startx * SIZE + 1,
				PUZZLE_TOP + _word.starty * SIZE + 1,
				_word.xp * _word.length * SIZE + SIZE,
				_word.yp * _word.length * SIZE + SIZE
			)
			context.stroke()
		}
	}

	x_top = null
	x_left = null

	if (word) {
		//	draw line around the selected word to highlight

		context.lineWidth = 3
		context.strokeStyle = '#ffffff'
		context.strokeRect(
			PUZZLE_LEFT + word.startx * SIZE + 1,
			PUZZLE_TOP + word.starty * SIZE + 1,
			word.xp * word.length * SIZE + SIZE,
			word.yp * word.length * SIZE + SIZE
		)
		context.stroke()

		offset = 0
		while (offset <= word.length) {
			index =
				puzzle[word.startx + offset * word.xp][word.starty + offset * word.yp]
			if (index != null && index != -1) {
				g = GROUP[index.charCodeAt(0) - 65]
			} else {
				g = 0
			}
			drawAlphaBar(g, offset++)
		}

		max = guesses[current_index].length
		while (scroll_index > max - 5 && scroll_index > 0) {
			scroll_index--
		}
		// draw the guesses with an X at the end so they can be deleted
		_scroll_index = Math.floor(scroll_index)
		for (
			var old_i = _scroll_index;
			old_i < 5 + _scroll_index && old_i < guesses[current_index].length;
			old_i++
		) {
			var i = guesses[current_index].length - old_i - 1
			// if last word is repeated is hint is full, not show it
			var j = old_i - _scroll_index
			if ((_guess = _.last(guesses[current_index]))) {
				if (
					word.hint.join() == word.data.join() &&
					_.some(guesses[current_index], function(x) {
						return _.isEqual(x, _guess) && x !== _guess
					})
				)
					continue
			}
			for (var k = 0; k <= word.length + 1; k++) {
				var left =
					PUZZLE_LEFT +
					(SIZE + 4) * (word.length + 0.7) +
					k * (SIZE - 5) +
					(4 - word.length) * 0.75 * SIZE +
					5
				var top = PUZZLE_TOP + SIZE * (ROWS + 0.5 + j)
				if (k == word.length + 1) {
					//	TODO: refactor
					if (!x_left) {
						x_left = left + 2
						x_top = top + 2
					}
				}
				if (i < guesses[current_index].length - 1 && k == word.length + 1) {
					if (word.hint.join() != word.data.join()) {
						//	can remove only if all are not hinted
						context.lineWidth = 2
						context.beginPath()
						context.moveTo(left + 5, top + 5) // give the (x,y) coordinates
						context.lineTo(left + SIZE - 11, top + SIZE - 11)
						context.moveTo(left + 5, top + SIZE - 11) // give the (x,y) coordinates
						context.lineTo(left + SIZE - 11, top + 5)
						context.closePath()
						context.stroke()
						context.strokeRect(left + 2, top + 2, SIZE - 10, SIZE - 10)
						events.push([
							left + 2,
							top + 2,
							SIZE - 10,
							SIZE - 10,
							(function(current_index, actual_i) {
								return function() {
									removeGuess(current_index, actual_i)
								}
							})(current_index, guesses[current_index].length - old_i - 1)
						])
					}
				} else {
					if (guesses[current_index][i][k] != undefined) {
						//	draw guessed character
						context.font = 'bold 20px sans-serif'
						context.fillText(
							guesses[current_index][i][k],
							left + SIZE / 2 - 2,
							top + SIZE / 2 - 2
						)
					} else if (k <= word.length) {
						//	draw placeholder box
						context.lineWidth = 1
						context.strokeRect(left + 2, top + 2, SIZE - 10, SIZE - 10)
					} //if k
				} // else if hint != data
			} //	if i
		} // k
		// old_i
		if (max > 5) {
			//	when there are more than 4 words in guess list +1 current guess, scrollbar is needed
			bar_length = (SIZE * 5 - 6) * (5 / max)
			bar_offset = (scroll_index * (SIZE * 5 - 6 - bar_length)) / (max - 5)
			context.strokeRect(x_left + SIZE, x_top, 10, SIZE * 5)
			context.fillRect(x_left + SIZE + 3, x_top + 3 + bar_offset, 4, bar_length)
			events.push(
				[
					x_left + SIZE - 10,
					x_top,
					SIZE,
					SIZE * 5,
					(function(x_top, max_scroll) {
						return function(x, y) {
							scroll_index = ((y - x_top) / (SIZE * 5 - 6)) * (max - 4)
							if (scroll_index > max_scroll) scroll_index = max_scroll
						}
					})(x_top, max - 5)
				],
				'scroll_event'
			)
		}
	}
	context.lineWidth = 1
	drawMenu()
}
var animatingOffset = -1
var animatingChar = undefined
function Animate(offset, new_choice) {
	animatingOffset = offset
	animatingChar = new_choice
}
function charOffset(current_index, offset) {
	ch = current_guess[offset]
	if (ch == undefined) return 0
	// current_guess = _.last(guesses[current_index])
	var i = _.indexOf(ALPHA[group(ch)], ch)
	if (i == 5) i = 4
	return i - 2
}
function drawAlphaBar(group, offset) {
	var underliners = []
	if (
		redLetters[current_index] != undefined &&
		redLetters[current_index][offset] != undefined
	)
		underliners = redLetters[current_index][offset]
	var selected_data = ALPHA[group]
	var left =
		PUZZLE_LEFT +
		(SIZE + 4.5) * (offset - 0.25) +
		(4 - word.length) * 0.5 * SIZE +
		1
	var _top = PUZZLE_TOP + SIZE * (ROWS + 0.5)

	var color = COLORS[group]
	if (word.hint[offset]) {
		color = COLORS[6]
	}

	context.drawImage($('#' + color + '-decoder')[0], left, _top, SIZE, SIZE * 5)

	for (var i_counter = 0; i_counter < 5; i_counter++) {
		i = (5 + i_counter + charOffset(current_index, offset)) % 5
		//	drawing the decoders under the puzzle
		var top = PUZZLE_TOP + SIZE * (i_counter + ROWS + 0.5)
		context.fillStyle = '#000000'
		if (i == 4 && group == 5) {
			context.font = 'bold 15px sans-serif'
			context.fillText(selected_data[i], left + SIZE / 4, top + SIZE * 0.35)
			context.font = 'bold 15px sans-serif'
			context.fillText(
				selected_data[i + 1],
				left + (SIZE * 3) / 4,
				top + SIZE * 0.65
			)

			context.beginPath()
			context.strokeStyle = '#000000'
			context.lineWidth = 2
			if (_.contains(underliners, selected_data[i])) {
				context.moveTo(left + SIZE * 0.1, top + SIZE * 0.65)
				context.lineTo(left + SIZE * 0.45, top + SIZE * 0.65)
			}

			if (_.contains(underliners, selected_data[i + 1])) {
				context.moveTo(left + SIZE * 0.6, top + SIZE * 0.9)
				context.lineTo(left + SIZE * 0.9, top + SIZE * 0.95)
			}
			context.closePath()
			context.stroke()
		} else {
			context.font = 'bold 20px sans-serif'
			context.fillText(selected_data[i], left + SIZE / 2, top + SIZE / 2)

			if (_.contains(underliners, selected_data[i])) {
				context.beginPath()
				context.strokeStyle = '#000000'
				context.lineWidth = 3
				context.moveTo(left + SIZE * 0.15, top + SIZE * 0.85)
				context.lineTo(left + SIZE * 0.85, top + SIZE * 0.85)
				context.closePath()
				context.stroke()
			}
		}

		//	drawing boxes to indicate the selected letter
		var left =
			PUZZLE_LEFT +
			(SIZE + 4.5) * (offset - 0.25) +
			(4 - word.length) * 0.5 * SIZE +
			1
		var top = PUZZLE_TOP + SIZE * (i_counter + ROWS + 0.5)
		context.strokeStyle = '#000000'
		context.lineWidth = 1

		if (i == 4 && group == 5) {
			//	drawing rectangles for Q and Z
			isZ = false
			isQ = false
			if (animatingOffset == offset && animatingChar == selected_data[i]) {
				isQ = true
			}
			if (animatingOffset == offset && animatingChar == selected_data[i + 1]) {
				isZ = true
			}

			if (current_guess[offset] == selected_data[i] || isQ) {
				//	Q
				if (isQ) {
					context.setLineDash([5, 2])
				}

				context.beginPath()
				context.moveTo(left + 1, top + 1) // give the (x,y) coordinates
				context.lineTo(left + SIZE - 1, top + 1)
				context.lineTo(left + 1, top + SIZE - 1)
				context.closePath()
				context.stroke()
				context.setLineDash([0, 0])
			}
			if (current_guess[offset] == selected_data[i + 1] || isZ) {
				//	Z
				if (isZ) {
					context.setLineDash([5, 2])
				}
				context.beginPath()
				context.moveTo(left + SIZE - 1, top + SIZE - 1) // give the (x,y) coordinates
				context.lineTo(left + SIZE - 1, top + 1)
				context.lineTo(left + 1, top + SIZE - 1)
				context.closePath()
				context.stroke()
				context.setLineDash([0, 0])
			}
		} else {
			// no event if it's already hinted
			if (current_guess[offset] == selected_data[i]) {
				context.strokeRect(left + 1, top + 1, SIZE - 2, SIZE - 2)
			}

			if (animatingOffset == offset && animatingChar == selected_data[i]) {
				context.setLineDash([5, 2])
				context.strokeRect(left + 1, top + 1, SIZE - 2, SIZE - 2)
				context.setLineDash([0, 0])
			}
		}
		if (!word.hint[offset])
			if (i == 4 && group == 5) {
				events.push(
					plan(
						left,
						top,
						SIZE / 2,
						SIZE / 2,
						selected_data[i],
						offset,
						i,
						group
					)
				)
				events.push(
					plan(
						left + SIZE / 2,
						top + SIZE / 2,
						SIZE / 2,
						SIZE / 2,
						selected_data[i + 1],
						offset,
						i,
						group
					)
				)
			} else {
				events.push(
					plan(left, top, SIZE, SIZE, selected_data[i], offset, i, group)
				)
			}
	}
}

function plan(left, top, width, height, char, offset, i, group) {
	return [
		left,
		top,
		width,
		height,
		(function(char, offset, i, group) {
			return function() {
				Animate(offset, char)
				setTimeout(
					(function(char, offset, i, group) {
						return function() {
							current_guess[offset] = char
							_word = current_guess.join('')
							if (_word.length > word.length && _.contains(checkList, _word)) {
								//  is it a new guess?
								repeatFlag = _.some(_.initial(guesses[current_index]), function(
									x
								) {
									return _.isEqual(x, current_guess)
								})
								if (!repeatFlag) {
									//  add to the guess list
									setTimeout(function() {
										_word = current_guess.join('')
										if (
											_word.length > word.length &&
											_.contains(checkList, _word)
										) {
											addGuess(current_index)
											current_guess = newGuess(current_index)
											guesses[current_index].push(current_guess)
											drawPuzzle()
										}
									}, 200)
								}
							}
							Animate(-1, undefined)
							drawPuzzle()
						}
					})(char, offset, i, group),
					200
				)
			}
		})(char, offset, i, group)
	]
}
