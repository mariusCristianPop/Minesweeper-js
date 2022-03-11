# Minesweeper-js
 Implementation of the classic Minesweeper game
 if (i == 0 && j == 0) {
        if (countNeighbourBombs(i, j) == 5 || countNeighbourBombs(i, j) == 3 ) { // covers the case in which all sorrounding cells are free of bombs 
            revealCells(i, j);
            revealCells(i, j + 1);
            revealCells(i + 1, j + 1);
            revealCells(i + 1, j);
            checkCells(i, j);
        } 
    } else if (i > 0 && j > 0 && i < gameBoardDim - 1 && j < gameBoardDim - 1) {
        if (countNeighbourBombs(i, j) == 0) { // covers the case in which all sorrounding cells are free of bombs 
            revealCells(i, j);
            revealCells(i, j + 1);
            revealCells(i - 1, j + 1);
            revealCells(i - 1, j - 1);
            revealCells(i + 1, j - 1);
            revealCells(i + 1, j + 1);
            revealCells(i - 1, j);
            revealCells(i, j - 1);
            revealCells(i + 1, j);
            checkCells(i, j);
        } 
    }