import { ModuleWithProviders, NgModule } from '@angular/core';

import { BluetoothModule } from './bluetooth/bluetooth.module';
import { FitbitService } from './fitbit-service';
import { PillBoxService } from './pillbox-service';
import { ProxyTagService } from './proxytag-service';

/**
 * Devices Module
 * 
 */
@NgModule({
    imports: [
        BluetoothModule.forRoot(),
    ],
})
export class DeviceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DeviceModule,
            providers: [
                FitbitService,
                PillBoxService,
                ProxyTagService,
            ]
        };
    }
}

