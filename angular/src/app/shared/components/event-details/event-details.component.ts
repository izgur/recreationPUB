import { Component, Input, TemplateRef, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Event } from "../../classes/event";
import { EventComment } from "../../classes/eventComment";
import { DbEventDataService } from "../../services/db-event-data.service";
import { AuthenticationService } from "../../services/authentication.service";
import { User } from "../../classes/user";
import { ConnectionService } from "../../services/connection.service";

@Component({
  selector: 'app-event-details',
  templateUrl: "./event-details.component.html",
  styles: [
  ]
})

export class EventDetailsComponent implements OnInit{
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    private dbEventDataService: DbEventDataService,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
    ) {}
  @Input() event!: Event;

  ngOnInit(): void {
    
  }

  public isConnected(): boolean {
    if (!this.connectionService.isConnected) this.closeModal();
    return this.connectionService.isConnected;
  }

  private updateAverageRating() {
    if (this.event && this.event.comments) {
      const count: number = this.event.comments.length;
      const total: number = this.event.comments.reduce((acc, { rating }) => {
        return acc + rating;
      }, 0);
      this.event.rating = Math.floor(total / count);
    } else {
      this.event.rating = 0;
    }
  }

  protected newComment: EventComment = {
    author: "",
    rating: 0,
    comment: ""
  };

  protected addNewComment() {
    this.formDataError = "";
    this.newComment.author = this.getCurrentUser();
    if (this.isFormDataValid()) {
      this.dbEventDataService
      .addCommentToEvent(this.event._id, this.newComment)
      .subscribe({
        next: (comment: EventComment) => {
          this.event?.comments?.unshift(comment);
          this.updateAverageRating();
          this.closeModal();
        },
        error: (err) => {
          this.formDataError = err || "Error adding comment.";
        },
      });
    } else {
      this.formDataError =
        "All fields required, including rating between 1 and 5.";
    }
  }
  protected formDataError!: string;
  private isFormDataValid(): boolean {
    let isValid = false;
    if (
      this.newComment.author &&
      this.newComment.rating &&
      this.newComment.comment &&
      this.newComment.rating >= 1 &&
      this.newComment.rating <= 5
    ) {
      isValid = true;
    }
    return isValid;
  }

  protected openModal(form: TemplateRef<any>) {
    this.modalRef = this.modalService.show(form, {
      class: "modal-dialog-centered",
      keyboard: false,
      ignoreBackdropClick: true
    });
  }

  protected closeModal() {
    this.newComment = {
      author: "",
      rating: 0,
      comment: "",
    };
    this.formDataError = "";
    this.modalRef?.hide();
  }

  protected deleteComment(commentId: string | undefined): void {
    if (commentId) {
      this.dbEventDataService
        .deleteEventCommentFromEvent(this.event._id, commentId)
        .subscribe({
          next: () => {
            this.event.comments = this.event.comments?.filter(
              (comment) => comment._id !== commentId
            );
            this.updateAverageRating();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  public canDeleteComment(comment: EventComment): boolean {
    console.log("1" + this.isLoggedIn());
    console.log("2" + this.getCurrentUserMail());
    console.log("3" + comment.author);
    return this.isLoggedIn() && this.getCurrentUserMail() === comment.author;
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public isAlreadyInEventUsers() : boolean {
    let isThisUser = false;
    if (this.isLoggedIn() && this.event.users) {
      isThisUser = this.event.users.find(user => user === this.getCurrentUserNickName()) !== undefined;
    }
    console.log("4:" + isThisUser);
    console.log("5:" + this.getCurrentUserNickName());
    console.log("6:" + this.isLoggedIn());
    return isThisUser;
  }
  public getCurrentUser(): string {
    const user: User | null = this.authenticationService.getCurrentUser();
    return user ? user.name : "Guest";
  }

  public getCurrentUserMail(): string {
    const user: User | null = this.authenticationService.getCurrentUser();
    return user ? user.email : "Guest";
  }

  public getCurrentUserNickName(): string {
    const user: User | null = this.authenticationService.getCurrentUser();
    console.log("7" + user?.nickname)
    return user?.nickname ? user.nickname : "guest";
  }

  protected addNewUser() {
    this.formDataError = "";
      this.dbEventDataService
      .addUserToEvent(this.event._id, this.getCurrentUserNickName())
      .subscribe({
        next: (user: string) => {
          this.event?.users?.unshift(user);
        },
        error: (err) => {
          this.formDataError = err || "Error adding comment.";
        },
      });
  }

  protected deleteUser() {
    this.formDataError = "";
      this.dbEventDataService
      .deleteUserFromEvent(this.event._id, this.getCurrentUserNickName())
      .subscribe({
        next: () => {
          this.event.users = this.event.users?.filter((user) => user !== this.getCurrentUserNickName());
          console.log("deleteUser: " + this.getCurrentUserNickName());

        },
        error: (err) => {
          this.formDataError = err || "Error deleting user.";
        },
      });
  }

}

