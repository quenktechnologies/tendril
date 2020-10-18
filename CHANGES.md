# Tendril Changelog

## [0.41.6] - 2020-10-18

### Changed
- Add an environment variable flag `TENDRIL_STATIC_WARN_MISSING` that if set,
will log warnings to the console about missing static directories.

## [0.41.5] - 2020-08-31

### Changed
- Session stores must now be wrapped in a `SessionStoreConnection` object
that implements the `Connection` interface. This will allow tendril to close
session stores when shutting down.
