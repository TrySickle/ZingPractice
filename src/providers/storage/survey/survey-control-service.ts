import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { SurveyFieldModel } from '../../../models/survey-field-model';

/**
 * Generated class for the Survey Control Service Provider.
 *
 * Survey-Control-Service - creates a form group given a set of fields/questions
 * 
 * */

@Injectable()
export class SurveyControlService {
  constructor(private fb: FormBuilder) { }

  toFormGroup(formFields: Array<SurveyFieldModel>): FormGroup {
    // create form group from survey field data model

    // skip if form fields are not defined
    if (!formFields) {
      console.warn('SurveyControlService: failed to create form group data model, empty model given, returning empty formgroup');
      return new FormGroup({});
    }

    // set form group controls
    let controls: any = {};
    formFields.forEach(formField => {

      // set name and validators
      let fieldControlName = (formField.fieldResponse || '');
      let fieldControlValidator = (formField.validatorFn || Validators.required);

      // set form controls
      // create groups of controls for 'checkboxes'
      if (formField.fieldType === 'checkbox') {
        let checkboxArray = new FormArray([]);
        formField.fieldChoices.forEach(() => {
          checkboxArray.push(new FormControl(false, fieldControlValidator));
        });
        controls[formField.fieldName] = this.fb.group({ choices: checkboxArray });
      }
      // otherwise, create single controls for other controls
      else {
        controls[formField.fieldName] = new FormControl(fieldControlName, fieldControlValidator);
      }
    });
    return new FormGroup(controls); // success
  }

  fromFormGroup(formGroup: FormGroup): Array<SurveyFieldModel> {
    // create form fields from form group

    // skip if form group is not defined
    if (!formGroup) {
      console.warn(`SurveyControlService: failed to create 'formFields', empty 'formGroup' given`);
      return new Array<SurveyFieldModel>();
    }
    // set form fields
    let formFields = new Array<SurveyFieldModel>();
    for (let [fieldName, fieldResponse] of Object.entries(formGroup.value)) {

      const field = new SurveyFieldModel({
        fieldName: fieldName,
        fieldResponse: fieldResponse,
      });
      formFields.push(field);
    }
    // success, return form fields
    return formFields;
  }
}



