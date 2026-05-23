import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;

  step: string = 'form';
  ticket: any = null;
  errorMsg = '';

  get isForm(): boolean { return this.step === 'form'; }
  get isLoading(): boolean { return this.step === 'loading'; }
  get isSuccess(): boolean { return this.step === 'success'; }
  get isError(): boolean { return this.step === 'error'; }

  departures: any[] = [];
  filteredTrains: any[] = [];
  vagons: any[] = [];
  stations: any[] = [];

  dataLoading = true;
  routeLocked = false;
  passengerCount = 1;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
  }

  buildForm(): void {
    this.bookingForm = this.fb.group({
      email: [this.auth.currentUser?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(80)]],
      phoneNumber: [this.auth.currentUser?.phoneNumber ?? this.auth.currentUser?.phone ?? '', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+ -]{6,20}$/)]],
      departureId: ['', Validators.required],
      trainId: ['', Validators.required],
      vagonId: ['', Validators.required],
      from: ['', [Validators.required, Validators.maxLength(60)]],
      to: ['', [Validators.required, Validators.maxLength(60)]],
      cardHolder: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{13,23}$/), Validators.maxLength(23)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/), Validators.maxLength(5)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/), Validators.maxLength(4)]],
      passengers: this.fb.array([])
    });

    this.setPassengerCount(1);

    this.bookingForm.get('departureId')?.valueChanges.subscribe(depId => {
      this.bookingForm.patchValue({ trainId: '', vagonId: '' }, { emitEvent: false });
      this.clearPassengerSeats();
      const dep = this.departures.find(d => String(d.id) === String(depId));
      this.filteredTrains = this.readTrainsFromDeparture(dep);

      if (dep) {
        this.bookingForm.patchValue({
          from: dep.source || dep.from || dep.fromStation || this.bookingForm.value.from,
          to: dep.destination || dep.to || dep.toStation || this.bookingForm.value.to
        }, { emitEvent: false });
      }
    });

    this.bookingForm.get('trainId')?.valueChanges.subscribe(() => {
      this.bookingForm.patchValue({ vagonId: '' }, { emitEvent: false });
      this.clearPassengerSeats();
    });

    this.bookingForm.get('vagonId')?.valueChanges.subscribe(() => {
      this.clearPassengerSeats();
    });
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  passengerGroups(): FormGroup[] {
    return this.passengers.controls as FormGroup[];
  }

  setPassengerCount(count: number): void {
    this.passengerCount = Math.min(Math.max(Number(count) || 1, 1), 5);

    while (this.passengers.length < this.passengerCount) {
      this.passengers.push(this.createPassenger(this.passengers.length));
    }

    while (this.passengers.length > this.passengerCount) {
      this.passengers.removeAt(this.passengers.length - 1);
    }
  }

  changePassengerCount(value: string | number): void {
    this.setPassengerCount(Number(value));
    this.clearPassengerSeats();
  }

  createPassenger(index: number): FormGroup {
    return this.fb.group({
      firstName: [index === 0 ? this.auth.currentUser?.firstName ?? '' : '', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      lastName: [index === 0 ? this.auth.currentUser?.lastName ?? '' : '', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      idNumber: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      seatId: ['', Validators.required]
    });
  }

  loadData(): void {
    forkJoin({
      departures: this.api.getDepartures(),
      vagons: this.api.getVagons(),
      stations: this.api.getStations()
    }).subscribe({
      next: (res: any) => {
        this.departures = res.departures?.data ?? res.departures ?? [];
        this.vagons = res.vagons?.data ?? res.vagons ?? [];
        this.stations = res.stations?.data ?? res.stations ?? [];
        this.dataLoading = false;
        this.applyRouteHints();
      },
      error: () => {
        this.dataLoading = false;
        this.errorMsg = this.lang.t('Failed to load data from server', 'სერვერიდან მონაცემების ჩატვირთვა ვერ მოხერხდა');
      }
    });
  }

  getFilteredVagons(): any[] {
    const trainId = this.bookingForm.get('trainId')?.value;
    if (!trainId) return this.vagons;

    const selectedTrain = this.selectedTrain();
    if (selectedTrain?.vagons?.length) return selectedTrain.vagons;

    return this.vagons.filter(v =>
      String(v.trainId ?? v.train_id ?? v.train?.id) === String(trainId)
    );
  }

  getAvailableSeats(currentIndex?: number): any[] {
    const vagonId = this.bookingForm.get('vagonId')?.value;
    if (!vagonId) return [];

    const vagon = this.getFilteredVagons().find(v => String(v.id) === String(vagonId));
    const seats = vagon?.seats ?? [];
    const selectedByOthers = this.passengerGroups()
      .map((group, index) => index === currentIndex ? null : group.get('seatId')?.value)
      .filter(Boolean);

    return seats.filter((seat: any) => !seat.isOccupied && !selectedByOthers.includes(seat.seatId));
  }

  getTicketId(): string {
    return this.ticketIdFrom(this.ticket);
  }

  departureOptionLabel(d: any): string {
    const date = d.date || d.time || this.lang.t('Schedule', 'განრიგი');
    const from = d.source || d.from || this.lang.t('From', 'საიდან');
    const to = d.destination || d.to || d.id;
    return `${date} | ${from} -> ${to}`;
  }

  trainOptionLabel(t: any): string {
    const number = t.number || t.id;
    const name = t.name || this.lang.t('Available train', 'ხელმისაწვდომი მატარებელი');
    const time = t.departure && t.arrive ? `${t.departure} - ${t.arrive}` : (t.departure || '');
    return `#${number} | ${name}${time ? ' | ' + time : ''}`;
  }

  wagonOptionLabel(v: any): string {
    return v.name || `${this.lang.t('Wagon', 'ვაგონი')} ${v.number || v.id}`;
  }

  seatOptionLabel(seat: any): string {
    return `${this.lang.t('Seat', 'ადგილი')} ${seat.number} | ${seat.price} GEL`;
  }

  selectedRouteLabel(): string {
    const from = this.bookingForm?.value?.from || this.selectedDeparture()?.source || '';
    const to = this.bookingForm?.value?.to || this.selectedDeparture()?.destination || '';
    return from && to ? `${from} -> ${to}` : this.lang.t('Selected route', 'არჩეული მიმართულება');
  }

  selectedTrainLabel(): string {
    const train = this.selectedTrain();
    return train ? this.trainOptionLabel(train) : this.lang.t('Selected train', 'არჩეული მატარებელი');
  }

  submit(): void {
    if (!this.auth.isLoggedIn) {
      this.errorMsg = this.lang.t('Please login or register before buying a ticket.', 'ბილეთის ყიდვამდე გაიარეთ შესვლა ან რეგისტრაცია.');
      this.router.navigateByUrl('/auth');
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.step = 'loading';
    this.errorMsg = '';

    const form = this.bookingForm.value;
    const user = this.auth.currentUser;
    const passengers = this.passengers.value;
    const selectedSeatIds = passengers.map((p: any) => p.seatId);
    const hasDuplicateSeat = new Set(selectedSeatIds).size !== selectedSeatIds.length;

    if (hasDuplicateSeat || passengers.some((p: any, index: number) => !this.getAvailableSeats(index).some(seat => seat.seatId === p.seatId))) {
      this.errorMsg = this.lang.t('Please select an available seat again.', 'თავისუფალი ადგილი თავიდან აირჩიე.');
      this.step = 'error';
      return;
    }

    const payload = {
      trainId: Number(form.trainId),
      date: this.resolveTicketDate(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim() || user?.phoneNumber || user?.phone,
      people: passengers.map((passenger: any) => ({
          seatId: passenger.seatId,
          name: passenger.firstName.trim(),
          surname: passenger.lastName.trim(),
          idNumber: passenger.idNumber.trim(),
          status: 'Registered',
          payoutCompleted: true
        }))
    };

    this.api.registerTicket(payload).subscribe({
      next: (res: any) => {
        this.ticket = this.normalizeTicketResponse(res);
        this.step = 'success';
      },
      error: (err: any) => {
        const createdTicket = this.normalizeTicketResponse(err?.error);
        if (this.ticketIdFrom(createdTicket)) {
          this.ticket = createdTicket;
          this.errorMsg = '';
          this.step = 'success';
          return;
        }

        if (err?.error?.errors) {
          this.errorMsg = Object.keys(err.error.errors)
            .map(key => `${key}: ${err.error.errors[key].join(', ')}`)
            .join(' | ');
        } else {
          this.errorMsg =
            err?.status === 0
              ? this.lang.t('Network / CORS error', 'ქსელის ან CORS შეცდომა')
              : typeof err?.error === 'string'
                ? err.error
              : err?.error?.message ||
                err?.error?.title ||
                JSON.stringify(err?.error) ||
                this.lang.t('Booking failed', 'ჯავშანი ვერ შესრულდა');
        }
        this.step = 'error';
      }
    });
  }

  reset(): void {
    this.bookingForm.reset();
    this.setPassengerCount(this.passengerCount);
    this.filteredTrains = [];
    this.step = 'form';
    this.ticket = null;
    this.errorMsg = '';
  }

  field(name: string) {
    return this.bookingForm.get(name);
  }

  invalid(name: string): boolean {
    const f = this.field(name);
    return !!(f && f.invalid && f.touched);
  }

  passengerInvalid(index: number, name: string): boolean {
    const field = this.passengers.at(index)?.get(name);
    return !!(field && field.invalid && field.touched);
  }

  private clearPassengerSeats(): void {
    this.passengerGroups().forEach(group => group.patchValue({ seatId: '' }, { emitEvent: false }));
  }

  private normalizeTicketResponse(response: any): any {
    if (!response) return null;

    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        const id = response.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
        return id ? { id } : response;
      }
    }

    return response?.data ?? response;
  }

  private ticketIdFrom(ticket: any): string {
    return ticket?.id || ticket?.ticketId || ticket?.ticketID || '';
  }

  private readTrainsFromDeparture(dep: any): any[] {
    if (!dep) return [];
    if (Array.isArray(dep.trains)) return dep.trains;
    if (dep.train) return [dep.train];
    if (dep.trainId || dep.train_id) {
      return [{ id: dep.trainId ?? dep.train_id, name: dep.trainName ?? dep.name }];
    }
    return [];
  }

  private selectedDeparture(): any {
    const departureId = this.bookingForm.get('departureId')?.value;
    return this.departures.find(d => String(d.id) === String(departureId));
  }

  private selectedTrain(): any {
    const trainId = this.bookingForm.get('trainId')?.value;
    return this.filteredTrains.find(t => String(t.id) === String(trainId));
  }

  private resolveTicketDate(): string {
    const train = this.selectedTrain();
    const departure = this.selectedDeparture();
    const rawDate = train?.date || departure?.date;
    const parsed = rawDate ? new Date(rawDate) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  private applyRouteHints(): void {
    const params = this.route.snapshot.queryParamMap;
    const departureId = params.get('departureId');
    const trainId = params.get('trainId');
    const from = params.get('from');
    const to = params.get('to');
    const passengerCount = params.get('passengerCount');
    this.routeLocked = !!(departureId && trainId);
    this.setPassengerCount(Number(passengerCount) || 1);

    if (departureId) {
      this.bookingForm.patchValue({ departureId });
      const dep = this.departures.find(d => String(d.id) === String(departureId));
      this.filteredTrains = this.readTrainsFromDeparture(dep);
    }

    this.bookingForm.patchValue({
      trainId: trainId || this.bookingForm.value.trainId,
      from: from || this.bookingForm.value.from,
      to: to || this.bookingForm.value.to
    });
  }
}
