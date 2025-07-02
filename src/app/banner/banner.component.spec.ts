import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerComponent } from './banner.component';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let mockAppService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAppService = {
      username: 'testuser',
      logout: jasmine.createSpy('logout')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      declarations: [BannerComponent],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: Router, useValue: mockRouter }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout and navigate to login', () => {
    component.logout();

    expect(mockAppService.logout).toHaveBeenCalled();
    expect(mockAppService.username).toBe('');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
