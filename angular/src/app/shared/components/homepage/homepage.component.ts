import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  template:  `<app-header [content]="header"></app-header>
              <div class="row">
                <div class="col-12 col-lg-10 col-md-10">
                  <app-location-list
                    (locationDescriptionEvent)="header.subtitle = $event"
                  ></app-location-list>
                </div>
                <app-sidebar class="col-12 col-md-2 mt-4" [content]="header.sidebar"></app-sidebar>
              </div>
              <br/><br/><br/>
              <h1 >ALL LOCATIONS</h1><br/>
              <div class="row">
                <div class="col-12 col-md-10">
                  <app-maps></app-maps>
                </div>
                <app-sidebar class="col-12 col-lg-2 col-md-2 mt-4"></app-sidebar><!-- [content]="header.sidebar"-->
              </div>`,
  styles: [
  ]
})
export class HomepageComponent {
  header = {
    title: "Rekreation possibilities",
    subtitle: "near you",
    sidebar:
      "Looking for an interesting location nearby? Our application helps you find places to explore when your out and without ideas. Do you have any special requirements? Let our application help you find the place you're looking for.",
  };
}
