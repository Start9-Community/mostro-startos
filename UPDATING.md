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
  docker manifest inspect mostrop2p/mostro:v0.18.0 \
    | jq -r '.manifests[].platform | "\(.architecture)/\(.os)"'
  ```

## Applying the bump

1. Update `dockerTag` in `startos/manifest/index.ts` (e.g. `mostrop2p/mostro:v0.18.0`)
2. Edit `startos/versions/current.ts` — bump `version` to match upstream semver without the `v`, resetting the downstream revision (e.g. upstream `v0.18.7` → `0.18.7:0`)
3. If the bump requires a migration, rename the old `current.ts` to `vX.Y.Z_N.ts`, add it to `other[]` in `startos/versions/index.ts`, then write the new `current.ts`
4. Update release notes in `current.ts` (all locales)
5. Build and test: `make clean x86 install`
