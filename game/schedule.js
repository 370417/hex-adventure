// Keep track of future events

this.Schedule = {
    init(game) {
        game.now = 0
        game.schedule = []
    },

    push(game, id, delay) {
        if (delay === Infinity) return
        const event = {id, time: game.now + delay}
        Heap.push(game.schedule, event, this.cmp)
    },

    pop(game) {
        const event = Heap.pop(game.schedule, this.cmp)
        game.now = event.time
        return event.id
    },

    // comparison function for the schedule heap
    cmp(a, b) {
        return a.time - b.time || a.id - b.id
    },

    advance(game) {
    }

    loop(game) {
        let actionCompleted = true
        while (actionCompleted) {
            const id = Schedule.pop(game)
            const entity = Entity.get(game, id)
            actionCompleted = Actor.act(game, entity)
        }
    },
}
