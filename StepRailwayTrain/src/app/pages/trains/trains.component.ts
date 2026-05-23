import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-trains',
  templateUrl: './trains.component.html',
  styleUrls: ['./trains.component.scss']
})
export class TrainsComponent implements OnInit {
  trains: any[] = [];
  filtered: any[] = [];
  departures: any[] = [];
  fromOptions: string[] = [];
  toOptions: string[] = [];

  loading = true;
  error = '';

  search = new FormControl('');
  from = new FormControl('');
  to = new FormControl('');
  passengerCount = new FormControl(1);
  passengerOptions = [1, 2, 3, 4, 5];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTrains();
    this.initFilters();
  }

  loadTrains(): void {
    forkJoin({
      trains: this.api.getTrains(),
      departures: this.api.getDepartures()
    }).subscribe({
      next: (res: any) => {
        this.trains = res.trains?.data ?? res.trains ?? [];
        this.departures = res.departures?.data ?? res.departures ?? [];
        this.fromOptions = this.unique(this.departures.map(d => d.source || d.from).filter(Boolean));
        this.toOptions = this.unique(this.departures.map(d => d.destination || d.to).filter(Boolean));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.log('TRAINS ERROR:', err);
        this.error = 'Failed to load trains';
        this.loading = false;
      }
    });
  }

  initFilters(): void {
    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    this.from.valueChanges.subscribe(() => this.applyFilters());
    this.to.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const query = (this.search.value || '').trim().toLowerCase();
    const from = this.from.value || '';
    const to = this.to.value || '';
    const routeTrainIds = this.getRouteTrainIds(from, to);

    this.filtered = this.trains.filter(train => {
      const matchesSearch = !query || this.safeString(train).includes(query);
      const matchesRoute = !routeTrainIds || routeTrainIds.has(Number(train.id));
      return matchesSearch && matchesRoute;
    });
  }

  resetRoute(): void {
    this.from.setValue('');
    this.to.setValue('');
    this.search.setValue('');
  }

  getBookingQuery(train: any): any {
    const departure = this.findDepartureForTrain(train);
    return {
      departureId: departure?.id ?? train.departureId,
      trainId: train.id,
      from: train.from || departure?.source || this.from.value,
      to: train.to || departure?.destination || this.to.value,
      passengerCount: this.passengerCount.value || 1
    };
  }

  routeLabel(train: any): string {
    const departure = this.findDepartureForTrain(train);
    const from = train.from || departure?.source || 'From';
    const to = train.to || departure?.destination || 'To';
    return `${from} -> ${to}`;
  }

  timeLabel(train: any): string {
    if (train.departure && train.arrive) return `${train.departure} - ${train.arrive}`;
    return train.departure || train.arrive || 'Time TBA';
  }

  getKeys(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter(k => !['id', 'vagons', 'from', 'to', 'departure', 'arrive'].includes(k));
  }

  private safeString(obj: any): string {
    if (!obj) return '';
    return JSON.stringify(obj).toLowerCase();
  }

  private getRouteTrainIds(from: string, to: string): Set<number> | null {
    if (!from && !to) return null;

    const ids = new Set<number>();
    this.departures
      .filter(d => (!from || d.source === from || d.from === from) && (!to || d.destination === to || d.to === to))
      .forEach(d => (d.trains || []).forEach((train: any) => ids.add(Number(train.id))));

    return ids;
  }

  private findDepartureForTrain(train: any): any {
    return this.departures.find(d =>
      String(d.id) === String(train.departureId) ||
      (d.trains || []).some((item: any) => String(item.id) === String(train.id))
    );
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }
}
