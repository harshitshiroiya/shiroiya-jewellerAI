import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CustomDesignService } from '../../core/services/custom-design.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-4rem)] flex bg-champagne-900">
      <div class="flex-1 relative">
        <canvas #threeCanvas class="w-full h-full"></canvas>
        <div class="absolute top-4 left-4 bg-champagne-900/80 backdrop-blur-sm text-champagne-300 px-3 py-1.5 rounded text-xs tracking-wide">
          Drag to rotate &middot; Scroll to zoom
        </div>
      </div>

      <aside class="w-72 bg-white border-l border-champagne-100 overflow-y-auto p-5 space-y-5">
        <div>
          <p class="text-champagne-700 text-[10px] font-semibold tracking-[0.2em] uppercase">Bespoke</p>
          <h2 class="text-base font-bold text-champagne-900 tracking-tight mt-0.5">Design Studio</h2>
        </div>

        <div>
          <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-2">Type</label>
          <div class="grid grid-cols-3 gap-1.5">
            @for (type of jewelleryTypes; track type.value) {
              <button (click)="setBaseType(type.value)"
                [class]="config.baseType === type.value
                  ? 'border-champagne-600 bg-champagne-50/50 text-champagne-800'
                  : 'border-champagne-200 text-champagne-600 hover:border-champagne-300'"
                class="p-2 border rounded text-center text-[11px] font-medium transition-all duration-200">
                <div class="text-base">{{ type.icon }}</div>
                <div class="mt-0.5">{{ type.label }}</div>
              </button>
            }
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Metal</label>
          <select [(ngModel)]="config.metal" (ngModelChange)="updateMaterial()"
            class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
            <option value="Gold">Gold (22K)</option>
            <option value="Gold18K">Gold (18K)</option>
            <option value="Silver">Silver (925)</option>
            <option value="Platinum">Platinum</option>
            <option value="RoseGold">Rose Gold</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Purity</label>
          <select [(ngModel)]="config.purity"
            class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
            <option value="22K">22K</option>
            <option value="18K">18K</option>
            <option value="14K">14K</option>
            <option value="925">925 Sterling</option>
            <option value="950">950 Platinum</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Stone</label>
          <select [(ngModel)]="config.stoneType" (ngModelChange)="updateStone()"
            class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
            <option value="None">No Stone</option>
            <option value="Diamond">Diamond</option>
            <option value="Ruby">Ruby</option>
            <option value="Emerald">Emerald</option>
            <option value="Sapphire">Sapphire</option>
            <option value="Pearl">Pearl</option>
          </select>
        </div>

        @if (config.stoneType !== 'None') {
          <div>
            <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Shape</label>
            <select [(ngModel)]="config.stoneShape" (ngModelChange)="updateStone()"
              class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
              <option value="Round">Round Brilliant</option>
              <option value="Princess">Princess</option>
              <option value="Oval">Oval</option>
              <option value="Cushion">Cushion</option>
              <option value="Marquise">Marquise</option>
              <option value="Pear">Pear</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Carat: {{ config.carat }}</label>
            <input type="range" [(ngModel)]="config.carat" min="0.25" max="5" step="0.25" (ngModelChange)="updateStone()"
              class="w-full accent-champagne-600" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Color</label>
            <select [(ngModel)]="config.color"
              class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
              <option value="D">D (Colorless)</option>
              <option value="E">E (Colorless)</option>
              <option value="F">F (Colorless)</option>
              <option value="G">G (Near Colorless)</option>
              <option value="H">H (Near Colorless)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-champagne-500 uppercase tracking-wide mb-1.5">Clarity</label>
            <select [(ngModel)]="config.clarity"
              class="w-full px-3 py-2 bg-champagne-50 border border-champagne-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-600">
              <option value="FL">FL (Flawless)</option>
              <option value="IF">IF (Internally Flawless)</option>
              <option value="VVS1">VVS1</option>
              <option value="VVS2">VVS2</option>
              <option value="VS1">VS1</option>
              <option value="VS2">VS2</option>
            </select>
          </div>
        }

        <div class="bg-champagne-50 border border-champagne-100 p-4 rounded-lg">
          <p class="text-[11px] font-semibold text-champagne-400 uppercase tracking-wide">Estimated Price</p>
          <p class="text-xl font-bold text-champagne-900 mt-1">&#8377;{{ estimatedPrice() | number:'1.0-0' }}</p>
        </div>

        <div class="space-y-2 pt-2">
          <button (click)="saveAndAddToCart()" [disabled]="saving()"
            class="w-full py-2.5 bg-champagne-900 text-white rounded text-sm font-semibold hover:bg-champagne-800 transition-colors disabled:opacity-40">
            {{ saving() ? 'Saving...' : 'Save & Add to Cart' }}
          </button>
          <button (click)="saveDesign()" [disabled]="saving()"
            class="w-full py-2.5 border border-champagne-200 text-champagne-700 rounded text-sm font-semibold hover:bg-champagne-50 transition-colors">
            Save Draft
          </button>
          <button (click)="capturePreview()"
            class="w-full py-2.5 text-xs font-medium text-champagne-400 hover:text-champagne-600 transition-colors">
            Download Preview
          </button>
        </div>
      </aside>
    </div>
  `
})
export class ConfiguratorComponent implements OnInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private metalMesh!: THREE.Mesh;
  private animationId = 0;

  saving = signal(false);
  estimatedPrice = signal(25000);

  config = {
    baseType: 'Ring',
    metal: 'Gold',
    purity: '22K',
    stoneType: 'Diamond',
    stoneShape: 'Round',
    carat: 1.0,
    color: 'G',
    clarity: 'VS1'
  };

  jewelleryTypes = [
    { value: 'Ring', label: 'Ring', icon: '💍' },
    { value: 'Earring', label: 'Earring', icon: '✨' },
    { value: 'Necklace', label: 'Necklace', icon: '📿' },
    { value: 'Bracelet', label: 'Bracelet', icon: '⌚' },
    { value: 'Pendant', label: 'Pendant', icon: '💎' },
    { value: 'Bangle', label: 'Bangle', icon: '⭕' }
  ];

  constructor(
    private designService: CustomDesignService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initScene();
    this.createJewellery();
    this.animate();
    this.calculatePrice();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
  }

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a1f14);

    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.8;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-3, 3, -3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, -2, -5);
    this.scene.add(rimLight);

    window.addEventListener('resize', () => this.onResize());
  }

  private createJewellery() {
    const ringGeometry = new THREE.TorusGeometry(1, 0.15, 32, 100);
    const material = this.getMetalMaterial();
    this.metalMesh = new THREE.Mesh(ringGeometry, material);
    this.scene.add(this.metalMesh);

    if (this.config.stoneType !== 'None') {
      this.addStone();
    }
  }

  private getMetalMaterial(): THREE.MeshStandardMaterial {
    const colors: Record<string, number> = {
      Gold: 0xffd700,
      Gold18K: 0xffc125,
      Silver: 0xc0c0c0,
      Platinum: 0xe5e4e2,
      RoseGold: 0xb76e79
    };

    return new THREE.MeshStandardMaterial({
      color: colors[this.config.metal] || 0xffd700,
      metalness: 1.0,
      roughness: 0.15
    });
  }

  private addStone() {
    const stoneColors: Record<string, number> = {
      Diamond: 0xffffff,
      Ruby: 0xe31b23,
      Emerald: 0x009b77,
      Sapphire: 0x0f52ba,
      Pearl: 0xfdeef4
    };

    const stoneGeometry = new THREE.OctahedronGeometry(0.3, 2);
    const stoneMaterial = new THREE.MeshPhysicalMaterial({
      color: stoneColors[this.config.stoneType] || 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: this.config.stoneType === 'Pearl' ? 0 : 0.9,
      ior: this.config.stoneType === 'Diamond' ? 2.42 : 1.77,
      thickness: 0.5
    });

    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.position.set(0, 1.15, 0);
    stone.scale.setScalar(this.config.carat * 0.8);
    stone.name = 'stone';
    this.scene.add(stone);
  }

  setBaseType(type: string) {
    this.config.baseType = type;
    this.rebuildScene();
    this.calculatePrice();
  }

  updateMaterial() {
    if (this.metalMesh) {
      (this.metalMesh.material as THREE.MeshStandardMaterial).dispose();
      this.metalMesh.material = this.getMetalMaterial();
    }
    this.calculatePrice();
  }

  updateStone() {
    const existing = this.scene.getObjectByName('stone');
    if (existing) this.scene.remove(existing);
    if (this.config.stoneType !== 'None') {
      this.addStone();
    }
    this.calculatePrice();
  }

  private rebuildScene() {
    while (this.scene.children.length > 4) {
      this.scene.remove(this.scene.children[this.scene.children.length - 1]);
    }
    this.createJewellery();
  }

  private calculatePrice() {
    this.designService.calculatePrice(this.getDesignPayload()).subscribe({
      next: (res) => this.estimatedPrice.set(res.estimatedPrice),
      error: () => {
        let price = 10000;
        const metalPrices: Record<string, number> = { Gold: 15000, Gold18K: 12000, Silver: 2000, Platinum: 20000, RoseGold: 14000 };
        price += metalPrices[this.config.metal] || 0;
        if (this.config.stoneType === 'Diamond') price += this.config.carat * 80000;
        else if (this.config.stoneType !== 'None') price += this.config.carat * 30000;
        this.estimatedPrice.set(Math.round(price));
      }
    });
  }

  capturePreview() {
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'custom-design-preview.png';
    link.href = dataUrl;
    link.click();
  }

  saveDesign() {
    this.saving.set(true);
    this.designService.saveDesign(this.getDesignPayload()).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false)
    });
  }

  saveAndAddToCart() {
    this.saving.set(true);
    this.designService.saveDesign(this.getDesignPayload()).subscribe({
      next: (design) => {
        this.cartService.addCustomDesign(design.id).subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/cart']);
          },
          error: () => this.saving.set(false)
        });
      },
      error: () => this.saving.set(false)
    });
  }

  private getDesignPayload() {
    this.renderer.render(this.scene, this.camera);
    return {
      baseType: this.config.baseType,
      metalType: this.config.metal,
      purity: this.config.purity,
      stoneType: this.config.stoneType,
      stoneShape: this.config.stoneShape,
      stoneColor: this.config.color,
      stoneClarity: this.config.clarity,
      stoneCarat: this.config.carat,
      configurationJson: JSON.stringify(this.config),
      previewImageUrl: this.renderer.domElement.toDataURL('image/png')
    };
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
}
