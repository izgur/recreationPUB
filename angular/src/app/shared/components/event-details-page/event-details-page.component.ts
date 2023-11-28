import { Component, OnInit } from '@angular/core';
import { DbEventDataService } from "../../services/db-event-data.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Event } from "../../classes/event";

@Component({
  selector: 'app-details-page',
  template: `<app-header [content]="header"></app-header>
              <div class="row">
                <div class="col-12 col-lg-10">
                  <app-event-details [event]="event"></app-event-details>
                </div>
                <app-sidebar
                  class="col-12 col-lg-2 mt-4"
                  [content]="header.sidebar"
                ></app-sidebar>
              </div>`,
  styles: [
  ]
})
export class EventDetailsPageComponent implements OnInit{

  constructor (
    public dbEventDataService: DbEventDataService,
    private route: ActivatedRoute){}

  event!: Event;

  ngOnInit(): void {
    this.route.paramMap
    .pipe(
      switchMap((params: ParamMap) => {
        let eventId: string = params.get("eventId") ?? "";
        return this.dbEventDataService.getEventDetails(eventId);
      })
    )
    .subscribe((event: Event) => {
      this.event=event;
      this.header = {
        title: event.name,
        subtitle: "",
        sidebar: `${event.name} is on our Recreation app we want to connect people`,
      };
    });
  }

  header = {
    title: "Recreation event name",
    subtitle: "",
    sidebar:
      "is on our Recreationg app to help you find recreation options next to your event.",
  };
}
