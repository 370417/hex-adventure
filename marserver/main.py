"""
Create a websocket server for game i/o.

Each message sent from the client to the server is split up into lines,
where each line is a command, optinally followed by a space and an argument.

Commands:
quit - quit the game
newgame - start a new game seeded with the argument
"""

from itertools import count
from eventlet import wsgi, websocket, listen, greenthread
import secret

games = {}
generateid = count()

def respond(id, line):
    key, blank, value = line.partition(' ')

    if key == 'quit':
        return

    elif key == 'newgame':
        games[id] = 'newgame'

def func(ws):
    id = next(generateid)
    while True:
        message = ws.wait()
        if message == None:
            return
        response = [respond(id, line) for line in message.splitlines()]
        ws.send('\n'.join(response))
        if response[-1] == None:
            return ws.close()
        greenthread.sleep(0)

@websocket.WebSocketWSGI
def appobject(ws):
    thread = greenthread.spawn_n(func, ws)


wsgi.server(listen(('localhost', 4000)), appobject, debug=True)
