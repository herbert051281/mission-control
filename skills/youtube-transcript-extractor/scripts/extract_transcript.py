#!/usr/bin/env python3
"""
Extract transcripts from YouTube videos.
Usage: python extract_transcript.py <video_url_or_id> [--timestamps] [--language en]
"""

import sys
import re
import json
from typing import Optional

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
except ImportError:
    print("ERROR: youtube-transcript-api not installed")
    print("Install with: pip install youtube-transcript-api")
    sys.exit(1)


def extract_video_id(url_or_id: str) -> str:
    """Extract video ID from various YouTube URL formats."""
    # Already an ID
    if len(url_or_id) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id
    
    # Full URL: youtube.com/watch?v=ID
    match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})', url_or_id)
    if match:
        return match.group(1)
    
    raise ValueError(f"Invalid YouTube URL or video ID: {url_or_id}")


def get_transcript(video_id: str, language: str = 'en', include_timestamps: bool = False) -> str:
    """Fetch transcript from YouTube video."""
    try:
        api = YouTubeTranscriptApi()
        
        # Try to get transcript in specified language
        try:
            transcript_data = api.fetch(video_id, languages=[language])
        except NoTranscriptFound:
            # Fall back to any available language
            try:
                transcript_list = api.list(video_id)
                if transcript_list.manually_created_transcripts:
                    transcript_data = transcript_list.manually_created_transcripts[0].fetch()
                elif transcript_list.generated_transcripts:
                    transcript_data = transcript_list.generated_transcripts[0].fetch()
                else:
                    raise NoTranscriptFound(video_id)
            except Exception:
                raise NoTranscriptFound(video_id)
        
        # Extract transcript items
        transcript = transcript_data if isinstance(transcript_data, list) else transcript_data.get('content', [])
        
        # Format transcript
        if include_timestamps:
            lines = [f"[{_format_time(item.get('start', 0))}] {item.get('text', '')}" 
                    for item in transcript]
        else:
            lines = [item.get('text', '') for item in transcript]
        
        return ' '.join(lines)
    
    except TranscriptsDisabled:
        return f"ERROR: Transcripts are disabled for this video (ID: {video_id})"
    except NoTranscriptFound:
        return f"ERROR: No transcripts found for this video (ID: {video_id})"
    except Exception as e:
        return f"ERROR: {str(e)}"


def _format_time(seconds: float) -> str:
    """Format seconds as MM:SS."""
    mins, secs = divmod(int(seconds), 60)
    return f"{mins}:{secs:02d}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_transcript.py <video_url_or_id> [--timestamps] [--language en]")
        sys.exit(1)
    
    url_or_id = sys.argv[1]
    include_timestamps = '--timestamps' in sys.argv
    
    # Parse language flag
    language = 'en'
    if '--language' in sys.argv:
        idx = sys.argv.index('--language')
        if idx + 1 < len(sys.argv):
            language = sys.argv[idx + 1]
    
    try:
        video_id = extract_video_id(url_or_id)
        transcript = get_transcript(video_id, language=language, include_timestamps=include_timestamps)
        print(transcript)
    except ValueError as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
