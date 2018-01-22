
//---------------------------------------------------
// import 'rxjs/add/operator/map';

    // async getRevDates(): Promise<string[]> {
    //     // list survey revision dates in database
    //     try {
    //         return undefined;
    //     } catch (err) {
    //         console.warn('SurveyService: failed to get revision dates in local storage');
    //         return undefined;
    //     }
    // }

    // async pullRevDates(): Promise<string[]> {
    //     // list survey revision dates from redcap
    //     try {
    //         return undefined;
    //     } catch (err) {
    //         console.warn('SurveyService: failed to pull revision dates from redcap');
    //         return undefined;
    //     }
    // }

       // async findByName(instrName: string): Promise<SurveyFormModel> {
    //     // find instrument by name
    //     let findDocs;
    //     try {
    //         findDocs = await this.storage.pouchDB.find({
    //             selector: {
    //                 collectionName: { $eq: 'survey' },
    //                 formName: { $eq: instrName },
    //                 limit: 1,
    //             }
    //         });
    //     } catch (err) {
    //         console.warn(`SurveyService: warning, failed to get instrument by name, unable to find document\n${err}`);
    //         throw new Error('404');
    //     }
    //     if (findDocs.warning.includes('no matching index found')) {
    //         console.warn(`SurveyService: warning, failed to get instrument by name, no matching index found\nform name: ${instrName}`);
    //         throw new Error(findDocs);
    //     }
    //     //select first document
    //     let doc: SurveyFormModel = findDocs.docs[0];
    //     return doc;
    // }

    //     async getAll(): Promise<any> {
    //         // get all survey documents from the local storage
    //         try {
    //             // find all instrument names in local storage if exists
    //             return await this.pouchDB.find({
    //                 selector: { collectionName: { $eq: 'survey' } },
    //             });
    //         } catch (err) {
    //             // otherwise, pull instrument from redcap server
    //             if (err.status === '404') {
    //                 console.error('SurveyService: failed to get all instruments from local storage, no data present: ', err);
    //             }
    //             else {
    //                 console.error('SurveyService: failed to get all instruments from local storage, unable to access data: ', err);
    //             }
    //             return undefined;
    //         }
    //     }




    // //------------------- CONFIRM AND DELETE -------------------------
    // //     async pullInstrument(instrName: string): Promise<any> {
    // //         
    // //         let instrDoc: SurveyFormModel;
    // //         try {
    // //             //console.log(`SurveyService: updating instrument\n"${instrName}"`);
    // //             instrDoc = await this.redcap.getInstrumentByName(instrName);
    // //         } catch (err) {
    // //             console.warn('SurveyService: failed to replicate instrument, unable to find instrument or get fields from redcap');
    // //             return undefined;
    // //         }
    // //         // store instruments in local storage
    // //         try {
    // //             return await this.update(instrDoc); // return Promise.resolve(ref);
    // //         } catch (err) {
    // //             console.warn('SurveyService: failed to replicate instrument, unable to access local storage');
    // //             return undefined;
    // //         }
    // //     }
    // //------------------- CONFIRM AND DELETE -------------------------

    // //     async pullInstruments(): Promise<any> {
    // //         // pull/replicate local storage with latest instruments from redcap
    // //         let replicateRefs = [];

    // //         // get instrument names from local storage
    // //         let instrNames;
    // //         try {
    // //             instrNames = await this.listInstruments();
    // //         } catch (err) {
    // //             console.warn('SurveyService: warning, instrument names not in local storage, pulling from redcap');
    // //         }

    // //         // get instrument names from redcap if none are found
    // //         if (!instrNames) {
    // //             console.log(`SurveyService: searching redcap for instrument names`);
    // //             try {
    // //                 instrNames = await this.redcap.listInstruments();
    // //             } catch (err) {
    // //                 throw new Error(`SurveyService: failed to update local instrument names, 
    // //                   unable to get names from redcap\n${err}`);
    // //             }
    // //         }

    // //         // get instrument fields
    // //         for (let i = 0; i < instrNames.length; i++) {
    // //             console.log(`SurveyService: searching for document (${i + 1}/${instrNames.length})`);
    // //             try {
    // //                 let ref = await this.pullInstrument(instrNames[i]);
    // //                 replicateRefs.push(ref);
    // //                 console.log(`SurveyService: creating document (${i + 1}/${instrNames.length})`);

    // //             } catch (err) {
    // //                 console.warn(`SurveyService: failed to pull/update instrument in local storage`);
    // //                 continue;
    // //             }
    // //         }
    // //         // return local instrument references
    // //         return Promise.resolve(replicateRefs);
    // //     }

    // async listInstrumentNames(): Promise<string[]> {
    //     // list survey instrument names
    //     try {
    //         return await this.storage.pouchDB.find({
    //             selector: { collectionName: { $eq: 'survey' } },
    //             fields: ['formName'],
    //         });
    //     } catch (err) {
    //         console.error('SurveyService: failed to get document: ', err);
    //         return undefined;
    //     }
    // }


//------------------------------------------------------------------------

// async storageStats(): Promise<string> {
//     // creates a string with storage statistics
//     if (!this.pouchDB) {
//         console.error(this.disconnectWarning('failed to get all documents'));
//         return undefined;
//     }
//     // get all document in database storage
//     let getAllDocs: any;
//     try {
//         // Each row has a .doc object and we just want to send an
//         // array of exercise objects back to the calling controller,
//         // so let's map the array to contain just the .doc objects.
//         getAllDocs = await this.pouchDB.allDocs({
//             include_docs: true,
//             attachments: true,
//         });
//     } catch (err) {
//         console.error('StorageService: failed to get all documents: ', err);
//         return undefined;
//     }
//     let docs: SurveyFormModel[] = getAllDocs.rows;
//     let numDocs = docs.length.toString();

//     console.log('StorageService: statistics: Num docs: ', numDocs);
//     return numDocs;
// }

//------------------------------------------------------------------------


    // try {
    //     let survey: SurveyFormModel = await this.redcap.listInstruments();
    //     console.warn('SurveyService: warning, instrument not in local storage, pulling from redcap');
    //     return Promise.resolve(survey);

    // } catch (err) {
    //     console.warn('SurveyService: failed to get instrument from local storage, unable to pull from redcap');
    //     return undefined;
    // }

    // getAll(): Promise < any > {
    //   // get all survey documents
    //   // see: https://nolanlawson.github.io/pouchdb-find/
    //   return this.db.pouchDB.createIndex({
    //     index: { fields: ['collectionName'] }
    //   }).then(() => {
    //     return Promise.resolve(this.db.pouchDB.find({ selector: { collectionName: { $eq: 'survey' } } }));
    //   }).catch((err) => {
    //     console.error('SurveyService: failed to get all documents: ', err);
    //   });
    // }

//------------------------------------------------------------------------

// create(doc: any): Promise<any> {
    //     // create a survey document
    //     return this.storage.create(doc).catch((err) => {
    //         console.error('SurveyService: failed to save document: ', err);
    //     });
    // }

    // update(doc: any): Promise<any> {
    //     // update/upsert a survey document
    //     return this.storage.update(doc).catch((err) => {
    //         console.error('SurveyService: failed to save document: ', err);
    //     });
    // }

    // remove(docID: any): Promise<any> {
    //     // remove a survey document
    //     return this.storage.remove(docID).catch((err) => {
    //         console.error('SurveyService: failed to remove document by ID: ', err);
    //     });
    // }

    // get(instrName: string) {
    //   return this.db.pouchDB.createIndex({
    //     selector: { formName: instrName }
    //   });


    // }).then(() => {
    //   return Promise.resolve(this.db.pouchDB.find({
    //     selector: {
    //       collectionName: { $eq: 'survey' }
    //     }
    //   }));

    // }).catch((err) => {
    //   console.error('SurveyService: failed to get all documents: ', err);
    // });


//------------------------------------------------------------------------


    // async getRedcapSurveyNames(role: string): Promise<any> {
    //     // get survey instrument names from redcap
    //     let instrNames;
    //     try {
    //         // console.log('SurveyService: getting redcap instrument names.');
    //         instrNames = await this.redcap.listInstrumentsByRole(role);

    //     } catch (err) {
    //         console.error('SurveyService: failed to create storage, unable to get redcap data');
    //         return undefined;
    //     }
    //     return Promise.resolve(instrNames);
    // }

//------------------------------------------------------------------------

// get(docID: any): Promise<any> {
//     // get a survey document 
//     return this.db.get(docID).catch((err) => {
//       console.error('SurveyService: failed to get document: ', err);
//     });
//   }

//------------------------------------------------------------------------

   // return this.db.find({ collection: 'user-survey' }).catch((err) => {
    //   console.error('SurveyService: failed to get documents: ', err);
    // });

//------------------------------------------------------------------------

  // getSurvey(userRole: string, formName: string) {

  //   // //------------
  //   // // TEMP DATASET
  //   // let morning_patient_fields: Array<SurveyFieldModel>;
  //   // let morning_patient = new SurveyFormModel({
  //   //   formName: 'morning',
  //   //   formAnnotation: '',
  //   //   formFields: morning_patient_fields,
  //   //   variableName: 'morning_survey_patient',
  //   // });

  //   // let morning_caregiver_fields: Array<SurveyFieldModel>;
  //   // let morning_caregiver = new SurveyFormModel({
  //   //   formName: 'morning',
  //   //   formAnnotation: '',
  //   //   formFields: morning_caregiver_fields,
  //   //   variableName: 'morning_survey_caregiver',
  //   // });
  //   //------------

  //   // let isUserPatient = (userRole === 'Patient');
  //   // switch (formName) {
  //   //   case 'morning':
  //   //     return (isUserPatient) ? morning_patient : morning_caregiver;
  //   //   case 'weekly':
  //   //     return (isUserPatient) ? morning_patient : morning_caregiver;
  //   //   case 'seizure':
  //   //     return (isUserPatient) ? morning_patient : morning_caregiver;
  //   //   default:
  //   //     console.log(`UserSurvey: failed to get patient survey form ${formName} for ${userRole}, continuing`);
  //   //     return;
  //   // }

  // }



  // });

  // getSurveys(options) {

  //   return new Promise(resolve => {
  //     let headers = new Headers();
  //     headers.append('Content-Type', 'application/json');

  //     this.http.post('http://localhost:8080/api/rooms', JSON.stringify(options), { headers: headers })
  //       .map(res => res.json())
  //       .subscribe(data => {
  //         resolve(data);
  //       });
  //   });

  // }

  // submitSurvey(data) {

  //   return new Promise(resolve => {

  //     let headers = new Headers();
  //     headers.append('Content-Type', 'application/json');

  //     this.http.post('http://localhost:8080/api/rooms/reserve', JSON.stringify(data), { headers: headers })
  //       .subscribe((data) => {
  //         resolve(data);
  //       });

  //   });
  // }


