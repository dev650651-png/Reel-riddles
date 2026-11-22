#!/usr/bin/env bash
# Installs the Reel Riddles video studio. Run from the folder that holds the Reel-riddles checkout
# (cloud setup script) or from inside the repo: bash setup.sh
set -e
command -v ffmpeg >/dev/null || (apt-get update && apt-get install -y ffmpeg)
pip install -q openai-whisper numpy soundfile
D=Reel-riddles; [ -f package.json ] && D=.
if [ -d "$D" ]; then (cd "$D" && npm ci --no-audit --no-fund); fi
