//! A minheap that separates values from priorities.
//! Intended for use in astar.

use std::cmp::Ordering;
use std::collections::BinaryHeap;

pub struct MinHeap<V: Eq, P: Ord>(BinaryHeap<MinHeapItem<V, P>>);

#[derive(Eq, PartialEq)]
struct MinHeapItem<V: Eq, P: Ord> {
    value: V,
    priority: P,
}

impl<V: Eq, P: Ord> MinHeap<V, P> {
    pub fn new() -> Self {
        MinHeap(BinaryHeap::new())
    }

    pub fn push<T>(&mut self, value: T, priority: P) where T: Into<V> {
        self.0.push(MinHeapItem { value: value.into(), priority })
    }

    pub fn pop(&mut self) -> Option<V> {
        match self.0.pop() {
            Some(item) => Some(item.value),
            None => None,
        }
    }
}

impl<V: Eq, P: Ord> Ord for MinHeapItem<V, P> {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.priority.cmp(&other.priority) {
            Ordering::Equal => Ordering::Equal,
            Ordering::Greater => Ordering::Less,
            Ordering::Less => Ordering::Greater,
        }
    }
}

impl<V: Eq, P: Ord> PartialOrd for MinHeapItem<V, P> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
