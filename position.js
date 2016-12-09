(() => {
    const dir1 = 1 - WIDTH;
    const dir3 = 1;
    const dir5 = WIDTH;
    const dir7 = -1 + WIDTH;
    const dir9 = -1;
    const dir11 = -WIDTH;

    const directions = [dir1, dir3, dir5, dir7, dir9, dir11];


    this.xy2pos = function(x, y) {
        return x + y * WIDTH;
    };


    this.pos2xy = function(pos) {
        return {
            x: pos % WIDTH,
            y: Math.floor(pos / WIDTH),
        };
    };


    this.countGroups = function(pos, ingroup) {
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


    this.floodfill = function(pos, floodable, flood) {
        if (floodable(pos)) {
            flood(pos);
            for (let i = 0; i < 6; i++) {
                floodfill(pos + direction[i], floodable, flood);
            }
        }
    };


    this.surrounded = function(pos, istype) {
        for (let i = 0; i < 6; i++) {
            if (!istype(pos + direction[i])) {
                return false;
            }
        }
        return true;
    };
})();
