import { Component, OnInit } from '@angular/core';
import { DbLocationDataService } from "../../services/db-location-data.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Location } from "../../classes/location";

@Component({
  selector: 'app-details-page',
  template: `<app-header [content]="header"></app-header>
              <div class="row">
                <div class="col-12 col-lg-10">
                  <app-location-details [location]="location"></app-location-details>
                </div>
                <app-sidebar
                  class="col-12 col-lg-2 mt-4"
                  [content]="header.sidebar"
                ></app-sidebar>
              </div>`,
  styles: [
  ]
})
export class DetailsPageComponent implements OnInit{

  constructor (
    public dbLocationDataService: DbLocationDataService,
    private route: ActivatedRoute){}

  location!: Location;

  ngOnInit(): void {
    this.route.paramMap
    .pipe(
      switchMap((params: ParamMap) => {
        let locationId: string = params.get("locationId") ?? "";
        return this.dbLocationDataService.getLocationDetails(locationId);
      })
    )
    .subscribe((location: Location) => {
      this.location=location;
      this.header = {
        title: location.name,
        subtitle: "",
        sidebar: `${location.name} is on our Recreation app we want to connect people`,
      };
    });
  }

  header = {
    title: "Recreation location name",
    subtitle: "",
    sidebar:
      "is on our Recreationg app to help you find recreation options next to your location.",
  };
}
