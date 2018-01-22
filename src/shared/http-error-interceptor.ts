import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/throw';
// import 'rxjs/operators/map';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .catch((err: HttpErrorResponse) => {

                // The network of client encountered an error
                if (err.error instanceof Error) {
                    console.error('An error occurred:', err.error.message);
                }
                // otherwise, the backend returned an unsuccessful response code
                else {
                    console.error(`API backend returned code ${err.status}: ${err.error.code}`);
                    if (err.error.code === 'user_exists') {
                        return Observable.throw(err);
                    }
                }
                // send back default 'HttpResponse' value otherwise), otherwise we have two options
                // 1) return an empty observable, "return Observable.empty<HttpEvent<any>>();" 
                // 2) return a custom observable, 'return Observable.of(new HttpResponse({body: [{name: "Default value..."}]}));' or
                // 3) re-throw the error to the calling function, 'return Observable.throw(err);'
                return Observable.empty<HttpEvent<any>>();
            });
    }
}

//------------------------------------------------------

// private handleHttpError(err: HttpErrorResponse): Observable<any> {
//   if (err.error instanceof Error) {
//     // A client-side or network error occurred. Handle it accordingly.
//     console.error('An error occurred:', err.error.message);
//   } else {
//     // The backend returned an unsuccessful response code.
//     // The response body may contain clues as to what went wrong,
//     console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
//   }
//   // otherwise, return empty observable
//   return Observable.empty<any>();
// }