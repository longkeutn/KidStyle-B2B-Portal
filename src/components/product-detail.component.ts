
import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DataService, Product } from '../services/data.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="close()"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-pop-in max-h-[90vh] md:h-auto h-full">
        <button (click)="close()" class="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Left: Image Gallery -->
        <div class="w-full md:w-1/2 bg-gray-50 flex flex-col h-1/2 md:h-auto border-r border-gray-100">
             <div class="relative flex-1 w-full h-full min-h-0">
                <img [src]="activeImage()" class="w-full h-full object-cover" [alt]="product().name">
             </div>
             
             <!-- Thumbnails -->
             @if (allImages().length > 1) {
               <div class="flex gap-2 p-4 overflow-x-auto border-t border-gray-100 bg-white">
                  @for (img of allImages(); track img) {
                    <button 
                      (click)="activeImage.set(img)" 
                      class="relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0"
                      [class.border-indigo-600]="activeImage() === img"
                      [class.border-transparent]="activeImage() !== img"
                    >
                      <img [src]="img" class="w-full h-full object-cover">
                    </button>
                  }
               </div>
             }
        </div>

        <!-- Right: Details Section -->
        <div class="w-full md:w-1/2 flex flex-col h-1/2 md:h-[600px] overflow-hidden bg-white">
          <div class="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
            
            <!-- Header -->
            <div class="mb-4">
               <div class="flex flex-wrap items-center gap-2 mb-2">
                 <span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded tracking-wider">{{product().code}}</span>
                 @if(product().stock < 10) {
                    <span class="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded animate-pulse">Sắp hết</span>
                 }
               </div>
               <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">{{product().name}}</h2>
               <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M20.38 3.4a1.6 1.6 0 0 0-2.22 0l1.62 1.62a1.6 1.6 0 0 0 2.22 0l-1.62-1.62Z"/><path d="M4 19.8v.6a.6.6 0 0 0 .6.6h.6l16-16L20 3.8 3.8 20 4 19.8Z"/></svg>
                  <span>{{product().fabric}}</span>
               </div>
            </div>

            <!-- Price & Stock -->
            <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span class="text-3xl font-bold text-rose-600">{{product().price | number:'1.0-0'}}₫</span>
              <div class="h-8 w-px bg-gray-300"></div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-bold">Hàng có sẵn</span>
                <span class="text-sm font-medium text-gray-800">{{product().stock}} cái</span>
              </div>
            </div>

            <!-- Color Selection -->
            @if (uniqueColors().length > 0) {
              <div class="mb-4">
                 <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Màu sắc</h4>
                 <div class="flex flex-wrap gap-2">
                    @for (variant of uniqueColors(); track variant.code) {
                        <button 
                            (click)="switchProduct(variant)" 
                            class="px-3 py-1.5 border rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                            [class.border-indigo-600]="variant.color === product().color"
                            [class.bg-indigo-50]="variant.color === product().color"
                            [class.text-indigo-700]="variant.color === product().color"
                            [class.border-gray-200]="variant.color !== product().color"
                            [class.text-gray-600]="variant.color !== product().color"
                            [class.hover:border-indigo-300]="variant.color !== product().color"
                        >
                            {{variant.color}}
                            @if(variant.color === product().color) {
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            }
                        </button>
                    }
                 </div>
              </div>
            }

            <!-- Size Selection -->
            @if (sortedSizes().length > 0) {
               <div class="mb-6">
                 <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Size có sẵn</h4>
                 <div class="flex flex-wrap gap-2">
                    @for (variant of sortedSizes(); track variant.code) {
                        <button 
                          (click)="switchProduct(variant)" 
                          class="min-w-[3rem] px-3 py-2 border rounded-lg text-sm font-bold transition-all text-center"
                          [class.border-indigo-600]="variant.code === product().code"
                          [class.bg-indigo-600]="variant.code === product().code"
                          [class.text-white]="variant.code === product().code"
                          [class.border-gray-200]="variant.code !== product().code"
                          [class.text-gray-700]="variant.code !== product().code"
                          [class.hover:border-indigo-400]="variant.code !== product().code"
                        >
                            {{variant.size}}
                        </button>
                    }
                 </div>
               </div>
             }

            <!-- Description -->
            <div class="mb-8">
                <h4 class="text-sm font-bold text-gray-900 mb-2">Mô tả</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{product().description}}</p>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex gap-4">
             <!-- Quantity -->
             <div class="flex items-center bg-gray-100 rounded-xl h-14 border border-gray-200">
                  <button (click)="updateQty(-1)" class="w-12 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 font-bold text-lg rounded-l-xl transition-colors" [disabled]="quantity() <= 1">-</button>
                  <span class="w-10 text-center font-bold text-gray-800">{{quantity()}}</span>
                  <button (click)="updateQty(1)" class="w-12 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 font-bold text-lg rounded-r-xl transition-colors" [disabled]="quantity() >= product().stock">+</button>
             </div>

            <button 
                (click)="addToCart()"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Thêm Size {{product().size}} - {{(product().price * quantity()) | number:'1.0-0'}}₫
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pop-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-pop-in {
      animation: pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
  `]
})
export class ProductDetailComponent {
  dataService = inject(DataService);
  product = computed(() => this.dataService.selectedProduct()!);
  quantity = signal(1);
  
  // Image Gallery State
  activeImage = signal<string>('');
  
  // Computed helpers
  allImages = computed(() => {
    const p = this.product();
    return [p.image, ...p.moreImages];
  });

  // Get all variants (products with same name)
  allVariants = computed(() => {
    const current = this.product();
    const all = this.dataService.products();
    return all.filter(p => p.name === current.name && p.status === 'Hiện');
  });

  // Calculate unique colors from all variants
  uniqueColors = computed(() => {
    const variants = this.allVariants();
    const current = this.product();
    const map = new Map<string, Product>();
    
    variants.forEach(p => {
        // If we don't have this color yet, add it
        if (!map.has(p.color)) {
             map.set(p.color, p);
        } else {
             // Logic to prefer picking a variant that matches current size if available
             // (e.g., if switching from Pink 120 to Yellow, prefer Yellow 120 if exists)
             const existing = map.get(p.color)!;
             if (existing.size !== current.size && p.size === current.size) {
                 map.set(p.color, p);
             }
        }
    });
    return Array.from(map.values());
  });

  // Get sizes strictly for the currently selected color
  sortedSizes = computed(() => {
    const current = this.product();
    const variants = this.allVariants();
    
    return variants
        .filter(p => p.color === current.color)
        .sort((a, b) => {
             const nA = parseInt(a.size);
             const nB = parseInt(b.size);
             if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
             return a.size.localeCompare(b.size, undefined, {numeric: true});
        });
  });

  constructor() {
    // Reset active image and quantity when product changes
    effect(() => {
        const p = this.product();
        if (p) {
            this.activeImage.set(p.image);
            this.quantity.set(1);
        }
    });
  }

  close() {
    this.dataService.closeProductDetail();
  }

  updateQty(delta: number) {
      this.quantity.update(v => {
          const newVal = v + delta;
          return newVal < 1 ? 1 : Math.min(newVal, this.product().stock);
      });
  }

  addToCart() {
    this.dataService.addToCart(this.product(), this.quantity());
    this.close();
  }

  switchProduct(p: Product) {
    this.dataService.openProductDetail(p);
  }
}
