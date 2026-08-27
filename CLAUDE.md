# tapayoka_lib

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

Business logic library with Zustand stores for Tapayoka. Wraps tapayoka_client hooks with client-side caching.

## Package: `@sudobility/tapayoka_lib` (restricted)

## Architecture

- **Stores**: Zustand stores for devices, services, orders, analytics
- **Manager hooks**: Wrap client hooks + stores for entity-scoped caching
- Pattern: manager hook fetches via client hook, syncs to store, returns store data

## Commands

```bash
bun run build && bun run typecheck && bun run lint && bun run test
```

## Peer Dependencies

tapayoka_client, tapayoka_types, @sudobility/types, react, @tanstack/react-query, zustand

## Git Workflow

- Do not use feature branches for code changes. Always stay on the current branch.
