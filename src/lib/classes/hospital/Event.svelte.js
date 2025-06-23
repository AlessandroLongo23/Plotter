import { Patient } from '$lib/classes/hospital/Patient.svelte.js';

export class Event {
    constructor(time, patient_id, disease, allocation) {
        this.time = time;
        this.patient_id = patient_id;
        this.disease = disease;
        this.allocation = allocation;

        this.resolved = false;
    }
}

export class ArrivalEvent extends Event {
    constructor(time, patient_id, disease, allocation) {
        super(time, patient_id, disease, allocation);
    }

    resolve(hospital) {
        let patient = new Patient(this.patient_id, this.disease);
        let ward = hospital.wards.find(ward => ward.disease === this.allocation);
        hospital.addPatient(patient, ward);
        this.resolved = true;
    }
}

export class DischargeEvent extends Event {
    constructor(time, patient_id, disease, allocation) {
        super(time, patient_id, disease, allocation);
    }

    resolve(hospital) {
        console.log(this.patient_id, hospital.patients)
        let patient = hospital.patients.find(patient => patient.id === this.patient_id);
        hospital.dischargePatient(patient);
        this.resolved = true;
    }
}