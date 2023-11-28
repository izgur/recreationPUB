import { Component } from '@angular/core';

@Component({
  selector: 'app-eventpage',
  template:  `<app-header [content]="header"></app-header>
              <div class="row">
                <div class="col-12 col-md-10">
                  <app-event-list
                    (eventDescriptionEvent)="header.subtitle = $event"
                  ></app-event-list>
                </div>
                <app-sidebar class="col-12 col-md-2 mt-4" [content]="header.sidebar"></app-sidebar>
              </div>`,
  styles: [
  ]
})
export class EventpageComponent {
  header = {
    title: "Events ",
    subtitle: "near you",
    sidebar:
      "Looking for an interesting event nearby? Our application helps you find places to explore when your out and without ideas. Do you have any special requirements? Let our application help you find the place you're looking for.",
  };
}
