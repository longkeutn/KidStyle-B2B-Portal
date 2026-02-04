
import { Injectable, signal, computed, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

export interface Product {
  code: string;
  baseCode?: string; // Grouping identifier for variants
  name: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image: string;
  status: 'Hiện' | 'Ẩn';
  // New rich details
  description: string;
  fabric: string;
  moreImages: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderInfo {
  dealerName: string;
  phone: string;
}

export interface Dealer {
  id: string;
  name: string;
  phone: string;
  password: string; // In real app, this should be hashed/handled securely
  address: string;
  isAdmin?: boolean; // New flag for admin
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Mock Database - Simulating Google Sheet 'SanPham'
  private mockProducts: Product[] = [
    { 
      code: 'KID001',
      baseCode: 'KID001', 
      name: 'Summer Floral Dress', 
      color: 'Pink', 
      size: '110', 
      price: 150000, 
      stock: 50, 
      image: 'https://picsum.photos/400/500?random=1', 
      status: 'Hiện',
      description: 'A beautiful A-line dress featuring a vibrant floral print perfect for summer days. Designed with a comfortable fit and breathable fabric to keep your little one cool.',
      fabric: '100% Premium Cotton',
      moreImages: ['https://picsum.photos/400/500?random=101', 'https://picsum.photos/400/500?random=102']
    },
    // Variant: Size 120 (More expensive)
    { 
      code: 'KID001-120',
      baseCode: 'KID001', 
      name: 'Summer Floral Dress', 
      color: 'Pink', 
      size: '120', 
      price: 165000, 
      stock: 25, 
      image: 'https://picsum.photos/400/500?random=1', 
      status: 'Hiện',
      description: 'A beautiful A-line dress featuring a vibrant floral print perfect for summer days.',
      fabric: '100% Premium Cotton',
      moreImages: ['https://picsum.photos/400/500?random=101']
    },
    // Variant: Size 130 (More expensive)
    { 
      code: 'KID001-130',
      baseCode: 'KID001', 
      name: 'Summer Floral Dress', 
      color: 'Pink', 
      size: '130', 
      price: 175000, 
      stock: 10, 
      image: 'https://picsum.photos/400/500?random=1', 
      status: 'Hiện',
      description: 'A beautiful A-line dress featuring a vibrant floral print perfect for summer days.',
      fabric: '100% Premium Cotton',
      moreImages: ['https://picsum.photos/400/500?random=101']
    },
    { 
      code: 'KID002', 
      baseCode: 'KID002',
      name: 'Denim Overalls', 
      color: 'Blue', 
      size: '120', 
      price: 180000, 
      stock: 30, 
      image: 'https://picsum.photos/400/500?random=2', 
      status: 'Hiện',
      description: 'Classic denim overalls with adjustable straps and multiple pockets. Durable construction suitable for active play.',
      fabric: 'Denim (95% Cotton, 5% Spandex)',
      moreImages: ['https://picsum.photos/400/500?random=201']
    },
    { 
      code: 'KID003',
      baseCode: 'KID003', 
      name: 'Cartoon T-Shirt', 
      color: 'White', 
      size: '100', 
      price: 90000, 
      stock: 100, 
      image: 'https://picsum.photos/400/500?random=3', 
      status: 'Hiện',
      description: 'Fun and colorful t-shirt featuring popular cartoon characters. Soft touch fabric that is gentle on skin.',
      fabric: '100% Cotton Jersey',
      moreImages: ['https://picsum.photos/400/500?random=301', 'https://picsum.photos/400/500?random=302']
    },
    { 
      code: 'KID004',
      baseCode: 'KID004', 
      name: 'Sporty Shorts', 
      color: 'Black', 
      size: '130', 
      price: 110000, 
      stock: 0, 
      image: 'https://picsum.photos/400/500?random=4', 
      status: 'Hiện',
      description: 'Athletic shorts with an elastic waistband and drawstring. Great for sports and casual wear.',
      fabric: 'Polyester Blend',
      moreImages: []
    },
    { 
      code: 'KID005', 
      baseCode: 'KID005',
      name: 'Princess Tutu', 
      color: 'Purple', 
      size: '110', 
      price: 220000, 
      stock: 15, 
      image: 'https://picsum.photos/400/500?random=5', 
      status: 'Hiện',
      description: 'Magical tutu skirt with layers of soft tulle and a sparkly waistband. Perfect for parties and dressing up.',
      fabric: 'Tulle & Satin',
      moreImages: ['https://picsum.photos/400/500?random=501']
    },
    { 
      code: 'KID006',
      baseCode: 'KID006', 
      name: 'Dino Hoodie', 
      color: 'Green', 
      size: '140', 
      price: 195000, 
      stock: 25, 
      image: 'https://picsum.photos/400/500?random=6', 
      status: 'Hiện',
      description: 'Cozy hoodie with 3D dinosaur spikes on the hood and back. Warm fleece lining for colder days.',
      fabric: 'Cotton Fleece',
      moreImages: ['https://picsum.photos/400/500?random=601', 'https://picsum.photos/400/500?random=602']
    },
    { 
      code: 'KID007',
      baseCode: 'KID007', 
      name: 'Hidden Item', 
      color: 'Red', 
      size: '100', 
      price: 50000, 
      stock: 10, 
      image: 'https://picsum.photos/400/500?random=7', 
      status: 'Ẩn',
      description: 'This item should not be visible.',
      fabric: 'N/A',
      moreImages: []
    },
    { 
      code: 'KID008',
      baseCode: 'KID008', 
      name: 'Striped Polo', 
      color: 'Navy', 
      size: '120', 
      price: 130000, 
      stock: 40, 
      image: 'https://picsum.photos/400/500?random=8', 
      status: 'Hiện',
      description: 'Smart casual polo shirt with nautical stripes. Collared neck with button placket.',
      fabric: '100% Piqué Cotton',
      moreImages: []
    },
    // Adding a variant for demo purposes (Same name as KID001 but different color)
    { 
        code: 'KID001-B',
        baseCode: 'KID001', 
        name: 'Summer Floral Dress', 
        color: 'Yellow', 
        size: '110', 
        price: 150000, 
        stock: 20, 
        image: 'https://picsum.photos/400/500?random=99', 
        status: 'Hiện',
        description: 'A beautiful A-line dress featuring a vibrant floral print perfect for summer days.',
        fabric: '100% Premium Cotton',
        moreImages: []
      },
  ];

  // Mock Dealers
  private mockDealers: Dealer[] = [
    { id: '1', name: 'Shop Baby Cute', phone: '0909123456', password: '123', address: '123 Le Loi, HCM' },
    { id: '2', name: 'Kho Si Me Be', phone: '0988777666', password: '123', address: '456 Nguyen Hue, HN' },
    // Mock Admin Account
    { id: '99', name: 'Admin Manager', phone: 'admin', password: 'admin', address: 'Headquarters', isAdmin: true },
  ];

  // State
  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);
  searchQuery = signal<string>('');
  selectedProduct = signal<Product | null>(null);
  currentUser = signal<Dealer | null>(null);

  // New Filters
  filterStock = signal<'in_stock' | 'all'>('in_stock');
  filterStatus = signal<'active' | 'all'>('active');
  
  // Computed
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const fStock = this.filterStock();
    const fStatus = this.filterStatus();

    return this.products().filter(p => {
      // Filter by Status ('active' means only 'Hiện', 'all' means everything)
      const matchesStatus = fStatus === 'all' || p.status === 'Hiện';
      
      // Filter by Stock ('in_stock' means > 0, 'all' means everything)
      const matchesStock = fStock === 'all' || p.stock > 0;
      
      // Filter by Search Query
      const matchesQuery = p.code.toLowerCase().includes(query) || 
                           p.color.toLowerCase().includes(query) || 
                           p.name.toLowerCase().includes(query);

      return matchesStatus && matchesStock && matchesQuery;
    });
  });

  cartTotal = computed(() => {
    return this.cart().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  cartCount = computed(() => {
    return this.cart().reduce((count, item) => count + item.quantity, 0);
  });

  constructor() {
    // Simulate fetching from Sheets
    this.products.set(this.mockProducts);
    
    // Check local storage for persistent login (simplified)
    const storedUser = localStorage.getItem('kidstyle_user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('kidstyle_user');
      }
    }
  }

  login(phone: string, pass: string): boolean {
    const dealer = this.mockDealers.find(d => d.phone === phone && d.password === pass);
    if (dealer) {
      this.currentUser.set(dealer);
      localStorage.setItem('kidstyle_user', JSON.stringify(dealer));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.cart.set([]); // Clear cart on logout
    localStorage.removeItem('kidstyle_user');
  }

  addToCart(product: Product, quantity: number = 1) {
    this.cart.update(currentCart => {
      const existing = currentCart.find(item => item.code === product.code);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity <= existing.stock) {
          return currentCart.map(item => 
            item.code === product.code ? { ...item, quantity: newQuantity } : item
          );
        }
        // Cap at max stock
        return currentCart.map(item => 
            item.code === product.code ? { ...item, quantity: existing.stock } : item
        );
      }
      
      // If adding new item but quantity > stock
      const qtyToAdd = Math.min(quantity, product.stock);
      if (qtyToAdd <= 0) return currentCart;

      return [...currentCart, { ...product, quantity: qtyToAdd }];
    });
  }

  removeFromCart(code: string) {
    this.cart.update(current => current.filter(item => item.code !== code));
  }

  updateQuantity(code: string, delta: number) {
    this.cart.update(current => {
      return current.map(item => {
        if (item.code === code) {
          const newQty = item.quantity + delta;
          if (newQty > 0 && newQty <= item.stock) {
            return { ...item, quantity: newQty };
          }
        }
        return item;
      });
    });
  }

  clearCart() {
    this.cart.set([]);
  }

  openProductDetail(product: Product) {
    this.selectedProduct.set(product);
  }

  closeProductDetail() {
    this.selectedProduct.set(null);
  }

  // Admin Methods
  addProduct(product: Product) {
    this.products.update(current => [product, ...current]);
  }
  
  // Bulk add for variants
  addProducts(products: Product[]) {
      this.products.update(current => [...products, ...current]);
  }

  updateProduct(updatedProduct: Product) {
    this.products.update(current => 
      current.map(p => p.code === updatedProduct.code ? updatedProduct : p)
    );
  }

  // Update multiple products (for variant editing)
  updateProducts(updatedProducts: Product[]) {
      this.products.update(current => {
          // Remove old versions of these products
          const codesToUpdate = new Set(updatedProducts.map(p => p.code));
          const filtered = current.filter(p => !codesToUpdate.has(p.code));
          return [...updatedProducts, ...filtered];
      });
  }
  
  // Replace all variants of a baseCode with new list
  replaceVariants(baseCode: string, newVariants: Product[]) {
      this.products.update(current => {
          // Remove all products with this baseCode
          const filtered = current.filter(p => (p.baseCode || p.code) !== baseCode);
          return [...newVariants, ...filtered];
      });
  }

  deleteProduct(code: string) {
    this.products.update(current => current.filter(p => p.code !== code));
  }

  // Helper for quick stock updates
  updateProductStock(code: string, newStock: number) {
    this.products.update(current => 
      current.map(p => p.code === code ? { ...p, stock: newStock } : p)
    );
  }

  // Helper for quick status toggle
  toggleProductStatus(code: string) {
    this.products.update(current => 
      current.map(p => {
        if (p.code === code) {
          return { ...p, status: p.status === 'Hiện' ? 'Ẩn' : 'Hiện' };
        }
        return p;
      })
    );
  }

  // Helper for setting specific status (Bulk Update)
  setProductStatus(code: string, status: 'Hiện' | 'Ẩn') {
    this.products.update(current => 
      current.map(p => p.code === code ? { ...p, status } : p)
    );
  }

  async generateOrderSummary(orderInfo: OrderInfo): Promise<string> {
    const apiKey = process.env['API_KEY'];
    if (!apiKey) return "API Key not found. Cannot generate AI summary.";

    const ai = new GoogleGenAI({ apiKey });
    
    // Create a simple text representation of the cart
    const cartDetails = this.cart().map(item => 
      `- ${item.name} (${item.code}): ${item.quantity} x ${item.price.toLocaleString('vi-VN')} VND`
    ).join('\n');

    const prompt = `
      Bạn là trợ lý AI cho công ty bán buôn thời trang trẻ em "KidStyle".
      Hãy tạo nội dung email xác nhận đơn hàng chuyên nghiệp bằng tiếng Việt.
      
      Thông tin khách hàng:
      - Tên: ${orderInfo.dealerName}
      - SĐT: ${orderInfo.phone}
      
      Chi tiết đơn hàng:
      ${cartDetails}
      
      Tổng cộng: ${this.cartTotal().toLocaleString('vi-VN')} VND
      
      Yêu cầu:
      - Sử dụng CSS inline để định dạng giống hóa đơn (đẹp, rõ ràng).
      - Giọng văn thân thiện, chuyên nghiệp.
      - KHÔNG dùng markdown code block, chỉ trả về chuỗi HTML thô (raw HTML string) để có thể hiển thị bằng innerHTML.
      - Thêm lời cảm ơn ở cuối.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (e) {
      console.error(e);
      return "<p>Lỗi tạo tóm tắt AI. Vui lòng kiểm tra console.</p>";
    }
  }
}
