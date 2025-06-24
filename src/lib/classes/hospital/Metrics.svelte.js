export class Metrics {
    constructor() {
        this.reset();
    }

    reset() {
        this.urgencyHistory = [];
        this.acceptanceHistory = [];
        
        this.patientsTreated = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
        };
        this.patientsRejected = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
        };
    }
}