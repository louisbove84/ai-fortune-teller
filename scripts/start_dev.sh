#!/bin/bash

# Development startup script - runs both Next.js and Python backend

echo "🔮 Starting AI Fortune Teller Development Environment..."

# Check if virtual environment exists
if [ ! -d "apps/web/venv_fortune" ]; then
    echo "❌ Python virtual environment not found!"
    echo "Run './setup_python.sh' first to set up the Python backend."
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $PYTHON_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Python backend
echo ""
echo "🐍 Starting Python backend (http://localhost:5000)..."
source apps/web/venv_fortune/bin/activate
python apps/web/python/api_server.py &
PYTHON_PID=$!

# Wait for Python server to start
sleep 3

# Check if Python server is running
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ Python backend failed to start!"
    echo "Check that all dependencies are installed: pip install -r apps/web/requirements.txt"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo "✅ Python backend running"

# Start Next.js
echo ""
echo "⚡ Starting Next.js frontend (http://localhost:3000)..."
npm run dev &
NEXTJS_PID=$!

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🐍 Python API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait

