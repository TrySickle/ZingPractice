import { Model } from 'rawmodel';

/**
 * HTTP Payload Model
 *
 * Model that for making Redcap HTTP requests
 */
export class RedcapPayloadModel extends Model {

    // class properties
    public content: string;
    public format: string;
    public type: string;
    public records: Array<string>;
    public forms: Array<string>;
    public rawOrLabel: string;
    public rawOrLabelHeaders: string;
    public exportCheckboxLabel: string;
    public exportSurveyFields: string;
    public exportDataAccessGroups: string;
    public returnFormat: string;
    public instrument: string;
    public event: string;
    public field: string;
    public action: string;
    // signup
    public overwriteBehavior: string;
    public data: string;
    public returnContent: string;

    public constructor(data?: any) {

        if (!data) { data = {}; }
        super(data);

        // field definitions for class properties
        this.defineField('content', { type: 'String', defaultValue: null });
        this.defineField('format', { type: 'String', defaultValue: 'json' });
        this.defineField('dataType', { type: 'String', defaultValue: 'flat' });
        this.defineField('records', { type: ['String'], defaultValue: new Array<string>() });
        this.defineField('forms', { type: ['String'], defaultValue: new Array<string>() });
        this.defineField('rawOrLabel', { type: 'String', defaultValue: 'raw' });
        this.defineField('rawOrLabelHeaders', { type: 'String', defaultValue: 'raw' });
        this.defineField('exportCheckboxLabel', { type: 'String', defaultValue: 'false' });
        this.defineField('exportSurveyFields', { type: 'String', defaultValue: 'true' });
        this.defineField('exportDataAccessGroups', { type: 'String', defaultValue: 'false' });
        this.defineField('returnFormat', { type: 'String', defaultValue: 'json' });
        this.defineField('instrument', { type: 'String', defaultValue: null });
        this.defineField('event', { type: 'String', defaultValue: null });
        this.defineField('field', { type: 'String', defaultValue: null });
        this.defineField('action', { type: 'String', defaultValue: null });
        // signup
        this.defineField('overwriteBehavior', { type: 'String', defaultValue: null });
        this.defineField('data', { type: 'String', defaultValue: null });
        this.defineField('returnContent', { type: 'String', defaultValue: null });

        // populate document and commit changes
        this.populate(data);
    }

}

