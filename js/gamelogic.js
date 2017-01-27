
started_time = null;
movecount = 0;
gamestarted = false;
moving = false;
game_timer = null;

function pad(n, width, z) {
  //TGFSO
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function timeConversion(millisec) {
    var seconds = Math.floor((millisec / 1000)%60);
    var minutes = Math.floor(millisec / (1000 * 60));
    //var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    //var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);
    return pad(minutes,2) + ":" + pad(seconds,2);
}

function updateTimer(){
	if(!gamestarted || started_time==null){
		return // don't touch timer if game isn't running;
	}
	var timer_elem = document.getElementById("time-value");
	var elapsed = new Date() - started_time;
	var timer_string = timeConversion(elapsed);
	timer_elem.innerText = timer_string;	
}

function resetTimer(){
	var timer_elem = document.getElementById("time-value");
	timer_elem.innerText = "00:00";
}

function incrementMoveCount(){
	if(!gamestarted){return}
	var movecount_element = document.getElementById("moves-value");
	movecount += 1;
	movecount_element.innerText = movecount;
}

function resetMoveCount(){
	var movecount_element = document.getElementById("moves-value");
	movecount = 0;
	movecount_element.innerText = movecount;
}


function getBlankElem(){
	return document.querySelector("[hj-value=\" \"]");
}

function getAllGamePieces(){
	return document.getElementsByClassName("playfield-piece");
}

function createCoordObj(x, y){
	return {x:x, y:y}
}

function getElemByCoords(coord_obj){
	/*
	This function takes an object with x and y values and attempts to return
	the cooresponding game-piece element
	*/
	var x = coord_obj.x;
	var y = coord_obj.y;
	query_string = "[hj-pos-x=\""+x+"\"][hj-pos-y=\""+y+"\"]";
	return document.querySelector(query_string);
}

function getAllValidElems(){
	return getValidMovesFromCoords(getCoordsFromElem(getBlankElem()));
}

function getCoordsFromElem(elem){
	/*
	This function takes one of the game piece elements and returns the cords as an object
	with the form {x:"1",y:"3"}.
	*/
	var x = elem.getAttribute('hj-pos-x');
	var y = elem.getAttribute('hj-pos-y');
	return createCoordObj(x,y);
}

function shuffle(iterations){
	resetTimer();
	reset();
	started_time = new Date();
	for(var i=0; i<iterations; i++){
		var valids = getAllValidElems();
		var valid = valids[Math.floor(Math.random()*valids.length)];
		getElemByCoords(valid).click();
	}
	movecount = 0
	gamestarted = true;
	started_time = new Date();
	game_timer = window.setInterval(updateTimer, 500);
}

function reset(){
	window.clearInterval(game_timer);
	game_timer = null;
	started_time = null;
    resetMoveCount();
    gamestarted = false;
    moving = false;
    resetTimer();
	var table_elem = document.getElementsByClassName("playfield-contents")[0]
	table_elem.innerHTML = "";
	setUp();
	//Add score keeping code her
}

function swap(elem){
	incrementMoveCount();
	var blank_elem = getBlankElem();
	var blank_classes = blank_elem.classList;
	var blank_elem_label = blank_elem.getElementsByClassName("playfield-piece-label")[0];
    var blank_val = blank_elem_label.textContent;
	blank_elem_label.textContent = elem.textContent;
	blank_elem.classList = elem.classList;
	blank_elem.setAttribute('hj-value', elem.textContent)
	elem.getElementsByClassName("playfield-piece-label")[0].textContent = blank_val;
	elem.classList = blank_classes;
	elem.setAttribute('hj-value', blank_val);
}

function clearValids(){
	var pieces = getAllGamePieces();
	for(var i=0; i <pieces.length; i++){
		var piece = pieces[i];
		piece.classList.toggle('valid', false); // remove valid class
	}
}

function setValids(blank_coords){
	var valid_coords = getValidMovesFromCoords(blank_coords);
	for(var i=0; i<valid_coords.length; i++){
		var elem = getElemByCoords(valid_coords[i]);
		elem.classList.add("valid");
	}
}

function getValidMovesFromCoords(coord_obj){
	var cCO = createCoordObj;
	var jumps = [
	  [-1, -2], 
	  [1,-2],
	  [-2,-1],
	  [2, -1],
	  [-2,1],
	  [2,1],
	  [-1,2],
	  [1,2]
	]
	var len_jumps = jumps.length;
	var moves = [];
	for(var i=0; i<len_jumps; i++){
		var jump = jumps[i];
		var possible_move = cCO(parseInt(coord_obj.x)+parseInt(jump[0]), parseInt(coord_obj.y)+parseInt(jump[1]));
		if(coordsWithinBounds(possible_move)){
			moves.push(possible_move);
		}
	}
	return moves
}

function coordsWithinBounds(coord_obj){
	result = true
	if(coord_obj.x < 0 || coord_obj.x >= 5){
		result = false
	}
	if(coord_obj.y < 0 || coord_obj.y >= 5){
		result = false
	}
	return result
}

function handleClick(){
	if(this.classList.contains("valid")){
	    swap(this);
	    clearValids();
	    setValids(getCoordsFromElem(getBlankElem()));
	}
}

function pieceLabel(text){
	var label = document.createElement("div");
	label.innerText = text;
	label.classList.add("playfield-piece-label");
	return label
}


function setUp(){
	var table = document.getElementsByClassName("playfield-contents")[0];
	var table_rows = [[],[],[],[],[]];
	var _cnt = 0;
	for(y=0; y<=4; y++){

		// var row = document.createElement("tr");

		for(x=0; x<=4; x++){
			_cnt++;
			var space = document.createElement("div");
			space.className = "playfield-space";
			var cell = document.createElement("div")
			if(_cnt == 25){
				_cnt = " ";

			}
			cell.setAttribute("hj-value",_cnt);
			cell.setAttribute("hj-pos-x", x);
			cell.setAttribute("hj-pos-y", y);
			cell.classList.add("playfield-piece");
			cell.onclick = handleClick;
			cell.appendChild(
				pieceLabel(_cnt.toString()
					)
				);
			space.appendChild(cell);
			table.appendChild(space);
		}
	}
	setValids(getCoordsFromElem(getBlankElem()));
}