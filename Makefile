# Mostro only ships x86_64 and aarch64 images (no riscv64)
ARCHES := x86 arm

include node_modules/@start9labs/start-sdk/s9pk.mk
