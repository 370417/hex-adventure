from random import Random

class Game:
    
    def __init__(self, seed, output):
        self.seed = seed
        self.output = output

        self.random = Random
        self.random.seed(seed)

        self.level = None
        self.schedule = None

    def input(self, line):
        self.output(line)
