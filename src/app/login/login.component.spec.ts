import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let appSvcSpy: jasmine.SpyObj<AppService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    appSvcSpy = jasmine.createSpyObj<AppService>(
      'AppService',
      [
        'login',
        'isLoggedIn',
        'isRemembered',
        'getCurrentUser',
        'setUsername'
      ]
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);


    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AppService, useValue: appSvcSpy },
        { provide: Router, useValue: routerSpy }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('ngOnInit should redirect to members when already logged in', () => {
    appSvcSpy.isLoggedIn.and.returnValue(true);

    fixture.detectChanges();
    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/members']);
  });
  it('ngOnInit should load remembered username', () => {
    appSvcSpy.isLoggedIn.and.returnValue(false);
    appSvcSpy.isRemembered.and.returnValue(true);
    appSvcSpy.getCurrentUser.and.returnValue({ username: 'demo' } as any);

    fixture.detectChanges();
    component.ngOnInit();

    expect(component.username).toBe('demo');
    expect(component.rememberMe).toBeTrue();
  });
  it('login should set errorMessage when username and password missing', () => {
    component.username = '';
    component.password = '';

    component.login();

    expect(component.errorMessage).toBe('Username and password are required');
    expect(appSvcSpy.login).not.toHaveBeenCalled();
  });
  it('login should be success', fakeAsync(() => {
    component.username = 'john';
    component.password = 'secret';
    component.rememberMe = true;

    appSvcSpy.login.and.returnValue(of({ id: 1, username: 'john', email: 'john@example.com' } as any));

    component.login();
    tick();

    expect(appSvcSpy.login).toHaveBeenCalledWith('john', 'secret', true);
    expect(appSvcSpy.setUsername).toHaveBeenCalledWith('john');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/members']);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('');
  }));

  it('login should display backend error message', fakeAsync(() => {
    component.username = 'john';
    component.password = 'wrongPass';

    appSvcSpy.login.and.returnValue(throwError(() => ({})));

    component.login();
    tick();

    expect(component.errorMessage).toBe('Login failed');
    expect(component.loading).toBeFalse();
  }));

});
