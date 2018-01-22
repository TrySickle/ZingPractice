import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import { UserProfileModel } from './../models/user-profile-model';
import { UserRoleType } from './enums';
import { UserBaseModel } from './../models/user-base-model';

// IONIC:
/* tslint:disable */

/**
 * USER PROFILE SERVICE MOCK
 */
export class ProfileServiceMock {

  public async getActiveProfile(): Promise<UserProfileModel> {
    return Promise.resolve(ProfileServiceMock.createProfile());
  }

  public static createProfile() {
    const user = new UserBaseModel({
      uuid: 'e83d05f7-9852-4d76-8fe9-8cfea4a58fbf',
      firstName: 'Jon',
      lastName: 'Doe',
      recordID: '999',
      familyID: '999',
      email: 'b1@gmail.com',
      password: 'b1',
      phoneNumber: '(860)-368-0104',
      userRole: UserRoleType.Patient,
      enrollDate: new Date(2017, 9, 1, 9, 0, 0, 0), //Fri, 10/1/17 @ 9am
      eventDate: new Date(2017, 9, 1, 9, 0, 0, 0), //Fri, 10/1/17 @ 9am
      submitDate: new Date(2017, 9, 1, 9, 0, 0, 0), //Fri, 10/1/17 @ 9am
    });
    return new UserProfileModel(user);
  }
}

/**
 * EVENT MOCK
 */
export class EventsMock {
  public static instance(): any {
  }
}

/**
 * AUTH MOCK
 */
export class AuthMock {

  public authenticated(): boolean {
    // check if the token is expired
    return false;
  }

  public async signup(email: string, password: string): Promise<UserProfileModel> {
    // sign up user for the study
    return Promise.resolve(ProfileServiceMock.createProfile());
  }

  public async login(email: string, password: string): Promise<UserProfileModel> {
    // login user with Auth0 and publish authentication event
    return Promise.resolve(ProfileServiceMock.createProfile());
  }

}

/**
 * USER MOCK
 */
export class UserMock {

  set(userAgent: string): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };
  get(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };
  store(): void {
    return;
  };
  reset(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };
}

/**
 * PLATFORM MOCK
 */
export class PlatformMock {

  public ready(): Promise<String> {
    return new Promise((resolve) => {
      resolve('READY');
    });
  }
  public getQueryParam() {
    return true;
  }
  public registerBackButtonAction(fn: Function, priority?: number): Function {
    return (() => true);
  }
  public hasFocus(ele: HTMLElement): boolean {
    return true;
  }
  public doc(): HTMLDocument {
    return document;
  }
  public is(): boolean {
    return true;
  }
  public getElementComputedStyle(container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10',
    };
  }
  public onResize(callback: any) {
    return callback;
  }
  public registerListener(ele: any, eventName: string, callback: any): Function {
    return (() => true);
  }
  public win(): Window {
    return window;
  }
  public raf(callback: any): number {
    return 1;
  }
  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer);
  }
  public cancelTimeout(id: any) {
    return;
  }
  public getActiveElement(): any {
    return document['activeElement'];
  }
}

/**
 * LOCAL NOTIFICATIONS MOCK
 */
export class LocalNotificationsMock {
}

/**
 * STATUSBAR MOCK
 */
export class StatusBarMock extends StatusBar {
  styleDefault() {
    return;
  }
}

/**
 * SPLASHSCREEN MOCK
 */
export class SplashScreenMock extends SplashScreen {
  show() {
    return;
  }
  hide() {
    return;
  }
}

/**
 * STORAGE MOCK
 */
export class StorageMock extends Storage {
  hide() {
    return;
  }
}

/**
 * ALERT MOCK
 */
export class AlertMock {

  public create(): any {
    let rtn: any = {};
    rtn['present'] = (() => true);
    return rtn;
  }
  // function actually on the AlertClass (not AlertController), but using these interchangably for now
  public dismiss(): Promise<{}> {
    return new Promise(function (resolve: Function): void {
      resolve();
    });
  }
}

/**
 * TOAST MOCK
 */
export class ToastMock {

  public create(): any {
    let rtn: any = {};
    rtn['present'] = (() => true);
    return rtn;
  }
}

/**
 * CONFIG MOCK
 */
export class ConfigMock {

  public get(): any {
    return '';
  }
  public getBoolean(): boolean {
    return true;
  }
  public getNumber(): number {
    return 1;
  }
  public setTransition(): void {
    return;
  }
}

/**
 * FORM MOCK
 */
export class FormMock {
  public register(): any {
    return true;
  }
}

/**
 * NAV MOCK
 */
export class NavMock {

  public pop(): any {
    return new Promise(function (resolve: Function): void {
      resolve();
    });
  }

  public push(): any {
    return new Promise(function (resolve: Function): void {
      resolve();
    });
  }

  public getActive(): any {
    return {
      'instance': {
        'model': 'something',
      },
    };
  }

  public setRoot(): any {
    return true;
  }

  public popToRoot(): any {
    return true;
  }
}

export class SplashMock {

  public hide() {
    return Promise.resolve(true);
  }
}

export class StatusMock {

  public styleDefault() {
    return Promise.resolve(true);
  }
}

export class MenuMock {
  public close(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
}

export class AppMock {

  public getActiveNav(): NavMock {
    return new NavMock();
  }
}
