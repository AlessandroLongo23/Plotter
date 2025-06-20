import { Vector } from '$lib/classes/Vector.svelte.js';
import { writable } from 'svelte/store';

export const controls = writable({
    targetOffset: new Vector(0, 0),
    targetZoom: 50,
});