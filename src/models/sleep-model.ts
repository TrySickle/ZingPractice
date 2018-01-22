import { UserDataType, DataSourceType } from '../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';

/**
 * Sleep Model - sleep-model.ts
 *
 * Model that interacts with database for sleep data
 *
 * minutesToFallAsleep -
 * minutesAsleep -
 * minutesAwake -
 * minutesAfterWakeup -
 * awakeningsCount -
 * awakeCount -
 * awakeDuration -
 * restlessCount -
 * restlessDuration -
 * timeInBed -
 * minuteData - array, e.g. [{ dateTime: 00: 00: 00, value: 3 },...]
 */
export class SleepModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public bedTime: Date;
  public wakeTime: Date;
  public wakeTimeStr: string;
  public sleepQuality: number;
  public minutesToFallAsleep: number;
  public minutesAsleep: number;
  public minutesAwake: number;
  public minutesAfterWakeup: number;
  public awakeningsCount: number;
  public awakeCount: number;
  public awakeDuration: number;
  public restlessCount: number;
  public restlessDuration: number;
  public timeInBed: number;
  public minuteData: number;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override collection type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Sleep });

    // field definitions for class properties
    this.defineField('bedTime', {
      type: 'Date',
      get(): Date {
        return this.owner.startTime;
      },
      set(date: Date) {
        this.owner.startTime = date;
      },
    });
    this.defineField('wakeTime', {
      type: 'Date',
      get(): Date {
        if (this.owner.startTime) {
          return new Date(this.owner.startTime.getTime() + this.owner.durationMsec);
        }
      },
      set(date: Date) {
        this.owner.durationMsec = date.getTime() - this.owner.bedTime.getTime();
      },
    });
    this.defineField('sleepQuality', { type: 'Number' });
    this.defineField('wakeTime', { type: 'Number' });
    this.defineField('minutesToFallAsleep', { type: 'Number' });
    this.defineField('minutesAsleep', { type: 'Number' });
    this.defineField('minutesAwake', { type: 'Number' });
    this.defineField('minutesAfterWakeup', { type: 'Number' });
    this.defineField('awakeningsCount', { type: 'Number' });
    this.defineField('awakeCount', { type: 'Number' });
    this.defineField('awakeDuration', { type: 'Number' });
    this.defineField('restlessCount', { type: 'Number' });
    this.defineField('restlessDuration', { type: 'Number' });
    this.defineField('timeInBed', { type: 'Number' });
    this.defineField('minuteData', { type: 'Number' });

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static fromSurveyFields(survey: SurveyFormModel): SleepModel {
    // extract data from survey fields

    // check if contains one  or more items list
    const fieldNames = survey.formFields
      .map((field: SurveyFieldModel) => field.fieldName);

    let findOne: boolean = [
      'pmorning_bedtime',
      'cmorning_bedtime',
      'pmorning_waketime',
      'cmorning_waketime',
      'pmorning_sleepquality',
      'cmorning_sleepquality']
      .some(r => fieldNames.includes(r));

    // skip if no fields are found
    if (!findOne) { return; }

    // assign fields to sleep model
    let surveyBaseModel = new UserBaseModel(survey);

    let sleep = new SleepModel(surveyBaseModel);
    sleep.collectionName = 'data';
    sleep.dataType = UserDataType.Sleep;

    const eventDateISO = survey.eventDate.toISOString();  // e.g. "2011-10-10T14:48:00"
    const eventDateStr = eventDateISO.slice(0, 10);       // e.g. "2011-10-10"

    const fields = survey.formFields;
    for (let field of fields) {
      if (field.fieldName === 'pmorning_bedtime' || field.fieldName === 'cmorning_bedtime') {
        const bedTime = new Date(`${eventDateStr}T${field.fieldResponse}`);
        sleep.startTime = bedTime;
        sleep.bedTime = bedTime;
      }
      else if (field.fieldName === 'pmorning_waketime' || field.fieldName === 'cmorning_waketime') {
        sleep.wakeTime = new Date(`${eventDateStr}T${field.fieldResponse}`);
      }
      else if (field.fieldName === 'pmorning_sleepquality' || field.fieldName === 'cmorning_sleepquality') {
        sleep.sleepQuality = Number.parseInt(field.fieldResponse);
      }
    }
    if (sleep.bedTime && sleep.wakeTime) {
      sleep.durationMsec = sleep.wakeTime.getTime() - sleep.bedTime.getTime();
    }

    return sleep;
  }

  public static fromFitbitFields(uuid: string, eventDate: Date, bedTime: Date, durationMsec: string): SleepModel {
    // extract data from survey fields
    return new SleepModel({
      uuid: uuid,
      eventDate: eventDate,
      dataSource: DataSourceType.Fitbit,
      bedTime: bedTime,
      durationMsec: durationMsec,
    });
  }


}

