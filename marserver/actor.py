from itertools import count

TURN = 12

class Actor:
    actors = {}
    generateid = count(1)

    def __init__(self, game):
        self.game = game
        self.id = next(Actor.generateid)
        Actor.actors[self.id] = self
        self.delay = TURN

    def act(self):
        return self.delay


class Player(Actor):
    
    def act(self, command, arg):
        for x, y in self.game.level.positions:
            self.game.queueoutput('newtile {},{}'.format(x, y))
        return self.delay
