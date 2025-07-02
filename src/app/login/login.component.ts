import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public username: string = '';
  public password: string = '';
  public loading: boolean = false;
  public errorMessage: string = '';
  public rememberMe: boolean = false;

  constructor(private router: Router, private appService: AppService) { }

  ngOnInit(): void {
    if (this.appService.isLoggedIn()) {
      this.router.navigate(['/members']);
    }

    this.loadRememberedUser();
  }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }
    this.loading = true;
    this.appService.login(this.username, this.password, this.rememberMe).subscribe({
      next: () => {
        this.router.navigate(['/members']);
      },
      complete: () => {
        this.appService.setUsername(this.username);
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

   private loadRememberedUser(): void {
    if (this.appService.isRemembered()) {
      const currentUser = this.appService.getCurrentUser();
      if (currentUser) {
          this.username = currentUser.username,
          this.rememberMe= true;
      }
    }
  }
}
