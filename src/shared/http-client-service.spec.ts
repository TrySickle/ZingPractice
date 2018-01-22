import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient, HttpRequest, HttpParams, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientService } from './http-client-service';
import { HTTPMockInterceptor } from './http-mock-interceptor';


/**
 * Example handles case of simple http calls. In our case we are integration testing.
 * Instead of a call to '/auth/login' we will call multiple things. 
 * Tests should work as long as we're not actually calling external APIs (i.e. 'auth/login')
 * 
 * We can test simple http requests with mock-backend responses 
 *      use 'subscribe, next' and 'flush' within the test (e.g. 'auth/login' with 404 not found)
 * 
 * We should be able to test multi-step functions with a mock http interceptor
 *      multiple promises do not work in a row
 */


/**
 * HTTP MOCK CLIENT SERVICE
 * 
 * see: https://medium.com/spektrakel-blog/angular-testing-snippets-httpclient-d1dc2f035eb8
 */
xdescribe('HttpClientService', () => {

    beforeEach(() => {
        // set up the test environment
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                HttpClientTestingModule
            ],
            providers: [
                HttpClientService,
                { provide: HTTP_INTERCEPTORS, useClass: HTTPMockInterceptor, multi: true },
            ]
        });
    });

    afterEach(inject([HttpTestingController], (backend: HttpTestingController) => {
        // ensure that there are no outstanding requests has been made
        backend.verify();
    }));

    /**
    * ----------------------------------------------------------------
    * HTTP sERVICE
    * ----------------------------------------------------------------
    */
    it(`should send an expected login request`, async(inject([HttpClientService, HttpTestingController],
        (service: HttpClientService, backend: HttpTestingController) => {
            service.login('foo', 'bar').subscribe();

            // Expect that a single request has been made which matches the given 
            // parameters, and return its mock. If no such request has been made, 
            // or more than one such request has been made, fail with an error message
            // including the given request description, if any.
            backend.expectOne((req: HttpRequest<any>) => {
                const body = new HttpParams({ fromString: req.body });

                // expectation for the correct login request uses a matcher function
                // specifically check for the Content-Type header and whether it’s a form-encoded entity
                return req.url === 'auth/login'
                    && req.method === 'POST'
                    && req.headers.get('Content-Type') === 'application/x-www-form-urlencoded'
                    && body.get('user') === 'foo'
                    && body.get('password') === 'bar';
            }, `POST to 'auth/login' with form-encoded user and password`);
        })));

    it(`should emit 'false' for 401 Unauthorized`, async(inject([HttpClientService, HttpTestingController],
        (service: HttpClientService, backend: HttpTestingController) => {
            service.login('foo', 'bar').subscribe((next) => {
                expect(next).toBeFalsy();
            });

            // resolve the request by returning a body plus additional HTTP information
            backend.expectOne('auth/login')
                .flush(null /*body*/, { status: 401, statusText: 'Unauthorized' } /*headers*/);
        })));

    it(`should emit 'true' for 200 Ok`, async(inject([HttpClientService, HttpTestingController],
        (service: HttpClientService, backend: HttpTestingController) => {
            service.login('foo', 'bar').subscribe((next) => {
                expect(next).toBeTruthy();
            });

            backend.expectOne('auth/login')
                .flush(null, { status: 200, statusText: 'Ok' });
        })));

    it(`should emit 'logged in' for 200 Ok`, async(inject([HttpClientService, HttpTestingController],
        (service: HttpClientService, backend: HttpTestingController) => {

            service.loginPromise('foo', 'bar').then((res) => {
                // console.log(`HttpClientService: login using promise, ${(res === 'logged in') ? 'successful' : 'failed'}`);
                expect(res).toEqual('logged in');
            });

            backend.expectOne('auth/login')
                .flush(null, { status: 200, statusText: 'Ok' });
        })));

    it(`should emit 'first attempt failed, second attempt succeeded' for '401 Unauthorized' and '200 Ok', respectively`,
        async(inject([HttpClientService, HttpTestingController],
            (service: HttpClientService, backend: HttpTestingController) => {

                service.loginFirstAttemptFailPromise('foo', 'bar').then((res) => {
                    expect(res).toEqual('first attempt failed, second attempt succeeded');
                });

                const reqs = backend.match('auth/login');
                expect(reqs.length).toBe(2);
                reqs[0].flush(null, { status: 401, statusText: 'Unauthorized' });
                reqs[1].flush(null, { status: 200, statusText: 'Ok' });
            })));

});

