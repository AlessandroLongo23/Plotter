# Hospital Simulation Interface

This project implements a complete hospital simulation system with a Python backend and Svelte frontend, using HTTP API for communication.

## Features

### Backend (Python API)
- Stochastic hospital simulation with multiple wards and patient types
- Configurable parameters: bed distribution, arrival rates, length of stay
- HTTP API endpoints for simulation and default parameters
- Event-based simulation with comprehensive logging

### Frontend (Svelte + p5.js)
- Interactive parameter controls with sliders
- Real-time simulation visualization
- Ward and patient visualization
- Simulation playback controls

## Setup and Installation

### Prerequisites
- Python 3.9+ (for local development using vercel dev)
- Node.js 18+
- npm

### Dependencies
```bash
npm install
```

## Running the Application

### Local Development
```bash
npm run vercel-dev
```
This will start the Vercel development server which handles both the Svelte frontend and Python API functions.

### Production Build
```bash
npm run build
npm run deploy
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
3. Wait for the simulation to complete (no mock data - real simulation runs)
4. View results in the canvas

### 3. Visualization Controls
Once a simulation is complete:
- **Spacebar**: Play/Pause simulation playback
- **R**: Restart simulation from beginning
- **+/-**: Increase/decrease playback speed
- **Mouse**: Click and drag to pan view

### 4. API Status
The sidebar shows API status:
- **Green dot**: API ready
- **Status messages**: Real-time updates on simulation progress

## Architecture

### HTTP API Communication
The system uses HTTP API endpoints:

**API Endpoints:**
- `GET /api/defaults`: Get default parameters
- `POST /api/simulate`: Run simulation with custom parameters

**Request/Response Format:**
- Request: JSON with simulation parameters
- Response: JSON with simulation results and event history

### Data Flow
1. Frontend loads and fetches default parameters from API
2. User adjusts parameters in UI
3. User clicks "Run Simulation"
4. Frontend sends HTTP POST request with parameters
5. Python API runs simulation and returns results
6. Frontend visualizes results

## Deployment

### Local Development
- Uses `vercel dev` to run both frontend and Python API functions locally
- Same behavior as production environment

### Production (Vercel)
- Automatic deployment via `npm run deploy`
- Python functions run as serverless functions
- No additional server setup required

## Customization

### Adding New Parameters
1. Update `api/problem.py` with new default values
2. Modify `api/simulate.py` to handle new parameters
3. Add UI controls in `Sidebar.svelte`
4. Update visualization in `HospitalCanvas.svelte`

### Modifying Visualization
- Edit `HospitalCanvas.svelte` for canvas rendering
- Modify ward positions and colors in `src/lib/stores/hospital.js`
- Customize UI components in `src/lib/components/ui/`

## Troubleshooting

### Common Issues

**API Connection Failed:**
- Ensure you're running `npm run vercel-dev` for local development
- Check browser console for error messages
- Verify Python dependencies are available

**Simulation Not Starting:**
- Check browser console for JavaScript errors
- Verify all parameters are within valid ranges
- Check API status in the sidebar

**Performance Issues:**
- Reduce simulation time for faster processing
- Consider running simulations with smaller datasets

## Development

### File Structure
```
api/
├── simulate.py              # Simulation HTTP API endpoint
├── defaults.py              # Default parameters API endpoint
├── problem.py               # Problem configuration
├── hospital.py              # Hospital simulation logic
├── simulator.py             # Simulator classes
└── ward.py                  # Ward management

src/
├── lib/
│   ├── components/
│   │   ├── HospitalCanvas.svelte  # Main visualization
│   │   ├── Sidebar.svelte         # Parameter controls
│   │   └── ui/                    # UI components
│   ├── services/
│   │   └── http-api.js            # HTTP API service
│   └── stores/
│       └── hospital.js            # Data stores
├── routes/
│   └── (app)/hospital/+page.svelte # Main page
└── ...
```

### Development Commands
- `npm run vercel-dev`: Start local development server
- `npm run build`: Build for production
- `npm run deploy`: Deploy to Vercel

## License
This project is part of a stochastic simulation study and is intended for educational and research purposes. 