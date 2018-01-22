import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { environment } from './../../../shared/environments/environment';
import { RedcapConfig } from './../../../shared/config/redcap-config';
import { RedcapRequestModel } from './../../../models/redcap-http-model';
import { UserProfileModel } from './../../../models/user-profile-model';
import { SurveyFieldType } from './../../../shared/enums';
import { BulkDataModel } from './../../../models/bulk-transfer-model';
import { ScheduleEventModel } from './../../../models/schedule-event-model';
import { SurveyFieldModel } from './../../../models/survey-field-model';
import { SurveyFormModel } from './../../../models/survey-form-model';
import { UserDataModel } from './../../../models/user-data-model';

// tslint:disable:no-console
// tslint:max-line-length
/*
  Generated class for the RedcapService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.

  Export a single function for making HTTP requests

  ES6 interfaces
  see: https://www.typescriptlang.org/docs/handbook/interfaces.html

  Named parameters
  see:  http://exploringjs.com/es6/ch_parameter-handling.html
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  Make HTTP calls
  see:  https://webcake.co/binding-data-to-toggles-and-checkboxes-in-ionic-2/
*/

@Injectable()
export class RedcapService {

  private redcapURL: string;

  constructor(
    private http: HttpClient,
  ) {
    let redcapURL = environment.redcapURL;
    if (!window['jasmine']) {
      redcapURL = `https://${RedcapConfig.domain}/api/`;
    }
  }

  // ----------------------------------------------------------------
  // REDCap Project Data
  // ----------------------------------------------------------------
  getArms(): Promise<any> {
    let http = new RedcapRequestModel({ payload: { content: 'arm' } });
    return this.httpRequest(http);
  }

  async getInstrumentNames(): Promise<any> {
    // get instrument names
    try {
      let http = new RedcapRequestModel({ payload: { content: 'instrument' } });
      let instrNames = await this.httpRequest(http);
      return instrNames.map((x: any) => x['instrument_name']);

    } catch (err) {
      throw new Error('RedcapService: failed to get instrument names, unable to make http request');
    }
  }

  public async getInstrumentLabel(formName: string): Promise<any> {
    // get instrument names
    try {
      let http = new RedcapRequestModel({ payload: { content: 'instrument' } });
      let instrFormLabels = await this.httpRequest(http);
      const matchingFormLabels = instrFormLabels.filter((x: any) => x['instrument_name'] === formName);

      // success, return first matching form label
      return matchingFormLabels[0]['instrument_label'];

    } catch (err) {
      throw new Error('RedcapService: failed to get instrument names, unable to make http request');
    }
  }

  public async getInstrumentFields(instrName: string): Promise<SurveyFieldModel[]> {
    // get survey fields from redcap
    try {
      let http = new RedcapRequestModel({
        payload: {
          content: 'metadata',
          forms: [instrName]
        }
      });
      const metadata = await this.httpRequest(http);
      if (!metadata) {
        throw `http response is empty or invalid`;
      }
      const fields = SurveyFieldModel.fromRedcapMetadata(metadata);
      if (!fields) {
        throw `metadata does not contain fields`;
      }
      return fields;

    } catch (err) {
      throw new Error(`RedcapService: failed to get instrument '${instrName}': ${err}`);
    }
  }

  public async getInstrumentByName(instrName: string): Promise<SurveyFormModel> {
    // get instrument from redcap
    let instr: SurveyFormModel;
    try {
      // get label
      const instLabel = await this.getInstrumentLabel(instrName);
      if (!instLabel) {
        throw `no matching labels found for '${instrName}'`;
      }
      // get fields
      const instFields = await this.getInstrumentFields(instrName);
      if (!instFields) {
        throw `no fields found for label '${instrName}'`;
      }
      instr = new SurveyFormModel({
        formName: instrName,
        formFields: instFields,
      });

    } catch (err) {
      console.error(`RedcapService: failed to get instrument: ${err}`);
      return;
    }
    return instr;
  }

  public getFieldNames(): Promise<any> {
    let http = new RedcapRequestModel({ payload: { content: 'exportFieldNames' } });
    return this.httpRequest(http);
  }

  public getEvents(): Promise<any> {
    let http = new RedcapRequestModel({ payload: { content: 'event' } });
    return this.httpRequest(http);
  }

  public getProjectInfo(): Promise<any> {
    let http = new RedcapRequestModel({ payload: { content: 'project' } });
    return this.httpRequest(http);
  }

  public async getNextRecordName(): Promise<string> {
    // get next record name for signup
    try {
      let http = new RedcapRequestModel();
      http.payload.content = 'generateNextRecordName';
      const recordIDNum = await this.httpRequest(http);

      return recordIDNum.toString();

    } catch (err) {
      throw new Error(`RedcapService: failed to get next record ID: ${err}`);
    }
  }

  public async getRecordIDs(filterIncomplete?: boolean): Promise<string[]> {
    // search for 'record_id's in survey responses
    let recordIDs: string[];

    // set defaults 
    if (!filterIncomplete) { filterIncomplete = false; }

    // get records
    let records;
    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        records: [],
        formName: ['account_creation_patientcaregiver']
      }
    });
    try {
      records = await this.httpRequest(http);

    } catch (err) {
      console.warn(`RedcapService: warning, failed to get record IDs, unable to make http request: ${err}`);
      return;
    }

    // filter incomplete responses
    if (filterIncomplete) {
      let completeField = 'account_creation_patientcaregiver_complete';
      records = records.filter((record: any) => {
        let containsField = String(Object.keys(record)).includes(completeField);
        let completedForm = record[completeField] === '2';
        if (containsField && completedForm) { return record; }
      });
    }
    if (!records) {
      console.warn(`RedcapService: warning, failed to get record IDs, no complete records found`);
      return;
    }

    // extract record IDs
    recordIDs = records.map((record: any) => {
      if (record['account_record_id']) { return record['account_record_id']; }
    });
    // filter duplicate records
    const recordIDSet = new Set(recordIDs);
    recordIDs = Array.from(recordIDSet);

    return recordIDs;
  }

  public async getRecordsByID(recordID: string, forms?: string[], events?: string[], filterIncomplete?: boolean): Promise<any> {
    // get a single user record by ID

    // set defaults
    if (!forms) { forms = []; } // all records
    if (!events) { events = ['enrollment_arm_2']; }
    if (!filterIncomplete) { filterIncomplete = true; }

    // get records
    let records;
    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        records: [recordID],
        forms: forms,
        event: events
      }
    });
    try {
      records = await this.httpRequest(http);
    } catch (err) {
      throw new Error(`RedcapService: failed to request record by ID: ` + err);
    }

    // filter incomplete responses
    if (filterIncomplete) {
      records = records.filter((record: any) => {
        // search for 'complete' field and keep records if field has a value
        const recordFields: Array<string> = Object.keys(record);
        let completeFieldIdx = recordFields.findIndex(function (field: string) {
          return field.includes('_complete');
        });
        if (record[recordFields[completeFieldIdx]]) { return record; }
      });
    }

    return records;
  }

  public getRecordInfo(formName: string, event?: string): Promise<any> {
    // request record info and return a promise
    let http = new RedcapRequestModel({
      payload: {
        instrument: formName,
        event: (event) ? [event] : ['enrollment_arm_2'],
        content: 'participantList',
      }
    });
    return this.httpRequest(http);
  }

  public async removeRecord(recordID: string, formName?: string): Promise<number> {
    // remove record from redcap, returns # records deleted

    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        records: [recordID],
        action: 'delete'
      }
    });
    if (formName) {
      http.payload['forms'] = [formName];
    }
    try {
      return await this.httpRequest(http);
    } catch (err) {
      //console.warn(`RedcapService: warning, failed to remove record: ${err}`);
    }
  }

  public async destroyAll(): Promise<any> {
    // remove all redcap records
    let recordIDs = [];
    try {
      let nextRecordID = Number.parseInt(await this.getNextRecordName());
      recordIDs = Array.from(new Array(nextRecordID - 1), (x, i) => i + 1); //[1-N]
    } catch (err) {
      throw new Error(`RedcapService: failed to destroy all records, unable to get next recordID: ${err}`);
    }
    // submit seperate requests to delete records
    let promises = [];
    for (let recordID of recordIDs) {

      promises.push(
        (async () => {
          try {
            await this.httpRequest(new RedcapRequestModel({
              payload: {
                content: 'record',
                records: recordID, //recordIDs
                action: 'delete'
              }
            }));
            console.log(`RedcapService: deleted record: ${recordID}`);
          } catch (err) { /* catch errors, do nothing*/ }
        })());
    }

    try {
      // console.log(`RedcapService: deleted all records: started`);
      await Promise.all(promises);
      // console.log(`RedcapService: deleted all records: completed`);
    } catch (err) {
      console.error(`RedcapService: failed to destroy all records: ${err}`);
    }
  }

  public async existsProfile(recordID: string): Promise<boolean> {
    // check the presense of an enrollment survey by ID
    try {
      const records = await this.getRecordsByID(recordID, ['account_creation_patientcaregiver']);
      return (records.length > 0) ? true : false;

    } catch (err) {
      throw new Error(`RedcapService: failed to check whether profile exists: ${err}`);
    }
  }

  public async getProfile(recordID: string): Promise<UserProfileModel> {
    // get a profile by ID
    try {
      const formName = 'account_creation_patientcaregiver';
      const records = await this.getRecordsByID(recordID, [formName]);
      const record = records[0];
      if (!record) {
        throw `failed to get record '${recordID}:${formName}'`;
      }
      const profile = new UserProfileModel({
        uuid: record['account_uuid'],
        recordID: record['account_record_id'],
        firstName: record['account_first_name'],
        lastName: record['account_last_name'],
        email: record['account_email'],
        phone: record['account_phone_number'],
        userRole: record['account_user_role'],
        enrollDate: new Date(record['account_enroll_date']),
        submitDate: new Date(record['account_submit_date']),
      });

      // skip if essential fields are missing
      if (!profile.uuid) { throw `redcap profile is missing uuid`; }
      if (!profile.recordID) { throw `redcap profile is missing recordID`; }

      return profile;

    } catch (err) {
      console.error(`RedcapService: failed to get profile: ${err}`);
    }
  }

  public async getBulkUploadCounts(recordID: string, eventDates: Date[]): Promise<any> {
    // compute daily upload coverage, {0 or 1 for [0-30 days]} 
    try {
      // get upload dates on redcap
      const uploadRecords = await this.getRecordsByID(recordID, ['daily_file_upload']);

      // format as calander date strings for comparision
      const eventDateBins: string[] = eventDates
        .map((date: Date) => this.dateToCalDate(date))
        .map((date: Date) => date.toISOString());
      if (!eventDateBins) {
        console.warn(`RedcapService: warning, no event dates`);
        return;
      }
      const bulkUploadDates: string[] = uploadRecords
        .filter((record: any) => record['daily_upload_event_date'])
        .map((record: any) => new Date(record['daily_upload_event_date']))
        .map((date: Date) => this.dateToCalDate(date))
        .map((date: Date) => date.toISOString());
      if (!bulkUploadDates) {
        console.warn(`RedcapService: warning, no upload dates given`);
        return;
      }

      // compute upload cound by date, {key: dates, value: counts}
      // Note: returns zero array if no samples are given
      const isZeroFillEnabled: boolean = true;
      const bulkUploadCounts = this.computeHistogram(bulkUploadDates, eventDateBins, isZeroFillEnabled);

      return bulkUploadCounts;

    } catch (err) {
      throw new Error(`RedcapService: failed to get builk upload date counts: ${err}`);
    }
  }

  public checkDocumentStatus(bulkDoc: BulkDataModel, eventDates: Date[]): any[] {
    // compute status, {0 or 1 for [0-30 days]} 

    if (!bulkDoc || !eventDates) {
      throw new Error(`RedcapService: failed to populate row data, missing bulk document or enrollment date: ${bulkDoc}, ${eventDates}`);
    }
    try {
      // get event dates
      let surveyEventDate = bulkDoc.surveys.map((survey: SurveyFormModel) => this.dateToCalDateStr(survey.eventDate));
      let userDataEventDate = bulkDoc.reports.map((data: UserDataModel) => this.dateToCalDateStr(data.eventDate));
      let scheduleEventDate = bulkDoc.schedules.map((schedule: ScheduleEventModel) => this.dateToCalDateStr(schedule.eventDate));

      // format dates as 'YYY-MM-DD' for comparision
      let eventDateBins: string[] = eventDates.map((date: Date) => { return date.toISOString().slice(0, 10); });

      // count # documents per event date
      const surveyDateCounts = this.computeHistogram(surveyEventDate, eventDateBins);
      const userDataDateCounts = this.computeHistogram(userDataEventDate, eventDateBins);
      const scheduleDateCounts = this.computeHistogram(scheduleEventDate, eventDateBins);

      // success, return date counts
      return [surveyDateCounts, userDataDateCounts, scheduleDateCounts];

    } catch (err) {
      throw new Error(`RedcapService: failed to get builk upload date counts: ${err}`);
    }
  }

  public computeHistogram(samples: any[], bins: any[], isZeroFillEnabled: boolean = false): Array<number> {
    // count # samples within each event date, hash[bin]=value
    // Note: one-to-one mapping of samples to bins is required for histogram

    const binCounts: Array<number> = samples
      .reduce((dict: any, curr: any) => {
        if (bins.includes(curr)) {
          dict[curr] = (dict[curr] || 0) + 1;
        }
        return dict;
      }, {} /*initialize hash map*/);

    // add zeros to histogram if no sample present
    if (isZeroFillEnabled) {
      for (let bin of bins) {
        if (!binCounts[bin]) { binCounts[bin] = 0; }
      }
    }
    // skip if no bins are filled
    const didFillBins: boolean = (Object.keys(binCounts).length > 0);
    if (!didFillBins) { return; }

    return Object.values(binCounts);
  }

  public async pushBulkDoc(profile: UserProfileModel, bulkDoc: BulkDataModel): Promise<any> {
    // push bulk data document

    if (!profile || !profile.recordID || !profile.enrollDate) {
      console.error('RedcapService: failed to push bulk model, profile missing arguments');
      return;
    }
    if (!bulkDoc || !bulkDoc.eventDate || !bulkDoc.submitDate) {
      console.error('RedcapService: failed to push bulk model, bulk data missing arguments');
      return;
    }

    // upload bulk data to redcap
    const eventName = profile.eventNameFromDate(bulkDoc.eventDate);
    try {
      await this.pushFileBuffer(profile.recordID, `daily_upload`, eventName, bulkDoc);
      // console.log(`RedcapService: push bulk data: ${profile.recordID}:${eventName}: complete`);
    } catch (err) {
      throw new Error(`RedcapService: failed to push bulk model, unable to push data: ${err}`);
    }

    // submit bulk data survey on redcap
    let data: any = {
      'account_record_id': profile.recordID,
      'daily_upload_event_date': bulkDoc.eventDate.toISOString(),
      'daily_upload_submit_date': bulkDoc.submitDate.toISOString(),
      'redcap_event_name': eventName,
      'daily_file_upload_complete': '2',
    };
    let dataString = `[${JSON.stringify(data)}]`; // enclose data in brackets '[]'
    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        type: 'flat',
        overwriteBehavior: 'overwrite',
        data: dataString,
        returnContent: 'count',
      }
    });
    try {
      return await this.httpRequest(http);

    } catch (err) {
      throw new Error(`RedcapService: failed to push bulk model, unable to push survey: ${eventName}\n${err}`);
    }
  }

  public async pullBulkDoc(profile: UserProfileModel, eventDate: Date, includeFileRecord?: boolean): Promise<any> {
    // push bulk data and update record

    if (!profile || !profile.recordID || !profile.enrollDate) {
      console.error('RedcapService: failed to pull bulk model, profile missing arguments');
      return;
    }
    if (!eventDate) {
      console.error('RedcapService: failed to pull bulk model, event date missing');
      return;
    }
    // set defaults
    if (!includeFileRecord) { includeFileRecord = false; }

    // pull upload file
    let bulkDoc: BulkDataModel;
    const eventName = profile.eventNameFromDate(eventDate);
    try {
      const redcapBulkDoc = await this.pullFileBuffer(profile.recordID, 'daily_upload', eventName);
      if (!redcapBulkDoc) { return; }

      bulkDoc = new BulkDataModel(redcapBulkDoc);

      // also pull upload record, if requested
      if (includeFileRecord) {
        const formName = 'daily_upload';
        const uploadRecord = await this.getRecordsByID(profile.recordID, [formName], [eventName]);
        return [bulkDoc, uploadRecord];
      }
      // otherwise, return bulk document
      return bulkDoc;

    } catch (err) {
      console.error(`RedcapService: failed to pull bulk model: ${err}`);
    }
  }

  private async pushFileBuffer(recordID: string, field: string, event: string, content: any): Promise<any> {
    /**
     * push/upload local storage data to redcap
     * 
     * example: { 
     *            recordID: '1', 
     *            field: 'daily_upload', 
     *            event: 'day_1_arm_2', 
     *            content: '[{ message: 'hello world' })]
     *          }
     */
    if (!recordID || !field || !event || !content) {
      throw new Error(`RedcapService: failed to push file buffer, missing arguments: \
      recordID: ${recordID}, field: ${field}, event: ${event}, content: ${content}`);
    }
    // set filename as upload 'date-time' + '.json'
    let filename = `${new Date().toISOString()}_blob.json`;

    // set file content to json formatted blob object
    let fileBuffer: Blob;
    try {
      fileBuffer = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    } catch (err) {
      throw new Error(`RedcapService: failed to push file buffer, unable to create blob from content: ${err}`);
    }

    return this.httpImportRequest(filename, fileBuffer, recordID, field, event);
  }

  private async pullFileBuffer(recordID: string, field: string, event: string): Promise<any> {
    /**
     * pull/download local storage data from redcap
     * 
     * example: {recordID: '1', field: 'daily_upload', event: 'day_1_arm_2'}
     */
    // TODO: replace with 'RedcapRequestModel' for consistency
    // e.g. let http = new RedcapRequestModel({ payload: { content: 'instrument' } });
    if (!recordID || !field || !event) {
      throw new Error(`RedcapService: failed to pull file buffer, missing arguments: \
      recordID: ${recordID}, field: ${field}, event: ${event}`);
    }
    try {
      const request = await this.httpExportRequest(recordID, field, event);
      if (request.response === undefined) {
        throw `status: ${request.status}`;
      }
      return JSON.parse(request.response);

    } catch (err) {
      console.error(`RedcapService: failed to pull file buffer: ${err}`);
    }
  }

  public async pushProfile(profile: UserProfileModel): Promise<any> {
    // push profile information to redcap
    if (!profile.recordID || !profile.uuid) {
      throw new Error(`RedcapService: failed to push profile, missing 'uuid' or 'record ID' argument: ${JSON.stringify(profile)}`);
    }
    // set mandatory fields
    let data: any = {
      'account_record_id': profile.recordID,
      'account_submit_date': new Date().toISOString(),
      'account_creation_patientcaregiver_complete': '2',
      'redcap_event_name': 'enrollment_arm_2',
      'account_uuid': profile.uuid,
    };
    // set optional fields
    if (profile.firstName) {
      data['account_first_name'] = profile.firstName;
    }
    if (profile.lastName) {
      data['account_last_name'] = profile.lastName;
    }
    if (profile.email) {
      data['account_email'] = profile.email;
    }
    if (profile.phoneNumber) {
      data['account_phone_number'] = profile.phoneNumber;
    }
    if (profile.userRole) {
      data['account_user_role'] = profile.userRole;
    }
    if (profile.enrollDate) {
      data['account_enroll_date'] = profile.enrollDate.toISOString();
    }
    if (profile.uuid) {
      data['account_uuid'] = profile.uuid;
    }
    // push record to redcap to register
    // JSON data must be enclosed in brackets '[]'
    let dataString = `[${JSON.stringify(data)}]`;
    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        type: 'flat',
        overwriteBehavior: 'overwrite',
        data: dataString,
        returnContent: 'count',
      }
    });
    try {
      let signupResult = await this.httpRequest(http);
      return signupResult;

    } catch (err) {
      throw new Error(`RedcapService: failed to signup\n${err}`);
    }
  }

  public async pullProfile(recordID: string): Promise<UserProfileModel> {
    // pull profile information from redcap
    // TODO: confirm that this works with multiple profiles, selection seems wrong
    let http = new RedcapRequestModel({
      payload: {
        content: 'record',
        records: [recordID],
        formName: ['account_creation_patientcaregiver']
      }
    });
    try {
      // get profile from redcap
      const records = await this.httpRequest(http);
      if (records.length > 1) {
        console.warn(`RedcapService: warning, pulling profile, should only be one profile per 'record ID' but multiple present`);
      }
      const data = records[0];

      // extract profile information
      const profile = new UserProfileModel({
        enrollDate: new Date(data['account_enroll_date']),
        submitDate: new Date(data['account_submit_date']),
        eventName: data['redcap_event_name'],
        recordID: data['account_record_id'],
        firstName: data['account_first_name'],
        lastName: data['account_last_name'],
        email: data['account_email'],
        phoneNumber: data['account_phone_number'],
        userRole: data['account_user_role'],
        uuid: data['account_uuid'],
      });

      return profile;

    } catch (err) {
      console.warn(`RedcapService: warning, failed to pull profile: ${err}`);
      return;
    }

  }

  public async signup(uuid: string, recordID?: string): Promise<boolean> {
    // enroll participant and get new record ID, returns 'record id'
    if (!recordID) {
      recordID = await this.getNextRecordName();
    }
    try {
      const profile = new UserProfileModel({
        uuid: uuid,
        recordID: recordID
      });
      await this.pushProfile(profile);
      return true;

    } catch (err) {
      console.error(`RedcapService: failed to signup user: ${err}`);
      return false;
    }
  }

  // ----------------------------------------------------------------
  // REDCap HTTP Request
  // ----------------------------------------------------------------
  // TODO: confirm that'net::ERR_TIMED_OUT' errors are caught
  // see: https://stackoverflow.com/questions/41454020/when-to-dismiss-the-ionic-loading-controller-while-waiting-for-an-observable
  private async httpRequest(http: RedcapRequestModel): Promise<any> {
    // make http request to the redcap server
    if (http.isValid() === false) {
      throw new Error(`HTTP: failed to make http request, invalid http or payload params`);
    }
    // make https request
    try {
      const options: any = {
        method: http.method,
        headers: http.headers,
        body: http.body,
      };
      return await this.http.request(http.method, http.url, options).toPromise();

    } catch (err) {
      let errMsg = (err instanceof Error) ? err.toString() : JSON.stringify(err, null, 2);
      throw new Error(`RedcapService: failed to make http request, execution failed: '${errMsg}'`);
    }
  }

  private async httpImportRequest(filename: string, fileBlob: any, recordID: string, field: string, event: string): Promise<any> {
    // upload file or blob object to redcap
    return;
  }

  public async httpExportRequest(recordID: string, field: string, event: string): Promise<any> {
    // export file from redcap
    return;
  }

  /**
   * HELPER
   */
  private httpHelperIsJsonString(str: string): boolean {
    try {
      JSON.parse(str);

    } catch (err) {
      return false;
    }
    return true;
  }
  private dateToCalDateStr(when: Date) {
    return when.toISOString().slice(0, 10); // M/D
  }

  private dateToCalDate(when: Date): Date {
    return new Date(when.getFullYear(), when.getMonth(), when.getDate(), 0, 0, 0, 0);
  }

} // end 'redcap-service'

//-------------------------------------------------
// this.debugDestroyRedcapRecords().then(() => {
//     console.log('MyApp: Redcap records destroyed: success');
// });
// this.debugDestroyLocalStorage().then(() => {
//     console.log('MyApp: Local storage destroyed: success');
// });

// private async debugDestroyRedcapRecords(): Promise<void> {
//     // reset redcap storage
//     try {
//         await this.storage.ready;
//         await this.redcap.destroyAllRecords();
//         console.log(`MyApp: destroy redcap storage: success`);
//     } catch (err) {
//         throw new Error(`MyApp: failed to reset redcap storage: ${err}`);
//     }
// }
