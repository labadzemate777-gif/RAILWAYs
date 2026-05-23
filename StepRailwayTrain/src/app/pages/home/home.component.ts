import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  stats = { trains: 0, stations: 0, departures: 0 };
  recentTrains: any[] = [];
  loading = true;

  features = [
    { icon: 'train', title: 'Modern Fleet', desc: 'Travel in comfort with our state-of-the-art train fleet.' },
    { icon: 'pin', title: 'Wide Network', desc: 'Connecting cities and towns across the country seamlessly.' },
    { icon: 'ticket', title: 'Easy Booking', desc: 'Reserve your seat in minutes with our streamlined booking.' },
    { icon: 'route', title: 'Real-Time Info', desc: 'Live departure boards and instant ticket status updates.' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  // 📌 ALL DATA IN ONE CALL (BEST PRACTICE)
  loadHomeData(): void {

    forkJoin({
      trains: this.api.getTrains(),
      stations: this.api.getStations(),
      departures: this.api.getDepartures()
    }).subscribe({
      next: (res: any) => {

        const trains = res.trains?.data ?? res.trains ?? [];
        const stations = res.stations?.data ?? res.stations ?? [];
        const departures = res.departures?.data ?? res.departures ?? [];

        this.stats.trains = trains.length;
        this.stats.stations = stations.length;
        this.stats.departures = departures.length;

        this.recentTrains = trains.slice(0, 3);

        this.loading = false;
      },
      error: (err) => {
        console.log('HOME ERROR:', err);
        this.loading = false;
      }
    });
  }
}
