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
  for _word in dictionary
    if _word.length < 3 or _word.length > 9
      continue
    temp = tree
    for j, char of _word
      last = temp.indexOf(char) + 1
      if last is 0
        last = temp.push char
        temp.push [j + 1, temp]
      temp = temp[last]
    if temp.indexOf("YES") is -1
      temp.push "YES"

# if tree has yes then take it as a word
supports_html5_storage = ->
  try
    return "localStorage" of window and window["localStorage"]?
  catch e
    return false

isConnected = (board, i, j) ->
  if board[i]?[j]? and board[i][j] isnt -1
    board[i][j] = -1
    isConnected board, i - 1, j
    isConnected board, i + 1, j
    isConnected board, i, j - 1
    isConnected board, i, j + 1

window.newGame = ->
  MIN_LENGTH = 3
  MAX_LENGTH = 5
  tries = 0
  resetGuessList()
  connected = false
  while tries++ < 100 and not connected
    wordCount = 0
    until wordCount == parseInt($("#number_of_words:checked").val())
      wordCount = init()  
    board = _.map puzzle, (row) -> _.clone row
    isConnected board, wordList[0].startx, wordList[0].starty  
    connected = true
    for row in board when connected
      for cell in row when connected
        connected = cell is -1
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
    e = e.originalEvent or window.event
    if not e.which and e.button
      if e.button & 1
        e.which = 1
      else if e.button & 4
        e.which = 2
      else e.which = 3  if e.button & 2
    button = e.buttons or e.which
    if button      
      # scroll if scrollbar is there
      obj = e.touches?[0] or e
      [x, y] = [obj.pageX, obj.pageY]
      x = x - $("#canvas").offset().left
      y = y - $("#canvas").offset().top
      while ev = events.pop()
        if ev[0] <= x and x <= ev[0] + ev[2] and ev[1] <= y and y <= ev[1] + ev[3]
          ev[4] x, y
          drawPuzzle()
          continue
  $("#setting_panel").hide()
  $("#number_of_words[value=15]").prop "checked", true
  if supports_html5_storage()
    if localStorage.fullname
      $("#fullname").val localStorage.fullname  
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
