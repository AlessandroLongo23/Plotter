import { writable } from 'svelte/store';

class HttpApiService {
    constructor() {
        this.simulationResults = writable(null);
        this.simulationRunning = writable(false);
        this.defaultParameters = writable(null);
        this.error = writable(null);
        this.status = writable('ready');
        
        this.baseUrl = this.getApiBaseUrl();
    }

    getApiBaseUrl() {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
            
            if (isLocal) {
                // For local development, use the development API server
                return 'http://localhost:3001/api';
            } else {
                // For production (Vercel), use the same domain
                return '/api';
            }
        }
        return '/api';
    }

    async fetchDefaults() {
        try {
            this.status.set('fetching defaults...');
            
            const response = await fetch(`${this.baseUrl}/defaults`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.defaultParameters.set(data);
            this.status.set('ready');
            this.error.set(null);
            
            return data;
        } catch (error) {
            console.error('Error fetching defaults:', error);
            this.error.set(`Failed to fetch defaults: ${error.message}`);
            this.status.set('error');
            throw error;
        }
    }

    async runSimulation(parameters) {
        try {
            this.simulationRunning.set(true);
            this.status.set('running simulation...');
            this.error.set(null);
            
            const requestBody = {
                time: parameters.time || 365,
                bed_distribution: parameters.bedDistribution,
                arrival_rates: parameters.arrivalRates,
                stay_means: parameters.stayMeans
            };

            const response = await fetch(`${this.baseUrl}/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                const transformedData = {
                    type: "sim_complete",
                    total_events: data.total_events,
                    event_history: data.event_history,
                    parameters: data.parameters
                };
                
                this.simulationResults.set(transformedData);
                this.status.set('simulation completed');
            } else {
                throw new Error(data.error || 'Simulation failed');
            }

            return data;
        } catch (error) {
            console.error('Error running simulation:', error);
            this.error.set(`Simulation failed: ${error.message}`);
            this.status.set('error');
            throw error;
        } finally {
            this.simulationRunning.set(false);
        }
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/defaults`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

export const httpApiService = new HttpApiService(); 