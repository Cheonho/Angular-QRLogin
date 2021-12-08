import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'src/app/service/auth.service';
import { ValidateService } from 'src/app/service/validate.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  // Typescript 실행환경 설정(tsconfig.json)을 통해 완화를 해야 오류 안남
  name: string;
  username: string;
  email: string;
  password1: string;
  password2: string;

  // ValidateService 불러와서 사용
  constructor(
    private validateService: ValidateService,
    private flashMessage: FlashMessagesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  // any는 return 이 나왔을 때 return 값이 뭔지 선언 - 참고로 string 등등 가능
  onRegisterSubmit(): any {
    // 패스워드 일치 여부 검증
    if (this.password1 !== this.password2) {
      this.flashMessage.show('패스워드가 일치하지 않습니다. 다시 입력하세요', {
        cssClass: 'alert-danger', // 메시지의 색
        timeout: 3000, // 메시지를 얼마나 띄울지 3000 -> 3초
      });
      console.log('패스워드가 일치하지 않습니다. 다시 입력하세요');
      return false;
    }

    // 이메일 주소 유효성 검증
    if (!this.validateService.ValidateEmail(this.email)) {
      this.flashMessage.show('유효한 이메일 주소를 입력하세요', {
        cssClass: 'alert-danger',
        timeout: 3000,
      });
      console.log('유효한 이메일 주소를 입력하세요');
      return false;
    }

    // 사용자 입력정보로 JSON 객체 생성
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password1,
    };

    if (!this.validateService.ValidateRegister(user)) {
      this.flashMessage.show('모든 필드를 입력하세요', {
        cssClass: 'alert-danger',
        timeout: 3000,
      });
      console.log('모든 필드를 입력하세요');
      return false;
    }

    // this.flashMessage.show('사용자 입력정보 검증 완료', {
    //   cssClass: 'alert-success',
    //   timeout: 5000,
    // });
    // console.log('사용자 입력정보 검증 완료');

    this.authService.registerUser(user).subscribe((data) => {
      if (data.success) {
        this.flashMessage.show(data.msg, {
          cssClass: 'alert-success',
          timeout: 3000,
        });
        // router를 통해 login page로 이동
        this.router.navigate(['/login']);
      } else {
        this.flashMessage.show(data.msg, {
          cssClass: 'alert-danger',
          timeout: 3000,
        });
        this.router.navigate(['/register']);
      }
    });
  }
}
