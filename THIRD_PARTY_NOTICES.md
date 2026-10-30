# Runtime provenance and notices

The runtime bundles only 550W-owned TypeScript sources, provided under Apache-2.0 in vendor/source. It imports Node.js built-in modules at execution time. No third-party JavaScript implementation is bundled in vendor/runtime.cjs. Build and SDK dependencies retain their licenses in the dependency manager; see pnpm-lock.yaml.
