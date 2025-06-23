from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs

# Add the Stochastic-Simulation-Project-2/core directory to path
project_dir = os.path.join(os.path.dirname(__file__), '..', 'Stochastic-Simulation-Project-2', 'core')
sys.path.insert(0, project_dir)

from utils.hospital import Hospital
from utils.problem import Data, Disease
from utils.simulator import Simulator, EventHistory

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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length and read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
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
            result = {
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