#!/bin/bash

# Quick local web server start script for testing
# Usage: ./start-web-server.sh

PORT=${1:-8000}

echo "Starting web server for Daily Notes web version..."
echo ""
echo "Select your method:"
echo ""
echo "1) Python 3 (Recommended)"
echo "2) Node.js http-server"
echo "3) Node.js live-server"
echo ""

read -p "Choose method (1-3): " method

case $method in
    1)
        echo ""
        echo "Starting Python HTTP server on http://localhost:$PORT"
        echo "Press Ctrl+C to stop"
        echo ""
        cd web
        python3 -m http.server $PORT
        ;;
    2)
        echo ""
        echo "Installing http-server globally..."
        npm install -g http-server
        echo ""
        echo "Starting http-server on http://localhost:$PORT"
        echo "Press Ctrl+C to stop"
        echo ""
        http-server web -p $PORT
        ;;
    3)
        echo ""
        echo "Installing live-server globally..."
        npm install -g live-server
        echo ""
        echo "Starting live-server (auto-reload enabled)"
        echo "Press Ctrl+C to stop"
        echo ""
        live-server web
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
