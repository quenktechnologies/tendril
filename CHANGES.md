# Tendril

## [0.43.14] - 2023-03-04

### Added
 - Add getInstance() to Pool class.

## [0.43.13] - 2023-03-02

### Changed
 - Route tags are now added to PRS automatically.
 
### Added
 - CI scripts for github actions.

## [0.42.3] - 2021-12-01

### Changed
- Filters declared at the conf level are now inherited by child modules.

## [0.42.2] - 2020-11-28

### Added
- Added the `abort()` function to the control API so chains can be exited early.

## [0.42.0] - 2020-11-22

### Changed
- `app.api.Request` is no longer an alias for ExpressJS's Request object.
- Request object now has APIs for PRS and session storage. The Action based 
  APIs may be removed in the future.

## [0.41.6] - 2020-10-18

### Changed
- Add an environment variable flag `TENDRIL_STATIC_WARN_MISSING` that if set,
will log warnings to the console about missing static directories.

## [0.41.5] - 2020-08-31

### Changed
- Session stores must now be wrapped in a `SessionStoreConnection` object
that implements the `Connection` interface. This will allow tendril to close
session stores when shutting down.
