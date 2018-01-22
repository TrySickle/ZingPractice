import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

/** This class implements some features that should be tested. */
@Injectable()
export class HttpClientService {

    constructor(
        private http: HttpClient
    ) { }

    public login(user: string, password: string): Observable<boolean> {
        //Given a username and password, it sends a form-encoded POST and 
        // returns a boolean flag indicating the login result based on 
        // the HTTP response code (200–299 are treated as success in this example)

        const body = new HttpParams()
            .set(`user`, user)
            .set(`password`, password);
        const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

        return this.http.post(`auth/login`, body.toString(), { headers, observe: 'response' })
            .map((res: HttpResponse<Object>) => res.ok)
            .catch((err: any) => Observable.of(false));
    }

    public async loginPromise(user: string, password: string): Promise<string> {
        // Login is resolved as a promise
        const isLoggedIn = await this.login(user, password).toPromise();
        return (isLoggedIn) ? 'logged in' : 'logged out';
    }

    public async loginFirstAttemptFailPromise(user: string, password: string): Promise<string> {
        // Login is attempted twice and resolved as a promise
        // Note: httpclient testing fails unless these are performed in parrelel
        let promise = [
            this.login(user, password).toPromise(),
            this.login(user, password).toPromise()
        ];
        const [loginResponse1, loginResponse2] = await Promise.all(promise);

        if (loginResponse1 && loginResponse2) {
            return 'first succeeded failed, second attempt succeeded';
        }
        else if (!loginResponse1 && loginResponse2) {
            return 'first attempt failed, second attempt succeeded';
        }
        else if (loginResponse1 && !loginResponse2) {
            return 'first attempt succeeded, second attempt failed';
        }
        else {
            return 'first attempt failed, second attempt failed';
        }
    }

}

//------------------------------------------

// public loginTest(email: string, password: string): Observable<ArrayBuffer> {
// // login user with Auth0 and publish authentication event

// // login with Auth0
// let loginProfile: UserProfileModel;
// try {
//     const url = environment.oauthTokenUrl;
//     const body = {
//     grant_type: 'password',
//     client_id: Auth0Config.clientID,
//     client_secret: Auth0Config.clientSecret,
//     username: email,
//     password: password,
//     connection: 'Username-Password-Authentication',
//     scope: 'openid offline_access',
//     device: 'Mobile device'
//     };
//     const options: any = {
//     headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
//     };
//     return this.http.post(url, body, options);

// } catch (err) {
//     throw new Error(`AuthService: failed to login using API, unable to http create observable: ${JSON.stringify(err)}`);
// }
// }

// public async httpPostTest(): Promise<any> {
// // login user with Auth0 and publish authentication event
// try {
//     const response = await this.http.post('http://jsonplaceholder.typicode.com/posts',
//     { title: 'foo', body: 'bar', userId: 1 }).toPromise();
//     return response;

// } catch (err) {
//     throw new Error(`AuthService: failed to login using API, unable to update profile\n${err}`);
// }
// }