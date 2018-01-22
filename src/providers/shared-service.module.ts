import { NgModule, ModuleWithProviders } from '@angular/core';

import { NotificationService } from './notification/notification-service';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SurveyControlService } from './storage/survey/survey-control-service';

/**
 * Shared Module
 * 
 * Loads shared providers
 */
@NgModule({})
export class SharedServiceModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedServiceModule,
            providers: [
                SurveyControlService,
                // EXPERIMENTAL
                NotificationService,
            ]
        };
    }
}

