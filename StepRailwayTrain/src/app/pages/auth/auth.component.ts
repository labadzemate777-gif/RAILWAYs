import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: AuthMode = 'login';
  loading = false;
  errorMsg = '';

  loginForm: FormGroup = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+ -]{6,20}$/)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]]
  });

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+ -]{6,20}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(80)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public lang: LanguageService
  ) {}

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMsg = '';
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.cleanPayload(this.loginForm.value)).subscribe({
      next: () => this.router.navigateByUrl('/booking'),
      error: err => {
        this.errorMsg = this.readError(err);
        this.loading = false;
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.auth.register(this.cleanPayload(this.registerForm.value)).subscribe({
      next: () => this.router.navigateByUrl('/booking'),
      error: err => {
        this.errorMsg = this.readError(err);
        this.loading = false;
      }
    });
  }

  invalid(form: FormGroup, name: string): boolean {
    const field = form.get(name);
    return !!(field && field.invalid && field.touched);
  }

  private cleanPayload(payload: any): any {
    return Object.keys(payload).reduce((acc: any, key) => {
      acc[key] = typeof payload[key] === 'string' ? payload[key].trim() : payload[key];
      return acc;
    }, {});
  }

  private readError(err: any): string {
    return err?.error?.message ||
      err?.error?.title ||
      (this.lang.current === 'ka' ? 'ავტორიზაცია ვერ შესრულდა' : 'Authentication failed');
  }
}
