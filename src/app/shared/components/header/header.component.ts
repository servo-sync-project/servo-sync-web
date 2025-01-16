import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { AuthStorageService } from "../../../core/services/auth-storage.service";

@Component({
    selector: 'app-header',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private authStorage: AuthStorageService,
    private router: Router
  ) { }
  toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'synthwave' : 'retro';
    document.documentElement.setAttribute('data-theme', theme);
  }

  toHeaderView() {
    this.authStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return this.authStorage.isAuthenticated();
  }
}
