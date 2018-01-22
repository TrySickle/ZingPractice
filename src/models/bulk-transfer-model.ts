import { ScheduleEventModel } from './schedule-event-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';
import { UserProfileModel } from './user-profile-model';
import { DAY_MSEC, HOUR_MSEC, MIN_MSEC, SEC_MSEC } from '../shared/constants';

/**
 * Bulk Transfer Model - build-transfer-model.ts
 *
 * Model that interacts with database for bulk daily uploads/downloads
 */
export class BulkDataModel extends UserBaseModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[eventDate]
  public reports: UserDataModel[];
  public surveys: SurveyFormModel[];
  public schedules: ScheduleEventModel[];
  public profile: UserProfileModel;
  public lastUpdate: Date;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override base fields
    this.defineField('_id', {
      type: 'String',
      get(value) {
        if (!this.owner.uuid || !this.owner.eventDate) {
          throw new Error(`BulkTransferModel: failed to create docID, missing arguments: \
          uuid: ${this.owner.uuid}, eventDate: ${this.owner.eventDate}`);
        }
        const docID = [this.owner.uuid,
        this.owner.collectionName,
        this.owner.eventDate.toISOString()];
        return docID.join('/');
      }
    });
    this.defineField('collectionName', {
      type: 'String',
      defaultValue: 'bulk'
    });

    // field definitions for class properties
    this.defineField('reports', { type: [UserDataModel] });
    this.defineField('surveys', { type: [SurveyFormModel] });
    this.defineField('schedules', { type: [ScheduleEventModel] });
    this.defineField('profile', { type: UserProfileModel });
    this.defineField('lastUpdate', { type: 'Date' });
    this.defineField('lastUpdateMessage', {
      type: 'Date',
      get(): string {
        // create string to show # mins or days since last sync
        if (!this.owner.lastUpdate) {
          return `Local storage has not been synchronized`;
        }
        const currDateMsec = new Date().getTime();
        const lastSyncDateMsec = this.owner.lastUpdate.getTime();
        const elapsedMsec = currDateMsec - lastSyncDateMsec;

        if (elapsedMsec > DAY_MSEC) {
          return `${Math.floor(elapsedMsec / DAY_MSEC)} days ago`;
        }
        else if (elapsedMsec > HOUR_MSEC) {
          return `${Math.floor(elapsedMsec / HOUR_MSEC)} hours ago`;
        }
        else if (elapsedMsec > MIN_MSEC) {
          return `${Math.floor(elapsedMsec / MIN_MSEC)} minutes ago`;
        }
        else {
          return `${Math.floor(elapsedMsec / SEC_MSEC)} seconds ago`;
        }
      }
    });

    // populate document and commit changes
    this.populate(data);
  }

}

