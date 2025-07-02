import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { LoginResponse, Member, Team, User } from './shared/models';
import { BehaviorSubject, Observable } from 'rxjs';

const DEBUG = false;

@Injectable({
  providedIn: 'root',
})
export class AppService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  api = DEBUG ? 'http://localhost:3000' : 'http://localhost:8000/api';

  //api = 'http://localhost:8000/api';

  username: string = '';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
    const currentUser = localStorage.getItem('currentUser');
    this.username = currentUser ? JSON.parse(currentUser)?.username?.toString() || '' : '';
  }

  private loadStoredUser(): void {
    // Check localStorage first remember me
    let storedUser = localStorage.getItem('currentUser');
    let storedToken = localStorage.getItem('token');

    // If not in localStorage, check sessionStorage
    if (!storedUser) {
      storedUser = sessionStorage.getItem('currentUser');
      storedToken = sessionStorage.getItem('token');
    }

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        //alert(user.username);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Returns all members
  public getMembers(): Observable<Member[]> {
    return this.http
      .get<Member[]>(`${this.api}/members`, { headers: this.getHeaders() })
      .pipe(retry(5), catchError(this.handleError));
  }
  
  public getTeamList(): Observable<Team[]> {
    return this.http
      .get<Team[]>(`${this.api}/teams`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  public getMemberById(id: number): Observable<Member> {
    if (!id || id <= 0) {
      throw new Error('Invalid member ID');
    }
    return this.http
      .get<Member>(`${this.api}/members/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  public addMember(member: Member): Observable<Member> {
    const { id, ...memberWithoutId } = member;
    return this.http
      .post<Member>(`${this.api}/addMember`, memberWithoutId, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  public updateMember(member: Member): Observable<Member> {
    if (!member || !member.id) {
      throw new Error('Invalid member data');
    }
    return this.http
      .put<Member>(`${this.api}/members/${member.id}`, member, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  public deleteMember(id: number): Observable<Member> {
    if (!id || id <= 0) {
      throw new Error('Invalid member ID');
    }
    return this.http
      .delete<Member>(`${this.api}/members/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  public login(username: string, password: string, rememberMe: boolean): Observable<User> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    return this.http.post<LoginResponse>(`${this.api}/login`, { username, password })
      .pipe(map(response => {
        if (rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          localStorage.setItem('rememberMe', 'true');
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          sessionStorage.setItem('token', response.token);

          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
        }
        this.currentUserSubject.next(response.user);
        return response.user;
      }));
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  setUsername(name: string): void {
    this.username = name;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isRemembered(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');

    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');

    this.currentUserSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return [];
  }
}
