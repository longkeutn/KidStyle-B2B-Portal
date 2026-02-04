
import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DataService, Product } from '../services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-65px)] bg-gray-50">
      
      <div class="p-4 space-y-4">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- KPI Cards -->
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"/><path d="m3.09 8.84 12.35-6.61"/><path d="M2.05 17.66 14.32 11"/><path d="m21.91 8.84-12.35-6.61"/><path d="M21.95 17.66 9.68 11"/></svg>
             </div>
             <div>
                <p class="text-xs text-gray-500 font-semibold uppercase">Tổng mã SP</p>
                <h3 class="text-xl font-bold text-gray-800">{{totalSkus()}}</h3>
             </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <div>
                <p class="text-xs text-gray-500 font-semibold uppercase">Tổng giá trị</p>
                <h3 class="text-xl font-bold text-gray-800">{{totalValue() | number:'1.0-0'}}₫</h3>
             </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
             <div>
                <p class="text-xs text-gray-500 font-semibold uppercase">Sắp hết hàng</p>
                <h3 class="text-xl font-bold text-gray-800">{{lowStockCount()}}</h3>
             </div>
          </div>
        </div>

        <!-- Toolbar: Search & Filters OR Bulk Actions -->
        @if (selectionCount() > 0) {
            <div class="flex flex-col md:flex-row items-center gap-4 bg-indigo-600 p-3 rounded-xl border border-indigo-500 shadow-sm animate-fade-in text-white transition-all">
                <div class="flex-1 font-bold flex items-center gap-2">
                    <span class="bg-white/20 px-3 py-1 rounded-lg">{{selectionCount()}} Đã chọn</span>
                    <span class="text-sm font-normal opacity-80 hidden md:inline">Chọn sản phẩm để cập nhật trạng thái</span>
                </div>
                
                <div class="flex gap-2 w-full md:w-auto">
                    <button (click)="applyBulkStatus('Hiện')" class="flex-1 md:flex-none bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Hiện
                    </button>
                    <button (click)="applyBulkStatus('Ẩn')" class="flex-1 md:flex-none bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        Ẩn
                    </button>
                    <div class="w-px bg-white/20 mx-1"></div>
                    <button (click)="clearSelection()" class="p-2 hover:bg-white/20 rounded-lg transition-colors text-white" title="Bỏ chọn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>
        } @else {
            <div class="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in transition-all">
                <div class="flex-1 relative">
                    <input 
                        type="text" 
                        [(ngModel)]="searchTerm"
                        placeholder="Tìm kiếm kho..." 
                        class="w-full h-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    >
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                
                <div class="flex gap-2">
                    <select 
                        [ngModel]="filterStatus()" 
                        (ngModelChange)="filterStatus.set($event)"
                        class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[120px]"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hiện</option>
                        <option value="hidden">Đang ẩn</option>
                    </select>

                    <select 
                        [ngModel]="filterStock()" 
                        (ngModelChange)="filterStock.set($event)"
                        class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[130px]"
                    >
                        <option value="all">Tất cả kho</option>
                        <option value="low">Sắp hết (<10)</option>
                    </select>
                </div>

                <button 
                    (click)="openAddModal()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span class="inline">Thêm SP</span>
                </button>
            </div>
        }
      </div>

      <!-- Inventory Table -->
      <div class="flex-1 overflow-auto px-4 pb-4">
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th class="pl-6 pr-3 py-4 w-12">
                    <div class="flex items-center">
                        <input type="checkbox" 
                            [checked]="isAllSelected()" 
                            [indeterminate]="isIndeterminate()"
                            (change)="toggleSelectAll()"
                            class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                        >
                    </div>
                </th>
                <th class="px-6 py-4 font-semibold text-gray-600">Sản phẩm</th>
                <th class="px-6 py-4 font-semibold text-gray-600">Thuộc tính</th>
                <th class="px-6 py-4 font-semibold text-gray-600">Giá</th>
                <th class="px-6 py-4 font-semibold text-gray-600 w-40">Tồn kho</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-center">Trạng thái</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (product of filteredInventory(); track product.code) {
                <tr class="hover:bg-gray-50 transition-colors group" [class.bg-indigo-50]="selectedCodes().has(product.code)">
                  <!-- Checkbox -->
                  <td class="pl-6 pr-3 py-3">
                     <div class="flex items-center">
                        <input type="checkbox" 
                            [checked]="selectedCodes().has(product.code)"
                            (change)="toggleSelection(product.code)"
                            class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                        >
                     </div>
                  </td>
                  
                  <!-- Product Info -->
                  <td class="px-6 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded border border-gray-200 bg-gray-50 overflow-hidden relative">
                         <img [src]="product.image" class="w-full h-full object-cover" alt="thumb" onerror="this.src='https://via.placeholder.com/40'">
                      </div>
                      <div class="max-w-[180px]">
                        <div class="font-bold text-gray-900 truncate" title="{{product.name}}">{{product.name}}</div>
                        <div class="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                           <span>{{product.code}}</span>
                           @if(product.baseCode && product.baseCode !== product.code) {
                              <span class="bg-gray-100 px-1 rounded text-gray-500">Var</span>
                           }
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Attributes -->
                  <td class="px-6 py-3">
                    <div class="flex flex-col">
                        <span class="text-gray-700 font-medium">{{product.color}}</span>
                        <span class="text-gray-500 text-xs">Size: {{product.size}}</span>
                    </div>
                  </td>

                  <!-- Price -->
                  <td class="px-6 py-3 font-medium text-gray-700">
                    {{product.price | number:'1.0-0'}}₫
                  </td>

                  <!-- Stock Management (Button Trigger) -->
                  <td class="px-6 py-3">
                     <button 
                        (click)="openStockModal(product)"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors w-full justify-between group/stock"
                        [class.border-red-200]="product.stock < 10"
                        [class.bg-red-50]="product.stock < 10"
                        [class.border-gray-200]="product.stock >= 10"
                     >
                        <span class="font-bold" [class.text-red-600]="product.stock < 10">{{product.stock}}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover/stock:text-indigo-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                     </button>
                  </td>

                  <!-- Visibility Status -->
                  <td class="px-6 py-3 text-center">
                    <button 
                        (click)="toggleStatus(product.code)"
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        [class.bg-green-500]="product.status === 'Hiện'"
                        [class.bg-gray-200]="product.status === 'Ẩn'"
                    >
                        <span 
                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm"
                            [class.translate-x-4]="product.status === 'Hiện'"
                            [class.translate-x-0.5]="product.status === 'Ẩn'"
                        ></span>
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="openEditModal(product)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Sửa">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button (click)="confirmDelete(product)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center justify-center p-8 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <p class="mt-2 text-sm font-medium">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
                            <button (click)="resetFilters()" class="mt-3 text-indigo-600 font-bold hover:underline text-xs">Xóa bộ lọc</button>
                        </div>
                    </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Product Form Modal (Add/Edit) -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div>
                <h3 class="font-bold text-lg text-gray-800">{{ currentProduct() ? 'Sửa nhóm sản phẩm' : 'Thêm nhóm sản phẩm mới' }}</h3>
                <p class="text-xs text-gray-500">Quản lý thông tin chung và các biến thể SKU</p>
             </div>
             <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-6 space-y-8">
                
                <!-- Section 1: Base Details -->
                <div class="space-y-4">
                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Thông tin chung</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Mã gốc / Mã kiểu dáng</label>
                                <input formControlName="baseCode" class="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. KID001">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Tên sản phẩm</label>
                                <input formControlName="name" class="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Summer Floral Dress">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Chất liệu vải</label>
                                <input formControlName="fabric" class="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. 100% Cotton">
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả</label>
                                <textarea formControlName="description" rows="4" class="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Mô tả chi tiết sản phẩm..."></textarea>
                            </div>
                             <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Trạng thái (Mặc định)</label>
                                <select formControlName="status" class="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition">
                                    <option value="Hiện">Đang hiện</option>
                                    <option value="Ẩn">Đang ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase mb-1">URL ảnh chính</label>
                        <div class="flex gap-4 items-start">
                            <input formControlName="image" class="flex-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="https://...">
                            <div class="w-16 h-16 border rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden shadow-sm">
                                 <img [src]="productForm.get('image')?.value" class="w-full h-full object-cover" onerror="this.style.display='none'" onload="this.style.display='block'">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Variants (SKUs) -->
                <div>
                    <div class="flex items-center justify-between border-b pb-2 mb-4">
                        <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Biến thể sản phẩm (SKU)</h4>
                        <button type="button" (click)="addVariant()" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Thêm biến thể
                        </button>
                    </div>

                    <div class="space-y-3" formArrayName="variants">
                        <!-- Headers -->
                        <div class="hidden md:grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 px-2">
                             <div class="col-span-3">Mã SKU</div>
                             <div class="col-span-2">Màu</div>
                             <div class="col-span-2">Size</div>
                             <div class="col-span-2">Giá</div>
                             <div class="col-span-2">Kho</div>
                             <div class="col-span-1 text-center">Xóa</div>
                        </div>

                        @for (variant of variants.controls; track $index) {
                            <div [formGroupName]="$index" class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100 relative group animate-fade-in">
                                <div class="col-span-3">
                                    <label class="md:hidden text-[10px] font-bold text-gray-400 uppercase">Code</label>
                                    <input formControlName="code" class="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="SKU">
                                </div>
                                <div class="col-span-2">
                                    <label class="md:hidden text-[10px] font-bold text-gray-400 uppercase">Color</label>
                                    <input formControlName="color" class="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Màu">
                                </div>
                                <div class="col-span-2">
                                    <label class="md:hidden text-[10px] font-bold text-gray-400 uppercase">Size</label>
                                    <input formControlName="size" class="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Size">
                                </div>
                                <div class="col-span-2">
                                    <label class="md:hidden text-[10px] font-bold text-gray-400 uppercase">Price</label>
                                    <input type="number" formControlName="price" class="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="0">
                                </div>
                                <div class="col-span-2">
                                    <label class="md:hidden text-[10px] font-bold text-gray-400 uppercase">Stock</label>
                                    <input type="number" formControlName="stock" class="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="0">
                                </div>
                                <div class="col-span-1 flex justify-center pt-1 md:pt-0 h-full items-center">
                                    <button type="button" (click)="removeVariant($index)" class="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Xóa biến thể">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>

            </form>
          </div>
          
          <div class="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
             <button (click)="closeModal()" class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
             <button (click)="saveProduct()" [disabled]="productForm.invalid" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors">
                Lưu nhóm sản phẩm
             </button>
          </div>
        </div>
      </div>
    }

    <!-- Stock Management Modal -->
    @if (showStockModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="closeStockModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in transform transition-all scale-100">
            <!-- Header -->
            <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-gray-800 text-lg">Cập nhật kho</h3>
                    <p class="text-xs text-gray-500 font-mono">{{currentStockProduct()?.code}}</p>
                </div>
                <button (click)="closeStockModal()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            
            <div class="p-6">
                <!-- Visual Equation Board -->
                <div class="flex items-start justify-between gap-1 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden">
                    <!-- Background decoration -->
                    <div class="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-50 pointer-events-none"></div>

                    <!-- Current -->
                    <div class="text-center flex-1 relative z-10">
                        <div class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hiện tại</div>
                        <div class="text-2xl font-bold text-slate-600">{{currentStockProduct()?.stock}}</div>
                    </div>

                    <!-- Operator -->
                    <div class="flex items-center justify-center w-8 pt-3 relative z-10">
                        @switch (stockMode()) {
                            @case ('add') { <div class="text-emerald-500 font-black text-lg bg-emerald-50 w-6 h-6 rounded flex items-center justify-center">+</div> }
                            @case ('subtract') { <div class="text-rose-500 font-black text-lg bg-rose-50 w-6 h-6 rounded flex items-center justify-center">-</div> }
                            @case ('set') { <div class="text-slate-400 font-black text-lg">→</div> }
                        }
                    </div>

                    <!-- Input Preview -->
                     <div class="text-center flex-1 relative z-10">
                        <div class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            @if(stockMode() === 'set') { Đặt lại } @else { Điều chỉnh }
                        </div>
                        <div class="text-2xl font-bold break-all" 
                             [class.text-emerald-600]="stockMode() === 'add'"
                             [class.text-rose-600]="stockMode() === 'subtract'"
                             [class.text-blue-600]="stockMode() === 'set'">
                             {{stockValue() || 0}}
                        </div>
                    </div>

                    <!-- Equals -->
                    <div class="flex items-center justify-center w-6 pt-3 text-slate-300 font-black text-lg relative z-10">=</div>

                    <!-- Result -->
                    <div class="text-center flex-1 relative z-10">
                        <div class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Mới</div>
                        <div class="text-2xl font-bold text-indigo-600" 
                             [class.text-red-500]="previewNewStock() < 10"
                             [class.text-slate-300]="previewNewStock() === currentStockProduct()?.stock">
                             {{previewNewStock()}}
                        </div>
                    </div>
                </div>

                <!-- Mode Switcher Tabs -->
                <div class="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-6">
                    <button 
                        (click)="stockMode.set('add')" 
                        class="py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                        [class.bg-white]="stockMode() === 'add'"
                        [class.shadow-sm]="stockMode() === 'add'"
                        [class.text-emerald-600]="stockMode() === 'add'"
                        [class.text-gray-500]="stockMode() !== 'add'"
                    >
                        <span>Thêm</span>
                    </button>
                    <button 
                        (click)="stockMode.set('subtract')" 
                        class="py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                        [class.bg-white]="stockMode() === 'subtract'"
                        [class.shadow-sm]="stockMode() === 'subtract'"
                        [class.text-rose-600]="stockMode() === 'subtract'"
                        [class.text-gray-500]="stockMode() !== 'subtract'"
                    >
                        <span>Bớt</span>
                    </button>
                    <button 
                        (click)="stockMode.set('set')" 
                        class="py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                        [class.bg-white]="stockMode() === 'set'"
                        [class.shadow-sm]="stockMode() === 'set'"
                        [class.text-blue-600]="stockMode() === 'set'"
                        [class.text-gray-500]="stockMode() !== 'set'"
                    >
                        <span>Gán</span>
                    </button>
                </div>

                <!-- Input -->
                <div class="mb-6 relative group">
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                        {{ stockMode() === 'set' ? 'Tổng số lượng' : 'Số lượng ' + (stockMode() === 'add' ? 'thêm' : 'bớt') }}
                    </label>
                    <div class="relative">
                        <input 
                            type="number" 
                            [ngModel]="stockValue()" 
                            (ngModelChange)="stockValue.set($event)"
                            (keydown.enter)="applyStockUpdate()"
                            onfocus="this.select()"
                            class="w-full p-4 pl-5 pr-12 text-lg font-bold border-2 rounded-xl outline-none transition-all bg-white" 
                            [class.border-indigo-100]="stockValue() >= 0"
                            [class.focus:border-indigo-500]="stockValue() >= 0"
                            [class.focus:ring-4]="stockValue() >= 0"
                            [class.focus:ring-indigo-50]="stockValue() >= 0"
                            [class.border-red-300]="stockValue() < 0" 
                            [class.focus:border-red-500]="stockValue() < 0"
                            [class.focus:ring-red-50]="stockValue() < 0"
                            min="0"
                            autofocus
                            placeholder="0"
                        >
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                            CÁI
                        </div>
                    </div>
                    
                    @if (stockValue() < 0) {
                        <div class="flex items-center gap-1 mt-2 text-xs text-red-500 font-bold animate-pulse">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                             Giá trị phải là số dương
                        </div>
                    }

                    @if (isStockInsufficient()) {
                        <div class="flex items-center gap-1 mt-2 text-xs text-orange-500 font-bold">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                             Cảnh báo: Trừ nhiều hơn tồn kho hiện có
                        </div>
                    }
                </div>

                <button 
                    (click)="applyStockUpdate()" 
                    [disabled]="stockValue() < 0" 
                    class="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-xl"
                >
                    <span>Xác nhận cập nhật</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
            </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeDeleteModal()"></div>
        <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Xóa sản phẩm?</h3>
            <p class="text-sm text-gray-500 mb-6">Bạn có chắc chắn muốn xóa <span class="font-bold text-gray-800">{{currentProduct()?.code}}</span>? Hành động này không thể hoàn tác.</p>
            
            <div class="flex gap-3 justify-center">
                <button (click)="closeDeleteModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
                <button (click)="executeDelete()" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm">Xóa</button>
            </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
  `]
})
export class AdminDashboardComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  searchTerm = signal('');
  products = this.dataService.products;

  // Modals State
  showModal = signal(false);
  showDeleteModal = signal(false);
  showStockModal = signal(false);
  
  currentProduct = signal<Product | null>(null);
  
  // Stock Management State
  currentStockProduct = signal<Product | null>(null);
  stockMode = signal<'add' | 'subtract' | 'set'>('add');
  stockValue = signal<number>(0);

  // New Filters
  filterStatus = signal<'all' | 'active' | 'hidden'>('all');
  filterStock = signal<'all' | 'low'>('all');

  // Bulk Selection State
  selectedCodes = signal<Set<string>>(new Set());

  // Form
  productForm: FormGroup = this.fb.group({
    baseCode: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    fabric: [''],
    image: [''],
    status: ['Hiện', Validators.required],
    variants: this.fb.array([])
  });

  get variants() {
      return this.productForm.get('variants') as FormArray;
  }

  // KPI Computeds
  totalSkus = computed(() => this.products().length);
  totalValue = computed(() => this.products().reduce((acc, p) => acc + (p.price * p.stock), 0));
  lowStockCount = computed(() => this.products().filter(p => p.stock < 10).length);

  // Filter logic
  filteredInventory = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();
    const stock = this.filterStock();

    return this.products().filter(p => {
        const matchesTerm = p.name.toLowerCase().includes(term) || 
                            p.code.toLowerCase().includes(term) ||
                            p.color.toLowerCase().includes(term);
        
        const matchesStatus = status === 'all' 
             ? true 
             : (status === 'active' ? p.status === 'Hiện' : p.status === 'Ẩn');

        const matchesStock = stock === 'all' 
             ? true 
             : p.stock < 10;

        return matchesTerm && matchesStatus && matchesStock;
    });
  });

  // Selection Computeds
  selectionCount = computed(() => this.selectedCodes().size);
  
  isAllSelected = computed(() => {
    const filtered = this.filteredInventory();
    if (filtered.length === 0) return false;
    const selected = this.selectedCodes();
    return filtered.every(p => selected.has(p.code));
  });

  isIndeterminate = computed(() => {
    const filtered = this.filteredInventory();
    if (filtered.length === 0) return false;
    const selected = this.selectedCodes();
    const count = filtered.filter(p => selected.has(p.code)).length;
    return count > 0 && count < filtered.length;
  });

  // Computed for Stock Preview
  previewNewStock = computed(() => {
      const p = this.currentStockProduct();
      if (!p) return 0;
      const current = p.stock;
      const val = this.stockValue() || 0;
      const mode = this.stockMode();

      if (mode === 'add') return current + val;
      if (mode === 'subtract') return Math.max(0, current - val);
      return Math.max(0, val);
  });
  
  // New computed for checking negative impact
  isStockInsufficient = computed(() => {
      if (this.stockMode() !== 'subtract') return false;
      const p = this.currentStockProduct();
      if (!p) return false;
      return (p.stock - (this.stockValue() || 0)) < 0;
  });

  // Bulk Logic
  toggleSelectAll() {
      const filtered = this.filteredInventory();
      const currentSet = new Set(this.selectedCodes());
      
      if (this.isAllSelected()) {
          // Deselect all currently filtered items
          filtered.forEach(p => currentSet.delete(p.code));
      } else {
          // Select all currently filtered items
          filtered.forEach(p => currentSet.add(p.code));
      }
      this.selectedCodes.set(currentSet);
  }

  toggleSelection(code: string) {
      const s = new Set(this.selectedCodes());
      if (s.has(code)) s.delete(code);
      else s.add(code);
      this.selectedCodes.set(s);
  }

  clearSelection() {
      this.selectedCodes.set(new Set());
  }

  applyBulkStatus(status: 'Hiện' | 'Ẩn') {
      const codes = this.selectedCodes();
      codes.forEach(c => this.dataService.setProductStatus(c, status));
      this.clearSelection();
  }

  toggleStatus(code: string) {
    this.dataService.toggleProductStatus(code);
  }
  
  resetFilters() {
      this.searchTerm.set('');
      this.filterStatus.set('all');
      this.filterStock.set('all');
  }

  // --- CRUD Modal Logic ---
  
  createVariantGroup(p?: Partial<Product>) {
      return this.fb.group({
          code: [p?.code || '', Validators.required],
          color: [p?.color || '', Validators.required],
          size: [p?.size || '', Validators.required],
          price: [p?.price || 0, [Validators.required, Validators.min(0)]],
          stock: [p?.stock || 0, [Validators.required, Validators.min(0)]]
      });
  }

  addVariant() {
      this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number) {
      this.variants.removeAt(index);
  }

  openAddModal() {
    this.currentProduct.set(null);
    this.productForm.reset({
        status: 'Hiện',
        image: 'https://picsum.photos/400/500'
    });
    this.variants.clear();
    this.addVariant(); // Add one default variant
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.currentProduct.set(product);
    
    // Find all variants for this product
    const baseCode = product.baseCode || product.code;
    const allVariants = this.dataService.products().filter(p => (p.baseCode || p.code) === baseCode);
    
    // Use the selected product or the first one as source of truth for Base Details
    const baseData = allVariants.length > 0 ? allVariants[0] : product;

    this.productForm.patchValue({
        baseCode: baseData.baseCode || baseData.code,
        name: baseData.name,
        description: baseData.description,
        fabric: baseData.fabric,
        image: baseData.image,
        status: baseData.status
    });

    this.variants.clear();
    allVariants.forEach(v => {
        this.variants.push(this.createVariantGroup(v));
    });

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentProduct.set(null);
  }

  saveProduct() {
    if (this.productForm.valid) {
        const base = this.productForm.value;
        const variantsData = base.variants;
        
        const newProducts: Product[] = variantsData.map((v: any) => ({
            code: v.code,
            baseCode: base.baseCode, // Link them all to base
            name: base.name,
            description: base.description,
            fabric: base.fabric,
            image: base.image,
            status: base.status,
            moreImages: [], // Simplified for this demo
            
            // Variant specific
            color: v.color,
            size: v.size,
            price: v.price,
            stock: v.stock
        }));

        if (this.currentProduct()) {
            // Update mode: Replace all variants for this baseCode
            this.dataService.replaceVariants(base.baseCode, newProducts);
        } else {
            // Add mode
            this.dataService.addProducts(newProducts);
        }
        this.closeModal();
    }
  }

  // --- Delete Logic ---
  confirmDelete(product: Product) {
    this.currentProduct.set(product);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.currentProduct.set(null);
  }

  executeDelete() {
    const p = this.currentProduct();
    if (p) {
        this.dataService.deleteProduct(p.code);
        this.closeDeleteModal();
    }
  }

  // --- Stock Management Logic ---
  openStockModal(product: Product) {
      this.currentStockProduct.set(product);
      this.stockMode.set('add');
      this.stockValue.set(0); // Reset input
      this.showStockModal.set(true);
  }

  closeStockModal() {
      this.showStockModal.set(false);
      this.currentStockProduct.set(null);
  }

  applyStockUpdate() {
      // Client-side validation: Ensure non-negative input
      if (this.stockValue() < 0) return;

      const product = this.currentStockProduct();
      if (product) {
          const newStock = this.previewNewStock();
          this.dataService.updateProductStock(product.code, newStock);
          this.closeStockModal();
      }
  }
}
