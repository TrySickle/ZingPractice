import { UserDataType, DataSourceType } from './../shared/enums';
import { UserBaseModel } from './user-base-model';

// tslint:disable:max-line-length
/**
 * User Data Model - user-data-model.ts
 *
 * Model that interacts with database as a base class for specific user-data-service models
 */

export class UserDataModel extends UserBaseModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[dataType]/[eventDate]
  // data
  public dataType: UserDataType;      // e.g. 'sleep'
  public dataSource: DataSourceType;  // e.g. 'fitbit'
  public startTime: Date;
  private startTimeStr: string;
  public durationMsec: number;
  public reportID: number;
  public eventSpan: number;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override base fields
    this.defineField('_id', {
      type: 'String',
      get(value) {
        if (!this.owner.uuid || !this.owner.dataType || !this.owner.eventDate) {
          throw new Error(`UserDataModel: failed to get '_id' property, missing arguments: \
          uuid: ${this.owner.uuid}, dataType: ${this.owner.dataType}, eventDate: ${this.owner.eventDate}`);
        }
        return UserDataModel.docID(
          this.owner.uuid,
          this.owner.collectionName,
          this.owner.dataType,
          this.owner.eventDate);
      }
    });
    this.defineField('collectionName', {
      type: 'String',
      defaultValue: 'data',
    });

    // field definitions for class properties
    // data
    this.defineField('dataType', { type: 'String' });
    this.defineField('dataSource', {
      type: DataSourceType,
      defaultValue: DataSourceType.Self,
    });
    this.defineField('startTime', {
      type: 'Date',
      get(): Date {
        if (this.owner.startTimeStr) {
          return new Date(this.owner.startTimeStr);
        }
        else {
          return null;
        }
      },
      set(date: Date) {
        if (date) {
          this.owner.startTimeStr = date.toISOString();
        }
      },
    });
    this.defineField('startTimeStr', { type: 'String' });
    this.defineField('durationMsec', { type: 'Number', defaultValue: 0 });
    this.defineField('reportID', { type: 'Integer', defaultValue: 1 });
    this.defineField('eventSpan', { type: 'Number' });

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static docID(uuid: string, collectionName: string, type: UserDataType, eventDate: Date): string {
    // shortcut for creating docID
    if (!uuid || !collectionName || !type || !eventDate) {
      throw new Error(`UserDataModel: failed to create docID, missing arguments: \
      uuid: ${uuid}, collectionName: ${collectionName}, type: ${type}, eventDate: ${eventDate}`);
    }
    return [uuid, collectionName, type, eventDate.toISOString()].join('/');
  }
}
