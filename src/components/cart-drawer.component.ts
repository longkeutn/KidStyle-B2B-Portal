
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" (click)="close()"></div>
      
      <!-- Drawer -->
      <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Đơn Hàng Của Bạn
          </h2>
          <button (click)="close()" class="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          @if (dataService.cart().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <p>Giỏ hàng trống.</p>
            </div>
          } @else {
            @for (item of dataService.cart(); track item.code) {
              <div class="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <img [src]="item.image" class="w-16 h-20 object-cover rounded-md bg-white" alt="Thumb">
                <div class="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 class="font-medium text-gray-800 text-sm line-clamp-1">{{item.name}}</h4>
                    <p class="text-xs text-gray-500">{{item.code}} | {{item.size}} | {{item.color}}</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center bg-white rounded border border-gray-200">
                      <button (click)="dataService.updateQuantity(item.code, -1)" class="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                      <span class="px-2 text-sm font-medium w-8 text-center">{{item.quantity}}</span>
                      <button (click)="dataService.updateQuantity(item.code, 1)" class="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                    <span class="font-bold text-gray-700">{{(item.price * item.quantity) | number:'1.0-0'}}₫</span>
                  </div>
                </div>
                <button (click)="dataService.removeFromCart(item.code)" class="text-gray-400 hover:text-red-500 self-start">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            }
          }
        </div>

        <!-- Footer / Checkout -->
        @if (dataService.cart().length > 0) {
          <div class="p-4 border-t border-gray-100 bg-white space-y-4">
            <div class="flex justify-between items-end mb-2">
              <span class="text-gray-500">Tạm tính</span>
              <span class="text-2xl font-bold text-indigo-600">{{dataService.cartTotal() | number:'1.0-0'}}₫</span>
            </div>

            @if (step() === 'form') {
              <form [formGroup]="checkoutForm" (ngSubmit)="previewOrder()" class="space-y-3">
                <div class="relative">
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Tên Đại Lý</label>
                  <input formControlName="dealerName" type="text" [readonly]="!!dataService.currentUser()" class="w-full p-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm read-only:bg-gray-100 read-only:text-gray-500" placeholder="Shop Baby Cute">
                   @if (dataService.currentUser()) {
                      <svg class="absolute right-3 top-8 text-green-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   }
                </div>
                <div class="relative">
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input formControlName="phone" type="tel" [readonly]="!!dataService.currentUser()" class="w-full p-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm read-only:bg-gray-100 read-only:text-gray-500" placeholder="0909 123 456">
                </div>
                <button type="submit" [disabled]="checkoutForm.invalid || loading()" 
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70">
                  @if(loading()) {
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  }
                  Xem lại & Gửi đơn
                </button>
              </form>
            } @else {
              <!-- AI Summary View -->
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto text-sm">
                <div class="flex items-center gap-2 mb-2 text-indigo-600 font-bold">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                   Xem trước Email (AI tạo)
                </div>
                <div class="prose prose-sm" [innerHTML]="aiSummary()"></div>
              </div>
              <div class="flex gap-3">
                <button (click)="step.set('form')" class="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Quay lại</button>
                <button (click)="confirmOrder()" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all">
                  Xác nhận đặt hàng
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class CartDrawerComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  checkoutForm = this.fb.group({
    dealerName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]]
  });

  loading = signal(false);
  step = signal<'form' | 'preview'>('form');
  aiSummary = signal<string>('');

  constructor() {
    effect(() => {
      const user = this.dataService.currentUser();
      if (user) {
        this.checkoutForm.patchValue({
          dealerName: user.name,
          phone: user.phone
        });
      }
    });
  }

  close() {
    // We rely on parent to toggle this component off via @if, 
    // but in this architecture, we might emit an event.
    // For simplicity, we'll implement the toggle in AppComponent.
    document.dispatchEvent(new CustomEvent('close-cart'));
  }

  async previewOrder() {
    if (this.checkoutForm.invalid) return;
    this.loading.set(true);
    
    // Simulate API delay + Call Gemini
    const info = {
        dealerName: this.checkoutForm.value.dealerName!,
        phone: this.checkoutForm.value.phone!
    };
    
    const summary = await this.dataService.generateOrderSummary(info);
    this.aiSummary.set(summary);
    
    this.loading.set(false);
    this.step.set('preview');
  }

  confirmOrder() {
    // Simulate GAS submission
    alert('Đã gửi đơn hàng thành công! Email đã được gửi đến quản trị viên.');
    this.dataService.clearCart();
    this.close();
  }
}
