import { ReportService } from './report-service';
import { UserDataModel } from '../../../models/user-data-model';
import { PlatformMock } from './../../../shared/mocks';
import { UserDataType } from '../../../shared/enums';
import { TestBed } from '@angular/core/testing';
import { IonicStorageModule } from '@ionic/storage';
import { Events, Platform } from 'ionic-angular';

/**

 * report-service.spec.ts
 * 
 */
xdescribe('ReportService', () => {

    let reportService: ReportService = null;
    const reportDoc = new UserDataModel({});

    /**
    * ----------------------------------------------------------------
    * INIT TESTS
    * ----------------------------------------------------------------
    */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                ReportService,
                Events,
                { provide: Platform, useClass: PlatformMock },
            ],
            imports: [
                IonicStorageModule.forRoot()
            ]
        }).compileComponents();

        reportService = TestBed.get(ReportService);
    });

    /**
     * ----------------------------------------------------------------
     * STORAGE
     * ----------------------------------------------------------------
     */
    xit('adds report', async function (done) {
        done();
    });
    xit('removes report', async function (done) {
        done();
    });

    test('updates report', async function (done) {
        // updates a report via API
        try {
            // update/insert
            let updateDoc = Object.assign({}, reportDoc);
            expect(await reportService.update(updateDoc)).toBeDefined();

            // update/upsert
            // doc with same ID but a modified field
            updateDoc.eventSpan = 5;
            expect(await reportService.update(updateDoc)).toBeDefined();

            // remove report
            try {
                await reportService.remove(updateDoc);
            } catch (err) { /* continue */ }

        } catch (err) {
            console.error('ReportServiceSpec: failed to update report: ', err);
            expect(err).toBeNull();
        }
        done();
    });

    test('gets report', async function (done) {
        // gets a report via API
        try {
            // add report
            let resUpdate = await reportService.update(reportDoc);
            expect(resUpdate).toBeDefined();

            // get report
            let resGet = await reportService.get(reportDoc._id);
            expect(resGet).toBeDefined();

            // remove report
            try {
                await reportService.remove(reportDoc);
            } catch (err) { /* continue */ }

        } catch (err) {
            console.error('ReportServiceSpec: failed to get report: ', err);
            expect(err).toBeNull();
        }
        done();
    });

    test('get all reports', async function (done) {
        // gets all reports via API
        try {
            // add surveys
            let doc1 = new UserDataModel({ type: UserDataType.Exercise });
            let doc2 = new UserDataModel({ type: UserDataType.Sleep });
            await reportService.update(doc1);
            await reportService.update(doc2);

            // get survey
            let resGet = await reportService.getAll();
            expect(resGet).toBeDefined();

            // remove surveys
            try {
                await reportService.remove(doc1);
                await reportService.remove(doc1);
            } catch (err) { /* continue */ }

        } catch (err) {
            console.error('ReportServiceSpec: failed to get report: ', err);
            expect(err).toBeNull();
        }
        done();
    });

    test('get reports by date', async function (done) {
        // gets all reports via API
        try {
            // add report
            let resUpdate = await reportService.update(reportDoc);
            expect(resUpdate).toBeDefined();

            // get all reports
            let date: Date = reportDoc.eventDate;
            let dataType: UserDataType = reportDoc.dataType;
            let resGet = await reportService.getByDate(date, dataType);
            expect(resGet).toBeDefined();

            // get all reports by type
            let resGetType = await reportService.getByDate(date);
            expect(resGetType).toBeDefined();

            // remove report
            try {
                await reportService.remove(reportDoc);
            } catch (err) { /* continue */ }

        } catch (err) {
            console.error('ReportServiceSpec: failed to get report: ', err);
            expect(err).toBeNull();
        }
        done();
    });


});
