import { Injectable } from '@angular/core';
import { BluetoothService } from './bluetooth/bluetooth-service';

/*
  Generated class for the PillBoxService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PillBoxService {

  constructor(
    private btService: BluetoothService,
  ) { }

  public scan() {
    //this.btService.startScanning();
  }

  public subscribe() {

  }

  public onKeyChange(buffer: ArrayBuffer) {

    // const str = this.bytesToString(buffer);
    // this.ngZone.run(() => {
    //     this.tagStatus = str;
    // });

    //----------
    // Key change - unsigned int value
    // const data = new Uint8Array(buffer);
    // this.ngZone.run(() => {
    //     this.tagStatus = data[0];
    // });


    // Proximity - unsigned int value
    // const data = new Uint8Array(buffer);
    // const data = new Float64Array(buffer);
    // this.ngZone.run(() => {
    //     this.tagStatus = data[0];
    // });
  }

}
