import { Model } from 'rawmodel';
import { DataSourceType } from '../shared/enums';

/**
 * User Data Model - user-data-model.ts
 *
 * Model that interacts with database as a base class for all user models
 */

// TODO: use docURI instead of 'docID' function in model, see: https://github.com/jo/docuri

export class UserBaseModel extends Model {

  // class properties
  public _id: string;
  public collectionName: string;
  public uuid: string;

  // dates
  public eventDate: Date;
  private eventDateStr: string;
  public eventDateYear: string;
  public eventDateMonth: string;
  public eventDateDay: string;
  public submitDate: Date;
  private submitDateStr: string;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // field definitions for class properties
    this.defineField('_id', {
      type: 'String',
      defaultValue: new Date().toISOString(),
      validate: [{
        validator: 'presence',
        message: '%{it} must be present',
        it: 'it'
      }]
    });
    this.defineField('collectionName', {
      type: 'String',
      validate: [{
        validator: 'presence',
        message: '%{it} must be present',
        it: 'it'
      }]
    });
    this.defineField('uuid', {
      type: 'String',
      defaultValue: undefined,
      validate: [{
        validator: 'stringLength',
        min: '4',
        message: '%{it} must be at least 4 characters long',
        it: 'it'
      }]
    });
    this.defineField('eventDate', {
      type: 'Date',
      get(): Date {
        return (this.owner.eventDateStr) ? new Date(this.owner.eventDateStr) : null;
      },
      set(date: Date) {
        const eventDateStr = UserBaseModel.dateToISOString(date);
        if (eventDateStr) {
          this.owner.eventDateStr = eventDateStr;
        }
      },
      validate: [{
        validator: 'presence',
        message: '%{it} must be present',
        it: 'it'
      }]
    });
    this.defineField('eventDateStr', { type: 'String' });
    this.defineField('eventDateYear', {
      type: 'Integer',
      get() {
        return (this.owner.eventDate) ? this.owner.eventDate.getFullYear() : null;
      }
    });
    this.defineField('eventDateMonth', {
      type: 'Integer',
      get() {
        return (this.owner.eventDate) ? this.owner.eventDate.getMonth() : null;
      }
    });
    this.defineField('eventDateDay', {
      type: 'Integer',
      get(value) {
        return (this.owner.eventDate) ? this.owner.eventDate.getDate() : null;
      }
    });
    this.defineField('submitDate', {
      type: 'Date',
      get(): Date {
        return (this.owner.submitDateStr) ? new Date(this.owner.submitDateStr) : null;
      },
      set(date: Date) {
        const submitDateStr = UserBaseModel.dateToISOString(date);
        if (submitDateStr) {
          this.owner.submitDateStr = submitDateStr;
        }
      },
      validate: [{
        validator: 'presence',
        message: '%{it} must be present',
        it: 'it'
      }]
    });
    this.defineField('submitDateStr', { type: 'String' });

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  private static dateToISOString(when: Date): string {
    // create date string from date with type checking
    if (when) {
      if (when instanceof String) {
        when = new Date(when);
      }
      if (when instanceof Date) {
        return when.toISOString();
      }
    }
  }

}
