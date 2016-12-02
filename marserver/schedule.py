class Schedule:
    """Represents a schedule of events"""

    def __init__(self):
        self.schedule = []
        self.time = 0

    def peek(self):
        """Get the next event without removing it"""
        if self.schedule:
            return self.schedule[0][1]
        else:
            return False

    def push(self, id, delay):
        """Schedule an event with id of id at a time of delay ticks from now"""
        heappush(self.schedule, (self.time + delay, id))

    def pop(self):
        """Remove and get the next event"""
        time, id = heappop(self.schedule)
        self.time = time
        return id

    def pushpop(self, id, delay):
        "Schedule an event with id of id and get the next event"
        time, id = heappushpop(self.schedule, (self.time + delay, id))
        self.time = time
        return id
