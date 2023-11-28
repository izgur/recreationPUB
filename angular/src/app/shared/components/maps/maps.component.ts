import { Component, Input } from '@angular/core';
import { Location } from '../../classes/location';
import { DbLocationDataService } from "../../services/db-location-data.service";
 import * as Leaflet from 'leaflet';

 Leaflet.Icon.Default.imagePath = 'assets/';

 @Component({
 selector: 'app-maps',
 templateUrl: './maps.component.html',
 styleUrls: ['./maps.component.css']
 })
 export class MapsComponent {

    constructor(
        private dbLocationDataService: DbLocationDataService
        ) {}
     FRI_LAT = 46.5568;
     FRI_LNG = 15.649;

     protected message!: string;
     protected useGeolocation: boolean = false;
     //protected locations: Location[] = [];
     @Input() locations!: Location[];

     // Seznam markerjev imamo na voljo v primeru, ko jih želimo posodabljat, odstranjevat z mape itd.
     markers: Leaflet.Marker[] = [];

     // Ustvarimo objekt mapa ter dodamo osnovne lastnosti mapi
     map!: Leaflet.Map;
     options = {
         layers: [
             Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">DevOps tečaj</a>'
             })
         ],
         zoom: 9,
         center: {lat: this.FRI_LAT, lng: this.FRI_LNG}
     }

     dodajMarker(lastnosti: any): void {
         // Ustvarimo marker
         const marker = Leaflet.marker(lastnosti.pozicija, {draggable: lastnosti.premicnost});

         // Dodamo marker globalnemu seznamu
         this.markers.push(marker);

         // Dodamo dodatne lastnosti markerju;
         marker.on('click', (event) => this.markerClicked(event, this.markers.length));
         marker.on('dragend', (event) => this.markerDragEnd(event, this.markers.length));

         // Izpišemo želeno sporočilo v oblaček
         marker.addTo(this.map).bindPopup(lastnosti.oblacek);
         this.map.panTo(lastnosti.pozicija);
         this.markers.push(marker);
     }

     onMapReady($event: Leaflet.Map) {
        this.map = $event;
        this.message = "Loading all possible locations for your recreation...";
        
        if (this.locations && this.locations.length > 0) {
            console.log("Locations were passed to maps")
            this.message = this.locations.length > 0 ? "" : "No locations found!";
            // Add markers for each location
            this.locations.forEach((location) => {
                this.dodajMarker({
                    pozicija: { lat: location.coordinates[1], lng: location.coordinates[0] },
                    premicnost: false,
                    oblacek: `<a href="/locations/${location._id}" class="link-primary text-decoration-none">
                               <i class="fa-solid fa-location-dot me-2"></i>${location.name}</a>`
                });
            });
        } else {
            console.log("Locations were not passed to maps. Calling db service...")
            this.dbLocationDataService.getAllLocations()
                .subscribe((locations) => {
                    this.message = locations.length > 0 ? "" : "No locations found!";
                    locations.forEach((location) => {
                        this.dodajMarker({
                            pozicija: { lat: location.coordinates[1], lng: location.coordinates[0] },
                            premicnost: false,
                            oblacek: `<a href="/locations/${location._id}" class="link-primary text-decoration-none">
                                       <i class="fa-solid fa-location-dot me-2"></i>${location.name}</a>`
                        });
                    });
                });
        }
    }

     mapClicked($event: any) {
         console.log($event.latlng.lat, $event.latlng.lng);
     }

     markerClicked($event: any, index: number) {
         console.log($event.latlng.lat, $event.latlng.lng);
     }

     markerDragEnd($event: any, index: number) {
         console.log($event.target.getLatLng());
     }
 }