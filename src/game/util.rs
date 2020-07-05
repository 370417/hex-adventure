//! Miscellaneous functions.

pub mod dijkstra;
pub mod floodfill;
pub mod fov;
pub mod minheap;

/// Zip a slice with itself but rotated forward by one.
pub fn self_zip<T: Copy>(slice: &[T]) -> Vec<(T, T)> {
    let mut v = Vec::with_capacity(slice.len());
    for (i, &element) in slice.iter().enumerate() {
        let next_element = slice[(i + 1) % slice.len()];
        v.push((element, next_element));
    }
    v
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_self_zip() {
        let array = [1, 2, 3];
        let result = vec![(1, 2), (2, 3), (3, 1)];
        assert_eq!(self_zip(&array), result);
    }
}
