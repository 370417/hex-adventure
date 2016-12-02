"""
Create a websocket server for game i/o.

Each message sent from the client to the server is split up into lines,
where each line is a command, optinally followed by a space and an argument.

Commands:
quit - quit the game
newgame - start a new game seeded with the argument
"""


from itertools import count
from eventlet import wsgi, websocket, listen
import secret
from game import Game


games = {}
generateid = count()


def respond(id, line):
    key, blank, value = line.partition(' ')

    if key == 'quit':
        return

    elif key == 'newgame':
        if not value:
            value = random.randrange(10000)
        games[id] = Game(value)


def func(ws):
    id = next(generateid)

    def wait():
        while True:
            message = ws.wait()
            if message:
                yield from message.splitlines()
            else:
                break

    games[id] = Game(wait, ws.send)


@websocket.WebSocketWSGI
def appobject(ws):
    id = next(generateid)

    def wait():
        while True:
            message = ws.wait()
            if message:
                yield from message.splitlines()
            else:
                break

    games[id] = Game(wait(), ws.send)


wsgi.server(listen(('localhost', 4000)), appobject, debug=True)
