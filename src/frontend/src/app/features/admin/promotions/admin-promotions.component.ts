import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <a routerLink="/admin" class="text-champagne-500 text-xs font-medium hover:text-champagne-700 transition-colors">&larr; Dashboard</a>
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2 mt-4">Administration</p>
          <div class="flex justify-between items-end">
            <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Promotions</h1>
            <button (click)="showForm.set(true)" class="px-6 py-3 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors">
              + New Promo Code
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (showForm()) {
          <div class="bg-white rounded-2xl p-7 border border-champagne-100 mb-8">
            <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-5">{{ editingId ? 'Edit' : 'New' }} Promotion</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Code</label>
                <input type="text" [(ngModel)]="form.code" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" placeholder="SAVE20" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Description</label>
                <input type="text" [(ngModel)]="form.description" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" placeholder="20% off on orders above ₹10,000" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Discount Type</label>
                <select [(ngModel)]="form.discountType" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
                  <option value="Percentage">Percentage</option>
                  <option value="Flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Discount Value</label>
                <input type="number" [(ngModel)]="form.discountValue" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Min Order Amount</label>
                <input type="number" [(ngModel)]="form.minOrderAmount" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Max Usage</label>
                <input type="number" [(ngModel)]="form.maxUsageCount" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Valid From</label>
                <input type="date" [(ngModel)]="form.validFrom" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Valid To</label>
                <input type="date" [(ngModel)]="form.validTo" class="w-full px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2 text-sm text-champagne-700">
                  <input type="checkbox" [(ngModel)]="form.isActive" class="accent-champagne-600 rounded" />
                  Active
                </label>
              </div>
            </div>
            <div class="mt-5 flex gap-3">
              <button (click)="savePromotion()" class="px-6 py-2.5 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors">
                {{ editingId ? 'Update' : 'Create' }}
              </button>
              <button (click)="cancelForm()" class="px-6 py-2.5 border border-champagne-200 rounded-full text-sm font-medium text-champagne-700 hover:bg-champagne-50 transition-colors">Cancel</button>
            </div>
          </div>
        }

        <div class="bg-white rounded-2xl border border-champagne-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-champagne-50">
              <tr>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Code</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Description</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Discount</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Usage</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Valid</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Status</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (promo of promotions(); track promo.id) {
                <tr class="border-t border-champagne-100 hover:bg-champagne-50/50 transition-colors">
                  <td class="px-5 py-3.5 font-mono text-sm font-semibold text-champagne-900">{{ promo.code }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">{{ promo.description }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">
                    {{ promo.discountType === 'Percentage' ? promo.discountValue + '%' : '₹' + promo.discountValue }}
                  </td>
                  <td class="px-5 py-3.5 text-sm text-champagne-600">{{ promo.currentUsageCount }}/{{ promo.maxUsageCount }}</td>
                  <td class="px-5 py-3.5 text-xs text-champagne-600">{{ promo.validFrom | date:'shortDate' }} – {{ promo.validTo | date:'shortDate' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                      [class.bg-green-50]="promo.isActive"
                      [class.text-green-700]="promo.isActive"
                      [class.bg-champagne-100]="!promo.isActive"
                      [class.text-champagne-500]="!promo.isActive">
                      {{ promo.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 space-x-3">
                    <button (click)="editPromotion(promo)" class="text-champagne-600 text-xs font-medium hover:text-champagne-800 transition-colors">Edit</button>
                    <button (click)="deletePromotion(promo.id)" class="text-red-500 text-xs font-medium hover:text-red-700 transition-colors">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminPromotionsComponent implements OnInit {
  promotions = signal<any[]>([]);
  showForm = signal(false);
  editingId: string | null = null;

  form = {
    code: '',
    description: '',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxUsageCount: 100,
    validFrom: '',
    validTo: '',
    isActive: true
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.adminService.getPromotions().subscribe(promos => this.promotions.set(promos));
  }

  savePromotion() {
    const payload = { ...this.form };
    if (this.editingId) {
      this.adminService.updatePromotion(this.editingId, payload).subscribe(() => {
        this.loadPromotions();
        this.cancelForm();
      });
    } else {
      this.adminService.createPromotion(payload).subscribe(() => {
        this.loadPromotions();
        this.cancelForm();
      });
    }
  }

  editPromotion(promo: any) {
    this.editingId = promo.id;
    this.form = {
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || 0,
      maxUsageCount: promo.maxUsageCount,
      validFrom: promo.validFrom?.split('T')[0] || '',
      validTo: promo.validTo?.split('T')[0] || '',
      isActive: promo.isActive
    };
    this.showForm.set(true);
  }

  deletePromotion(id: string) {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.adminService.deletePromotion(id).subscribe(() => this.loadPromotions());
    }
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId = null;
    this.form = { code: '', description: '', discountType: 'Percentage', discountValue: 10, minOrderAmount: 0, maxUsageCount: 100, validFrom: '', validTo: '', isActive: true };
  }
}
