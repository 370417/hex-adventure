// Keep track of future events

function Schedule() {
    let now = 0;
    let heap = new Heap((a, b) => a.time - b.time || a.id - b.id);

    const peek = heap.peek.bind(heap);

    function push(id, delay) {
        heap.push({time: now + delay, id});
    }

    function pop() {
        let {time, id} = heap.pop();
        now = time;
        return id;
    }

    function pushpop(id, delay) {
        let event = heap.pushpop({time: time + delay, id});
        now = event.time;
        return event.id;
    }

    return {
        peek,
        push,
        pop,
        pushpop,
    };
}
