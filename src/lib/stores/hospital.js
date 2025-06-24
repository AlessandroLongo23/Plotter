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
        rotation: 0
    },
    {
        disease: 'B',
        assignedBeds: 40,
        maxBeds: 40,
        color: '#0000ff',
        pos: new Vector(250, 400),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        disease: 'C',
        assignedBeds: 30,
        maxBeds: 30,
        color: '#00ff00',
        pos: new Vector(250, 650),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        disease: 'D',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#ffff00',
        pos: new Vector(850, 150),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        disease: 'E',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#ff00ff',
        pos: new Vector(850, 400),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        disease: 'F',
        assignedBeds: 0,
        maxBeds: null,
        color: '#00ffff',
        pos: new Vector(850, 650),
        size: new Vector(400, 200),
        rotation: 0
    }
])

export const patientTypes = writable([
    {
        disease: 'A',
        color: '#ff0000'
    },  
    {
        disease: 'B',
        color: '#0000ff'
    },
    {
        disease: 'C',
        color: '#00ff00'
    },
    {
        disease: 'D',
        color: '#ffff00'
    },
    {
        disease: 'E',
        color: '#ff00ff'
    },
    {
        disease: 'F',
        color: '#00ffff'
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