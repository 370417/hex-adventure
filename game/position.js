// Helper functions for working with positions

const WIDTH = 62;//48;
const HEIGHT = 37;//31;

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
        x: (pos + WIDTH) % WIDTH,
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

function roundtieup(n) {
    return Math.floor(n + 0.5);
}

function roundtiedown(n) {
    return Math.ceil(n - 0.5);
}
/*
function* scan(r, start, end, transparent) {
    if (start < end) {
        const minarc = roundtiedown((r - 0.5) * start);
        const maxarc = roundtieup((r + 0.5) * end);
        let exists = false;
        for (let arc = minarc; arc <= maxarc; arc++) {
            if (transparent(arc, r)) {
                if (arc => r * start && arc <= r * end) {
                    yield [arc, r];
                    exists = true;
                    if (!transparent(arc, r + 1)) {
                        yield [arc, r + 1];
                    }
                    if (!transparent(arc + 1, r + 1)) {
                        yield [arc + 1, r + 1];
                    }
                }
            } else {
                if (exists) {
                    yield* scan(r + 1, start, (arc - 0.5) / r, transparent);
                }
                start = (arc + 0.5) / r;
                if (start >= end) {
                    break;
                }
            }
        }
        if (exists) {
            yield* scan(r + 1, start, end, transparent);
        }
    }
}
*/
function* fov(center, transparent) {
    yield center;

    const normal = directions;
    const tangent = [dir3, dir5, dir7, dir9, dir11, dir1];

    function polar2pos(r, angle) {
        const sector = Math.trunc(angle);
        const arc = roundtiedown((angle - sector) * (r - 0.5));
        return {
            pos: center + r * normal[sector] + arc * tangent[sector],
            arc: r * sector + arc,
        };
    }

    function* scan(r, start, end) {
        let yielded = false;
        let {pos, arc} = polar2pos(r, start);
        let current = start;
        while (current < end) {
            if (transparent(pos, r)) {
                current = arc / r;
                if (current >= start && current <= end) {
                    yield pos;
                    yielded = true;
                    for (let angle = Math.ceil(current - 1); angle <= current + 1; angle++) {
                        const wallPos = pos + directions[angle];
                        if (transparent(wallPos, r + 1)) {
                            yield wallPos;
                        }
                    }
                }
            } else {
                current = (arc + 0.5) / r;
                if (yielded) {
                    yield* scan(r + 1, start, (arc - 0.5) / r);
                }
                start = current;
            }
            pos += tangent[Math.trunc(arc / r)];
            arc++;
        }
        if (yielded) {
            yield* scan(r + 1, start, end);
        }
    }
    yield* scan(1, 0, 6);
  /*  const transforms = [
        [dir1, dir5],
        [dir3, dir7],
        [dir5, dir9],
        [dir7, dir11],
        [dir9, dir1],
        [dir11, dir3]];
    for (let i = 0; i < 6; i++) {
        const [normal, tangent] = transforms[i];
        if (!transparent(center + normal)) {
            yield center + normal;
        }
        const radial2pos = (arc, r) => center + arc * tangent + r * normal;
        const modTransparent = (arc, r) => transparent(radial2pos(arc, r));
        for (const [arc, r] of scan(1, 0, 0.4, modTransparent)) {
            yield radial2pos(arc, r);
        }
    }*/
}
