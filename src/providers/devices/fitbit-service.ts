import { ProfileService } from '../storage/profile/profile-service';
import { Injectable } from '@angular/core';
import * as FitbitApiClient from 'fitbit-node';
import { Platform } from 'ionic-angular';

import { FitbitConfig } from '../../shared/config/fitbit-config';
import { UserDataModel } from '../../models/user-data-model';
import { ExerciseModel } from '../../models/exercise-model';
import { StorageService } from '../storage/storage-service';
import { SleepModel } from '../../models/sleep-model';
import { HttpClient, HttpHeaders, HttpSentEvent } from '@angular/common/http';

@Injectable()
export class FitbitService {

  private fitbitAccessToken: string;      // implicit & authorization grant flows
  // private fitbitRefreshToken: string;  // authorization grant (only)

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private profile: ProfileService,
    private storage: StorageService,
  ) {
    // initialize fitbit client
    this.startupTokenRefresh();
  }

  /**
   * METHODS
   */
  public async startupTokenRefresh(): Promise<void> {
    // refresh user login from redirect URL
    try {
      const profile = await this.profile.getActiveProfile();

      if (this.isRedirectURL(window.location.href)) {
        const url = window.location.href;

        // 'authorization grant' type
        if (url.includes('code')) {
          // TODO: Extract fields for 'authorization grant type', includes a refresh
          // token. This addresses the problem of implicit grant flow timing out
          const code = this.getAuthCodeFromURL(url);
          this.fitbitAccessToken = await this.getAccessToken(code, FitbitConfig.redirectURI);
          //this.fitbitRefreshToken = await this.getRefreshToken(code, FitbitConfig.redirectURI);
        }
        // 'implicit grant' type
        else if (url.includes('access_token')) {
          this.fitbitAccessToken = this.getAuthTokenFromURL(url);
        }
        // update token in user profile
        if (this.fitbitAccessToken) {
          profile.fitbitAccessToken = this.fitbitAccessToken;
          await this.profile.update(profile);
        }
      }
      else {
        // use cached fitbit tokens if it's still valid
        if (profile.fitbitAccessToken) {
          const isTokenValid: boolean = await this.pullFitbitProfileID(profile.fitbitAccessToken);
          if (isTokenValid) {
            this.fitbitAccessToken = profile.fitbitAccessToken;
            return;
          }
        }
        // otherwise, send users to authorization page
        const isShowLoginRequired = false;
        let url = this.getAuthorizationURL(isShowLoginRequired);
        let browserRef = window.open(url, '_self', 'location=yes');
      }

    } catch (err) {
      console.error(`FitbitService: failed to refresh startup token: ${err}`);
    }

  }

  public async pullFitbitProfileID(fitbitAccessToken?: string): Promise<any> {
    // get user profile from fitbit web-api
    let encodedID;
    // set defaults
    if (!fitbitAccessToken) {
      fitbitAccessToken = this.fitbitAccessToken;
    }
    try {
      if (!fitbitAccessToken) {
        throw this.missingTokenError();
      }
      const url = `https://api.fitbit.com/1/user/-/profile.json`;
      const options: any = {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.fitbitAccessToken}` })
      };
      const fitbitProfile = await this.http.get(url, options).toPromise();
      encodedID = fitbitProfile['user'].encodedId;

    } catch (err) {
      throw new Error(`FitbitService: failed to get data: '${err}'`);
    }
    return encodedID;
  }

  public async getActivity(startDate: Date, endDate: Date, resourcePath: string): Promise<any> {
    // get activities from fitbit web-api
    let activities: any;

    try {
      if (!this.fitbitAccessToken) {
        throw this.missingTokenError();
      }
      const url = this.getActivityURL(startDate, endDate, resourcePath);
      const options: any = {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.fitbitAccessToken}` }),
      };
      activities = this.http.get(url, options).toPromise();

    } catch (err) {
      throw new Error(`FitbitService: failed to get activity data: '${err}'`);
    }
    return activities;
  }

  public async getSleep(startDate: Date, endDate: Date, resourcePath?: string): Promise<any> {
    // get sleep data from fitbit web-api
    let sleepData: any;

    // set defaults
    if (!resourcePath) { resourcePath = 'sleep'; }

    try {
      if (!this.fitbitAccessToken) {
        throw this.missingTokenError();
      }
      const url = this.getSleepURL(startDate, endDate);
      const options: any = {
        headers: { 'Authorization': `Bearer ${this.fitbitAccessToken}` }
      };
      sleepData = this.http.request(url, options).toPromise();

    } catch (err) {
      throw new Error(`FitbitService: failed to get sleep data: '${err}'`);
    }
    return sleepData;
  }

  public async pullReplaceAllDates(): Promise<void> {
    // pull all fitbit data from web-api
    const profile = await this.profile.getActiveProfile();

    // update reports
    const uuid = profile.uuid;
    const startDate = profile.enrollDate;
    const endDate = profile.lastEventDate;
    // sleep
    const sleepReports = await this.pullSleepReports(uuid, startDate, endDate);
    await this.storage.update(sleepReports);
    // exercise
    const activityReports = await this.pullActivityReports(uuid, startDate, endDate);
    await this.storage.update(activityReports);
    // profile
    profile.fitbitUserID = await this.pullFitbitProfileID();
    await this.profile.update(profile);

    console.log(`FitbitService: pull/replace all dates: success`);
  }

  public async pullSleepReports(uuid: string, startDate: Date, endDate: Date): Promise<UserDataModel[]> {
    // get sleep data
    let reports: UserDataModel[] = [];
    const sleeps = await this.getSleep(
      startDate,
      endDate,
      'sleep');

    // store sleep reports
    for (let sleep of sleeps['sleep']) {
      reports.push(
        SleepModel.fromFitbitFields(
          uuid,
          new Date(sleep.dateOfSleep),
          new Date(sleep.startTime),
          sleep.duration)
      );
    }
    return reports;
  }

  public async pullActivityReports(uuid: string, startDate: Date, endDate: Date): Promise<UserDataModel[]> {
    // get activity data
    let reports: UserDataModel[] = [];

    const activeMinutes = await this.getActivity(startDate, endDate, 'activities/minutesVeryActive');
    const activitySteps = await this.getActivity(startDate, endDate, 'activities/steps');
    if (activeMinutes.length !== activitySteps.length) {
      throw new Error(`FitbitService: failed to pull activity reports, # steps !== # minutes`);
    }
    // store activity reports
    const numReportItems = activeMinutes.length;
    for (let i = 0; i < numReportItems; i++) {
      reports.push(
        ExerciseModel.fromFitbitFields(
          uuid,
          new Date(activeMinutes['activities-minutesVeryActive'][i].dateTime),
          activeMinutes['activities-minutesVeryActive'][i].value,
          activitySteps['activities-steps'][i].value
        )
      );
    }
    return reports;
  }

  /**
   * AUTHENTICATION
   */
  public async getAccessToken(code: string, redirectURI: string): Promise<string> {
    // get access token for pulling fitbit data
    const url = 'https://api.fitbit.com/oauth2/token';

    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', `Basic ${btoa(FitbitConfig.clientID + ':' + FitbitConfig.clientSecret)}`);
      const body = {
        client_id: FitbitConfig.clientID,
        grant_type: 'authorization_code',
        redirect_uri: FitbitConfig.redirectURI,
        code: code,
        expires_in: 28800, // expires 8 hours
      };
      const options: any = { headers: headers, };
      const result = await this.http.post(url, body, options).toPromise();

      const accessToken = result['data'];
      return accessToken;

    } catch (err) {
      throw new Error(`FitbitService: failed to get access token: '${err}'`);
    }
  }

  public async refreshToken(refreshToken: string): Promise<string> {
    // get access token for pulling fitbit data
    const url = 'https://api.fitbit.com/oauth2/token';

    try {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', `Basic ${btoa(FitbitConfig.clientID + ':' + FitbitConfig.clientSecret)}`);
      const body = {
        client_id: FitbitConfig.clientID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };
      const options: any = {
        headers: headers,
      };
      const result = await this.http.post(url, body, options).toPromise();
      const refreshedToken = result['data'];
      return refreshedToken;

    } catch (err) {
      throw new Error(`FitbitService: failed to refresh token: '${err}'`);
    }
  }

  /**
   * HELPER
   */
  public isRedirectURL(url: string): boolean {
    // check if url contains re-direct code field
    return (url.includes('code') || url.includes('access_token')) ? true : false;
  }

  private getAuthCodeFromURL(url: string): string {
    // get authorization code from url
    try {
      if (url.includes('code')) {
        url = url.slice(url.indexOf('code='));
        const code = url.slice(url.indexOf('=') + 1, url.indexOf('#'));
        return code;
      }
      else {
        throw 'code field not present in URL';
      }
    } catch (err) {
      console.error(`FitbitService: failed to extract code in fitbit URL:\n'${url}'`);
    }
  }

  public getAuthTokenFromURL(url: string): string {
    // get authorization token from url
    try {
      url = url.slice(url.indexOf('access_token='));
      return url.slice(url.indexOf('=') + 1, url.indexOf('&'));

    } catch (err) {
      console.error(`FitbitService: failed to extract access_token in fitbit URL:\n'${url}'`);
    }
  }

  public getAuthorizationURL(isReauthEnabled?: boolean): string {
    // create authorization url for implicit grant

    // set defaults
    if (!isReauthEnabled) { isReauthEnabled = false; }

    // use' code' for authorization grant type, 
    // otherwise 'token' for implicit grant type
    const grantType = 'token';
    const prompt = (isReauthEnabled) ? 'login consent' : 'none';

    return 'https://www.fitbit.com/oauth2/authorize?' +
      'response_type=' + grantType + '&' +
      'client_id=' + FitbitConfig.clientID + '&' +
      'redirect_uri=' + FitbitConfig.redirectURI + '&' +
      'scope=' + encodeURI(FitbitConfig.scope) + '&' +
      'prompt=' + prompt + '&' +
      'expires_in=' + '2592000'; // expires 30 days
  }

  private getActivityURL(startDate: Date, endDate: Date, resourcePath?: string) {
    // create activity data url
    const startDateStr = startDate.toISOString().split('T')[0]; // 'yyyy-MM-dd' format
    const endDateStr = endDate.toISOString().split('T')[0];

    return 'https://api.fitbit.com/1/user/-/' +
      resourcePath + '/date/' + startDateStr + '/' + endDateStr + '.json';
  }

  private getSleepURL(startDate: Date, endDate: Date, resourcePath?: string) {
    // create sleep data url
    const startDateStr = startDate.toISOString().split('T')[0]; // 'yyyy-MM-dd' format
    const endDateStr = endDate.toISOString().split('T')[0];
    if (!resourcePath) { resourcePath = 'sleep'; }

    return 'https://api.fitbit.com/1.2/user/-/' +
      resourcePath + '/date/' +
      startDateStr + '/' + endDateStr + '.json';
  }

  private missingTokenError(): string {
    return `missing token, try refreshing startup token`;
  }

}



//--------------------------------------------------

// TODO: implement 'authorization grant flow'
// if (profile.fitbitAuthToken) {
//   const token = await this.getRefreshToken(profile.fitbitAuthToken);
//   profile.fitbitAuthToken;
// }

// public async revokeAccessToken(token: string): Promise<string> {
//   // revoke access token for pulling fitbit data
//   const url = 'https://api.fitbit.com/oauth2/revoke';

//   try {
//     const headers = new Headers();
//     headers.append('Authorization', `Basic ${btoa(FitbitConfig.clientID + ':' + FitbitConfig.clientSecret)}`);
//     const body = {
//       client_id: FitbitConfig.clientID,
//       token: token,
//     };
//     const options: any = {
//       headers: headers,
//       body: body,
//     };
//     return await this.http.post(url, options)
//       .map(res => res.json()).toPromise();

//   } catch (err) {
//     console.error(`FitbitService: failed to revoke access token: '${err}'`);
//   }
// }

//---------------------------------------------------------

//   public async startupTokenRefresh() {

//     const promise = (async () => {

//       const clientuserID = FitbitConfig.clientuserID;


//   }

//   public login() {
//     // login with fitbit


//     // const promise = (async () => {

//     // let url = this.client.getAuthorizeUrl('profile activity', this.redirectURI);
//     // let browserRef = window.open(url, '_self', 'location=yes');

//   }
//   // })(); // end - 'promise'

//   // const result = await promise;
//   // console.log('RESULT: ', result);
//   // return result;


//   //------------------
//   // if (window.location.href === 'http://localhost:8100/') {

//   //   // authorize first-time fitbit users
//   //   if (!this.token) {
//   //     this.presentAuthorizeModal();
//   //   }
//   // }
//   // else {

//   //   // refresh code, if present in URL
//   //   if (!this.code) {
//   //     this.code = this.fitbitRedirectURLCode(window.location.href);
//   //   }
//   //   // refresh token with code if present
//   //   if (!this.token) {
//   //     try {
//   //       let refreshToken = await this.client.getAccessToken(this.code, this.redirectURI);
//   //       this.token = await this.client.refreshAccessToken(this.token, refreshToken);

//   //     } catch (err) {
//   //       console.error(`FitbitService: failed to get access token from code: ${err}`);
//   //     }

//   //   }
//   // }

//   // }

//   //   private presentAuthorizeModal(); {
//   //   // sign up with fitbit
//   //   let url = this.client.getAuthorizeUrl('profile activity', this.redirectURI);
//   //   let win = window.open(url, '_self', 'location=yes');
//   // }

//   //   private fitbitRedirectURLCode(url: string); : string; {
//   //   // receive access token from fitbit URL re-direct

//   //   // skip if URL does not contain 'code'
//   //   if (!url.includes('code=')) {
//   //     console.error(`FitbitService: failed to extract code in fitbit URL, url does not contain 'code'`);
//   //     return;
//   //   }
//   //   // extract code from URL
//   //   try {
//   //     url = url.slice(url.indexOf('code='));
//   //     const code = url.slice(url.indexOf('=') + 1, url.indexOf('#'));

//   //     return code;

//   //   } catch (err) {
//   //     console.error(`FitbitService: failed to extract code in fitbit URL:\n'${url}'`);
//   //   }
//   // }

// }