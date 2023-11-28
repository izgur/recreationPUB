import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { Location } from "../classes/location";
import { Comment } from "../classes/comment";
import { environment } from '../../../environments/environment';
import { User } from "../classes/user";
import { AuthResponse } from "../classes/auth-response";
import { BROWSER_STORAGE } from "../classes/storage";

@Injectable({
  providedIn: "root",
})
export class DbLocationDataService {
  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
    ) {}

  //private apiUrl = "http://localhost:3000/api";
  //private apiUrl = "https://lp-izgur-web-service.onrender.com/api";
private apiUrl = environment.apiUrl;

public getAllLocations(): Observable<Location[]> {
  const url: string = `${this.apiUrl}/locations/all`;
  return this.http
    .get<Location[]>(url)
    .pipe(retry(1), catchError(this.handleError));
}



  public getLocations(
    lng: number,
    lat: number,
    distance: number,
    nResults: number
  ): Observable<Location[]> {
    const url: string = `${this.apiUrl}/locations/distance?lng=${lng}&lat=${lat}&distance=${distance}&nResults=${nResults}`;
    return this.http
      .get<Location[]>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public getLocationDetails(locationId: string): Observable<Location> {
    const url: string = `${this.apiUrl}/locations/${locationId}`;
    return this.http
      .get<Location>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public addCommentToLocation(
    locationId: string,
    comment: Comment
  ): Observable<Comment> {
    const url: string = `${this.apiUrl}/locations/${locationId}/comments`;

    /*podatke damo v body*/
    let body = new HttpParams()
      .set("author", comment.author)
      .set("rating", comment.rating)
      .set("comment", comment.comment);

    /*simuliramo pošiljanje preko obrazca*/
    let headers = new HttpHeaders()
    .set( "Content-Type","application/x-www-form-urlencoded")
    .set( "Authorization", `Bearer ${this.storage.getItem("demo-token")}`);;
    return this.http
      .post<Comment>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  public deleteCommentFromLocation(
    locationId: string,
    commentId: string
  ): Observable<any> {
    const url: string = `${this.apiUrl}/locations/${locationId}/comments/${commentId}`;
    let headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${this.storage.getItem("demo-token")}`
    );
    return this.http.delete(url, {headers}).pipe(retry(1), catchError(this.handleError));
  }

  public login(user: User): Observable<AuthResponse> {
    return this.makeAuthApiCall("login", user);
  }
  public register(user: User): Observable<AuthResponse> {
    return this.makeAuthApiCall("register", user);
  }
  private makeAuthApiCall(
    urlPath: string,
    user: User
  ): Observable<AuthResponse> {
    const url: string = `${this.apiUrl}/${urlPath}`;
    let body = new HttpParams().set("email", user.email).set("name", user.name);
    if (user.password) body = body.set("password", user.password);
    if (user.nickname) body = body.set("nickname", user.nickname);
    if (user.role) body = body.set("role", user.role);
    let headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    return this.http
      .post<AuthResponse>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}