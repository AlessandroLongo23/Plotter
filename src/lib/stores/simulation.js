import { writable } from 'svelte/store';

export const simulator = writable(null);

export const simulationPlaybackState = writable({
    hasSimulationData: false,
    isPlaying: false,
    speed: 1,
    time: 0,
    prevTime: null,
    maxTime: 365,
});