from http.server import BaseHTTPRequestHandler
import json

# Import from local files instead of utils path
from problem import Data, Disease

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Send default parameters to client
            defaults = {
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