import { Injectable } from '@angular/core';

import { StorageService } from './../storage-service';
import { RedcapService } from './redcap-service';
import { AuthService } from './../../authorization/auth-service';

import { UserDataType, UserRoleType } from './../../../shared/enums';
import { BulkDataModel } from './../../../models/bulk-transfer-model';
import { ExerciseModel } from './../../../models/exercise-model';
import { MedicationModel } from './../../../models/medication-model';
import { MoodModel } from './../../../models/mood-model';
import { SeizureModel } from './../../../models/seizure-model';
import { SleepModel } from './../../../models/sleep-model';
import { UserDataModel } from './../../../models/user-data-model';
import { UserProfileModel } from './../../../models/user-profile-model';

// tslint:disable:max-line-length
/**
 * REDCAP MOCK DATASET
 */
@Injectable()
export class RedcapMockService {

    constructor(
        private storage: StorageService,
        private redcap: RedcapService,
        private auth: AuthService,
    ) { }

    public async createSampleDatabase(databaseName: string): Promise<void> {
        // create sample database
        try {
            console.log(`RedcapMockService: create sample database: started`);
            await this.storage.disconnect();
            await this.storage.connect(databaseName);

            // populate sample dataset
            let profiles = await this.createSampleUsers();
            await this.enrollSampleUsers(profiles);
            await this.uploadSampleSurveyResponses(profiles);

        } catch (err) {
            console.log(`RedcapMockService: failed to create sample database: ${err}`);
        }

        console.log(`RedcapMockService: create sample database: complete`);
    }

    //-------------------------------------------------
    // USER DATA
    public async createSampleUsers(): Promise<UserProfileModel[]> {
        // create sample users
        let promises = [];

        const ranNum = Math.floor(Math.random() * 100);
        const profileDoc1 = new UserProfileModel({
            uuid: '75fb7159-c72e-4845-ac9a-309bcf905747',
            firstName: 'Jon',
            lastName: 'Bidwell',
            recordID: '1',
            familyID: '99',
            email: `bidwej${ranNum}@gmail.com`,
            password: 'jon123',
            phoneNumber: `860-368-0104`,
            userRole: UserRoleType.Patient,
            enrollDate: new Date('2017-10-24T19:57:23.879Z'),
            eventDate: new Date('2017-10-24T19:57:23.879Z'),
        });
        promises.push(this.storage.update(profileDoc1));

        const profileDoc2 = new UserProfileModel({
            uuid: 'a54ed3bc-1f99-4003-b0b1-6d2faa797052',
            firstName: 'Donna',
            lastName: 'Rand',
            recordID: '2',
            familyID: '99',
            email: `donna${ranNum}@gmail.com`,
            password: 'donna123',
            phoneNumber: `860-368-0104`,
            userRole: UserRoleType.Caregiver,
            enrollDate: new Date('2017-10-25T19:57:23.879Z'),
            eventDate: new Date('2017-10-25T19:57:23.879Z'),
        });
        promises.push(this.storage.update(profileDoc2));

        const profileDoc3 = new UserProfileModel({
            uuid: '06dc58ca-b72d-432a-8d80-9945167ed287',
            firstName: 'David',
            lastName: 'Bidwell',
            recordID: '3',
            familyID: '99',
            email: `david${ranNum}@gmail.com`,
            phoneNumber: `860-368-0104`,
            password: 'david123',
            userRole: UserRoleType.Patient,
            enrollDate: new Date('2017-10-26T19:57:23.879Z'),
            eventDate: new Date('2017-10-26T19:57:23.879Z'),
        });
        promises.push(this.storage.update(profileDoc3));

        let profiles: UserProfileModel[];
        try {
            const profileDocs = await Promise.all(promises);
            profiles = profileDocs.map((profile: UserProfileModel) => new UserProfileModel(profile));
        } catch (err) {
            console.error(`RedcapMockService: failed to create sample users: ${err}`);
        }
        return profiles;
    }

    public async enrollSampleUsers(profiles: UserProfileModel[]): Promise<void> {
        // Enroll set of users w/ different enrollment dates

        // sign up with redcap
        try {
            let promises = [];
            for (let profile of profiles) {
                promises.push(this.redcap.pushProfile(profile));
            }
            await Promise.all(promises);
            console.log(`RedcapMockService: enroll sample users with redcap: successful`);

        } catch (err) {
            console.error(`RedcapMockService: failed to enroll sample users with redcap: ${err}`);
            return;
        }
        // sign up with ionic API
        try {
            let promises = [];
            for (let profile of profiles) {
                promises.push((async () => {
                    try {
                        await this.auth.signup(profile.email, profile.password);
                    } catch (err) { /* catch errors, do nothing */ }
                })());
            }
            await Promise.all(promises);
            console.log(`RedcapMockService: enroll sample users with API: successful`);

        } catch (err) {
            console.error(`RedcapMockService: failed to enroll sample users with API: ${err}`);
        }
    }

    public async uploadSampleSurveyResponses(profiles: UserProfileModel[]): Promise<void> {
        // create survey responses and upload to redcap
        console.log(`RedcapMockService: upload sample user surveys: started`);

        // create responses, study dates [0-30] 
        for (const profile of profiles) {
            console.log(`profile: ${profile._id}`);

            let bulkDocs: BulkDataModel[] = [];
            try {
                const eventDates = profile.eventDates;
                for (let [idx, eventDate] of Object.entries(eventDates)) {
                    bulkDocs.push(this.createSampleBulkData(profile, eventDate));
                }
            } catch (err) {
                console.error(`RedcapMockService: failed to create sample survey responses, unable to create documents: ${err}`);
                return;
            }

            // store responses
            let promises = [];
            try {
                for (const bulkDoc of bulkDocs) {
                    promises.push(this.storage.update(bulkDoc));
                }
                await Promise.all(promises);
            } catch (err) {
                console.error(`RedcapMockService: failed to create sample survey responses, unable to store documents: ${err}`);
                return;
            }

            // upload responses
            promises = [];
            try {
                for (const bulkDoc of bulkDocs) {
                    promises.push(this.redcap.pushBulkDoc(profile, bulkDoc));
                }
                await Promise.all(promises);
            } catch (err) {
                console.error(`RedcapMockService: failed to create sample survey responses, unable to upload documents: ${err}`);
                return;
            }

        } // end - each profile
        console.log(`RedcapMockService: upload sample user surveys: successful`);
    }

    //-------------------------------------------------
    // SURVEY DATA
    // private createSampleMorningSurvey(profile: UserProfileModel, eventDate: Date) {
    //     // create sample 'morning survey' instance
    //     let morning: SurveyFormModel;

    //     // TODO: populate with generic survey answers here
    //     if (profile.userRole === UserRoleType.Patient) {
    //         morning = new SurveyFormModel({
    //             formName: `weekly_survey_${profile.userRole}`,
    //             formFields: [
    //                 {},
    //                 {},
    //             ],
    //             isComplete: true
    //         });
    //     }
    //     else if (profile.userRole === UserRoleType.Caregiver) {
    //         morning = new SurveyFormModel({
    //             formName: `weekly_survey_${profile.userRole}`,
    //             formFields: [
    //                 {},
    //                 {},
    //             ],
    //             isComplete: true
    //         });
    //     }
    //     else {
    //         throw new Error(`RedcapMockService: failed to create 'morning' survey, invalid user role`);
    //     }

    //     return morning;
    // }

    // private createSampleWeeklySurvey(profile: UserProfileModel, eventDate: Date) {
    //     // create sample 'weekly survey 'instance
    //     let weekly: SurveyFormModel;

    //     // TODO: populate with generic survey answers here
    //     if (profile.userRole === UserRoleType.Patient) {
    //         weekly = new SurveyFormModel({
    //             formName: `weekly_survey_${profile.userRole}`,
    //             formFields: [
    //                 {},
    //                 {},
    //             ],
    //             isComplete: true
    //         });
    //     }
    //     else if (profile.userRole === UserRoleType.Caregiver) {
    //         weekly = new SurveyFormModel({
    //             formName: `weekly_survey_${profile.userRole}`,
    //             formFields: [
    //                 {},
    //                 {},
    //             ],
    //             isComplete: true
    //         });
    //     }
    //     else {
    //         throw new Error(`RedcapMockService: failed to create 'weekly' survey, invalid user role`);
    //     }

    //     return weekly;
    // }

    //-------------------------------------------------
    // USER DATA
    private createSampleSeizureUserData(profile: UserProfileModel, eventDate: Date): UserDataModel {
        // create sample 'seizure user data' instance
        try {
            const onsetDate = new Date(eventDate.setHours(this.randIntRange(0, 20), 0, 0, 0));

            const data = new SeizureModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                type: UserDataType.Seizures,
                startTime: onsetDate,
                durationMsec: this.randIntRange(30 * 1000, 5 * 60 * 1000),
                presentation: 'focal',
                otherSymptoms: ['aura', 'dizziness', 'nausea'],
            });
            return data;

        } catch (err) {
            console.error(`RedcapMockService: failed to create 'seizure' report: ${err}`);
        }
    }

    private createSampleMedicationUserData(profile: UserProfileModel, eventDate: Date): UserDataModel {
        // create sample 'medication user data' instance
        try {
            const intakeDate = new Date(eventDate.setHours(this.randIntRange(0, 20), 0, 0, 0));

            const data = new MedicationModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                type: UserDataType.Seizures,
                startTime: intakeDate,
                didTakeMeds: this.randIntRange(0, 1),
            });
            return data;

        } catch (err) {
            console.error(`RedcapMockService: failed to create 'seizure' report: ${err}`);
        }
    }

    private createSampleSleepUserData(profile: UserProfileModel, eventDate: Date): UserDataModel {
        // create sample 'sleep user data' instance
        try {
            const bedTime = new Date(eventDate.setHours(this.randIntRange(9, 11), 0, 0, 0));
            const wakeTime = new Date(eventDate.getFullYear(),
                eventDate.getMonth(), eventDate.getDate() + 1, this.randIntRange(6, 10), 0, 0);

            const data = new SleepModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                type: UserDataType.Sleep,
                startTime: bedTime,
                durationMsec: wakeTime.getTime() - bedTime.getTime(),
                bedTime: bedTime,
                wakeTime: wakeTime,
                sleepQuality: 5.2,
                minutesToFallAsleep: this.randFloatRange(5, 20),
                minutesAsleep: (wakeTime.getTime() - bedTime.getTime()) / (60 * 1000) - this.randFloatRange(5, 20),
                minutesAwake: (wakeTime.getTime() - bedTime.getTime()) / (60 * 1000) - this.randFloatRange(10, 20),
                minutesAfterWakeup: this.randIntRange(1, 10),
                awakeningsCount: this.randIntRange(1, 20),
                awakeCount: this.randIntRange(1, 20),
                awakeDuration: this.randIntRange(1, 20),
                restlessCount: this.randIntRange(1, 5),
                restlessDuration: this.randIntRange(1, 25),
                timeInBed: (wakeTime.getTime() - bedTime.getTime()) / (60 * 1000),
                minuteData: [],
            });
            return data;

        } catch (err) {
            console.error(`RedcapMockService: failed to create 'seizure' report: ${err}`);
        }
    }

    private createSampleExerciseUserData(profile: UserProfileModel, eventDate: Date): UserDataModel {
        // create sample 'exercise user data' instance
        try {
            const reportDate = new Date(eventDate.setHours(this.randIntRange(0, 20), 0, 0, 0));

            const data = new ExerciseModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                type: UserDataType.Exercise,
                startTime: reportDate,
                didExercise60Min: this.randIntRange(0, 1),
                numTVHours: this.randIntRange(0, 5),
                numHoursExercise: this.randIntRange(0, 2),
            });
            return data;

        } catch (err) {
            console.error(`RedcapMockService: failed to create 'seizure' report: ${err}`);
        }
    }

    private createSampleMoodUserData(profile: UserProfileModel, eventDate: Date): UserDataModel {
        // create sample 'mood user data' instance
        try {
            const reportDate = new Date(eventDate.setHours(this.randIntRange(0, 20), 0, 0, 0));

            const data = new MoodModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                type: UserDataType.Mood,
                startTime: reportDate,
                moodRating: this.randIntRange(0, 3), //happy, sad, mad
            });
            return data;

        } catch (err) {
            console.error(`RedcapMockService: failed to create 'seizure' report: ${err}`);
        }
    }

    //-------------------------------------------------
    // BULK DATA
    private createSampleBulkData(profile: UserProfileModel, eventDate: Date): BulkDataModel {
        // create a single user responses

        // reports
        let reports: UserDataModel[] = [];
        try {
            reports.push(this.createSampleSeizureUserData(profile, eventDate));
            reports.push(this.createSampleMedicationUserData(profile, eventDate));
            reports.push(this.createSampleSleepUserData(profile, eventDate));
            reports.push(this.createSampleExerciseUserData(profile, eventDate));
            reports.push(this.createSampleMoodUserData(profile, eventDate));

        } catch (err) {
            throw new Error(`RedcapMockService: failed to create bulk data, unable to create report documents: ${err}`);
        }

        // // surveys
        // try {
        //     // let surveys: any[] = [];
        //     // surveys.push(this.createSampleMorningSurvey(profile, eventDate));
        //     // surveys.push(this.createSampleWeeklySurvey(profile, eventDate));
        // } catch (err) {

        // }

        // // schedules
        // try {
        //     // let schedules: any[] = [];
        //     // schedules.push( [DATA HERE] );
        //     // schedules.push( [DATA HERE] );
        // } catch (err) {

        // }

        // create document
        try {
            const bulkData = new BulkDataModel({
                uuid: profile.uuid,
                eventDate: eventDate,
                submitDate: new Date(),
                reports: reports,
                surveys: [],
                schedules: [],
                profile: profile,
            });
            return bulkData;

        } catch (err) {
            throw new Error(`RedcapMockService: failed to create bulk data, unable to create bulk document: ${err}`);
        }
    }

    /**
     * HELPER
     */
    private randIntRange(min: any, max: any): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    private randFloatRange(min: any, max: any): number {
        return Math.random() * (max - min) + min;
    }
}
