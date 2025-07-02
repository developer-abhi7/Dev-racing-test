import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { Team, Member } from '../shared/models';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  public members: Member[] = [];
  public teams: Team[] = [];


  constructor(
    public appService: AppService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.appService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.getMembers();
      }
    });
  }

  goToAddMemberForm() {
    this.router.navigate(['/member-details']);
  }

  getMembers() {
    this.appService.getMembers().subscribe((members: Member[]) => (this.members = members));
  }


  goToMembersDetails(id: number) {
    this.router.navigate(['/member-details', id]);
  }

  removeMember(member: Member, e: Event) {
    e.stopPropagation();
    this.appService.deleteMember(member.id!).subscribe(() => {
      this.members = this.members.filter(m => m.id !== member.id);
    });
  }
}
