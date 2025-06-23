# Hospital Simulation Interface

This project implements a complete hospital simulation system with a Python backend and Svelte frontend, connected via WebSocket for real-time parameter configuration and visualization.

## Features

### Backend (Python)
- Stochastic hospital simulation with multiple wards and patient types
- Configurable parameters: bed distribution, arrival rates, length of stay
- WebSocket server for real-time communication
- Event-based simulation with comprehensive logging

### Frontend (Svelte + p5.js)
- Interactive parameter controls with sliders
- Real-time simulation visualization
- Ward and patient visualization
- Simulation playback controls

## Setup and Installation

### Prerequisites
- Python 3.7+
- Node.js 18+
- npm or yarn

### Python Dependencies
```bash
pip install websockets numpy
```

### Node.js Dependencies
```bash
npm install
```

## Running the Application

### Option 1: Run Everything at Once
```bash
npm start
```
This will start both the Python WebSocket server and the Svelte development server.

### Option 2: Run Separately
Terminal 1 (Python server):
```bash
python start_server.py
```

Terminal 2 (Svelte frontend):
```bash
npm run dev
```

## Usage

### 1. Parameter Configuration
In the sidebar, you can configure:

- **Ward Beds**: Set the number of beds for each ward (A, B, C, D, E)
  - Ward F beds are automatically calculated as available beds
- **Arrival Rates**: Set patient arrival rates for each disease type (patients/day)
- **Length of Stay**: Set average stay duration for each disease type (days)
- **Simulation Time**: Set total simulation duration (30-3650 days)

### 2. Running Simulations
1. Adjust parameters using the sliders
2. Click "Run Simulation" button
3. Wait for the simulation to complete
4. View results in the canvas

### 3. Visualization Controls
Once a simulation is complete:
- **Spacebar**: Play/Pause simulation playback
- **R**: Restart simulation from beginning
- **+/-**: Increase/decrease playback speed
- **Mouse**: Click and drag to pan view

### 4. Connection Status
The sidebar shows connection status:
- **Green dot**: Connected to Python server
- **Red dot**: Disconnected (start the Python server)
- **Status messages**: Real-time updates on simulation progress

## Architecture

### WebSocket Communication
The system uses WebSocket for bidirectional communication:

**Client → Server Messages:**
- `get_defaults`: Request default parameters
- `run_sim`: Start simulation with custom parameters

**Server → Client Messages:**
- `defaults`: Default parameter values
- `info`: Status updates
- `sim_complete`: Simulation results with event history
- `error`: Error messages

### Data Flow
1. Frontend loads and connects to WebSocket server
2. Server sends default parameters
3. User adjusts parameters in UI
4. User clicks "Run Simulation"
5. Frontend sends parameters to server
6. Server runs simulation and streams results back
7. Frontend visualizes results in real-time

## Customization

### Adding New Parameters
1. Update `problem.py` with new default values
2. Modify `ws_server.py` to handle new parameters
3. Add UI controls in `Sidebar.svelte`
4. Update visualization in `HospitalCanvas.svelte`

### Modifying Visualization
- Edit `HospitalCanvas.svelte` for canvas rendering
- Modify ward positions and colors in `src/lib/stores/hospital.js`
- Customize UI components in `src/lib/components/ui/`

## Troubleshooting

### Common Issues

**WebSocket Connection Failed:**
- Ensure Python server is running: `python start_server.py`
- Check if port 8765 is available
- Verify Python dependencies are installed

**Simulation Not Starting:**
- Check browser console for JavaScript errors
- Verify all parameters are within valid ranges
- Ensure WebSocket connection is established (green dot in sidebar)

**Performance Issues:**
- Reduce simulation time for faster processing
- Lower visualization update frequency
- Consider running simulations with smaller datasets

### Debug Mode
Enable debug logging by checking browser console and Python server output for detailed information about:
- WebSocket messages
- Simulation progress
- Parameter validation
- Error details

## Development

### File Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── HospitalCanvas.svelte    # Main visualization
│   │   ├── Sidebar.svelte           # Parameter controls
│   │   └── ui/                      # UI components
│   ├── services/
│   │   └── websocket.js             # WebSocket service
│   └── stores/
│       └── hospital.js              # Data stores
├── routes/
│   └── (app)/hospital/+page.svelte  # Main page
└── ...

Stochastic-Simulation-Project-2/
├── core/
│   ├── ws_server.py                 # WebSocket server
│   ├── main.py                      # Original simulation
│   └── utils/                       # Simulation classes
└── ...
```

### Adding Features
1. Extend the WebSocket protocol in `ws_server.py`
2. Add UI controls in `Sidebar.svelte`
3. Update visualization in `HospitalCanvas.svelte`
4. Test with various parameter combinations

## License
This project is part of a stochastic simulation study and is intended for educational and research purposes. 