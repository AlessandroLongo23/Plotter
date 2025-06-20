export class Event {
    constructor(time, type, data) {
        this.time = time;
        this.type = type;
        this.data = data;
        this.resolved = false;
    }

    resolve() {
        this.resolve();
        this.resolved = true;
    }
}

export class ArrivalEvent extends Event {
    constructor(time, patient, ward) {
        super(time, 'arrival', { patient, ward });
    }

    resolve() {
        hospital.addPatient(this.data.patient, this.data.ward);
    }
}

export class RejectEvent extends Event {
    constructor(time, patient) {
        super(time, 'reject', patient);
    }

    resolve() {
        hospital.rejectPatient(this.data.patient);
    }
}

export class DischargeEvent extends Event {
    constructor(time, patient) {
        super(time, 'discharge', patient);
    }

    resolve() {
        hospital.dischargePatient(this.data.patient);
    }
}

export class TransferEvent extends Event {
    constructor(time, patient, ward) {
        super(time, 'transfer', { patient, ward });
    }

    resolve() {
        hospital.transferPatient(this.data.patient, this.data.ward);
    }
}