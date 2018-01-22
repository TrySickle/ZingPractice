import { Validators } from '@angular/forms';
import { Model } from 'rawmodel';

import { SurveyFormModel } from './survey-form-model';
import { SurveyFieldType } from '../shared/enums';

/**
 * User UserSurvey Model - survey-service-model.ts
 *
 * Model that interacts with database for user survey data
 */
export class SurveyFieldModel extends Model {

  // class properties
  public fieldName: string;   // e.g. "user_role_v2"
  public formName: string;    // e.g. "account_creation_patientcaregiver"
  public fieldType: SurveyFieldType;  // e.g. "radio"
  public fieldLabel: string;          // e.g. "Are you the patient or a caregiver?"
  public fieldChoices: Array<any>;    // e.g. {key: 0, value: 'Patient'}
  public requiredField: boolean;
  public questionNumber: string;
  public fieldResponse: string;
  public fieldOrder: number;
  public fieldAnnotation: string;
  // form properties
  public validatorFn: any;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // field definitions for class properties
    this.defineField('fieldName', { type: 'String' });
    this.defineField('formName', { type: 'String' });
    this.defineField('fieldType', { type: SurveyFieldType, defaultValue: 'text' });
    this.defineField('fieldLabel', { type: 'String' });
    this.defineField('fieldChoices', { type: ['Any'], defaultValue: new Array<any>() });
    this.defineField('requiredField', { type: 'Boolean', defaultValue: false });
    this.defineField('questionNumber', { type: 'String' });
    this.defineField('fieldResponse', { type: 'String' });
    this.defineField('fieldOrder', { type: 'Number', defaultValue: 1 });
    this.defineField('fieldAnnotation', { type: 'String' });
    // form properties
    this.defineField('validatorFn', {
      type: 'Any',
      get(value) {
        let validatorFns = [];
        if (this.owner.requiredField) {
          validatorFns.push(Validators.required);
        }
        return Validators.compose(validatorFns);
      }
    });
    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static fromRedcapMetadata(instr: any): SurveyFieldModel[] {
    // extract data from survey fields
    let formFields = [];
    try {
      for (let instField of instr) {
        const field = SurveyFieldModel.parseField(instField);
        if (field) {
          formFields.push(field);
        }
      }
      if (formFields.length === 0) {
        console.warn(`SurveyFieldModel: warning, failed to parse metadata, no fields present`);
        return;
      }
      formFields = SurveyFieldModel.assignFieldNumbers(formFields);

    } catch (err) {
      throw new Error(`SurveyFieldModel: failed to extract redcap survey fields: ${err}`);
    }
    // success, return form fields
    return formFields;
  }

  private static parseField(instrField: any): SurveyFieldModel {
    // create document fields
    let surveyField: SurveyFieldModel;
    try {
      // skip if field is invalid
      if (!SurveyFieldModel.isValidField(instrField)) { return; }

      // create a survey field
      const fieldType = SurveyFieldModel.parseFieldType(instrField);
      surveyField = new SurveyFieldModel({
        fieldName: instrField['field_name'],
        formName: instrField['form_name'],
        fieldType: fieldType,
        fieldLabel: SurveyFieldModel.parseFieldLabel(instrField),
        requiredField: instrField['required_field'],
        questionNumber: instrField['question_number'],
        fieldAnnotation: instrField['field_annotation'],
        fieldChoices: SurveyFieldModel.parseFieldChoices(instrField, fieldType),
      });

    } catch (err) {
      throw new Error(`SurveyFieldModel: failed to extract instrument field: ${err}`);
    }
    return surveyField;
  }

  private static isValidField(redcapField: any): boolean {
    // skip calculation or 'calc' documents
    if (redcapField.fieldType === SurveyFieldType.Calc) { return false; }

    // skip description or 'descriptive' documents
    if (redcapField.fieldType === SurveyFieldType.Descriptive) { return false; }

    if (redcapField['field_annotation']) {
      // skip hidden if field should be hidden on data entry and survey form
      if (redcapField['field_annotation'].includes('@HIDDEN')) { return false; }
      // skip if survey field should be hidden on the survey form only
      if (redcapField['field_annotation'].includes('@HIDDEN-SURVEY')) { return false; }
      // skip instr without a name
      if (!redcapField['field_name']) {
        console.warn('SurveyFieldModel: redcap required field name is missing');
        return false;
      }
    }
    // success, field is valid
    return true;
  }

  private static parseFieldLabel(field: any): string {
    // remove html '<' and '>' brackets
    const fieldLabel = field['field_label'];
    if (fieldLabel) {
      return fieldLabel.replace(/<.*?>/g, '');
    }
  }

  private static parseFieldType(field: any): SurveyFieldType {
    // set non-text field types
    let fieldType: SurveyFieldType;
    try {
      fieldType = field['field_type'];
      const isTextField = (fieldType === SurveyFieldType.Text);

      if (isTextField) {
        const textValidation = field['text_validation_type_or_show_slider_number'];
        if (textValidation) {
          // 'number'
          if (textValidation === 'number') {
            fieldType = SurveyFieldType.Number;
          }
          // 'datetime'
          else if (textValidation.includes('datetime')) {
            fieldType = SurveyFieldType.DateTime;
          }
        }
      }
    } catch (err) {
      console.error(`SurveyFormModel: failed to prase field type: ${err}`);
    }
    return fieldType;
  }

  private static parseFieldChoices(field: any, fieldType: SurveyFieldType): any[] {
    // format field choices
    let fieldChoices: any[];
    try {
      // 'multi-choice'
      if (fieldType === SurveyFieldType.CheckBox
        || fieldType === SurveyFieldType.DropDown
        || fieldType === SurveyFieldType.Radio
        || fieldType === SurveyFieldType.Slider) {

        const choices: string = field['select_choices_or_calculations'];
        fieldChoices = SurveyFieldModel.parseMultiChoices(choices);
      }
      // 'number'
      else if (fieldType === SurveyFieldType.Number) {
        // set number choices to [0-10]
        const choiceIdxs = Array.from(Array(10 + 1).keys()); // i.e. [...Array(10 + 1).keys()];
        fieldChoices = choiceIdxs.map((x: number) => x.toString());
      }
      // 'yesno'
      else if (fieldType === SurveyFieldType.YesNo) {
        fieldChoices = [{ key: 0, value: 'Yes' }, { key: 1, value: 'No' }];
      }
    } catch (err) {
      console.error(`SurveyFormModel: failed to prase field choices: ${err}`);
    }
    return fieldChoices;
  }

  private static parseMultiChoices(choices: string): any[] {
    // extracts field choices from redcap formatted string
    // set using "0, Patient | 1, Caregiver"
    let fieldChoices: any[] = [];
    try {
      // skip if no choice are present
      if (!choices) { return; }

      // check '|' seperated key-value choices
      // e.g. 'slider', "Very Mild | Moderate | Very Severe"
      fieldChoices = choices.split('|');

      // check ',' seperated values
      // e.g. 'checkbox', "0, Patient" from "0, Patient | 1, Caregiver"
      const isKeyValued: boolean = fieldChoices.every((x: string) => x.includes(','));
      if (isKeyValued) {
        // assign key value pairs, e.g. {key: 0, value: 'Patient'} from '0, Patient'
        let keyValChoices = [];
        for (let choice of fieldChoices) {
          let [choiceNum, choiceVal] = choice.split(',');
          choiceNum = Number(choiceNum);
          choiceVal = choiceVal.replace(/^[ ]+|[ ]+$/g, ''); // remove trailing and leading whitespace
          keyValChoices.push({ key: choiceNum, value: choiceVal });
        }
        fieldChoices = keyValChoices;
      }
    } catch (err) {
      console.error(`SurveyFormModel: failed to prase multi-choice: ${err}`);
    }
    return fieldChoices;
  }

  private static assignFieldNumbers(formFields: SurveyFieldModel[]): SurveyFieldModel[] {
    // set question numbering
    try {
      const isNumbered = formFields.filter((field: SurveyFieldModel) => field.questionNumber);

      if (isNumbered) {
        /* do nothing if fields are already numbered */
      }
      else {
        // otherwise, number questions from index zero
        for (let i = 0; i < formFields.length; i++) {
          formFields[i].questionNumber = `${i}`;
        }
      }
      return formFields;

    } catch (err) {
      console.error(`SurveyFieldModel: failed to set field question numbers: ${err}`);
    }
  }

}