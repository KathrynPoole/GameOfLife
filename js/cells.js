
function render(grid) {
	// draws grid based on the dataset World

	var row = svg.selectAll(".row")
			.data(World)
			.enter().append("g")
			.attr("class", "row");

	var column = row.selectAll(".cell")
				.data(function(d) { return d;})
				.enter().append("rect")
				.attr("class", "cell")
				.attr("x", function(d) {return d.xPos;})
				.attr("y", function(d) {return d.yPos;})
				.attr("width", cellSize)
				.attr("height", cellSize)
				.style("stroke", "white")
				.style("fill", function(d) {return colourScale(d.alive); })
				.on("click", function(d){ //on click, change state of cell and redraw grid instantly (no transition)
					d.alive ^= 1;
					updateFast();
				})
				.on("mouseover", function(d) { //changes colour to green on mouseover
					d3.select(this)
					.style("fill", colourScale(1));
				})                  
				.on("mouseout", function(d) { //reverts to original colour on mouseout
					d3.select(this).style("fill", function(d) {return colourScale(d.alive);});
				});
}

function generateGrid() { //generate empty world

	var data = [];
	var xPos = 10;
	var yPos = 10;

	for (var row = 0; row < nGrid; row++ ) {
		data.push( new Array());

		for (var col = 0; col < nGrid; col++) {
			data[row].push({
				xPos: xPos,
				yPos: yPos,
				alive: 0,
			})
			xPos += cellSize;
		}
		xPos = 10;
		yPos += cellSize;
	}
	return data;
} 



function updateFast() { //redraws grid instantly, updating colours for alive/dead cells
	d3.select("#grid")
	.selectAll(".row")
	.data(World)
	.selectAll(".cell")
	.data(function(d) {return d;})
	.style("fill", function(d) {return colourScale(d.alive); });
}

function update() { //redraws grid with smooth transition (for animation)
	d3.select("#grid")
	.selectAll(".row")
	.data(World)
	.selectAll(".cell")
	.data(function(d) {return d;})
	.transition().duration(500)
	.style("fill", function(d) {return colourScale(d.alive); });
}

function tick() { 
	World = createNewWorld(World);
	update();
	ticks += 1;
	document.getElementById("counter").innerHTML = ticks;
}

function buttonPress() {
	if (gameOn == 0) {
		game = setInterval( function() { tick(); }, 500);
		gameOn = 1;
		document.getElementById("go-stop").innerHTML = "Stop";
	} else if (gameOn == 1) {
		clearInterval(game);
		document.getElementById("go-stop").innerHTML = "Go";
		gameOn = 0;
	}
}

function reset() {
	if (gameOn == 1) {
		gameOn = 0;
		clearInterval(game);
		document.getElementById("go-stop").innerHTML = "Go";
	}
		
	World = generateGrid();
	update();
	ticks = 0;
	document.getElementById("counter").innerHTML = 0
	
}


function checkAlive(World, i, j) {
// checks whether a cell a) exists and b) is alive
	if (typeof World[i] == "undefined" || typeof World[i][j] == "undefined") {
		return 0;
	} else {
		return World[i][j].alive;
	}
}

function aliveNeighbours(World, i, j) {
//counts the number of alive neighbours of a given cell

var neighbourCount = 0;

	neighbourCount += checkAlive(World, i-1, j-1);
	neighbourCount += checkAlive(World, i-1, j);
	neighbourCount += checkAlive(World, i-1, j+1);
	neighbourCount += checkAlive(World, i, j-1);
	neighbourCount += checkAlive(World, i, j+1);
	neighbourCount += checkAlive(World, i+1, j-1);
	neighbourCount += checkAlive(World, i+1, j);
	neighbourCount += checkAlive(World, i+1, j+1);

	return neighbourCount;

}

function nextState(World, i, j){ //generates the next state of a given cell for the next tick
	if (World[i][j].alive == 1) {
		if (aliveNeighbours(World, i, j) == 2 || aliveNeighbours(World, i, j) == 3 ){
			return 1;
		} else { 
			return 0; 
			}
		} else if (aliveNeighbours(World, i, j) == 3) {
			return 1;
			} else { 
				return 0;
			}
}

function createNewWorld(World) { //creates a grid of the next world
	var newWorld = generateGrid();
	for (var i = 0; i < nGrid; i++ ) {
		for (var j = 0; j < nGrid; j++ ){
			newWorld[i][j].alive = nextState(World, i, j);
		}
	}
	return newWorld;
}