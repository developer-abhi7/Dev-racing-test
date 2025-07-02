import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MemberDetailsComponent } from './member-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Member, Team } from '../shared/models';

describe('MemberDetailsComponent', () => {
  let component: MemberDetailsComponent;
  let fixture: ComponentFixture<MemberDetailsComponent>;
  let appSvcSpy: jasmine.SpyObj<AppService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertSpy: jasmine.Spy;

  const dummyTeams = [{ name: 'Engineering' }] as unknown as Team[];
  const dummyMember = {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    jobTitle: 'Dev',
    team: 'Engineering',
    status: 'Active'
  } as unknown as Member


  beforeEach(async () => {

    appSvcSpy = jasmine.createSpyObj<AppService>(
      'AppService',
      ['getTeamList', 'getMemberById', 'addMember', 'updateMember']
    );

    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);


    await TestBed.configureTestingModule({
      declarations: [MemberDetailsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AppService, useValue: appSvcSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() }
          }
        }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberDetailsComponent);
    component = fixture.componentInstance;
    alertSpy = spyOn(window, 'alert');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('ngOnInit should load teams on new', fakeAsync(() => {
    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    component.ngOnInit();
    tick();

    expect(appSvcSpy.getTeamList).toHaveBeenCalled();
    expect(component.teams).toEqual(dummyTeams);
    expect(component.isEditMode).toBeFalse();
  }));

  it('ngOnInit should load member on edit', fakeAsync(() => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap as any).get = () => '1';

    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    appSvcSpy.getMemberById.and.returnValue(of(dummyMember));

    component.ngOnInit();
    tick();

    expect(component.isEditMode).toBeTrue();
    expect(appSvcSpy.getMemberById).toHaveBeenCalledWith(1);
    expect(component.memberForm.value.firstName).toBe('Alice');
  }));

  it('onSubmit should add new member', fakeAsync(() => {
    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    appSvcSpy.addMember.and.returnValue(of(<Member>{}));
    component.ngOnInit();
    tick();

    component.memberForm.setValue({
      id: null,
      firstName: 'Bob',
      lastName: 'Jones',
      jobTitle: 'QA',
      team: 'Engineering',
      status: 'Inactive'
    });

    component.onSubmit();
    tick();

    expect(appSvcSpy.addMember).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/members']);
  }));

  it('onSubmit should update existing member', fakeAsync(() => {
    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    appSvcSpy.getMemberById.and.returnValue(of(dummyMember));
    appSvcSpy.updateMember.and.returnValue(of(<Member>{}));

    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap as any).get = () => '1';

    component.ngOnInit();
    tick();

    component.memberForm.patchValue({
      firstName: 'Updated',
      lastName: 'Name',
    });

    component.onSubmit();
    tick();

    expect(appSvcSpy.updateMember).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/members']);
  }));

  it('onSubmit should handle add error', fakeAsync(() => {
    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    appSvcSpy.addMember.and.returnValue(throwError(() => ({ error: 'fail' })));

    component.ngOnInit();
    tick();

    component.memberForm.setValue({
      id: null,
      firstName: 'Bad',
      lastName: 'Data',
      jobTitle: 'Intern',
      team: 'Engineering',
      status: 'Inactive'
    });

    component.onSubmit();
    tick();

    expect(alertSpy).toHaveBeenCalledWith('Failed to add member');
  }));

  it('onSubmit should handle update error', fakeAsync(() => {
    appSvcSpy.getTeamList.and.returnValue(of(dummyTeams));
    appSvcSpy.getMemberById.and.returnValue(of(dummyMember));
    appSvcSpy.updateMember.and.returnValue(throwError(() => ({ error: 'fail' })));

    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap as any).get = () => '1';

    component.ngOnInit();
    tick();

    component.onSubmit();
    tick();

    expect(alertSpy).toHaveBeenCalledWith('Failed to update member');
  }));

  it('onSubmit should do nothing if form is invalid', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.onSubmit();
    tick();

    expect(appSvcSpy.addMember).not.toHaveBeenCalled();
    expect(appSvcSpy.updateMember).not.toHaveBeenCalled();
  }));

});
