// Keep track of future events

this.Schedule = {
    init(game) {
        game.now = 0
        game.schedule = []
    },

    create() {
        return {now: 0, heap: []}
    },

    push(schedule, id, delay) {
        if (delay === Infinity) return
        const event = {id, time: schedule.now + delay}
        Heap.push(schedule.heap, event, this.cmp)
    },

    pop(schedule) {
        const event = Heap.pop(schedule.heap, this.cmp)
        schedule.now = event.time
        return event.id
    },

    // comparison function for the schedule heap
    cmp(a, b) {
        return a.time - b.time || a.id - b.id
    },
}
