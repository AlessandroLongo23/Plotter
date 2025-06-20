import { ArrivalEvent, RejectEvent, DischargeEvent, TransferEvent } from '$lib/classes/hospital/Event.svelte.js';

import { Hospital } from '$lib/classes/hospital/Hospital.svelte.js';

export class Simulator {
    constructor() {
        this.data = [];
        this.hospital = new Hospital();
        this.events = [];
    }

    loadData(data) {
        this.data = data;
        this.processData();
    }

    processData() {
        this.events = [];

        for (let info of this.data) {
            switch (info.type) {
                case 'arrival':
                    this.events.push(new ArrivalEvent(info.time, info.patient, info.ward));
                    break;
                case 'reject':
                    this.events.push(new RejectEvent(info.time, info.patient, info.ward));
                    break;
                case 'discharge':
                    this.events.push(new DischargeEvent(info.time, info.patient));
                    break;
                case 'transfer':
                    this.events.push(new TransferEvent(info.time, info.patient, info.ward));
                    break;
            }
        }
    }

    update(time) {
        this.events.filter(event => event.time <= time && !event.resolved).forEach(event => event.resolve());
    }
}