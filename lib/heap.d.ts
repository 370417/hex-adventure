export declare class Heap<T> {
    constructor(compareFunction?: (a: T, b: T) => number)
    empty(): boolean
    push(item: T): void
    pop(): T
    update(item: T): void
}