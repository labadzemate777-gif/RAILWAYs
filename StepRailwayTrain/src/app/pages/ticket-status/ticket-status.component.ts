import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-ticket-status',
  templateUrl: './ticket-status.component.html',
  styleUrls: ['./ticket-status.component.scss']
})
export class TicketStatusComponent implements OnInit {
  searchForm!: FormGroup;

  ticket: any = null;
  allTickets: any[] = [];

  loading = false;
  allLoading = true;
  actionLoadingId = '';

  error = '';
  actionMsg = '';
  actionType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAll();

    const routeTicketId = this.route.snapshot.paramMap.get('id');
    if (routeTicketId) {
      this.searchForm.patchValue({ ticketId: routeTicketId });
      this.search();
    }
  }

  buildForm(): void {
    this.searchForm = this.fb.group({
      ticketId: ['', [Validators.required, Validators.maxLength(80)]]
    });
  }

  loadAll(): void {
    this.allLoading = true;
    this.api.getTickets().subscribe({
      next: (data: any) => {
        this.allTickets = data?.data ?? data ?? [];
        this.allLoading = false;
      },
      error: (err) => {
        console.log('GET TICKETS ERROR:', err);
        this.allLoading = false;
        this.allTickets = [];
      }
    });
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const id = String(this.searchForm.value.ticketId).trim();
    if (!id) return;

    this.loading = true;
    this.error = '';
    this.ticket = null;

    this.api.checkTicketStatus(id).subscribe({
      next: (data: any) => {
        this.ticket = data?.data ?? data ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.log('CHECK STATUS ERROR:', err);
        this.error = this.readError(err, 'Ticket not found or invalid ID');
        this.loading = false;
      }
    });
  }

  confirm(ticket: any): void {
    const id = this.ticketId(ticket);
    if (!id) {
      this.setAction('Ticket ID is missing', 'error');
      return;
    }

    this.actionLoadingId = id;
    this.api.confirmTicket(id).subscribe({
      next: (res: any) => {
        const updated = res?.data ?? res;
        this.ticket = this.ticket && this.ticketId(this.ticket) === id ? updated : this.ticket;
        this.setAction('Ticket confirmed!', 'success');
        this.actionLoadingId = '';
        this.loadAll();
      },
      error: (err) => {
        console.log('CONFIRM ERROR:', err);
        this.setAction(this.readError(err, 'Failed to confirm ticket'), 'error');
        this.actionLoadingId = '';
      }
    });
  }

  cancel(ticket: any): void {
    const id = this.ticketId(ticket);
    if (!id) {
      this.setAction('Ticket ID is missing', 'error');
      return;
    }

    this.actionLoadingId = id;
    this.api.cancelTicket(id).subscribe({
      next: () => {
        this.setAction('Ticket cancelled.', 'success');
        if (this.ticket && this.ticketId(this.ticket) === id) this.ticket = null;
        this.allTickets = this.allTickets.filter(item => this.ticketId(item) !== id);
        this.actionLoadingId = '';
      },
      error: (err) => {
        console.log('CANCEL ERROR:', err);
        this.setAction(this.readError(err, 'Failed to cancel ticket'), 'error');
        this.actionLoadingId = '';
      }
    });
  }

  cancelAll(): void {
    if (!confirm('Are you sure you want to cancel ALL tickets?')) return;

    this.api.cancelAllTickets().subscribe({
      next: () => {
        this.setAction('All tickets cancelled.', 'success');
        this.allTickets = [];
        this.ticket = null;
      },
      error: (err) => {
        console.log('CANCEL ALL ERROR:', err);
        this.setAction(this.readError(err, 'Failed to cancel all tickets'), 'error');
      }
    });
  }

  ticketId(ticket: any): string {
    return ticket?.id || ticket?.ticketId || ticket?.ticketID || '';
  }

  trainId(ticket: any): string {
    return ticket?.trainID || ticket?.trainId || ticket?.train_id || '';
  }

  isConfirmed(ticket: any): boolean {
    return ticket?.confirmed === true || String(ticket?.status || '').toLowerCase() === 'confirmed';
  }

  getEntries(obj: any): { key: string; val: any }[] {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj)
      .map(([key, val]) => ({ key, val: this.formatValue(val) }))
      .filter(e => e.val !== null && e.val !== undefined && e.key !== 'train' && e.key !== 'persons');
  }

  dismissAction(): void {
    this.actionMsg = '';
    this.actionType = '';
  }

  private setAction(message: string, type: 'success' | 'error'): void {
    this.actionMsg = message;
    this.actionType = type;
  }

  private readError(err: any, fallback: string): string {
    return typeof err?.error === 'string'
      ? err.error
      : err?.error?.message || err?.error?.title || fallback;
  }

  private formatValue(value: any): any {
    if (Array.isArray(value)) return `${value.length} item(s)`;
    if (value && typeof value === 'object') return JSON.stringify(value);
    return value;
  }
}
