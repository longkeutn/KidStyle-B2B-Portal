
import { Component, input, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Product, DataService } from '../services/data.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div 
      (click)="viewDetails()"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300 cursor-pointer group">
      <div class="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
        <img [ngSrc]="product().image" fill priority class="object-cover transition-transform duration-500 group-hover:scale-105" alt="{{product().name}}">
        <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {{product().size}}
        </div>
      </div>
      
      <div class="p-4 flex flex-col flex-grow">
        <div class="text-xs text-indigo-500 font-bold mb-1 tracking-wide">{{product().code}}</div>
        <h3 class="font-medium text-gray-800 text-sm mb-1 line-clamp-2 leading-snug">{{product().name}}</h3>
        <p class="text-xs text-gray-500 mb-3">Màu: {{product().color}}</p>
        
        <div class="mt-auto flex items-center justify-between gap-2">
          <span class="text-rose-600 font-bold text-base">{{product().price | number:'1.0-0'}}₫</span>
          
          <div class="flex items-center gap-2" (click)="$event.stopPropagation()">
            <!-- Quantity Control -->
            <div class="flex items-center bg-gray-100 rounded-lg h-8 border border-gray-200">
                <button (click)="updateQty(-1)" class="px-2 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white rounded-l-lg transition-colors font-bold">-</button>
                <span class="text-xs font-bold w-6 text-center text-gray-800">{{quantity()}}</span>
                <button (click)="updateQty(1)" class="px-2 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white rounded-r-lg transition-colors font-bold">+</button>
            </div>

            <button 
                (click)="onAdd()"
                class="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-indigo-200 shadow-lg"
                aria-label="Thêm vào giỏ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  dataService = inject(DataService);
  quantity = signal(1);

  updateQty(delta: number) {
    this.quantity.update(v => {
        const newVal = v + delta;
        return newVal < 1 ? 1 : Math.min(newVal, this.product().stock);
    });
  }

  onAdd() {
    this.dataService.addToCart(this.product(), this.quantity());
    this.quantity.set(1);
  }

  viewDetails() {
    this.dataService.openProductDetail(this.product());
  }
}
