import { SurveyFieldType } from '../shared/enums';
import { SurveyFieldModel } from './survey-field-model';
import { UserBaseModel } from './user-base-model';


// tslint:disable:max-line-length
/**
 * User SurveyForm Model - survey-service-model.ts
 *
 * Model that interacts with database for user survey forms
 */

export class SurveyFormModel extends UserBaseModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[formName]/[eventDate]/[reportIndex]
  // survey
  public formName: string;
  public formFields: SurveyFieldModel[];
  public reportIndex: number;    // e.g. seizure report index [1]
  // completion status
  public isComplete: boolean;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override base fields
    this.defineField('_id', {
      type: 'String',
      get(value) {
        return SurveyFormModel.docID(
          this.owner.uuid,
          this.owner.formName,
          this.owner.eventDate,
          this.owner.reportIndex);
      }
    });
    this.defineField('collectionName', {
      type: 'String',
      defaultValue: 'survey',
    });

    // field definitions for class properties
    this.defineField('formName', { type: 'String' });
    this.defineField('formFields', {
      type: [SurveyFieldModel],
      defaultValue: [],
    });
    this.defineField('reportIndex', {
      type: 'Number',
      defaultValue: 0,
    });
    // completion status
    this.defineField('isComplete', {
      type: 'Boolean',
      defaultValue: false,
      get(): boolean {
        // form is complete if a responses is given for each field
        if (this.owner.formFields) {
          let responseCount = this.owner.formFields.reduce((n: any, field: any) => {
            // check if responded to each field
            return (field.fieldResponse) ? n + 1 : n;
          }, 0 /*initial value*/);
          return (responseCount.length === this.owner.formFields.length);
        }
        return false;
      }
    });
    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static docID(uuid: string, formName: string, eventDate: Date, reportIndex?: number): string {
    // shortcut for generating docID
    try {
      if (!uuid || !formName || !eventDate) {
        throw `missing arguments`;
      }
      if (!(eventDate instanceof Date)) {
        throw `date is incorrectly formatted`;
      }
      // set defaults
      if (!reportIndex) {
        reportIndex = 0;
      }
      // set date to start date, M/D/Y 
      eventDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        0, 0, 0, 0);
      const docID = [uuid, 'survey', formName,
        eventDate.toISOString(), `${reportIndex}`].join('/');
      return docID;

    } catch (err) {
      console.warn(`SurveyFormModel: warning, failed construct docID: ${err}`);
    }
  }

  public static docIDFields(docID: string): any {
    // shortcut for getting docID fields
    try {
      if (!docID) {
        throw `missing 'docID' argument`;
      }
      const [uuid, collectionName, formName,
        eventDate, reportIndex] = docID.split('/');

      if (!uuid || !collectionName || !formName || !eventDate) {
        throw (`unable to extract 'docID' fields`);
      }
      const docIDFields = {
        uuid: uuid,
        collectionName: collectionName,
        formName: formName,
        eventDate: new Date(eventDate),
        reportIndex: reportIndex,
      };
      return docIDFields;

    } catch (err) {
      console.warn(`SurveyFormModel: warning, failed to extract fields from docID: ${err}`);
    }
  }

}