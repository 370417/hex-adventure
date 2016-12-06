""""""

# direction names are based on clock directions
dir1  = ( 1,-1)
dir3  = ( 1, 0)
dir5  = ( 0, 1)
dir7  = (-1, 1)
dir9  = (-1, 0)
dir11 = ( 0,-1)

directions = [dir1, dir3, dir5, dir7, dir9, dir11]


def add(pos1, pos2):
    x1, y1 = pos1
    x2, y2 = pos2
    return (x1 + x2, y1 + y2)


def neighbors(pos):
    """Generate the neighbors of pos."""
    x, y = pos
    for dx, dy in directions:
        yield (x + dx, y + dy)


def countgroups(pos, ingroup):
    groupcount = 0
    for i in range(6):
        curr = add(pos, directions[i])
        prev = add(pos, directions[i-1])
        if ingroup(curr) and not ingroup(prev):
            groupcount += 1
    if groupcount == 0:
        return int(ingroup(curr))
    else:
        return groupcount


def floodfill(pos, passable, visited):
    """Floodfill all passable positions around pos."""
    if passable(pos) and pos not in visited:
        visited.add(pos)
        for neighbor in neighbors(pos):
            floodfill(neighbor, passable, visited)


def surrounded(pos, istype):
    return all((istype(neighbor) for neighbor in neighbors(pos)))
