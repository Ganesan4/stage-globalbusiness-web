import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';
import { SalesPopupComponent } from './sales-popup/sales-popup.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent, HttpClientModule, ScrollToTopComponent, SalesPopupComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'GlobalBusinessPage';
}
