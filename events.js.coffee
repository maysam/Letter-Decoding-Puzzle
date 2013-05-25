#
#fear of judgement stems from over identifying urself, accept that you dont know urself either and you might not be who you think you are
#although beleiving in u drives u forward, you should be beleive so much so to oppose conscience change or learning of truth about yourself
#dont confuse completing the job with proving your worth
#
newGuess = (wordIndex) ->
  guess = []
  _word = wordList[wordIndex]
  
  #	fix the hints
  i = 0

  while i <= _word.length
    guess[i] = _word.hint[i]
    i++
  guess

stopGame = ->
  if redWords.length is 0 and timing
    timing = false # or unset the clockHandle
    word = null
    if $("#submit_details").is(":checked")
      score = calculateScore()
      letters = countLetters()
      if navigator.onLine
        $.ajax
          url: "scores.php"
          dataType: "json"
          async: true
          data:
            time: time
            score: score
            fullname: $("#fullname").val()
            email: $("#email").val()
            wordcount: wordCount
            maxsize: $("#maximum_word_size").val()
            letters: letters
          success: (data) ->
            alert data  if data

#	send data, store recoords
window.mouseDoubleClick = (e) ->
  e = e.originalEvent  if e.originalEvent
  return true  if not puzzle or $("#setting_panel").css("display") is "block"
  x = (if (e.touches) then e.touches[0].pageX else e.pageX)
  y = (if (e.touches) then e.touches[0].pageY else e.pageY)
  x = Math.floor((x - $("#canvas").offset().left - PUZZLE_LEFT) / SIZE)
  y = Math.floor((y - $("#canvas").offset().top - PUZZLE_TOP) / SIZE)
  if 0 <= x and x < COLUMNS and 0 <= y and y < ROWS
    if puzzle[x][y]? and puzzle[x][y] isnt -1 and not hints[x][y]?
      hint = hints[x][y] = puzzle[x][y]
      
      #	remove all guesses without this hint
      i = -1
      while i < (i = detectWord(x, y, i))
        _word = wordList[i]
        
        #	check if the hint is for this word
        k = x + y - _word.startx - _word.starty
        _word.hint[k] = hint
        j = guesses[i].length - 2

        while j >= 0
          _guess = guesses[i][j]
          unless _guess[k] is hint
            
            #	remove guess
            removeGuess i, j
            guesses[i].splice j, 1
          j--
        _guess = guesses[i][guesses[i].length - 1]
        _guess[k] = hint
        
        #	if everything is not hinted, and guess is complete, check for word
        if _word.hint.join("").length is _word.length + 1
          
          # remove guess if repeated
          # no need to remove, we don't show the last guess for full hints if repeated
          #					continue
          repeatFlag = guesses[i].some((x) ->
            x.join() is _guess.join() and x isnt _guess
          )

          if repeatFlag
            guesses[i].pop()
            current_guess = guesses[i][guesses[i].length - 1]  if word is _word
            addGuess i
            guesses[i].push newGuess(i)
            current_guess = guesses[i][guesses[i].length - 1]
          continue
        if _guess.join("").length is _word.length + 1
          
          #	check the guess
          if _guess.join("").length > word.length
            found = _.indexOf(checkList, _guess.join(""))
            unless found is -1
              
              #	is it a new guess?
              repeatFlag = guesses[i].some((x) ->
                x.join() is _guess.join() and x isnt _guess
              )
              unless repeatFlag
                
                #	add to the list
                addGuess i
                g = guesses[i].push(newGuess(i))
                current_guess = guesses[i][g - 1]  if word is _word
  drawPuzzle()
  false
window.mouseClick = (e) ->
  e = e.originalEvent
  return true  if $("#setting_panel").css("display") is "block"
  x = (if (e.touches) then e.touches[0].pageX else e.pageX)
  y = (if (e.touches) then e.touches[0].pageY else e.pageY)
  x = x - $("#canvas").offset().left
  y = y - $("#canvas").offset().top
  while ev = events.pop()
  	if ev?[0] <= x and x <= ev[0] + ev[2] and ev[1] <= y and y <= ev[1] + ev[3]
      ev[4] x, y
      break

  unless window.timing
    #	nothing to do here
    drawPuzzle()
    return false
  x = Math.floor((e.pageX - $("#canvas").offset().left - PUZZLE_LEFT) / SIZE)
  y = Math.floor((e.pageY - $("#canvas").offset().top - PUZZLE_TOP) / SIZE)
  if 0 <= x and x < COLUMNS and 0 <= y and y < ROWS
    #  selecting a new word-code in the puzzle
    oldid = -1
    oldid = word.index  if word
    newid = detectWord(x, y, oldid)
    if newid isnt -1 and newid isnt oldid #	something new
      window.word = wordList[newid]
      word.index = newid #	fix for removing single words
      guesses[newid] = [newGuess(newid)]  unless guesses[newid]
      window.current_guess = guesses[newid][guesses[newid].length - 1]
      window.current_index = newid
      window.scroll_index = 0

  #	check if the bars are clicked
  if word
    x = Math.floor((e.pageX - $("#canvas").offset().left - PUZZLE_LEFT - (4 - word.length) * 0.5 * SIZE) / (SIZE + 4.5) + 0.25)
    y = Math.floor((e.pageY - $("#canvas").offset().top - PUZZLE_TOP) / SIZE - ROWS - 0.5)
    char = ""
    if 0 <= x and x <= word.length
      
      #	ignore if this column is hinted already
      unless word.hint[x]
        if 0 <= y and y < 5
          g = GROUP[word.data[x].charCodeAt(0) - 65]
          if (g is 5) and (y is 4)
            # Q Z
            tx = (e.pageX - $("#canvas").offset().left - PUZZLE_LEFT - (4 - word.length) * 0.5 * SIZE) / (SIZE + 4.5) + .25 - x
            ty = (e.pageY - $("#canvas").offset().top - PUZZLE_TOP) / SIZE - (ROWS + 0.5) - y
            if (tx + ty) > 0.85
              char = ALPHA[g][y + 1]
            else
              char = ALPHA[g][y]
          else
            char = ALPHA[g][y]
          unless char is ""
            #	toggle char on choices index x
            current_guess[x] = char
            _word = current_guess.join("")
            if _word.length > word.length
              found = _.indexOf(checkList, _word)
              unless found is -1
                
                #	is it a new guess?
                repeatFlag = guesses[current_index].some((x) ->
                  x.join() is current_guess.join() and x isnt current_guess
                )
                unless repeatFlag
                  
                  #	add to the guess list
                  addGuess current_index
                  window.current_guess = newGuess(current_index)
                  g = guesses[current_index].push(current_guess)
    
    #	else check if the cross next to the guesses has been clicked
    #	only if there is anything to guess
    _scroll_index = Math.floor(scroll_index)
    i = _scroll_index

    while i < guesses[current_index].length and i < 5 + _scroll_index
      if i > 0
        actual_i = guesses[current_index].length - i - 1
        left = x_left
        top = x_top + SIZE * (i - _scroll_index)
        x = e.pageX - $("#canvas").offset().left - left
        y = e.pageY - $("#canvas").offset().top - top
        if 0 <= x and x <= SIZE - 10 and 0 <= y and y <= SIZE - 10
          removeGuess current_index, actual_i
          guesses[current_index].splice actual_i, 1
      i++
  drawPuzzle()
window.detectWord = (i, j, current_choice) ->
  
  #	returns the index of the word which lays on (i,j)
  
  #	not a word
  return -1  if not puzzle or puzzle[i][j] is 0
  k = 0

  while k < wordCount
    unless k is current_choice
      tmp_word = wordList[k]
      return k  if tmp_word.startx <= i and i <= tmp_word.endx and tmp_word.starty <= j and j <= tmp_word.endy
    k++
  current_choice