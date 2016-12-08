import math


def roundtieup(n):
    return math.floor(n + 0.5)


def roundtiedown(n):
    return math.ceil(n - 0.5)


def scan(r, start, end, transparent):
    if start < end:
        minarc = roundtiedown((r - 0.5) * start)
        maxarc = roundtieup((r + 0.5) * start)
        exists = False
        for arc in range(minarc, maxarc + 1):
            if transparent(arc, r):
                if arc >= r * start and arc <= r * end:
                    yield (arc, r)
                    exists = True
                    if not transparent(arc, r + 1):
                        yield (arc, r + 1)
                    if not transparent(arc + 1, r + 1):
                        yield (arc + 1, r + 1)
            else:
                if exists:
                    yield from scan(r + 1, start, (arc - 0.5) / r, transparent)
                start = (arc + 0.5) / r
                if start >= end:
                    break
        if exists:
            yield from scan(y + 1, start, end, transparent)


def fov(center, transparent):
    yield center
    transforms = (
        (*dir1, *dir5),
        (*dir3, *dir7),
        (*dir5, *dir9),
        (*dir7, *dir11),
        (*dir9, *dir1),
        (*dir11, *dir3))
    for arcdx, arcdy, rdx, rdy in transforms:
        pass
