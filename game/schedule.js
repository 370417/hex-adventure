// Keep track of future events

class Schedule {
    constructor(array = []) {
        this._now = 0
        this._array = array
    }

    push(id, delay) {
        const event = {time: now + delay, id}
        Heap.push(this._array, event, Schedule._cmp)
    }

    pop() {
        const {time, id} = Heap.pop(this._array, Schedule._cmp)
        this._now = time
        return id
    }

    pushpop(id, delay) {
        const event = {time: now + delay, id}
        const {time, id} = Heap.pushpop(this._array, event, Schedule._cmp)
        this._now = time
        return id
    }

    static _cmp(a, b) {
        return a.time - b.time || a.id - b.id
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
