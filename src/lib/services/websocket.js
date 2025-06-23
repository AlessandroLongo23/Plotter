import { writable } from 'svelte/store';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.connected = writable(false);
        this.status = writable('disconnected');
        this.simulationResults = writable(null);
        this.simulationRunning = writable(false);
        this.defaultParameters = writable(null);
        this.error = writable(null);
        
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        try {
            this.ws = new WebSocket('ws://localhost:8765');
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.connected.set(true);
                this.status.set('connected');
                this.error.set(null);
                this.reconnectAttempts = 0;
                
                // Request default parameters on connection
                this.getDefaults();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected.set(false);
                this.status.set('disconnected');
                this.simulationRunning.set(false);
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.status.set(`reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                        this.connect();
                    }, this.reconnectDelay);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.error.set('Connection error. Make sure the Python server is running.');
                this.status.set('error');
            };

        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.error.set('Failed to connect. Make sure the Python server is running.');
            this.status.set('error');
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'info':
                console.log('Server info:', data.message);
                this.status.set(data.message);
                break;
                
            case 'sim_complete':
                console.log('Simulation completed:', data);
                this.simulationResults.set(data);
                this.simulationRunning.set(false);
                this.status.set('Simulation completed');
                break;
                
            case 'defaults':
                console.log('Received default parameters:', data);
                this.defaultParameters.set(data);
                break;
                
            case 'error':
                console.error('Server error:', data.message);
                this.error.set(data.message);
                this.simulationRunning.set(false);
                this.status.set('Error');
                break;
                
            default:
                console.log('Unknown message type:', data);
        }
    }

    runSimulation(parameters) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.error.set('Not connected to server');
            return;
        }

        this.simulationRunning.set(true);
        this.status.set('Starting simulation...');
        this.error.set(null);

        const message = {
            cmd: 'run_sim',
            time: parameters.time || 365,
            bed_distribution: parameters.bedDistribution,
            arrival_rates: parameters.arrivalRates,
            stay_means: parameters.stayMeans
        };

        this.ws.send(JSON.stringify(message));
    }

    getDefaults() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const message = { cmd: 'get_defaults' };
        this.ws.send(JSON.stringify(message));
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const websocketService = new WebSocketService(); 