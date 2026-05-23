import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './pages/home/home.component';
import { TrainsComponent } from './pages/trains/trains.component';
import { TrainDetailsComponent } from './pages/train-details/train-details.component';
import { WagonDetailsComponent } from './pages/wagon-details/wagon-details.component';
import { DeparturesComponent } from './pages/departures/departures.component';
import { BookingComponent } from './pages/booking/booking.component';
import { TicketStatusComponent } from './pages/ticket-status/ticket-status.component';
import { AuthComponent } from './pages/auth/auth.component';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

@NgModule({
  declarations: [
    AppComponent,

    HomeComponent,
    TrainsComponent,
    TrainDetailsComponent,
    WagonDetailsComponent,
    DeparturesComponent,
    BookingComponent,
    TicketStatusComponent,
    AuthComponent,

    NavbarComponent,
    ThemeToggleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
