import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import PouchDB from 'pouchdb';
import * as PouchDBCordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as PouchDBCordovaWebsqlPlugin from 'pouchdb-adapter-websql-core';
import PouchDBFind from 'pouchdb-find';
import * as PouchUpsert from 'pouchdb-upsert';
import { DBConfig } from './../../shared/config/db-config';

/**
 * StorageService - storage-service.ts
 *
 * see: ionic plugin add cordova-plugin-sqlite-2
 *      https://gonehybrid.com/how-to-use-pouchdb-sqlite-for-local-storage-in-your-ionic-app/
 *      https://www.pluralsight.com/guides/software-engineering-best-practices/ionic-2-database-management-and-versioning
 *      http://stackoverflow.com/questions/38340500/export-multiple-classes-in-es6-modules
 * 
 * log: https://developers.google.com/apps-script/guides/logging
 * pouchdb: https://stackoverflow.com/questions/38497985/pouchdb-find-why-is-my-index-not-used/38662487
 * promises: https://stackoverflow.com/questions/42280578/javascript-promise-ready
 */
// tslint:disable:max-line-length
// tslint:disable:no-single-declare-module

//set window for chrome 'pouchdb-inspector'
if (typeof window !== 'undefined') {
    window['PouchDB'] = PouchDB;
}

// declarations for 'pouchdb-find' plugin
declare function emit(key: any): void;
declare function emit(key: any, value: any): void;


@Injectable()
export class StorageService {

    public pouchDB: any;
    public isConnected: boolean;
    protected dbName: string;
    private readyPromise: Promise<boolean>;
    private changeListeners: any[];

    constructor(
        private platform: Platform,
    ) {
        // initialize pouchDB plugins
        PouchDB.plugin(PouchDBFind);
        PouchDB.plugin(PouchUpsert);
        PouchDB.plugin(PouchDBCordovaSqlitePlugin);
        PouchDB.plugin(PouchDBCordovaWebsqlPlugin);

        // set defaults
        this.isConnected = false;
        this.dbName = DBConfig.name + '.db';
        this.changeListeners = [];

        // connect to local storage on startup and each
        // subsiquent call to 'connect' recieves the same 'ready' promise
        this.readyPromise = this.connect();
    }

    /**
     * EVENTS
     */
    async ngOnDestroy(): Promise<any> {
        return await this.disconnect();
    }

    /**
     * PROPERTIES
     */
    public get ready(): Promise<boolean> {
        // resolves after connection is complete
        if (!this.readyPromise) {
            this.readyPromise = this.connect();
        }
        return this.readyPromise;
    }

    /**
     * METHODS
     */
    public async connect(databaseName?: string): Promise<boolean> {
        // connect to database after the device is ready

        // set defaults
        if (!databaseName) {
            databaseName = this.dbName;
        }
        // skip if already connected
        if (this.isConnected) { return true; }

        try {
            // Note: must use a specific version of database for android, see: http://codejaxy.com/q/521338/angularjs-ionic-framework-pouchdb-pouchdb-5-3-0-error-database-location-or-iosdatabaselocation-value-is-now-man
            // Note: must call 'ionic cordova prepare' to avoid'Database location or iosDatabaseLocation value is now mandatory in openDatabase call' issue

            // use 'websql' adapter for browsers
            if (this.platform.is('core') || this.platform.is('mobileweb')) {
                try {
                    this.pouchDB = new PouchDB(databaseName, { adapter: 'websql' });
                } catch (err) { }
            }
            // use 'sqlite' or 'websql' adapter for devices
            else {
                try {
                    this.pouchDB = new PouchDB(databaseName, { adapter: 'cordova-sqlite' });
                } catch (err) { }
            }
            // use default 'indexedDB' adapter as a fallback
            if (!this.pouchDB) {
                //console.warn('StorageService: warning, websql and sqlite adapters not found, using default adapter');
                this.pouchDB = new PouchDB(databaseName);
            }
            if (!this.pouchDB || !this.pouchDB.adapter) {
                console.error('StorageService: failed to connect to database, invalid adapter');
                return false;
            }

        } catch (err) {
            console.warn('StorageService: warning, using default adapter: ', err);
            return false;
        }
        // add event listeners
        this.pouchDB.on('destroyed', function (destroyStatus: any) {
            console.warn(`StorageService: warning, destroyed ${databaseName} database`);
        });
        this.pouchDB.on('error', function (err: any) {
            if (!this.isConnected) {
                console.error(`StorageService: PouchDB general error, database disconnected`);
            }
            console.error(`StorageService: PouchDB general error': ${err}`);
        });

        // wait until the connection is established
        return new Promise<boolean>((resolve, reject) => {

            this.pouchDB.on('created', function (db: any) {
                try {
                    // remove listeners
                    let createdListeners = this.pouchDB.listeners('created');
                    for (let listener of createdListeners) {
                        this.pouchDB.removeListener('created', listener);
                    }
                    // create design doucment
                    this.storageDesignDoc().then(() => {

                        // TODO: urgent, get filters working again...
                        // this.storageFilterDoc().then(() => {
                        // assign filters to detect storage changes

                        // // collection
                        // this.changeListeners['collection'] = this.pouchDB.changes({
                        //     filter: 'collection_filter',

                        // }).on('change', function (change: any) {
                        //     // console.log(`StorageService: storage 'collection' change detected`);
                        //     // this.events.publish('storage:collectionChange');

                        // }.bind(this)).on('error', function (err: any) {
                        //     console.log(`StorageService: failed to detect storage 'collection' change: ${err}`);
                        // });

                        // // completion
                        // this.changeListeners['completion'] = this.pouchDB.changes({
                        //     filter: 'completion_filter',

                        // }).on('change', function (change: any) {
                        //     // console.log(`StorageService: storage 'completion' change detected`);
                        //     // this.events.publish('storage:completionChange');

                        // }.bind(this)).on('error', function (err: any) {
                        //     console.log(`StorageService: failed to detect storage 'completion' change: ${err}`);
                        // });

                        // success, database is connected
                        // console.log('StorageService: success, connected to database:');
                        this.isConnected = true;
                        resolve(true);
                        // });
                    });

                } catch (err) {
                    console.log(`StorageService: failed to connect to database\n${err}`);
                    reject(false);
                }
            }.bind(this));
        });
        // return (async () => {
        // listen for 'created' event
        // this.pouchDB.on('created', function (db: any) {
        //     try {
        //         // remove listeners
        //         let createdListeners = this.pouchDB.listeners('created');
        //         for (let listener of createdListeners) {
        //             this.pouchDB.removeListener('created', listener);
        //         }
        //         // success, database is connected
        //         console.log('StorageService: success, connected to database:');
        //         this.isConnected = true;
        //         resolve(true);

        //     } catch (err) {
        //         console.log(`StorageService: failed to connect to database\n${err}`);
        //         return false;
        //     }
        //     }.bind(this));
        // }).bind(this)();
    }

    public async disconnect(): Promise<any> {
        // disconnect from database
        await this.ready;

        try {
            await this.pouchDB.close();
        } catch (err) {
            console.error(`StorageService: failed to disconnect from database\n${err}`);
            return false;
        }
        this.readyPromise = null;
        this.isConnected = false;

        console.log('StorageService: success, disconnected from database');
        return true;  // success
    }

    private async storageDesignDoc(): Promise<void> {
        // initialize design document for indexing storage views in database
        // see: https://pouchdb.com/2014/05/01/secondary-indexes-have-landed-in-pouchdb.html
        //      https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html
        // e.g. 'pouchDB.query('by_event_day', { key: '[Date]' });'
        try {
            let collectionDDoc = this.createDesignDoc('collection_name', function (doc: any) {
                if (doc.collectionName) {
                    emit(doc.collectionName);
                }
            });
            let eventDayDDoc = this.createDesignDoc('event_day', function (doc: any) {
                if (doc.collectionName && doc.eventDate) {
                    emit([doc.collectionName, doc.eventDateYear, doc.eventDateMonth, doc.eventDateDay]);
                }
            });
            let eventCompleteDDoc = this.createDesignDoc('event_incomplete', function (doc: any) {
                if (doc.collectionName.isComplete === false) {
                    emit([doc.collectionName]);
                }
            });
            let activeProfileDDoc = this.createDesignDoc('active_profile', function (doc: any) {
                if (doc.collectionName === 'profile' && doc.isActiveProfile === true) {
                    emit([doc.collectionName]);
                }
            });

            // save, kick off an initial build to index views
            await this.update(collectionDDoc);
            await this.update(eventDayDDoc);
            await this.update(eventCompleteDDoc);
            await this.update(activeProfileDDoc);

            await this.pouchDB.query('collection_name', { stale: 'update_after' });
            await this.pouchDB.query('event_day', { stale: 'update_after' });
            await this.pouchDB.query('event_incomplete', { stale: 'update_after' });
            await this.pouchDB.query('active_profile', { stale: 'update_after' });

        } catch (err) {
            throw new Error(`StorageService: warning, failed to create 'storage' design document: ${err}`);
        }
    }

    public createDesignDoc(name: string, mapFunction: any) {
        let ddoc = {
            _id: '_design/' + name,
            language: 'javascript',
            views: {
            }
        };
        ddoc.views[name] = { map: mapFunction.toString() };
        return ddoc;
    }

    private async storageFilterDoc(): Promise<void> {
        // initialize filter document for detecting document changes
        // see: https://pouchdb.com/api.html#changes
        // e.g. 'db.changes({ filter: 'myfilter', query_params: {type: 'marsupial'} })'

        // TODO: replace 'collection name' field with 'enum' to avoid guessing string names

        try {
            // detect changes on all collections
            let filterDoc1 = this.createFilterDoc('collection_filter',
                function (doc: any, req: any) {
                    if (doc.collectionName === 'survey'
                        || doc.collectionName === 'profile'
                        || doc.collectionName === 'data') {
                        return true;
                    }
                    return false;
                });
            // detect changes on completed documents
            let filterDoc2 = this.createFilterDoc('completion_filter',
                function (doc: any, req: any) {
                    return (doc.collectionName && doc.isComplete) ? true : false;
                });
            await this.update(filterDoc1);
            await this.update(filterDoc2);

        } catch (err) {
            throw new Error(`StorageService: warning, failed to create 'filter' design document: ${err}`);
        }
    }

    public createFilterDoc(name: string, mapFunction: any) {
        let ddoc = {
            _id: '_design/' + name,
            language: 'javascript',
            filters: {
            }
        };
        ddoc.filters[name] = { map: mapFunction.toString() };
        return ddoc;
    }

    public selfTestPromise(): Promise<boolean> {
        // creates a promise that reports self-test status
        // set promise to resolve after self-test is complete
        return new Promise<boolean>((resolve, reject) => {
            // we need to connect but no connection has been initiated
            if (!this.pouchDB) {
                console.error(this.disconnectWarning('failed self-test'));
                resolve(false);
            }
            // we're already connected, success
            if (this.isConnected) { resolve(true); }

            // otherwise, we wait until the connection is established
            try {
                // listen for 'deviceready' event
                this.pouchDB.on('deviceready', function (db: any) {
                    this.window.sqlitePlugin.selfTest(() => {
                        console.log('StorageService: success, self-test passed');
                        resolve(true); // success
                    });
                });
            } catch (err) {
                console.log(`StorageService: failed self-test, device not ready or test failed\n${err}`);
                reject(false);
            }
        });
    }

    /**
     * DATABASE ACCESSORS
     */
    public async add(doc: any): Promise<any> {
        // add/create document
        await this.ready;

        if (!doc) {
            console.error(`StorageService: failed to update document, missing input argument: ${doc}`);
            throw new Error('444');
        }
        try {
            // set submit date
            if (doc.hasOwnProperty('submitDate')) {
                doc.submitDate = new Date();
            }
            await this.pouchDB.put(doc);
            return await this.pouchDB.get(doc._id);
        } catch (err) {
            throw new Error(`StorageService: create document: ${err}`);
        }
    }

    public async remove(docID: any, docRev?: any): Promise<any> {
        // remove document by ID
        await this.ready;

        let options: any = {};
        if (docRev) {
            options['rev'] = docRev;
        }
        try {
            let doc = await this.get(docID, options);
            let remDoc = await this.pouchDB.remove(doc);

            //console.log(`StorageService: removed document: "ID: ${docID}, Rev:${docRev}"`);
            return remDoc;

        } catch (err) {
            throw new Error(`StorageService: failed to remove document: ${err}`);
        }
    }

    public async update(doc: any): Promise<any> {
        // update document in local storage if exists; otherwise, upserts changes
        // see: https://github.com/tlvince/pouchdb-upsert-if-changed
        //      https://github.com/pouchdb/upsert#dbupsertdocid-difffunc--callback
        if (!doc) {
            console.error(`StorageService: failed to update document, missing input argument: ${doc}`);
            throw new Error('444');
        }
        if (!this.pouchDB) {
            console.error(this.disconnectWarning('failed to update document'));
            throw new Error('444');
        }
        // update multiple docs in parallel
        if (doc instanceof Array) {
            const docInsts = doc;
            let promises = [];
            for (let docInst of docInsts) {
                promises.push(this.update(docInst));
            }
            return await Promise.all(promises);
        }
        // update single document
        try {
            // set submit date
            if (doc.hasOwnProperty('submitDate')) {
                doc.submitDate = new Date();
            }
            // insert document
            await this.pouchDB.put(doc);
            return await this.pouchDB.get(doc._id);

        } catch (err) {
            // upsert document if there is a conflict
            try {
                if (err.name === 'conflict') {
                    await this.pouchDB.upsert(doc._id, (res: any) => {
                        // skip empty documents
                        if (!doc) { return false; }
                        // remove empty fields from consideration
                        doc = this.removeEmptyFields(doc);
                        // overwrite document with proposed changes
                        return Object.assign(res, doc);
                    });
                    return await this.pouchDB.get(doc._id);
                }
            } catch (err) {
                console.error(`StorageService: failed to update document: ${err}`);
            }
        }
    }

    public async get(docID: string, options?: any): Promise<any> {
        // get document by collection name and fields
        await this.ready;
        try {
            if (!options) { options = {}; }
            return await this.pouchDB.get(docID, options);

        } catch (err) {
            // console.error(`StorageService: warning, failed to get document: ${docID}\n${err}`);
            throw err;
        }
    }

    public async getByCollection(name: string): Promise<any[]> {
        // gets documents by collection name
        await this.ready;
        try {
            const queryDocs = await this.pouchDB.query('collection_name', {
                key: name,
                include_docs: true,
            });
            if (queryDocs.rows.length === 0) { return; }

            // success, return array of survey form models
            const docs = queryDocs.rows.map((doc: any) => doc.doc);
            if (docs.length === 0) { return; }

            return docs;

        } catch (err) {
            console.warn(`StorageService: warning, failed to get query 'collection_name' ${name}:`);
            throw err;
        }
    }

    public async getByEventDay(collectionName: string, when: Date): Promise<any[]> {
        // get schedule events index by event day Y/M/D    
        await this.ready;

        if (!when) {
            throw new Error(`StorageService: failed to get documents by event day, missing event date argument`);
        }
        try {
            // format date to to Y/M/D (e.g. 2017-09-12)
            // each row contains a document
            const queryDocs = await this.pouchDB.query('event_day', {
                key: [collectionName, when.getFullYear(), when.getMonth(), when.getDate()],
                include_docs: true
            });
            if (queryDocs.rows.length === 0) { return; }

            // success, return array of survey form models
            const docs = queryDocs.rows.map((row: any) => row.doc);
            if (docs.length === 0) { return; }

            return docs;

        } catch (err) {
            console.warn(`StorageService: warning, failed to get query 'event_day' ${name}:`);
            throw err;
        }
    }

    public async getAll(): Promise<any[]> {
        // get all document in database storage
        await this.ready;

        try {
            // Each row has a .doc object and we just want to send an
            // array of exercise objects back to the calling controller,
            // so let's map the array to contain just the .doc objects.
            const getAllDocs = await this.pouchDB.allDocs({
                include_docs: true,
                attachments: true,
            });
            if (getAllDocs.rows.length === 0) { return; }

            // success, return array of documents
            const docs = getAllDocs.rows.map((x: any) => x.doc);
            return docs;

        } catch (err) {
            throw new Error(`StorageService: failed to get all documents: ${err}`);
        }
    }

    public async getPostsSince(when: Date): Promise<any> {
        // get posts since a given 'enrollDate'
        await this.ready;

        try {
            return await this.pouchDB.query('by_eventDate', { endkey: when, descending: true });
        } catch (err) {
            throw new Error(`StorageService: failed to get documents since ${when}\n${err}`);
        }
    }

    public async getPostsBefore(when: Date): Promise<any> {
        // get posts since a given 'enrollDate'
        await this.ready;

        try {
            let res = await this.pouchDB.query('by_eventDate', { startkey: when });
            return res;
        } catch (err) {
            throw new Error(`StorageService: failed to get documents before ${when}\n${err}`);
        }
    }

    public async getPostsBetween(startDate: Date, endDate: Date): Promise<any> {
        // get posts since a given 'enrollDate'
        await this.ready;

        try {
            return await this.pouchDB.query('by_eventDate', { startkey: startDate, endkey: endDate });
        } catch (err) {
            throw new Error(`StorageService: failed to get documents between ${startDate} and ${endDate}\n${err}`);
        }
    }

    public async exists(docID: string, options?: any): Promise<boolean> {
        // check whether document exists in the database
        await this.ready;

        try {
            if (!options) { options = {}; }
            const doc = await this.get(docID, options);
            return (doc) ? true : false;

        } catch (err) {
            // console.warn(`StorageService: warning, document does not exist in database\n${err}`);
            return false;
        }
    }

    public isEmpty(): Promise<boolean> {
        if (!this.pouchDB) {
            console.error(this.disconnectWarning('failed to get collection'));
            throw new Error('444');
        }
        return (async () => {
            const result = await this.pouchDB.info();
            return (result.doc_count === 0) ? true : false;
        })();
    }

    public async isEmptyByCollection(collectionName: string): Promise<boolean> {
        return (async () => {
            const docs = await this.getByCollection(collectionName);
            return (docs.length === 0) ? true : false;
        })();
    }

    public async destroyAll() {
        // destroy the pouchdb database
        try {
            // destroy local storage and reconnect
            await this.disconnect();
            console.log('database disconnected');

            await new PouchDB(this.dbName).destroy();
            console.log('database destroyed');

            await this.connect();
            await this.ready;
            console.log('database connected');
            console.log('StorageService: reset database: completed');

        } catch (err) {
            throw new Error(`StorageService: failed to destroy database: ${err}`);
        }
    }

    /**
     * HELPER
     */
    private disconnectWarning(message: any): string {
        return `StorageService: ${message},  database disconnected`;
    }

    private removeEmptyFields(obj: any) {
        obj = JSON.stringify(obj, this.replaceUndefinedOrNull);
        return JSON.parse(obj);
    }

    private replaceUndefinedOrNull(key: string, value: string) {
        if (value === null || value === undefined) {
            return undefined;
        }
        return value;
    }

} // end - 'storage-service.ts'



//----------------------------------------------------------------------------

// Object.keys(obj).forEach(function (key) {
//     if (obj[key] && typeof obj[key] === 'object') { this.removeEmpty(obj[key]); }
//     else if (obj[key] == null) { delete obj[key]; }
// });
// return obj;

//----------------------------------------------------------------------------

// private async debugDestroyLocalStorage(): Promise<void> {
//     // reset local storage
//     try {
//         await this.storage.ready;
//         // await this.storage.disconnect();
//         await this.storage.destroy();
//         await this.storage.connect();
//         console.log(`MyApp: destroy local storage: success`);

//     } catch (err) {
//         throw new Error(`MyApp: failed to reset local storage: ${err}`);
//     }
// }

// private async debugPopulateLocalStorage(): Promise<void> {
//     // populate the local storage database
//     try {
//         console.log(`MyApp: populating local storage dataset...`);
//         await this.mockDataset.createSampleDatabase(DBConfig.name, false);

//     } catch (err) {
//         throw new Error(`MyApp: failed to populate local storage dataset: ${err}`);
//     }
// }