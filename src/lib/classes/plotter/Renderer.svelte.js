import { RasterContours } from '$lib/classes/plotter/RasterContours.svelte.js';
import { Grid } from '$lib/classes/plotter/Grid.svelte.js';
import { Vector } from '$lib/classes/Vector.svelte.js';

export class Renderer {
    constructor() {
        this.center = new Vector(0, 0);
        this.scale = 1;

        this.grid = new Grid();
        this.rasterContours = new RasterContours();

        this.contours = [];
    }

    update(fn, minx, maxx, miny, maxy, dx, dy) {
        this.contours = this.rasterContours.getContours(fn, minx, maxx, miny, maxy, dx, dy, false, 5);
    }

    render(p5, minx, maxx, miny, maxy) {
        this.grid.renderGrid(p5, minx, maxx, miny, maxy);
        this.grid.renderAxis(p5, minx, maxx, miny, maxy);

        this.contours.forEach(contour => {
            p5.line(contour[0][0], contour[0][1], contour[1][0], contour[1][1]);
        });
    }

    // drawIntegral(p5, minx, maxx, miny, maxy, fn, a, b) {
    //     p5.stroke(0);
    //     p5.fill(255, 0, 0, 31);

    //     p5.beginShape();
    //     p5.vertex(a, fn(a));
    //     // draw the line from fn(a) to fn(b)
    //     p5.vertex(b, fn(b));
    //     p5.endShape();
    // }
}