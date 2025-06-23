import { Vector } from '$lib/classes/Vector.svelte.js';
import { Bed } from '$lib/classes/hospital/Bed.svelte.js';
import { fromHexToHsl } from '$lib/utils/color.svelte.js';

export class Ward {
    constructor(disease, pos, size, rotation, numBeds, color) {
        this.pos = pos;
        this.disease = disease;
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

    draw(p5, hospital) {
        p5.push();
        p5.rectMode(p5.CENTER);
        p5.rotate(this.rotation);
        p5.fill(this.color.x, this.color.y * 0.5, this.color.z * 1.5);
        p5.stroke(this.color.x, this.color.y, this.color.z);
        p5.strokeWeight(2);
        p5.rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 10);

        for (let bed of this.beds) bed.draw(p5, hospital);

        p5.pop();
    }   

    getBedPos(i) {
        let row = i % this.rows;
        let col = (i - row) / this.rows;

        let off = new Vector(
            (col - this.cols / 2 + 0.5) * 24,
            (row - this.rows / 2 + 0.5) * 32,
        )

        return this.pos.copy().add(off);
    }

    addPatient(patient) {
        let freeBeds = this.beds.filter(bed => bed.patient === null);
        if (freeBeds.length === 0) {
            return;
        }

        let bed = freeBeds.pickRandom();
        patient.assignToBed(bed);
    }

    // Method to update bed count dynamically
    updateBedCount(newBedCount) {
        if (newBedCount === this.numBeds) return; // No change needed
        
        const oldBedCount = this.numBeds;
        this.numBeds = newBedCount;
        
        if (newBedCount > oldBedCount) {
            // Add more beds
            for (let i = oldBedCount; i < newBedCount; i++) {
                this.beds.push(new Bed(
                    this.getBedPos(i), 
                    new Vector(16, 24),
                    0,
                    this.color
                ));
            }
        } else {
            // Remove beds (from the end, and only free ones)
            const bedsToRemove = oldBedCount - newBedCount;
            for (let i = 0; i < bedsToRemove; i++) {
                // Remove from the end, preferring free beds
                for (let j = this.beds.length - 1; j >= 0; j--) {
                    if (this.beds[j].patient === null) {
                        this.beds.splice(j, 1);
                        break;
                    }
                }
                // If no free beds found, remove the last one anyway
                if (this.beds.length > newBedCount) {
                    this.beds.pop();
                }
            }
        }
        
        console.log(`Ward ${this.disease}: Updated from ${oldBedCount} to ${newBedCount} beds`);
    }

    // Method to reset ward state
    reset() {
        for (let bed of this.beds) {
            bed.free();
        }
    }
}