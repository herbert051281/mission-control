# Setup Guide for YouTube Transcript Extractor

The YouTube Transcript Extractor requires the `youtube-transcript-api` Python library.

## Quick Setup (Choose One Method)

### Method 1: System-Wide Installation (Simplest)

```bash
pip install --break-system-packages youtube-transcript-api
```

Then use the script directly:
```bash
python3 /path/to/skills/youtube-transcript-extractor/scripts/extract_transcript.py <video_url>
```

### Method 2: Virtual Environment (Safest)

If your system has `python3-venv` available:

```bash
# Run the automated setup script
bash /path/to/skills/youtube-transcript-extractor/scripts/setup.sh

# Then use the venv Python
/path/to/skills/youtube-transcript-extractor/.venv/bin/python3 \
  /path/to/skills/youtube-transcript-extractor/scripts/extract_transcript.py <video_url>
```

If setup.sh fails (missing python3-venv), install it first:
```bash
sudo apt-get update
sudo apt-get install -y python3-venv python3-full
```

Then retry the setup script.

### Method 3: Docker Container

If you have Docker:
```bash
docker run -it --rm python:3.11 \
  pip install youtube-transcript-api && \
  python3 extract_transcript.py <video_url>
```

## Verification

Test that the library is installed:
```bash
python3 -c "import youtube_transcript_api; print('✓ Library installed')"
```

## Troubleshooting

**"ModuleNotFoundError: No module named 'youtube_transcript_api'"**
→ Install the library using one of the methods above.

**"externally-managed-environment" error**
→ Use Method 1 (--break-system-packages) or Method 2 (virtual environment).

**"No such file or directory: .venv"**
→ Run setup.sh again, or install python3-venv first: `sudo apt-get install python3-venv python3-full`

## After Installation

Once installed, Atlas can call the extraction script to fetch transcripts from YouTube videos.
