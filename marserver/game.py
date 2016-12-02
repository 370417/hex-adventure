from random import Random
from level import Level


class Game:
    
    def __init__(self, seed, output):
        self.seed = seed
        self.output = output

        self.random = Random()
        self.random.seed(seed)

        self.level = None
        self.schedule = None


    def descend(self):
        newlevel = Level()


    def input(self, line):
        self.output(line)
