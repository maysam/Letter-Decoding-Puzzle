document.addEventListener(
  'touchmove',
  function(event) {
    event.preventDefault()
  },
  false
)

$(window).bind('touchstart', function(e) {
  var now = new Date().getTime()
  var lastTouch =
    $(this).data('lastTouch') ||
    now + 1 /** the first time this will make delta a negative number */
  var delta = now - lastTouch
  if (delta < 200 && delta > 0) {
    // the second touchend event happened within half a second. Here is where we invoke the double tap code
    mouseDoubleClick(e)
  } else {
    // A click/touch action could be invoked here but wee need to wait half a second before doing so.
    mouseClick(e)
  }
  $(this).data('lastTouch', now)
})
function makeTree() {
  dictionary = _.filter(dictionary, function(a) {
    return a.length >= MIN_LENGTH && a.length <= MAX_LENGTH
  })
  _.each(dictionary, function(_word) {
    temp = tree
    for (var j = 0; j < _word.length; j++) {
      //  where should the character be listed at
      index = _word[j] //  .charCodeAt(0)-65;
      //  is this number in the list yet?
      last = temp.indexOf(index) + 1
      if (last == 0) {
        // if not, add the ascii code and push an empty array after it
        last = temp.push(index)
        temp.push([j + 1, temp])
      }
      //  now temp is holding the new array or old one for this word
      temp = temp[last]
    }
    //  push something to indicated if you are up to here, you have a valid word
    if (!_.contains(temp, 'YES')) {
      //  make sure it's not a duplicated word
      temp.push('YES')
    }
    //  if tree has yes then take it as a word
  })
}
var high_score = ''
var top_score = ''
var dictionary = easyList
var tree = [0, null]

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null
  } catch (e) {
    return false
  }
}

function newGame() {
  tries = 0
  resetGuessList()
  do {
    tries++
    if (tries > 10000) break
    init()
    var board = puzzle.slice(0)
    for (var i = 0; i < COLUMNS; i++) {
      board[i] = board[i].slice(0)
    }
    if (wordList.length > 0) {
      isConnected(board, wordList[0].startx, wordList[0].starty)
    }
    notConnected = false
    for (var i = 0; i < COLUMNS; i++) {
      for (var j = 0; j < ROWS; j++) {
        if (board[i][j] != null && board[i][j] != -1) {
          notConnected = true
          break
        }
      }
    }
  } while (notConnected || wordCount != $('#number_of_words:checked').val())
  timing = true
  time = 0
  if (navigator.onLine)
    $.ajax({
      url: 'topscores.php',
      dataType: 'json',
      async: true,
      data: { wordcount: wordCount, fullname: $('#fullname').val() },
      success: function(data) {
        high_score = data.HS
        top_score = data.TS
        drawPuzzle()
        $('#loading_panel').hide()
      },
      error: function() {
        console.log('There was an error fetching topscores!')
        $('#loading_panel').hide()
      }
    })
  else {
    drawPuzzle()
    $('#loading_panel').hide()
  }
}

$(window).load(function() {
  makeTree()
  $('#setting_panel').hide()
  if (supports_html5_storage()) {
    if (localStorage.fullname) $('#fullname').val(localStorage.fullname)
    if (localStorage.email) $('#email').val(localStorage.email)
  }

  window.ondblclick = mouseDoubleClick
  function mouseMove(e) {
    if (e.originalEvent) e = e.originalEvent
    e = e || window.event
    if (!e.which && e.button) {
      if (e.button & 1) e.which = 1
      else if (e.button & 4) e.which = 2
      else if (e.button & 2) e.which = 3
    }
    if (e.buttons != undefined) button = e.buttons
    else button = e.which
    if (button) {
      //  scroll if scrollbar is there

      var x = e.touches ? e.touches[0].pageX : e.pageX
      var y = e.touches ? e.touches[0].pageY : e.pageY

      x = x - $('#canvas').offset().left
      y = y - $('#canvas').offset().top

      _.each(events, function(ev) {
        if (
          ev[0] <= x &&
          x <= ev[0] + ev[2] &&
          ev[1] <= y &&
          y <= ev[1] + ev[3] &&
          'scroll_event' == ev[5]
        ) {
          ev[4](x, y)
          drawPuzzle()
        }
      })
    }
  }
  $(window).bind('click', mouseClick)
  window.onmousemove = mouseMove
  $('#saveButton')[0].onclick = function() {
    if ($('#submit_details').is(':checked')) {
      if ($('#fullname').val() == '') {
        alert('Please fill the name field')
        return false
      }
      if (supports_html5_storage()) {
        localStorage.fullname = $('#fullname').val()
        localStorage.email = $('#email').val()
      }
    }
    $('#setting_panel').hide()
  }
  newGame()
})

function isConnected(board, i, j) {
  if (board[i] && board[i][j] && board[i][j] != -1) {
    board[i][j] = -1
    isConnected(board, i - 1, j)
    isConnected(board, i + 1, j)
    isConnected(board, i, j - 1)
    isConnected(board, i, j + 1)
  }
}
