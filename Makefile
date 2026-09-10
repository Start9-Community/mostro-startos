# Mostro only ships x86_64 and aarch64 images (no riscv64)
ARCHES := x86 arm
# overrides to s9pk.mk must precede the include statement
include node_modules/@start9labs/start-sdk/s9pk.mk
