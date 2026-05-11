import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.roles.includes('Admin') ?? false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  private handleAuthResponse(response: AuthResponse) {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    const user: User = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.token.set(response.accessToken);
  }

  private loadFromStorage() {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(userStr));
    }
  }
}
