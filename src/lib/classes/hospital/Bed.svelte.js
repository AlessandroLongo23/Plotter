export class Bed {
    constructor(pos, size, rotation, color) {
        this.pos = pos;
        this.size = size;
        this.rotation = rotation;
        this.color = color;

        this.patient = null;
    }

    draw(p5) {
        p5.fill(360, 0, 100);
        p5.stroke(0, 0, 20);
        p5.rotate(this.rotation);
        p5.rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 3);

        if (this.patient) this.patient.draw(p5, this.pos, 0.7);
    }

    free() {
        this.patient = null;
    }
}