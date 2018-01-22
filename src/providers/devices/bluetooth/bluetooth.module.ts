import { NgModule, ModuleWithProviders } from '@angular/core';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothService } from './bluetooth-service';

/**
 * Bluetooth Module
 * 
 * Loads bluetooth providers
 */
@NgModule({})
export class BluetoothModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: BluetoothModule,
            providers: [
                BluetoothSerial,
                BluetoothService,
            ]
        };
    }
}


