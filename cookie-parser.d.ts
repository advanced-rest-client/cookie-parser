export {Cookie};

interface CookieObject {
  name: string,
  value: string,
  'max-age': number,
  expires: number,
  domain: string
  path: string
  secure: boolean
  httpOnly: boolean
}

declare class Cookie {
  maxAge: number;
  expires: number|Date|String;
  domain: String;
  constructor(name: string, value: string, opts?: CookieObject);
  toString(): string;
  toHeader(): string;
  toJSON(): Object;
}

export {Cookies};

declare class Cookies {
  cookies: Array<Cookie>;
  url: string;
  constructor(cookie?: string, url?: string);
  static parse(cookies: string): Array<Cookies>;

  get(name: string): Cookie|null;
  set(name: string, value: string, opts?: CookieObject): void;
  toString(toServer: boolean): string;
  filter(): Array<Cookie>;
  merge(cookies: Cookies, copyKeys?:String|Array<String>): void;
  clearExpired(): Array<Cookie>;

  _fillCookieAttributes(): void;
  _getPath(url: string): string;
  _matchPath(cookiePath: string): boolean;
  _matchDomain(cookieDomain: string): boolean;
}
