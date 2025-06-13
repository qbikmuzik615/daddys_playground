#!/bin/bash
set -e

echo "====== Daddy's Playground: Unzip & Structure Automation ======"

ZIPFILE="code folders.zip"
APPDIR="apps"

# 1. Ensure scripts/ directory exists
mkdir -p scripts

# 2. Check if ZIP exists
if [ ! -f "$ZIPFILE" ]; then
  echo "❌ ERROR: '$ZIPFILE' not found in repo root. Please check the file name."
  exit 1
fi

# 3. Create apps/ directory if not present
mkdir -p "$APPDIR"

echo "🗂 Unzipping '$ZIPFILE' into '$APPDIR/'..."
unzip -oq "$ZIPFILE" -d "$APPDIR"
echo "✅ Unzipped."

# 4. Normalize folder names (spaces → dashes, lowercase)
cd "$APPDIR"
for dir in */; do
  newdir=$(echo "$dir" | tr 'A-Z' 'a-z' | tr ' ' '-')
  if [ "$dir" != "$newdir" ]; then
    mv "$dir" "$newdir"
    echo "📁 Renamed '$dir' -> '$newdir'"
  fi
done
cd ..

# 5. Remove the ZIP to keep repo clean
rm -f "$ZIPFILE"
echo "🧹 Removed ZIP archive."

# 6. Scaffold other key folders if missing
mkdir -p packages/ui packages/utils packages/assets skybox-ai scripts

echo "✅ Repo is now structured for a modular, monorepo playground."
echo "👉 Next: cd into any app in '$APPDIR/' and run 'yarn install && yarn dev' to start!"

exit 0
