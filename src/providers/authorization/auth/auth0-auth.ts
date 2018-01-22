import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { WebAuth } from 'auth0-js';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';

import { Auth0Config } from '../../../shared/config/auth-config';
import { Auth0Metadata } from './auth0-meta.interface';
import { environment } from './../../../shared/environments/environment';
import { ProfileService } from './../../storage/profile/profile-service';
import { UserProfileModel } from './../../../models/user-profile-model';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';

/**
 * Auth0-Auth
 * 
 * JWT stands for “JSON Web Token”
 * see: https://www.html5rocks.com/en/tutorials/cors/
 * 
 * JWT Contain Three Parts -
        1.     Header – Is used to define the algorithm to sign the token and token type.
        2.     Payload – It is used to keep a JSON object of all the claims which you want.
        3.     Signature - It is secret key and used to verify the Signature!

        JWT Key Features -
        1.     Decode a JWT from your Angular app and read its payload
        2.     Attach the JWT as an Authorization header to XHR requests
        3.     Existing service method (logging in and logging out) are used to checks whether the current user's JWT is expired or not.

    see:
    https://community.auth0.com/questions/5822/patch-userapp-metadata-isnt-behaving-as-documented
    https://community.auth0.com/questions/7651/create-user-and-set-name-via-api
    https://auth0.com/docs/api/management/v2#!/Users/post_users
*/

@Injectable()
export class Auth0AuthService {

    private jwtHelper: JwtHelper = new JwtHelper();
    private webAuth = new WebAuth(Auth0Config);
    private refreshSubscription: Subscription;
    private didAuthCheckOnStartup: boolean = false;

    constructor(
        private profile: ProfileService,
        private http: HttpClient,
    ) { }

    public async authenticated(): Promise<boolean> {
        // check if the token is expired
        try {
            const activeProfile = await this.profile.getActiveProfile();
            if (!activeProfile || !activeProfile['idToken']) {
                return false;
            }
            return tokenNotExpired('id_token', activeProfile.idToken);

        } catch (err) {
            console.error(`Auth0Service: failed to check authentication: \
            ${JSON.stringify(err, null, 2)}`);
            return false;
        }
    }

    public async login(email: string, password: string): Promise<UserProfileModel> {
        // login to user auth0 account and managment api

        // login to auth0 managment API
        // see: https://community.auth0.com/questions/1626/how-to-generate-a-management-api-token-automatical
        let mgmtIDToken;
        try {
            const url = environment.oauthTokenUrl;
            const options: any = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            };
            // set non-interactive clientID and secretID
            let body = {
                grant_type: 'client_credentials',
                client_id: Auth0Config.mgmtClientID,
                client_secret: Auth0Config.mgmtClientSecret,
                audience: Auth0Config.mgmtClientAudience,
            };
            const apiTokenRequest = await this.http.post(url, body, options).toPromise();
            mgmtIDToken = apiTokenRequest['access_token'];

        } catch (err) {
            console.error(`Auth0Service: failed to login Auth0 managment API: \
            ${JSON.stringify(err, null, 2)}`);
            throw err;
        }

        // login to auth0 with user credentials
        let idToken;
        let refreshToken;
        try {
            const url = environment.oauthTokenUrl;
            const options: any = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            };
            let body = {
                grant_type: 'password',
                client_id: Auth0Config.clientID,
                client_secret: Auth0Config.clientSecret,
                username: email,
                password: password,
                connection: 'Username-Password-Authentication',
                scope: 'openid profile offline_access',
                device: 'Mobile device'
            };
            const userLoginResult = await this.http.post(url, body, options).toPromise();
            idToken = userLoginResult['id_token'];
            refreshToken = userLoginResult['refresh_token'];

        } catch (err) {
            console.error(`Auth0Service: failed to login Auth0 with user credentials`);
            throw err;
        }

        // update user auth0 profile with login information
        try {
            let loginProfile = await this.getProfile(idToken);
            loginProfile.mgmtIDToken = mgmtIDToken;
            loginProfile.idToken = idToken;
            loginProfile.refreshToken = refreshToken;
            // store/merge changes
            loginProfile = await this.profile.update(loginProfile);

            // successful login, set active profile
            return loginProfile;

        } catch (err) {
            console.error(`Auth0Service: failed to update user auth0 \
            profile with login information: ${JSON.stringify(err, null, 2)}`);
            throw err;
        }
    }

    public async logout(): Promise<void> {
        // log out of the app and API
        let profile = await this.profile.getActiveProfile();
        profile.idToken = null;
        profile.refreshToken = null;
        profile.mgmtIDToken = null;
        this.profile.update(profile);

        this.unscheduleRefresh();
    }

    public async signup(email: string, password: string): Promise<boolean> {
        // sign up user with Auth0
        try {
            const url = environment.oauthSignupURL;
            const options: any = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            };
            const body = {
                client_id: Auth0Config.clientID,
                email: email,
                password: password,
                connection: 'Username-Password-Authentication'
            };
            await this.http.post(url, body, options).toPromise();

        } catch (err) {
            if (err.error.code === 'user_exists') {
                console.log(`Auth0Service: user already has an account with Auth0`);
                return false;
            }
            else {
                console.error(`Auth0Service: failed to signup user, unable to signup with Auth0: ${err}`);
                throw err;
            }
        }
        return true;
    }

    public async getProfile(idToken?: string): Promise<UserProfileModel> {
        // Get the user's token information which contains their profile data. 
        try {
            // set defaults, get token from last login
            if (!idToken) {
                const activeProfile = await this.profile.getActiveProfile();
                if (!activeProfile) { throw `unable to get active profile, user not logged in or registered`; }
                idToken = activeProfile.idToken;
            }
            // get auth0 profile using token
            const url = environment.oauthTokenInfoURL;
            const options: any = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
                params: { id_token: idToken }
            };
            const userData = await this.http.get(url, options).toPromise();
            // console.log(`${JSON.stringify(userData, null, 2)}`);

            let auth0Profile = new UserProfileModel({
                uuid: userData['user_id'],
                email: userData['email'],
                password: userData['password'],
                photoURL: userData['picture'],
                idToken: idToken,
            });
            if (userData['app_metadata'] && userData['app_metadata']['recordID']) {
                auth0Profile.recordID = userData['app_metadata']['recordID'];
            }
            return auth0Profile;

        } catch (err) {
            throw new Error(`Auth0Service: failed to get profile: ${err}`);
        }
    }

    public async getRecordID(mgmtIDToken: string, uuid: string): Promise<any> {
        // get metadata with Auth0
        // see: https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id
        //      https://github.com/auth0/docs/blob/master/articles/link-accounts/suggested-linking.md
        try {
            const url = environment.oauthMetaUpdateURL + `/${uuid}?fields=app_metadata&include_fields=true`;
            const options: any = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${mgmtIDToken}`
                }),
            };
            const response = await this.http.get(url, options).toPromise();
            const metadata = response['app_metadata'] as Auth0Metadata;
            return metadata.app_metadata.recordID;

        } catch (err) {
            throw new Error(`Auth0Service: failed to get metadata: ${err}`);
        }
    }

    public async setRecordID(recordID: string, mgmtIDToken: string, uuid: string): Promise<void> {
        // set metadata with Auth0
        // see: https://github.com/auth0/docs/blob/master/articles/user-profile/user-data-storage.md
        try {
            const url = environment.oauthMetaUpdateURL + `/${uuid}`;
            const options: any = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${mgmtIDToken}`
                }),
            };
            const metadata = { app_metadata: { recordID: recordID } };
            const body = {
                client_id: Auth0Config.clientID,
                connection: 'Username-Password-Authentication',
                app_metadata: metadata
            };
            await this.http.patch(url, body, options).toPromise();

        } catch (err) {
            throw new Error(`Auth0Service: failed to set recordID: ${JSON.stringify(err, null, 2)}`);
        }
    }

    private async getNewJwt(): Promise<void> {
        // Get a new JWT from Auth0 using the refresh token saved in local storage
        const activeProfile = await this.profile.getActiveProfile();

        this.webAuth.refreshToken(activeProfile.refreshToken,
            async (err: any, delegationRequest: any) => {
                if (err) {
                    console.error(`Auth0Service: failed to get new JWT, unable to refresh: ${err}`);
                    return;
                }
                activeProfile.idToken = delegationRequest.id_token;
                await this.profile.update(activeProfile);
            });
    }

    public async startupTokenRefresh(): Promise<any> {
        // submit the user's refresh token for a new JWT
        const activeProfile = await this.profile.getActiveProfile();

        return new Promise(async (resolve, reject) => {

            // If the user is authenticated, use the token stream
            // provided by angular2-jwt and flatMap the token
            if (await this.authenticated()) {
                let source = Observable.of(activeProfile.idToken).flatMap(
                    token => {
                        this.didAuthCheckOnStartup = true;
                        // Get the expiry time to generate
                        // a delay in milliseconds
                        let now: number = new Date().valueOf();
                        let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
                        let exp: Date = new Date(0);
                        exp.setUTCSeconds(jwtExp);
                        let delay: number = exp.valueOf() - now;

                        // Use the delay in a timer to
                        // run the refresh at the proper time
                        resolve(this.didAuthCheckOnStartup);

                        return Observable.timer(delay);
                    });

                // Once the delay time from above is
                // reached, get a new JWT and schedule
                // additional refreshes
                source.subscribe(() => {
                    this.getNewJwt();
                    this.scheduleRefresh();
                });
                // otherwise, if not authenticated, postpone
            } else {
                this.didAuthCheckOnStartup = false;
                resolve(this.didAuthCheckOnStartup);
            }
        });
    }

    private async scheduleRefresh(): Promise<any> {
        // subscribe to observable that will trigger when the token needs to be refreshed
        const activeProfile = await this.profile.getActiveProfile();

        let source = Observable.of(activeProfile.idToken).flatMap(
            token => {
                // The delay to generate in this case is the difference
                // between the expiry time and the issued at time
                let jwtIat = this.jwtHelper.decodeToken(token).iat;
                let jwtExp = this.jwtHelper.decodeToken(token).exp;
                let iat = new Date(0);
                let exp = new Date(0);
                let delay = (exp.setUTCSeconds(jwtExp) - iat.setUTCSeconds(jwtIat));
                return Observable.interval(delay);
            });
        this.refreshSubscription = source.subscribe(() => { this.getNewJwt(); });
    }

    private unscheduleRefresh(): void {
        // ubsubscribe from the token refresh observable
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }
}
