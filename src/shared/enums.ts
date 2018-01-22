/**
 * Enums.ts
 * 
 * references
 * see: https://stackoverflow.com/questions/15490560/create-an-enum-with-string-values-in-typescript
 *      https://stackoverflow.com/questions/17380845/how-to-convert-string-to-enum-in-typescript
 *      https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates
 * 
 * example:
 * import * as Enums from './somedirectory/enums/enums';
 *  constructor() { console.log(Enums.RoleType.Admin); }
 */

export enum UserRoleType {
    Patient = 'patient',
    Caregiver = 'caregiver',
    Clinician = 'clinician',
}

export enum UserDataType {
    Seizures = 'seizures',
    Medication = 'medication',
    Sleep = 'sleep',
    Mood = 'mood',
    Exercise = 'exercise',
    Goal = 'goal',
}

export enum GoalType {
    SleepHrs = 'sleep_hrs',
    SleepTimeConsistency = 'sleep_time_consistency',
    MedicationAdherence = 'medication_adherence',
    MedicationTimeConsistency = 'medication_time_consistency',
    ExerciseStepCount = 'exercise_step_count',
    ExerciseActiveMins = 'exercise_active_mins',
}

export enum StudyConditionType {
    Baseline = 'baseline',
    HealthTracking = 'health_tracking',
    SmartReminders = 'smart_reminders',
    MotivationalIncentives = 'motivational_incentives',
}

export enum SurveyFieldType {
    Calc = 'calc',
    DateTime = 'datetime',
    CheckBox = 'checkbox',
    Descriptive = 'descriptive',
    DropDown = 'dropdown',
    Number = 'number',
    Radio = 'radio',
    Slider = 'slider',
    Text = 'text',
    YesNo = 'yesno',
    Notes = 'notes',
}

export enum SurveyFormType {
    Morning = 'morning',
    Weekly = 'weekly',
    Intake = 'intake',
    Exit = 'exit',
}

export enum SurveyFormFreqType {
    Daily = 'daily',
    Saturday = 'saturday',
}

export enum ScheduleEventType {
    Survey = 'survey',
    Reminder = 'reminder',
}

export enum StorageCollectionType {
    ScheduleEvent = 'schedule',
    SurveyField = 'field',
    SurveyForm = 'survey',
    UserData = 'data',
    UserProfile = 'profile',
}

export enum DataSourceType {
    Self = 'self',
    Fitbit = 'fitbit',
    PillBox = 'pill_box',
    ProxTag = 'prox_tag',
}

export enum DeviceType {
    Fitbit = 'fitbit',
    PillBox = 'pill_box',
    ProxTag = 'prox_tag',
}


