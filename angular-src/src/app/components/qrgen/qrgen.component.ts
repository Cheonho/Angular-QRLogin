import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'src/app/service/auth.service';
import * as forge from 'node-forge';

const pki = forge.pki;

@Component({
  selector: 'app-qrgen',
  templateUrl: './qrgen.component.html',
  styleUrls: ['./qrgen.component.scss'],
})
export class QrgenComponent implements OnInit {
  username: string;
  value: string;
  ctime: string;

  constructor(
    private authService: AuthService,
    private flashMessage: FlashMessagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    let userNoPW: any = localStorage.getItem('userNoPW');
    this.username = JSON.parse(userNoPW).username;

    const privateKeyPem = localStorage.getItem('privateKey');
    const privateKey = pki.privateKeyFromPem(privateKeyPem);
    const certPem = localStorage.getItem('cert');
    const cert = pki.certificateFromPem(certPem);
    const username = cert.subject.getField('CN').value;
    const currentTime = new Date().getTime();

    // 전자 서명
    if (!privateKeyPem) {
      this.flashMessage.show('No certificate provided', {
        cssClass: 'alert-danger',
        timeout: 5000,
      });
      this.router.navigate(['login']);
    }

    let md = forge.md.sha1.create();
    md.update(username + currentTime, 'utf8');
    const signature = privateKey.sign(md);
    const signatureHex = forge.util.bytesToHex(signature);
    const request = {
      username: username,
      currentTime: currentTime,
      signatureHex: signatureHex,
    };

    // request를 string으로 만들어 QR에 적용
    const loginRequest = JSON.stringify(request);
    this.value = loginRequest;
  }
}
