
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 animate-fade-in">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white font-bold text-3xl mb-4 shadow-lg shadow-indigo-300">
            K
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Chào mừng trở lại</h1>
          <p class="text-gray-500 text-sm mt-1">Đăng nhập để xem giá sỉ B2B</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Số điện thoại</label>
            <input 
              formControlName="phone" 
              type="text" 
              class="w-full p-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" 
              placeholder="0909123456"
            >
          </div>
          
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Mật khẩu</label>
            <input 
              formControlName="password" 
              type="password" 
              class="w-full p-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" 
              placeholder="••••••"
            >
          </div>

          @if (error()) {
            <div class="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{error()}}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loginForm.invalid"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
            Đăng Nhập
          </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-xs text-gray-400">Đăng nhập Demo:</p>
            <div class="flex justify-center gap-2 mt-2 flex-wrap">
                <button (click)="fillDemo('0909123456', '123')" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Shop Baby Cute</button>
                <button (click)="fillDemo('admin', 'admin')" class="text-xs bg-gray-800 hover:bg-gray-900 px-2 py-1 rounded text-white font-bold">Admin Panel</button>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out;
    }
  `]
})
export class LoginComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  loginForm = this.fb.group({
    phone: ['', Validators.required],
    password: ['', Validators.required]
  });

  error = signal<string>('');

  onSubmit() {
    if (this.loginForm.valid) {
      const { phone, password } = this.loginForm.value;
      const success = this.dataService.login(phone!, password!);
      if (!success) {
        this.error.set('Số điện thoại hoặc mật khẩu không đúng');
      }
    }
  }

  fillDemo(phone: string, pass: string) {
    this.loginForm.patchValue({
        phone: phone,
        password: pass
    });
  }
}
