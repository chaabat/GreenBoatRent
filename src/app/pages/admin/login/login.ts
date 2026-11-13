import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');
  showPw = signal(false);

  constructor() {
    // Already logged in → go straight to dashboard
    this.auth.ready.then(() => { if (this.auth.isAdmin()) this.router.navigate(['/admin']); });
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email.trim(), password);
      this.router.navigate(['/admin']);
    } catch (e: any) {
      const code: string = e?.code ?? e?.message ?? '';
      this.error.set(
        code === 'NOT_ADMIN' ? 'Questo account non è autorizzato.' :
        code === 'ADMIN_CHECK_FAILED' ? 'Connessione al database non riuscita. Riprova.' :
        code === 'auth/too-many-requests' ? 'Troppi tentativi. Riprova più tardi.' :
        'Email o password non corretti.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}