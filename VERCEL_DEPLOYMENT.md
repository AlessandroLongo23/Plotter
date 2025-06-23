# Deploying Hospital Simulation to Vercel

This guide explains how to deploy your hospital simulation project to Vercel with full Python backend functionality.

## 🏗️ **Architecture Overview**

### **Local Development**
- **WebSocket**: Direct persistent connection between frontend and Python server
- **Real-time**: Immediate bidirectional communication
- **Stateful**: Maintains connection throughout session

### **Production (Vercel)**
- **HTTP API**: Serverless Python functions handle requests
- **RESTful**: Request-response pattern via HTTP endpoints
- **Stateless**: Each request is independent

## 📋 **Prerequisites**

### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

### **2. Login to Vercel**
```bash
vercel login
```

### **3. Install Dependencies**
```bash
npm install
```

## 🚀 **Deployment Steps**

### **1. Test Locally with Vercel Dev**
```bash
npm run vercel-dev
```
This simulates the Vercel environment locally with your Python functions.

### **2. Deploy to Vercel**
```bash
npm run deploy
```
Or simply:
```bash
vercel --prod
```

### **3. Configure Environment**
Your project is now deployed! The system automatically detects:
- **Python Functions**: `/api/defaults.py` and `/api/simulate.py`
- **Serverless Runtime**: Python 3.9
- **Max Duration**: 5 minutes for simulations

## 🔄 **How It Works on Vercel**

### **API Endpoints**

1. **`/api/defaults`** (GET)
   - Returns default simulation parameters
   - Loads from `problem.py` in your Python codebase

2. **`/api/simulate`** (POST)
   - Runs simulation with custom parameters
   - Body: `{ time, bed_distribution, arrival_rates, stay_means }`
   - Returns: `{ success, total_events, event_history, parameters }`

### **Automatic Service Detection**

The frontend automatically detects the environment:

```javascript
// Local development (localhost)
if (hostname === 'localhost') {
    // Try WebSocket first, fallback to HTTP
    currentService = 'websocket' || 'http'
} else {
    // Production (Vercel domain)
    currentService = 'http'
}
```

### **Smart Fallback System**

1. **Local Development**: 
   - Tries WebSocket first (if Python server running)
   - Falls back to HTTP API
   
2. **Production**: 
   - Uses HTTP API exclusively
   - No WebSocket server needed

## 📁 **File Structure for Vercel**

```
project/
├── api/                          # Vercel Python functions
│   ├── defaults.py              # GET /api/defaults
│   └── simulate.py              # POST /api/simulate
├── requirements.txt             # Python dependencies
├── vercel.json                  # Vercel configuration
├── src/
│   ├── lib/services/
│   │   ├── websocket.js        # Local development
│   │   └── http-api.js         # Production/fallback
│   └── ...
└── Stochastic-Simulation-Project-2/
    └── core/                    # Your Python simulation code
```

## ⚙️ **Configuration Files**

### **`vercel.json`**
```json
{
  "functions": {
    "api/defaults.py": {
      "runtime": "python3.9"
    },
    "api/simulate.py": {
      "runtime": "python3.9",
      "maxDuration": 300
    }
  }
}
```

### **`requirements.txt`**
```
numpy==1.24.3
```

## 🎯 **Development Workflows**

### **Local Development (with WebSocket)**
```bash
npm run dev:websocket
```
- Starts Python WebSocket server
- Starts Svelte dev server
- Fast real-time communication

### **Local Development (HTTP API)**
```bash
npm run dev:http
# or
npm start
```
- Uses HTTP API (simulates production)
- Tests Vercel-compatible code path

### **Local Testing with Vercel Environment**
```bash
npm run vercel-dev
```
- Runs Vercel's local development server
- Tests Python functions exactly as they'll run in production

## 🔍 **Troubleshooting**

### **Common Issues**

**1. Python Import Errors**
```python
# Add this to your API functions:
import sys
import os
project_dir = os.path.join(os.path.dirname(__file__), '..', 'Stochastic-Simulation-Project-2', 'core')
sys.path.insert(0, project_dir)
```

**2. CORS Issues**
```python
# Add these headers to your Python functions:
self.send_header('Access-Control-Allow-Origin', '*')
self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
self.send_header('Access-Control-Allow-Headers', 'Content-Type')
```

**3. Timeout Issues**
- Increase `maxDuration` in `vercel.json`
- Reduce simulation time for testing
- Consider caching results for large simulations

**4. Dependencies Not Found**
- Ensure `requirements.txt` is in project root
- Use specific version numbers
- Check Python version compatibility

### **Debug Commands**

```bash
# Check Vercel logs
vercel logs <deployment-url>

# Test API endpoints locally
curl http://localhost:3000/api/defaults
curl -X POST http://localhost:3000/api/simulate -d '{"time": 30}'

# Test production endpoints
curl https://your-app.vercel.app/api/defaults
```

## 📊 **Performance Considerations**

### **Serverless Limitations**
- **Cold Starts**: First request may be slower
- **Memory**: Limited memory per function
- **Duration**: Max 5 minutes execution time
- **Size**: Function bundle size limits

### **Optimization Tips**
1. **Reduce Simulation Time**: Use smaller time periods for testing
2. **Caching**: Consider caching results for common parameters
3. **Chunking**: Split large simulations into smaller parts
4. **Monitoring**: Use Vercel Analytics to monitor performance

## 🌐 **URLs and Access**

After deployment:
- **Website**: `https://your-project.vercel.app`
- **API Defaults**: `https://your-project.vercel.app/api/defaults`
- **API Simulate**: `https://your-project.vercel.app/api/simulate`

## 🔄 **Continuous Deployment**

### **GitHub Integration**
1. Connect your GitHub repository to Vercel
2. Every push to `main` triggers automatic deployment
3. Pull requests get preview deployments

### **Environment Variables**
If needed, add environment variables in Vercel dashboard:
- Project Settings → Environment Variables

## 🎉 **Success!**

Your hospital simulation is now live on Vercel with:
- ✅ Full Python simulation backend
- ✅ Interactive Svelte frontend  
- ✅ Global CDN distribution
- ✅ Automatic scaling
- ✅ HTTPS by default
- ✅ Preview deployments

Share your simulation with the world! 🚀 