

import { DAY_MSEC } from '../shared/constants';
import { ScheduleEventType, UserRoleType } from './../shared/enums';
import { UserBaseModel } from './user-base-model';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { UserProfileModel } from './user-profile-model';


// tslint:disable:max-line-length
/**
 * Schedule Event Model - schedule-event-model.ts
 *
 * Model that interacts with database for scheduled events
 */

export class ScheduleEventModel extends UserBaseModel {

    // class properties
    // document ID: [uuid]/[collectionName]/[eventType]/[eventName]/[eventDate]
    public eventType: ScheduleEventType;   // e.g. 'survey' or 'reminder'
    public eventName: string;               // e.g. 'morning_survey_patient' or 'fitbit'
    public eventLabel: string;               // e.g. 'Morning Survey Patient'

    public timeUntilEventMsec: number;
    public repeatTimeFromEventMsec: number;

    public isComplete: boolean;

    public source: Observable<any>;
    public subscribe: Subscription;

    public constructor(data?: any) {

        if (!data) { data = {}; }
        super(data);

        // override base fields
        this.defineField('_id', {
            type: 'String',
            get(value) {
                return ScheduleEventModel.docID(
                    this.owner.uuid,
                    this.owner.eventType,
                    this.owner.eventName,
                    this.owner.eventDate);
            }
        });
        this.defineField('collectionName', {
            type: 'String',
            defaultValue: 'schedule',
        });

        // field definitions for class properties
        this.defineField('eventType', { type: ScheduleEventType });
        this.defineField('eventName', { type: 'String' });
        this.defineField('eventLabel', { type: 'String' });
        this.defineField('timeUntilEventMsec', {
            type: 'Number',
            get(): number {
                // time until event in msec, zero if past due
                if (this.owner.eventDate) {
                    const currDateMsec = new Date().getTime();
                    const eventTimeMsec = this.owner.eventDate.getTime();
                    const timeOffsetMsec = eventTimeMsec - currDateMsec;
                    if (timeOffsetMsec > 0) {
                        return timeOffsetMsec;
                    }
                }
                return 0;
            }
        });
        this.defineField('repeatTimeFromEventMsec', {
            type: 'Number',
            defaultValue: 1 * DAY_MSEC,
        });

        this.defineField('isComplete', { type: 'Boolean', defaultValue: false });

        this.defineField('source', { type: 'Any' });
        this.defineField('subscribe', { type: 'Any' });

        // populate document and commit changes
        this.populate(data);
    }

    /**
    * STATIC METHODS
    */
    public static docID(uuid: string, eventType: ScheduleEventType, eventName: string, eventDate: Date): string {
        // shortcut for generating docID
        if (!uuid || !eventType || !eventName || !eventDate) {
            throw new Error(`ScheduleEventModel: failed to create docID, missing arguments: \
            uuid: ${uuid}, eventType: ${eventType}, eventName: ${eventName}, eventDate: ${eventDate}`);
        }
        return [uuid, 'schedule', eventType, eventName, eventDate.toISOString()].join('/');
    }

    public static fromDate(eventType: ScheduleEventType, profile: UserProfileModel, when: Date): ScheduleEventModel[] {
        // get survey schedule for a given date
        let scheduledEvents: ScheduleEventModel[];
        try {
            const uuid = profile.uuid;
            const userRole = profile.userRole;
            const userRoleLabel: string = ScheduleEventModel.capitalizeFirstLetter(userRole.toLowerCase());
            const enrollDate = profile.enrollDate;

            if (!when || !uuid || !userRole || !enrollDate) {
                throw new Error(ScheduleEventModel.missingFieldsWarning(`failed to get 'surveys' by date, profile`,
                    ['uuid', 'userRole', 'enrollDate'], [uuid, userRole, enrollDate])
                );
            }
            const eventDateMsec = when.setHours(0, 0, 0, 0);
            const enrollDateMsec = enrollDate.setHours(0, 0, 0, 0);

            // morning survey
            scheduledEvents = [];
            scheduledEvents.push(new ScheduleEventModel({
                uuid: uuid,
                eventName: `morning_survey_${userRole.toLowerCase()}`,
                eventLabel: `Morning Survey ${userRoleLabel}`,
                eventDate: new Date(when),
                eventType: eventType,
            }));

            // weekly survey
            let isSat: boolean = (when.getDay() === 6);
            if (isSat) {
                scheduledEvents.push(new ScheduleEventModel({
                    uuid: uuid,
                    eventName: `weekly_survey_${userRole.toLowerCase()}`,
                    eventLabel: `Weekly Survey ${userRoleLabel}`,
                    eventDate: new Date(when),
                    eventType: eventType,
                }));
            }

            // intake survey
            let isStudyIntakeDay = (eventDateMsec === enrollDateMsec);
            if (isStudyIntakeDay) {
                scheduledEvents.push(new ScheduleEventModel({
                    uuid: uuid,
                    eventName: `intake_survey_${userRole.toLowerCase()}`,
                    eventLabel: `Intake Survey ${userRoleLabel}`,
                    eventDate: new Date(when),
                    eventType: eventType,
                }));
                if (userRole === UserRoleType.Patient) {
                    scheduledEvents.push(new ScheduleEventModel({
                        uuid: uuid,
                        eventName: `pam_survey_patient`,
                        eventLabel: `PAM Survey Patient`,
                        eventDate: new Date(when),
                        eventType: eventType,
                    }));
                }
            }

            // exit survey
            let lastStudyDateMsec = eventDateMsec + 30 * DAY_MSEC;
            let isStudyExitDay = (eventDateMsec === lastStudyDateMsec);
            if (isStudyExitDay) {
                scheduledEvents.push(new ScheduleEventModel({
                    uuid: uuid,
                    eventName: `exit_survey_${userRole.toLowerCase()}`,
                    eventLabel: `Exit Survey ${userRoleLabel}`,
                    eventDate: new Date(when),
                    eventType: eventType,
                }));
            }

        } catch (err) {
            throw new Error(`ScheduleEventModel: failed to create events from date: ${err}`);
        }
        return scheduledEvents;
    }

    /**
   * HELPER
   */
    private static capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private static missingFieldsWarning(message: string, fieldNames: any[], fieldValues: any[]): string {
        // print missing fields for error messages
        let missingFields = '';
        for (let i = 0; i < fieldValues.length; i++) {
            if (!fieldValues[i]) {
                missingFields += `${fieldNames[i]}: ${fieldValues[i]}, `;
            }
        }
        // remove trailing ', '
        if (missingFields.length) {
            missingFields = missingFields.slice(0, missingFields.length - 2);
        }
        return `Schedule: warning, ${message}, missing fields: ${missingFields}`;
    }

}


//---------------------------------

// public intervalMsec: number;
// public source: Observable<any>;   // e.g. 'notifySurveyReminder' promise
// public subscribe: Subscription;    // used to subscribe / unsubscribe

// this.defineField('intervalMsec', { type: 'Number' });
// this.defineField('observable', { type: Observable });
// this.defineField('subscribe', { type: Subscription });
