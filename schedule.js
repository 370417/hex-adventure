const protoSchedule = {
    peek() {
        return this.heap[0];
    },


    push(id, delay) {
        Heap.push(this.heap, [this.time + delay, id], this.cmp);
    },


    pop() {
        time, id = Heap.pop(this.heap, this.cmp);
        this.time = time;
        return id;
    },


    pushpop(id, delay) {
        time, newid = Heap.pushpop(this.heap, [this.time + delay, id], this.cmp);
        this.time = time;
        return newid;
    }


    cmp(a, b) {
        if (!a && !b) {
            return 0;
        } else if (a[0] - b[0]) {
            return a[0] - b[0];
        } else {
            return this.cmp(a.slice(1), b.slice(1));
        }
    },
};


function Schedule() {
    const schedule = {
        time: 0,
        heap: [],
    };
    return Object.create(protoSchedule, schedule);
}
