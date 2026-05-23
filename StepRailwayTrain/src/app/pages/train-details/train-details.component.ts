import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-train-details',
  templateUrl: './train-details.component.html',
  styleUrls: ['./train-details.component.scss']
})
export class TrainDetailsComponent implements OnInit {

  train: any = null;
  vagons: any[] = [];

  loading = true;
  vagonsLoading = false;

  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Invalid train ID';
      this.loading = false;
      return;
    }

    this.loadTrain(id);
  }

  // 📌 LOAD TRAIN (SAFE)
  loadTrain(id: string): void {
    this.api.getTrainById(id).subscribe({
      next: (data: any) => {
        this.train = data?.data ?? data ?? null;
        this.loading = false;

        if (this.train) {
          this.loadVagons();
        }
      },
      error: (err) => {
        console.log('TRAIN ERROR:', err);
        this.error = 'Train not found';
        this.loading = false;
      }
    });
  }

  // 📌 LOAD VAGONS (SAFE + FIXED FILTER)
  loadVagons(): void {
    this.vagonsLoading = true;

    this.api.getVagons().subscribe({
      next: (data: any) => {
        const vagons = data?.data ?? data ?? [];

        this.vagons = vagons.filter((v: any) =>
          String(v.trainId ?? v.train_id) === String(this.train.id)
        );

        this.vagonsLoading = false;
      },
      error: (err) => {
        console.log('VAGONS ERROR:', err);
        this.vagonsLoading = false;
      }
    });
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
    if (!this.train?.id) return;

    this.router.navigate(['/booking'], {
      queryParams: { trainId: this.train.id }
    });
  }
}