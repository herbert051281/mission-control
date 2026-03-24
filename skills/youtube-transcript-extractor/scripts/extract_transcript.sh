#!/bin/bash
# YouTube Transcript Extractor Wrapper
# Handles dependency setup and extraction

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
PYTHON_SCRIPT="$SCRIPT_DIR/extract_transcript.py"

# Check if youtube-transcript-api is installed
if ! python3 -c "import youtube_transcript_api" 2>/dev/null; then
    echo "youtube-transcript-api not found. Installing..."
    
    # Try multiple installation methods
    if command -v apt-get &> /dev/null; then
        echo "Using apt to install python3-venv (requires sudo)..."
        sudo apt-get update && sudo apt-get install -y python3-venv python3-full
        
        # Create and setup venv
        python3 -m venv "$SKILL_DIR/.venv"
        source "$SKILL_DIR/.venv/bin/activate"
        pip install youtube-transcript-api
        
        # Update python path
        PYTHON_CMD="$SKILL_DIR/.venv/bin/python3"
    else
        echo "ERROR: Cannot install dependencies automatically"
        echo ""
        echo "Please install youtube-transcript-api manually:"
        echo "  pip install --break-system-packages youtube-transcript-api"
        echo ""
        echo "Or create a Python venv:"
        echo "  python3 -m venv /tmp/yt-venv"
        echo "  /tmp/yt-venv/bin/pip install youtube-transcript-api"
        exit 1
    fi
else
    PYTHON_CMD="python3"
fi

# Run the Python script
$PYTHON_CMD "$PYTHON_SCRIPT" "$@"
