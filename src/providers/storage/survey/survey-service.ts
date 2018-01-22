import { SurveyFieldType } from '../../../shared/enums';
import { RedcapService } from './../redcap/redcap-service';
import { SurveyFieldModel } from '../../../models/survey-field-model';
import { Injectable } from '@angular/core';

import { SurveyFormModel } from '../../../models/survey-form-model';
import { StorageService } from '../storage-service';
import { MIN_MSEC } from '../../../shared/constants';

// tslint:disable:no-console
// tslint:disable:no-debugger
// tslint:disable:max-line-length
/*
  Generated class for the UserSurvey provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.

  provide the survey data the application needs to function, without the app having to worry about how that data is fetched
*/
@Injectable()
export class SurveyService {

    constructor(
        private storage: StorageService,
        private redcap: RedcapService,
    ) { }

    /**
    * EVENTS
    */
    public get ready(): Promise<boolean> {
        // resolves survey connection is complete
        return this.storage.ready;
    }

    /**
    * DATABASE ACCESSORS
    */
    public async add(doc: SurveyFormModel): Promise<SurveyFormModel> {
        // add/create survey instrument
        try {
            let resDoc = await this.storage.add(doc);
            return new SurveyFormModel(resDoc);

        } catch (err) {
            throw new Error(`SurveyService: failed to add instrument\n${err}`);
        }
    }

    public async remove(doc: SurveyFormModel): Promise<SurveyFormModel> {
        // remove survey instrument
        try {
            let resDoc = await this.storage.remove(doc._id);
            return new SurveyFormModel(resDoc);

        } catch (err) {
            throw new Error(`SurveyService: failed to remove instrument\n${err}`);
        }
    }

    public async update(survey: SurveyFormModel): Promise<SurveyFormModel> {
        // update and return survey
        try {
            // console.log(`SurveyService: saving: collection: ${survey.collectionName}, \
            // eventDate: ${survey.eventDate.toDateString()}, reportIndex: ${survey.reportIndex}`);

            const doc = await this.storage.update(survey);
            return new SurveyFormModel(doc);

        } catch (err) {
            throw new Error(`SurveyService: failed to update document\n${err}`);
        }
    }

    public async get(docID: string, isCacheEnabled: boolean = false, isRedcapEnabled: boolean = false): Promise<SurveyFormModel> {
        // get survey from local database or pull from redcap
        let surveyDoc: SurveyFormModel;
        try {
            // get survey from local storage if present
            // if (await this.storage.exists(docID)) {
            //     const doc = await this.storage.get(docID);
            //     surveyDoc = new SurveyFormModel(doc);
            // }
            // otherwise, create survey from local cache or redcap
            const didLoadLocal = (surveyDoc && surveyDoc.formFields.length > 0);
            if (!didLoadLocal) {
                const docFields = SurveyFormModel.docIDFields(docID);
                let formFields: SurveyFieldModel[];

                // local storage
                // if (isCacheEnabled) {
                //     formFields = await this.getCachedFields(docFields['formName']);
                // }
                // redcap storage
                if (isRedcapEnabled && !formFields) {
                    const redcapForm = await this.redcap.getInstrumentByName(docFields['formName']);
                    if (!redcapForm) { throw `unable to retrieve instrument from redcap`; }
                    formFields = redcapForm.formFields;
                }
                // create new survey and update
                surveyDoc = new SurveyFormModel({
                    uuid: docFields['uuid'],
                    eventDate: docFields['eventDate'],
                    formName: docFields['formName'],
                    formFields: formFields,
                    reportIndex: docFields['reportIndex'],
                });
                surveyDoc = await this.update(surveyDoc);
            }

        } catch (err) {
            console.warn(`SurveyService: warning, failed to get survey: ${err}`);
        }
        return surveyDoc;
    }

    public async getCachedFields(formName: string): Promise<SurveyFieldModel[]> {
        // get survey from local database
        let formFields: SurveyFieldModel[];

        // search local database and extract fields from an existing form, if present
        try {
            const surveyDocs = await this.getByFormName(formName);
            if (!surveyDocs) { throw `no form matches found for '${formName}'`; }

            const matchingDoc = surveyDocs[0]; // choose first instance
            if (!matchingDoc.formFields || matchingDoc.formFields.length === 0) {
                throw `no cached fields found for '${formName}'`;
            }
            formFields = matchingDoc.formFields;

        } catch (err) {
            console.warn(`SurveyService: warning, failed to get cached survey fields: ${err}`);
        }
        return formFields;
    }

    public async getEnrollmentForm(uuid: string): Promise<SurveyFormModel> {
        // get enrollment survey form (cached or remote)
        let surveyDoc: SurveyFormModel;
        try {
            const formName = 'enrollment_patientcaregiver';
            const docID = SurveyFormModel.docID(uuid, formName, new Date());
            const isLocalCacheEnabled = true;
            const isRedcapEnabled = true;
            surveyDoc = await this.get(docID, isLocalCacheEnabled, isRedcapEnabled);
        }
        catch (err) {
            throw new Error(`SurveyService: failed to get enrollment survey: ${err}`);
        }
        return surveyDoc;
    }

    public async getAll(): Promise<SurveyFormModel[]> {
        // get all survey documents in database
        try {
            let findDocs = await this.storage.pouchDB.find({
                selector: {
                    collectionName: { $eq: 'survey' }
                },
            });
            // success, return array of survey documents
            return findDocs.docs.map((doc: any) => new SurveyFormModel(doc));

        } catch (err) {
            throw new Error(`SurveyService: failed to get all survey documents\n${err}`);
        }
    }

    public async getByEventDay(when: Date): Promise<SurveyFormModel[]> {
        // get survey form fields indexed by Y/M/D
        try {
            // search database by Y/M/D (e.g. 2017-09-12)
            const docs = await this.storage.getByEventDay('survey', when);
            if (!docs) { return; }

            const surveys = docs.map((doc: any) => new SurveyFormModel(doc));
            if (surveys.length === 0) { return; }

            return surveys;

        } catch (err) {
            throw new Error(`SurveyService: failed to get query 'event_day': ${err}`);
        }
    }

    public async getByFormName(formName: string): Promise<SurveyFormModel[]> {
        // get all surveys with a given 'formName'
        let matchingDocs;
        try {
            // search database by form name
            const queryDocs = await this.storage.getByCollection('survey');
            if (!queryDocs) { return; }

            matchingDocs = queryDocs
                .filter((doc: any) => doc.formName === formName)
                .map((doc: any) => new SurveyFormModel(doc));
            if (matchingDocs.length === 0) { return; }

            return matchingDocs;

        } catch (err) {
            console.warn(`SurveyService: warning, failed to get surveys by form name\n${err}`);
            throw err;
        }
    }

    public async getNextReportIndex(when: Date, formName?: string): Promise<number> {
        // gets next avaiable report index for a given date
        let reportIdx = 0;
        try {
            // get all surveys on date
            let surveys = await this.getByEventDay(when);
            if (!surveys) { return reportIdx; }

            // filter by form name
            if (formName) {
                surveys = surveys.filter((survey: SurveyFormModel) => survey.formName);
            }
            // set report index
            reportIdx = surveys.length; // increments from zero

        } catch (err) {
            console.error(`SurveyService: failed to get next report index: ${err}`);
        }
        return reportIdx;
    }

    private async destroyAllSurveys() {
        // remove all surveys from database
        await this.storage.ready;
        try {
            let docs = await this.storage.getByCollection('survey');

            let promises = [];
            for (let surveyDoc of docs) {
                promises.push(this.storage.remove(surveyDoc._id));
            }
            await Promise.all(promises);

        } catch (err) {
            throw new Error(`SurveyService: failed to remove all survey docs: ${err}`);
        }
        console.log('SurveyService: destroy all survey docs: complete');
    }

    private dateToCalDate(when: Date): Date {
        // get current date in EST 'yyyy-MM-dd'
        const calDate = new Date(
            when.getFullYear(), when.getMonth(),
            when.getDate(), 0, 0, 0, 0);
        return calDate;
    }

    private dateToLocalTime(when: Date): number {
        // get current date in EST
        const dateUTCMsec = when.getTime();
        const dateLocalMsec = dateUTCMsec - when.getTimezoneOffset() * MIN_MSEC;
        return dateLocalMsec;
    }

}