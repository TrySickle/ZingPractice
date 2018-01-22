import { Auth0Config } from '../config/auth-config';
import { RedcapConfig } from '../config/redcap-config';

/**
 *  enviroment.prod.ts
 * 
 * set enviroment variable for development or production
 * 
 * The file contents for the current environment will overwrite these during build.
 * The build system defaults to the dev environment which uses `environment.ts`, but if you do
 * `ng build --env=prod` then `environment.prod.ts` will be used instead.
 * The list of which env maps to which file can be found in `angular-cli.json`.
 * 
 * see: https://github.com/facebookincubator/create-react-app/issues/102
 * var env = process.env.NODE_ENV;
 */
export const environment = {
  production: true,
  silent: false,
  oauthTokenUrl: `https://${Auth0Config.domain}/oauth/token`,
  oauthTokenInfoURL: `https://${Auth0Config.domain}/tokeninfo`,
  oauthSignupURL: `https://${Auth0Config.domain}/dbconnections/signup`,
  oauthMetaCreateURL: `https://${Auth0Config.domain}/api/v2/users`,
  oauthMetaUpdateURL: `https://${Auth0Config.domain}/api/v2/users`,
  redcapURL: `https://${RedcapConfig.domain}/api/`,
};