document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error;
    deployBombs(numberOfBombs);
    tableCreate();
});

const numberOfBombs = 35;
const arrayDim = 12;


// Create one dimensional array
var gameBoardArray = new Array(arrayDim);
// Loop to create 2D array using 1D array
for (var i = 0; i < gameBoardArray.length; i++) {
    gameBoardArray[i] = new Array(arrayDim);
}
  
// Loop to initialize 2D array elements.
for (var i = 0; i < arrayDim; i++) {
    for (var j = 0; j < arrayDim; j++) {
        gameBoardArray[i][j] = 0;
    }
}

// Deploy bombs in table
function deployBombs(numberOfBombs) {
    for (var i = 1; i < arrayDim - 1 && numberOfBombs > 0; i++) {
        for (var j = 1; j < arrayDim - 1 && numberOfBombs > 0; j++) {
            if (gameBoardArray[i][j] != 1 && placeBomb()) {
                gameBoardArray[i][j] = 1;
                --numberOfBombs;
            }            
        }
    }
    if (numberOfBombs) { // if not all bombs deployed
        deployBombs(numberOfBombs);
    }
}

// Decide if a table cell shall hold a bomb or not based on a given probability
function placeBomb() {
    let notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1]; // Here I decide the probability of 0's or 1's. 
    let id = Math.floor(Math.random() * notRandomNumbers.length);
    return notRandomNumbers[id];
}

// Counts the bombs all around a given cell
function countNeighbourBombs(i, j) {
    let counter = 0;
    if (i > 0 && j > 0) {
        if (gameBoardArray[i][j + 1]) {
            counter++;
        }
        if (gameBoardArray[i - 1][j + 1]) {
            counter++;
        }
        if (gameBoardArray[i - 1][j - 1]) {
            counter++;
        }
        if (gameBoardArray[i + 1][j - 1]) {
            counter++;
        }
        if (gameBoardArray[i + 1][j + 1]) {
            counter++;
        }
        if (gameBoardArray[i - 1][j]) {
            counter++;
        }
        if (gameBoardArray[i][j - 1]) {
            counter++;
        }
        if (gameBoardArray[i + 1][j]) {
            counter++;
        }
    }
    return counter;
}

// create the HTML table
function tableCreate() {
    const body = document.body,
        table = document.createElement('table');

    for (let i = 1; i <= arrayDim - 2; i++) {
        const tr = table.insertRow();
        for (let j = 1; j <= arrayDim - 2; j++) {
            const td = tr.insertCell();
            td.setAttribute("id", i * 10 + j);
            td.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                addFlag(i, j);
            }, { once: true }); // added so that this event listener only executes once and ads a flag
            td.setAttribute("onclick", `leftClick(${i}, ${j})`);

        }
    }
    body.appendChild(table);
}

// add a flag on HTML table on right click
function addFlag(i, j) {
    gameBoardArray[i][j] = 0;
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    var image = document.createElement("img");
    image.src = "assets/icons/flag.png";
    tableCellId.appendChild(image);
}

// add a bomb on HTML table
function addBomb(i, j) {
    console.log(`left click on ${i} ${j}`);
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    tableCellId.style.background = "red";
    var image = document.createElement("img");
    image.src = "assets/icons/bomb.png";
    tableCellId.appendChild(image);
}

// add the number of adiacent cells that hav a bomb on HTML table
function addNumber(i, j) {
    let number = countNeighbourBombs(i, j);
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    tableCellId.style.background = "white";
    tableCellId.innerText = number;
}

// test game conditions when left click is detected
function leftClick(i, j) {
    console.log("left click detected " + i + " " + j);
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    tableCellId.setAttribute("onclick", "");
    if (gameBoardArray[i][j] == 1) {
        addBomb(i, j);
    } else {
        addNumber(i, j);
    } 
}
  