import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AppService } from './app.service';
import { LoginResponse, Member, User } from './shared/models';

describe('AppService', () => {
  let service: AppService;
  let httpMock: HttpTestingController;

  const dummyUser: User = { id: 1, username: 'john', email: 'john@demo' } as any;
  const dummyToken = 'jwt-token';
  const API = 'http://localhost:8000/api';


  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppService],
    });
    service = TestBed.inject(AppService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('On login rememberMe when true stores user in localStorage', (done) => {
    service.login('john', 'pass', true).subscribe((returnedUser) => {
      expect(returnedUser).toEqual(dummyUser);
 
      expect(localStorage.getItem('currentUser')).toBeTruthy();
      expect(localStorage.getItem('token')).toBe(dummyToken);
      expect(localStorage.getItem('rememberMe')).toBe('true');
      expect(sessionStorage.getItem('currentUser')).toBeNull();

      expect(service.getCurrentUser()).toEqual(dummyUser);
      done();
    });

    const req = httpMock.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(<LoginResponse>{ user: dummyUser, token: dummyToken });
  });

  it('On login rememberMe when false stores user in sessionStorage only', (done) => {
    localStorage.setItem('currentUser', 'old');
    localStorage.setItem('token', 'oldToken');

    service.login('john', 'pass', false).subscribe(() => {
      expect(sessionStorage.getItem('currentUser')).toBeTruthy();
      expect(sessionStorage.getItem('token')).toBe(dummyToken);
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('rememberMe')).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${API}/login`);
    req.flush(<LoginResponse>{ user: dummyUser, token: dummyToken });
  });


  it('getMembers should send members with Bearer token', () => {
    localStorage.setItem('token', dummyToken); 

    service.getMembers().subscribe();

    const req = httpMock.expectOne(`${API}/members`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${dummyToken}`);
    req.flush(<Member[]>[]);
  });


  it('logout should clear storage and currentUserSubject', () => {
    localStorage.setItem('currentUser', JSON.stringify(dummyUser));
    localStorage.setItem('token', dummyToken);
    sessionStorage.setItem('token', dummyToken);

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

});
