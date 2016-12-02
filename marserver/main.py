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


# dict of current games by game id
games = {}


# generator to generate unique game ids
generateid = count(1)


def chooseid(message):
    """Choose a new id for a new game or the old one to continue a game"""
    try:
        message = int(message)
    except ValueError:
        pass
    if message in games:
        return message
    else:
        return next(generateid)


@websocket.WebSocketWSGI
def appobject(ws):
    # make a new game or continue an old one based on the first message
    # game ids start with i and seeds start with s to distinguish them
    firstmessage = ws.wait()
    if firstmessage in games:
        # contine game if the first message is a valid game id
        gameid = firstmessage
        game = games[gameid]
    else:
        # new game seeded with s + first message
        seed = 's' + firstmessage
        game = Game(seed, ws.send)
        gameid = 'i' + str(next(generateid))
        games[gameid] = game

    ws.send('id ' + gameid)

    # feed messages from the websocket to the game
    while True:
        try:
            message = ws.wait()
        except OSError:
            print(OSError)
            break
        if message:
            for line in message.splitlines():
                game.input(line)
        else:
            print('Client closed connection')
            break
        eventlet.sleep(0)

try:
    wsgi.server(listen(('localhost', 4000)), appobject, debug=True)
except KeyboardInterrupt:
    print('KeyboardInterrupt')
    pass
