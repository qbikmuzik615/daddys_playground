# CLAUDE.md - AI Assistant Guide for Daddy's Playground

This document provides AI assistants with essential context about the codebase structure, development workflows, and conventions to follow when working with this repository.

## Repository Overview

**Daddy's Playground** is an educational repository containing mini-games and a 3D hub interface. The project is structured as a Yarn workspaces monorepo with multiple applications and shared packages.

### Project Purpose
- Educational mini-games for learning and play
- 3D interactive hub using React Three Fiber
- Modular monorepo architecture for code sharing
- GitHub Pages deployment for the skybox hub

## Repository Structure

```
daddys_playground/
├── apps/                    # Individual mini-game applications (extracted from zip)
│   ├── quiztastic-opposites/
│   ├── explain-things-with-lots-of-tiny-cats/
│   ├── flashcard-maker/
│   ├── gemini-co-drawing/
│   ├── image-to-code/
│   ├── magical-gif-maker/
│   └── p5js-playground/
├── packages/                # Shared packages across workspace
│   ├── ui/                  # Shared UI components (placeholder)
│   ├── utils/               # Shared utilities (placeholder)
│   └── assets/              # Shared assets (placeholder)
├── skybox-ai/              # 3D hub built with React Three Fiber
│   ├── src/
│   │   ├── App.tsx         # Main 3D scene with portal boxes
│   │   ├── main.tsx        # React entry point
│   │   └── style.css       # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── scripts/
│   └── setup.sh            # Automated setup script
├── .github/
│   └── workflows/
│       ├── blank.yml       # Basic CI workflow
│       ├── deploy-skybox-hub.yml  # GitHub Pages deployment
│       └── unzip-and-commit.yml   # Archive extraction workflow
├── package.json            # Root workspace configuration
├── yarn.lock               # Dependency lock file
├── .yarnrc.yml            # Yarn configuration
└── .gitignore             # Git ignore patterns
```

## Technology Stack

### Package Management
- **Yarn v2+** (Berry) with `nodeLinker: node-modules`
- Corepack for package manager version management
- Workspaces enabled for monorepo management

### Skybox Hub Tech Stack
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 6.2.1** - Build tool and dev server
- **React Three Fiber 8.16.0** - React renderer for Three.js
- **@react-three/drei 9.101.3** - Useful helpers for R3F
- **Three.js 0.164.0** - 3D graphics library

### Build & Development
- Vite with React plugin
- TypeScript with strict mode enabled
- ESNext target compilation
- React JSX transform

## Development Workflows

### Initial Setup

**Option 1: Automated Script (Recommended)**
```bash
bash scripts/setup.sh
```
This script:
- Checks for `code folders.zip` in repository root
- Creates `apps/` directory if missing
- Extracts all mini-games from the archive
- Normalizes folder names (lowercase, spaces → dashes)
- Removes the zip file to keep repo clean
- Creates package directories if missing

**Option 2: GitHub Actions**
1. Navigate to **Actions** tab on GitHub
2. Select **"Unzip and Commit code folders.zip"**
3. Click **Run workflow**
4. Delete the workflow file after successful extraction

### Running the Skybox Hub

```bash
# Install all workspace dependencies
corepack enable
yarn install

# Start development server
yarn dev:hub

# Build for production
yarn build:hub

# Preview production build
yarn workspace skybox-ai preview
```

### Working with Individual Apps

Once apps are extracted:
```bash
cd apps/<app-name>
yarn install
yarn dev  # or yarn start, depending on the app
```

## Code Conventions & Standards

### Naming Conventions
- **Folders**: lowercase with dashes (e.g., `flashcard-maker`, `p5js-playground`)
- **React Components**: PascalCase (e.g., `Portal`, `App`)
- **Files**: camelCase for utilities, PascalCase for components
- **Package Names**: lowercase with dashes in package.json

### TypeScript Configuration
The skybox-ai project uses strict TypeScript:
```json
{
  "strict": true,
  "target": "ESNext",
  "module": "ESNext",
  "jsx": "react-jsx",
  "forceConsistentCasingInFileNames": true
}
```

**Key Rules:**
- No `any` types without good reason
- Proper type definitions for props and state
- Enable all strict mode checks
- Use React JSX transform (no React import needed)

### React & Three.js Conventions

**Skybox Hub Architecture:**
- Canvas wrapper with camera configuration
- OrbitControls for user interaction
- Individual Portal components for each game
- Click handlers open apps in new tabs
- Relative paths for app references

**Component Structure:**
```typescript
function Portal({ name, path, index }: { name: string; path: string; index: number }) {
  // Spatial positioning based on index
  const x = (index - (games.length - 1) / 2) * 3;

  return (
    <group position={[x, 0, 0]} onClick={() => window.open(path, '_blank')}>
      {/* 3D meshes and text */}
    </group>
  );
}
```

### File Structure Patterns

**React Components:**
```
ComponentName/
├── index.tsx          # Export only
├── ComponentName.tsx  # Implementation
├── types.ts          # TypeScript types
└── styles.css        # Component styles
```

**For simple components:** Single file is acceptable

## Git & Branching Strategy

### Branch Naming
- Feature branches: `feature/<description>` or `codex/<description>`
- Bug fixes: `fix/<description>`
- AI-assisted branches: `claude/<description>-<session-id>`

### Commit Message Style
Based on recent commits:
- Clear, descriptive messages
- Start with verb (Add, Create, Update, Fix, etc.)
- Reference what changed and why
- Examples:
  - "Add skybox hub and deployment"
  - "Create a basic CI workflow with GitHub Actions"
  - "Merge pull request #1 from..."

### Git Workflows
- Main branch is protected and triggers deployments
- Pull requests for all major changes
- CI runs on all PRs to main
- Auto-deploy skybox hub on main branch changes

## CI/CD Pipeline

### GitHub Actions Workflows

**1. Deploy Skybox Hub** (`.github/workflows/deploy-skybox-hub.yml`)
- Triggers on push to main when skybox-ai files change
- Installs dependencies with Yarn
- Builds skybox-ai workspace
- Deploys to GitHub Pages
- **Permissions needed**: contents: write, pages: write

**2. Basic CI** (`.github/workflows/blank.yml`)
- Runs on push/PR to main
- Simple hello world validation
- Can be extended for testing

**3. Unzip and Commit** (`.github/workflows/unzip-and-commit.yml`)
- Manual workflow for extracting code folders.zip
- Alternative to local setup script

## AI Assistant Guidelines

### When Making Changes

1. **Read Before Modifying**
   - Always read existing files before suggesting changes
   - Understand the current implementation
   - Check for existing patterns and conventions

2. **Maintain Consistency**
   - Follow existing code style in each workspace
   - Use the same TypeScript strictness
   - Match naming conventions
   - Preserve formatting patterns

3. **Respect the Monorepo**
   - Changes to shared packages affect all apps
   - Test across workspaces when modifying shared code
   - Update workspace dependencies carefully
   - Use `yarn workspace <name> <command>` for workspace-specific operations

4. **TypeScript Best Practices**
   - Always provide proper types for props and function parameters
   - Avoid `any` unless absolutely necessary
   - Use type inference where appropriate
   - Define interfaces for complex objects

5. **React Three Fiber Guidelines**
   - Keep 3D logic in R3F components
   - Use hooks from @react-three/fiber appropriately
   - Leverage @react-three/drei helpers when available
   - Consider performance (avoid unnecessary re-renders)

### Adding New Apps

When adding a new mini-game to `apps/`:

1. Create folder with normalized name (lowercase-with-dashes)
2. Add to games array in `skybox-ai/src/App.tsx`:
   ```typescript
   const games = [
     // existing games...
     { name: 'Display Name', path: '../apps/folder-name' }
   ];
   ```
3. Ensure app has its own package.json if needed
4. Add workspace to root package.json if using shared packages

### Adding Shared Packages

Currently `packages/ui`, `packages/utils`, and `packages/assets` are placeholders:

1. Create package.json in the package directory
2. Define exports and dependencies
3. Add to workspace dependencies in consuming apps
4. Use workspace protocol: `"@daddys-playground/ui": "workspace:*"`

### Common Tasks

**Add a new game to the hub:**
- Update `skybox-ai/src/App.tsx` games array
- Test locally with `yarn dev:hub`
- Commit and push to trigger deployment

**Update dependencies:**
```bash
# Update all workspaces
yarn install

# Update specific workspace
yarn workspace skybox-ai add <package>

# Update root dependencies
yarn add -W <package>
```

**Debug build issues:**
```bash
# Clean install
rm -rf node_modules yarn.lock
yarn install

# Check workspace integrity
yarn workspaces list
```

## Environment & Configuration

### Required Tools
- Node.js 18+ (specified in GitHub Actions)
- Yarn 2+ (managed via Corepack)
- Git

### Environment Files
- No `.env` files committed (in .gitignore)
- Environment-specific config should go in `.env.local`
- Use Vite's `import.meta.env` for environment variables

### Build Output
- Skybox hub builds to `skybox-ai/dist/`
- Dist folders are gitignored
- Production builds deployed to GitHub Pages

## Troubleshooting Guide

### Common Issues

**"Cannot find module" errors:**
- Run `yarn install` at root
- Check workspace configuration in root package.json
- Verify package.json exists in the workspace

**TypeScript errors in skybox-ai:**
- Check tsconfig.json settings
- Ensure all dependencies have types
- Use `@types/*` packages where needed

**Vite build failures:**
- Clear vite cache: `rm -rf skybox-ai/node_modules/.vite`
- Check for syntax errors in TSX files
- Verify all imports resolve correctly

**Deployment failures:**
- Check GitHub Pages is enabled in repo settings
- Verify workflow permissions
- Review GitHub Actions logs for specific errors

## Resources & References

### Official Documentation
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Vite](https://vitejs.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Project-Specific
- Main branch for stable releases
- GitHub Pages for live demo
- Issues/PRs for collaboration

## Version History

- **Latest**: Monorepo structure with skybox hub and automated setup
- **Previous**: Initial setup with code folders archive
- **Next**: Expand shared packages, add more mini-games

---

**Last Updated**: 2025-11-29
**Maintained by**: AI Assistants & Contributors
**Repository**: qbikmuzik615/daddys_playground
