function Schedule() {
    let time = 0;
    let heap = [];

    function peek() {
        return heap[0];
    }

    function push(id, delay) {
        Heap.push(heap, {time: time + delay, id}, cmp);
    }

    function pop() {
        {time, id} = Heap.pop(heap, cmp);
        return id;
    }

    function pushpop(id, delay) {
        {time, id} = Heap.pushpop(heap, {time: time + delay, id}, cmp);
        return id;
    }

    function cmp(a, b) {
        return a.time - b.time || a.id - b.id;
    }

    return {
        peek,
        push,
        pop,
        pushpop,
    };
}
