import { UserProfileModel } from '../../../models/user-profile-model';
import { UserRoleType } from '../../../shared/enums';
import { StorageService } from '../storage-service';
import { PlatformMock, ProfileServiceMock } from './../../../shared/mocks';
import { TestBed } from '@angular/core/testing';
import { IonicStorageModule } from '@ionic/storage';
import { Events, Platform } from 'ionic-angular';

import { ProfileService } from './profile-service';
import { UserBaseModel } from '../../../models/user-base-model';


// tslint:disable:no-debugger
/**
 * profile-service.spec.ts
 * 
 * service testing
 * see: http://www.kirjai.com/testing-angular-services-with-dependencies/
 *      https://angular.io/guide/testing#services-with-dependencies
 *      https://chariotsolutions.com/blog/post/new-httpclient-angular-4-3-x-drys-network-calls-testing/
 */
xdescribe('ProfileService', () => {

    let profileService: ProfileService = null;

    /**
    * ----------------------------------------------------------------
    * INIT TESTS
    * ----------------------------------------------------------------
    */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [IonicStorageModule.forRoot()],
            providers: [
                Events,
                StorageService,
                ProfileService,
                { provide: Platform, useClass: PlatformMock },
            ],
        }).compileComponents();
    });
    beforeEach(() => {
        profileService = TestBed.get(ProfileService);
    });
    beforeEach(async function (done) {
        try {
            const isReady: boolean = await profileService.ready;
            expect(isReady).toBe(true);

        } catch (err) {
            console.error('ProfileServiceSpec: failed to initialize database');
            expect(err).toBeNull();
        }
        done();
    });

    /**
     * ----------------------------------------------------------------
     * STORAGE
     * ----------------------------------------------------------------
     */
    test('create profile', async function (done) {
        // creates profile using profile model
        try {
            // const profileDoc = ProfileServiceMock.createProfile();
            // expect(profileDoc).toBeDefined();

        } catch (err) {
            console.error('ProfileServiceSpec: failed to create profile using model: ', err);
            expect(err).toBeNull();
        }
        done();
    });

    test('validate profile', async function (done) {
        // validate profile model
        try {
            const profileDoc = ProfileServiceMock.createProfile();
            await profileDoc.validate();

            const isValid: boolean = profileDoc.isValid();
            expect(isValid).toBe(true);

        } catch (err) {
            console.error('ProfileServiceSpec: failed to validate profile: ', err);
            expect(err).toBeNull();
        }
        done();
    });

    // test('updates profile', async function (done) {
    //     // updates a profile via API
    //     try {
    //         // update/insert
    //         const profileDoc = ProfileServiceMock.createProfile();
    //         const updatedDoc = await profileService.update(profileDoc);
    //         expect(updatedDoc).toBeDefined();

    //         // update/upsert
    //         // doc with same ID but a modified field
    //         updatedDoc.recordID = '999';
    //         const modifiedDoc = await profileService.update(profileDoc);
    //         expect(modifiedDoc).toBeDefined();

    //         // remove profile
    //         try {
    //             await profileService.remove(modifiedDoc._id);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('ProfileServiceSpec: failed to update profile: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('gets profile', async function (done) {
    //     // gets a profile via API
    //     try {
    //         // add profile
    //         const profileDoc = ProfileServiceMock.createProfile();
    //         let resUpdate = await profileService.update(profileDoc);
    //         expect(resUpdate).toBeDefined();

    //         // get profile
    //         let resGet = await profileService.get(resUpdate._id);
    //         expect(resGet).toBeDefined(resGet);

    //         // remove profile
    //         try {
    //             await profileService.remove(profileDoc._id);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('ProfileServiceSpec: failed to get profile: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

});