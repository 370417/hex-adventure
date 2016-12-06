import math
from hex import countgroups

class Level:

    def __init__(self, startpos, width, height, random):
        self.setpositions(width, height)

        self.passable = {pos: False for pos in self.positions}
        self.passable[startpos] = True

        def isfloor(pos):
            return self.passable[pos]

        shuffledpositions = list(self.innerpositions)
        random.shuffle(shuffledpositions)
        for pos in shuffledpositions:
            if countgroups(pos, isfloor) != 1:
                self.passable[pos] = True

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
