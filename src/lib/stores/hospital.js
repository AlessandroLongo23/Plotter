import { writable } from 'svelte/store';
import { Vector } from '$lib/classes/Vector.svelte.js';

export const wards = writable([
    {
        name: 'A',
        assignedBeds: 55,
        maxBeds: 55,
        color: '#ff0000',
        pos: new Vector(250, 150),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        name: 'B',
        assignedBeds: 40,
        maxBeds: 40,
        color: '#0000ff',
        pos: new Vector(250, 400),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        name: 'C',
        assignedBeds: 30,
        maxBeds: 30,
        color: '#00ff00',
        pos: new Vector(250, 650),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        name: 'D',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#ffff00',
        pos: new Vector(-250, 150),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        name: 'E',
        assignedBeds: 20,
        maxBeds: 20,
        color: '#ff00ff',
        pos: new Vector(-250, 400),
        size: new Vector(400, 200),
        rotation: 0
    },
    {
        name: 'F',
        assignedBeds: 0,
        maxBeds: null,
        color: '#00ffff',
        pos: new Vector(-250, 650),
        size: new Vector(400, 200),
        rotation: 0
    }
])