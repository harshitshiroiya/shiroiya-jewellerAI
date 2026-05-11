import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Promotions</h1>
          <button (click)="showForm.set(true)" class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            + New Promo Code
          </button>
        </div>

        @if (showForm()) {
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 class="text-xl font-bold mb-4">{{ editingId ? 'Edit' : 'Create' }} Promotion</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" [(ngModel)]="form.code" class="w-full px-4 py-2 border rounded-lg" placeholder="SAVE20" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" [(ngModel)]="form.description" class="w-full px-4 py-2 border rounded-lg" placeholder="20% off on orders above ₹10,000" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select [(ngModel)]="form.discountType" class="w-full px-4 py-2 border rounded-lg">
                  <option value="Percentage">Percentage</option>
                  <option value="Flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" [(ngModel)]="form.discountValue" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                <input type="number" [(ngModel)]="form.minOrderAmount" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Usage</label>
                <input type="number" [(ngModel)]="form.maxUsageCount" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input type="date" [(ngModel)]="form.validFrom" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                <input type="date" [(ngModel)]="form.validTo" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="form.isActive" class="rounded" />
                  <span class="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            <div class="mt-4 flex gap-3">
              <button (click)="savePromotion()" class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                {{ editingId ? 'Update' : 'Create' }}
              </button>
              <button (click)="cancelForm()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        }

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Discount</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Usage</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Valid</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (promo of promotions(); track promo.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono font-bold">{{ promo.code }}</td>
                  <td class="px-4 py-3 text-sm">{{ promo.description }}</td>
                  <td class="px-4 py-3 text-sm">
                    {{ promo.discountType === 'Percentage' ? promo.discountValue + '%' : '₹' + promo.discountValue }}
                  </td>
                  <td class="px-4 py-3 text-sm">{{ promo.currentUsageCount }}/{{ promo.maxUsageCount }}</td>
                  <td class="px-4 py-3 text-sm">{{ promo.validFrom | date:'shortDate' }} - {{ promo.validTo | date:'shortDate' }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded text-xs"
                      [class.bg-green-100]="promo.isActive"
                      [class.text-green-700]="promo.isActive"
                      [class.bg-gray-100]="!promo.isActive"
                      [class.text-gray-700]="!promo.isActive">
                      {{ promo.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 space-x-2">
                    <button (click)="editPromotion(promo)" class="text-blue-600 text-sm hover:underline">Edit</button>
                    <button (click)="deletePromotion(promo.id)" class="text-red-600 text-sm hover:underline">Delete</button>
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
