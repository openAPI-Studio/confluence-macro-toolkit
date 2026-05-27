#!/bin/bash
set -e

# Deploy the Lite version of Macro Toolkit (Runs on Atlassian eligible)
# Usage: ./scripts/deploy-lite.sh [--env development|staging|production]

ENV="development"

while [[ $# -gt 0 ]]; do
  case $1 in
    --env|-e) ENV="$2"; shift 2;;
    development|staging|production) ENV="$1"; shift;;
    *) echo "Usage: $0 [--env development|staging|production]"; exit 1;;
  esac
done

DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Deploying Macro Toolkit (Lite) to $ENV..."

# Swap manifest (restore on exit regardless of success/failure)
cp "$DIR/manifest.yml" "$DIR/manifest.yml.bak"
trap 'mv "$DIR/manifest.yml.bak" "$DIR/manifest.yml"' EXIT

cp "$DIR/manifest.lite.yml" "$DIR/manifest.yml"

# Deploy
cd "$DIR"
forge deploy -e "$ENV" --non-interactive

echo "✅ Lite version deployed to $ENV"
echo ""
echo "To install: forge install --site <your-site> --product confluence -e $ENV"
echo "To upgrade: forge install --upgrade --site <your-site> --product confluence -e $ENV"
