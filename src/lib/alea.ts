// Port of alea.js to typescript
// From http://baagoe.com/en/RandomMusings/javascript/
// Johannes Baagøe <baagoe@baagoe.com>, 2010
// version 0.9

export default function Alea(...args: any[]) {
    const mash = Mash()
    let s0 = mash(' ')
    let s1 = mash(' ')
    let s2 = mash(' ')
    let c = 1

    if (args.length === 0) {
        args = [Date.now()]
    }

    for (let i = 0; i < args.length; i++) {
        s0 -= mash(args[i])
        if (s0 < 0) {
            s0 += 1
        }
        s1 -= mash(args[i])
        if (s1 < 0) {
            s1 += 1
        }
        s2 -= mash(args[i])
        if (s2 < 0) {
            s2 += 1
        }
    }

    return function random() {
      let t = 2091639 * s0 + c * 2.3283064365386963e-10 // 2^-32
      s0 = s1
      s1 = s2
      return s2 = t - (c = t | 0)
    }
}

function Mash() {
    let n = 0xefc8249d

    return function mash(data: any) {
        data = data.toString()
        for (let i = 0; i < data.length; i++) {
            n += data.charCodeAt(i)
            let h = 0.02519603282416938 * n
            n = h >>> 0
            h -= n
            h *= n
            n = h >>> 0
            h -= n
            n += h * 0x100000000 // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10 // 2^-32
    }
}
