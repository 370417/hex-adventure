use crate::prelude::*;
use std::cmp::Ordering;
use std::collections::BinaryHeap;
use std::collections::HashSet;

fn dijkstra<F>(origin: Pos, cost: F)
where
    F: Fn(Pos) -> Option<u32>,
{
    let mut open = BinaryHeap::new();
    let mut closed = HashSet::new();
    open.push(Node {
        pos: origin,
        priority: 0,
    });

    while let Some(Node { pos, priority }) = open.pop() {
        closed.insert(pos);
        for neighbor in pos.neighbors() {
            if let Some(added_cost) = cost(neighbor) {}
        }
    }
}

#[derive(Eq, PartialEq)]
struct Node {
    pos: Pos,
    priority: u32,
}

impl Ord for Node {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.priority.cmp(&other.priority) {
            Ordering::Equal => Ordering::Equal,
            Ordering::Greater => Ordering::Less,
            Ordering::Less => Ordering::Greater,
        }
    }
}

impl PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
