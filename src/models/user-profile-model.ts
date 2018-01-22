import { DAY_MSEC, HOUR_MSEC, NUM_EVENT_DATES } from '../shared/constants';
import { GoalType, StudyConditionType, UserRoleType } from '../shared/enums';
import { UserBaseModel } from './user-base-model';
import { SurveyFormModel } from './survey-form-model';
import { SurveyFieldModel } from './survey-field-model';

/**
 * User Profile Model - user-profile-service-model.ts
 *
 * Model that interacts with database for user profile data
 */
export class UserProfileModel extends UserBaseModel {

  // class properties
  // document ID: [uuid]/[collectionName]
  // auth
  public email: string;
  public password: string;
  public idToken: string;
  public refreshToken: string;
  public mgmtIDToken: string;

  // fitbit
  public fitbitAccessToken: string;
  public fitbitRefreshToken: string;
  public fitbitUserID: string;

  // user
  public firstName: string;
  public lastName: string;
  public phoneNumber: string;
  public photoURL: string;
  public userRole: UserRoleType;

  // family
  public familyID: string;
  public familyProfiles: UserProfileModel[];

  // redcap
  public recordID: string;

  // profile
  public isActiveProfile: boolean;
  public enrollDate: Date;
  private enrollDateStr: string;
  public lastEventDate: Date;
  private lastEventDateStr: string;

  // study condition
  public studyCondition: StudyConditionType;
  public goalSelection: GoalType;

  // properties
  public numEventDates: number;
  public numDaysEnrolled: number;


  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override base fields
    this.defineField('_id', {
      type: 'String',
      get(): string {
        if (this.owner.uuid) {
          return [this.owner.uuid, this.owner.collectionName].join('/');
        }
      }
    });
    this.defineField('collectionName', {
      type: 'String',
      defaultValue: 'profile'
    });

    // field definitions for class properties
    //auth
    this.defineField('email', { type: 'String' });
    this.defineField('password', { type: 'String' });
    this.defineField('idToken', { type: 'String' });
    this.defineField('refreshToken', { type: 'String' });
    this.defineField('mgmtIDToken', { type: 'String' });
    //fitbit
    this.defineField('fitbitAccessToken', { type: 'String' });
    this.defineField('fitbitRefreshToken', { type: 'String' });
    this.defineField('fitbitUserID', { type: 'String' });
    // user
    this.defineField('firstName', { type: 'String' });
    this.defineField('lastName', { type: 'String' });
    this.defineField('phoneNumber', { type: 'String' });
    this.defineField('photoURL', { type: 'String' });
    this.defineField('userRole', { type: UserRoleType });
    // family
    this.defineField('familyID');
    this.defineField('familyProfiles', {
      type: [UserProfileModel],
      defaultValue: []
    });
    //redcap
    this.defineField('recordID', { type: 'String' });
    // profile
    this.defineField('isActiveProfile', {
      type: 'Boolean',
      defaultValue: false
    });
    this.defineField('enrollDate', {
      type: 'Date',
      get(): Date {
        if (this.owner.enrollDateStr) {
          return new Date(this.owner.enrollDateStr);
        }
      },
      set(date: Date) {
        // TODO: make 'lastEventDate' a property  
        if (date) {
          // set properties based on enroll date
          this.isEnrolled = true;
          this.owner.enrollDateStr = date.toISOString();
          this.owner.lastEventDateStr = new Date(date.getTime() + NUM_EVENT_DATES * DAY_MSEC).toISOString();
        }
      },
    });
    this.defineField('enrollDateStr', { type: 'String' });
    this.defineField('lastEventDate', {
      type: 'Date',
      get(): Date {
        if (this.owner.lastEventDateStr) {
          return new Date(this.owner.lastEventDateStr);
        }
      },
    });
    this.defineField('lastEventDateStr', { type: 'String' });

    // study condition
    this.defineField('studyCondition', { type: 'Any', defaultValue: StudyConditionType.Baseline });
    this.defineField('goalSelection', { type: 'Any' });

    // properties
    this.defineField('numEventDates', {
      type: 'Number',
      defaultValue: NUM_EVENT_DATES, //days
    });
    this.defineField('numDaysEnrolled', {
      type: 'Number',
      get(): number {
        // get # days enrolled
        // compute days since enrollment, where event days start on 'day 1'
        if (!this.isEnrolled) { return 0; }

        let currDateMsec = new Date().getTime();
        let enrollDateMsec = new Date(this.owner.enrollDate).getTime();

        return Math.round(Math.abs(currDateMsec - enrollDateMsec) / DAY_MSEC);
      }
    });

    // populate document and commit changes
    this.populate(data);
  }

  /**
  * PROPERTIES
  */
  public get isEnrolled(): boolean {
    // get enrollment status
    return (this.enrollDate) ? true : false;
  }
  public get eventDates(): Date[] {
    // get all study days, 30 days starting from enrollment
    if (!this.enrollDate) { return []; }

    const studyDates = new Array<Date>(NUM_EVENT_DATES);
    const enrollDateMsec = this.enrollDate.getTime();

    // TODO: should we use another function to get local time?
    for (let i = 0; i < this.numEventDates; i++) {
      studyDates[i] = new Date(enrollDateMsec + i * DAY_MSEC);
      if (this.dateIsDST()) {
        studyDates[i] = new Date(studyDates[i].getTime() + HOUR_MSEC);
      }
    }
    return studyDates;
  }

  public eventNameFromDate(when: Date): string {
    // get event date number since enrollment (e.g. first event is 'day_1_arm2')
    // TODO: URGENT - check that correct event date is submitted (e.g. day_1_arm2 on startup)
    if (!this.enrollDate) { return; }
    const eventDayIndex = this.dateNumDaysBtwn(this.enrollDate, when) + 1;
    return `day_${eventDayIndex}_arm_2`;
  }

  private dateIsDST(): boolean {
    return new Date().getTimezoneOffset() < this.dateStdTimezoneOffset();
  }

  private dateStdTimezoneOffset() {
    let jan = new Date(new Date().getFullYear(), 0, 1);
    let jul = new Date(new Date().getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }

  private dateNumDaysBtwn(firstDate: Date, secondDate: Date): number {
    // compute number of days between dates
    if (!firstDate || !secondDate) {
      throw new Error(`UserProfileModel: failed to calculate days between dates: missing arguments`);
    }
    const diffMsec = Math.abs(firstDate.getTime() - secondDate.getTime());
    return Math.round(diffMsec / DAY_MSEC);
  }

  /**
   * STATIC METHODS
   */
  public static docID(uuid: string): string {
    // shortcut for creating docID
    if (!uuid) {
      console.warn(`UserProfileModel: warning, failed to create docID, \
      missing arguments: uuid: ${uuid}`);
    }
    return [uuid, 'profile'].join('/');
  }

  public static fromEnrollSurveyFields(survey: SurveyFormModel): UserProfileModel {
    // extract data from survey fields
    let profile = new UserProfileModel();
    profile.uuid = survey.uuid;
    profile.eventDate = survey.eventDate;
    profile.submitDate = survey.submitDate;

    // assign profile data from survey fields
    for (let field of survey.formFields) {
      switch (field.fieldName) {
        case 'record_id': profile.recordID = field.fieldResponse; break;
        case 'first_name': profile.firstName = field.fieldResponse; break;
        case 'last_name': profile.lastName = field.fieldResponse; break;
        case 'phone_number': profile.phoneNumber = field.fieldResponse; break;
        case 'user_role': profile.userRole = UserRoleType[field.fieldResponse]; break;
        case 'family_id': profile.familyID = field.fieldResponse; break;
        default: break;
      }
    }
    return profile;
  }

}

