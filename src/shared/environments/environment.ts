/**
 * enviroment.ts
 * 
 * set enviroment variable for development or production
 * 
* The file contents for the current environment will overwrite these during build.
* The build system defaults to the dev environment which uses `environment.ts`, but if you do
* `ng build --env=prod` then `environment.prod.ts` will be used instead.
* The list of which env maps to which file can be found in `angular-cli.json`.
*/

// TODO: switch enviroment variables based on 'window.jasmine'
export const environment = {
  production: false,

  oauthTokenUrl: `/oauth/token`,
  oauthTokenInfoURL: `/oauth/tokeninfo`,
  oauthSignupURL: `/oauth/signup`,
  oauthMetaCreateURL: `/oauth/meta/create`,
  oauthMetaUpdateURL: `/oauth/meta/update`,
  redcapURL: `/redcap`,
};