/**
 * fitbit-config.ts
 * 
 * Fitbit credentials
 * see: https://dev.fitbit.com/apps/details/228L7K
 */
// import { AuthConfig } from 'angular-oauth2-oidc';

export const FitbitConfig = {
  clientID: '228L7K',
  clientSecret: 'c00e3e8bff8b107d54a80ed1deef48fb',
  redirectURI: 'http://localhost:8100',
  scope: 'profile activity sleep',
};

// export const authConfig: AuthConfig = {

//   // Url of the Identity Provider
//   issuer: 'https://www.fitbit.com/oauth2/authorize',

//   // URL of the SPA to redirect the user to after login
//   redirectUri: 'http://localhost:8100',

//   // The SPA's id. The SPA is registerd with this id at the auth-server
//   clientId: '228L7K',

//   // set the scope for the permissions the client should request
//   // The first three are defined by OIDC. The 4th is a usecase-specific one
//   scope: 'profile',
// };