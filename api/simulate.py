from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Import from local files with fallback
try:
    from hospital import Hospital
    from problem import Data, Disease
    from simulator import Simulator, EventHistory
except ImportError:
    # Fallback: try importing from current directory
    import importlib.util
    
    # Import problem module
    problem_path = os.path.join(os.path.dirname(__file__), 'problem.py')
    spec = importlib.util.spec_from_file_location("problem", problem_path)
    problem_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(problem_module)
    Data = problem_module.Data
    Disease = problem_module.Disease
    
    # Import hospital module
    hospital_path = os.path.join(os.path.dirname(__file__), 'hospital.py')
    spec = importlib.util.spec_from_file_location("hospital", hospital_path)
    hospital_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(hospital_module)
    Hospital = hospital_module.Hospital
    
    # Import simulator module
    simulator_path = os.path.join(os.path.dirname(__file__), 'simulator.py')
    spec = importlib.util.spec_from_file_location("simulator", simulator_path)
    simulator_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(simulator_module)
    Simulator = simulator_module.Simulator
    EventHistory = simulator_module.EventHistory

def history_to_json(history: EventHistory) -> list:
    """Convert EventHistory to JSON-serializable format"""
    serializable = []
    for event, disease_opt in history:
        serializable.append({
            'event': event.to_dict(),
            'allocation': disease_opt.to_dict() if disease_opt is not None else 'Rejected'
        })
    return serializable

def parse_parameters(data: dict) -> tuple:
    """Parse and validate simulation parameters from client"""
    
    # Default values from Data class
    bed_distribution = {
        Disease.A: data.get("bed_distribution", {}).get("A", Data.bed_distribution[Disease.A]),
        Disease.B: data.get("bed_distribution", {}).get("B", Data.bed_distribution[Disease.B]),
        Disease.C: data.get("bed_distribution", {}).get("C", Data.bed_distribution[Disease.C]),
        Disease.D: data.get("bed_distribution", {}).get("D", Data.bed_distribution[Disease.D]),
        Disease.E: data.get("bed_distribution", {}).get("E", Data.bed_distribution[Disease.E]),
        Disease.F: data.get("bed_distribution", {}).get("F", Data.bed_distribution[Disease.F]),
    }
    
    arrival_rates = {
        Disease.A: data.get("arrival_rates", {}).get("A", Data.arrival_rates[Disease.A]),
        Disease.B: data.get("arrival_rates", {}).get("B", Data.arrival_rates[Disease.B]),
        Disease.C: data.get("arrival_rates", {}).get("C", Data.arrival_rates[Disease.C]),
        Disease.D: data.get("arrival_rates", {}).get("D", Data.arrival_rates[Disease.D]),
        Disease.E: data.get("arrival_rates", {}).get("E", Data.arrival_rates[Disease.E]),
        Disease.F: data.get("arrival_rates", {}).get("F", Data.arrival_rates[Disease.F]),
    }
    
    stay_means = {
        Disease.A: data.get("stay_means", {}).get("A", Data.stay_means[Disease.A]),
        Disease.B: data.get("stay_means", {}).get("B", Data.stay_means[Disease.B]),
        Disease.C: data.get("stay_means", {}).get("C", Data.stay_means[Disease.C]),
        Disease.D: data.get("stay_means", {}).get("D", Data.stay_means[Disease.D]),
        Disease.E: data.get("stay_means", {}).get("E", Data.stay_means[Disease.E]),
        Disease.F: data.get("stay_means", {}).get("F", Data.stay_means[Disease.F]),
    }
    
    return bed_distribution, arrival_rates, stay_means

def run_simulation_from_data(data: dict) -> dict:
    """Takes simulation data, runs the simulation, and returns results."""
    # Extract simulation time
    time = data.get("time", 365)
    
    # Parse custom parameters
    bed_distribution, arrival_rates, stay_means = parse_parameters(data)
    
    # Create hospital and simulator with custom parameters
    hospital = Hospital(
        relocation_matrix=Data.transition_matrix, 
        bed_distribution=bed_distribution
    )
    simulator = Simulator(
        hospital, 
        arrival_rates=arrival_rates, 
        stay_means=stay_means
    )
    
    # Run simulation
    event_history = simulator.run(time, log=False, export=False)
    event_history = history_to_json(event_history) if event_history is not None else None
    
    # Prepare result with simulation data
    return {
        "success": True,
        "total_events": len(event_history) if event_history else 0,
        "event_history": event_history,
        "parameters": {
            "time": time,
            "bed_distribution": {k.name: v for k, v in bed_distribution.items()},
            "arrival_rates": {k.name: v for k, v in arrival_rates.items()},
            "stay_means": {k.name: v for k, v in stay_means.items()}
        }
    }

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length and read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Run simulation with parsed data
            result = run_simulation_from_data(data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"success": False, "error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    """
    Allows the script to be run directly from the command line.
    Reads JSON from stdin, runs simulation, and prints results to stdout.
    This is used by the local dev-server.js.
    """
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        result = run_simulation_from_data(data)
        print(json.dumps(result))
    except Exception as e:
        error_response = {"success": False, "error": f"Error in command-line execution: {str(e)}"}
        print(json.dumps(error_response)) 