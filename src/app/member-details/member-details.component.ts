import { Component, OnInit, OnChanges } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Member, Team } from '../shared/models';

// export interface Member {
//   id: number;
//   firstName: string;
//   lastName: string;
//   jobTitle: string;
//   team: string;
//   status: string;
// }

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit, OnChanges {

  public teams: Team[] = [];
  public isEditMode: boolean = false;
  public memberForm!: FormGroup;


  constructor(
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.memberForm = this.formBuilder.group({
      id: [null],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      jobTitle: ['', Validators.required],
      status: ['Inactive'],
      team: ['', Validators.required]
    });


    this.appService.getTeamList().subscribe((teams: Team[]) => (this.teams = teams));

    const memberId: string | null = this.route.snapshot.paramMap.get('id');
    if (memberId) {
      this.isEditMode = true;
      this.appService.getMemberById(Number(memberId))
        .subscribe((member: Member) => {
          if (member) {
            console.log('Member details:', member)
            this.memberForm.patchValue({
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              jobTitle: member.jobTitle,
              team: member.team,
              status: member.status
            })
          }
        })
    }
  }

  ngOnChanges() { }

  // TODO: Add member to members
  onSubmit() {
    if (!this.memberForm.valid) {
      return;
    }

    const formValue: Member = this.memberForm.value;
    console.log('Form submitted:', formValue);
    const member: Member = {
      id: formValue.id || 0,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      jobTitle: formValue.jobTitle,
      team: formValue.team,
      status: formValue.status
    };

    if (member.id > 0) {
      // Update existing member
      this.appService.getMemberById(member.id).subscribe(existingMember => {
        if (existingMember) {
          this.appService.updateMember(member).subscribe({
            next: () => {
              console.log('Member updated successfully');
              this.goToMemberList();
            },
            error: (error) => {
              console.error('Error updating member:', error);
              this.handleError('Failed to update member');
            },
            complete: () => { }
          });
        }
      });
    } else {
      // Add new member
      this.appService.addMember(member).subscribe({
        next: () => {
          console.log('Member Added successfully');
          this.goToMemberList();
        },
        error: (error) => {
          console.error('Error adding member:', error);
          this.handleError('Failed to add member');
        },
        complete: () => { }
      });

    }

  }

  goToMemberList() {
    this.router.navigate(['/members']);
  }

  private handleError(message: string) {
    alert(message);
  }

}
