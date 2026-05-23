import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.baseUrl;
  private usersBase = environment.usersBaseUrl ?? environment.baseUrl;

  constructor(private http: HttpClient) {}

  getStations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/stations`);
  }

  registerUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.usersBase}/api/Users/register`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.usersBase}/api/Users/login`, data);
  }

  getUserByPhone(phoneNumber: string): Observable<any> {
    return this.http.get<any>(`${this.usersBase}/api/Users/${encodeURIComponent(phoneNumber)}`);
  }

  getFavoriteCars(phoneNumber: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersBase}/api/Users/${encodeURIComponent(phoneNumber)}/favorite-cars`);
  }

  addFavoriteCar(userId: number | string, carId: number | string): Observable<any> {
    return this.http.post<any>(`${this.usersBase}/api/Users/${userId}/favorites/${carId}`, {});
  }

  getTrains(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/trains`);
  }
  getTrainById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/trains/${id}`);
  }

  getVagons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/vagons`);
  }
  getVagonById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/getvagon/${id}`);
  }

  getDepartures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/departures`);
  }
  getDeparture(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/getdeparture`);
  }

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/tickets`);
  }
  registerTicket(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/api/tickets/register`, data);
  }
  checkTicketStatus(ticketId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/tickets/checkstatus/${encodeURIComponent(ticketId)}`);
  }
  confirmTicket(ticketId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/tickets/confirm/${encodeURIComponent(ticketId)}`);
  }
  cancelTicket(ticketId: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/api/tickets/cancel/${encodeURIComponent(ticketId)}`);
  }
  cancelAllTickets(): Observable<any> {
    return this.http.delete<any>(`${this.base}/api/tickets/cancelAll`);
  }

  getSeat(seatId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/seat/${seatId}`);
  }
}
