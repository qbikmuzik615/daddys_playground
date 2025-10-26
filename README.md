# Daddy's Playground

This repository contains educational mini-games and a 3D hub. The initial set of apps is stored in the `code folders.zip` archive.

## Unzipping via GitHub Actions

If you do not have local terminal access, run the provided GitHub Actions workflow:

1. Go to the **Actions** tab on GitHub.
2. Select **"Unzip and Commit code folders.zip"**.
3. Click **Run workflow**.

The workflow extracts the archive into `apps/`, normalizes folder names, removes the zip, and commits the changes. Delete the workflow file once extraction succeeds.

## Manual Unzip

For local extraction, execute:

```bash
bash scripts/setup.sh
```


## Skybox Hub

The `skybox-ai` folder contains a small React Three Fiber project that serves as a 3D hub. Each box in the scene opens one of the apps in a new tab.

To run the hub locally:

```bash
# install all workspace dependencies
corepack enable
yarn install

# start the hub
yarn dev:hub
```

A workflow at `.github/workflows/deploy-skybox-hub.yml` builds the hub and deploys it to GitHub Pages whenever changes are pushed to `main`.

