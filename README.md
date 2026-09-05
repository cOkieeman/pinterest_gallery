# Pinterest Gallery Loader — ComfyUI custom node

Search Pinterest from inside a ComfyUI node, or browse Pins from your own
Pinterest Boards using the official Pinterest API. Click a thumbnail and load
the selected image as an `IMAGE` output. Infinite-scroll grid, single selection,
and the selection is saved into the workflow.

## Install

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/Boy-II/pinterest_gallery
```

Then install the one runtime dependency into the **same** Python ComfyUI runs on:

```bash
python -m pip install -r pinterest_gallery/requirements.txt   # just: requests
```

For the ComfyUI-aki portable build on Windows the embedded interpreter is
`E:\ComfyUI-aki-v2\python\python.exe` (some builds name it `python_embeded`):

```bat
"E:\ComfyUI-aki-v2\python\python.exe" -m pip install requests
```

Restart ComfyUI. The node appears as **Pinterest Gallery Loader** under
`image/pinterest`.

### Optional: My Boards mode

Search mode works without authentication. To browse Boards from your own
Pinterest account, [create a Pinterest App](https://developers.pinterest.com/docs/getting-started/connect-app/)
and generate an access token with the following scopes:

- `boards:read`
- `pins:read`

Secret Boards additionally require `boards:read_secret` and `pins:read_secret`.

Set the token in the environment used to launch ComfyUI.

PowerShell:

```powershell
$env:PINTEREST_ACCESS_TOKEN = "your-token"
$env:PINTEREST_API_ENV = "production"
python main.py
```

macOS or Linux:

```bash
export PINTEREST_ACCESS_TOKEN="your-token"
export PINTEREST_API_ENV="production"
python main.py
```

`production` is the default. Set `PINTEREST_API_ENV` to `sandbox` only when
using a Pinterest Sandbox token.

Restart ComfyUI after changing these environment variables. The token is read
only by the Python backend. Do not put access tokens in workflows, source files,
test fixtures, logs, or Git commits.

My Boards is read-only. It does not create, edit, delete, or publish Pinterest
Boards or Pins.

## Update

```bash
cd ComfyUI/custom_nodes/pinterest_gallery && git pull
```

## Usage

1. Add **Pinterest Gallery Loader**.
2. Type a query — thumbnails load in a 3-column grid.
3. Scroll the grid — more results load automatically.
4. Click a thumbnail — an accent border and check mark show the selection.
5. Wire the `IMAGE` output onward and queue the prompt; the full original-size
   image is downloaded at run time.
6. To browse your account, switch to **My Boards**, select a Board, and click a
   Pin to use it as the node output.

Running with nothing selected raises a clear node error.

### My Boards troubleshooting

- **`PINTEREST_ACCESS_TOKEN is not configured`** — set the environment variable
  before starting ComfyUI, then restart ComfyUI.
- **`Pinterest access token is invalid or expired`** — generate or refresh the
  token, then restart ComfyUI.
- **`Pinterest token lacks required permissions`** — make sure the token has
  both `boards:read` and `pins:read`.
- **No Boards are displayed** — confirm that `PINTEREST_API_ENV` matches the
  token environment. Tokens for normal Pinterest accounts use `production`.

## Development

```bash
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest -q
```

`scripts/manual_search_check.py "<query>"` hits the live Pinterest endpoint to
sanity-check the request/parse path outside ComfyUI.
