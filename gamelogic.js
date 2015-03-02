function getBlankElem(){
	return document.querySelector("[hj-value=\" \"]");
}

function getAllGamePieces(){
	return document.getElementsByClassName("gamePiece");
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
	for(var i=0; i<iterations; i++){
		var valids = getAllValidElems();
		var valid = valids[Math.floor(Math.random()*valids.length)];
		getElemByCoords(valid).click();
	}
}

function reset(){
	var table_elem = document.getElementsByTagName("table")[0]
	table_elem.innerHTML = "";
	setUp();
}

function swap(elem){
	var blank_elem = getBlankElem();
	var blank_val = blank_elem.textContent;
	var blank_classes = blank_elem.classList;
	blank_elem.textContent = elem.textContent;
	blank_elem.classList = elem.classList;
	blank_elem.setAttribute('hj-value', elem.textContent)
	elem.textContent = blank_val;
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

function setUp(){
	var table = document.getElementsByTagName("table")[0];
	var table_rows = [[],[],[],[],[]];
	var _cnt = 0;
	for(y=0; y<=4; y++){

		var row = document.createElement("tr");

		for(x=0; x<=4; x++){
			_cnt++;
			var cell = document.createElement("td");
			if(_cnt == 25){
				_cnt = " ";

			}
			cell.setAttribute("hj-value",_cnt);
			cell.setAttribute("hj-pos-x", x);
			cell.setAttribute("hj-pos-y", y);
			cell.classList.add("gamePiece");
			cell.classList.add("circle");
			cell.onclick = handleClick;
			cell.appendChild(document.createTextNode(_cnt.toString()));
			row.appendChild(cell);
			table_rows[y].push(cell);
		}
		table.appendChild(row);
	}
	setValids(getCoordsFromElem(getBlankElem()));
	return table_rows;
}

setUp();