import { ModuleWithProviders, NgModule } from '@angular/core';

import { AuthService } from './auth-service';
import { Auth0AuthService } from './auth/auth0-auth';

/**
 * auth-service.module.ts
 * 
 * Loads authentication providers
 * see: https://github.com/auth0/angular2-jwt/issues/323
 * 
 * Add the following Auth0 Rule:
    function (user, context, callback) {
        var namespace = 'https://mema.auth0.com';
        context.idToken.user_metadata = user.user_metadata;
        context.idToken.app_metadata = user.app_metadata;
        callback(null, user, context);
    }
 */

@NgModule()
export class AuthServiceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AuthServiceModule,
            providers: [
                AuthService,
                Auth0AuthService,
            ]
        };
    }
}
