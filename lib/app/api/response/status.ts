/**
 * Common HTTP 1.0 status codes provided as variables.
 */

export const OK = 200;
export const ACCEPTED = 202;
export const NO_CONTENT = 204;
export const CREATED = 201;
export const MOVED_PERMANENTLY = 301;
export const FOUND = 302;
export const SEE_OTHER = 303;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const INTERNAL_SERVER_ERROR = 500;

/**
 * Status type representing an http status code.
 */
export type Status = number;
