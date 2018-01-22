import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the NetworkProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
// declare const navigator: any;
// declare const Connection: any;
// see: https://www.thepolyglotdeveloper.com/2016/01/determine-network-availability-in-an-ionic-2-mobile-app/

@Injectable()
export class NetworkProvider {

  public online: boolean = false;

  constructor(
    private network: Network,
    private toastCtrl: ToastController,
  ) {
    // subscribe to network changes on startup
    // connect
    this.network.onConnect().subscribe((res: any) => {
      this.showNetworkStatusToast(res.type);
      this.online = false;
    }, error => console.error(error));

    // disconnect
    this.network.onDisconnect().subscribe((res: any) => {
      this.showNetworkStatusToast(res.type);
      this.online = false;
    }, error => console.error(error));
  }

  /**
   * METHODS
   */
  private showNetworkStatusToast(connectionState: string): void {
    // show toast on network status 
    let networkType = this.network.type;
    this.toastCtrl.create({
      message: `NetworkProvider: now ${connectionState} via ${networkType}`,
      duration: 2000
    }).present();
  }

}

//---------------------------------------------------------

  // public checkNetwork(): void {
  //   this.platform.ready().then(() => {
  //       const networkState = navigator.connection.type;
  //       const states = {};
  //       states[Connection.UNKNOWN]  = 'Unknown connection';
  //       states[Connection.ETHERNET] = 'Ethernet connection';
  //       states[Connection.WIFI]     = 'WiFi connection';
  //       states[Connection.CELL_2G]  = 'Cell 2G connection';
  //       states[Connection.CELL_3G]  = 'Cell 3G connection';
  //       states[Connection.CELL_4G]  = 'Cell 4G connection';
  //       states[Connection.CELL]     = 'Cell generic connection';
  //       states[Connection.NONE]     = 'No network connection';
  //       let alert = Alert.create({
  //           title: "Connection Status",
  //           subTitle: states[networkState],
  //           buttons: ["OK"]
  //       });
  //       this.navCtrl.present(alert);
  //   });
  // }
