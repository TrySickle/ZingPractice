import { ScheduleEventModel } from '../../../models/schedule-event-model';
import { PlatformMock } from './../../../shared/mocks';
import { TestBed } from '@angular/core/testing';
import { IonicStorageModule } from '@ionic/storage';
import { Platform } from 'ionic-angular';

import { SurveyService } from './survey-service';
import { SurveyFormModel } from '../../../models/survey-form-model';
import { RedcapService } from './../redcap/redcap-service';
import { StorageService } from '../storage-service';
import { HttpClientModule } from '@angular/common/http';

// tslint:disable:no-debugger

/**
 * storage-service.spec.ts
 * 
 */
xdescribe('SurveyService', () => {

    let surveyService: SurveyService = null;
    let doc = new SurveyFormModel({
        uuid: 'e83d05f7-9852-4d76-8fe9-8cfea4a58fbf',
        recordID: '1',
        formName: 'morning_survey_patient',
        eventDate: new Date(),
    });

    /**
    * ----------------------------------------------------------------
    * INIT TESTS
    * ----------------------------------------------------------------
    */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                SurveyService,
                RedcapService,
                StorageService,
                { provide: Platform, useClass: PlatformMock },
            ],
            imports: [
                IonicStorageModule.forRoot(),
                HttpClientModule
            ]
        }).compileComponents();

        surveyService = TestBed.get(SurveyService);
    });
    beforeEach(async function (done) {
        try {
            await surveyService.ready;
        } catch (err) {
            console.error('SurveyServiceSpec: failed to initialize database');
        }
        done();
    });


    /**
     * ----------------------------------------------------------------
     * STORAGE
     * ----------------------------------------------------------------
     */
    test('connection ready', async function (done) {
        // connect to database
        try {
            await surveyService.ready;
            expect(true).toEqual(true);
        } catch (err) {
            console.error(`SurveyServiceSpec: failed to check database ready function\n${err}`);
            expect(err).toBeNull();
        }
        done();
    });

    // test('find function is defined', async function (done) {
    //     // pouchdb 'find' function should be present
    //     // console.log('PouchDBFind: ', surveyService.storage.pouchDB.PouchDBFind);
    //     // console.log('pouchDB.find: ', surveyService.storage.pouchDB.find);

    //     expect(true).toBe(true);

    //     done();
    // });

    // test('adds/removes surveys', async function (done) {
    //     // adds/removes a survey from the database

    //     // add survey
    //     // remove survey before adding if it exists
    //     try {
    //         await surveyService.remove(doc);
    //     } catch (err) { /* continue */ }

    //     try {
    //         let resAdd = await surveyService.add(doc);
    //         expect(resAdd).toBeDefined();

    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to add survey: ', err);
    //         expect(err).toBeNull();
    //     }
    //     // remove survey
    //     try {
    //         let resRemove = await surveyService.remove(doc);
    //         expect(resRemove).toBeDefined();

    //     } catch (err) {
    //         console.error(`SurveyServiceSpec: failed to remove survey "${doc._id}", ${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('updates survey', async function (done) {
    //     // updates a survey in the database
    //     try {
    //         // update/insert
    //         let updateDoc = Object.assign({}, doc);
    //         expect(await surveyService.update(updateDoc)).toBeDefined();

    //         // update/upsert
    //         // doc with same ID but a modified field
    //         updateDoc.collectionName += '_spec_updates';
    //         expect(await surveyService.update(updateDoc)).toBeDefined();

    //         // remove survey
    //         try {
    //             await surveyService.remove(updateDoc);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to update survey: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('gets survey', async function (done) {
    //     // get a single survey from the database
    //     try {
    //         // add survey
    //         let resUpdate = await surveyService.update(doc);
    //         expect(resUpdate).toBeDefined();

    //         // get survey
    //         let surveyDocID = SurveyFormModel.docID(doc.uuid, doc.formName, doc.eventDate);
    //         let getDoc = await surveyService.get(surveyDocID);
    //         expect(getDoc).toBeDefined();

    //         // remove survey
    //         try {
    //             await surveyService.remove(doc);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to get survey: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('gets all surveys', async function (done) {
    //     // gets all surveys from the database
    //     try {
    //         // add surveys
    //         let doc1 = new SurveyFormModel({ formName: 'morning_survey_patient', formLabel: 'update1' });
    //         let doc2 = new SurveyFormModel({ formName: 'morning_survey_caregiver', formLabel: 'update2' });
    //         await surveyService.update(doc1);
    //         await surveyService.update(doc2);

    //         // get survey
    //         let resGet = await surveyService.getAll();
    //         expect(resGet).toBeDefined();

    //         // remove surveys
    //         try {
    //             await surveyService.remove(doc1);
    //             await surveyService.remove(doc1);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to get survey: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });


    // test('get collection and get event day', async function (done) {
    //     // gets collection and get event day
    //     try {
    //         // add documents
    //         let uuid = '0e1165e9-2005-4ee5-a7b5-bb7c049ec628';
    //         let eventDate = new Date('2017-09-12T13:41:28.335Z');
    //         let templateDoc = new SurveyFormModel({
    //             uuid: uuid,
    //             formName: 'morning_survey_patient',
    //             eventDate: eventDate,
    //             submitDate: new Date('2017-09-12T13:41:28.335Z'),
    //             isComplete: false,
    //             collectionName: 'schedule',
    //         });
    //         for (let i = 0; i < 10; i++) {
    //             templateDoc.eventDate = new Date(eventDate.getTime() + 1000 * i);
    //             try {
    //                 await this.survey.update(templateDoc);
    //             } catch (err) { /* do nothing */ }
    //         }
    //         let collectionDocs;
    //         try {
    //             // get documents by 'collection'
    //             collectionDocs = await this.storage.getByCollection('schedule');
    //             for (let i = 0; i < collectionDocs.length; i++) {
    //                 console.log(`Index: ${i}: ${collectionDocs[i]}`);
    //             }
    //             // get documents by 'event day'
    //             console.log('SurveyServiceSpec: finding docs');
    //             let queryDocs = await this.survey.getByEventDay(eventDate);
    //             for (let i = 0; i < queryDocs.length; i++) {
    //                 console.log(`Index: ${i}: ${JSON.stringify(queryDocs[i]).slice(0, 35)}`);
    //             }
    //             console.log(`Result: ${collectionDocs.length} === ${queryDocs.length}`);
    //             expect(collectionDocs.length).toEqual(queryDocs.length);

    //         } catch (err) {
    //             console.error(`MyApp: failed to find documents: ${err}`);
    //         }

    //         // remove documents
    //         try {
    //             for (let collectionDoc of collectionDocs) {
    //                 await this.survey.remove(collectionDoc._id);
    //             }
    //         } catch (err) { /* do nothing */ }

    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to get collection and event by day: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('gets (local instrument)', async function (done) {
    //     // load local instrument from database

    //     let recordID = '1';
    //     let formName = 'morning_survey_patient';
    //     try {
    //         let instrDoc = await surveyService.getByFormName(formName);
    //         expect(instrDoc).toBeDefined();
    //     } catch (err) {
    //         console.error('SurveyServiceSpec: failed to create survey: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('get dataset by event date', async function (done) {
    //     // get dataset between dates
    //     let eventDay = new Date(new Date(doc.eventDate).setHours(0, 0, 0, 0));
    //     try {
    //         let events = await surveyService.getByEventDay(eventDay);
    //         expect(events).toBeDefined();

    //     } catch (err) {
    //         console.error('SyncService: failed to push daily user data from local storage: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

});




// //------------------------------------------------------------------

// // test('pull latest instruments (local)', async function (done) {
// //     // list local instruments from database
// //     try {
// //         let instNames = await surveyService.pull();
// //         console.log('INSTNAMES:');
// //         console.log(instNames);
// //         expect(instNames).toBeDefined();
// //     } catch (err) {
// //         console.error('SurveyServiceSpec: failed to create survey: ', err);
// //         expect(err).toBeNull();
// //     }
// //     done();
// // });

// //------------------------------------------------------------------

// //     test('replicate all local instruments from redcap', async function (done) {
// //         // get all redcap instruments and save to local database
// //         try {
// //             let res = await survey.replicateAll();
// //             expect(res).toBeDefined();

// //         } catch (err) {
// //             console.error(`SurveyServiceTest: failed to replicate all local instruments from redcap\n${err}`);
// //             expect(err).toBeNull();
// //         }
// //         done();
// //     });

// //     test('replicate a single local instrument from redcap', async function (done) {
// //         // get a single redcap instruments and save to local database
// //         let instrName: string = 'intake_survey_patient';
// //         try {
// //             let res = await survey.replicate(instrName);
// //             expect(res).toBeDefined();

// //         } catch (err) {
// //             console.error(`SurveyServiceTest: failed to replicate a local instrument from redcap\n${err}`);
// //             expect(err).toBeNull();
// //         }
// //         done();
// //     });

// //     test('get a single instrument from local database', async function (done) {
// //         // get a survey instrument
// //         let instrName: string = 'intake_survey_patient';
// //         try {
// //             let res: SurveyFormModel = await survey.get(instrName);
// //             // console.log('RES: ', res);
// //             expect(res).toBeDefined();

// //         } catch (err) {
// //             console.error(`SurveyServiceTest: failed to get instrument "${instrName}"\n${err}`);
// //             expect(err).toBeNull();
// //         }
// //         done();
// //     });

// //     test('get all instruments from local database', async function (done) {
// //         // get all survey instruments
// //         try {
// //             let res: SurveyFormModel = await survey.getAll();
// //             // console.log('RES: ', res);
// //             expect(res).toBeDefined();

// //         } catch (err) {
// //             console.error(`SurveyServiceTest: failed to get all instruments from local database\n${err}`);
// //             expect(err).toBeNull();
// //         }
// //         done();
// //     });
// // });