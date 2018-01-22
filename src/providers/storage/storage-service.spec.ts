import { TestBed } from '@angular/core/testing';
import { IonicStorageModule } from '@ionic/storage';
import { Platform } from 'ionic-angular';

import { UserBaseModel } from './../../models/user-base-model';
import { StorageService } from './storage-service';
import { PlatformMock } from './../../shared/mocks';


/**
 * POUCHDB - Unit Testing Configuration
 * 
 * storage-service.spec.ts - No 'pouchdb' imports declared
 * storage-service.ts - 'import PouchDBFind' all others 'import * as [ModuleName]'
 * declarations.d.ts - No 'pouchdb' modules exports declared
 * typings - installed global typings
 * e.g. typings install --global --save dt~[name]
 *      pouchdb-adapter-websql
 *      pouchdb-browser
 *      pouchdb-core
 *      pouchdb-find
 *      pouchdb-http
 *      pouchdb-mapreduce
 *      pouchdb-node
 *      pouchdb-replication
 *      pouchdb
 * 
 * LOCAL POUCHDB DEBUGGING (ONLY)
 *      import PouchDB from 'pouchdb';
 *      import PouchDBFind from 'pouchdb-find';
 *      PouchDB.plugin(PouchDBFind); // ignore lint
 */

/**
 * storage-service.spec.ts
 * 
 */
xdescribe('StorageService', () => {

    let storageService: StorageService = null;
    const userDataDoc = new UserBaseModel({
        _id: 'storage-spec-id',
        collectionName: 'storage-spec-collection',
    });

    /**
    * ----------------------------------------------------------------
    * INIT TESTS
    * ----------------------------------------------------------------
    */
    // beforeEach(() => {
    //     spyOn(PouchDB, 'plugin').and.callFake((a: any) => {
    //         console.error(`StorageServiceSpec: Plugin '${a}' called`);
    //     });
    // });
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [IonicStorageModule.forRoot()],
            providers: [
                StorageService,
                { provide: Platform, useClass: PlatformMock }
            ],
        }).compileComponents();

        storageService = TestBed.get(StorageService);
    });
    beforeEach(async function (done) {
        try {
            console.log('StorageServiceSpec: connecting to local database');
            await storageService.ready;
        } catch (err) {
            console.error('StorageServiceSpec: failed to initialize database');
        }
        done();
    });

    /**
     * ----------------------------------------------------------------
     * STORAGE
     * ----------------------------------------------------------------
     */
    // private async testStorageFunc(): Promise<void> {

    //     // get active profile
    //     await this.profile.ready;
    //     let profile = await this.profile.getActiveProfile();
    //     // create profile if none is active
    //     if (!profile) {
    //         profile = new UserProfileModel({
    //             uuid: '1234',
    //             firstName: 'Jon',
    //             lastName: 'Bidwell',
    //             email: 'bidwej@gatech.edu',
    //         });
    //         await this.profile.update(profile);
    //         await this.profile.setActiveProfile(profile._id);
    //         profile = await this.profile.getActiveProfile();
    //     }

    //     // clear seizure reports
    //     const isClearReportsEnabled = false;
    //     if (isClearReportsEnabled) {
    //         let allSurveys = await this.storage.getByCollection('survey');
    //         for (let survey of allSurveys) {
    //             await this.storage.remove(survey._id);
    //         }
    //     }

    //     // add seizure reports
    //     let seizureReports = [];
    //     const currDate = new Date();
    //     for (let i = 0; i < 3; i++) {
    //         seizureReports.push(new SurveyFormModel({
    //             uuid: profile.uuid,
    //             formName: 'seizure_reporting_form_patient',
    //             eventDate: currDate,
    //             reportIndex: i,
    //         }));
    //     }
    //     await this.storage.update(seizureReports);

    //     // get seizure reports
    //     const storedReports = await this.survey.getByEventDay(currDate);
    //     // const storedReports = await this.storage.getByEventDay('survey', currDate);
    //     if (!storedReports) {
    //         console.error(`App: failed to get seizure reports from local storage`);
    //         return;
    //     }
    //     for (let i = 0; i < storedReports.length; i++) {
    //         console.info(`Report: ${i}: ${JSON.stringify(storedReports[i])}`);
    //     }
    // }

    test('connection self-test', async function (done) {
        // check database connection        
        try {
            let testPassed: boolean = await storageService.selfTestPromise();
            expect(testPassed).toBe(true);
        } catch (err) {
            console.error(`StorageServiceSpec: failed self-test function\n${err}`);
            expect(err).toBeNull();
        }
        done();
    });

    test('connection ready', async function (done) {
        // connect to database
        try {
            await storageService.ready;
            expect(true).toEqual(true);
        } catch (err) {
            console.error(`StorageServiceSpec: failed to check database ready function\n${err}`);
            expect(err).toBeNull();
        }
        done();
    });


    // // UPSERT TEST - should avoid overwriting values with null
    // // insert user
    // let user1 = new UserProfileModel({
    // uuid: 'xxx',
    // firstName: 'Jon',
    // lastName: 'Bidwell',
    // email: 'bidwej@gmail.com'
    // });
    // user1 = await this.profile.update(user1);

    // // overwrite/upsert fields
    // const user2 = new UserProfileModel({
    // uuid: 'xxx',
    // firstName: 'Dave',
    // email: 'dbidwell@gmail.com'
    // });
    // user1 = await this.profile.update(user2);


    // test('adds/removes documents', async function (done) {
    //     // adds/removes a document from the database

    //     // add document
    //     // remove document before adding if it exists
    //     try {
    //         await storageService.remove(userDataDoc._id);
    //     } catch (err) { /* continue */ }

    //     try {
    //         let resAdd = await storageService.add(userDataDoc);
    //         expect(resAdd).toBeDefined();

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to add a document: ', err);
    //         expect(err).toBeNull();
    //     }
    //     // remove document
    //     try {
    //         let resRemove = await storageService.remove(userDataDoc._id);
    //         expect(resRemove).toBeDefined();

    //     } catch (err) {
    //         console.error(`StorageServiceSpec: failed to remove a document "${userDataDoc._id}", ${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('updates document', async function (done) {
    //     // updates a document in the database
    //     try {
    //         // update/insert
    //         let updateDoc = Object.assign({}, userDataDoc);
    //         let resUpdate = await storageService.update(updateDoc);
    //         expect(resUpdate).toBeDefined();

    //         // update/upsert
    //         // doc with same ID but a modified field
    //         updateDoc.collectionName += '_spec_updates';
    //         let resUpsert = await storageService.update(updateDoc);
    //         expect(resUpdate).toBeDefined();

    //         // remove document
    //         try {
    //             await storageService.remove(updateDoc._id);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to update a document: ', err);
    //         expect(err).toBeNull();
    //     }
    //     // console.log('updated document');
    //     done();
    // });

    // test('updates document', async function (done) {
    //     // update/find a document in the database

    //     // add documents
    //     let doc1 = { _id: '1', type: 'data', value: 123 };
    //     let doc2 = { _id: '2', type: 'data', value: 200 };
    //     try {
    //         await storageService.add(doc1);
    //         await storageService.add(doc2);
    //     } catch (err) { /* do nothing */ }

    //     // find documents
    //     let findDocs = await storageService.pouchDB.find({
    //         selector: { type: { $eq: 'data' } }
    //     });
    //     console.log('StorageServiceSpec: finding docs');
    //     console.log(JSON.stringify(findDocs));
    //     expect(findDocs).toBeDefined();

    //     // update document
    //     doc2.value = 300;
    //     const updatedDoc = await storageService.update(doc2);
    //     console.log('StorageServiceSpec: updated doc');
    //     console.log(JSON.stringify(updatedDoc));
    //     expect(updatedDoc).toBeDefined();

    //     // remove documents
    //     try {
    //         await storageService.remove(doc1._id as any);
    //         await storageService.remove(doc2._id as any);
    //     } catch (err) { /* do nothing */ }

    //     done();
    // });

    // test('gets document', async function (done) {
    //     // get a single document from the database
    //     try {
    //         // add document
    //         // remove document before adding if it exists
    //         try {
    //             await storageService.update(userDataDoc);
    //         } catch (err) { /* continue */ }

    //         // get document
    //         console.log(`getting document ID ${userDataDoc._id}`);
    //         let resGet = await storageService.get(userDataDoc._id);
    //         console.log('got document:', resGet);
    //         expect(resGet).toBeDefined();

    //         // remove document
    //         try {
    //             await storageService.remove(userDataDoc._id);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to get a document: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('get all reports', async function (done) {
    //     // gets all reports via API
    //     try {
    //         // add documents
    //         let doc1 = new UserBaseModel({ collectionName: 'storage-spec-collection-1' });
    //         let doc2 = new UserBaseModel({ collectionName: 'storage-spec-collection-2' });
    //         await storageService.update(doc1);
    //         await storageService.update(doc2);

    //         // get document
    //         let resGet = await storageService.getAll();
    //         expect(resGet).toBeDefined();

    //         // remove documents
    //         try {
    //             await storageService.remove(doc1);
    //             await storageService.remove(doc2);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to get all document: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('exists document', async function (done) {
    //     // check whether a known document exists
    //     try {
    //         // add documents
    //         let doc1 = new UserBaseModel({ collectionName: 'storage-spec-collection-1' });
    //         let doc2 = new UserBaseModel({ collectionName: 'storage-spec-collection-2' });
    //         await storageService.update(doc1);

    //         // check document exists
    //         let resExistsDoc1 = await storageService.exists(doc1._id);
    //         expect(resExistsDoc1).toBe(true);

    //         let resExistsDoc2 = await storageService.exists(doc2._id);
    //         expect(resExistsDoc2).toBe(false);

    //         // remove documents
    //         try {
    //             await storageService.remove(doc1);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to check whether a document exists: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('find by collection name', async function (done) {
    //     // find documents by collection name
    //     try {
    //         // add documents
    //         let collectionName = 'storage-spec-collection';
    //         let doc1 = new UserBaseModel({
    //             uuid: 'c9b41581-f695-4dda-bea8-55d87b435b23',
    //             collectionName: collectionName
    //         });
    //         let doc2 = new UserBaseModel({
    //             uuid: '53a8c877-e181-48fe-a151-59e7751fb5f7',
    //             collectionName: collectionName
    //         });
    //         await storageService.update(doc1);
    //         await storageService.update(doc2);

    //         // find documents by collection name
    //         let resDocs = await storageService.getByCollection(collectionName);
    //         expect(resDocs).toBeDefined();

    //         // remove documents
    //         try {
    //             await storageService.remove(doc1);
    //             await storageService.remove(doc2);
    //         } catch (err) { /* continue */ }

    //     } catch (err) {
    //         console.error('StorageServiceSpec: failed to find documents by collection name: ', err);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });


});



//-------------------------------------------------------

// test('connection find test', async function (done) {
//     let pouchDB = new PouchDB('data');
//     let doc1 = { _id: '1', type: 'data', value: 123 };
//     let doc2 = { _id: '2', type: 'data', value: 200 };

//     // add documents
//     try {
//         await pouchDB.put(doc1);
//         await pouchDB.put(doc2);
//     } catch (err) { /* do nothing */ }

//     // find documents
//     let findDocs = await pouchDB.find({
//         selector: { type: { $eq: 'data' } }
//     });
//     console.log('StorageServiceSpec: finding documents');
//     console.log(JSON.stringify(findDocs));

//     // remove documents
//     try {
//         await pouchDB.remove(doc1._id as any);
//         await pouchDB.remove(doc2._id as any);
//     } catch (err) { /* do nothing */ }

//     expect(true).toBe(true);
//     done();
// });

//-------------------------------------------------------

// beforeEach(inject([StorageService], (StorageServiceSpec: StorageService) => {
    //     storage = storageService;
//     storage = TestBed.get(StorageService);
// }));

// beforeEach(async function(done) {
//         db = new StorageService((<any>new PlatformMock));
//         // spyOn(db, 'create').and.callThrough();
//         // spyOn(db, 'update').and.callThrough();
//         // spyOn(db, 'remove').and.callThrough();
//         // spyOn(db, 'get').and.callThrough();
//     });

