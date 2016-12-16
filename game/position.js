// Helper functions for working with positions

const WIDTH = 48;
const HEIGHT = 31;

const dir1 = 1 - WIDTH;
const dir3 = 1;
const dir5 = WIDTH;
const dir7 = -1 + WIDTH;
const dir9 = -1;
const dir11 = -WIDTH;

const directions = [dir1, dir3, dir5, dir7, dir9, dir11];


function xy2pos(x, y) {
    return x + y * WIDTH;
}


function pos2xy(pos) {
    return {
        x: pos % WIDTH,
        y: Math.floor(pos / WIDTH),
    };
}


function countGroups(pos, ingroup) {
    // use var instead of let because
    // chrome can't optimize compound let assignment
    var groupcount = 0;
    for (let i = 0; i < 6; i++) {
        const curr = directions[i];
        const next = directions[(i+1)%6];
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1;
        }
    }
    if (groupcount) {
        return groupcount;
    } else {
        return Number(ingroup(pos + dir1));
    }
}


function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}


function floodfillSet(pos, passable, visited) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited);
        })
    }
}


function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false;
        }
    }
    return true;
}


function forEachNeighbor(pos, callback) {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i]);
    }
}


function flowmap(startpos, range, forEachNeighbor, cost) {
    const open = new Map(); // map of positions to net cost
    open.set(startpos, 0);
    const closed = new Map();
    const openHeap = new Heap((a, b) => open.get(a) - open.get(b));
    openHeap.push(startpos);

    while (!openHeap.empty()) {
        const pos = openHeap.pop();
        const netCost = open.get(pos);
        if (netCost > range) {
            return closed;
        }
        open.delete(pos);
        closed.set(pos, netCost);

        forEachNeighbor(pos, neighbor => {
            if (!closed.has(neighbor)) {
                const altCost = netCost + cost(neighbor);
                if (!open.has(neighbor)) {
                    open.set(neighbor, altCost);
                    openHeap.push(neighbor);
                }
                else if (altCost < open.get(neighbor)) {
                    open.set(neighbor, altCost);
                    openHeap.update(neighbor);
                }
            }
        });
    }
    return closed;
}

