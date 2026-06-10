# Project Agent Instructions

## Credentials

All credentials for this project are stored in `.env` at the repo root (gitignored).
Load environment variables from `.env` before running any script that requires API access.

Available variables:

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI (localhost) |
| `GOOGLE_TOKEN_URI` | Google token endpoint |
| `GOOGLE_REFRESH_TOKEN` | Long-lived Google OAuth refresh token |
| `GOOGLE_ACCESS_TOKEN` | Short-lived Google OAuth access token (may expire) |
| `TICKTICK_ACCESS_TOKEN` | TickTick API access token |

### Usage

In Node.js scripts, load with:
```js
import 'dotenv/config';
// or
require('dotenv').config();
```

In Python scripts:
```python
from dotenv import load_dotenv
load_dotenv()
```

In shell scripts:
```sh
export $(grep -v '^#' .env | xargs)
```

> The `GOOGLE_ACCESS_TOKEN` is short-lived and may be expired. Use `GOOGLE_REFRESH_TOKEN` + `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to obtain a fresh access token via the token endpoint (`GOOGLE_TOKEN_URI`).
