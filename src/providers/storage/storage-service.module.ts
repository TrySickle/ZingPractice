import { NgModule, ModuleWithProviders } from '@angular/core';

import { StorageService } from './storage-service';
import { ScheduleService } from './schedule/schedule-service';
import { RedcapService } from './redcap/redcap-service';
import { ProfileService } from './profile/profile-service';
import { SurveyService } from './survey/survey-service';
import { ReportService } from './report/report-service';
import { BulkService } from './bulk/bulk-service';

/**
 * Storage Module
 * 
 * Loads storage providers
 */
@NgModule({})
export class StorageServiceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: StorageServiceModule,
            providers: [
                // STORAGE
                StorageService,
                ScheduleService,
                RedcapService,
                ProfileService,
                RedcapService,
                SurveyService,
                ReportService,
                BulkService,
            ]
        };
    }
}

