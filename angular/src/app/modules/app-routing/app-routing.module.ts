import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { HomepageComponent } from "../../shared/components/homepage/homepage.component";
import { AboutComponent } from "../../shared/components/about/about.component";
import { DetailsPageComponent } from "../../shared/components/details-page/details-page.component";
import { EventDetailsPageComponent } from "../../shared/components/event-details-page/event-details-page.component";
import { RegisterComponent } from "src/app/shared/components/register/register.component";
import { LoginComponent } from "../../shared/components/login/login.component";
import { EventpageComponent } from "../../shared/components/eventpage/eventpage.component";
import { MapsComponent } from "src/app/shared/components/maps/maps.component";

const routes: Routes = [
  { path: "", component: HomepageComponent },
  { path: "about", component: AboutComponent },
  { path: "locations/:locationId", component: DetailsPageComponent },
  { path: "register", component: RegisterComponent },
  { path: "login", component: LoginComponent },
  { path: "events", component: EventpageComponent },
  { path: "events/:eventId", component: EventDetailsPageComponent },
  { path: "maps", component: MapsComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}