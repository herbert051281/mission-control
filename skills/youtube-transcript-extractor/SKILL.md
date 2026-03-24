---
name: youtube-transcript-extractor
description: Extract transcripts from YouTube videos to enable analysis and understanding. Use when you need to (1) get a transcript from a YouTube video URL, (2) analyze video content through transcript text, (3) enable Atlas to understand YouTube video content. Works with videos that have auto-generated or manual captions available.
---

# YouTube Transcript Extractor

Extract transcripts from YouTube videos so Atlas can analyze and understand video content.

## Basic Usage

Provide a YouTube URL (full URL or video ID) and the skill extracts the available transcript.

**Supported URL formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `VIDEO_ID` (just the ID)

**Example request:**
```
Get the transcript from https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## How It Works

1. **Extract video ID** from the provided URL
2. **Fetch transcript** using youtube-transcript-api (supports auto-generated captions, manual captions, and translations)
3. **Format output** as clean, readable text with optional timestamps
4. **Return transcript** for analysis

## Capabilities

- ✅ Auto-generated captions
- ✅ Manual captions (if available)
- ✅ Multiple language support (if available)
- ✅ Timestamp inclusion (optional)
- ✅ Clean formatting for readability

## Limitations

- ❌ Videos with captions disabled cannot be transcribed
- ❌ Live streams (if not archived with captions) cannot be transcribed
- ❌ Requires at least one language's captions available on the video

## Error Handling

If a video cannot be transcribed, the script will:
- Attempt to fetch available languages/captions
- Return a clear error message explaining why the transcript is unavailable
- Suggest alternatives (e.g., "This video has English captions available but they are disabled by the uploader")

## Output Format

Transcripts are returned as clean text. Example:

```
[0:00] Welcome to my channel
[0:05] Today we're discussing Python best practices
[0:15] The first thing to understand is...
```

Or without timestamps:

```
Welcome to my channel. Today we're discussing Python best practices. The first thing to understand is...
```

## Setup Required

See [SETUP.md](references/SETUP.md) for installation instructions. The skill requires the `youtube-transcript-api` Python library.

Quick start:
```bash
pip install --break-system-packages youtube-transcript-api
```

## Next Steps

Once you have a transcript, Atlas can:
- Summarize the video content
- Extract key takeaways
- Answer questions about the video
- Analyze tone, topic, or specific details
- Create notes or documentation based on the content
