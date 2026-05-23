import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'en' | 'ka';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'stepRailwayLanguage';
  private readonly langSubject = new BehaviorSubject<AppLanguage>(this.readInitialLanguage());
  readonly lang$ = this.langSubject.asObservable();

  get current(): AppLanguage {
    return this.langSubject.value;
  }

  setLanguage(lang: AppLanguage): void {
    localStorage.setItem(this.storageKey, lang);
    this.langSubject.next(lang);
  }

  toggle(): void {
    this.setLanguage(this.current === 'en' ? 'ka' : 'en');
  }

  t(en: string, ka: string): string {
    return this.current === 'ka' ? ka : en;
  }

  private readInitialLanguage(): AppLanguage {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'ka' ? 'ka' : 'en';
  }
}
