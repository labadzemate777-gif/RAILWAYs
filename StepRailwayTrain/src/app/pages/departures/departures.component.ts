import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit {

  departures: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDepartures();
  }

  // 📌 CLEAN API CALL
  loadDepartures(): void {
    this.api.getDepartures().subscribe({
      next: (data: any) => {
        // API safe mapping (very important)
        this.departures = data?.data ?? data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.log('DEPARTURES ERROR:', err);

        this.error =
          err?.status === 0
            ? 'Network / CORS error'
            : 'Failed to load departures';

        this.loading = false;
      }
    });
  }

  // 📌 KEYS (safe)
  getKeys(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter(k => k !== 'id');
  }

  // 📌 VALUE FORMATTER (cleaner)
  formatValue(val: any): string {
    if (val === null || val === undefined) return '-';

    if (typeof val === 'object') {
      return Object.values(val).join(' ');
    }

    return String(val);
  }

  // 📌 TIME CHECK
  isTimeField(key: string): boolean {
    const k = key.toLowerCase();
    return k.includes('time') || k.includes('date');
  }
}