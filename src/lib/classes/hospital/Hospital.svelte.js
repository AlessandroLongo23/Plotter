import { Ward } from '$lib/classes/hospital/Ward.svelte.js';
import { Vector } from '$lib/classes/Vector.svelte.js';
import { wards } from '$lib/stores/hospital.js';

export class Hospital {
    constructor(data) {
        this.wards = [];
        this.patients = [];
        wards.subscribe(wards => {
            this.wards = wards.map(ward => new Ward(ward.disease, ward.pos, ward.size, ward.rotation, ward.assignedBeds, ward.color));
        });
    }

    draw(p5) {
        for (let ward of this.wards) ward.draw(p5, this);
        for (let patient of this.patients) patient.draw(p5);
    }

    addPatient(patient, ward) {
        this.patients.push(patient);
        ward.addPatient(patient);
    }

    dischargePatient(patient) {
        console.log(patient)
        patient.bed.free();
        this.patients.splice(this.patients.indexOf(patient), 1);
    }

    // Method to update bed distribution dynamically
    updateBedDistribution(bedDistribution) {
        for (let ward of this.wards) {
            if (bedDistribution[ward.disease] !== undefined) {
                ward.updateBedCount(bedDistribution[ward.disease]);
            }
        }
        console.log('Updated hospital bed distribution:', bedDistribution);
    }

    // Method to get current ward by disease type
    getWard(disease) {
        return this.wards.find(ward => ward.disease === disease);
    }

    // Method to reset hospital state
    reset() {
        this.patients = [];
        for (let ward of this.wards) {
            ward.reset();
        }
    }
}