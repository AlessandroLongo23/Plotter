import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Parse JSON bodies
app.use(express.json());

// Mock defaults endpoint
app.get('/api/defaults', (req, res) => {
    try {
        // Return default values matching your Python problem.py
        const defaults = {
            "bed_distribution": {
                "A": 55,
                "B": 40,
                "C": 30,
                "D": 20,
                "E": 20,
                "F": 0,
            },
            "arrival_rates": {
                "A": 14.5,
                "B": 11.0,
                "C": 8.0,
                "D": 6.5,
                "E": 5.0,
                "F": 13.0,
            },
            "stay_means": {
                "A": 2.9,
                "B": 4.0,
                "C": 4.5,
                "D": 1.4,
                "E": 3.9,
                "F": 2.2,
            }
        };
        
        res.json(defaults);
    } catch (error) {
        console.error('Error in /api/defaults:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mock simulate endpoint (runs actual Python script)
app.post('/api/simulate', async (req, res) => {
    try {
        const { time = 365, bed_distribution, arrival_rates, stay_means } = req.body;
        
        console.log('Running simulation with parameters:', {
            time,
            bed_distribution,
            arrival_rates,
            stay_means
        });
        
        // For development, return mock data
        // In a real implementation, you'd run your Python script here
        const eventHistory = generateMockEventHistory(time, arrival_rates, stay_means);
        const mockResult = {
            "success": true,
            "total_events": eventHistory.length,
            "event_history": eventHistory,
            "parameters": {
                "time": time,
                "bed_distribution": bed_distribution,
                "arrival_rates": arrival_rates,
                "stay_means": stay_means
            }
        };
        
        // Simulate some processing time
        setTimeout(() => {
            res.json(mockResult);
        }, 2000);
        
    } catch (error) {
        console.error('Error in /api/simulate:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

function generateMockEventHistory(simulationTime, arrivalRates = null, stayMeans = null) {
    const events = [];
    const diseases = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Default rates if not provided
    const defaultRates = {
        "A": 14.5, "B": 11.0, "C": 8.0, "D": 6.5, "E": 5.0, "F": 13.0
    };
    const defaultStays = {
        "A": 2.9, "B": 4.0, "C": 4.5, "D": 1.4, "E": 3.9, "F": 2.2
    };
    
    const rates = arrivalRates || defaultRates;
    const stays = stayMeans || defaultStays;
    
    let patientId = 0;
    
    // Generate arrivals for each disease based on their rates
    diseases.forEach(disease => {
        const arrivalRate = rates[disease];
        const stayMean = stays[disease];
        
        // Calculate expected number of arrivals for this disease
        const expectedArrivals = Math.round(arrivalRate * simulationTime);
        
        // Generate arrival events
        for (let i = 0; i < expectedArrivals; i++) {
            const arrivalTime = Math.random() * simulationTime;
            const stayDuration = Math.random() * stayMean * 2; // Exponential-ish distribution
            const departureTime = arrivalTime + stayDuration;
            
            // Add arrival event
            events.push({
                event: {
                    type: 'Arrival',
                    time: arrivalTime,
                    patient_id: patientId,
                    disease: disease
                },
                allocation: {
                    ward: disease,
                    stay_duration: stayDuration
                }
            });
            
            // Add departure event (if within simulation time)
            if (departureTime <= simulationTime) {
                events.push({
                    event: {
                        type: 'Departure',
                        time: departureTime,
                        patient_id: patientId,
                        disease: disease
                    },
                    allocation: {
                        ward: disease,
                        stay_duration: stayDuration
                    }
                });
            }
            
            patientId++;
        }
    });
    
    // Sort events by time
    return events.sort((a, b) => a.event.time - b.event.time);
}

app.listen(PORT, () => {
    console.log(`🚀 Development API server running on http://localhost:${PORT}`);
    console.log(`📍 Available endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/defaults`);
    console.log(`   POST http://localhost:${PORT}/api/simulate`);
    console.log('');
    console.log('💡 This server provides mock API responses for local development.');
    console.log('   For full Python simulation, use WebSocket mode or Vercel dev.');
}); 