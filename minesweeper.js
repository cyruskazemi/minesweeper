/*------------------------------------------------------------*/
/* Minesweeper recreation in JavaScript by Cyrus Kazemi
/* Parts of this code borrowed from Eloquent Javascript
/* http://eloquentjavascript.net/
/*------------------------------------------------------------*/

var constants = {
	BOARD_WIDTH : 8,
	BOARD_HEIGHT : 8,
	INITIAL_MINES : 10,
	BOMB_TILE : '*',
	EMPTY_TILE : ' '
};

function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.add = function(other) {
	return new Point(this.x + other.x, this.y + other.y);
};

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
	this.board = new MinesweeperBoard(constants.BOARD_WIDTH, constants.BOARD_HEIGHT, constants.INITIAL_MINES);
}

MinesweeperGame.prototype.validate = function() {
	var message = "You lost :( Press New Game to try again.";
	if(this.board.check_complete())
		message = "You won! Congrats dawg.";
	alert(message);
};

MinesweeperGame.prototype.cheat = function() {
	this.board.show_bombs();
};

MinesweeperGame.prototype.processMove = function(index) {
	var point = new Point(Math.floor(index % this.board.width), Math.floor(index / this.board.height));
	var tile = this.board.value_at(point);
	var content = tile.get_content();
	if (!tile.has_bomb()) {
		//check adjacent tiles with bombs
		var adjacent_tile_indexes = this.get_adjacent_tiles(point);		
		var bomb_count = this.get_adjacent_bomb_count(adjacent_tile_indexes);
		
		if(bomb_count == 0) {
			content = bomb_count;
			tile.clicked = true;
			tile.image = 'empty';
			for(adjacent_tile in adjacent_tile_indexes) {
				this.board.tiles[adjacent_tile].clicked = true;
				this.board.tiles[adjacent_tile].image = 'empty';
			}				
		} 	
	} else {
		console.log('BOMB! ' + content);
	}
	return content;
};

MinesweeperGame.prototype.get_adjacent_tiles = function(point) {
	var adjacent_tile_points = [];
	for(var direction in directions) {
		var current_point = point.add(directions[direction]);
		console.log(directions[direction]);
		if(this.board.within_boundaries(current_point)) {
			adjacent_tile_points.push(current_point);
		}
	}
	console.log('tiles adjacent to ' + point.x + ',' + point.y + ': ' + adjacent_tile_points.toString());
	return adjacent_tile_points;
}

MinesweeperGame.prototype.get_adjacent_bomb_count = function(adjacent_tile_points) {
	var adjacent_bombs = 0;
	for(var current_point in adjacent_tile_points) {
		if(this.board.value_at(adjacent_tile_points[current_point]).get_content() == '*') {
			adjacent_bombs++;
		}
	}
	return adjacent_bombs;
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
			this.tiles[index] = new MinesweeperTile(constants.EMPTY_TILE);
			$('#tiles').append('<span class="tile" id="' + index + '_tile">&nbsp;</span>');
		}		
	}

	// Put outside of inital loop to better distribute bombs
	while(mines > 0) {
		var index = Math.floor(Math.random() * this.tiles.length);
		if(this.tiles[index].get_content() != constants.BOMB_TILE) {
			this.tiles[index].set_content(constants.BOMB_TILE);
			mines--;
		}
	}
}

MinesweeperBoard.prototype.value_at = function(point) {
	return this.tiles[point.x + this.width * point.y];
};

MinesweeperBoard.prototype.check_complete = function() {
	for(i = 0; i < this.tiles.length; i++) {
		console.log(this.tiles[i].clicked + ' ' + this.tiles[i].get_content());
		if(this.tiles[i].clicked == false && this.tiles[i].get_content() == 'empty') {
			console.log('empty found');
			return false;
		}			
	}
	return true;
};

MinesweeperBoard.prototype.show_bombs = function() {
	var tiles = this.tiles;
	for(i = 0; i < tiles.length; i++) {
		if(tiles[i].clicked == false && tiles[i].get_content() == constants.BOMB_TILE) {
			console.log('bomb at ' + i);
			$('#'+i+'_tile').text(tiles[i].get_content())
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

MinesweeperTile.prototype.has_bomb = function() {
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
	$('.tile').on('click', function(){
		$(this).addClass('clicked');
		$(this).text(minesweeper.processMove(parseInt(this.id)));
	});

	$('#new_game').on('click', function(){
		$('#tiles').empty();
		window.minesweeper = new MinesweeperGame();
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
