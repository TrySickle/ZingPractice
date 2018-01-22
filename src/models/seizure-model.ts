import { UserDataType } from '../shared/enums';
import { DAY_MSEC, MIN_MSEC } from './../shared/constants';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserDataModel } from './user-data-model';

/**
 * Exercise Model - seizure-model.ts
 *
 * Model that interacts with database for seizure data
 *
 */
export class SeizureModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public presentation: string;
  public otherSymptoms: Array<string>;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override parent type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Seizures });

    // field definitions for class properties
    this.defineField('presentation');
    this.defineField('otherSymptoms');

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static fromSurveyFields(survey: SurveyFormModel): SeizureModel {
    // extract data from survey fields

    // check if contains one  or more items list
    const fieldNames = survey.formFields
      .map((field: SurveyFieldModel) => field.fieldName);

    let findOne: boolean = [
      'pmorning_seizuresyesterday',
      'cmorning_seizuresyesterday',
      'preport_sz_onsettime',
      'creport_sz_onsettime',
      'preport_sz_onsettime',
      'creport_sz_onsettime',
      'preport_sz_durationmin',
      'creport_sz_durationmin',
    ].some(r => fieldNames.includes(r));

    // skip if no fields are found
    if (!findOne) { return; }

    // assign fields to sleep model
    const surveyBaseModel = new UserDataModel(survey);

    let seizures = new SeizureModel(surveyBaseModel);
    seizures.collectionName = 'data';
    seizures.dataType = UserDataType.Seizures;

    const eventDateISO = survey.eventDate.toISOString();  // e.g. "2011-10-10T14:48:00"
    const eventDateStr = eventDateISO.slice(0, 10);       // e.g. "2011-10-10"

    const fields = survey.formFields;
    for (let field of fields) {

      // seizure (date only)
      if (field.fieldName === 'preport_seizuresyesterday' || field.fieldName === 'creport_seizuresyesterday') {
        seizures.startTime = new Date(new Date(eventDateStr).getTime() - DAY_MSEC); // yesterday
      }
      // seizure (date & duration)
      else if (field.fieldName === 'preport_sz_onsettime' || field.fieldName === 'creport_sz_onsettime') {
        seizures.startTime = new Date(`${eventDateStr}T${field.fieldResponse}`);
      }
      else if (field.fieldName === 'preport_sz_durationmin' || field.fieldName === 'creport_sz_durationmin') {
        seizures.durationMsec = Number.parseInt(field.fieldResponse) * MIN_MSEC;
      }
    }
    return seizures;
  }

}

