# Contributing to kore

Thank you for your interest in contributing to kore! This document helps you get started.

## Code of Conduct

Be respectful, inclusive, and constructive. We welcome contributors of all skill levels.

## Getting Started

### Prerequisites

- Node.js 18 or 20 LTS
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repo
git clone https://github.com/ajmalnasumudeen/kore.git
cd kore

# Install dependencies
pnpm install

# Build
pnpm build

# Run locally
pnpm start
```

## Development Workflow

1. **Fork** the repository and create a branch from `main`.
2. **Make changes** in your branch.
3. **Run checks** before submitting:
   ```bash
   pnpm build
   pnpm typecheck
   ```
4. **Commit** with clear, descriptive messages.
5. **Open a Pull Request** against `main`.

## What to Contribute

### Adding New Metric Panels

- Metrics are collected in `kore-core` and rendered in `kore-cli`.
- Add new collectors in `packages/kore-core/src/` following the existing pattern.
- Extend the `MetricsSnapshot` type in the shared types.
- Add UI panels in `packages/kore-cli` for the new metrics.

### Adding New Themes

- Themes live in `packages/kore-cli` (check the theme configuration).
- Themes define colors for foreground, background, accents, and progress bars.
- Add your theme to the theme registry and cycle.
- Ensure it works in both light and dark terminal backgrounds.

### Bug Fixes

- Check existing issues first.
- Include steps to reproduce and expected vs actual behavior.
- Add or update tests if applicable.

### Documentation

- Update README.md for new features or CLI flags.
- Add JSDoc for new public APIs.

## Code Style

- Use **TypeScript** with strict mode.
- Follow **camelCase** for variables/functions, **PascalCase** for components.
- Keep functions small and focused.
- Use meaningful commit messages (e.g., `feat: add disk I/O panel`, `fix: memory leak on Linux`).

## Pull Request Guidelines

- Keep PRs focused and reasonably sized.
- Add a brief description of what changed and why.
- Reference any related issues.

## Questions?

Open an issue or reach out to the maintainers. We're happy to help.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
