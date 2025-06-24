import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Use CORS for all routes
app.use(cors());

// Parse JSON bodies for POST requests
app.use(express.json());

// Endpoint to serve default simulation parameters
app.get('/api/defaults', (req, res) => {
    console.log('DEV-SERVER: Received request for /api/defaults');
    const pythonProcess = spawn('python', ['api/defaults.py']);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`[PYTHON-DEFAULTS-ERR]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`DEV-SERVER: defaults.py script exited with code ${code}`);
            return res.status(500).json({ error: 'Failed to execute python script for defaults' });
        }
        try {
            const jsonData = JSON.parse(dataString);
            res.json(jsonData);
        } catch (e) {
            console.error('DEV-SERVER: Failed to parse JSON from defaults.py', e);
            res.status(500).json({ error: 'Failed to parse python script output' });
        }
    });
});

// Endpoint to run a simulation
app.post('/api/simulate', (req, res) => {
    console.log('DEV-SERVER: Received request for /api/simulate');
    const pythonProcess = spawn('python', ['api/simulate.py']);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[PYTHON-SIMULATE-ERR]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`DEV-SERVER: simulate.py script exited with code ${code}`);
            return res.status(500).json({ error: 'Failed to execute simulation script' });
        }
        try {
            const jsonData = JSON.parse(dataString);
            res.json(jsonData);
        } catch (e) {
            console.error('DEV-SERVER: Failed to parse JSON from simulate.py', e);
            res.status(500).json({ error: 'Failed to parse simulation script output' });
        }
    });

    // Send the client's request body to the python script's stdin
    pythonProcess.stdin.write(JSON.stringify(req.body));
    pythonProcess.stdin.end();
});

app.listen(PORT, () => {
    console.log(`🚀 Local development API server running on http://localhost:${PORT}`);
    console.log('   This server is for local development only.');
}); 