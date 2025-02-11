import React, { useState, useEffect, useRef } from 'react';

const getRandomGridSize = () => {
  return Math.floor(Math.random() * 3) + 5;
};

function generateInitialGrid(gridSize) {
  const totalSize = gridSize + 2;
  const initialGrid = Array(totalSize).fill(null).map(() => Array(totalSize).fill(null));
  const usedCells = Array(totalSize).fill(null).map(() => Array(totalSize).fill(false));

  for (let i = 1; i < totalSize - 1; i++) {
    let rowUsedCount = 0;
    let colUsedCount = 0;
    for (let j = 1; j < totalSize - 1; j++) {
      if (Math.random() < 0.7) {
        usedCells[i][j] = true;
        rowUsedCount++;
        colUsedCount++;
      }
    }
    if (rowUsedCount === 0) {
      const randomCol = Math.floor(Math.random() * gridSize) + 1;
      usedCells[i][randomCol] = true;
    }
    if (colUsedCount === 0) {
      const randomRow = Math.floor(Math.random() * gridSize) + 1;
      usedCells[randomRow][i] = true;
    }
  }

  for (let i = 1; i < totalSize - 1; i++) {
    for (let j = 1; j < totalSize - 1; j++) {
      initialGrid[i][j] = Math.floor(Math.random() * 10) + 1;
    }
  }

  return { grid: initialGrid, used: usedCells };
}

function calculateTargets(grid, usedCells, gridSize) {
  const totalSize = gridSize + 2;
  const targets = {
    row: Array(totalSize).fill(0),
    col: Array(totalSize).fill(0),
  };

  for (let i = 1; i < totalSize - 1; i++) {
    for (let j = 1; j < totalSize - 1; j++) {
      if (usedCells[i][j]) {
        // Explicitly coerce to numbers
        targets.row[i] += Number(grid[i][j] !== null ? grid[i][j] : 0);
        targets.col[j] += Number(grid[i][j] !== null ? grid[i][j] : 0);
      }
    }
  }
  return targets;
}

function checkSolvedStatus(grid, usedCells, targets, gridSize) {
  const totalSize = gridSize + 2;
  const solvedRows = Array(totalSize).fill(false);
  const solvedCols = Array(totalSize).fill(false);
  let isSolved = true;

  for (let i = 1; i < totalSize - 1; i++) {
    let rowSum = 0;
    let colSum = 0;
    for (let j = 1; j < totalSize - 1; j++) {
      // Consistently handle null values and coerce to numbers
      if (usedCells[i][j]) {
        rowSum += Number(grid[i][j] !== null ? grid[i][j] : 0);
      }
      if (usedCells[j][i]) {
        colSum += Number(grid[j][i] !== null ? grid[j][i] : 0);
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
  const [gridSize, setGridSize] = useState(getRandomGridSize); // Initial grid size
  const [initialData, setInitialData] = useState(null); // Initialize as null
  const [grid, setGrid] = useState(null);
  const [usedCells, setUsedCells] = useState(null);
  const [targets, setTargets] = useState(null);
  const [solvedRows, setSolvedRows] = useState(null);
  const [solvedCols, setSolvedCols] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [flashRow, setFlashRow] = useState(null);
  const [flashCol, setFlashCol] = useState(null);
  const inputRefs = useRef({});
  const prevSolvedRows = useRef([]);
  const prevSolvedCols = useRef([]);

  // Initialize grid-size-dependent state *only once* on mount
  useEffect(() => {
    const initialGridSize = getRandomGridSize();
    setGridSize(initialGridSize); // Set the initial grid size
    const data = generateInitialGrid(initialGridSize);
    setInitialData(data);
    setGrid(data.grid);
    setUsedCells(data.used);
    setTargets(calculateTargets(data.grid, data.used, initialGridSize));
    setSolvedRows(Array(initialGridSize + 2).fill(false));
    setSolvedCols(Array(initialGridSize + 2).fill(false));
    prevSolvedRows.current = Array(initialGridSize + 2).fill(false);
    prevSolvedCols.current = Array(initialGridSize + 2).fill(false);
  }, []); // Empty dependency array: runs only once on mount

 // useEffect for flash trigger - Corrected Logic
useEffect(() => {
    if (!solvedRows || !solvedCols) return; // Wait for initialization

    let flashRowTriggered = false;
    let flashColTriggered = false;

    // Correctly compare current and previous solved states
    for (let i = 1; i < gridSize + 2; i++) {
        if (solvedRows[i] && !prevSolvedRows.current[i]) {
            setFlashRow(i);
            flashRowTriggered = true;
        }
        if (solvedCols[i] && !prevSolvedCols.current[i]) {
            setFlashCol(i);
            flashColTriggered = true;
        }
    }

    // Update previous solved rows/cols *CORRECTLY* using spread operator
    prevSolvedRows.current = [...solvedRows];
    prevSolvedCols.current = [...solvedCols];

    // Clear flash after delay (only if triggered)
    if (flashRowTriggered) {
        setTimeout(() => setFlashRow(null), 300);
    }
    if (flashColTriggered) {
        setTimeout(() => setFlashCol(null), 300);
    }
}, [solvedRows, solvedCols, gridSize]);


  const handleInputChange = (row, col, value) => {
    if (!grid) return; // Wait for initialization
    const newGrid = [...grid];
     // Ensure parsedValue is a number
    const parsedValue = Number(parseInt(value, 10));


    if (isNaN(parsedValue)) {
      newGrid[row][col] = null;
    } else {
      newGrid[row][col] = Math.min(Math.max(parsedValue, 0), 99);
    }

    setGrid(newGrid);

    const { solvedRows: newSolvedRows, solvedCols: newSolvedCols, isSolved: newIsSolved } = checkSolvedStatus(newGrid, usedCells, targets, gridSize);

    setSolvedRows(newSolvedRows);
    setSolvedCols(newSolvedCols);
    setIsSolved(newIsSolved);
  };

  const handleCellClick = (row, col, event) => {
    if (!grid || !usedCells || !solvedRows || !solvedCols) return; // Wait for initialization
    const totalSize = gridSize + 2;
    if (usedCells[row][col] && !solvedRows[row] && !solvedCols[col]) {
      const cellElement = event.currentTarget;
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

  const handleReset = () => {
    const newGridSize = getRandomGridSize();
    setGridSize(newGridSize);
    const newInitialData = generateInitialGrid(newGridSize);
    setGrid(newInitialData.grid);
    setUsedCells(newInitialData.used);
    setTargets(calculateTargets(newInitialData.grid, newInitialData.used, newGridSize));
    setSolvedRows(Array(newGridSize + 2).fill(false));
    setSolvedCols(Array(newGridSize + 2).fill(false));
    setIsSolved(false);
    setFlashRow(null);
    setFlashCol(null);

    // Reset prevSolvedRows and prevSolvedCols
    prevSolvedRows.current = Array(newGridSize + 2).fill(false);
    prevSolvedCols.current = Array(newGridSize + 2).fill(false);

    for (let i = 0; i < newGridSize + 2; i++) { // Use newGridSize here
      for (let j = 0; j < newGridSize + 2; j++) { // Use newGridSize here
        const cellRef = inputRefs.current[`${i}-${j}`];
        if (cellRef && cellRef.parentNode) {
          cellRef.parentNode.style.backgroundColor = '';
        }
      }
    }
  };

  const totalSize = gridSize + 2;

  // Prevent rendering until initialization is complete
  if (!grid || !usedCells || !targets || !solvedRows || !solvedCols) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ '--grid-size': totalSize }}>
      <div className="grid-container">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isTargetCell =
              rowIndex === 0 || rowIndex === totalSize - 1 || colIndex === 0 || colIndex === totalSize - 1;
            const isUsed = usedCells[rowIndex][colIndex];
            const rowSolved = solvedRows[rowIndex];
            const colSolved = solvedCols[colIndex];
            const isFlashing = (flashRow === rowIndex && !isTargetCell) || (flashCol === colIndex && !isTargetCell);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isTargetCell ? 'target-cell' : ''}
                                    ${!isUsed && !isTargetCell ? 'unused-cell' : ''}
                                    ${rowSolved || colSolved ? 'solved-cell' : ''}
                                    ${isFlashing ? 'flash-cell' : ''}`}
                onClick={(event) => handleCellClick(rowIndex, colIndex, event)}
                style={{ cursor: isUsed && !rowSolved && !colSolved ? 'pointer' : 'default' }}
              >
                {isTargetCell ? (
                  <span key={`span-${rowIndex}-${colIndex}`}>
                    {/* Defensive checks for target cell rendering */}
                    {rowIndex === 0 && colIndex > 0 && colIndex < totalSize - 1
                      ? (typeof targets.col[colIndex] === 'number' ? targets.col[colIndex] : '')
                      : ''}
                    {rowIndex === totalSize - 1 && colIndex > 0 && colIndex < totalSize - 1
                      ? (typeof targets.col[colIndex] === 'number' ? targets.col[colIndex] : '')
                      : ''}
                    {colIndex === 0 && rowIndex > 0 && rowIndex < totalSize - 1
                      ? (typeof targets.row[rowIndex] === 'number' ? targets.row[rowIndex] : '')
                      : ''}
                    {colIndex === totalSize - 1 && rowIndex > 0 && rowIndex < totalSize - 1
                      ? (typeof targets.row[rowIndex] === 'number' ? targets.row[rowIndex] : '')
                      : ''}
                  </span>
                ) : rowSolved || colSolved ? (
                  <span key={`blank-${rowIndex}-${colIndex}`}></span>
                ) : (
                  <input
                    key={`input-${rowIndex}-${colIndex}`}
                    type="number"
                    min="1"
                    max="99"
                    // Ensure value is a number or empty string
                    value={grid[rowIndex][colIndex] === null ? '' : Number(grid[rowIndex][colIndex])}
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
      {isSolved && (
        <div className="solved-overlay">
          <div className="solved-message">Solved! 🎉</div>
        </div>
      )}
      <button onClick={handleReset} className="reset-button">Reset</button>
    </div>
  );
}

export default App;
