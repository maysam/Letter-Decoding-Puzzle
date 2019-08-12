/*
fear of judgement stems from over identifying urself, accept that you dont know urself either and you might not be who you think you are
although beleiving in u drives u forward, you should be beleive so much so to oppose conscience change or learning of truth about yourself
dont confuse completing the job with proving your worth
*/
function newGuess(wordIndex) {
  return _.clone(current_guess)
}

function stopGame() {
  if (redWords.length == 0 && timing) {
    timing = false
    //  unset the clockHandle
    word = null
    if ($('#submit_details').is(':checked')) {
      var score = calculateScore()
      var letters = countLetters()
      if (navigator.onLine)
        $.get(
          'scores.php?time=' +
            time +
            '&score=' +
            score +
            '&fullname=' +
            $('#fullname').val() +
            '&email=' +
            $('#email').val() +
            '&wordcount=' +
            wordCount +
            '&letters=' +
            letters,
          function(data) {
            if (data) alert(data)
          }
        )
      //  send data, store recoords
    }
  }
}

function mouseClick(e) {
  e = e.originalEvent
  if ($('#setting_panel').css('display') == 'block') {
    return true
  }

  var x = e.touches ? e.touches[0].pageX : e.pageX
  var y = e.touches ? e.touches[0].pageY : e.pageY

  x = x - $('#canvas').offset().left
  y = y - $('#canvas').offset().top
  _.each(events, function(ev) {
    if (ev[0] <= x && x <= ev[0] + ev[2] && ev[1] <= y && y <= ev[1] + ev[3]) {
      ev[4](x, y)
      drawPuzzle()
    }
  })
}
function detectWord(i, j, current_word) {
  //  returns the index of the word which lays on (i,j)
  for (var k = 0; k < wordCount; k++) {
    tmp_word = wordList[k]
    if (
      tmp_word.startx <= i &&
      i <= tmp_word.endx &&
      tmp_word.starty <= j &&
      j <= tmp_word.endy &&
      tmp_word != current_word
    ) {
      return tmp_word
    }
  }
  return current_word
}

function mouseDoubleClick(e) {
  e.preventDefault()
  e.stopPropagation()
  if (e.originalEvent) e = e.originalEvent
  if (!puzzle || $('#setting_panel').css('display') == 'block') {
    return true
  }

  var x = e.touches ? e.touches[0].pageX : e.pageX
  var y = e.touches ? e.touches[0].pageY : e.pageY

  x = Math.floor((x - $('#canvas').offset().left - PUZZLE_LEFT) / SIZE)
  y = Math.floor((y - $('#canvas').offset().top - PUZZLE_TOP) / SIZE)

  if (0 <= x && x < COLUMNS && 0 <= y && y < ROWS) {
    if (puzzle[x][y] != null && puzzle[x][y] != -1 && hints[x][y] == null) {
      hint = hints[x][y] = puzzle[x][y]
      //  remove all guesses without this hint
      var _word = null
      for (
        var i_temp = 0;
        i_temp < 2;
        i_temp++ //  TODO: refactor this
      )
        if ((_word = detectWord(x, y, _word))) {
          i = _word.index
          //  check if the hint is for this word
          k = x + y - _word.startx - _word.starty
          _word.hint[k] = hint
          for (var j = guesses[i].length - 2; j >= 0; j--) {
            _guess = guesses[i][j]
            if (_guess[k] != hint) {
              //  remove guess
              removeGuess(i, j)
            }
          }
          var _guess = guesses[i][guesses[i].length - 1]
          _guess[k] = hint
          //  if everything is not hinted, and guess is complete, check for word
          if (_word.hint.join('').length == _word.length + 1) {
            // remove guess if repeated
            // no need to remove, we don't show the last guess for full hints if repeated
            repeatFlag = guesses[i].some(function(x) {
              return x.join() == _guess.join() && x !== _guess
            })
            if (repeatFlag) {
              guesses[i].pop()
              if (word === _word) {
                current_guess = guesses[i][guesses[i].length - 1]
              }
              addGuess(i)
              guesses[i].push(newGuess(i))
              current_guess = guesses[i][guesses[i].length - 1]
            }
            continue
          }
          if (_guess.join('').length == _word.length + 1) {
            //  check the guess

            if (_guess.join('').length > word.length) {
              found = _.indexOf(checkList, _guess.join(''))
              if (found != -1) {
                //  is it a new guess?
                repeatFlag = guesses[i].some(function(x) {
                  return x.join() == _guess.join() && x !== _guess
                })
                if (!repeatFlag) {
                  //  add to the list
                  addGuess(i)
                  var g = guesses[i].push(newGuess(i))
                  if (word === _word) {
                    current_guess = guesses[i][g - 1]
                  }
                }
              }
            }
          }
        }
    }
  }
  drawPuzzle()
  return false
}
