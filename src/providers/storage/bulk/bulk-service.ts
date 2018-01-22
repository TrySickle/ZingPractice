import { Injectable } from '@angular/core';

import { BulkDataModel } from '../../../models/bulk-transfer-model';
import { ScheduleEventModel } from '../../../models/schedule-event-model';
import { SurveyFormModel } from '../../../models/survey-form-model';
import { UserDataModel } from '../../../models/user-data-model';
import { UserProfileModel } from '../../../models/user-profile-model';
import { RedcapService } from './../redcap/redcap-service';
import { StorageService } from '../../storage/storage-service';
import { SurveyService } from '../survey/survey-service';
import { ProfileService } from './../profile/profile-service';

// import 'rxjs/add/observable/map';

/*
Generated class for the BulkService provider.

See https://angular.io/docs/ts/latest/guide/dependency-injection.html
for more info on providers and Angular 2 DI.

see: https://www.joshmorony.com/building-mobile-apps-with-ionic-2/observables-in-ionic2.html
*/

// TODO: use pouchdb change detection event to trigger bulk service push

// tslint:disable:no-debugger
@Injectable()
export class BulkService {

    constructor(
        private storage: StorageService,
        private survey: SurveyService,
        private redcap: RedcapService,
        private profile: ProfileService,
    ) { }

    /**
     * PROPERTIES
    */
    public get ready(): Promise<boolean> {
        // resolves when 'storage' and datset is refreshed (optional)
        return this.profile.ready;
    }

    /**
     * METHODS
     */
    public async pushByDate(when: Date): Promise<any> {
        // push dateaset to redcap
        const bulkDoc: BulkDataModel = await this.getByDate(when);
        const profile = await this.profile.getByUUID(bulkDoc.uuid);
        return this.redcap.pushBulkDoc(profile, bulkDoc);
    }

    public async pushAllDates(): Promise<any> {
        // push dateaset to redcap
        try {
            const bulkDocs = await this.getAll();

            let promises = [];
            for (const bulkDoc of bulkDocs) {
                const profile = await this.profile.getByUUID(bulkDoc.uuid);
                promises.push(this.redcap.pushBulkDoc(profile, bulkDoc));
            }
            return await Promise.all(promises);

        } catch (err) {
            console.error(`BulkService: failed to push all bulk datasets:/n${err}`);
        }
    }

    public async pullByDate(when: Date): Promise<any> {
        // pull dataset from redcap
        const profile = await this.profile.getActiveProfile();
        return await this.redcap.pullBulkDoc(profile, when);
    }

    public async pullAllDates(includeFileRecord?: boolean): Promise<any> {
        // pull dataset from redcap
        await this.profile.ready;

        // set defaults
        if (!includeFileRecord) { includeFileRecord = false; }
        try {
            // pull redcap updates for all study dates
            const profile = await this.profile.getActiveProfile();

            let promises = [];
            for (const eventDate of profile.eventDates) {
                promises.push(this.redcap.pullBulkDoc(profile, eventDate, includeFileRecord));
            }
            let redcapBulkDocs = await Promise.all(promises);

            // filter empty bulk documents
            redcapBulkDocs = redcapBulkDocs.filter((doc: any) => (doc));
            if (!redcapBulkDocs) { throw `no documents found on redcap`; }

            return redcapBulkDocs;

        } catch (err) {
            console.error(`BulkService: failed to pull all bulk documents: ${err}`);
        }
    }

    public async pullReplaceAllDates(includeFileRecord?: boolean): Promise<any> {
        // pull and overwrite local dataset with remote redcap
        try {
            let bulkDocs: BulkDataModel[];

            bulkDocs = await this.pullAllDates(includeFileRecord);
            if (!bulkDocs) { throw `no documents found on redcap`; }

            let promises = [];
            for (const bulkDoc of bulkDocs) {
                promises.push(this.update(bulkDoc));
            }
            bulkDocs = await Promise.all(promises);

            return bulkDocs;

        } catch (err) {
            console.error(`BulkService: failed to pull & overwrite all bulk models: ${err}`);
        }
    }

    /**
     * DATABASE METHODS
     */
    public async update(bulkDoc: BulkDataModel): Promise<BulkDataModel> {
        // update local reports given a bulk doc
        // TODO: merge 'report' and 'storage' as report doesn't provide any additional options as a service (or maybe don't do this...)
        try {
            // store bulk doc as document
            let promises = [];
            promises.push(this.storage.update(bulkDoc));

            // store bulk doc as reports
            for (const report of bulkDoc.reports) {
                promises.push(this.storage.update(report));
            }
            for (const survey of bulkDoc.surveys) {
                promises.push(this.survey.update(survey));
            }
            for (const schedule of bulkDoc.schedules) {
                promises.push(this.storage.update(schedule));
            }
            const docs = await Promise.all(promises);

            return new BulkDataModel(docs[0]);

        } catch (err) {
            throw new Error(`BulkService: failed to update local storage with bulk document: ${err}`);
        }
    }

    public async getByDate(eventDate: Date): Promise<any> {
        // get bulk document for a given date
        try {
            let promises = [
                this.storage.getByEventDay('data', eventDate),
                this.storage.getByEventDay('survey', eventDate),
                this.storage.getByEventDay('schedule', eventDate)
            ];
            let [reports, surveys, schedules] = await Promise.all(promises);

            if (reports) {
                reports = reports.map((doc: any) => new UserDataModel(doc));
            }
            if (surveys) {
                surveys = surveys.map((doc: any) => new SurveyFormModel(doc));
            }
            if (schedules) {
                schedules = schedules.map((doc: any) => new ScheduleEventModel(doc));
            }

            // create bulk document
            const profile = await this.profile.getActiveProfile();
            let bulkDocument = new BulkDataModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                submitDate: new Date(),
                reports: reports,
                surveys: surveys,
                schedules: schedules,
                profile: new UserProfileModel(profile),
            });
            return bulkDocument;

        } catch (err) {
            throw new Error(`BulkService: failed to get bulk document, unabled to get entries: ${err}`);
        }
    }

    public async getAll(): Promise<any> {
        // get al bulk document for a given date
        try {
            const profile = await this.profile.getActiveProfile();

            let promises = [];
            for (const eventDate of profile.eventDates) {
                promises.push(this.getByDate(eventDate));
            }
            return await Promise.all(promises);

        } catch (err) {
            throw new Error(`BulkService: failed to get all bulk documents: ${err}`);
        }
    }

}




//--------------------------------------------------------

// private reportSubmitHandle: (report: UserDataModel) => void;

// subscribe to 'report submit' events
// this.reportSubmitHandle = (data: UserDataModel) => { this.reportSubmitted(data); };
// this.events.subscribe('report:stored', this.reportSubmitHandle);

    // unsubscribe to survey submit, avoid multiple assignments
// this.events.unsubscribe('report:stored', this.reportSubmitHandle);

// public async reportSubmitted(report: UserDataModel): Promise<void> {
//     // update event completion status on survey submit event
//     await this.ready;

//     // search for survey event in database
//     try {
//         await this.pushByDate(report.eventDate);
//         console.log(`BulkService: update survey on submit, successful`);

//     } catch (err) {
//         console.warn(`BulkService: warning, failed to update survey on submit: ${err}`);
//     }
// }

//--------------------------------------------------------

// return (async () => {

//     let isStorageReady = await this.storage.ready;

//     if (ReportConfig.pullRedcapOnStartup) {
//         let isBulkDataLoaded = await this.pullRedcapData();
//         return (isStorageReady && isBulkDataLoaded);
//     }
//     return isStorageReady;
// })();
//--------------------------------------------------------

// async getByDateType(eventDate: Date, type?: UserDataType): Promise<UserDataModel> {
//     // get report from local storage by date and type
//     try {
//         let findDocs = await this.storage.pouchDB.find({
//             selector: {
//                 collectionName: { $eq: 'report' },
//                 eventDate: { $eq: eventDate },
//             },
//             type: { $eq: type },
//         });
//         // select matching first document
//         if ('docs' in findDocs) {
//             return new UserDataModel(findDocs.docs[0]);
//         }
//         else {
//             return new UserDataModel(findDocs);
//         }
//     } catch (err) {
//         console.error('BulkService: failed to get user report by date/type: ', err);
//         throw err;
//     }
// }