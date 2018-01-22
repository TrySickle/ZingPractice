import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from 'rxjs';

import { StorageService } from '../storage/storage-service';
import { ProfileService } from '../storage/profile/profile-service';
import { ScheduleService } from '../storage/schedule/schedule-service';
import { ScheduleEventModel } from '../../models/schedule-event-model';
import { ScheduleEventType } from '../../shared/enums';

/*
  NotificationService provider.

  subscribe to scheduled event changes and present notifications
  
  observables tutorial
  see: https://tutel.me/c/programming/questions/42593227/ionic+2+schedule+a+service
*/
@Injectable()
export class NotificationService {

  private scheduledEvents: ScheduleEventModel[];
  private readyPromise: Promise<any>;

  constructor(
    private platform: Platform,
    private storage: StorageService,
    private profile: ProfileService,
    // private notifications: LocalNotifications,
    private schedule: ScheduleService,
  ) {
    // TODO: move notifications 'subscription' to 'schedule service' and listen for 'reminder' events

    // schedule notifications
    // this.readyPromise = this.scheduleAllByDate(new Date());
  }

  // public get ready(): Promise<boolean> {
  //   // resolves after notifications are scheduled
  //   if (!this.readyPromise) {

  //     this.readyPromise = (async () => {
  //       await this.scheduleAllByDate();
  //     })();
  //   }
  //   return this.readyPromise;
  // }

  // /**
  //  * METHODS
  //  */
  // public async scheduleAllByDate(eventDate?: Date): Promise<void> {
  //   // schedule notifications for a given date
  //   await this.storage.ready;

  //   // set defaults
  //   if (!eventDate) { eventDate = new Date(); }

  //   try {
  //     // unsubscribe/subscribe to scheduled events
  //     let scheduled = await this.schedule.getAllByDate(eventDate, ScheduleEventType.Reminder);

  //     // unsubscribe
  //     if (this.scheduledEvents) {
  //       this.unsubscribe(this.scheduledEvents);
  //     }

  //     // subscribe
  //     this.scheduledEvents = scheduled;
  //     this.subscribe(this.scheduledEvents);

  //     console.log(`NotificationService: subscribe to scheduled events: success`);
  //     this.printNotficationStatus();

  //   } catch (err) {
  //     console.error(`NotificationService: failed to subscribe initialize notfications: ${err}`);
  //   }
  // }

  // private subscribe(scheduledEvents: Array<ScheduleEventModel>): void {
  //   // subscribe to scheduled events
  //   for (let event of scheduledEvents) {

  //     // set subscriber to fire every interval 
  //     // inner observable fires when source emits
  //     event.source = Observable.timer(
  //       Math.abs(event.timeUntilEventMsec),
  //       event.repeatTimeFromEventMsec
  //     );
  //     event.subscribe = event.source
  //       .switchMap((value: any, index: number): Promise<any> => {
  //         return this.eventTriggered(event);
  //       })
  //       .subscribe((res) => this.triggeredEventCompleted(res));
  //   }
  // }

  // private unsubscribe(scheduled: Array<ScheduleEventModel>): void {
  //   // unsubscribe from all events
  //   for (let event of scheduled) {
  //     if (event.subscribe) {
  //       event.subscribe.unsubscribe();
  //     }
  //   }
  // }

  // protected printNotficationStatus() {
  //   // print notification status
  //   if (!this.scheduledEvents) {
  //     console.log(`NotificationService: failed to print notification status, no scheduled events`);
  //     return;
  //   }
  //   for (let scheduled of this.scheduledEvents) {
  //     console.log(`NotificationService: ${scheduled.eventType}: ${scheduled.eventDate}, status: ${scheduled.isComplete}`);
  //   }
  // }

  // /**
  // * EVENTS
  // */
  // private async eventTriggered(schedule: ScheduleEventModel): Promise<void> {
  //   // present notification 
  //   console.log(`ScheduleService: trigered event '${schedule.eventType}', continuing`);

  //   if (schedule.eventType === ScheduleEventType.Reminder) {
  //     switch (schedule.eventName) {
  //       case 'fitbit': await this.presentFitbitLaunchNotification(); break;
  //       default: await this.presentSurveyReminderModal(); break;
  //     }
  //   }
  // }

  // private triggeredEventCompleted(res: any) {
  //   // console.log(`NotificationService: triggered event completed: ${res}`);
  // }

  // ngOnDestroy() {
  //   this.unsubscribe(this.scheduledEvents);
  // }

  // /**
  //  * MODALS
  //  */
  // public presentSurveyReminderModal(): Promise<string> {
  //   // notify the user to complete survey

  //   console.log('ScheduleService: notify the user to complete survey');
  //   return Promise.resolve('Please complete survey');
  // }

  // public presentFitbitLaunchNotification(): Promise<string> {
  //   // notify the user to launch Fitbit app

  //   let title: string = 'Please launch the Fitbit app';
  //   let options = {
  //     body: 'message content',
  //     icon: 'assets/img/portrait.jpg',
  //     sound: 'file://assets/chime.mp3',
  //   };
  //   if (this.platform.is('cordova')) {
  //     const delayMsec = 1000; // 1 second
  //     // this.notifications.schedule({
  //     //   text: title,
  //     //   at: new Date(new Date().getTime() + delayMsec),
  //     //   sound: options.sound,
  //     //   data: { message: options.body }
  //     // });
  //   }
  //   else { // otherwise, schedule web-browser
  //     Notification.requestPermission().then((response) => {
  //       console.log(response);
  //     });
  //     let notification = new Notification(title, options);
  //   }
  //   return Promise.resolve('Please launch the Fitbit app');
  // }

}



//--------------------------------------------------------



  // public set notifications(events: Array<ScheduleEventModel>) {
  //   // set scheduled events
  //   this.unsubscribe(this.scheduledEvents);
  //   this.scheduledEvents = events;

  //   this.subscribe(this.scheduledEvents);
  // }

//--------------------------------------------------------


// Example cancel observables on 'ngOnDestroy'
// private isScheduleAlive: boolean = true;

// event.source = Observable.timer(offsetMsec, 1000);
// event.subscribe = event.source
//   .switchMap((doc: any) => this.eventTriggered(doc))
//   .takeWhile(() => this.isScheduleAlive)
//   .subscribe(res => this.eventCompleted(res));
// }

//---------------------------------------------------
// /*
//   Generated class for the NotificationService component.

//   See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
//   for more info on Angular 2 Components.
// */

// export interface ITimer {
//   seconds: number;
//   secondsRemaining: number;
//   runTimer: boolean;
//   hasStarted: boolean;
//   hasFinished: boolean;
//   displayTime: string;
// }

// @Injectable()
// export class NotificationService {

//   public message: string = 'Reminder: Please complete your daily survey';
//   private timeInSeconds: number;
//   public timer: ITimer;

//   constructor(
//     private platform: Platform,
//     private toastCtrl: ToastController,
//     public events: Events) {
//     this.platform.ready().then((readySource) => {

//       // console.log('Platform ready from', readySource);
//       // this.startNotificationCountdown();
//     });
//   }

//   triggerNotificationEvent() {
//     this.events.publish('user:notifications', this.message, Date.now());
//   }

//   triggerToastNotification() {
//     let toast = this.toastCtrl.create({
//       message: this.message,
//       position: 'top',
//       showCloseButton: true
//     });
//     toast.onDidDismiss(() => {
//       // console.log('Dismissed toast');
//     });
//     toast.present();
//   }

//   triggerPushNotification() {
//     // see: https://github.com/aggarwalankush/ionic2-push-base
//   }


//   //----------------DEBUG COUNTDOWN ------------------------
//   startNotificationCountdown() {
//     console.log('Notifications Provider: init notification countdown');
//     this.initTimer();
//     this.startTimer();
//   }

//   hasFinished() {
//     return this.timer.hasFinished;
//   }

//   initTimer() {
//     this.timeInSeconds = 3;
//     this.timer = <ITimer>{
//       seconds: this.timeInSeconds,
//       runTimer: false,
//       hasStarted: false,
//       hasFinished: false,
//       secondsRemaining: this.timeInSeconds
//     };
//   }

//   startTimer() {
//     this.timer.hasStarted = true;
//     this.timer.runTimer = true;
//     this.timerTick();
//   }

//   pauseTimer() {
//     this.timer.runTimer = false;
//   }

//   resumeTimer() {
//     this.startTimer();
//   }

//   timerTick() {
//     console.log(`Notifications Provider: countdown: ${this.timer.secondsRemaining}`);
//     setTimeout(() => {
//       // skip countdown if timer is paused
//       if (this.timer.runTimer === false) { return; }

//       // proceed or display notification
//       this.timer.secondsRemaining--;
//       if (this.timer.secondsRemaining > 0) {
//         this.timerTick();
//       }
//       else {
//         this.timer.hasFinished = true;
//         // this.presentToastNotification();
//         this.triggerNotificationEvent();
//       }
//     }, 1000);
//   }

// }
