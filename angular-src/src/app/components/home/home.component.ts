import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PdfService],
})
export class HomeComponent implements OnInit {
  //pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  pdfSrc: string = '';
  page: number = 1;

  constructor(private pdfService: PdfService) {}

  ngOnInit(): void {
    this.pdfSrc = this.pdfService.getPDF();
  }
}
