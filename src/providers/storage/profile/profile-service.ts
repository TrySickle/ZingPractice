import { Injectable } from '@angular/core';

import { StorageService } from '../../storage/storage-service';
import { UserProfileModel } from './../../../models/user-profile-model';


// tslint:disable:no-debugger
/*
  Generated class for the UserProfile provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.

  see: https://www.joshmorony.com/building-mobile-apps-with-ionic-2/observables-in-ionic2.html
*/

@Injectable()
export class ProfileService {

    private readyPromise: Promise<any>;

    constructor(
        public storage: StorageService,
    ) { }

    /**
     * PROPERTIES
     */
    public get ready(): Promise<boolean> {
        // resolves after storage is connected
        return this.storage.ready;
    }

    /**
    * METHODS
    */
    private async getActiveProfilePromise(): Promise<boolean> {
        // set 'active profile' from database
        await this.ready;
        try {
            const profile = await this.getActiveProfile();
            return profile.isActiveProfile;

        } catch (err) {
            console.warn(`ProfileService: warning, failed to set active profile\n${err}`);
        }
    }

    public async getActiveProfile(): Promise<UserProfileModel> {
        // get to active profile 
        await this.ready;
        try {
            // select first matching document
            let queryDocs = await this.storage.pouchDB.query('active_profile', {
                include_docs: true,
            });
            // skip if no active profile is found
            if (!queryDocs || !queryDocs.rows) { return; }
            if (queryDocs.rows.length === 0) { return; }
            // skip if multiple active profiles
            if (queryDocs.rows.length > 1) {
                throw `should be only one active profile but multiple active profiles in database`;
            }
            return new UserProfileModel(queryDocs.rows[0].doc);

        } catch (err) {
            throw new Error(`ProfileService: failed to get active profile, using query 'active_profile': ${err}`);
        }
    }

    public async setActiveProfile(docID: string): Promise<UserProfileModel> {
        // set 'active' profile status
        // Note: only one user should be logged in at a time
        await this.ready;
        try {
            const activeExists = await this.exists(docID);
            if (!activeExists) {
                throw `profile does not exist, ${docID}`;
            }
            const profileDocs = await this.getAll();
            const promises = [];
            for (let profileDoc of profileDocs) {
                const isActiveDoc: boolean = (profileDoc._id === docID);
                profileDoc.isActiveProfile = (isActiveDoc) ? true : false;
                promises.push(this.update(profileDoc));
            }
            await Promise.all(promises);
            return await this.get(docID);

        } catch (err) {
            throw new Error(`ProfileService: failed to set active profile: ${err}`);
        }
    }

    /**
     * DATABASE ACCESSORS
    */
    public async add(doc: any): Promise<UserProfileModel> {
        // add local profile 
        await this.ready;
        try {
            let addDoc = await this.storage.add(doc);
            return new UserProfileModel(addDoc);

        } catch (err) {
            throw new Error(`ProfileService: failed to add to local storage\n${err}`);
        }
    }

    public async remove(docID: string): Promise<UserProfileModel> {
        // remove local profile 
        await this.ready;
        try {
            let remDoc = await this.storage.remove(docID);
            return new UserProfileModel(remDoc);

        } catch (err) {
            throw new Error(`ProfileService: failed to remove from local storage\n${err}`);
        }
    }

    public async update(doc: UserProfileModel): Promise<UserProfileModel> {
        // update local profile 
        await this.ready;
        try {
            // update the profile document
            let resDoc = await this.storage.update(doc);
            return new UserProfileModel(resDoc);

        } catch (err) {
            throw new Error(`ProfileService: failed to update local storage\n${err}`);
        }
    }

    public async get(docID: string): Promise<UserProfileModel> {
        // get local profile 
        await this.ready;
        try {
            let doc = await this.storage.get(docID);
            if (!doc) { return; }
            return new UserProfileModel(doc);

        } catch (err) {
            throw new Error(`ProfileService: failed to get from local storage\n${err}`);
        }
    }

    public async getByUUID(uuid: string): Promise<UserProfileModel> {
        // get local profile 
        const docID = UserProfileModel.docID(uuid);
        return this.get(docID);
    }

    public async getAll(): Promise<UserProfileModel[]> {
        // get all document in database storage
        await this.ready;
        try {
            let profileDocs = await this.storage.pouchDB.find({
                selector: { collectionName: { $eq: 'profile' } },
            });
            return profileDocs.docs;

        } catch (err) {
            console.error(`ProfileService: failed to get all profiles: ${err}`);
        }
    }

    public async exists(docID: string): Promise<boolean> {
        // get all document in database storage
        return this.storage.exists(docID);
    }

}



//------------------------------------

// public get ready(): Promise<boolean> {
//     // resolves when 'storage' and 'profile' are available
//     if (!this.readyPromise) {
//         this.readyPromise = (async () => {
//             let isStorageReady = await this.ready;
//             let isProfileLoaded = await this.getActiveProfile();
//             return (isStorageReady && isProfileLoaded);
//         })();
//     }
//     return this.readyPromise;
// }
