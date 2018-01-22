import { DataSourceType } from './../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';
import { UserDeviceModel } from './user-device-model';

/**
 * Fitbit Model - fitbit-model.ts
 *
 * Model that interacts with database for fitbit data
 */
export class FitbitModel extends UserDeviceModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override collection type
    this.defineField('dataSource', {
      type: 'String',
      defaultValue: DataSourceType.Fitbit
    });

    // field definitions for class properties
    this.defineField('bedTime', {
      type: 'Date',
      set(value: Date) {
        this.owner.startTime = value;
        return value;
      }
    });
    this.defineField('wakeTime', {
      type: 'Date',
      set(value: Date) {
        if (this.owner.bedTime) {
          this.owner.durationMsec = value.getTime() - this.owner.bedTime.getTime();
        }
        return value;
      }
    });
    // this.defineField('sleepQuality');
    // this.defineField('wakeTime');
    // this.defineField('minutesToFallAsleep');
    // this.defineField('minutesAsleep');
    // this.defineField('minutesAwake');
    // this.defineField('minutesAfterWakeup');
    // this.defineField('awakeningsCount');
    // this.defineField('awakeCount');
    // this.defineField('awakeDuration');
    // this.defineField('restlessCount');
    // this.defineField('restlessDuration');
    // this.defineField('timeInBed');
    // this.defineField('minuteData');

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */

}

