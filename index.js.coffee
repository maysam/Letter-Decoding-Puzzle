document.addEventListener 'touchmove', ((event) -> event.preventDefault()) , false

$(window).bind 'touchstart', (e) ->
  now = new Date().getTime();
  lastTouch = $(this).data('lastTouch') || now + 1 
  delta = now - lastTouch;
  if(delta<200 && delta>0)
    mouseDoubleClick(e)
  else
    mouseClick(e)
  $(this).data('lastTouch', now);

makeTree = ->
  i = 0

  while i < dictionary.length
    _word = dictionary[i]
    continue  if _word.length < 3 or _word.length > 9
    temp = tree
    j = 0

    while j < _word.length
      
      # where should the character be listed at
      index = _word[j] #  .charCodeAt(0)-65;
      # is this number in the list yet?
      last = temp.indexOf(index) + 1
      if last is 0
        
        # if not, add the ascii code and push an empty array after it
        last = temp.push(index)
        temp.push [j + 1, temp]
      
      # now temp is holding the new array or old one for this word
      temp = temp[last]
      j++
    
    # push something to indicated if you are up to here, you have a valid word
    #
    #     CHASES
    #     DINE
    #     FASTED
    #     GRAPE
    #     ITS
    #     SOL 
    #   
    
    # make sure it's not a duplicated word
    temp.push "YES"  if temp.indexOf("YES") is -1
    i++

# if tree has yes then take it as a word
supports_html5_storage = ->
  try
    return "localStorage" of window and window["localStorage"]?
  catch e
    return false
window.newGame = ->
  MIN_LENGTH = 3
  MAX_LENGTH = 5
  tries = 0
  resetGuessList()
  loop
    tries++
    break  if tries > 10000
    #console.log('tries: ', tries)
    init()
    board = puzzle.slice(0)
    i = 0

    while i < COLUMNS
      board[i] = board[i].slice(0)
      i++
    if wordList.length > 0
      isConnected board, wordList[0].startx, wordList[0].starty  
    notConnected = false

    for row in board
      for cell in row
        if cell? and cell isnt -1
          notConnected = true
        break if notConnected
      break if notConnected
    break unless notConnected or wordCount isnt parseInt $("#number_of_words:checked").val()
  window.timing = true
  window.time = 0
  $.ajax
    url: "topscores.php"
    dataType: "json"
    async: true
    data:
      wordcount: wordCount
      fullname: $("#fullname").val()

    success: (data) ->
      high_score = data.HS
      top_score = data.TS
      drawPuzzle()
      $("#loading_panel").hide()

$(window).bind "touchstart", (e) ->
  now = new Date().getTime()
  lastTouch = $(this).data("lastTouch") or now + 1
  delta = now - lastTouch
  if delta < 200 and delta > 0
    mouseDoubleClick e
  else
    mouseClick e
  $(this).data "lastTouch", now

window.high_score = ""
window.top_score = ""
window.dictionary = easyList
window.tree = [0, null]
makeTree()
$(window).load ->
  mouseMove = (e) ->
    e = e.originalEvent  if e.originalEvent
    e = e or window.event
    if not e.which and e.button
      if e.button & 1
        e.which = 1
      else if e.button & 4
        e.which = 2
      else e.which = 3  if e.button & 2
    unless e.buttons is `undefined`
      button = e.buttons
    else
      button = e.which
    if button
      
      # scroll if scrollbar is there
      x = (if (e.touches) then e.touches[0].pageX else e.pageX)
      y = (if (e.touches) then e.touches[0].pageY else e.pageY)
      x = x - $("#canvas").offset().left
      y = y - $("#canvas").offset().top
      i = events.length - 1

      while i >= 0
        ev = events[i]
        if ev[0] <= x and x <= ev[0] + ev[2] and ev[1] <= y and y <= ev[1] + ev[3]
          ev[4] x, y
          drawPuzzle()
          continue
        i--
  $("#setting_panel").hide()
  $("#number_of_words[value=15]").attr "checked", true
  if supports_html5_storage()
    $("#fullname").val localStorage.fullname  if localStorage.fullname  
  window.ondblclick = mouseDoubleClick
  $(window).bind "click", mouseClick
  window.onmousemove = mouseMove
  $("#saveButton")[0].onclick = ->
    if $("#submit_details").is(":checked")
      if $("#fullname").val() is ""
        alert "Please fill the name field"
        return false
      if supports_html5_storage()
        localStorage.fullname = $("#fullname").val()
        localStorage.email = $("#email").val()
    $("#setting_panel").hide()
  newGame()
