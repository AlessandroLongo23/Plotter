import { writable } from 'svelte/store';

export const sidebarSections = writable({
    simulation: true,
    wardBeds: true,
    arrivalRates: true,
    lengthOfStay: true
}); 