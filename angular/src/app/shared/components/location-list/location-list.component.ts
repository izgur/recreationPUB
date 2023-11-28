import { Component, OnInit, Output, EventEmitter, Inject } from "@angular/core";
import { TeachingDataService } from "../../services/teaching-data.service";
import { DbLocationDataService } from "../../services/db-location-data.service";
import { GeolocationService } from "../../services/geolocation.service";
import { Location } from "../../classes/location";
import { BROWSER_STORAGE } from "../../classes/storage";

@Component({
  selector: "app-location-list",
  templateUrl: "./location-list.component.html",
  styles: [],
})
export class LocationListComponent implements OnInit {
  constructor(
    private dbLocationDataService: DbLocationDataService, 
    private teachingDataService: TeachingDataService,
    private geoLocationService: GeolocationService,
    @Inject(BROWSER_STORAGE) private storage: Storage
    ) {}
  ngOnInit() {
    /*this.getLocations();
      this.getCurrentLocationAddress();*/
    if (!this.storage.getItem("use-geolocation"))
      this.storage.setItem("use-geolocation", this.useGeolocation.toString());
    else
      this.useGeolocation =
        this.storage.getItem("use-geolocation") === "true" ? true : false;

    this.getCurrentLocation();
  }
  private DummyLocation  = {
    lng: 15.649,
    lat: 46.5568,
  };
  private filterLocations = {
    distance: 15,
    nResults: 10,
  };

  @Output() locationDescriptionEvent = new EventEmitter<string>();
  protected message!: string;
  protected useGeolocation: boolean = false;
  protected locations!: Location[];
  private currentLocation: any = {}; 

  protected toggleGeolocation(): void {
    this.useGeolocation = !this.useGeolocation;
    if (!this.useGeolocation) this.currentLocation = this.DummyLocation;
    this.storage.setItem("use-geolocation", this.useGeolocation.toString());
    this.getCurrentLocation();
  }


  private getLocations = (location: any) => {
    this.message = "Loading nearby locations ...";
    this.currentLocation = {
      lng: location.coords.longitude,
      lat: location.coords.latitude,
    };
    this.getCurrentLocationAddress(); 
    this.dbLocationDataService
      .getLocations(
        this.currentLocation.lng,
        this.currentLocation.lat + 0.1,
        this.filterLocations.distance,
        this.filterLocations.nResults
      )
      .subscribe((locations) => {
        this.message = locations.length > 0 ? "" : "No locations found!";
        this.locations = locations;
      });
  };

  private getCurrentLocationAddress(): void {
    this.teachingDataService
      .getAddress(this.currentLocation.lng, this.currentLocation.lat)
      .subscribe((address: any) => {
        let locationDescription = "near you";
        try {          
          address = address.features[0].properties.address;
          if (address.road && address.city){
            locationDescription = `near ${address.road}, ${address.city}`;
          }
          else if (address.city){
            locationDescription = `near ${address.city}`;
          } 
          else if (address.hamlet){
            locationDescription = `near ${address.hamlet}`;
          } 
        } catch (error) {
          this.displayError(
            new Error("Error getting current location address!")
          );
        } finally {
          this.locationDescriptionEvent.emit(locationDescription);
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
      this.message = "Getting current location ...";
        this.geoLocationService.getGeoLocation(
          this.getLocations,
          this.displayError,
          this.noGeoLocation
        );
        } else {
          this.getLocations({
            coords: {
              longitude: this.DummyLocation.lng,
              latitude: this.DummyLocation.lat - 0.1,
            },
          });
        }

  };
}


