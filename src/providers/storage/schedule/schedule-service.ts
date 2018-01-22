import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { ScheduleEventModel } from '../../../models/schedule-event-model';
import { SurveyFormModel } from '../../../models/survey-form-model';
import { UserProfileModel } from '../../../models/user-profile-model';
import { ScheduleEventType } from '../../../shared/enums';
import { ProfileService } from '../profile/profile-service';
import { StorageService } from '../storage-service';
import { DAY_MSEC } from '../../../shared/constants';

// tslint:disable:max-line-length
/*
  SchedulerService provider.

  store scheduled events and surveys
  Note: # scheduled events can be << # survey documents
*/

// TODO: add both patient and caregiver UUIDs to show schedules

@Injectable()
export class ScheduleService {

  private readyPromise: Promise<any>;

  constructor(
    private storage: StorageService,
    private profile: ProfileService
  ) {
    // initialize schedule
    // this.readyPromise = this.refreshSchedule();
  }

  /**
   * PROPERTIES
   */
  public get ready(): Promise<boolean> {
    // resolves after storage is ready
    return this.storage.ready;
  }

  /**
   * METHODS
   */
  public async refreshSchedule(): Promise<void> {
    // refresh schedule for 'active' profile
    try {
      const profile = await this.profile.getActiveProfile();
      const scheduledEvents = await this.getAllByProfile(profile);

      // populate default schedule if none are found
      if (!scheduledEvents) {
        const schedule = await this.defaultSchedule(profile);
        await this.storage.update(schedule);
      }

    } catch (err) {
      console.warn(`ScheduleService: warning, failed to initialize schedule: ${err}`);
    }
  }

  private async defaultSchedule(profile: UserProfileModel): Promise<ScheduleEventModel[]> {
    // schedule default survey and reminder events
    let schedule: ScheduleEventModel[] = [];
    try {
      for (let eventDate of profile.eventDates) {
        // survey events
        const dailySurveys = ScheduleEventModel.fromDate(ScheduleEventType.Survey, profile, eventDate);
        // reminder events
        const dailyReminders = ScheduleEventModel.fromDate(ScheduleEventType.Reminder, profile, eventDate);
        schedule = schedule.concat([...dailySurveys, ...dailyReminders]);
      }
      console.log(`ScheduleService: populate schedule: complete`);

    } catch (err) {
      throw new Error(`ScheduleService: failed to populate schedule: ${err}`);
    }
    return schedule;
  }

  /**F
   * DATA ACCESSORS
   */
  public async add(doc: any): Promise<ScheduleEventModel> {
    // add local profile 
    try {
      let addDoc = await this.storage.add(doc);
      return new ScheduleEventModel(addDoc);

    } catch (err) {
      throw new Error(`ScheduleService: failed to add to local storage\n${err}`);
    }
  }

  public async remove(docID: string): Promise<ScheduleEventModel> {
    // remove local profile 
    try {
      let remDoc = await this.storage.remove(docID);
      return new ScheduleEventModel(remDoc);

    } catch (err) {
      throw new Error(`ScheduleService: failed to remove from local storage\n${err}`);
    }
  }

  public async update(doc: ScheduleEventModel): Promise<ScheduleEventModel> {
    // update local profile 
    try {
      let resDoc = await this.storage.update(doc);
      return new ScheduleEventModel(resDoc);

    } catch (err) {
      throw new Error(`ScheduleService: failed to update local storage\n${err}`);
    }
  }

  public async updateFromSurvey(survey: SurveyFormModel): Promise<ScheduleEventModel> {
    // update survey completion status
    const docID = ScheduleEventModel.docID(
      survey.uuid,
      ScheduleEventType.Survey,
      survey.formName,
      survey.eventDate
    );
    if (await this.storage.exists(docID)) {
      let scheduleEvent = new ScheduleEventModel(await this.storage.get(docID));

      // skip if survey is already completed
      const isSurveyComplete = (scheduleEvent.isComplete === survey.isComplete);
      if (isSurveyComplete) { return; }

      // store updated completion status
      scheduleEvent.isComplete = survey.isComplete;
      const doc = await this.storage.update(scheduleEvent);

      return new ScheduleEventModel(doc);
    }
  }

  public async get(docID: string): Promise<ScheduleEventModel> {
    // get local profile 
    await this.ready;
    try {
      let getDoc = await this.storage.get(docID);
      return new ScheduleEventModel(getDoc);

    } catch (err) {
      throw new Error(`ScheduleService: failed to get from local storage\n${err}`);
    }
  }

  public async getTodayEvents(): Promise<ScheduleEventModel[]> {
    // get scheduled documents for the current date 
    await this.ready;

    let todayList: ScheduleEventModel[];
    try {
      // filter scheduled events by type
      const currDate = new Date();
      const eventList = await this.getAllByDate(currDate);
      if (!eventList) {
        throw `no surveys found on '${currDate.toISOString()}'`;
      }
      todayList = eventList
        .filter((event: any) => event.eventType === ScheduleEventType.Survey);
      if (todayList.length === 0) { return; }

    } catch (err) {
      throw new Error(`ScheduleService: failed to list 'todays' surveys: ${err}`);
    }

    return todayList;
  }

  public async getIncompleteEvents(): Promise<ScheduleEventModel[]> {
    // get incomplete surveys to current date
    await this.ready;

    let incompleteList: ScheduleEventModel[];
    try {
      const currDate = new Date();
      const prevDate = new Date(currDate.getTime() - DAY_MSEC);
      const eventList = await this.getAllUntilDate(prevDate);
      if (!eventList) {
        throw `no surveys found between '${currDate.toISOString()}' and '${prevDate.toISOString()}'`;
      }
      // filter scheduled events by type and complete status
      incompleteList = eventList
        .filter((event: ScheduleEventModel) => event.eventType === ScheduleEventType.Survey)
        .filter((event: ScheduleEventModel) => event.isComplete === false);
      if (incompleteList.length === 0) { return; }

    } catch (err) {
      console.error(`ChecklistPage: failed to list 'incomplete' surveys: ${err}`);
    }

    return incompleteList;
  }

  public async getAllByProfile(profile: UserProfileModel): Promise<ScheduleEventModel[]> {
    // get all schedule documents for a given profile
    try {
      if (!profile) { throw `missing profile argument`; }

      // get all schedules in database
      let queryDocs = await this.storage.getByCollection('schedule');
      if (!queryDocs) {
        console.warn(`ScheduleService: warning, no scheduled found in database`);
        return;
      }

      // filter documents by profile uuid
      queryDocs = queryDocs
        .filter((doc: any) => doc.uuid === profile.uuid)
        .map((doc: any) => new ScheduleEventModel(doc));
      if (queryDocs.length === 0) {
        console.warn(`ScheduleService: warning, no scheduled found for profile`);
        return;
      }

      // success, return array of schedule form models
      return queryDocs;

    } catch (err) {
      console.error(`ScheduleService: failed to get all scheduled profile events: ${err}`);
    }
  }

  public async getAllByDate(when: Date, scheduleEventType?: ScheduleEventType): Promise<ScheduleEventModel[]> {
    // get schedule events for a given profile by date and type
    try {
      // get schedule events by date
      const profile = await this.profile.getActiveProfile();
      let eventDocs = await this.storage.getByEventDay('schedule', when);
      if (!eventDocs) { throw `no events found on ${when.toISOString()}`; }

      // filter events by profile
      eventDocs = eventDocs.filter((doc: any) => doc.uuid === profile.uuid);
      if (!eventDocs) { throw `no events found for profile ${profile.email} on ${when.toISOString()}`; }

      // filter events by event type (optional)
      if (scheduleEventType) {
        eventDocs = eventDocs.filter((doc: any) => doc.eventType === ScheduleEventType.Reminder);
        if (!eventDocs) { throw `no events found for profile ${profile.email} on ${when.toISOString()} of type ${scheduleEventType}`; }
      }
      eventDocs = eventDocs.map((doc: any) => new ScheduleEventModel(doc));

      return eventDocs;

    } catch (err) {
      throw new Error(`ScheduleService: failed to get all by date, unable to query by 'event_day': ${err}`);
    }
  }

  public async getAllUntilDate(when: Date): Promise<ScheduleEventModel[]> {
    // get survey form fields until date
    try {
      const profile = await this.profile.getActiveProfile();

      const eventDocs = await this.getAllByProfile(profile);
      if (!eventDocs) { throw `no scheduled events found`; }

      let eventList = eventDocs.map((doc: any) => new ScheduleEventModel(doc));
      eventList = eventList.filter((x: ScheduleEventModel) => x.uuid === profile.uuid);
      eventList = eventList.filter((x: ScheduleEventModel) => x.eventDate < when);

      // success, return array of schedule form models
      return eventList;

    } catch (err) {
      console.error(`ScheduleService: failed to get query 'event_day': ${err}`);
    }
  }

  private async destroy() {
    // remove all surveys from database
    await this.storage.ready;

    try {
      let scheduleDocs = await this.storage.getByCollection('schedule');
      for (let scheduleDoc of scheduleDocs) {
        this.storage.remove(scheduleDoc._id);
      }
    } catch (err) {
      throw new Error(`ScheduleService: failed to remove all schedule docs: ${err}`);
    }
    console.log('ScheduleService: destroy all schedule docs: complete');
  }

}

//--------------------------------------------------------------

  // public async updateEventCompletionStatus(): Promise<void> {
  //   // update scheduled event completion given local storage (i.e. survey->isComplete)
  //   await this.ready;

  //   // search for each event in database
  //   const events = await this.getAll();
  //   for (let event of events) {
  //     try {
  //       // update completion status if changed
  //       if (event.eventType === ScheduleEventType.Survey) {

  //         let docID = SurveyFormModel.docID(
  //           profile.uuid,
  //           event.eventName,
  //           event.eventDate);

  //         if (await this.storage.exists(docID)) {

  //           const survey = new SurveyFormModel(await this.storage.get(docID));
  //           event.isComplete = survey.isComplete;

  //           await this.storage.update(event);
  //         }

  //       }
  //     } catch (err) {
  //       console.warn(`ScheduleService: warning, failed to update survey completion status: ${err}`);
  //     }
  //   } // end - foreach events
  // }

//--------------------------------------------------------------

// if (!isScheduleStorageEmpty) {
//   const scheduleDocs = await this.storage.getByCollection('schedule');
//   for (const doc of scheduleDocs) {
//     console.log(doc);
//   }
// }

//--------------------------------------------------------------

  // public async isEmpty(): Promise<boolean> {
  //   // checks if schedule storage is empty

  //   const isStorageEmpty: boolean = await this.storage.isEmpty();
  //   if (isStorageEmpty) { return true; }

  //   const docs = await this.storage.getByCollection('schedule');
  //   return (docs.length > 0) ? true : false;
  // }

//--------------------------------------------------------------

  // const docs = await this.storage.getByCollection('schedule');
  // const events = docs.map((doc: any) => new ScheduleEventModel(doc));

  // this.surveyEvents = events.filter((event: ScheduleEventModel) => event.eventType === ScheduleEventTypes.Survey);
  // this.reminderEvents = events.filter((event: ScheduleEventModel) => event.eventType === ScheduleEventTypes.Reminder);

  // const surveyDocs = await this.storage.getByCollection('survey');
  // const scheduleDocs = await this.getAll();

//--------------------------------------------------------------

  // /**
  //  * PROPERTIES
  //  */
  // public get surveyEvents(): Promise<ScheduleEventModel[]> {
  //   // scheduled survey events
  //   return (async () => {
  //     const events = await this.storage.getAll();
  //     const surveyEvents = events.filter((event: ScheduleEventModel) => event.eventType === ScheduleEventTypes.Survey);

  //     return surveyEvents;
  //   })();
  // }

  // public get reminderEvents(): Promise<ScheduleEventModel[]> {
  //   // scheduled reminder events
  //   return (async () => {
  //     const events = await this.getAll();
  //     const reminderEvents = events.filter((event: ScheduleEventModel) => event.eventType === ScheduleEventTypes.Reminder);

  //     return reminderEvents;
  //   })();
  // }
