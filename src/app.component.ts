
import { Component, inject, signal, HostListener, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { ProductCardComponent } from './components/product-card.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { LoginComponent } from './components/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ProductCardComponent, 
    CartDrawerComponent, 
    ProductDetailComponent, 
    LoginComponent,
    AdminDashboardComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  dataService = inject(DataService);
  isCartOpen = signal(false);
  
  // 'shop' or 'admin'
  currentView = signal<'shop' | 'admin'>('shop');

  constructor() {
    // If user logs out or changes, reset view
    effect(() => {
        if (!this.dataService.currentUser()) {
            this.currentView.set('shop');
        } else if (this.dataService.currentUser()?.isAdmin) {
            this.currentView.set('admin');
        }
    });
  }

  ngOnInit() {
    // Listen for close events from cart
    document.addEventListener('close-cart', () => this.isCartOpen.set(false));
  }

  toggleCart() {
    this.isCartOpen.update(v => !v);
  }

  updateSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.dataService.searchQuery.set(val);
  }

  updateStockFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'in_stock' | 'all';
    this.dataService.filterStock.set(val);
  }

  updateStatusFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'active' | 'all';
    this.dataService.filterStatus.set(val);
  }

  logout() {
    this.dataService.logout();
    this.isCartOpen.set(false);
  }
  
  switchView(view: 'shop' | 'admin') {
      this.currentView.set(view);
  }
}
