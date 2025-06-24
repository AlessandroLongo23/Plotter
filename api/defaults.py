from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Import from local files
try:
    from problem import Data, Disease
except ImportError:
    # Fallback: try importing from current directory
    import importlib.util
    
    problem_path = os.path.join(os.path.dirname(__file__), 'problem.py')
    spec = importlib.util.spec_from_file_location("problem", problem_path)
    problem_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(problem_module)
    
    Data = problem_module.Data
    Disease = problem_module.Disease

def get_defaults_data():
    """Constructs the dictionary of default parameters."""
    return {
        "bed_distribution": {
            "A": Data.bed_distribution[Disease.A],
            "B": Data.bed_distribution[Disease.B],
            "C": Data.bed_distribution[Disease.C],
            "D": Data.bed_distribution[Disease.D],
            "E": Data.bed_distribution[Disease.E],
            "F": Data.bed_distribution[Disease.F],
        },
        "arrival_rates": {
            "A": Data.arrival_rates[Disease.A],
            "B": Data.arrival_rates[Disease.B],
            "C": Data.arrival_rates[Disease.C],
            "D": Data.arrival_rates[Disease.D],
            "E": Data.arrival_rates[Disease.E],
            "F": Data.arrival_rates[Disease.F],
        },
        "stay_means": {
            "A": Data.stay_means[Disease.A],
            "B": Data.stay_means[Disease.B],
            "C": Data.stay_means[Disease.C],
            "D": Data.stay_means[Disease.D],
            "E": Data.stay_means[Disease.E],
            "F": Data.stay_means[Disease.F],
        }
    }

class handler(BaseHTTPRequestHandler):
    """
    Vercel serverless function handler.
    """
    def do_GET(self):
        try:
            defaults = get_defaults_data()
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(defaults).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e)}
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
    This is used by the local dev-server.js.
    """
    print(json.dumps(get_defaults_data())) 