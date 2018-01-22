import { DeviceType } from '../shared/enums';
import { UserBaseModel } from './user-base-model';


// tslint:disable:max-line-length
/**
 * User Device Model - user-device-service-model.ts
 *
 * Model that interacts with database for user device data
 */
export class UserDeviceModel extends UserBaseModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[deviceType]/[eventDate]
  public name: string;      // e.g. "TI SensorTag",
  public id: string;        // e.g. "BD922605-1B07-4D55-8D09-B66653E51BBA"
  public rssi: number;          // e.g. -79,
  public advertising: any[];    // ArrayBuffer or map
  public deviceType: UserDeviceModel;
  public isConnected: boolean;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override base fields
    this.defineField('_id', {
      type: 'String',
      get(value) {
        return UserDeviceModel.docID(
          this.owner.uuid,
          this.owner.deviceType,
          this.owner.eventDate);
      }
    });
    this.defineField('collectionName', {
      type: 'String',
      defaultValue: 'device'
    });

    // field definitions for class properties
    this.defineField('name');
    this.defineField('id');
    this.defineField('rssi');
    this.defineField('advertising');
    this.defineField('deviceType');
    this.defineField('isConnected');

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static docID(uuid: string, deviceType: DeviceType, eventDate: Date): string {
    // shortcut for creating docID
    if (!uuid || !deviceType || !eventDate) {
      throw new Error(`UserDeviceModel: failed to create docID, missing arguments: \
      uuid: ${uuid}, deviceType: ${deviceType}, eventDate: ${eventDate}`);
    }
    return [uuid, 'device', deviceType, eventDate].join('/');
  }
}

