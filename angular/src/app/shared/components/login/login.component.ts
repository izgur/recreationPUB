import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { User } from "../../classes/user";
import { AuthenticationService } from "../../services/authentication.service";
import { HistoryService } from "../../services/history.service";
import { ConnectionService } from "../../services/connection.service";

@Component({
  selector: "app-login",
  template: `
    <app-header [content]="header"></app-header>
    <div class="row">
      <div class="col-12 col-md-8">
        <p>
          Not a member? Please
          <a routerLink="/register" class="link-primary">register</a> first.
        </p>
        <form (ngSubmit)="onLoginSubmit()" autocomplete="off">
          <div *ngIf="formError" class="form-group">
            <div class="alert alert-dark p-2 mt-4" role="alert">
              <i class="fas fa-exclamation-triangle pe-2"></i>{{ formError }}
            </div>
          </div>
          <div class="form-group">
            <label for="email" class="form-label mb-1 mt-3"
              >E-mail address</label
            >
            <input
              type="text"
              class="form-control form-control-sm"
              id="email"
              name="email"
              placeholder="Enter e-mail address"
              [(ngModel)]="credentials.email"
            />
          </div>
          <div class="form-group">
            <label for="password" class="form-label mb-1 mt-3">Password</label>
            <input
              type="password"
              class="form-control form-control-sm"
              id="password"
              name="password"
              placeholder="Enter password"
              [(ngModel)]="credentials.password"
            />
          </div>
          <div class="form-group mt-3">
            <button type="submit" [disabled]="!isConnected()" class="btn btn-sm btn-primary me-2">
              <i class="fa-regular fa-circle-check pe-2"></i>Login
            </button>
          </div>
        </form>
      </div>
      <app-sidebar
        class="col-12 col-lg-3 mt-4"
        [content]="header.sidebar"
      ></app-sidebar>
    </div>`,
  styles: [],
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private historyService: HistoryService,
    private connectionService: ConnectionService
  ) {}
  protected formError!: string;
  protected credentials: User = {
    name: "",
    email: "",
    password: "",
  };
  public header = {
    title: "Sign in",
    subtitle: "",
    sidebar: "",
  };
  public isConnected(): boolean {
    return this.connectionService.isConnected;
  }
  public onLoginSubmit(): void {
    this.formError = "";
    if (
      !this.credentials.email ||
      !this.credentials.password
    )
      this.formError = "All fields are required, please try again.";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        this.credentials.email
      )
    )
      this.formError = "Please enter a valid e-mail address.";
    else if (this.credentials.password.length < 3)
      this.formError = "Password must be at least 3 characters long.";
    else this.doLogin();
  }
  private doLogin(): void {
    this.authenticationService
      .login(this.credentials)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.formError = error.toString();
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.router.navigateByUrl(this.historyService.getLastNonLoginUrl());
      });
  }
}