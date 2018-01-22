
import { HttpHeaders } from '@angular/common/http';
import { FieldRef, Model } from 'rawmodel';

import { environment } from '../shared/environments/environment';
import { RedcapConfig } from '../shared/config/redcap-config';
import { RedcapPayloadModel } from './redcap-payload-model';
/**
 * HTTP Request Model
 *
 * Model that for making HTTP requests
 */
export class RedcapRequestModel extends Model {

  // class properties
  public url: string;
  public token: string;
  public method: string;
  public headers: HttpHeaders;
  public payload: RedcapPayloadModel;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);
    // field definitions for class properties
    let url = environment.redcapURL;
    if (!window['jasmine']) {
      url = `https://${RedcapConfig.domain}/api/`;
    }
    this.defineField('url', { type: 'String', defaultValue: url });
    this.defineField('token', { type: 'String', defaultValue: RedcapConfig.token });
    this.defineField('method', { type: 'String', defaultValue: 'POST' });
    this.defineField('headers', {
      type: 'Any',
      defaultValue: new HttpHeaders({
        // 'Content-Type: application/x-www-form-urlencode' - multipart/form-data: adds a few bytes of boundary 
        // overhead to the message, and must spend some time calculating it, but sends each byte in one byte.
        // or
        // application/x-www-form-urlencoded: has a single byte boundary per field (&), 
        // but adds a linear overhead factor of 3x for every non-printable character.
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }),
    });
    this.defineField('payload', { type: RedcapPayloadModel, defaultValue: new RedcapPayloadModel });

    // populate document and commit changes
    this.populate(data);
  }

  /**
  * METHODS
  */
  public get body(): string {
    // create a 'body' string for html request
    const fields: FieldRef[] = this.payload.flatten();

    // extract payload fields 
    let forms = new Array<string>();
    let records = new Array<string>();
    let otherFields = {};

    for (let field of fields) {
      const key: string = field.path.join();
      const value: any = field.field.value;

      if (key === 'forms' && value) {
        forms = forms.concat(value);
      }
      else if (key === 'records' && value) {
        records = records.concat(value);
      }
      else if (value) {
        otherFields[key] = value;
      }
    }

    // write payload fields to body
    let body = `token=${this.token}&`;
    // other fields
    for (const [key, formField] of Object.entries(otherFields)) {
      body += `${key}=${formField}&`;
    }
    // forms
    for (let [idx, value] of Object.entries(forms)) {
      body += `forms[${idx}]=${value}&`;
    }
    // records
    for (let [idx, value] of Object.entries(records)) {
      body += `records[${idx}]=${value}&`;
    }

    // remove trailing '&', if present
    if (body[body.length - 1] === '&') {
      body = body.slice(0, body.length - 1);
    }
    return body;
  }

  public isValid(): boolean {

    if (this === undefined || this.url === undefined || this.token === undefined) {
      console.log('HTTP Request: invalid https, must have url and token entries, returning');
      return false;
    }
    if (this.payload === undefined || this.payload.content === undefined) {
      console.log('HTTP Request: invalid payload, must have content entry, returning');
      return false;
    }
    if (this.payload.content === 'record' &&
      (this.payload.forms === undefined || this.payload.records === undefined)) {
      console.log('HTTP Request: invalid records payload, must have forms and records entries, returning');
      return false;
    }
    return true;
  }

}

