import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the BTTagService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.

  Bluetooth tutorial
  see: https://blog.thirdrocktechkno.com/how-to-integrate-bluetooth-with-ionic-3-edeea39ef3bd
  
  ionic cordova plugin add cordova-plugin-bluetooth-serial
  npm install --save @ionic-native/bluetooth-serial
*/
@Injectable()
export class BluetoothService {

  public unpairedDevices: any;
  public pairedDevices: any;
  public gettingDevices: boolean = false;

  constructor(
    private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController,
  ) {
    // initialize bluetooth connection
    this.bluetoothSerial.enable();
  }

  public async startScanning(): Promise<void> {
    // scan for available devices
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;

    // discover unpaired devices
    try {
      const devices = await this.bluetoothSerial.discoverUnpaired();
      this.unpairedDevices = devices;
      this.gettingDevices = false;

      // for (const device of devices) {
      //   alert(`BTTagService: unpaired devices: ${device.name}`);
      // }

    } catch (err) {
      console.error(`BTTagService: failed to scan or 'discover' unpaired devices: ${err}`);
    }

    // scan paired devices
    try {
      const devices = await this.bluetoothSerial.list();
      this.pairedDevices = devices;

      // for (const device of devices) {
      //  console.log(`BTTagService: paired devices: ${device.name}`);
      // }

    } catch (err) {
      console.error(`BTTagService: failed to scan paired devices: ${err}`);
    }
  }


  public selectDevice(address: any) {

    let alert = this.alertCtrl.create({
      title: 'Connect',
      message: 'Do you want to connect with?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            return false;
          }
        },
        {
          text: 'Connect',
          handler: () => {
            this.bluetoothSerial.connect(address)
              .subscribe((success: any) => {
                console.error(`BTTagService: connected to ${success}`);
              });
            return false;
          }
        }
      ]
    });
    alert.present();

  }

  public disconnect() {
    let alert = this.alertCtrl.create({
      title: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            return false;
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect();
            return false;
          }
        }
      ]
    });
    alert.present();
  }

}
