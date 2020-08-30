# Tendril Changelog

## [0.41.5] - 2020-08-31

### Changed
- Session stores must now be wrapped in a `SessionStoreConnection` object
that implements the `Connection` interface. This will allow tendril to close
session stores when shutting down.
