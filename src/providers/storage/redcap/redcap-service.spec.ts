import { PlatformMock } from './../../../shared/mocks';
import { TestBed, async } from '@angular/core/testing';

import { RedcapService } from './redcap-service';
import { Platform } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

// tslint:disable:no-debugger

/**
 * redcap-service.spec.ts
 * 
* reference on injecting services
* see: https://semaphoreci.com/community/tutorials/testing-angular-2-http-services-with-jasmine
*      http://chariotsolutions.com/blog/post/testing-http-services-angular-2-jasmine/
*      https://www.joshmorony.com/test-driven-development-in-ionic-2-http-and-mocks/
*      https://blog.thoughtram.io/angular/2016/11/28/testing-services-with-http-in-angular-2.html
*
 * see: https://github.com/ionic-team/ionic-unit-testing-example/tree/dc914c57eba79a83487a2b18f05c28cc9d77fdf5
 */
xdescribe('RedcapService', () => {

    let redcapService: RedcapService;

    /**
     * ----------------------------------------------------------------
     * INIT TESTS
     * ----------------------------------------------------------------
     */
    beforeEach(async(() => {
        // configure test bed
        TestBed.configureTestingModule({
            providers: [
                RedcapService,
                { provide: Platform, useClass: PlatformMock }
            ],
            imports: [HttpClientModule]
        }).compileComponents();

        redcapService = TestBed.get(RedcapService);
    }));

    /**
     * ----------------------------------------------------------------
     * REDCAP
     * ----------------------------------------------------------------
     */
    test('should be able make http requests', async function (done) {

        // const profile = await auth.login('b1@gmail.com', 'b1');
        // expect(profile).toBeDefined();

        // console.log(`AuthServiceSpec: ${JSON.stringify(profile)}`);

        const nextRecordID = await redcapService.getNextRecordName();
        expect(nextRecordID).toBeDefined();

        console.log(`RedcapServiceSpec: next record: ${nextRecordID}`);

        done();
    });

    // test('get instruments for a given record ID', async function (done) {
    //     // get records by ID
    //     try {
    //         const recordID = '1';
    //         let records = await redcapService.getRecordsByID(recordID);
    //         // console.log(`listing instrument fields for record ID ${recordID}`);
    //         // console.log(`${JSON.stringify(records)}`);

    //         expect(records).toBeDefined();

    //     } catch (err) {
    //         console.error(`RedcapService: failed to get instruments by record ID\n${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('pull record IDs', async function (done) {
    //     // get record IDs for a given instrument
    //     try {
    //         // export record to get upload filename
    //         let filterIncomplete = false;
    //         let res = await redcapService.getRecordIDs(filterIncomplete);

    //         console.log(`listing record IDs:`, res);
    //         expect(res).toBeDefined();

    //     } catch (err) {
    //         console.error(`RedcapService: failed to get record IDs\n${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // xit('pushes a file to redcap', async function (done) {
    //     // push/upload a file to redcap
    //     done();
    // });


    // xit('pulls a file from redcap', async function (done) {
    //     // pull/download a file to redcap
    //     //     try {
    //     //         let params: any = {
    //     //             recordID: profile.data.recordID,
    //     //             field: 'cdaily_upload',
    //     //             event: 'enrollment_arm_2',
    //     //         }
    //     //         let res = await redcapService.pullFileBuffer(
    //     //             params.recordID,
    //     //             params.field,
    //     //             params.event
    //     //         );
    //     //         expect(res.status).toEqual(200);

    //     //     } catch (err) {
    //     //         console.error(`RedcapService: failed to pull/download file\n${err}`);
    //     //         expect(err).toBeNull();
    //     //     }
    //     done();
    // });

    // test('sign up user on redcap', async function (done) {
    //     // sign up user by creating and assigning a new record ID
    //     try {
    //         let recordID = await redcapService.signup(profile);
    //         console.log(`RedcapServiceSpec: sign up user succeeded, recordID: ${recordID}`);
    //         expect(recordID).toBeDefined();

    //     } catch (err) {
    //         console.error(`RedcapService: failed to sign up user\n${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // test('get all instrument names', async function (done) {
    //     // get survey instruments
    //     try {
    //         let instrNames = await redcapService.getInstrumentNames();
    //         // console.log(`listing all instrument names: ${JSON.stringify(instrNames)}`);
    //         expect(instrNames).toBeDefined();

    //     } catch (err) {
    //         console.error(`RedcapService: failed to get instrument names\n${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

    // // test('get instrument names by role', async function (done) {
    // //     // get survey instruments
    // //     try {
    // //         let role = UserRoleType.Patient;
    // //         let instrNames = await redcapService.getInstrumentNamesByRole(role);

    // //         console.log(`listing instrument names by role: ${JSON.stringify(instrNames)}`);
    // //         expect(instrNames).toBeDefined();

    // //     } catch (err) {
    // //         console.error(`RedcapService: failed to get instrument names\n${err}`);
    // //         expect(err).toBeNull();
    // //     }
    // //     done();
    // // });

    // test('get instrument fields', async function (done) {
    //     // get instrument field names
    //     try {
    //         // get instrument names
    //         let instrNames = await redcapService.getInstrumentNames();
    //         expect(instrNames).toBeDefined();

    //         // get instrument fields
    //         let fields = await redcapService.getInstrumentFields(instrNames[instrNames.length - 1]);
    //         // console.log('listing instrument fields: ', fields);
    //         expect(fields).toBeDefined();

    //     } catch (err) {
    //         console.error(`RedcapService: failed to get instrument fields\n${err}`);
    //         expect(err).toBeNull();
    //     }
    //     done();
    // });

});