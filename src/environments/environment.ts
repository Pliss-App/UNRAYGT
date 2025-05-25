// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  socketUrl: 'https://unrayappserver.onrender.com',
  url: 'https://unrayappserver.onrender.com',

   /*  npm i @angular/fire@6.1.4 firebase@8.6.1
     socketUrl: 'https://unrayappserver.onrender.com',
  url: 'https://unrayappserver.onrender.com',
*/
  AZURE_FACE_ENDPOINT : 'https://eastus.api.cognitive.microsoft.com/face/v1.0/detect',
  AZURE_SUBSCRIPTION_KEY: '70uJX0QgwsiKoaCuZ4T2mC6zfQ5gkVtvUAoHxsCHiSfudusjmWHgJQQJ99BDACYeBjFXJ3w3AAAKACOGww4X'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
