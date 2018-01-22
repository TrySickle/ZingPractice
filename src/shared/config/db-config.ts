/**
 * db-config.ts
 *
 * API version and settings for client database
 */

export const DBVersion = { api_version: 1 };

const host = 'localhost';
const port = 27017;
const name = 'user_storage';

export let DBConfig = {
  host: host + ':' + port.toString(),
  port: port.toString(),
  name: name,
  api_version: DBVersion.api_version,
  location: 'default',
};
