import { UserDataType } from '../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';

/**
 * Mood Model - mood-model.ts
 *
 * Model that interacts with database for mood data
 *
 * 'PouchDB'
 * see: https://github.com/ashteya/ionic2-tutorial-pouchdb
 * see: https://nolanlawson.github.io/pouchdb-find/
 */
export class MoodModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public moodRating: number;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override parent type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Mood });

    // field definitions for class properties
    this.defineField('moodRating');

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static fromSurveyFields(survey: SurveyFormModel): MoodModel {
    // extract data from survey fields

    // check if contains one  or more items list
    const fieldNames = survey.formFields.map((field: SurveyFieldModel) => field.fieldName);
    let findOne: boolean = [
      'pmorning_howfeeling',
      'cmorning_howfeeling']
      .some(r => fieldNames.includes(r));

    if (!findOne) { return; }

    let surveyBaseModel = new UserBaseModel(survey);

    let mood = new MoodModel(surveyBaseModel);
    mood.collectionName = 'data';
    mood.dataType = UserDataType.Mood;
    mood.startTime = survey.eventDate;

    const fields = survey.formFields;
    for (let field of fields) {
      if (field.fieldName === 'pmorning_howfeeling' || field.fieldName === 'cmorning_howfeeling') {
        mood.moodRating = Number.parseInt(field.fieldResponse);
      }
    }
    return mood;
  }

}
