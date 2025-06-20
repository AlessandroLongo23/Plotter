export class Grid {
    constructor() {}

    renderAxis(p5, minx, maxx, miny, maxy) {
        p5.stroke(0, 0, 0);
        p5.line(minx, 0, maxx, 0);
        p5.line(0, miny, 0, maxy);
    }

    renderGrid(p5, minx, maxx, miny, maxy) {
        p5.stroke(0, 0, 0, 63);
        for (let x = 0; x < maxx; x += 1) {
            p5.line(x, miny, x, maxy);
        }

        for (let x = 0; x > minx; x -= 1) {
            p5.line(x, miny, x, maxy);
        }

        for (let y = 0; y < maxy; y += 1) {
            p5.line(minx, y, maxx, y);
        }

        for (let y = 0; y > miny; y -= 1) {
            p5.line(minx, y, maxx, y);
        }
    }
}