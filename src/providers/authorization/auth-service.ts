import { Injectable } from '@angular/core';

import { UserProfileModel } from '../../models/user-profile-model';
import { ProfileService } from '../storage/profile/profile-service';
import { RedcapService } from './../storage/redcap/redcap-service';
import { Auth0AuthService } from './auth/auth0-auth';
import { Events } from 'ionic-angular';

// tslint:disable:no-console
// tslint:disable:no-debugger
// tslint:disable:max-line-length
/**
 * Auth Service - handle user authentication
 *
 * Auth discussion
 * see: https://ionicthemes.com/tutorials/about/ionic2-google-login
 *      https://docs.ionic.io/setup.html#app-id
 * 
 * Ionic-Cloud Auth
 * see: https://docs.ionic.io/api/endpoints/auth.html
 *
 * Note: Auth0 'Default Directory' must be set to 
 * 'Username-Password-Authentication' on 'https://manage.auth0.com/#/tenant'
 * 
 * HTTP Client
 * see: https://sergeome.com/blog/2017/11/26/simply-about-new-httpclient-in-angular/
 *      https://angular.io/guide/http#reading-the-full-response
 *      http://blog.ionic.io/handling-cors-issues-in-ionic/
 */

@Injectable()
export class AuthService {

  constructor(
    private events: Events,
    private profile: ProfileService,
    private auth0: Auth0AuthService,
    private redcap: RedcapService,
  ) { }

  /**
   * METHODS
   */
  public async authenticated(): Promise<boolean> {
    // check if the token is expired
    return await this.auth0.authenticated();
  }

  public startupTokenRefresh(): Promise<boolean> {
    // refresh expired user token on startup
    return this.auth0.startupTokenRefresh();
  }

  public async login(email: string, password: string): Promise<UserProfileModel> {
    // login user with Auth0 and publish authentication event
    let loginProfile: UserProfileModel;
    try {
      // login with Auth0
      loginProfile = await this.auth0.login(email, password);
      if (!loginProfile._id || !loginProfile.recordID) {
        throw `Missing Auth0 record ID. Please signup again`;
      }
      // check profile exists on redcap
      const isProfileValid = await this.redcap.existsProfile(loginProfile.recordID);
      if (!isProfileValid) {
        throw `Missing Redcap record ID. Please signup again`;
      }

      // try to update profile if user already enrolled
      if (!loginProfile.isEnrolled) {
        let redcapProfile = await this.redcap.getProfile(loginProfile.recordID);
        if (redcapProfile && redcapProfile.uuid) {
          loginProfile = await this.profile.update(redcapProfile);
        }
      }
      // set active profile
      await this.profile.setActiveProfile(loginProfile._id);

    } catch (err) {
      // set error description status
      console.error(`AuthService: failed to login`);
      throw err;
    }

    // success, publish login and return UUID
    this.events.publish('auth:login');
    return loginProfile;
  }

  public async logout(): Promise<void> {
    // log user out of Auth0
    await this.auth0.logout();
    this.events.publish('auth:logout');
  }

  public async signup(email: string, password: string): Promise<boolean> {
    // create active account on auth0 and redcap
    try {
      // signup with auth0
      await this.auth0.signup(email, password);

      // login with auth0 to see whether profile has redcap ID
      let profile = await this.auth0.login(email, password);

      // signup with redcap
      // create 'record ID' and save to user's auth0 profile 
      if (!profile.recordID) {
        profile.recordID = await this.redcap.getNextRecordName();
        await this.redcap.signup(profile.uuid, profile.recordID);
        await this.auth0.setRecordID(profile.recordID, profile.mgmtIDToken, profile.uuid);
        await this.profile.update(profile);
      }

      // set active profile
      await this.profile.setActiveProfile(profile._id);

    } catch (err) {
      console.error(`AuthService: failed to signup: ${err}`);
      return false;
    }
    return true;
  }

}


//-------------------------------------

// private ionicSignupErrorsToList(errors: IDetailedError<string[]>): Array<string> {
//   // list API signup errors
//   let errorMessages = new Array<string>();
//   for (let e of errors.details) {
//     switch (e) {
//       // Login failed, please check your connection and try again
//       case 'required_email': errorMessages.push('Email is required.'); break;
//       case 'required_password': errorMessages.push('Password is required.'); break;
//       case 'conflict_email': errorMessages.push('A user with this email already exists.'); break;
//       default: errorMessages.push(e); break;
//     }
//   }
//   return errorMessages;
// }

//--------------------------------------------

    // public destroyAllAccounts() {
    //   // delete all user accounts

    //   this.auth.
    //   this.user;
    //   let users = [];
    //   for(let user of users) {
    //     await this.user.delete();
    //   }
    // }