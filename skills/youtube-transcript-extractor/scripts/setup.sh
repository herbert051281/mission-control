#!/bin/bash
# Setup script for YouTube Transcript Extractor skill
# Creates a Python venv and installs youtube-transcript-api

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$SKILL_DIR/.venv"

echo "Setting up YouTube Transcript Extractor..."
echo "Creating Python virtual environment at $VENV_DIR"

# Create venv
python3 -m venv "$VENV_DIR"

# Activate and install
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install youtube-transcript-api

echo "✓ Setup complete!"
echo ""
echo "To use the transcript extractor:"
echo "  source $VENV_DIR/bin/activate"
echo "  python3 $SKILL_DIR/scripts/extract_transcript.py <video_url>"
echo ""
echo "Or run directly:"
echo "  $VENV_DIR/bin/python3 $SKILL_DIR/scripts/extract_transcript.py <video_url>"
