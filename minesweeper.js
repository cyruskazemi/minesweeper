function MinesweeperGame(board_length, initial_mines) {
	this.new_game(board_length, initial_mines);
}

function MinesweeperGame() {
	this.new_game(8, 10);
}

MinesweeperGame.prototype.new_game = function() {
	this.board = new MinesweeperBoard(board_length, initial_mines);
};

MinesweeperGame.prototype.validate = function() {
	this.board.check_complete();
};

MinesweeperGame.prototype.cheat = function() {
	this.board.show_bombs();

};

function MinesweeperBoard(BOARD_SIZE, INITIAL_MINES) {
	this.tiles = [];

	for(var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
		tiles.push(new MinesweeperTile('empty'));
	}

	// Put outside of inital loop to better distribute bombs
	var mines_left = INITIAL_MINES;
	while(mines_left > 0) {
		var index = Math.floor(Math.random() * tiles.length);
		if(tiles[index].content != 'bomb') {
			tiles[index] = 'bomb';
			mines_left--;
		}
	}
}

MinesweeperBoard.prototype.check_complete = function() {
	for(i = 0; i < this.tiles.length; i++) {
		if(this.tiles[i].clicked == false && this.content == 'empty') 
			return false;
	}
	return true;
};

MinesweeperBoard.prototype.show_bombs = function() {
	for(i = 0; i < this.tiles.length; i++) {
		if(this.clicked == 'false' && this.content == 'bomb')
			this.image = 'bomb';
	}
};

function MinesweeperTile(content) {
	this.content = content;
	this.clicked = false;
	this.image = 'uncovered';
}

MinesweeperTile.prototype.click = function() {
	if(this.has_bomb()) {
		this.image = 'bomb';
		//end game
	} else {
		//check adjacent tiles with bombs
		/*
		if(adjacent tiles with bombs = 0)
			this.clicked = true
			this.image = empty
			each(adjacent_tile)
				adjacent_tile.clicked = true
				adjacent_tile.image = empty
		*/
		if(this.get_adjacent_bomb_count() == 0) {

		}
	}
};

MinesweeperTile.prototype.has_bomb = function() {
	return this.content == 'bomb';
}

MinesweeperTile.prototype.get_adjacent_bomb_count = function() {

}
	