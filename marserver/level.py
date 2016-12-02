import math

class Level:

    def __init__(self, startpos, width, height):
        self.setpositions(width, height)


    def setpositions(self, width, height):
        """create a set of all positions in the map"""
        def minx(y):
            return math.floor((height - y) / 2)
        def maxx(y):
            return width - math.floor(y / 2)
        self.positions = {(x, y) for y in range(height)
                                 for x in range(minx(y), maxx(y))}
        self.innerpositions = {(x, y) for y in range(height)
                                      for x in range(minx(y) + 1, maxx(y) - 1)}