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

var dir = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3
}

var Action = function(d) {
	this.direction = d;
	this.taken = false;
}

var Point = function(x,y) {
	this.x = x;
	this.y = y;
}

function drawMaze(maze, currLoc)
{
	var mHeight = maze.length;
	var mWidth = maze[0].length;
	var mazeOut = "";
	var p = getMazeIndex(maze, currLoc);
	
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

function getMazeIndex(maze, p) {
	var mHeight = maze.length;
	var mWidth = maze[0].length;
	var ret = new Point(0,0);
	ret.x = mHeight - p.x - 1;
	ret.y = p.y;
	return ret;
}

function getLocationIndex(maze, p) {
	var mHeight = maze.length;
	var mWidth = maze[0].length;
	var ret = new Point(0,0);
	ret.x = mHeight - p.x - 1;
	ret.y = p.y;
	return ret;
}

function findStart(maze) {
	return find(maze, 's');
}

function findEnd(maze) {
	return find(maze, 'e');
}

function find(maze, c) {
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
	return getLocationIndex(maze, ret);
}


// getNextDirections() - d is last direction, p is point representing current location
function getNextDirections(maze, d, p) {
	var mHeight = maze.length;
	var mWidth = maze[0].length;
	var ret = [];
	var t = ' ';
	var e = 'E';
	var c;
	p = getMazeIndex(maze, p);

	for(var i=0; i<4; i++) {
		if( (d === dir.UP && i === dir.DOWN) || (d === dir.DOWN && i === dir.UP) ) continue;
		if( (d === dir.LEFT && i === dir.RIGHT) || (d === dir.RIGHT && i === dir.LEFT) ) continue;
		
		switch(i) {
			case dir.UP:
				if(p.x >= 1) {
					c = maze[p.x-1][p.y].toUpperCase();
					if(c === t || c === e) ret.push(new Action(i));
				}
				break;
			case dir.RIGHT:
				c = maze[p.x][p.y+1].toUpperCase();
				if(c === t || c === e) ret.push(new Action(i));
				break;
			case dir.DOWN:
				if(p.x < mHeight-1) {
					c = maze[p.x+1][p.y].toUpperCase();
					if(c === t || c === e) ret.push(new Action(i));
				}
				break;
			case dir.LEFT:
				c = maze[p.x][p.y-1].toUpperCase();
				if(c === t || c === e) ret.push(new Action(i));
				break;
		}
	}
	return ret;
}

// ret = -1 no solution, 0 backtracking, 1 moving forward, 2 solved
function mazeStep(m, actionStack, lastDir, currLoc, winLoc, state) {
	var mHeight = m.length;
	var mWidth = m[0].length;
	var ret = 1;
	if(state === 0) {
		if(actionStack.length === 0) {
			log("NO SOLUTION");
			ret = -1;
		} else {
			var lastAction = actionStack.pop();
			switch(lastAction.direction) {
				case dir.UP: currLoc.x--; break;
				case dir.RIGHT: currLoc.y--; break;
				case dir.DOWN: currLoc.x++; break;
				case dir.LEFT: currLoc.y++; break;
			}
			if(actionStack.length === 0) {
				log("NO SOLUTION");
				ret = -1;
			}
			else if(actionStack[actionStack.length-1].taken === false) {
				log("Try next route");
				ret = 1;
			}
			else {
				log("keep backtracking");
				ret = 0;
			}
		}
	} else {
		if(actionStack.length == 0 || actionStack[actionStack.length-1].taken !== false) {
			var options = getNextDirections(m, lastDir, currLoc);
			if(options.length === 0) {
				log("backtrack");
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
			switch(nextAction.direction) {
				case dir.UP: currLoc.x++; log("go up"); break;
				case dir.RIGHT: currLoc.y++; log("go right"); break;
				case dir.DOWN: currLoc.x--; log("go down"); break;
				case dir.LEFT: currLoc.y--; log("go left"); break;
			}
			console.log(winLoc)
			if(currLoc.x === winLoc.x && currLoc.y === winLoc.y) {
				log("VICTORY!");
				ret = 2;
			} else {
				ret = 1;
			}
		}
	}
	return [lastDir, ret];
}

function log(str) {
	var old = document.getElementById("log").value;
	document.getElementById("log").value = str + "\r\n" + old;
}

(function() {
	var actionStack = [];
	var lastDir = -1;
	var m = testMaze3;
	var currLoc = findStart(m);
	var winLoc = findEnd(m);
	
	var status = 1;
	
	document.getElementById("btnStep").onclick = function() {
		if(status !== -1 && status !== 2) {
			var stepResult = mazeStep(m, actionStack, lastDir, currLoc, winLoc, status);
			status = stepResult[1];
			lastDir = stepResult[0];
			log(currLoc.x + "," + currLoc.y);
			drawMaze(m, currLoc);
		}
	};
	
	drawMaze(m, currLoc);

})();



