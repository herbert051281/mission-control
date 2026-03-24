# Known Limitations

## YouTube IP Blocking

When running from cloud servers (AWS, Google Cloud, Azure, etc.), YouTube may block transcript requests with errors like:

```
YouTube is blocking requests from your IP
```

This is a YouTube limitation, not a skill issue. Workarounds:

1. **Use a proxy service** - Route requests through a residential proxy to hide the cloud IP
2. **Run locally** - If accessing from a home/office network, the script will work without issues
3. **Use authentication** - Add YouTube account cookies (not recommended, risks account ban)

## Videos Without Transcripts

The skill cannot extract transcripts from:
- Videos with captions disabled by the uploader
- Live streams without caption archives
- Very new videos before captions are generated
- Age-restricted videos in some cases

The script will return a clear error message in these cases.

## Language Availability

If your requested language isn't available, the script will automatically fall back to any available language (typically auto-generated English captions).

## Rate Limiting

YouTube may rate-limit multiple rapid requests. Add delays between requests if extracting many transcripts in succession.
