function Schedule() {
    let time = 0;
    let heap = [];

    function peek() {
        return heap[0];
    }

    function push(id, delay) {
        Heap.push(heap, [time + delay, id], cmp);
    }

    function pop() {
        [time, id] = Heap.pop(heap, cmp);
        return id;
    }

    function pushpop(id, delay) {
        [time, newid] = Heap.pushpop(heap, [time + delay, id], cmp);
        return newid;
    }

    function cmp(a, b) {
        if (!a && !b) {
            return 0;
        } else if (a[0] - b[0]) {
            return a[0] - b[0];
        } else {
            return cmp(a.slice(1), b.slice(1));
        }
    }

    return {
        peek,
        push,
        pop,
        pushpop,
    };
}
