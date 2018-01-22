import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HTTPMockInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url: string = request.url;
        let method: string = request.method;

        return next.handle(request);

        // Example - fallback in case url isn't caught
        // return demographicBackend(url, method, request) 
        // || birthDayBackend(url, method, request) 
        // || next.handle(request);
    }
}

//--------------------------------------------------------------

// intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     // if it is a Github API request
//     if (req.url.includes('api.github.com')) {
//         // we need to add an OAUTH token as a header to access the Github API
//         const clone = req.clone({ setHeaders: { 'Authorization': `token ${OAUTH_TOKEN}` } });
//         return next.handle(clone);
//     }
//     // if it's not a Github API request, we just handle it to the next handler
//     return next.handle(req);
// }