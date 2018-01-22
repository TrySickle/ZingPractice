import { Injectable } from '@angular/core';

import { ExerciseModel } from '../../../models/exercise-model';
import { MedicationModel } from '../../../models/medication-model';
import { MoodModel } from '../../../models/mood-model';
import { SleepModel } from '../../../models/sleep-model';
import { SurveyFormModel } from '../../../models/survey-form-model';
import { UserDataModel } from '../../../models/user-data-model';
import { UserDataType } from '../../../shared/enums';
import { StorageService } from '../storage-service';


/*
  Generated class for the UserReport provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.

  see: https://www.joshmorony.com/building-mobile-apps-with-ionic-2/observables-in-ionic2.html
*/
@Injectable()
export class ReportService {

    constructor(
        private storage: StorageService,
    ) { }

    /**
     * PROPERTIES
    */
    public get ready(): Promise<boolean> {
        // resolves when 'storage' and datset is refreshed (optional)
        return this.storage.ready;
    }

    /**
    * DATABASE ACCESSORS
    */
    async add(doc: UserDataModel): Promise<UserDataModel> {
        // add/create profile instrument
        try {
            let resDoc = await this.storage.add(doc);
            return new UserDataModel(resDoc);

        } catch (err) {
            throw new Error(`ReportService: failed to add instrument\n${err}`);
        }
    }

    async remove(doc: UserDataModel): Promise<UserDataModel> {
        // remove profile instrument
        try {
            let resDoc = await this.storage.remove(doc._id);
            return new UserDataModel(resDoc);

        } catch (err) {
            throw new Error(`ReportService: failed to remove instrument\n${err}`);
        }
    }

    async update(doc: UserDataModel): Promise<UserDataModel> {
        // update local and remote report data
        try {
            // store report data in our local database
            let resDoc = await this.storage.update(doc);
            return new UserDataModel(resDoc);

        } catch (err) {
            throw new Error(`ReportService: failed to update local storage\n${err}`);
        }
    }

    public async updateFromSurvey(survey: SurveyFormModel): Promise<UserDataModel[]> {

        // store reports in local database
        let reports: UserDataModel[] = [];

        // TODO: extract fields for 'intake' and 'exit' surveys such as average sleep
        try {
            // extract 'survey data' fields
            const exercise = ExerciseModel.fromSurveyFields(survey);
            if (exercise) { reports.push(exercise); }

            const medication = MedicationModel.fromSurveyFields(survey);
            if (medication) { reports.push(medication); }

            const mood = MoodModel.fromSurveyFields(survey);
            if (mood) { reports.push(mood); }

            const sleep = SleepModel.fromSurveyFields(survey);
            if (sleep) { reports.push(sleep); }

            let promises = reports.map((data: UserDataModel) => this.storage.update(data));
            const docs = await Promise.all(promises);
            reports = docs.map((doc: any) => new UserDataModel(doc));

        } catch (err) {
            console.log(`ReportService: failed to submit survey, unable to extract and store survey fields: ${err}`);
        }
        return reports;
    }

    async get(docID: string): Promise<UserDataModel> {
        // get report from local storage
        try {
            let report = new UserDataModel(await this.storage.get(docID));
            return report;

        } catch (err) {
            console.error('ReportService: failed to get user report: ', err);
            throw err;
        }
    }

    async getAll(type?: UserDataType): Promise<UserDataModel[]> {
        // get all reports from local storage
        try {
            const reportDocs = await this.storage.getByCollection('data');
            let reports = reportDocs.map((doc: any) => new UserDataModel(doc));
            if (type) {
                reports = reportDocs.filter((report: any) => report.dataType === type);
            }
            return reports;

        } catch (err) {
            console.error('ReportService: failed to get all user reports: ', err);
            throw err;
        }
    }

    async getByType(type: UserDataType): Promise<UserDataModel[]> {
        // get all reports from local storage
        try {
            const reportDocs = await this.storage.getByCollection('data');
            const reports = reportDocs
                .map((doc: any) => new UserDataModel(doc))
                .filter((doc: any) => doc.dataType === type);

            return reports;

        } catch (err) {
            console.error('ReportService: failed to get all user reports: ', err);
            throw err;
        }
    }

    async getByDate(eventDate: Date, type?: UserDataType): Promise<UserDataModel[]> {
        // get report from local storage by date and type
        try {
            const reportDocs = await this.storage.getByEventDay('data', eventDate);
            let reports = reportDocs.map((doc: any) => new UserDataModel(doc));
            if (type) {
                reports = reports.filter((report: UserDataModel) => report.dataType === type);
            }
            return reports;

        } catch (err) {
            console.error('ReportService: failed to get user report by date/type: ', err);
            throw err;
        }
    }

}
