document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error;
    var numberOfBombs = 35;
    populateArrayWithBombs(numberOfBombs);
    showMatrix(); 
});

// Create one dimensional array
var gfg = new Array(10);
  
document.write("Creating 2D array <br>");
  
// Loop to create 2D array using 1D array
for (var i = 0; i < gfg.length; i++) {
    gfg[i] = new Array(10);
}
  
var h = 0;
  
// Loop to initialize 2D array elements.
for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
        gfg[i][j] = h;
    }
}
  
// Loop to display the elements of 2D array. 
for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++)    {
        document.write(gfg[i][j] + " ");
    }
    document.write("<br>");
}

function populateArrayWithBombs(numberOfBombs) {
    for (var i = 0; i < 10 && numberOfBombs > 0; i++) {
        for (var j = 0; j < 10 && numberOfBombs > 0; j++) {
            if (gfg[i][j] != 1 && placeBomb()) {
                gfg[i][j] = 1;
                --numberOfBombs;
            }            
        }
    }
    if (numberOfBombs) { // if not all bombs deployed
        populateArrayWithBombs(numberOfBombs);
    }
}

function placeBomb() {
    let notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1]; // Here I decide the probability of 0 or 1. 
    let id = Math.floor(Math.random() * notRandomNumbers.length);
    return notRandomNumbers[id];
}

function showMatrix() {
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++)    {
            document.write(gfg[i][j] + " ");
        }
        document.write("<br>");
    }
}

function countNeighbourBombs(i, j) {
    let counter = 0;
    if (gfg[i][j + 1]) {
        counter++;
    }
    if (gfg[i - 1][j + 1]) {
        counter++;
    }
    if (gfg[i - 1][j - 1]) {
        counter++;
    }
    if (gfg[i + 1][j - 1]) {
        counter++;
    }
    if (gfg[i + 1][j + 1]) {
        counter++;
    }
    if (gfg[i - 1][j]) {
        counter++;
    }
    if (gfg[i][j - 1]) {
        counter++;
    }
    if (gfg[i + 1][j]) {
        counter++;
    }
    return counter;
}

function hasBombsAround(i, j) {
    return (gfg[i][j + 1]) || (gfg[i - 1][j + 1]) || (gfg[i - 1][j]) || (gfg[i - 1][j - 1]) ||
            (gfg[i][j - 1]) || (gfg[i + 1][j - 1]) || (gfg[i + 1][j]) || (gfg[i + 1][j + 1]);

}
  