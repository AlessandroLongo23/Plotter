import { ArrivalEvent, DischargeEvent } from '$lib/classes/hospital/Event.svelte.js';

import { Hospital } from '$lib/classes/hospital/Hospital.svelte.js';

export class Simulator {
    constructor() {
        this.data = [];
        this.hospital = new Hospital();
        this.events = [];
        this.currentParameters = null;
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

    // New method to load data from API event history
    async loadFromEventHistory(eventHistory) {
        if (!eventHistory || !Array.isArray(eventHistory)) {
            console.error('Invalid event history data');
            return;
        }

        this.events = [];
        
        for (let eventData of eventHistory) {
            if (!eventData.event || eventData.allocation === 'Rejected') continue;
            
            const event = eventData.event;
            const allocation = eventData.allocation;
            
            const time = parseFloat(event.time);
            const patient_id = parseInt(event.patient_id);
            const disease = event.disease;
            const wardAllocation = allocation.ward || allocation;

            switch (event.type) {
                case 'Arrival':
                    this.events.push(new ArrivalEvent(time, patient_id, disease, wardAllocation));
                    break;
                case 'Departure':
                case 'Transfer':
                    this.events.push(new DischargeEvent(time, patient_id, disease, wardAllocation));
                    break;
            }
        }

        // Reset hospital state
        this.hospital = new Hospital();
        
        // Sort events by time
        this.events.sort((a, b) => a.time - b.time);
        
        console.log(`Loaded ${this.events.length} events from API data`);
    }

    // New method to update parameters dynamically
    updateParameters(parameters) {
        if (!parameters) return;
        
        this.currentParameters = parameters;
        
        // Update hospital bed distribution if provided
        if (parameters.bedDistribution) {
            this.hospital.updateBedDistribution(parameters.bedDistribution);
        }
        
        // Store arrival rates and stay means for potential future use
        if (parameters.arrivalRates) {
            this.arrivalRates = parameters.arrivalRates;
        }
        
        if (parameters.stayMeans) {
            this.stayMeans = parameters.stayMeans;
        }
        
        console.log('Updated simulator parameters:', parameters);
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

    // Method to reset simulation state
    reset() {
        this.events.forEach(event => event.resolved = false);
        this.hospital = new Hospital();
        
        // Reapply current parameters if they exist
        if (this.currentParameters) {
            this.updateParameters(this.currentParameters);
        }
    }
}