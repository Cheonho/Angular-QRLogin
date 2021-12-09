import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit(): void {}

  onLogoutClick() {
    this.authService.logout();
    this.flashMessage.show('로그아웃 되었습니다.', {
      cssClass: 'alert-success',
      timeout: 3000,
    });
    this.router.navigate(['/login']);
  }

  // 로그인 여부 검증 함수 불러오기
  checkLoggedIn(): boolean {
    return this.authService.loggedIn();
  }
}
