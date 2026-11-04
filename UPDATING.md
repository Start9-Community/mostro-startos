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
  docker manifest inspect mostrop2p/mostro:v0.19.3 \
    | jq -r '.manifests[].platform | "\(.architecture)/\(.os)"'
  ```

## Applying the bump

1. Update `dockerTag` in `startos/manifest/index.ts` (e.g. `mostrop2p/mostro:v0.19.3`)
2. Edit `startos/versions/current.ts` — bump `version` to match upstream semver without the `v`, resetting the downstream revision (e.g. upstream `v0.19.3` → `0.19.3:0`)
