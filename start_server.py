#!/usr/bin/env python3
"""
Hospital Simulation WebSocket Server
Start this server before running the Svelte frontend to enable simulation functionality.
"""

import sys
import os
import subprocess

# Add the core directory to the Python path
core_dir = os.path.join(os.path.dirname(__file__), 'Stochastic-Simulation-Project-2', 'core')
sys.path.insert(0, core_dir)

# Change to the core directory
os.chdir(core_dir)

# Import and run the server
from ws_server import main
import asyncio

if __name__ == "__main__":
    print("Starting Hospital Simulation WebSocket Server...")
    print("Server will run on ws://localhost:8765")
    print("Make sure to start your Svelte frontend as well!")
    print("Press Ctrl+C to stop the server.")
    print("-" * 50)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Make sure you have all dependencies installed:")
        print("pip install websockets numpy") 