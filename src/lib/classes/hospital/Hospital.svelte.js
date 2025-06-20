import { Ward } from '$lib/classes/hospital/Ward.svelte.js';
import { Vector } from '$lib/classes/Vector.svelte.js';
import { wards } from '$lib/stores/hospital.js';

export class Hospital {
    constructor(data) {
        this.wards = [];
        this.patients = [];
        wards.subscribe(wards => {
            this.wards = wards.map(ward => new Ward(ward.pos, ward.size, ward.rotation, ward.assignedBeds, ward.color));
        });
    }

    draw(p5) {
        for (let ward of this.wards) ward.draw(p5);
        for (let patient of this.patients) patient.draw(p5);
    }

    // events
    addPatient(patient, ward) {
        this.patients.push(patient);
        ward.addPatient(patient);
    }

    rejectPatient(patient) {
        this.patients.splice(this.patients.indexOf(patient), 1);
        patient.bed.free();
    }

    dischargePatient(patient) {
        this.patients.splice(this.patients.indexOf(patient), 1);
        patient.bed.free();
    }

    transferPatient(patient, ward) {
        this.patients.find(p => p === patient).ward = ward;
        patient.bed.free();
        ward.addPatient(patient);
    }
}