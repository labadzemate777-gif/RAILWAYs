import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface AuthUser {
  id?: number | string;
  userId?: number | string;
  phoneNumber?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  token?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'stepRailwayUser';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private api: ApiService) {}

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  register(payload: any): Observable<any> {
    return this.api.registerUser(payload).pipe(
      tap(res => this.storeUser(this.extractUser(res, payload.phoneNumber)))
    );
  }

  login(payload: any): Observable<any> {
    return this.api.loginUser(payload).pipe(
      tap(res => this.storeUser(this.extractUser(res, payload.phoneNumber)))
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private extractUser(res: any, phoneNumber?: string): AuthUser {
    const user = res?.data?.user ?? res?.user ?? res?.data ?? res ?? {};
    return {
      ...user,
      phoneNumber: user.phoneNumber ?? user.phone ?? phoneNumber,
      token: res?.token ?? res?.data?.token ?? user.token
    };
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
