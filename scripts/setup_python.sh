#!/bin/bash

# Setup script for AI Fortune Teller Python backend

echo "🔮 Setting up AI Fortune Teller Python Backend..."

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo "Creating virtual environment..."
cd apps/web
python3 -m venv venv_fortune

# Activate virtual environment
echo "Activating virtual environment..."
source venv_fortune/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Python backend setup complete!"
echo ""
echo "To run the Python API server:"
echo "1. Activate the virtual environment:"
echo "   source apps/web/venv_fortune/bin/activate"
echo ""
echo "2. Set environment variables (add to your .env):"
echo "   export OPENAI_API_KEY='your_openai_key'"
echo "   export KAGGLE_USERNAME='your_kaggle_username'"
echo "   export KAGGLE_KEY='your_kaggle_key'"
echo ""
echo "3. Start the Python server:"
echo "   python apps/web/python/api_server.py"
echo ""
echo "The server will run on http://localhost:5000"
echo ""
echo "Note: Get your OpenAI API key from https://platform.openai.com/api-keys"
echo "Note: Get Kaggle credentials from https://www.kaggle.com/settings/account"

