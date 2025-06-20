import { Vector } from '$lib/classes/Vector.svelte.js';
import { Bed } from '$lib/classes/hospital/Bed.svelte.js';
import { fromHexToHsl } from '$lib/utils/color.svelte.js';

export class Ward {
    constructor(pos, size, rotation, numBeds, color) {
        this.pos = pos;
        this.size = size;
        this.rotation = rotation
        this.numBeds = numBeds;
        this.color = fromHexToHsl(color);
        this.rows = 5;
        this.cols = 15;
        this.beds = Array.from({ length: numBeds }, (_, i) => new Bed(
            this.getBedPos(i), 
            new Vector(16, 24),
            0,
            this.color
        ));
    }

    draw(p5) {
        p5.push();
        p5.rectMode(p5.CENTER);
        p5.rotate(this.rotation);
        p5.fill(this.color.x, this.color.y * 0.5, this.color.z * 1.5);
        p5.stroke(this.color.x, this.color.y, this.color.z);
        p5.strokeWeight(2);
        this.pos.x = (this.pos.x + p5.width) % p5.width;
        p5.rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 10);

        for (let bed of this.beds) bed.draw(p5);

        p5.pop();
    }   

    getBedPos(i) {
        let row = i % this.rows;
        let col = (i - row) / this.rows;
        console.log(row, col);

        let off = new Vector(
            (col - this.cols / 2 + 0.5) * 24,
            (row - this.rows / 2 + 0.5) * 32,
        )

        return this.pos.copy().add(off);
    }

    addPatient(patient) {
        let freeBeds = this.beds.filter(bed => !bed.patient);
        if (freeBeds.length === 0) return;

        let bed = freeBeds.pickRandom();
        patient.assignToBed(bed);
    }
}