import { DAY_MSEC } from '../shared/constants';
import { DataSourceType, UserDataType } from '../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { SurveyFormModel } from './survey-form-model';
import { UserBaseModel } from './user-base-model';
import { UserDataModel } from './user-data-model';

/**
 * Exercise Model - exercise-model.ts
 *
 * Model that interacts with database for exercise data
 *
 * 'RawModel'
 * see: https://github.com/xpepermint/rawmodeljs
 *
 * 'PouchDB'
 * see: https://github.com/ashteya/ionic2-tutorial-pouchdb
 * see: https://nolanlawson.github.io/pouchdb-find/
 */
export class ExerciseModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate] 
  public didExercise60Min: boolean;
  public numTVHours: number;
  public numHoursExercise: number;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override parent type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Exercise });

    // field definitions for class properties
    this.defineField('didExercise60Min');
    this.defineField('numTVHours');
    this.defineField('numHoursExercise');

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static fromSurveyFields(survey: SurveyFormModel): ExerciseModel {
    // extract data from survey fields

    // check if contains one  or more items list
    const fieldNames: Array<string> = survey.formFields.map((field: SurveyFieldModel) => field.fieldName);
    let findOne: boolean = [
      'pmorning_paactiveyesterday',
      'cmorning_paactiveyesterday',
      'pweekly_averagetv_hrs',
      'cweekly_averagetv_hrs',
      'pweekly_num_activedays',
      'cweekly_num_activedays']
      .some(r => fieldNames.includes(r));

    if (!findOne) { return; }

    let surveyBaseModel = new UserBaseModel(survey);

    let exercise = new ExerciseModel(surveyBaseModel);
    exercise.collectionName = 'data';
    exercise.dataType = UserDataType.Exercise;
    exercise.startTime = survey.eventDate;

    const eventDateISO = survey.eventDate.toISOString();  // e.g. "2011-10-10T14:48:00"
    const eventDateStr = eventDateISO.slice(0, 10);       // e.g. "2011-10-10"

    const fields = survey.formFields;
    for (let field of fields) {
      if (field.fieldName === 'pmorning_paactiveyesterday' || field.fieldName === 'cmorning_paactiveyesterday') {
        exercise.didExercise60Min = (field.fieldResponse === '1' || field.fieldResponse === 'Yes');
        exercise.startTime = new Date(new Date(eventDateStr).getTime() - DAY_MSEC); // yesterday
      }
      else if (field.fieldName === 'pweekly_averagetv_hrs' || field.fieldName === 'cweekly_averagetv_hrs') {
        exercise.numTVHours = Number.parseInt(field.fieldResponse);
      }
      else if (field.fieldName === 'pweekly_num_activedays' || field.fieldName === 'cweekly_num_activedays') {
        exercise.numHoursExercise = Number.parseInt(field.fieldResponse);
      }
    }
    return exercise;
  }

  public static fromFitbitFields(uuid: string, eventDate: Date, veryActiveMinutes: number, steps: number): ExerciseModel {
    // extract data from survey fields
    return new ExerciseModel({
      uuid: uuid,
      eventDate: eventDate,
      dataSource: DataSourceType.Fitbit,
      didExercise60Min: (veryActiveMinutes >= 60) ? true : false,
      numHoursExercise: veryActiveMinutes,
      numSteps: steps,
    });
  }

}

//-------------------------------------------

// const fieldList = [
//   'pweekly_averagetv_hrs', 'cweekly_averagetv_hrs',
//   'pweekly_num_activedays', 'cweekly_num_activedays'
// ];
// const fieldNames = fields.map((field: SurveyFieldModel) => field.fieldName);
// let fieldListMatches = fieldList.filter((fieldName: string) => fieldNames.includes(fieldName));
// if(!fieldListMatches.length) { return; }

