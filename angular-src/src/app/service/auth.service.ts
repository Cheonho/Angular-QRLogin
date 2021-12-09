import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { Login, User, UserNoPW, CertReq } from '../models/User';
import * as forge from 'node-forge';

const pki = forge.pki;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authToken: any; // jwt 토큰을 사용하기 위해
  user: User;

  constructor(private http: HttpClient, public jwtHelper: JwtHelperService) {}

  prepEndpoint(ep) {
    // 1. 로컬 서버에서 개발시
    // return 'http://localhost:3000/' + ep;

    // 2. 클라우드 서버에서 운영시
    return ep;
  }

  registerUser(user: User): Observable<any> {
    // const registerUrl = 'http://localhost:3000/users/register';
    const registerUrl = this.prepEndpoint('users/register');
    return this.http.post<any>(registerUrl, user, httpOptions);
  }

  authenticateUser(login: Login): Observable<any> {
    // const loginUrl = 'http://localhost:3000/users/authenticate';
    const loginUrl = this.prepEndpoint('users/authenticate');
    return this.http.post<any>(loginUrl, login, httpOptions);
  }

  storeUserData(token: any, userNoPW: UserNoPW) {
    // 브라우저의 storage에 authToken이라는 이름으로 token 저장, userNoPW라는 이름으로 userNoPW저장
    // userNoPW는 JSON 형식 -> 브라우저에 JSON형식으로 저장할 수 없어서 string으로 바꾼 후 저장
    localStorage.setItem('authToken', token);
    localStorage.setItem('userNoPW', JSON.stringify(userNoPW));
  }

  // 로그아웃
  logout() {
    // localStorage에 있는 값을 지운다
    localStorage.removeItem('authToken');
    localStorage.removeItem('userNoPW');
    // localStorage.clear(); // -> clear는 localStorage에 있는 정보를 모두 지운다
  }

  // 토큰인증 서비스
  getProfile(): Observable<any> {
    let authToken: any = localStorage.getItem('authToken');
    const httpOptions1 = {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      }),
    };
    // const profileUrl = 'http://localhost:3000/users/profile';
    const profileUrl = this.prepEndpoint('users/profile');
    return this.http.get<any>(profileUrl, httpOptions1);
  }

  // 로그인 여부 검증
  loggedIn(): boolean {
    let authToken: any = localStorage.getItem('authToken');
    return !this.jwtHelper.isTokenExpired(authToken);
  }

  // 유저 리스트
  getList(): Observable<any> {
    let authToken: any = localStorage.getItem('authToken');
    const httpOptions1 = {
      headers: new HttpHeaders({
        contentType: 'application/json',
        authorization: 'Bearer ' + authToken,
      }),
    };
    const listUrl = this.prepEndpoint('users/list');
    return this.http.get(listUrl, httpOptions1);
  }

  // 인증서 발급
  certRequest(request, keySize): Observable<any> {
    // 키쌍 생성
    let keyPair = pki.rsa.generateKeyPair(keySize);
    let publicKey = keyPair.publicKey;
    let privateKey = keyPair.privateKey;
    let publicKeyPem = pki.publicKeyToPem(publicKey);
    let privateKeyPem = pki.privateKeyToPem(privateKey);

    // 개인키는 로컬스토리지에 저장
    localStorage.setItem('privateKey', privateKeyPem);

    // 서버에 user/cert로 post 요청
    const req: CertReq = {
      country: forge.util.encodeUtf8(request.country),
      state: forge.util.encodeUtf8(request.state),
      locality: forge.util.encodeUtf8(request.locality),
      organization: forge.util.encodeUtf8(request.organization),
      orgUnit: forge.util.encodeUtf8(request.orgUnit),
      common: request.common, // common = username은 영어로 해야함
      publicKey: publicKeyPem,
    };

    // 발급받은 인증서를 로컬스토리지에 저장
    const certUrl = this.prepEndpoint('users/cert');
    return this.http.post(certUrl, req, httpOptions);
  }

  // 발급받은 인증서를 로컬스토리지에 저장
  storeCert(cert, caCert) {
    localStorage.setItem('cert', cert);
    localStorage.setItem('caCert', caCert);
  }

  // 전자서명 로그인
  authenticateSigUser(request): Observable<any> {
    const loginUrl = this.prepEndpoint('users/authenticateSig');
    return this.http.post(loginUrl, request, httpOptions);
  }
}
