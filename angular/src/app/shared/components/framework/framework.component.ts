import { Component } from "@angular/core";
import { User } from "../../classes/user";
import { AuthenticationService } from "../../services/authentication.service";
import { HistoryService } from "../../services/history.service";
import { ConnectionService } from "../../services/connection.service";

@Component({
  selector: 'app-framework',
  templateUrl: "./framework.component.html",
  styles: [
  ]
})
export class FrameworkComponent {
  constructor(
    private authenticationService: AuthenticationService,
    private historyService: HistoryService,
    private connectionService: ConnectionService
  ) {}
  public logout(): void {
    this.authenticationService.logout();
  }
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
  public getCurrentUser(): string {
    const user: User | null = this.authenticationService.getCurrentUser();
    return user ? user.name : "Guest";
  }
  public isConnected(): boolean {
    return this.connectionService.isConnected;
  }
}