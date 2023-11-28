import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  public getGeoLocation(
    cbSuccess: PositionCallback,
    cbError: PositionErrorCallback,
    cbNoLocation: any
  ): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    } else {
      cbNoLocation();
    }
  }
}
