import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AzureFaceApiService {

  private readonly endpoint = `${environment.AZURE_FACE_ENDPOINT}`;
  private readonly subscriptionKey = `${environment.AZURE_SUBSCRIPTION_KEY}`;

  constructor(private http: HttpClient) { }

  detectFace(imageBase64: string) {
    const url = `${this.endpoint}`;

    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      'Content-Type': 'application/octet-stream'
    });

    // Convertir Base64 a Blob
    const byteString = atob(imageBase64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([intArray], { type: 'application/octet-stream' });

    return this.http.post(url, blob, { headers });
  }
}
