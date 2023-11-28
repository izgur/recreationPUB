import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TeachingDataService {
  constructor(private http: HttpClient) {}
  private apiUrl = "https://teaching.lavbic.net/api";
  public getAddress(lng: number, lat: number): Observable<any> {
    const url: string = `${this.apiUrl}/nominatim/reverse?lat=${lat}&lon=${lng}&format=geojson&addressdetails=1&zoom=16`;
    return this.http.get<any>(url).pipe(retry(1), catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}