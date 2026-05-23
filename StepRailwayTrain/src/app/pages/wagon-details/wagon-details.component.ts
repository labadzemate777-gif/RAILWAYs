import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-wagon-details',
  templateUrl: './wagon-details.component.html',
  styleUrls: ['./wagon-details.component.scss']
})
export class WagonDetailsComponent implements OnInit {

  wagon: any = null;
  seats: any[] = [];

  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Invalid wagon ID';
      this.loading = false;
      return;
    }

    this.loadWagon(id);
  }

  // 📌 LOAD WAGON
  loadWagon(id: string): void {
    this.api.getVagonById(id).subscribe({
      next: (data: any) => {

        // safe API mapping
        this.wagon = data?.data ?? data ?? null;

        // extract seats safely
        this.seats = this.extractSeats(this.wagon);

        this.loading = false;
      },
      error: (err) => {
        console.log('WAGON ERROR:', err);
        this.error = 'Wagon not found';
        this.loading = false;
      }
    });
  }

  // 📌 SAFE SEATS HANDLING
  private extractSeats(wagon: any): any[] {
    if (!wagon) return [];

    return (
      wagon.seats ??
      wagon.seat ??
      wagon.Seats ??
      []
    );
  }

  // 📌 SAFE OBJECT VIEW
  getEntries(obj: any): { key: string; val: any }[] {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj)
      .map(([key, val]) => ({ key, val }))
      .filter(e => e.val !== null && e.val !== undefined);
  }

  // 📌 NAVIGATION
  goBack(): void {
    this.router.navigate(['/trains']);
  }

  bookNow(): void {
    if (!this.wagon) return;

    this.router.navigate(['/booking'], {
      queryParams: {
        wagonId: this.wagon.id
      }
    });
  }

  // ✅ OPTIONAL (if HTML still uses getSeats())
  getSeats(): any[] {
    return this.seats;
  }
}