import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MembersComponent } from './members.component';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Member, User } from '../shared/models';

describe('MembersComponent', () => {
  let component: MembersComponent;
  let fixture: ComponentFixture<MembersComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let appSvcSpy: jasmine.SpyObj<AppService>;
  let user$!: BehaviorSubject<User | null>;

  beforeEach(async () => {

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    appSvcSpy = jasmine.createSpyObj<AppService>(
      'AppService',
      ['getMembers', 'deleteMember'],
      { currentUser$: undefined }
    );
    user$ = new BehaviorSubject<User | null>(null); 
    Object.defineProperty(appSvcSpy, 'currentUser$', { value: user$.asObservable() });


    await TestBed.configureTestingModule({
      declarations: [MembersComponent],
      providers: [
        { provide: AppService, useValue: appSvcSpy },
        { provide: Router, useValue: routerSpy }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should redirect to /login when user is null', () => {
    fixture.detectChanges();     
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('ngOnInit should call getMembers() when user exists', fakeAsync(() => {
    const dummyMembers = [{ id: 1, name: 'Alice' }] as unknown as Member[];
    appSvcSpy.getMembers.and.returnValue(of(dummyMembers));

    user$.next({
      id: 123, username: 'john',
      email: ''
    });  
    fixture.detectChanges();                    
    tick();                                     

    expect(appSvcSpy.getMembers).toHaveBeenCalled();
    expect(component.members).toEqual(dummyMembers);
  }));

  it('goToAddMemberForm should navigate to member-details', () => {
    component.goToAddMemberForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/member-details']);
  });

  it('goToMembersDetails should navigate with id param', () => {
    component.goToMembersDetails(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/member-details', 42]);
  });

  it('removeMember should call deleteMember and remove item', fakeAsync(() => {
    const initialMembers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ] as unknown as Member[];

    component.members = [...initialMembers];
    appSvcSpy.deleteMember.and.returnValue(of(initialMembers[1]));

    const evt = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    component.removeMember(initialMembers[0], evt);
    tick();

    expect(evt.stopPropagation).toHaveBeenCalled();
    expect(appSvcSpy.deleteMember).toHaveBeenCalledWith(1);
    expect(component.members.length).toBe(1);
    expect(component.members[0].id).toBe(2);
  }));

});
