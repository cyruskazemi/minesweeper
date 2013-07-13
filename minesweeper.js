/*------------------------------------------------------------*/
/* Minesweeper recreation in JavaScript by Cyrus Kazemi
/* Parts of this code borrowed from Eloquent Javascript
/* http://eloquentjavascript.net/
/*------------------------------------------------------------*/

var parameters = {
	BOARD_WIDTH : 8,
	BOARD_HEIGHT : 8,
	INITIAL_MINES : 10,
	MINE_TILE : '*',
	EMPTY_TILE : ' ',
	TILE_WIDTH : 28
};

function update_parameters() {
	var width = parseInt($('#BOARD_WIDTH').val());
	var height = parseInt($('#BOARD_HEIGHT').val());
	var mines = parseInt($('#INITIAL_MINES').val());
	if (typeof width !== "number" ||
		typeof height !== "number" ||
		typeof mines !== "number" ||
		isNaN(width) ||
		isNaN(height) ||
		isNaN(mines) ||
		width < 1 ||
		height < 1 ||
		mines < 1) {
		alert('Please enter positive numeric values');
		return false;
	} else {
		if(mines > width * height) {
			alert('Too many mines. Please choose a smaller amount');
		} else {
			parameters.BOARD_WIDTH = width;
			parameters.BOARD_HEIGHT = height;
			parameters.INITIAL_MINES = mines;
			$('#tiles').width((width + 1) * parameters.TILE_WIDTH);
			return true;
		}	
	}
}

/*--------------------*/
/* Point & Directions
/*--------------------*/

function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.add = function(other) {
	return new Point(this.x + other.x, this.y + other.y);
};

Point.prototype.get_index = function() {
	return this.x + this.y * parameters.BOARD_WIDTH;
}

var directions = {
	'n'  : new Point( 0, -1),
	'ne' : new Point( 1, -1),
	'e'  : new Point( 1,  0),
	'se' : new Point( 1,  1),
	's'  : new Point( 0,  1),
	'sw' : new Point(-1,  1),
	'w'  : new Point(-1,  0),
	'nw' : new Point(-1, -1)
};

/*--------------------*/
/* Game
/*--------------------*/

function MinesweeperGame() {
	update_parameters();
	this.game_in_play = true;
	this.board = new MinesweeperBoard(parameters.BOARD_WIDTH, parameters.BOARD_HEIGHT, parameters.INITIAL_MINES);
}

MinesweeperGame.prototype.validate = function() {
	var message = "You lost :( Press New Game to try again.";
	if(!this.game_in_play)
		message = "Current game is over. Please start a new game.";
	else if(this.board.check_complete())
		message = "You won! Congrats dawg.";
	this.game_in_play = false;
	alert(message);
};

MinesweeperGame.prototype.cheat = function() {
	this.board.show_mines();
};

MinesweeperGame.prototype.processMove = function(dom_tile) {
	var index = parseInt(dom_tile.id);
	var point = new Point(Math.floor(index % this.board.width), Math.floor(index / this.board.height));
	var tile = this.board.tile_at(point);
	var content = tile.get_content();

	//check adjacent tiles with mines
	if(!tile.has_mine()) {		
		var adjacent_tile_points = this.get_adjacent_tiles(point);		
		var mine_count = this.get_adjacent_mine_count(adjacent_tile_points);		
		if(mine_count == 0) {
			for(adjacent_tile in adjacent_tile_points) {
				current_tile = this.board.tile_at(adjacent_tile_points[adjacent_tile]);
				current_tile.clicked = true;
				$('#' + adjacent_tile_points[adjacent_tile].get_index() + '_tile').addClass('clicked');
			}						
		}
		content = mine_count;	
	}

	// Update tile state
	tile.clicked = true;
	$(dom_tile).addClass('clicked');
	$(dom_tile).text(content);


	// End game if mine was uncovered
	if(tile.has_mine()) {
		alert('BOOM! You lost :( Press New Game to try again.');
		this.stop_game();
	}	
};

MinesweeperGame.prototype.stop_game = function() {
	this.game_in_play = false;
};

MinesweeperGame.prototype.get_adjacent_tiles = function(point) {
	var adjacent_tile_points = [];
	for(var direction in directions) {
		var current_point = point.add(directions[direction]);
		if(this.board.within_boundaries(current_point)) {
			adjacent_tile_points.push(current_point);
		}
	}
	return adjacent_tile_points;
}

MinesweeperGame.prototype.get_adjacent_mine_count = function(adjacent_tile_points) {
	var adjacent_mines = 0;
	for(var current_point in adjacent_tile_points) {
		if(this.board.tile_at(adjacent_tile_points[current_point]).get_content() == '*') {
			adjacent_mines++;
		}
	}
	return adjacent_mines;
};

/*--------------------*/
/* Board
/*--------------------*/

function MinesweeperBoard(width, height, mines) {
	this.width = width;
	this.height = height;
	this.tiles = new Array(this.width * this.height);

	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			var index = x + y * this.width;
			this.tiles[index] = new MinesweeperTile(parameters.EMPTY_TILE);
			$('#tiles').append('<span class="tile" id="' + index + '_tile">&nbsp;</span>');
		}
	}

	// Put outside of inital loop to better distribute mines
	while(mines > 0) {
		var index = Math.floor(Math.random() * this.tiles.length);
		if(this.tiles[index].get_content() != parameters.MINE_TILE) {
			this.tiles[index].set_content(parameters.MINE_TILE);
			mines--;
		}
	}
}

MinesweeperBoard.prototype.tile_at = function(point) {
	return this.tiles[point.x + this.width * point.y];
};

MinesweeperBoard.prototype.check_complete = function() {
	for(i = 0; i < this.tiles.length; i++) {
		if(this.tiles[i].clicked == false && this.tiles[i].get_content() == parameters.EMPTY_TILE) {
			return false;
		}			
	}
	return true;
};

MinesweeperBoard.prototype.show_mines = function() {
	var tiles = this.tiles;
	for(i = 0; i < tiles.length; i++) {
		if(tiles[i].clicked == false && tiles[i].get_content() == parameters.MINE_TILE) {
			$('#'+i+'_tile').text(tiles[i].get_content());
		}			
	}
};

MinesweeperBoard.prototype.within_boundaries = function(point) {
	return point.x >= 0 && point.y >= 0 && point.x < this.width && point.y < this.height;
};

/*--------------------*/
/* Tile
/*--------------------*/

function MinesweeperTile(content) {
	this.content = content;
	this.clicked = false;
}

MinesweeperTile.prototype.has_mine = function() {
	return this.content == '*';
};

MinesweeperTile.prototype.set_content = function(content) {
	this.content = content;
};

MinesweeperTile.prototype.get_content = function() {
	return this.content;
};

/*--------------------*/
/* Load game
/*--------------------*/

$(document).ready(function() {
	// Initialize game
	window.minesweeper = new MinesweeperGame();

	// Set up interactions
	$('#tiles').on('click', '.tile', function(){
		if(window.minesweeper.game_in_play)
			window.minesweeper.processMove(this);		
	});

	$('#new_game').on('click', function(){
		if(update_parameters()) {
			$('#tiles').empty();
			window.minesweeper = new MinesweeperGame();
		}
	});

	$('#smiley').on('click', function(){
		window.minesweeper.validate();
	});

	$('body').keyup(function(e) {
		// Press space to cheat
		if(e.keyCode == 32)
		   window.minesweeper.cheat();
	});
});
