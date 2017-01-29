var GAME = GAME || {};

// functions to get or generate DOM elements
GAME.elements = {
  getTimerValueElem: function () {
    return document.getElementById('time-value');
  },

  getMoveCounterElem: function () {
    return document.getElementById('moves-value');
  },

  getBlankElem: function () {
    return document.querySelector("[hj-value=\" \"]");
  },

  getElementByValue: function (val) {
    return document.querySelector("[hj-value=\"" + val + "\"]");
  },

  getAllGamePieces: function () {
    return document.getElementsByClassName("playfield-piece");
  },

  getPlayfield: function () {
    return document.getElementsByClassName("playfield-contents")[0];
  },
  createSpace: function (x, y, val) {
    if (val == 0) {
      val = " ";
    }
    var space = document.createElement("div");
    space.className = "playfield-space";
    var piece = document.createElement("div");
    piece.setAttribute("hj-value", val);
    piece.setAttribute("hj-pos-x", x);
    piece.setAttribute("hj-pos-y", y);
    piece.classList.add("playfield-piece");
    piece.onclick = GAME.pieceClicked;
    var label = this.createPieceLabel(val);
    piece.appendChild(label);
    space.appendChild(piece);
    return space;
  },

  createPieceLabel: function (text) {
    var label = document.createElement("div");
    label.innerText = text;
    label.classList.add("playfield-piece-label");
    label.classList.add("noselect");
    return label;
  },

};

GAME.utils = {
  formatTimeElapsed: function (millisec) {
    var seconds = Math.floor((millisec / 1000) % 60);
    var minutes = Math.floor(millisec / (1000 * 60));
    return this.pad(minutes, 2) + ":" + this.pad(seconds, 2);
  },
  pad: function (n, width, z) {
    //TGFSO
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },
  coordsWithinBounds: function (x, y) {
    result = true;
    if (x < 0 || x >= 5) {
      result = false
    }
    if (y < 0 || y >= 5) {
      result = false
    }
    return result
  }
};

GAME.state = {
  mode: "knight",
  running: false,
  started_time: null,
  moves: 0,
  interval_id: null,
  board: {
    order: [
      1, 2, 3, 4, 5,
      6, 7, 8, 9, 10,
      11, 12, 13, 14, 15,
      16, 17, 18, 19, 20,
      21, 22, 23, 24, 0],

    swapByValue: function (val) {
      val = parseInt(val);
      var target_index = this.order.indexOf(val);
      var zero_index = this.order.indexOf(0);
      console.log(this.order);
      this.order[zero_index] = val;
      this.order[target_index] = 0;
      console.log(this.order);
    },
    getCoordsOfValue: function(value){
      var index = this.order.indexOf(value);
      return [index%5, Math.floor(index/5)];
    },

    getValueByXY: function (x, y) {
      return this.order[(y * 5) + x]
    }
  }
};

GAME.logic = {
  getValidCoords: function () {
    // This is a list of reletive [x,y] coords that can be added
    // to the current [x,y] to find "knight's moves")
    var jump_tables = {
      "knight": [
        [-1, -2],
        [1, -2],
        [-2, -1],
        [2, -1],
        [-2, 1],
        [2, 1],
        [-1, 2],
        [1, 2]
      ]
    };
    var blank = GAME.state.board.getCoordsOfValue(0);
    var x = blank[0]; var y = blank[1];
    var table = jump_tables[GAME.state.mode];
    var moves = [];
    for(var i=0; i<table.length; i++){
      var jump = table[i];
      var potential_coord = [x+jump[0], y+jump[1]];
      if(GAME.utils.coordsWithinBounds(potential_coord[0],potential_coord[1])){
        moves.push(potential_coord);
      }
    }
    return moves;
  },

  getValidValues: function(){
    valid_values = [];
    var valid_coords = this.getValidCoords();
    valid_coords.forEach(function(c){
      valid_values.push(GAME.state.board.getValueByXY(c[0],c[1]));
    });
    return valid_values;
  },

  shuffle: function (iterations) {
    for (var i = 0; i < iterations; i++) {
      var valid_values = GAME.logic.getValidValues();
      var pick = valid_values[Math.floor(Math.random() * valid_values.length)];
      GAME.state.board.swapByValue(pick);
    }
  }
};

GAME.scorekeeping = {
  updateTimer: function () {
    var state = GAME.state;
    if (state.started_time == null || !state.running) {
      return; // don't touch timer if game isn't running;
    }
    var timer_elem = GAME.elements.getTimerValueElem();
    timer_elem.innerText = GAME.utils.formatTimeElapsed(new Date() - state.started_time);
  },

  startTimer: function () {
    GAME.state.started_time = new Date();
    GAME.state.interval_id = window.setInterval(this.updateTimer, 500);
  },

  stopTimer: function () {
    window.clearInterval(GAME.state.interval_id);
    GAME.state.started_time = null;
    GAME.state.interval_id = null;
  },

  resetTimer: function () {
    this.stopTimer();
    GAME.elements.getTimerValueElem().innerText = "00:00";
  },

  incrementMoveCounter: function () {
    if (!GAME.state.running) {
      return
    } // Don't do anything if the game isn't running
    GAME.state.moves += 1;
    GAME.elements.getMoveCounterElem().innerText = GAME.state.moves;
  },

  resetMoveCounter: function () {
    GAME.state.moves = 0;
    GAME.elements.getMoveCounterElem().innerText = GAME.state.moves;
  }
};

GAME.isPuzzleSolved = function () {
  var board = GAME.state.board.order;
  for (var p = 0; p < board.length; p++) {
    var piece_value = board[p];
    if (p < 24) {
      if (piece_value != p + 1) {
        return false;
      }
    } else {
      if (piece_value != 0) {
        return false;
      }
    }
  }
  return true;
};

GAME.reset = function () {
  GAME.scorekeeping.resetTimer();
  GAME.scorekeeping.resetMoveCounter();
  GAME.state.running = false;
  GAME.stopDance();
  GAME.state.animating = false;
  GAME.state.board.order = [
    1, 2, 3, 4, 5,
    6, 7, 8, 9, 10,
    11, 12, 13, 14, 15,
    16, 17, 18, 19, 20,
    21, 22, 23, 24, 0];
  GAME.renderBoard();
};

GAME.newGame = function(){
  GAME.reset();
  GAME.state.running = true;
  GAME.logic.shuffle(25);
  GAME.renderBoard();
  GAME.scorekeeping.startTimer();
};

GAME.markValidPieces = function(){
  GAME.logic.getValidValues().forEach(function(v){
    GAME.elements.getElementByValue(v).classList.add("valid");
  });
};

GAME.renderBoard = function () {
  var order = GAME.state.board.order;
  var playfield = GAME.elements.getPlayfield();
  playfield.innerHTML = "";
  var count = 0; // keep track of board index
  for (var y = 0; y <= 4; y++) {
    for (var x = 0; x <= 4; x++) {
      var space = GAME.elements.createSpace(x, y, order[count]);
      count++;
      playfield.appendChild(space);
    }
  }
  GAME.markValidPieces();
};

GAME.swap = function (piece_value) {
  if (GAME.state.animating) {
    return
  }
  GAME.state.animating = true;
  var blank_piece = GAME.elements.getBlankElem();
  var target_piece = GAME.elements.getElementByValue(piece_value);
  GAME.state.board.swapByValue(piece_value);
  var new_left = $(blank_piece).position().left - $(target_piece).position().left;
  var new_top = $(blank_piece).position().top - $(target_piece).position().top;
  move(target_piece)
      .ease("cubic-bezier(0.175, 0.885, 0.32, 1.275)")
      .duration(200)
      .x(new_left).y(new_top)
      .then(function () {
        GAME.renderBoard();
        GAME.state.animating = false;
      }).end()
};

GAME.pieceClicked = function () {
  var val = this.getAttribute("hj-value");
  if (val == " " || !GAME.state.running) {
    return;
  }
  val = parseInt(val);
  var valid_values = GAME.logic.getValidValues();
  if(valid_values.indexOf(val)==-1){
    return;
  }
  GAME.scorekeeping.incrementMoveCounter();
  GAME.swap(val);
  if(GAME.isPuzzleSolved()){
    GAME.state.running = false;
    GAME.scorekeeping.stopTimer();
    GAME.dance()
  }
};

GAME.dance = function () {
  var easings = [
    'easeInBounce',
    'cubic-bezier(0.075, 0.82, 0.165, 1)',
    'easeInElastic',
    'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    'cubic-bezier(0.6, 0.04, 0.98, 0.335)'

  ];

  function update() {
    var pieces = [].slice.call(GAME.elements.getAllGamePieces()); // turn the HTMLCollection into array
    pieces.forEach(function (piece) {
      move(piece)
          .ease(easings[Math.random() * easings.length])
          .x((Math.random() * 120)-60).y((Math.random() * 120)-60).end();
    });
  }

  GAME.state.danceInterval = setInterval(update, 200);
};

GAME.stopDance = function () {
  clearInterval(GAME.state.danceInterval);
  GAME.state.danceInterval = null;
};