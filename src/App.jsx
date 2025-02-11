import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 7;
const TOTAL_SIZE = GRID_SIZE + 2;

// Helper function to generate the initial grid and used cells
function generateInitialGrid() {
    const initialGrid = Array(TOTAL_SIZE).fill(null).map(() => Array(TOTAL_SIZE).fill(null));
    const usedCells = Array(TOTAL_SIZE).fill(null).map(() => Array(TOTAL_SIZE).fill(false));

    // Randomly select *used* cells (these contribute to the sums)
    for (let i = 1; i < TOTAL_SIZE - 1; i++) {
        let rowUsedCount = 0;
        let colUsedCount = 0;
        for (let j = 1; j < TOTAL_SIZE - 1; j++) {
            if (Math.random() < 0.7) {
                usedCells[i][j] = true;
                rowUsedCount++;
                colUsedCount++;
            }
        }
        // Ensure at least one used cell per row/column
        if (rowUsedCount === 0) {
            const randomCol = Math.floor(Math.random() * (GRID_SIZE)) + 1;
            usedCells[i][randomCol] = true;
        }
        if (colUsedCount === 0) {
            const randomRow = Math.floor(Math.random() * (GRID_SIZE)) + 1;
            usedCells[randomRow][i] = true;
        }
    }

    // Fill *all* inner cells with random numbers (1-10)
    for (let i = 1; i < TOTAL_SIZE - 1; i++) {
        for (let j = 1; j < TOTAL_SIZE - 1; j++) {
            initialGrid[i][j] = Math.floor(Math.random() * 10) + 1;
        }
    }

    return { grid: initialGrid, used: usedCells };
}

// Helper function to calculate target sums (only considers *used* cells)
function calculateTargets(grid, usedCells) {
    const targets = {
        row: Array(TOTAL_SIZE).fill(0),
        col: Array(TOTAL_SIZE).fill(0),
    };

    for (let i = 1; i < TOTAL_SIZE - 1; i++) {
        for (let j = 1; j < TOTAL_SIZE - 1; j++) {
            if (usedCells[i][j]) {
                targets.row[i] += grid[i][j]; // No null check needed now
                targets.col[j] += grid[i][j]; // No null check needed now
            }
        }
    }
    return targets;
}

// Helper function to check solved rows/cols and overall game solved status
function checkSolvedStatus(grid, usedCells, targets) {
    const solvedRows = Array(TOTAL_SIZE).fill(false);
    const solvedCols = Array(TOTAL_SIZE).fill(false);
    let isSolved = true;

    for (let i = 1; i < TOTAL_SIZE - 1; i++) {
        let rowSum = 0;
        let colSum = 0;
        for (let j = 1; j < TOTAL_SIZE - 1; j++) {
            if (usedCells[i][j]) {
                rowSum += grid[i][j]; // No null check needed now
            }
            if (usedCells[j][i]) {
                colSum += grid[j][i]; // No null check needed now
            }
        }

        if (rowSum === targets.row[i] && rowSum !== 0) {
            solvedRows[i] = true;
        }
        if (colSum === targets.col[i] && colSum !== 0) {
            solvedCols[i] = true;
        }
        if (!solvedRows[i] && targets.row[i] !== 0) {
            isSolved = false;
        }
        if (!solvedCols[i] && targets.col[i] !== 0) {
            isSolved = false;
        }
    }

    return { solvedRows, solvedCols, isSolved };
}

function App() {
    const [initialData, setInitialData] = useState(generateInitialGrid());
    const [grid, setGrid] = useState(initialData.grid);
    const [usedCells, setUsedCells] = useState(initialData.used);
    const [targets, setTargets] = useState(calculateTargets(initialData.grid, initialData.used));
    const [solvedRows, setSolvedRows] = useState(Array(TOTAL_SIZE).fill(false));
    const [solvedCols, setSolvedCols] = useState(Array(TOTAL_SIZE).fill(false));
    const [isSolved, setIsSolved] = useState(false);
    const inputRefs = useRef({});

    // Initialize grid on component mount
    useEffect(() => {
        handleReset();
    }, []);

    // Handle input changes
    const handleInputChange = (row, col, value) => {
        const newGrid = [...grid];
        const parsedValue = parseInt(value, 10);

        // Handle NaN explicitly: set to null (empty cell)
        if (isNaN(parsedValue)) {
            newGrid[row][col] = null;
        } else {
            newGrid[row][col] = Math.min(Math.max(parsedValue, 0), 99);
        }

        setGrid(newGrid); // Update grid *first*

        // *Then* check solved status based on the *new* grid
        const { solvedRows: newSolvedRows, solvedCols: newSolvedCols, isSolved: newIsSolved } = checkSolvedStatus(newGrid, usedCells, targets);
        setSolvedRows(newSolvedRows);
        setSolvedCols(newSolvedCols);
        setIsSolved(newIsSolved);
    };

    // Handle cell clicks (for styling/focus)
    const handleCellClick = (row, col, event) => {
        if (usedCells[row][col] && !solvedRows[row] && !solvedCols[col]) {
            const cellElement = event.currentTarget; // Use currentTarget
            if (cellElement.style.backgroundColor === 'lightblue') {
                cellElement.style.backgroundColor = '';
                if (inputRefs.current[`${row}-${col}`]) {
                    inputRefs.current[`${row}-${col}`].focus();
                }
            } else {
                cellElement.style.backgroundColor = 'lightblue';
                if (inputRefs.current[`${row}-${col}`]) {
                    inputRefs.current[`${row}-${col}`].focus();
                }
            }
        }
    };

    // Handle game reset
    const handleReset = () => {
        const newInitialData = generateInitialGrid();
        setGrid(newInitialData.grid);
        setUsedCells(newInitialData.used);
        setTargets(calculateTargets(newInitialData.grid, newInitialData.used));
        setSolvedRows(Array(TOTAL_SIZE).fill(false));
        setSolvedCols(Array(TOTAL_SIZE).fill(false));
        setIsSolved(false);

        // Reset background color of all cells
        for (let i = 0; i < TOTAL_SIZE; i++) {
            for (let j = 0; j < TOTAL_SIZE; j++) {
                const cellRef = inputRefs.current[`${i}-${j}`];
                if (cellRef && cellRef.parentNode) {
                    cellRef.parentNode.style.backgroundColor = ''; // Reset to default
                }
            }
        }
    };

    return (
        <div>
            <div className="grid-container">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isTargetCell =
                            rowIndex === 0 || rowIndex === TOTAL_SIZE - 1 || colIndex === 0 || colIndex === TOTAL_SIZE - 1;
                        const isUsed = usedCells[rowIndex][colIndex];
                        const rowSolved = solvedRows[rowIndex];
                        const colSolved = solvedCols[colIndex];

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`grid-cell ${isTargetCell ? 'target-cell' : ''}
                                    ${!isUsed && !isTargetCell ? 'unused-cell' : ''}
                                    ${rowSolved || colSolved ? 'solved-cell' : ''}`}
                                onClick={(event) => handleCellClick(rowIndex, colIndex, event)}
                                style={{ cursor: isUsed && !rowSolved && !colSolved ? 'pointer' : 'default' }}
                            >
                                {isTargetCell ? (
                                    <span key={`span-${rowIndex}-${colIndex}`}>
                                        {rowIndex === 0 && colIndex > 0 && colIndex < TOTAL_SIZE - 1 ? targets.col[colIndex] : ''}
                                        {rowIndex === TOTAL_SIZE - 1 && colIndex > 0 && colIndex < TOTAL_SIZE - 1 ? targets.col[colIndex] : ''}
                                        {colIndex === 0 && rowIndex > 0 && rowIndex < TOTAL_SIZE - 1 ? targets.row[rowIndex] : ''}
                                        {colIndex === TOTAL_SIZE - 1 && rowIndex > 0 && rowIndex < TOTAL_SIZE - 1 ? targets.row[rowIndex] : ''}
                                    </span>
                                ) : (
                                    <input
                                        key={`input-${rowIndex}-${colIndex}`}
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={grid[rowIndex][colIndex] === null ? '' : grid[rowIndex][colIndex]}
                                        onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                        disabled={rowSolved || colSolved}
                                        ref={el => (inputRefs.current[`${rowIndex}-${colIndex}`] = el)}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {isSolved && <div className="solved-message">Solved! 🎉</div>}
            <button onClick={handleReset} className="reset-button">Reset</button>
        </div>
    );
}

export default App;
