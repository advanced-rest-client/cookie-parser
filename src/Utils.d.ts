import { Cookie as ArcCookie } from './Cookie';

/**
 * Gets the path for a domain as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * @param urlValue A url to extract path from.
 */
export declare function getPath(urlValue: string): string;

/**
 * Checks if `domain` of the request url (defined as `this.url`)
 * matches domain defined in a cookie.
 * This follows algoritm defined in https://tools.ietf.org/html/rfc6265#section-5.1.3
 *
 * Note: If `cookieDomain` is not set it returns false, while
 * (according to the spec) it should be set to `domain` and pass the test.
 * Because this function only check if domains matches it will not
 * override domain.
 * Cookie domain should be filled before calling this function.
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param cookieDomain A domain received with the cookie.
 * @param uri HTTP request url parsed by the URL class.
 * @returns True if domains matches.
 */
export declare function matchesDomain(cookieDomain: string, uri: URL): boolean;

/**
 * Checks if paths mach as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param cookiePath Path from the cookie.
 * @param uri HTTP request url parsed by the URL class.
 * @param url The HTTP request url.
 * @returns `true` when paths matches.
 */
export declare function matchesPath(cookiePath: string, uri: URL, url: string): boolean;

/**
 * Clients must fill `path` and `domain` attribute if not set by the
 * server to match current request url.
 *
 * @param uri HTTP request url parsed by the URL class.
 * @param url The HTTP request url.
 * @param cookies Parsed cookies
 */
export declare function fillCookieAttributes(uri: URL, url: string, cookies: ArcCookie[]): void;
