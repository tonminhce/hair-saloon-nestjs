export const MAX_PRICE = 99999999;
export const SMALL_INT = 32767;
export const STD_STR = 50;
export const MIN_NAME = 2;
export const FREE_STR = 200;
export const URL_STR = 2048;
export const PHONE = 10;
export const EMAIL = 100;
export const STORE_TYPE = [
  'STREET_STORE',
  'SHOPPING_CENTER',
  'STATION',
] as const;
export const TIME_RANGE_REGEX =
  /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM)\s*-\s*(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM)$/i;
