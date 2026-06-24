# Updating the upstream version

Mostro is packaged as a pre-built Docker image from Docker Hub.

## Determining the upstream version

- **Registry:** [hub.docker.com/r/mostrop2p/mostro/tags](https://hub.docker.com/r/mostrop2p/mostro/tags)
- **Current pin:** `startos/manifest/index.ts` → `images.mostro.source.dockerTag`
- **Latest release tags** (Mostro uses a `v` prefix on Docker Hub):

  ```bash
  curl -s "https://hub.docker.com/v2/repositories/mostrop2p/mostro/tags?page_size=10" \
    | jq -r '.results[].name' | head
  ```

- Confirm multi-arch support (`amd64`, `arm64`) before pinning:

  ```bash
  docker manifest inspect mostrop2p/mostro:v0.17.4 \
    | jq -r '.manifests[].platform | "\(.architecture)/\(.os)"'
  ```

## Applying the bump

1. Update `dockerTag` in `startos/manifest/index.ts` (e.g. `mostrop2p/mostro:v0.17.4`)
2. Edit `startos/versions/current.ts` — bump `version` to match upstream semver without the `v` (e.g. `0.17.4:0`)
3. If the bump requires a migration, rename the old `current.ts` to `vX.Y.Z_N.ts`, add it to `other[]` in `startos/versions/index.ts`, then write the new `current.ts`
4. Update release notes in `current.ts` (all locales)
5. Build and test: `make clean x86 install`

## Git tag

Format: `v{upstream}_{downstream}` — e.g. `0.17.4:0` → `v0.17.4_0`

```bash
git tag v0.17.4_0
git push origin v0.17.4_0
```
