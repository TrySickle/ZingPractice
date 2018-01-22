import { Injectable } from '@angular/core';
import { BluetoothService } from './bluetooth/bluetooth-service';

/*
  Generated class for the ProxyTagService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ProxyTagService {

    constructor(
        private btService: BluetoothService,
    ) { }
}
