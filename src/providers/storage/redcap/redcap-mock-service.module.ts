import { ModuleWithProviders, NgModule } from '@angular/core';
import { StorageService } from '../storage-service';
import { StorageServiceModule } from '../storage-service.module';
import { AuthServiceModule } from '../../authorization/auth-service.module';
import { RedcapMockService } from './redcap-mock-service';

/**
 * RedcapMockService Module
 * 
 */
@NgModule({
    imports: [
        StorageServiceModule.forRoot(),
        AuthServiceModule.forRoot(),
    ],
})
export class RedcapMockServiceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: RedcapMockServiceModule,
            providers: [
                RedcapMockService,
            ]
        };
    }
}

