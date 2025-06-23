import { Vector } from '$lib/classes/Vector.svelte.js';
import { patientTypes } from '$lib/stores/hospital.js';
import { fromHexToHsl } from '$lib/utils/color.svelte.js';

export class Patient {
    constructor(id, disease) {
        this.id = id;
        this.disease = disease.trim();

        this.pos = new Vector(0, 0);
        patientTypes.subscribe(types => {
            this.color = types.find(t => t.disease === this.disease).color;
            this.color = fromHexToHsl(this.color);
        });
        this.bed = null
    }

    assignToBed(bed) {
        bed.patient = this;
        this.bed = bed;
        
        this.pos = bed.pos.copy();
    }

    draw(p5, pos = null, opacity = 1) {
        pos = pos || this.pos;
        
        p5.push();
        p5.fill(this.color.x, this.color.y, this.color.z * opacity);
        p5.ellipse(pos.x, pos.y, 10, 10);
        p5.pop();
    }
}