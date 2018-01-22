import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Platform, Events } from 'ionic-angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AuthService } from './auth-service';
import { RedcapService } from '../storage/redcap/redcap-service';
import { ProfileService } from '../storage/profile/profile-service';
import { PlatformMock, ProfileServiceMock, EventsMock } from '../../shared/mocks';

// tslint:disable:max-line-length
/**
 * auth-service.spec.ts
 * 
 * service testing
 * see: http://www.kirjai.com/testing-angular-services-with-dependencies/
 *      https://angular.io/guide/testing#services-with-dependencies
 * 
 * see: https://github.com/blacksonic/angular-testing-ground
 * 
 * JEST
 * see: https://www.xfive.co/blog/testing-angular-faster-jest/
 *      https://facebook.github.io/jest/docs/en/api.html
 *      https://izifortune.com/unit-testing-angular-applications-with-jest/
 *      https://github.com/patrickmichalina/fusebox-angular-universal-starter/blob/master/src/client/app/shared/services/http-config-interceptor.service.spec.ts
 *      https://github.com/ngrx/platform/blob/master/example-app/app/core/services/google-books.spec.ts
 *      https://semaphoreci.com/community/tutorials/testing-angular-2-and-continuous-integration-with-jest
 *      https://medium.com/spektrakel-blog/angular-testing-snippets-httpclient-d1dc2f035eb8
 */
// tslint:disable:no-debugger

describe('AuthService', () => {

    /**
    * ----------------------------------------------------------------
    * INIT TESTS
    * ----------------------------------------------------------------
    */
    beforeEach(() => {
        // set up the test environment
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                HttpClientTestingModule
            ],
            providers: [
                AuthService,
                RedcapService,
                ProfileService,
                { provide: Events, useClass: EventsMock },
                { provide: ProfileService, useClass: ProfileServiceMock },
                { provide: Platform, useClass: PlatformMock },
            ]
        }).compileComponents();
    });

    afterEach(() => {
        // ensure that there are no outstanding requests has been made
        const backend = TestBed.get(HttpTestingController);
        backend.verify();
    });

    /**
    * ----------------------------------------------------------------
    * SIGNUP
    * ----------------------------------------------------------------
    */
    test('defines service', async function (done) {
        const auth = TestBed.get(AuthService);
        expect(auth).toBeDefined();
        done();
    });

    //----------------------

    // try {
    //     const profile = await this.auth0.login('bidwej@gmail.com', 'mojo99');
    //     await this.auth0.setRecordID('321', profile.mgmtIDToken, profile.uuid);
    //     const recordID = await this.auth0.getRecordID(profile.mgmtIDToken, profile.uuid);
    //     console.log(`RecordID: ${recordID}`);
    // }
    // catch (err) {
    //     console.error(`ERROR: ${JSON.stringify(err, null, 2)}`);
    // }

    //----------------------

    // test('should login', async function (done) {
    //     const auth = TestBed.get(AuthService);
    //     const profile = await auth.login('b1@gmail.com', 'b1');
    //     expect(profile).toBeDefined();
    //     done();
    // });

    // test('signs up user, first-time local storage, first-time redcap storage', async function (done) {
    //     try {
    //         // TODO: remove local storage
    //         // TODO: remove redcap storage

    //         let profileDoc = new UserProfileMock();
    //         const signupDoc = await auth.signup(
    //             profileDoc.email,
    //             profileDoc.password
    //         );
    //         expect(signupDoc).toBeDefined();

    //     } catch (err) {
    //         console.error(`AuthServiceSpec: failed to signup, first-time local storage, first-time redcap storage: ${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done(); 
    // });

    // test('signs up user, first-time local storage, existing redcap storage', async function (done) {
    //     try {
    //         // TODO: remove local storage
    //         // TODO: add redcap storage

    //     } catch (err) {

    //     }
    //     done();
    // });

    // test('signs up user, existing local storage, first-time redcap', async function (done) {
    //     try {
    //         // TODO: add local storage
    //         // TODO: remove redcap storage

    //     } catch (err) {

    //     }
    //     done();
    // });

    // test('signs up user, existing local storage, existing redcap storage', async function (done) {
    //     try {
    //         // TODO: add local storage
    //         // TODO: add redcap storage

    //     } catch (err) {

    //     }
    //     done();
    // });

    // /**
    // * ----------------------------------------------------------------
    // * LOGIN
    // * ----------------------------------------------------------------
    // */
    // test('defines service', async function (done) {
    //     expect(auth).toBeDefined();
    //     done();
    // });

    // test('logs in user, first-time local storage, first-time redcap storage', async function (done) {
    //     try {
    //         // TODO: remove local storage
    //         // TODO: remove redcap storage
    //     } catch (err) {

    //     }
    //     done();
    // });

    // test('logs in user, first-time local storage, existing redcap storage', async function (done) {
    //     try {
    //         // TODO: remove local storage
    //         // TODO: add redcap storage
    //     } catch (err) {

    //     }
    //     done();
    // });

    // test('logs in user, existing local storage, first-time redcap', async function (done) {
    //     try {
    //         // TODO: add local storage
    //         // TODO: remove redcap storage
    //     } catch (err) {

    //     }
    //     done();
    // });

    // test('logs in user, existing local storage, existing redcap storage', async function (done) {
    //     try {
    //         // TODO: add local storage
    //         // TODO: add redcap storage

    //     } catch (err) {

    //     }
    //     done();
    // });

    //-----------------------------------------

    // test('login via ionic cloud API', async function (done) {
    //     // login to ionic cloud API
    //     try {
    //         const profileDoc = userProfileDoc();
    //         let resLogin = await auth.login(
    //             profileDoc.email,
    //             profileDoc.password
    //         );
    //         expect(resLogin).toBeDefined();

    //     } catch (err) {
    //         console.error('AuthServiceSpec: failed to login: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('logout via ionic cloud API', async function (done) {
    //     // login out of ionic cloud API
    //     try {
    //         let resLogout = await auth.logout();
    //         expect(resLogout).toBeDefined();

    //     } catch (err) {
    //         console.error('AuthServiceSpec: failed to logout: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });
});