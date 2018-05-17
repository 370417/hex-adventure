use grid::{Pos, Direction, DIRECTIONS, decompose};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, VecDeque};

pub(super) fn jps<FG, FP, FH>(origin: Pos, is_goal: FG, passable: FP, heuristic: FH) -> Option<Vec<Pos>>
where
    FG: Fn(Pos) -> bool,
    FP: Fn(Pos) -> bool,
    FH: Fn(Pos) -> u32,
{
    if is_goal(origin) {
        return Some(vec![origin]);
    }
    let mut open = BinaryHeap::with_capacity(6);
    let origin_heuristic = heuristic(origin);
    for &direction in DIRECTIONS.iter() {
        open.push(MinHeapItem {
            node: Node::JumpPoint(JumpPoint {
                pos: origin,
                direction,
                chirality: Chirality::Clockwise,
            }),
            priority: origin_heuristic,
        });
    }
    let mut cost = HashMap::new();
    cost.insert(origin, 0);
    let mut parents = HashMap::new();
    while let Some(MinHeapItem { node, .. }) = open.pop() {
        match node {
            Node::Goal(pos) => {
                let total_cost = cost.get(&pos).unwrap();
                return Some(construct_path(parents, pos, *total_cost))
            }
            Node::JumpPoint(curr) => {
                let curr_pos = curr.pos;
                for neighbor in curr.neighbors(&is_goal, &passable) {
                    let neighbor_pos = neighbor.pos();
                    let new_cost = cost.get(&curr_pos).unwrap() + neighbor.pos().distance(curr_pos);
                    if let Some(&existing_cost) = cost.get(&neighbor_pos) {
                        // normally we would skip a neighbor if its cost was equal to the cost found already
                        // here we don't because in this implementation of jps,
                        // multiple neighbors can be created for a single position
                        if new_cost > existing_cost {
                            continue;
                        }
                    }
                    open.push(MinHeapItem {
                        node: neighbor,
                        priority: new_cost + heuristic(neighbor_pos)
                    });
                    parents.insert(neighbor_pos, curr.clone());
                    cost.insert(neighbor_pos, new_cost);
                }
            }
        }
    }
    None
}

fn construct_path(parents: HashMap<Pos, JumpPoint>, goal: Pos, total_cost: u32) -> Vec<Pos> {
    let mut path = VecDeque::with_capacity(1 + total_cost as usize);
    path.push_back(goal);
    let mut pos = goal;
    while let Some(jump_point) = parents.get(&pos) {
        let stem_direction = jump_point.direction;
        let leaf_direction = rotate(jump_point.direction, 1, jump_point.chirality);
        let (stem_cost, leaf_cost) = decompose(pos - jump_point.pos, stem_direction, leaf_direction);
        let stem_tip = jump_point.pos + stem_direction * stem_cost;
        for x in (0..leaf_cost).rev() {
            path.push_back(stem_tip + leaf_direction * x);
        }
        for y in (0..stem_cost).rev() {
            path.push_back(jump_point.pos + stem_direction * y);
        }
        pos = jump_point.pos;
    }
    Vec::from(path)
}

#[derive(PartialEq, Eq)]
struct MinHeapItem {
    node: Node,
    priority: u32,
}

fn reverse(ordering: Ordering) -> Ordering {
    match ordering {
        Ordering::Equal => Ordering::Equal,
        Ordering::Greater => Ordering::Less,
        Ordering::Less => Ordering::Greater,
    }
}

impl PartialOrd for MinHeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(reverse(self.priority.cmp(&other.priority)))
    }
}

impl Ord for MinHeapItem {
    fn cmp(&self, other: &Self) -> Ordering {
        reverse(self.priority.cmp(&other.priority))
    }
}

#[derive(PartialEq, Eq)]
enum Node {
    Goal(Pos),
    JumpPoint(JumpPoint),
}

impl Node {
    fn pos(&self) -> Pos {
        match self {
            Node::Goal(pos) => *pos,
            Node::JumpPoint(jump_point) => jump_point.pos,
        }
    }
}

#[derive(PartialEq, Eq, Hash, Clone)]
struct JumpPoint {
    pos: Pos,
    direction: Direction,
    chirality: Chirality,
}

#[derive(PartialEq, Eq, Hash, Copy, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

impl JumpPoint {
    pub fn neighbors<FG, FP>(&self, is_goal: &FG, passable: &FP) -> Vec<Node>
    where
        FG: Fn(Pos) -> bool,
        FP: Fn(Pos) -> bool,
    {
        let mut neighbors = Vec::new();
        let pos = self.pos;
        let direction = self.direction;
        let chirality = self.chirality;
        let leaf_direction = rotate(direction, 1, chirality);
        for y in 1.. {
            let pos = pos + direction * y;
            if !passable(pos) {
                break;
            }
            if is_goal(pos) {
                neighbors.push(Node::Goal(pos));
            } else if let Some(jump_point) = forced_neighbor(pos, direction, chirality, passable) {
                neighbors.push(Node::JumpPoint(jump_point));
            }
            for x in 1.. {
                let pos = pos + leaf_direction * x;
                if !passable(pos) {
                    break;
                }
                if is_goal(pos) {
                    neighbors.push(Node::Goal(pos));
                } else {
                    if let Some(jump_point) = forced_neighbor(pos, leaf_direction, chirality, passable) {
                        neighbors.push(Node::JumpPoint(jump_point));
                    }
                    if let Some(jump_point) = forced_neighbor(pos, leaf_direction, chirality.opposite(), passable) {
                        neighbors.push(Node::JumpPoint(jump_point));
                    }
                }
            }
        }
        neighbors
    }
}

fn forced_neighbor<FP>(pos: Pos, direction: Direction, chirality: Chirality, passable: &FP) -> Option<JumpPoint>
where
    FP: Fn(Pos) -> bool,
{
    let corner = pos + rotate(direction, -2, chirality);
    let turn = rotate(direction, -1, chirality);
    if !passable(corner) && passable(pos + turn) {
        Some(JumpPoint {
            pos,
            direction: turn,
            chirality,
        })
    } else {
        None
    }
}

impl Chirality {
    fn opposite(&self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}

fn rotate(direction: Direction, n: i32, chirality: Chirality) -> Direction {
    match chirality {
        Chirality::Clockwise => direction.rotate(n),
        Chirality::Counterclockwise => direction.rotate(-n),
    }
}
