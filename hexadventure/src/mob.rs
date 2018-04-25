use grid::Direction;

pub trait Mob {
    fn facing(&self) -> Direction;
    fn facing_mut(&self) -> &mut Direction;
}
