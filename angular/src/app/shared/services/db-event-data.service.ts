import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { Location } from "../classes/location";
import { EventComment } from "../classes/eventComment";
import { environment } from '../../../environments/environment';
import { User } from "../classes/user";
import { AuthResponse } from "../classes/auth-response";
import { BROWSER_STORAGE } from "../classes/storage";
import { Event } from "../classes/event";

@Injectable({
  providedIn: "root",
})
export class DbEventDataService {
  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
    ) {}

  //private apiUrl = "http://localhost:3000/api";
  //private apiUrl = "https://lp-izgur-web-service.onrender.com/api";
private apiUrl = environment.apiUrl;

  public getEvents(
    lng: number,
    lat: number,
    distance: number,
    nResults: number
  ): Observable<Event[]> {
    const url: string = `${this.apiUrl}/events/distance?lng=${lng}&lat=${lat}&distance=${distance}&nResults=${nResults}`;
    return this.http
      .get<Event[]>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public getEventsPaginated(page: number, limit: number,  lat: number, lng: number, distance: number): Observable<any> {
    const url: string = `${this.apiUrl}/events/paginated?page=${page}&limit=${limit}&lat=${lat}&lng=${lng}&maxDistance=${distance}`;
    return this.http
    .get<any>(url)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getEventDetails(eventId: string): Observable<Event> {
    const url: string = `${this.apiUrl}/events/${eventId}`;
    return this.http
      .get<Event>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public addCommentToEvent(
    eventId: string,
    comment: EventComment
  ): Observable<EventComment> {
    const url: string = `${this.apiUrl}/events/${eventId}/comments`;

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
      .post<EventComment>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  public deleteEventCommentFromEvent(
    eventId: string,
    commentId: string
  ): Observable<any> {
    const url: string = `${this.apiUrl}/events/${eventId}/comments/${commentId}`;
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

  public addUserToEvent(
    eventId: string,
    user: string
  ): Observable<string> {
    const url: string = `${this.apiUrl}/events/${eventId}/users`;

    /*podatke damo v body*/
    let body = new HttpParams()
      .set("user", user);

    /*simuliramo pošiljanje preko obrazca*/
    let headers = new HttpHeaders()
    .set( "Content-Type","application/x-www-form-urlencoded")
    .set( "Authorization", `Bearer ${this.storage.getItem("demo-token")}`);;
    return this.http
      .post<string>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  public deleteUserFromEvent(
    eventId: string,
    user: string
  ): Observable<any> {
    const url: string = `${this.apiUrl}/events/${eventId}/users/${user}`;
    let headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${this.storage.getItem("demo-token")}`
    );
    let body = new HttpParams()
    .set("user", user);

    return this.http.delete(url, {headers}).pipe(retry(1), catchError(this.handleError));
  }
}