import { NgModule, isDevMode } from '@angular/core';
import { registerLocaleData } from "@angular/common";
import localeSl from "@angular/common/locales/sl";
registerLocaleData(localeSl, "sl");
import { RatingModule } from "ngx-bootstrap/rating";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { LocationListComponent } from './shared/components/location-list/location-list.component';
import { EventListComponent } from './shared/components/event-list/event-list.component';
import { DistancePipe } from './shared/pipes/distance.pipe';
import { HttpClientModule } from "@angular/common/http";
import { FrameworkComponent } from './shared/components/framework/framework.component';
import { AboutComponent } from './shared/components/about/about.component';
import { HomepageComponent } from './shared/components/homepage/homepage.component';
import { EventpageComponent } from './shared/components/eventpage/eventpage.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { StarsComponent } from './shared/components/stars/stars.component';
import { LocationDetailsComponent } from './shared/components/location-details/location-details.component';
import { DetailsPageComponent } from './shared/components/details-page/details-page.component';
import { EventDetailsComponent } from './shared/components/event-details/event-details.component';
import { EventDetailsPageComponent } from './shared/components/event-details-page/event-details-page.component';
import { AllowUrlPipe } from './shared/pipes/allow-url.pipe';
import { MostRecentFirstPipe } from './shared/pipes/most-recent-first.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule, BsModalService } from "ngx-bootstrap/modal";
import { AppRoutingModule } from "./modules/app-routing/app-routing.module";
import { RegisterComponent } from './shared/components/register/register.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapsComponent } from './shared/components/maps/maps.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PaginationModule,PaginationConfig } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    LocationListComponent,
    EventListComponent,
    DistancePipe,
    FrameworkComponent,
    AboutComponent,
    HomepageComponent,
    EventpageComponent,
    HeaderComponent,
    SidebarComponent,
    StarsComponent,
    LocationDetailsComponent,
    EventDetailsComponent,
    DetailsPageComponent,
    EventDetailsPageComponent,
    AllowUrlPipe,
    MostRecentFirstPipe,
    RegisterComponent,
    LoginComponent,
    MapsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ModalModule,
    RatingModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LeafletModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    PaginationModule    
  ],
  providers: [BsModalService, PaginationConfig], 
  bootstrap: [ FrameworkComponent ]
})
export class AppModule { }
