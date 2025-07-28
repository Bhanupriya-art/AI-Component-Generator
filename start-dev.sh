#!/bin/bash

# Start development servers for AccioJob Component Generator

echo "🚀 Starting AccioJob Component Generator..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure your environment variables."
    echo "   cp env.example .env"
    exit 1
fi

# Start backend server
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5004"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID

# Cleanup
echo "🛑 Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null 