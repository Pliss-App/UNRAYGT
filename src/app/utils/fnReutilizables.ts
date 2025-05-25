
declare var google: any;
/*
// src/app/utils/helpers.ts
export function reverseGeocoding(lat: number, lng: number): Promise<string | null> {
    return new Promise((resolve, reject) => {
      ttServices.services
        .reverseGeocode({
          key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
          position: { lat: lat, lng: lng },
        })
        .then((result: any) => {
          const direccion = result.addresses[0].address.freeformAddress;
          resolve(direccion);
        })
        .catch((error: any) => {
          console.error("Error en reverseGeocoding:", error);
          reject(error);
        });
    });
  } */
  


  export function reverseGeocoding(lat: number, lng: number) {
    return new Promise((resolve, reject) => {

      try {
        
  
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);
  
    geocoder.geocode({ location: latLng }, (results:any, status:any) => {
      if (status === 'OK') {
        if (results[0]) {

          resolve(results[0].formatted_address);
          // Aquí puedes usar la dirección como necesites
        } else {
        
          reject('No se pudo obtener direccion');
        }
      } else {

      }
    });
  } catch (error) {
    console.error("Error en reverseGeocoding:", error);
    reject(error);
  }
  });


 }  

  