import { Component, HostListener, OnInit } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  scrolled = false;
  menuOpen = false;

  navLinks = [
    { path: '/', en: 'Home', ka: 'მთავარი', exact: true },
    { path: '/trains', en: 'Trains', ka: 'მატარებლები', exact: false },
    { path: '/departures', en: 'Departures', ka: 'გასვლები', exact: false },
    { path: '/booking', en: 'Book', ka: 'ბილეთი', exact: false },
    { path: '/ticket-status', en: 'My Tickets', ka: 'ჩემი ბილეთები', exact: false },
  ];

  constructor(
    public themeService: ThemeService,
    public auth: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
