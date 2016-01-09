/* Puzzle Solver
 * Corey Shuman
 * 11/23/15
 *
 */

var testMaze = [
	[1,1,1,1,0,0],
	[1,0,0,0,0,1],
	[1,1,1,1,0,1],
	[0,0,0,0,0,0],
	[1,1,1,0,1,1],
	[0,0,0,0,1,1]
];
var testMaze2 = [
	['+','-','-','-','e','+'],
	['|',' ',' ',' ',' ','|'],
	['|',' ','-','-','-','|'],
	['|',' ',' ',' ',' ','|'],
	['|','-','-','-',' ','|'],
	['|',' ',' ',' ',' ','|'],
	['|',' ','-',' ','-','|'],
	['+','s','-','-','-','+']
];

var testMaze3 = [
	['+','#','#','#','#','#','#','#','#','+'],
	['|',' ',' ',' ',' ',' ',' ',' ',' ','|'],
	['|',' ','#','#','#','#','#',' ','#','|'],
	['|',' ',' ','#','#',' ',' ',' ',' ','|'],
	['e',' ','#','#',' ',' ','#','#','#','|'],
	['|','#',' ',' ',' ','#','#',' ',' ','|'],
	['|',' ',' ','#',' ',' ',' ',' ','#','|'],
	['+','s','#','#','#','#','#','#','#','+']
];

var MAZE = [];

/* MazeBuilder()
 *
 * input: table - ref to empty table element
 *		  maze - ref to empty array to save maze into
 *
 */
var MazeBuilder = function(_table, _maze) {
	var _hasStart = true;
	var _hasEnd = true;
	var self = this;
	
	var cellState = {
		SOLID: '#',
		CLEAR: ' ',
		START: 'S',
		END: 'E'
	};
	
	// convert from array index to location index or vice versa (location is bottom left to top right)
	this.convertMazeIndex = function(maze, p) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var ret = new Point(0,0);
		ret.x = mHeight - p.x - 1;
		ret.y = p.y;
		return ret;
	}
	
	this.clearMazeTable = function(table) {
		var tableRows = table.getElementsByTagName('tr');
		var rowCount = tableRows.length;

		for (var x=rowCount-1; x>=0; x--) {
		   table.deleteRow(-1);
		}	
	}

	this.drawMazeTable = function(table, maze) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		
		self.clearMazeTable(table);
		
		for(var j = 0; j<mHeight; j++) {
			var row = table.insertRow(-1);
			for(var k = 0; k < mWidth; k++) {
				var cell = row.insertCell(-1);
				cell.setAttribute("id", "c_"+j+"_"+k);
				if(maze[j][k] === ' ') {
					cell.setAttribute("class", "mazeClear");
				} else if(maze[j][k].toUpperCase() === 'S') {
					cell.setAttribute("class", "mazeStart");
				} else if(maze[j][k].toUpperCase() === 'E') {
					cell.setAttribute("class", "mazeEnd");
				} else {
					cell.setAttribute("class", "mazeSolid");
				}
			}
		}
	}
	
	this.fixInvalidCells = function(maze) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		
		for(var j = 0; j<mHeight; j++) {
			for(var k = 0; k < mWidth; k++) {
				var val = maze[j][k].toUpperCase();
				var edge = (j === 0 || j === mHeight-1 || k === 0 || k === mWidth - 1);
				if( val === cellState.START && !edge ) {
					maze[j][k] = cellState.CLEAR;
					_hasStart = false;
				} else if(val === cellState.END && !edge) {
					maze[j][k] = cellState.CLEAR;
					_hasEnd = false;
				}
			}
		}
	}
	
	// mazeAddColumn() - adds a column to end of maze array
	// input: mazeArray
	//
	// Note: this modifies the original array (input array)
	this.mazeAddColumn = function(maze) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var newMaze = new Array(mHeight);
		for( var i = 0; i<mHeight; i++) {
			newMaze[i] = new Array(mWidth+1);
		}
		
		for( var j = 0; j < mHeight; j++) {
			for( var k = 0; k < mWidth; k++) {
				newMaze[j][k] = maze[j][k];
			}
			newMaze[j][mWidth] = cellState.SOLID;	// add new column cell
		}
		
		// copy new maze to original
		for( var i = 0; i<mHeight; i++) {
			maze[i] = new Array(mWidth+1);
		}
		for( var j = 0; j < mHeight; j++) {
			for( var k = 0; k < mWidth+1; k++) {
				maze[j][k] = newMaze[j][k];
			}
		}
	}
	
	// mazeAddRow() - adds a row to end of maze array
	// input: mazeArray
	//
	// Note: this modifies the original array (input array)
	this.mazeAddRow = function(maze) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		
		maze.push(new Array(mWidth));
		for( var i = 0; i<mWidth; i++) {
			maze[mHeight][i] = cellState.SOLID;
		}
	}
	
	this.callAddColumn = function(event) {
		self.mazeAddColumn(_maze);
		self.fixInvalidCells(_maze);
		self.drawMazeTable(_table, _maze);
	}
	
	this.callAddRow = function(event) {
		self.mazeAddRow(_maze);
		self.fixInvalidCells(_maze);
		self.drawMazeTable(_table, _maze);
	}
	
	this.callUseMaze = function(event) {
		// validate maze
		if(!_hasStart) return null;
		return _maze;
	}
	
	// table bubbled events handled here
	this.handleCellClick = function(event) {
		var mHeight = _maze.length;
		var mWidth = _maze[0].length;
		var el = event.target;
		var id = el.id;
		var x = NaN;
		var y = NaN;
		
		// get x and y value
		var s = id.substring(id.indexOf("_")+1);
		var firstNum = s.substring(0, s.indexOf("_"));
		var lastNum = s.substring(s.indexOf("_")+1);
		x = parseInt(firstNum);
		y = parseInt(lastNum);
		
		if(!isNaN(x) && !isNaN(y)) {
			// get array value then update
			var val = _maze[x][y].toUpperCase();
			var edge = (x === 0 || x === mHeight-1 || y === 0 || y === mWidth - 1);
			if(val === cellState.SOLID && !edge)
				_maze[x][y] = cellState.CLEAR;
			// only edge pieces can be start or end
			else if((val === cellState.CLEAR || val === cellState.SOLID) && edge && !_hasStart) {
				_maze[x][y] = cellState.START;
				_hasStart = true;
			}
			else if((val === cellState.START) && edge && !_hasEnd) {
				_maze[x][y] = cellState.END;
				_hasEnd = true;
				_hasStart = false;
			}
			else if((val === cellState.CLEAR || val === cellState.SOLID) && edge && !_hasEnd) {
				_maze[x][y] = cellState.END;
				_hasEnd = true;
			}
			else if(val === cellState.START) {
				_maze[x][y] = cellState.SOLID;
				_hasStart = false;
			}
			else if(val === cellState.END) {
				_maze[x][y] = cellState.SOLID;
				_hasEnd = false;
			}
			else
				_maze[x][y] = cellState.SOLID;
			
		}
		
		// update maze
		self.drawMazeTable(_table, _maze);
	}
	
	// init maze to some default
	_maze = [
		['#','s','#','#','#'],
		['#',' ','#','#','#'],
		['#',' ',' ',' ','#'],
		['#','#','#',' ','#'],
		['#','#','#','e','#'],
	];
	
	self.drawMazeTable(_table, _maze);
	// add event handler
	_table.addEventListener("click", self.handleCellClick, false);
}



var MazeSolver = function(onCompleteHandler) {
	var _actionStack = [];
	var _lastDir = -1;
	var _m = null;
	var _currLoc = 0;
	var _winLoc = 0;
	var _status = 1;
	var _running = false;
	var _runTimer = null;
	var _isInit = false;

	var self = this;
	var dir = {
		UP: 0,
		RIGHT: 1,
		DOWN: 2,
		LEFT: 3
	}
	
	var cellState = {
		SOLID: '#',
		CLEAR: ' ',
		START: 'S',
		END: 'E',
		MARK: '.',
		TRAIL: '-'
	};

	var Action = function(d) {
		this.direction = d;
		this.taken = false;
	}

	var Point = function(x,y) {
		this.x = x;
		this.y = y;
	}

	this.drawMaze = function(maze, currLoc)
	{
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var mazeOut = "";
		var p = self.getMazeIndex(maze, currLoc);
		
		for(var j = 0; j<mHeight; j++) {
			for(var k = 0; k < mWidth; k++) {
				if(j === p.x && k === p.y) {
					mazeOut += "A";
				} else {
					mazeOut += maze[j][k];
				}
			}
			mazeOut += "\r\n";
		}
		document.getElementById("mazeOut").innerHTML = mazeOut;
	}

	this.clearMazeTable = function() {
		var elmtTable = document.getElementById('mazeTable');
		var tableRows = elmtTable.getElementsByTagName('tr');
		var rowCount = tableRows.length;

		for (var x=rowCount-1; x>=0; x--) {
		   elmtTable.deleteRow(-1);
		}	
	}

	this.drawMazeTable = function(maze, currLoc) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var p = self.getMazeIndex(maze, currLoc);
		var t = document.getElementById("mazeTable");
		
		self.clearMazeTable();
		
		for(var j = 0; j<mHeight; j++) {
			var row = t.insertRow(-1);
			for(var k = 0; k < mWidth; k++) {
				var cell = row.insertCell(-1);
				if(j === p.x && k === p.y) {
					cell.setAttribute("class", "mazePlayer");
				} else if(maze[j][k].toUpperCase() === cellState.CLEAR) {
					cell.setAttribute("class", "mazeClear");
				} else if(maze[j][k].toUpperCase() === cellState.START) {
					cell.setAttribute("class", "mazeStart");
				} else if(maze[j][k].toUpperCase() === cellState.END) {
					cell.setAttribute("class", "mazeEnd");
				} else if(maze[j][k].toUpperCase() === cellState.MARK) {
					cell.setAttribute("class", "mazePath");
				} else if(maze[j][k].toUpperCase() === cellState.TRAIL) {
					cell.setAttribute("class", "mazeClear");
				} else {
					cell.setAttribute("class", "mazeSolid");
				}
			}
		}
	}

	// convert from array index to location index (location is bottom left to top right)
	this.getMazeIndex = function(maze, p) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var ret = new Point(0,0);
		ret.x = mHeight - p.x - 1;
		ret.y = p.y;
		return ret;
	}

	this.getLocationIndex = function(maze, p) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var ret = new Point(0,0);
		ret.x = mHeight - p.x - 1;
		ret.y = p.y;
		return ret;
	}

	this.findStart = function(maze) {
		return self.find(maze, 's');
	}

	this.findEnd = function(maze) {
		return self.find(maze, 'e');
	}

	// find() - finds character c in maze array
	// returns Point location of character
	this.find = function(maze, c) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var ret = new Point(1,0);
		var found = false;
		var j;
		var k;
		
		for(j = 0; j<mHeight; j++) {
			for(k = 0; k < mWidth; k++) {
				if(maze[j][k].toUpperCase() === c.toUpperCase()) {
					found = true;
					break;
				}
			}
			if(found) {
				ret.x = j;
				ret.y = k;
				break;
			}
		}
		return self.getLocationIndex(maze, ret);
	}


	// getNextDirections() - determine next available movements
	// output: array of Actions representing available directions
	// inputs: d is last direction, p is point representing current location
	this.getNextDirections = function(maze, d, p) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		var ret = [];
		var c;
		p = self.getMazeIndex(maze, p);

		for(var i=0; i<4; i++) {
			if( (d === dir.UP && i === dir.DOWN) || (d === dir.DOWN && i === dir.UP) ) continue;
			if( (d === dir.LEFT && i === dir.RIGHT) || (d === dir.RIGHT && i === dir.LEFT) ) continue;
			
			switch(i) {
				case dir.UP:
					if(p.x >= 1) {
						c = maze[p.x-1][p.y].toUpperCase();
						if(c === cellState.CLEAR || c === cellState.END) ret.push(new Action(i));
					}
					break;
				case dir.RIGHT:
					c = maze[p.x][p.y+1].toUpperCase();
					if(c === cellState.CLEAR || c === cellState.END) ret.push(new Action(i));
					break;
				case dir.DOWN:
					if(p.x < mHeight-1) {
						c = maze[p.x+1][p.y].toUpperCase();
						if(c === cellState.CLEAR || c === cellState.END) ret.push(new Action(i));
					}
					break;
				case dir.LEFT:
					c = maze[p.x][p.y-1].toUpperCase();
					if(c === cellState.CLEAR || c === cellState.END) ret.push(new Action(i));
					break;
			}
			
			if(c === cellState.END)
				break;
		}
		return ret;
	}
	
	this.mazeMarkLocation = function(m, loc, clear) {
		var p = self.getMazeIndex(m,loc);
		var val = m[p.x][p.y].toUpperCase();
		if(val !== cellState.START && val !== cellState.END)
			m[p.x][p.y] = clear ? cellState.TRAIL : cellState.MARK;
	}
	
	this.clearAllMazeMarks = function(maze) {
		var mHeight = maze.length;
		var mWidth = maze[0].length;
		
		for(var j = 0; j<mHeight; j++) {
			for(var k = 0; k < mWidth; k++) {
				if(maze[j][k].toUpperCase() === cellState.MARK || maze[j][k].toUpperCase() === cellState.TRAIL) {
					maze[j][k] = cellState.CLEAR;
				}
			}
		}
	}

	// mazeStep - calculate next move and return [location,status]
	// status = -1 no solution, 0 backtracking, 1 moving forward, 2 solved
	this.mazeStep = function(m, actionStack, lastDir, currLoc, winLoc, state) {
		var mHeight = m.length;
		var mWidth = m[0].length;
		var ret = 1;
		if(state === 0) {
			if(actionStack.length === 0) {
				self.log("NO SOLUTION");
				ret = -1;
			} else {
				var lastAction = actionStack.pop();
				switch(lastAction.direction) {
					case dir.UP: currLoc.x--; break;
					case dir.RIGHT: currLoc.y--; break;
					case dir.DOWN: currLoc.x++; break;
					case dir.LEFT: currLoc.y++; break;
				}
				// clear the marked location
				self.mazeMarkLocation(m, currLoc, true);
				if(actionStack.length === 0) {
					self.log("NO SOLUTION");
					ret = -1;
				}
				else if(actionStack[actionStack.length-1].taken === false) {
					self.log("Try next route");
					ret = 1;
				}
				else {
					self.log("keep backtracking");
					ret = 0;
				}
			}
		} else {
			if(actionStack.length == 0 || actionStack[actionStack.length-1].taken !== false) {
				var options = self.getNextDirections(m, lastDir, currLoc);
				if(options.length === 0) {
					self.log("backtrack");
					ret = 0;
				} else {
					actionStack.push(...options);
					ret = 1;
				}
			}
			
			if(ret === 1) {
				// take top action
				var nextAction = actionStack[actionStack.length-1];
				nextAction.taken = true;
				lastDir = nextAction.direction;
				// set current spot as "traveled"
				self.mazeMarkLocation(m, currLoc, false);
				switch(nextAction.direction) {
					case dir.UP: currLoc.x++; self.log("go up"); break;
					case dir.RIGHT: currLoc.y++; self.log("go right"); break;
					case dir.DOWN: currLoc.x--; self.log("go down"); break;
					case dir.LEFT: currLoc.y--; self.log("go left"); break;
				}
				if(currLoc.x === winLoc.x && currLoc.y === winLoc.y) {
					self.log("VICTORY!");
					ret = 2;
				} else {
					ret = 1;
				}
			}
		}
		if(ret === -1) {
			if(typeof onCompleteHandler === "function")
				onCompleteHandler(0);
			_running = false;
		} else if(ret === 2) {
			if(typeof onCompleteHandler === "function")
				onCompleteHandler(1);
			_running = false;
		}
			
		return [lastDir, ret];
	}

	// print to log
	this.log = function(str) {
		var old = document.getElementById("log").value;
		document.getElementById("log").value = str + "\r\n" + old;
	}

	// run mazeStep and redraw
	this.mazeTick = function(m, actionStack, lastDir, currLoc, winLoc, status) {
		var stepResult = self.mazeStep(m, actionStack, lastDir, currLoc, winLoc, status);
		self.log(currLoc.x + "," + currLoc.y);
		self.drawMaze(m, currLoc);
		self.drawMazeTable(m, currLoc);
		return stepResult;
	}
	
	this.runLoop = function() {
		if(_running) {
			self.callStep();
			_runTimer = setTimeout(self.runLoop, 200);
		}
		else {
		 _runTimer = null;
		}
	}
	
	this.callRun = function() {
		if(!_isInit) return false;
		_running = true;
		if(_status === -1 || _status === 2)
			self.callReset();
		self.runLoop();
		return true;
	}
	
	this.callPause = function() {
		if(!_isInit) return false;
		if(_running) {
			_running = false;
		}
		return true;
	}
	
	this.callReset = function() {
		self.clearAllMazeMarks(_m);
		self.init();
	}
	
	this.callStep = function() {
		if(!_isInit) return false;
		if(_status !== -1 && _status !== 2) {
			var stepResult = self.mazeTick(_m, _actionStack, _lastDir, _currLoc, _winLoc, _status);
			// update local static variables
			_status = stepResult[1];
			_lastDir = stepResult[0];
		}
		return true;
	}
	
	this.callSetMaze = function(maze) {
		console.log(maze.length)
		_m = new Array(maze.length);
		for(var i = 0; i < _m.length; i++)
			_m[i] = new Array(maze[0].length);

		for(var j=0;j<_m.length;j++) {
			for(var k=0;k<_m[0].length;k++) {
			 _m[j][k] = maze[j][k];
			}
		}

		self.init();
	}
	
	// run initialization code here
	this.init = function() {
		_currLoc = self.findStart(_m);
		_winLoc = self.findEnd(_m);
		self.drawMaze(_m, _currLoc);
		self.drawMazeTable(_m, _currLoc);
		_actionStack = [];
		_lastDir = -1;
		_status = 1;
		_isInit = true;
	}
}

var mazeSolver = new MazeSolver(function(status){
	// on maze complete, reset run button and output status
	document.getElementById("btnRun").innerHTML = "Run";
	if(status === 1)
		document.getElementById("statusText").innerHTML = "Maze Completed";
	else
		document.getElementById("statusText").innerHTML = "Maze cannot be solved.";
});
var mazeBuilder = new MazeBuilder(document.getElementById('mazeDrawTable'), MAZE);
(function() {
	document.getElementById("btnAddCol").onclick = function(e) {
		mazeBuilder.callAddColumn();
	};
	
	document.getElementById("btnAddRow").onclick = function(e) {
		mazeBuilder.callAddRow();
	};
	
	document.getElementById("btnStep").onclick = function(e) {
		mazeSolver.callStep();
	};
	
	document.getElementById("btnReset").onclick = function(e) {
		mazeSolver.callReset();
	};
	
	document.getElementById("btnClearLog").onclick = function(e) {
		document.getElementById("log").value = "";
	};
	
	document.getElementById("btnUseMaze").onclick = function(e) {
		var maze = mazeBuilder.callUseMaze();
		if(maze) {
			mazeSolver.callSetMaze(maze);
		} else {
			document.getElementById("statusText").innerHTML = "Error setting maze.";
		}
	};
	
	document.getElementById("btnRun").onclick = function(e) {
		var r = "Run";
		var s = "Stop";
		if(this.innerHTML === r) {
			if(mazeSolver.callRun()) {
				this.innerHTML = s;
				document.getElementById("statusText").innerHTML = "Running...";
			} else {
				document.getElementById("statusText").innerHTML = 'Please select "Use Maze" first.';
			}
			
		} else {
			this.innerHTML = r;
			mazeSolver.callPause();
			document.getElementById("statusText").innerHTML = "Stopped.";
			document.getElementById("statusText").innerHTML = "Stopped.";
		}
	};

})();



