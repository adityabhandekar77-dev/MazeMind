
const mazeGrid = document.getElementById("maze-grid");
const mazeSize = document.getElementById("maze-size");
const mazeStatus = document.getElementById("maze-status");

let rows = Number(mazeSize.value);
let cols = Number(mazeSize.value);

let start = { row: 0, col: 0 };
let goal = { row: rows - 1, col: cols - 1 };

let grid = [];

function createGrid() {
    rows = Number(mazeSize.value);
    cols = Number(mazeSize.value);

    start = { row: 1, col: 1 };
goal = { row: rows - 2, col: cols - 2 };
    grid = [];

    mazeGrid.innerHTML = "";
    mazeGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    for (let row = 0; row < rows; row++) {
        const gridRow = [];

        for (let col = 0; col < cols; col++) {
            const cell = {
                row,
                col,
                isWall: false,
                element: document.createElement("div")
            };

            cell.element.classList.add("maze-cell");
            cell.element.setAttribute("role", "gridcell");
            cell.element.dataset.row = row;
            cell.element.dataset.col = col;

            mazeGrid.appendChild(cell.element);
            gridRow.push(cell);
        }

        grid.push(gridRow);
    }

    updateGrid();
    mazeStatus.textContent = "Ready to explore";
}

function updateGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = grid[row][col];
            const element = cell.element;

            element.classList.toggle(
                "wall-cell",
                cell.isWall
            );

            element.classList.toggle(
                "start-cell",
                row === start.row && col === start.col
            );

            element.classList.toggle(
                "goal-cell",
                row === goal.row && col === goal.col
            );
        }
    }
}

mazeSize.addEventListener("change", createGrid);

createGrid();


const toolSelect = document.getElementById("tool");

let isMouseDown = false;

function handleCellClick(event) {
    const element = event.target.closest(".maze-cell");

    if (!element || !mazeGrid.contains(element)) {
        return;
    }

    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    const cell = grid[row][col];

    if (toolSelect.value === "start") {
        if (row === goal.row && col === goal.col) return;

        start = { row, col };
        cell.isWall = false;
    } else if (toolSelect.value === "goal") {
        if (row === start.row && col === start.col) return;

        goal = { row, col };
        cell.isWall = false;
    } else if (toolSelect.value === "wall") {
        if (
            (row === start.row && col === start.col) ||
            (row === goal.row && col === goal.col)
        ) {
            return;
        }

        cell.isWall = true;
    } else if (toolSelect.value === "erase") {
        cell.isWall = false;
    }

    clearSearchVisualization();
updateGrid();
mazeStatus.textContent = "Maze updated";
}

function handleCellDrag(event) {
    if (!isMouseDown) return;

    if (toolSelect.value !== "wall" && toolSelect.value !== "erase") {
        return;
    }

    const element = event.target.closest(".maze-cell");

    if (!element || !mazeGrid.contains(element)) return;

    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);

    if (
        (row === start.row && col === start.col) ||
        (row === goal.row && col === goal.col)
    ) {
        return;
    }

    grid[row][col].isWall = toolSelect.value === "wall";
    clearSearchVisualization();
updateGrid();
mazeStatus.textContent = "Maze updated";
}

mazeGrid.addEventListener("click", handleCellClick);

mazeGrid.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    isMouseDown = true;
});

mazeGrid.addEventListener("mouseover", handleCellDrag);

document.addEventListener("mouseup", () => {
    isMouseDown = false;
});

mazeGrid.addEventListener("dragstart", (event) => {
    event.preventDefault();
});




function generateMaze() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col].isWall = true;
        }
    }

    start = { row: 1, col: 1 };
    goal = { row: rows - 2, col: cols - 2 };

    const stack = [{ row: 1, col: 1 }];
    const visited = new Set(["1,1"]);

    grid[1][1].isWall = false;

    const directions = [
        { row: -2, col: 0 },
        { row: 2, col: 0 },
        { row: 0, col: -2 },
        { row: 0, col: 2 }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        for (const direction of directions) {
            const nextRow = current.row + direction.row;
            const nextCol = current.col + direction.col;
            const key = `${nextRow},${nextCol}`;

            if (
                nextRow > 0 &&
                nextRow < rows - 1 &&
                nextCol > 0 &&
                nextCol < cols - 1 &&
                !visited.has(key)
            ) {
                neighbors.push({
                    row: nextRow,
                    col: nextCol,
                    wallRow: current.row + direction.row / 2,
                    wallCol: current.col + direction.col / 2
                });
            }
        }

        if (neighbors.length === 0) {
            stack.pop();
            continue;
        }

        const next = neighbors[
            Math.floor(Math.random() * neighbors.length)
        ];

        visited.add(`${next.row},${next.col}`);

        grid[next.wallRow][next.wallCol].isWall = false;
        grid[next.row][next.col].isWall = false;

        stack.push({
            row: next.row,
            col: next.col
        });
    }

    updateGrid();
    mazeStatus.textContent = "Maze generated successfully";
}

const generateButton = document.getElementById("generate-btn");

generateButton.addEventListener("click", generateMaze);


const solveButton = document.getElementById("solve-btn");
const pauseButton = document.getElementById("pause-btn");
const resetButton = document.getElementById("reset-btn");

const algorithmSelect = document.getElementById("algorithm");
const speedSelect = document.getElementById("speed");

const exploredCount = document.getElementById("explored-count");
const pathLength = document.getElementById("path-length");
const executionTime = document.getElementById("execution-time");
const activeAlgorithm = document.getElementById("active-algorithm");
const resultCard = document.getElementById("result-card");

let isSolving = false;
let isPaused = false;
let animationCancelled = false;

function clearSearchVisualization() {
    for (const row of grid) {
        for (const cell of row) {
            cell.element.classList.remove(
                "visited-cell",
                "path-cell"
            );
        }
    }

    exploredCount.textContent = "0";
    pathLength.textContent = "0";
    executionTime.textContent = "0 ms";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitWhilePaused() {
    while (isPaused && !animationCancelled) {
        await sleep(50);
    }
}

async function animateSearch(result, elapsedTime) {
    const delay = Number(speedSelect.value);

    for (let i = 0; i < result.explored.length; i++) {
        if (animationCancelled) return;

        await waitWhilePaused();

        if (animationCancelled) return;

        const cell = result.explored[i];

        if (
            !(cell.row === start.row && cell.col === start.col) &&
            !(cell.row === goal.row && cell.col === goal.col)
        ) {
            grid[cell.row][cell.col].element.classList.add(
                "visited-cell"
            );
        }

        exploredCount.textContent = String(i + 1);

        if (delay > 0) {
            await sleep(delay);
        }
    }

    if (animationCancelled) return;

    for (const cell of result.path) {
        if (animationCancelled) return;

        await waitWhilePaused();

        if (animationCancelled) return;

        if (
            !(cell.row === start.row && cell.col === start.col) &&
            !(cell.row === goal.row && cell.col === goal.col)
        ) {
            grid[cell.row][cell.col].element.classList.remove(
                "visited-cell"
            );

            grid[cell.row][cell.col].element.classList.add(
                "path-cell"
            );
        }

        if (delay > 0) {
            await sleep(delay);
        }
    }

    if (animationCancelled) return;

    pathLength.textContent = result.path.length
        ? String(result.path.length - 1)
        : "0";

    executionTime.textContent = `${elapsedTime.toFixed(2)} ms`;

    if (result.path.length > 0) {
        mazeStatus.textContent = "Path found!";
        resultCard.innerHTML = `
            <h3>Path found</h3>
            <p>${result.path.length - 1} moves to reach the goal.</p>
        `;
    } else {
        mazeStatus.textContent = "No path found";
        resultCard.innerHTML = `
            <h3>No path found</h3>
            <p>Try generating another maze or removing some walls.</p>
        `;
    }
}

solveButton.addEventListener("click", async () => {
    if (isSolving) return;

    isSolving = true;
    isPaused = false;
    animationCancelled = false;

    solveButton.disabled = true;
    pauseButton.disabled = false;

    clearSearchVisualization();

    const algorithm = algorithmSelect.value;
    const startTime = performance.now();
    setMazeControlsDisabled(true);

    let result;

    if (algorithm === "bfs") {
        result = bfs(grid, start, goal);
        activeAlgorithm.textContent = "BFS";
    } else if (algorithm === "dfs") {
        result = dfs(grid, start, goal);
        activeAlgorithm.textContent = "DFS";
    } else {
        result = astar(grid, start, goal);
        activeAlgorithm.textContent = "A*";
    }

    const elapsedTime = performance.now() - startTime;

    try {
        await animateSearch(result, elapsedTime);
    } catch (error) {
        console.error("Maze animation failed:", error);
        mazeStatus.textContent = "Animation error";
    } finally {
        isSolving = false;
        isPaused = false;
        solveButton.disabled = false;
        pauseButton.disabled = true;
        pauseButton.textContent = "Pause";
        setMazeControlsDisabled(false);
    }
});

pauseButton.addEventListener("click", () => {
    if (!isSolving) return;

    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

resetButton.addEventListener("click", () => {
    animationCancelled = true;
    isPaused = false;

    clearSearchVisualization();

    mazeStatus.textContent = "Ready to explore";
    resultCard.innerHTML = `
        <h3>Ready when you are</h3>
        <p>Choose an algorithm and solve your maze.</p>
    `;
});

function setMazeControlsDisabled(disabled) {
    generateButton.disabled = disabled;
    mazeSize.disabled = disabled;
    toolSelect.disabled = disabled;
    algorithmSelect.disabled = disabled;
    speedSelect.disabled = disabled;
    compareButton.disabled = disabled;
}


const compareButton = document.getElementById("compare-btn");
const comparisonPanel = document.getElementById("comparison-panel");
const comparisonResults = document.getElementById("comparison-results");


compareButton.addEventListener("click", () => {
    if (isSolving) return;

    clearSearchVisualization();

    const algorithms = [
        { name: "BFS", run: bfs, shortest: "Yes" },
        { name: "DFS", run: dfs, shortest: "No guarantee" },
        { name: "A*", run: astar, shortest: "Yes" }
    ];

    const results = algorithms.map(algorithm => {
        const startTime = performance.now();
        const result = algorithm.run(grid, start, goal);
        const elapsedTime = performance.now() - startTime;

        return {
            name: algorithm.name,
            explored: result.explored.length,
            pathLength: result.path.length ? result.path.length - 1 : null,
            elapsedTime,
            shortest: result.path.length ? algorithm.shortest : "Not applicable"
        };
    });

    const reachableResults = results.filter(result => result.pathLength !== null);

    const shortestLength = reachableResults.length
        ? Math.min(...reachableResults.map(result => result.pathLength))
        : null;

    const fewestExplored = reachableResults.length
        ? Math.min(...reachableResults.map(result => result.explored))
        : null;

    comparisonResults.innerHTML = "";

    for (const result of results) {
        const row = document.createElement("tr");

        if (
            result.pathLength !== null &&
            result.pathLength === shortestLength
        ) {
            row.classList.add("best-result");
        }

        const nameCell = document.createElement("td");
        nameCell.textContent = result.name;

        if (
            result.pathLength !== null &&
            result.pathLength === shortestLength
        ) {
            const badge = document.createElement("span");
            badge.className = "result-badge";
            badge.textContent = "SHORTEST";
            nameCell.appendChild(badge);
        }

        if (
            result.pathLength !== null &&
            result.explored === fewestExplored
        ) {
            const badge = document.createElement("span");
            badge.className = "result-badge";
            badge.textContent = "FEWEST EXPLORED";
            nameCell.appendChild(badge);
        }

        row.appendChild(nameCell);

        const values = [
            result.explored,
            result.pathLength === null ? "No path" : result.pathLength,
            `${result.elapsedTime.toFixed(3)} ms`,
            result.shortest
        ];

        for (const value of values) {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            row.appendChild(cell);
        }

        comparisonResults.appendChild(row);
    }

    comparisonPanel.hidden = false;
    comparisonPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});
