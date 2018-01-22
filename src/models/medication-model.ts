import { DAY_MSEC } from '../shared/constants';
import { UserDataType } from '../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';

/**
 * Medication Model - medication-model.ts
 *
 * Model that interacts with database for medication data
 *
 * didTakeMeds - Boolean, True or False
 *
 * see:
 * redcap - 'pmorning_takemeds'
 */
export class MedicationModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public didTakeMeds: boolean;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override parent type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Medication });

    // field definitions for class properties
    this.defineField('didTakeMeds');

    // populate document and commit changes
    this.populate(data);
  }

  /**
  * STATIC METHODS
  */
  public static fromSurveyFields(survey: SurveyFormModel): MedicationModel {
    // extract data from survey fields

    // check if contains one  or more items list
    const fieldNames = survey.formFields.map((field: SurveyFieldModel) => field.fieldName);
    let findOne: boolean = [
      'pmorning_takemedsyesterday',
      'cmorning_takemedsyesterday']
      .some(r => fieldNames.includes(r));

    if (!findOne) { return; }

    let surveyBaseModel = new UserBaseModel(survey);

    let medication = new MedicationModel(surveyBaseModel);
    medication.collectionName = 'data';
    medication.dataType = UserDataType.Medication;
    medication.startTime = survey.eventDate;

    const eventDateISO = survey.eventDate.toISOString();  // e.g. "2011-10-10T14:48:00"
    const eventDateStr = eventDateISO.slice(0, 10);       // e.g. "2011-10-10"

    const fields = survey.formFields;
    for (let field of fields) {
      if (field.fieldName === 'pmorning_takemedsyesterday'
        || field.fieldName === 'cmorning_takemedsyesterday') {
        medication.didTakeMeds = (field.fieldResponse === '1' || field.fieldResponse === 'Yes');
        medication.startTime = new Date(new Date(eventDateStr).getTime() - DAY_MSEC); // yesterday        
      }
    }

    return medication;
  }
}
