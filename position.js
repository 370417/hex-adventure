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
};


function pos2xy(pos) {
    return {
        x: pos % WIDTH,
        y: Math.floor(pos / WIDTH),
    };
};


function countGroups(pos, ingroup) {
    let groupcount = 0;
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
};


function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + direction[i], floodable, flood);
        }
    }
};


function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + direction[i])) {
            return false;
        }
    }
    return true;
};
