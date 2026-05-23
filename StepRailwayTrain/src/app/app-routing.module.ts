import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { TrainsComponent } from './pages/trains/trains.component';
import { TrainDetailsComponent } from './pages/train-details/train-details.component';
import { WagonDetailsComponent } from './pages/wagon-details/wagon-details.component';
import { DeparturesComponent } from './pages/departures/departures.component';
import { BookingComponent } from './pages/booking/booking.component';
import { TicketStatusComponent } from './pages/ticket-status/ticket-status.component';
import { AuthComponent } from './pages/auth/auth.component';

const routes: Routes = [

  // Home
  { path: '', component: HomeComponent },

  // Trains
  { path: 'trains', component: TrainsComponent },
  { path: 'trains/:id', component: TrainDetailsComponent },

  // Wagons
  { path: 'wagons/:id', component: WagonDetailsComponent },

  // Departures
  { path: 'departures', component: DeparturesComponent },

  // Booking
  { path: 'booking', component: BookingComponent },

  { path: 'auth', component: AuthComponent },

  { path: 'ticket-status', component: TicketStatusComponent },
  { path: 'ticket/:id', component: TicketStatusComponent },

  // fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
