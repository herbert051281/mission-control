# HEARTBEAT.md - Lean Config

Minimal always-loaded config. Templates and detailed logic live in `/heartbeat/` folder (loaded on-demand only).

## Heartbeat Pulse Config
- **Interval:** Every 15-30 min when Herb is active
- **Check order:** MEMORY deadlines → Priority tasks → German progress
- **Notify only if:** Something approaching deadline or overdue
- **Silent otherwise:** Log to heartbeat-log.json and don't message

## Cron Jobs Config
| Job | Schedule | Purpose | Template |
|-----|----------|---------|----------|
| German Drill | Daily 9:00 AM CST | B1 progression | `/heartbeat/german-drill.md` |
| Peru Prep | Every Sunday 8:00 AM CST | Trek logistics/altitude | `/heartbeat/peru-prep.md` |
| Power BI Status | Every Monday 10:00 AM CST | DAX/model checks | `/heartbeat/powerbi-status.md` |
| Weekly Review | Every Monday 6:00 PM CST | Reflection + memory update | `/heartbeat/weekly-review.md` |

## State Tracking
- **File:** `heartbeat-state.json`
- **Tracks:** Last check times, last notification date, active prep phases
- **Prevents:** Repeated notifications, stale data lookups

## Volume Dial
- **Default:** MEDIUM (silent most of the time)
- **Ramp to HIGH when:** Trek <4 weeks, German B1 <8 weeks, active troubleshooting
