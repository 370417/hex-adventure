import math
from hex import neighbors, countgroups, floodfill, surrounded

class Level:

    def __init__(self, startpos, width, height, random):
        self.startpos = startpos
        self.random = random

        self.setpositions(width, height)

        self.passable = {pos: False for pos in self.positions}
        self.passable[startpos] = True

        self.carvecaves()
        self.removesmallwalls()
        self.removeothercaves()
        self.filldeadends()


    def setpositions(self, width, height):
        """Create a set of all positions in the map."""
        def minx(y):
            return math.floor((height - y) / 2)
        def maxx(y):
            return width - math.floor(y / 2)
        self.positions = {(x, y) for y in range(height)
                                 for x in range(minx(y), maxx(y))}
        self.innerpositions = {(x, y) for y in range(1, height - 1)
                                      for x in range(minx(y) + 1, maxx(y) - 1)}


    def isfloor(self, pos):
        return self.passable[pos]


    def carvecaves(self):
        shuffledpositions = list(self.innerpositions)
        self.random.shuffle(shuffledpositions)

        for pos in shuffledpositions:
            if countgroups(pos, self.isfloor) != 1:
                self.passable[pos] = True


    def removesmallwalls(self):
        def iswall(pos):
            return pos in self.positions and not self.passable[pos]

        for pos in self.positions:
            wallgroup = set()
            floodfill(pos, iswall, wallgroup)
            if len(wallgroup) < 6:
                for pos in wallgroup:
                    self.passable[pos] = True


    def removeothercaves(self):
        cave = set()
        floodfill(self.startpos, self.isfloor, cave)

        for pos in self.innerpositions:
            if pos not in cave:
                self.passable[pos] = False


    def isnotcave(self, pos):
        return not self.passable[pos] or countgroups(pos, self.isfloor) != 1


    def isdeadend(self, pos):
        return (self.isfloor(pos)
            and countgroups(pos, self.isfloor) == 1
            and surrounded(pos, self.isnotcave))


    def filldeadend(self, pos):
        if self.isdeadend(pos):
            self.passable[pos] = False
            for neighbor in neighbors(pos):
                if pos == self.startpos and self.isfloor(neighbor):
                    self.startpos = neighbor
                self.filldeadend(neighbor)


    def filldeadends(self):
        for pos in self.innerpositions:
            self.filldeadend(pos)
