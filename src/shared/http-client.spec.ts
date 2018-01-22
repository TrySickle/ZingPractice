import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTPMockInterceptor } from './http-mock-interceptor';


/**
 * HTTP MOCK CLIENT RESPONSES
 * 
 * see: https://medium.com/spektrakel-blog/angular-testing-snippets-httpclient-d1dc2f035eb8
 */
xdescribe('HttpClientResponses', () => {

    beforeEach(() => {
        // set up the test environment
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                HttpClientTestingModule
            ],
            providers: [
                HTTPMockInterceptor
            ]
        });
    });

    afterEach(inject([HttpTestingController], (backend: HttpTestingController) => {
        // ensure that there are no outstanding requests has been made
        backend.verify();
    }));

    /**
    * ----------------------------------------------------------------
    * HTTP CLIENT
    * ----------------------------------------------------------------
    */

    // working: generic get and post...
    // const httpResponse = await this.http.get('https://api.github.com/users/seeschweiler').toPromise();
    // const httpResponse = await this.http.post('http://jsonplaceholder.typicode.com/posts',
    //     { title: 'foo', body: 'bar', userId: 1 }).toPromise();


    // 1. declare as async test since the HttpClient works with Observables
    it(`should issue a request`, async(inject([HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

            // 2. send a simple request
            http.get('/foo/bar').subscribe();

            // 3. HttpTestingController supersedes `MockBackend` from the "old" Http package
            // here two, it's significantly less boilerplate code needed to verify an expected request
            backend.expectOne({
                url: '/foo/bar',
                method: 'GET'
            });
        })));

    it(`should respond with fake data`, async(inject([HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

            // send a simple request
            http.get('/foo/bar').subscribe((next) => {
                expect(next).toEqual({ baz: '123' });
            });

            // respond with fake data, resolve the request by
            //  eturning a body plus additional HTTP information
            backend.match({
                url: '/foo/bar',
                method: 'GET'
            })[0].flush({ baz: '123' });
        })));

});


//--------------------------------------------------
        // it(`should handle http request`, async(inject([HttpClient, HttpTestingController],
        //     (http: HttpClient, backend: HttpTestingController) => {
        //         http.post('/allez', { value: 123 }).subscribe();
        //         http.get('/allez').subscribe();
        //         http.delete('/allez').subscribe();

        //         backend.expectNone((req: HttpRequest<any>) => {
        //             return req.method === 'PUT';
        //         });
        //     })));