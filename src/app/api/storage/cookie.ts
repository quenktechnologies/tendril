/**
 * The cookie module provides APIs for storing cookie data.
 *
 * Enable cookie parsing by setting "app.parses.cookie.enable" to true.
 */

/** imports */

import * as express from 'express';

import { fromNullable, Maybe } from '@quenk/noni/lib/data/maybe';
import { Record } from '@quenk/noni/lib/data/record';

/**
 * CookieName type.
 */
export type CookieName = string;

/**
 * CookieValue type.
 */
export type CookieValue = string;

/** 
 * CookieOptions type.
 */
export type CookieOptions = express.CookieOptions;

/**
 * CookieManager is the Response API with all the extra stuff removed.
 */
export interface CookieManager {

    /**
     * cookie sets a cookie
     */
    cookie(key: CookieName, value: CookieValue, opts: CookieOptions): CookieManager

    /**
     * clearCookie clears a cookie.
     */
    clearCookie(key: CookieName, opts?: CookieOptions): CookieManager

}

/**
 * CookieStorage wraps around the express cookie APIs to provide a single point
 * to read and update cookies.
 *
 * Only signed cookies are supported.
 */
export class CookieStorage {

    constructor(public data: Record<CookieValue>, public manager: CookieManager) { }

    /**
     * get the value of a cookie if it exists.
     */
    get(key: CookieName): Maybe<CookieValue> {

        return fromNullable(this.data[key]);

    }

    /**
     * getOrElse returns a cookies value if set or the alternative.
     */
    getOrElse(key: CookieName, alt: CookieValue): CookieValue {

        return this.get(key).orJust(() => alt).get();

    }

    /**
     * exists tests if a cookie is set and has a value.
     */
    exists(key: CookieName): boolean {

        return this.get(key).isJust();

    }

    /**
     * set a cookie.
     */
    set(key: CookieName, value: CookieValue, opts: express.CookieOptions = {}) {

        this.manager.cookie(key, value, opts);

        return this;

    }

    /**
     * remove a cookie.
     */
    remove(key: CookieName) {

        this.manager.clearCookie(key);

        return this;

    }

}

/**
 * @private
 */
export class MapCookieManager {

  constructor(
    public data:Record<CookieValue>,
    public opts:Record<CookieOptions> ={}){}

    cookie(key: CookieName, value: CookieValue, opts: CookieOptions) {

      this.data[key] = value;
      this.opts[key] = opts;
      return this;

    }

    clearCookie(key: CookieName, _?: CookieOptions): CookieManager {
  
      delete this.data[key];
      delete this.opts[key];
      return this;

    }
}
