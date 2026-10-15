
function getNeighbors(grid, row, col) {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    const neighbors = [];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (
            newRow >= 0 &&
            newRow < grid.length &&
            newCol >= 0 &&
            newCol < grid[0].length &&
            !grid[newRow][newCol].isWall
        ) {
            neighbors.push({
                row: newRow,
                col: newCol
            });
        }
    }

    return neighbors;
}

function reconstructPath(cameFrom, current) {
    const path = [];

    while (current) {
        path.unshift(current);
        current = cameFrom.get(`${current.row},${current.col}`);
    }

    return path;
}

function bfs(grid, start, goal) {
    const queue = [start];
    let head = 0;

    const visited = new Set([
        `${start.row},${start.col}`
    ]);

    const cameFrom = new Map();
    const explored = [];

    while (head < queue.length) {
        const current = queue[head++];

        explored.push(current);

        if (
            current.row === goal.row &&
            current.col === goal.col
        ) {
            return {
                explored,
                path: reconstructPath(cameFrom, current)
            };
        }

        for (const neighbor of getNeighbors(
            grid,
            current.row,
            current.col
        )) {
            const key = `${neighbor.row},${neighbor.col}`;

            if (!visited.has(key)) {
                visited.add(key);
                cameFrom.set(key, current);
                queue.push(neighbor);
            }
        }
    }

    return {
        explored,
        path: []
    };
}

function dfs(grid, start, goal) {
    const stack = [start];

    const visited = new Set([
        `${start.row},${start.col}`
    ]);

    const cameFrom = new Map();
    const explored = [];

    while (stack.length > 0) {
        const current = stack.pop();

        explored.push(current);

        if (
            current.row === goal.row &&
            current.col === goal.col
        ) {
            return {
                explored,
                path: reconstructPath(cameFrom, current)
            };
        }

        for (const neighbor of getNeighbors(
            grid,
            current.row,
            current.col
        )) {
            const key = `${neighbor.row},${neighbor.col}`;

            if (!visited.has(key)) {
                visited.add(key);
                cameFrom.set(key, current);
                stack.push(neighbor);
            }
        }
    }

    return {
        explored,
        path: []
    };
}

function astar(grid, start, goal) {
    const openSet = [start];

    const cameFrom = new Map();
    const gScore = new Map();
    const visited = new Set();
    const explored = [];

    const keyOf = (cell) => `${cell.row},${cell.col}`;

    const heuristic = (cell) =>
        Math.abs(cell.row - goal.row) +
        Math.abs(cell.col - goal.col);

    gScore.set(keyOf(start), 0);

    while (openSet.length > 0) {
        let bestIndex = 0;

        for (let i = 1; i < openSet.length; i++) {
            const currentScore =
                gScore.get(keyOf(openSet[i])) +
                heuristic(openSet[i]);

            const bestScore =
                gScore.get(keyOf(openSet[bestIndex])) +
                heuristic(openSet[bestIndex]);

            if (currentScore < bestScore) {
                bestIndex = i;
            }
        }

        const current = openSet.splice(bestIndex, 1)[0];
        const currentKey = keyOf(current);

        if (visited.has(currentKey)) continue;

        visited.add(currentKey);
        explored.push(current);

        if (
            current.row === goal.row &&
            current.col === goal.col
        ) {
            return {
                explored,
                path: reconstructPath(cameFrom, current)
            };
        }

        for (const neighbor of getNeighbors(
            grid,
            current.row,
            current.col
        )) {
            const neighborKey = keyOf(neighbor);

            if (visited.has(neighborKey)) continue;

            const tentativeG = gScore.get(currentKey) + 1;

            if (
                tentativeG <
                (gScore.get(neighborKey) ?? Infinity)
            ) {
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);

                if (!openSet.some(
                    cell => keyOf(cell) === neighborKey
                )) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return {
        explored,
        path: []
    };
}
