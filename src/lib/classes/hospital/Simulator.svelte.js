import { ArrivalEvent, DischargeEvent } from '$lib/classes/hospital/Event.svelte.js';

import { Hospital } from '$lib/classes/hospital/Hospital.svelte.js';

export class Simulator {
    constructor() {
        this.data = [];
        this.hospital = new Hospital();
        this.events = [];
    }

    async loadData(filepath) {
        try {
            const response = await fetch(filepath);
            const text = await response.text();
            this.data = text.split('\n')
                .filter(line => line.trim() !== '')
                .filter(line => !line.includes('REJECTED'))
                .slice(1);
            this.processData();
        } catch (error) {
            console.error('Error loading data file:', error);
        }
    }

    processData() {
        this.events = [];

        for (let info of this.data) {
            let [type, patient_id, time, disease, allocation] = info.split(', ');
            time = parseFloat(time);
            patient_id = parseInt(patient_id);
            allocation = allocation.trim();

            switch (type) {
                case 'Arrival':
                    this.events.push(new ArrivalEvent(time, patient_id, disease, allocation));
                    break;
                case 'Departure':
                    this.events.push(new DischargeEvent(time, patient_id, disease, allocation));
                    break;
            }
        }
    }

    update(time) {
        let eventsToResolve = this.events.filter(event => event.time <= time && !event.resolved).sort((a, b) => a.time - b.time);
        for (let event of eventsToResolve) 
            event.resolve(this.hospital);

        // this.events = this.events.filter(event => event.time > time || event.resolved);
    }
}