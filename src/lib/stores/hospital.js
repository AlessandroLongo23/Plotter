import { writable } from 'svelte/store';
import { Vector } from '$lib/classes/Vector.svelte.js';

export const wards = writable([
    {
        disease: 'A',
        assignedBeds: 55,
        maxBeds: 55,
        color: '#ff0000',
        pos: new Vector(250, 150),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.00, B: 0.05, C: 0.10, D: 0.05, E: 0.80, F: 0.00},
        urgency: 7,
    },
    {
        disease: 'B',
        assignedBeds: 40,
        maxBeds: 40,
        color: '#00ff00',
        pos: new Vector(250, 400),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.20, B: 0.00, C: 0.50, D: 0.15, E: 0.15, F: 0.00},
        urgency: 5,
    },
    {
        disease: 'C',
        assignedBeds: 30,
        maxBeds: 30,
        color: '#0000ff',
        pos: new Vector(250, 650),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.30, B: 0.20, C: 0.00, D: 0.20, E: 0.30, F: 0.00},
        urgency: 2,
    },
    {
        disease: 'D',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#00ffff',
        pos: new Vector(850, 150),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.35, B: 0.30, C: 0.05, D: 0.00, E: 0.30, F: 0.00},
        urgency: 10,
    },
    {
        disease: 'E',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#ff00ff',
        pos: new Vector(850, 400),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.20, B: 0.10, C: 0.60, D: 0.10, E: 0.00, F: 0.00},
        urgency: 5,
    },
    {
        disease: 'F',
        assignedBeds: 0,
        maxBeds: null,
        color: '#ffff00',
        pos: new Vector(850, 650),
        size: new Vector(400, 200),
        rotation: 0,
        relocationsProbabilities: {A: 0.20, B: 0.20, C: 0.20, D: 0.20, E: 0.20, F: 0.00},
        urgency: 0,
    }
])

export const patientTypes = writable([
    {
        disease: 'A',
        color: '#ff0000'
    },  
    {
        disease: 'B',
        color: '#00ff00'
    },
    {
        disease: 'C',
        color: '#0000ff'
    },
    {
        disease: 'D',
        color: '#00ffff'
    },
    {
        disease: 'E',
        color: '#ff00ff'
    },
    {
        disease: 'F',
        color: '#ffff00'
    }
])

export const simulationParameters = writable({
    time: 365,
    arrivalRates: {
        A: 14.5,
        B: 11.0,
        C: 8.0,
        D: 6.5,
        E: 5.0,
        F: 13.0
    },
    stayMeans: {
        A: 2.9,
        B: 4.0,
        C: 4.5,
        D: 1.4,
        E: 3.9,
        F: 2.2
    }
});

export const simulationResults = writable(null);
export const simulationRunning = writable(false);