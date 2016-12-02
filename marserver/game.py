class Game:
    
    def __init__(self, inputgenerator, output):
        for input in inputgenerator:
            output(input)
