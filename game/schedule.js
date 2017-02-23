// Keep track of future events

class Schedule {
    constructor() {
        this._now = 0
        this._heap = new Heap((a, b) => a.time - b.time || a.id - b.id)
    }

    push(id, delay) {
        this._heap.push({time: now + delay, id})
    }

    pop() {
        let event = this._heap.pop()
        this._now = event.time
        return event.id
    }

    pushpop(id, delay) {
        let event = this._heap.pushpop({time: now + delay, id})
        this._now = event.time
        return event.id
    }
}
/*
function Schedule() {
    let now = 0
    let heap = new Heap((a, b) => a.time - b.time || a.id - b.id)

    const peek = heap.peek

    function push(id, delay) {
        heap.push({time: now + delay, id})
    }

    function pop() {
        let {time, id} = heap.pop()
        now = time
        return id
    }

    function pushpop(id, delay) {
        let event = heap.pushpop({time: time + delay, id})
        now = event.time
        return event.id
    }

    return {
        peek,
        push,
        pop,
        pushpop,
    }
}
*/
