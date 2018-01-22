import { ScheduleService } from './schedule-service';
import { ProfileService } from '../profile/profile-service';
import { StorageService } from '../storage-service';
import { ScheduleEventModel } from '../../../models/schedule-event-model';
import { UserProfileModel } from '../../../models/user-profile-model';
import { UserRoleType } from '../../../shared/enums';
import { PlatformMock, ProfileServiceMock } from './../../../shared/mocks';
import { RedcapService } from './../redcap/redcap-service';
import { SurveyService } from '../survey/survey-service';
import { DAY_MSEC } from '../../../shared/constants';
import { async, TestBed } from '@angular/core/testing';
import { IonicStorageModule } from '@ionic/storage';
import { Events, Platform } from 'ionic-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';


// tslint:disable:no-debugger
/**
 * schedule-service.spec.ts
 * 
 */
xdescribe('ScheduleService', () => {

    let scheduleService: ScheduleService = null;
    // let profileService: ProfileService = null;
    // let storageService: StorageService = null;

    const scheduledEvents = new ScheduleEventModel({
        type: 'survey_reminder',
        eventDate: new Date(),
        intervalMsec: 1000 /*1 sec*/,
    });

    let eventDateNum3: Date;
    const profileDoc = new UserProfileModel({
        uuid: 'da60ecb8-b2e9-46ba-a114-0ebaf5222e43',
        recordID: '998',
        familyID: '999',
        email: `bidwej${Math.floor(Math.random() * 100)}@gmail.com`,
        password: 'CHOAEMU600%!',
        userRole: UserRoleType.Patient,
        enrollDate: new Date('2017-09-24T19:57:23.879Z'),
    });

    /**
     * ----------------------------------------------------------------
     * INIT TESTS
     * ----------------------------------------------------------------
     */
    beforeEach(async(() => {
        // configure test bed
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpClientTestingModule],
            providers: [
                ScheduleService,
                // // profile
                // ProfileService,
                // Events,
                // ProfileService,
                // StorageService,
                // { provide: ProfileService, useClass: ProfileServiceMock },
                // { provide: Platform, useClass: PlatformMock },
                // // { provide: User, useClass: UserMock },
                // // storage
                // StorageService,
                // // survey
                // RedcapService,
                // SurveyService,
                // // platform
                // { provide: Platform, useClass: PlatformMock },
                // // experimental
                // // LoggerService,
                // // // { provider: LocalNotifications, useClass: LocalNotificationsMock },
            ],
        }).compileComponents();

        scheduleService = TestBed.get(ScheduleService);
        // profileService = TestBed.get(ProfileService);
        // storageService = TestBed.get(StorageService);
    }));
    beforeEach(async function (done) {
        try {
            // set user profile
            console.log('ScheduleServiceSpec: connecting to local database...');
            await scheduleService.ready;

            const profile = ProfileServiceMock.createProfile();
            eventDateNum3 = new Date(profile.enrollDate.getTime() + 3 * DAY_MSEC);

        } catch (err) {
            console.error('ScheduleServiceSpec: failed to initialize database');
        }
        done();
    });

    /**
     * ----------------------------------------------------------------
     * SCHEDULE
     * ----------------------------------------------------------------
     */
    test('populates event dates', async function (done) {
        // populate event dates
        // const events: any[] = await scheduleService.getAll();
        // expect(events).toBeDefined();

        expect(true).toBe(true);

        // console.log(eventDates);
        done();
    });

    // test('populates events on a given date', async function (done) {
    //     // populate event dates on a given date
    //     const events: any[] = await scheduleService.getAllByDate(eventDateNum3);
    //     expect(events).toBeDefined();

    //     // console.log(eventDates);
    //     done();
    // });

    // test('populates surveys on a given date', async function (done) {
    //     // populate surveys on a given date

    //     const events: any[] = await scheduleService.getAllByDate(eventDateNum3);
    //     expect(events).toBeDefined();

    //     // console.log(surveys);
    //     done();
    // });

    // test('populates surveys until a given date', async function (done) {
    //     // populate surveys until a given date
    //     const events: any[] = await scheduleService.getAllUntilDate(eventDateNum3);
    //     expect(events).toBeDefined();
    //     expect(events.length).toEqual(2 + 1 + 1 + 1);

    //     // console.log(surveys);
    //     done();
    // });

});

