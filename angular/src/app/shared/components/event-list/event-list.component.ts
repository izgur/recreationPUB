import { Component, OnInit, Output, EventEmitter, Inject } from "@angular/core";
import { TeachingDataService } from "../../services/teaching-data.service";
import { DbEventDataService } from "../../services/db-event-data.service";
import { GeolocationService } from "../../services/geolocation.service";
import { Event } from "../../classes/event";
import { BROWSER_STORAGE } from "../../classes/storage";
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { EventPaginationResponse } from "../../classes/eventPaginationResponse";

@Component({
  selector: "app-event-list",
  templateUrl: "./event-list.component.html",
  styles: []
})
export class EventListComponent implements OnInit {
  constructor(
    private dbEventDataService: DbEventDataService, 
    private teachingDataService: TeachingDataService,
    private geoLocationService: GeolocationService,
    @Inject(BROWSER_STORAGE) private storage: Storage
    ) {}

  ngOnInit() {
    if (!this.storage.getItem("use-geolocation"))
    this.storage.setItem("use-geolocation", this.useGeolocation.toString());
  else
    this.useGeolocation =
      this.storage.getItem("use-geolocation") === "true" ? true : false;

    this.getCurrentLocation();
    this.contentArray = this.contentArray.map((v: string, i: number) => {
    return ('Lineggergrt '+ (i + 1));
  });
     
  if (!this.storage.getItem("use-geolocation"))
    this.storage.setItem("use-geolocation", this.useGeolocation.toString());
  else
    this.useGeolocation =
      this.storage.getItem("use-geolocation") === "true" ? true : false;   
  }
  private DummyLocation  = {
    lng: 15.649,
    lat: 46.5538,
  };
  private filterEvents = {
    distance: 15,
    nResults: 10,
  };

  @Output() eventDescriptionEvent = new EventEmitter<string>();
  protected message!: string;
  protected useGeolocation: boolean = false;
  protected events: Event[] = [];
  private currentLocation: any = {}; 
  protected distance=0;
  contentArray: string[] = new Array(50).fill('');
  returnedArray: Event[] = new Array(50).fill('');
  protected totalItems = 0;
  protected currentPageNumber = 1;
  protected totalCount = 0;
  showBoundaryLinks: boolean = true;
  showDirectionLinks: boolean = true;

 pageChanged(pageevent: PageChangedEvent): void {
  if (this.events) {
    console.log("pageChanged2:" + pageevent.page)
    this.currentPageNumber = pageevent.page;
    this.getCurrentLocation();
    const startItem = (pageevent.page - 1) * pageevent.itemsPerPage;
    const endItem = pageevent.page * pageevent.itemsPerPage;
    this.returnedArray = this.events.slice(startItem, endItem);
  }
}

  protected toggleGeolocation(): void {
    this.useGeolocation = !this.useGeolocation;
    if (!this.useGeolocation) this.currentLocation = this.DummyLocation;
    this.storage.setItem("use-geolocation", this.useGeolocation.toString());
    this.getCurrentLocation();
  }


  private getEvents= (event: any) => {

    this.message = "Loading nearby events ...";
    this.currentLocation = {
      lng: event.coords.longitude,
      lat: event.coords.latitude,
    };
    this.getCurrentEventAddress(); 
    console.log("before getEventsPaginated currentPageNumber: ", this.currentPageNumber);
    this.dbEventDataService
    .getEventsPaginated(this.currentPageNumber, 10, this.currentLocation.lat, this.currentLocation.lng, this.filterEvents.distance)
    .subscribe((paginationResult: any) => {
      console.log("paginationResult currentPageNumber:" + paginationResult.currentPage);
      this.message = paginationResult.events.length > 0 ? "" : "No events found!";
      this.events = paginationResult.events;
      //this.currentPageNumber = paginationResult.currentPage;
      console.log("after getEventsPaginated currentPageNumber: ", this.currentPageNumber);
      this.totalCount = paginationResult.totalCount;
      /*console.log("paginationResult:" + JSON.stringify(paginationResult));
      console.log("paginationResult events:" + paginationResult.events);
      console.log("paginationResult currentPageNumber:" + paginationResult.currentPage);
      console.log("paginationResult totalCount:" + paginationResult.totalCount);*/
      //this.returnedArray = this.events.slice(0, 10);
    });
  };

  private getCurrentEventAddress(): void {
    console.log("test lng: " + this.currentLocation.lng);
    this.teachingDataService
      .getAddress(this.currentLocation.lng, this.currentLocation.lat)
      .subscribe((address: any) => {
        let eventDescription = "near you";
        try {          
          address = address.features[0].properties.address;
          if (address.road && address.city){
            eventDescription = `near ${address.road}, ${address.city}`;
          }
          else if (address.city){
            eventDescription = `near ${address.city}`;
          } 
          else if (address.hamlet){
            eventDescription = `near ${address.hamlet}`;
          } 
        } catch (error) {
          this.displayError(
            new Error("Error getting current location address!")
          );
        } finally {
          this.eventDescriptionEvent.emit(eventDescription);
        }
       });
  }
  private displayError = (error: any) => {
    this.message = error.message;
  };
  private noGeoLocation = () => {
    this.message = "Web browser does not support geolocation!";
  };
  private getCurrentLocation = () => {
    if (this.useGeolocation) {
      console.log("event geo active")
      this.message = "Getting current location ...";
        this.geoLocationService.getGeoLocation(
          this.getEvents,
          this.displayError,
          this.noGeoLocation
        );
        } else {
          console.log("event geo not active")
          this.getEvents({
            coords: {
              longitude: this.DummyLocation.lng,
              latitude: this.DummyLocation.lat,
            },
          });
        }

  };
}


