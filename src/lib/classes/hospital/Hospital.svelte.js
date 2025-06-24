import { Ward } from '$lib/classes/hospital/Ward.svelte.js';
import { Vector } from '$lib/classes/Vector.svelte.js';
import { wards } from '$lib/stores/hospital.js';
import { Metrics } from '$lib/classes/hospital/Metrics.svelte.js';

export class Hospital {
    constructor(data) {
        this.wards = [];
        this.patients = [];
        let ws = [];
        wards.subscribe(wards => {
            ws = wards;
        });
        this.wards = ws.map(ward => new Ward(ward.disease, ward.pos, ward.size, ward.rotation, ward.assignedBeds, ward.color, ward.relocationsProbabilities, ward.urgency));
        this.metrics = new Metrics();
    }

    draw(p5) {
        for (let ward of this.wards) ward.draw(p5, this);
        for (let patient of this.patients) patient.draw(p5);
    }

    addPatient(time, patient, ward) {
        this.patients.push(patient);
        ward.addPatient(patient);

        this.metrics.patientsTreated[patient.disease]++;
        if (ward.disease == patient.disease)
            return

        let patientWard = this.wards.find(w => w.disease === patient.disease)
        let urgency = patientWard.urgency;
        let multiplier = 1 - patientWard.relocationsProbabilities[ward.disease];
        this.metrics.urgencyHistory.push({
            time: time,
            disease: patient.disease,
            urgency: urgency * multiplier,
        });
        this.metrics.acceptanceHistory.push({
            time: time,
            disease: ward.disease,
            acceptance: 1,
        });
    }

    dischargePatient(patient) {
        patient.bed.free();
        this.patients.splice(this.patients.indexOf(patient), 1);
    }

    losePatient(time, disease, allocation) {
        this.metrics.patientsRejected[disease]++;
        let urgency = this.wards.find(w => w.disease === disease).urgency;
        this.metrics.urgencyHistory.push({
            time: time,
            disease: disease,
            urgency: urgency,
        });
        this.metrics.acceptanceHistory.push({
            time: time,
            disease: disease,
            acceptance: 0,
        });
    }

    updateBedDistribution(bedDistribution) {
        for (let ward of this.wards) {
            if (bedDistribution[ward.disease] !== undefined) {
                ward.updateBedCount(bedDistribution[ward.disease]);
            }
        }
        console.log('Updated hospital bed distribution:', bedDistribution);
    }

    getWard(disease) {
        return this.wards.find(ward => ward.disease === disease);
    }

    reset() {
        this.metrics.reset();
        this.patients = [];
        for (let ward of this.wards) {
            ward.reset();
        }
    }
}