import { Component, ElementRef, ViewChild, signal, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CustomDesignService } from '../../core/services/custom-design.service';
import { CartService } from '../../core/services/cart.service';
import { DesignTransferService } from '../../core/services/design-transfer.service';

interface GeneratedDesign {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    @keyframes ringDraw {
      0% { stroke-dashoffset: 301.6; }
      60% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes gemAppear {
      0% { transform: scale(0) rotate(-30deg); opacity: 0; }
      50% { transform: scale(0) rotate(-30deg); opacity: 0; }
      70% { transform: scale(1.2) rotate(5deg); opacity: 1; }
      85% { transform: scale(0.9) rotate(-2deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
    @keyframes statusFade {
      0% { opacity: 0; transform: translateY(4px); }
      15% { opacity: 1; transform: translateY(0); }
      85% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-4px); }
    }
    .jewel-ring-draw circle { animation: ringDraw 2.5s ease-out forwards; }
    .jewel-gem-appear { animation: gemAppear 2.5s ease-out forwards; }
    .jewel-sparkle { animation: sparkle 2s ease-in-out infinite; }
    .jewel-status-text { animation: statusFade 2.5s ease-in-out; }
  `],
  template: `
    <div class="h-[calc(100vh-4rem)] flex bg-[#0f0f0f] text-white overflow-hidden">

      <!-- Left: History & Variants Panel -->
      <aside class="w-20 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0">
        @for (d of history(); track d.id) {
          <button (click)="selectDesign(d)" [title]="d.prompt"
            [class]="selectedDesign()?.id === d.id ? 'ring-2 ring-amber-500' : 'ring-1 ring-white/10 hover:ring-white/30'"
            class="w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all">
            <img [src]="d.imageUrl" class="w-full h-full object-cover" />
          </button>
        }
        @if (history().length === 0) {
          <div class="flex-1 flex items-center justify-center">
            <p class="text-[9px] text-white/30 text-center px-1 [writing-mode:vertical-lr] rotate-180">History</p>
          </div>
        }
      </aside>

      <!-- Center: Main Canvas -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Top Bar -->
        <div class="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <h1 class="text-sm font-semibold text-white/90 tracking-tight">AI Design Studio</h1>
          <span class="text-[10px] text-white/40 border-l border-white/10 pl-3">Powered by Gemini</span>
          <span class="flex-1"></span>
          @if (selectedDesign()) {
            <button (click)="openTryOn()"
              class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
              Try On
            </button>
            <button (click)="saveToCart()"
              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded-lg transition-colors">
              Add to Cart
            </button>
            <button (click)="downloadDesign()"
              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded-lg transition-colors">
              Download
            </button>
          }
        </div>

        <!-- Canvas Area -->
        <div class="flex-1 relative flex items-center justify-center overflow-hidden">
          @if (isGenerating()) {
            <div class="flex flex-col items-center gap-6">
              <!-- Jewellery crafting animation -->
              <div class="relative w-32 h-32">
                <!-- Outer ring being forged -->
                <svg class="absolute inset-0 w-full h-full jewel-ring-draw" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="48" fill="none" stroke="url(#goldGrad)" stroke-width="3"
                    stroke-dasharray="301.6" stroke-dashoffset="301.6" stroke-linecap="round" />
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#f59e0b" />
                      <stop offset="50%" stop-color="#fbbf24" />
                      <stop offset="100%" stop-color="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
                <!-- Inner sparkle ring -->
                <svg class="absolute inset-0 w-full h-full animate-spin" style="animation-duration: 6s;" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="36" fill="none" stroke="#fbbf24" stroke-width="0.5" stroke-dasharray="4 12" opacity="0.4" />
                </svg>
                <!-- Centre diamond -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-10 h-10 jewel-gem-appear" viewBox="0 0 40 40" fill="none">
                    <polygon points="20,4 36,16 30,36 10,36 4,16" fill="url(#diamondGrad)" opacity="0.9" />
                    <polygon points="20,4 36,16 20,20 4,16" fill="url(#diamondTop)" opacity="0.7" />
                    <line x1="20" y1="4" x2="20" y2="36" stroke="white" stroke-width="0.3" opacity="0.4" />
                    <line x1="4" y1="16" x2="30" y2="36" stroke="white" stroke-width="0.3" opacity="0.3" />
                    <line x1="36" y1="16" x2="10" y2="36" stroke="white" stroke-width="0.3" opacity="0.3" />
                    <defs>
                      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef3c7" />
                        <stop offset="50%" stop-color="#fde68a" />
                        <stop offset="100%" stop-color="#f59e0b" />
                      </linearGradient>
                      <linearGradient id="diamondTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fffbeb" />
                        <stop offset="100%" stop-color="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <!-- Floating sparkles -->
                <div class="absolute top-2 right-4 w-1.5 h-1.5 bg-amber-400 rounded-full jewel-sparkle" style="animation-delay: 0s;"></div>
                <div class="absolute bottom-6 left-3 w-1 h-1 bg-yellow-300 rounded-full jewel-sparkle" style="animation-delay: 0.8s;"></div>
                <div class="absolute top-8 left-6 w-1 h-1 bg-amber-300 rounded-full jewel-sparkle" style="animation-delay: 1.6s;"></div>
                <div class="absolute bottom-3 right-6 w-1.5 h-1.5 bg-yellow-400 rounded-full jewel-sparkle" style="animation-delay: 2.4s;"></div>
              </div>

              <!-- Rotating artisan status text -->
              <div class="text-center">
                <p class="text-sm text-amber-400/90 font-medium jewel-status-text">{{ craftingStatus() }}</p>
                <div class="flex items-center justify-center gap-1 mt-2">
                  <div class="w-1 h-1 rounded-full bg-amber-500/60 animate-pulse"></div>
                  <div class="w-1 h-1 rounded-full bg-amber-500/40 animate-pulse" style="animation-delay: 0.3s;"></div>
                  <div class="w-1 h-1 rounded-full bg-amber-500/20 animate-pulse" style="animation-delay: 0.6s;"></div>
                </div>
                <p class="text-[10px] text-white/25 mt-3">Our artisan AI is at work</p>
              </div>
            </div>
          } @else if (selectedDesign()) {
            <!-- Main Design Display -->
            <div class="relative max-w-full max-h-full p-4">
              <img [src]="selectedDesign()!.imageUrl" alt="Generated Design"
                class="max-w-full max-h-[calc(100vh-12rem)] rounded-xl shadow-2xl object-contain" />

              <!-- Edit Region Overlay (when in edit mode) -->
              @if (editMode()) {
                <canvas #editCanvas
                  class="absolute inset-4 rounded-xl cursor-crosshair"
                  (mousedown)="startDraw($event)"
                  (mousemove)="drawing($event)"
                  (mouseup)="endDraw()"
                  (mouseleave)="endDraw()">
                </canvas>
                <div class="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-3">
                  <span class="text-[11px] text-white/80">Circle the region you want to edit</span>
                  <button (click)="clearMask()" class="text-[10px] text-amber-400 hover:text-amber-300">Clear</button>
                  <button (click)="editMode.set(false)" class="text-[10px] text-white/50 hover:text-white">Cancel</button>
                </div>
              }
            </div>
          } @else {
            <!-- Empty State / Welcome -->
            <div class="text-center max-w-lg px-6">
              <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>
              </div>
              <h2 class="text-xl font-semibold text-white/90 mb-2">Describe your jewellery</h2>
              <p class="text-sm text-white/40 leading-relaxed">
                Type a description below or upload a reference image. Our AI will generate photorealistic designs you can refine and iterate on.
              </p>
              <div class="mt-8 grid grid-cols-2 gap-2">
                @for (idea of starterIdeas; track idea) {
                  <button (click)="prompt = idea; generate()"
                    class="text-left px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/10 transition-all">
                    {{ idea }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Bottom Prompt Bar -->
        <div class="shrink-0 border-t border-white/5 bg-[#1a1a1a] p-3">
          <div class="max-w-3xl mx-auto">
            <div class="flex items-center gap-2 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 focus-within:border-amber-500/50 transition-colors">
              <!-- Upload button -->
              <label class="p-1.5 text-white/40 hover:text-white/70 cursor-pointer transition-colors" title="Upload reference image">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                <input type="file" accept="image/*" class="hidden" (change)="onReferenceUpload($event)" />
              </label>

              @if (referenceImage()) {
                <div class="relative w-8 h-8 rounded border border-white/20 overflow-hidden shrink-0">
                  <img [src]="referenceImage()" class="w-full h-full object-cover" />
                  <button (click)="referenceImage.set(null)" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">&times;</button>
                </div>
              }

              <input type="text" [(ngModel)]="prompt"
                [placeholder]="selectedDesign() ? 'Describe modifications...' : 'Describe your jewellery design...'"
                (keydown.enter)="selectedDesign() ? refine() : generate()"
                class="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />

              <!-- Edit Region button (only when design is selected) -->
              @if (selectedDesign() && !editMode()) {
                <button (click)="startEditMode()" title="Edit a specific region"
                  class="p-1.5 text-white/40 hover:text-white/70 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/></svg>
                </button>
              }

              <!-- Style selector -->
              <select [(ngModel)]="style"
                class="bg-transparent text-[11px] text-white/60 border-l border-white/10 pl-2 focus:outline-none cursor-pointer">
                <option value="luxury modern" class="bg-[#252525]">Luxury Modern</option>
                <option value="classic traditional Indian" class="bg-[#252525]">Traditional Indian</option>
                <option value="minimalist contemporary" class="bg-[#252525]">Minimalist</option>
                <option value="art deco vintage" class="bg-[#252525]">Art Deco</option>
                <option value="bohemian natural" class="bg-[#252525]">Bohemian</option>
                <option value="royal bridal" class="bg-[#252525]">Royal Bridal</option>
              </select>

              <!-- Generate / Refine button -->
              <button (click)="selectedDesign() ? (editMode() ? applyRegionEdit() : refine()) : generate()"
                [disabled]="isGenerating() || !prompt.trim()"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-white/10 disabled:text-white/30 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                {{ isGenerating() ? '...' : (editMode() ? 'Apply Edit' : (selectedDesign() ? 'Refine' : 'Generate')) }}
              </button>
            </div>

            <!-- Quick action chips when design is selected -->
            @if (selectedDesign() && !isGenerating()) {
              <div class="flex items-center gap-1.5 mt-2 px-1">
                <span class="text-[10px] text-white/30">Quick:</span>
                @for (action of quickActions; track action) {
                  <button (click)="prompt = action; refine()"
                    class="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors">
                    {{ action }}
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Try It On Modal -->
    @if (showTryOn()) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" (click)="closeTryOn()">
        <div class="bg-[#1a1a1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" (click)="$event.stopPropagation()">
          <div class="p-5 border-b border-white/5 flex justify-between items-center">
            <div>
              <p class="text-[10px] font-semibold text-amber-500 uppercase tracking-[0.2em]">Virtual</p>
              <h3 class="text-lg font-bold text-white">Try It On</h3>
            </div>
            <button (click)="closeTryOn()" class="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full">&times;</button>
          </div>
          <div class="p-6">
            @if (!tryOnResult() && !tryOnLoading()) {
              <p class="text-sm text-white/60 mb-4">Upload a photo to see how this design looks on you.</p>
              <div class="grid grid-cols-2 gap-4">
                <label class="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-white/5 transition-all">
                  <svg class="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span class="text-sm font-medium text-white/70">Upload Photo</span>
                  <input type="file" accept="image/*" class="hidden" (change)="onTryOnPhoto($event)" />
                </label>
                <button (click)="openCamera()" class="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-white/20 rounded-xl hover:border-amber-500/50 hover:bg-white/5 transition-all">
                  <svg class="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span class="text-sm font-medium text-white/70">Use Camera</span>
                </button>
              </div>
              @if (showCamera()) {
                <div class="mt-4 rounded-xl overflow-hidden border border-white/10 relative">
                  <video #videoEl autoplay playsinline class="w-full"></video>
                  <canvas #captureCanvas class="hidden"></canvas>
                  <button (click)="capturePhoto()" class="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/90 text-black rounded-full text-sm font-semibold shadow-lg">Capture</button>
                </div>
              }
            }
            @if (tryOnLoading()) {
              <div class="flex flex-col items-center py-16 gap-4">
                <div class="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                <p class="text-sm text-white/60">Placing jewellery on your photo...</p>
              </div>
            }
            @if (tryOnResult()) {
              <div class="space-y-4">
                <img [src]="tryOnResult()" alt="Try-on" class="w-full rounded-xl border border-white/10" />
                <div class="flex gap-3">
                  <button (click)="resetTryOn()" class="flex-1 py-2.5 border border-white/20 text-white/80 rounded-lg text-sm font-medium hover:bg-white/5">Try Another</button>
                  <button (click)="downloadTryOnResult()" class="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500">Download</button>
                </div>
              </div>
            }
            @if (tryOnError()) {
              <div class="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p class="text-sm text-red-400">{{ tryOnError() }}</p>
                <button (click)="resetTryOn()" class="mt-2 text-xs text-red-400 underline">Try again</button>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Error Toast -->
    @if (error()) {
      <div class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-xl text-sm z-50 flex items-center gap-3">
        <span>{{ error() }}</span>
        <button (click)="error.set(null)" class="text-white/70 hover:text-white">&times;</button>
      </div>
    }
  `
})
export class ConfiguratorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editCanvas') editCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoEl') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') captureCanvasRef?: ElementRef<HTMLCanvasElement>;

  prompt = '';
  style = 'luxury modern';

  history = signal<GeneratedDesign[]>([]);
  selectedDesign = signal<GeneratedDesign | null>(null);
  isGenerating = signal(false);
  editMode = signal(false);
  referenceImage = signal<string | null>(null);
  error = signal<string | null>(null);
  craftingStatus = signal('Sketching the design...');

  private craftingMessages = [
    'Sketching the design...',
    'Selecting the finest metals...',
    'Setting the stones...',
    'Engraving fine details...',
    'Polishing to perfection...',
    'Adding the final sparkle...'
  ];
  private craftingInterval: ReturnType<typeof setInterval> | null = null;

  showTryOn = signal(false);
  showCamera = signal(false);
  tryOnLoading = signal(false);
  tryOnResult = signal<string | null>(null);
  tryOnError = signal<string | null>(null);

  private mediaStream: MediaStream | null = null;
  private isDrawing = false;
  private editCtx: CanvasRenderingContext2D | null = null;

  starterIdeas = [
    'Solitaire diamond ring in 18K rose gold with cathedral setting',
    'Traditional Kundan necklace with emeralds and pearls for a bride',
    'Minimalist platinum studs with princess-cut diamonds',
    'Art deco sapphire earrings with white gold filigree',
    'Antique-style gold bangle with ruby and diamond clusters',
    'Contemporary silver cuff bracelet with geometric patterns'
  ];

  quickActions = [
    'Make it bolder',
    'Add more diamonds',
    'Change to rose gold',
    'More delicate',
    'Add engraving detail',
    'Make it thinner'
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private designService: CustomDesignService,
    private cartService: CartService,
    private designTransferService: DesignTransferService
  ) {}

  ngOnInit() {
    const encoded = this.route.snapshot.queryParamMap.get('design');
    if (encoded) {
      const config = this.designTransferService.decodeConfig(encoded);
      if (config?.originalPrompt) {
        this.prompt = config.originalPrompt;
        this.generate();
      }
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.stopCamera();
    this.stopCraftingMessages();
  }

  private startCraftingMessages() {
    let idx = 0;
    this.craftingStatus.set(this.craftingMessages[0]);
    this.craftingInterval = setInterval(() => {
      idx = (idx + 1) % this.craftingMessages.length;
      this.craftingStatus.set(this.craftingMessages[idx]);
    }, 2500);
  }

  private stopCraftingMessages() {
    if (this.craftingInterval) {
      clearInterval(this.craftingInterval);
      this.craftingInterval = null;
    }
  }

  // --- Generation ---
  generate() {
    if (!this.prompt.trim() || this.isGenerating()) return;
    this.isGenerating.set(true);
    this.error.set(null);
    this.startCraftingMessages();

    const body: any = { prompt: this.prompt, style: this.style };
    if (this.referenceImage()) {
      body.referenceImageBase64 = this.referenceImage();
    }

    this.http.post<{ images: { id: string; imageUrl: string }[]; prompt: string }>(
      `${environment.apiUrl}/ai/design/generate`, body
    ).subscribe({
      next: (res) => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        if (res.images && res.images.length > 0) {
          const design: GeneratedDesign = {
            id: res.images[0].id,
            imageUrl: res.images[0].imageUrl,
            prompt: this.prompt,
            timestamp: Date.now()
          };
          this.history.update(h => [design, ...h]);
          this.selectedDesign.set(design);
          this.prompt = '';
          this.referenceImage.set(null);
        } else {
          this.error.set('No design was generated. Try a more detailed description.');
        }
      },
      error: (err) => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        this.error.set(err.error?.message || 'Failed to generate design. Please try again.');
      }
    });
  }

  refine() {
    if (!this.prompt.trim() || !this.selectedDesign() || this.isGenerating()) return;
    this.isGenerating.set(true);
    this.error.set(null);
    this.startCraftingMessages();

    this.http.post<{ images: { id: string; imageUrl: string }[] }>(
      `${environment.apiUrl}/ai/design/refine`,
      { baseImageBase64: this.selectedDesign()!.imageUrl, modification: this.prompt }
    ).subscribe({
      next: (res) => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        if (res.images && res.images.length > 0) {
          const design: GeneratedDesign = {
            id: res.images[0].id,
            imageUrl: res.images[0].imageUrl,
            prompt: `Refined: ${this.prompt}`,
            timestamp: Date.now()
          };
          this.history.update(h => [design, ...h]);
          this.selectedDesign.set(design);
          this.prompt = '';
        } else {
          this.error.set('Refinement did not produce a result. Try different instructions.');
        }
      },
      error: () => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        this.error.set('Failed to refine design. Please try again.');
      }
    });
  }

  // --- Region Editing ---
  startEditMode() {
    this.editMode.set(true);
    setTimeout(() => this.initEditCanvas(), 50);
  }

  private initEditCanvas() {
    const canvas = this.editCanvasRef?.nativeElement;
    if (!canvas) return;
    const img = canvas.previousElementSibling as HTMLImageElement;
    if (!img) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    canvas.style.width = img.clientWidth + 'px';
    canvas.style.height = img.clientHeight + 'px';
    this.editCtx = canvas.getContext('2d');
    if (this.editCtx) {
      this.editCtx.strokeStyle = '#f59e0b';
      this.editCtx.lineWidth = 3;
      this.editCtx.lineCap = 'round';
      this.editCtx.lineJoin = 'round';
    }
  }

  startDraw(e: MouseEvent) {
    this.isDrawing = true;
    if (this.editCtx) {
      this.editCtx.beginPath();
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      this.editCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  drawing(e: MouseEvent) {
    if (!this.isDrawing || !this.editCtx) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    this.editCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.editCtx.stroke();
  }

  endDraw() {
    this.isDrawing = false;
  }

  clearMask() {
    const canvas = this.editCanvasRef?.nativeElement;
    if (canvas && this.editCtx) {
      this.editCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  applyRegionEdit() {
    if (!this.prompt.trim() || !this.selectedDesign() || this.isGenerating()) return;
    const canvas = this.editCanvasRef?.nativeElement;
    if (!canvas) return;

    const maskDataUrl = canvas.toDataURL('image/png');
    this.editMode.set(false);
    this.isGenerating.set(true);
    this.error.set(null);
    this.startCraftingMessages();

    this.http.post<{ images: { id: string; imageUrl: string }[] }>(
      `${environment.apiUrl}/ai/design/edit-region`,
      { imageBase64: this.selectedDesign()!.imageUrl, maskBase64: maskDataUrl, prompt: this.prompt }
    ).subscribe({
      next: (res) => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        if (res.images && res.images.length > 0) {
          const design: GeneratedDesign = {
            id: res.images[0].id,
            imageUrl: res.images[0].imageUrl,
            prompt: `Region edit: ${this.prompt}`,
            timestamp: Date.now()
          };
          this.history.update(h => [design, ...h]);
          this.selectedDesign.set(design);
          this.prompt = '';
        } else {
          this.error.set('Region edit did not produce a result.');
        }
      },
      error: () => {
        this.isGenerating.set(false);
        this.stopCraftingMessages();
        this.error.set('Failed to edit region. Please try again.');
      }
    });
  }

  // --- Selection & Navigation ---
  selectDesign(design: GeneratedDesign) {
    this.selectedDesign.set(design);
    this.editMode.set(false);
  }

  onReferenceUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.referenceImage.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  downloadDesign() {
    const design = this.selectedDesign();
    if (!design) return;
    const link = document.createElement('a');
    link.download = `shiroiya-design-${Date.now()}.png`;
    link.href = design.imageUrl;
    link.click();
  }

  saveToCart() {
    const design = this.selectedDesign();
    if (!design) return;

    this.designService.saveDesign({
      baseType: 'AI Generated',
      metalType: 'Custom',
      purity: '',
      stoneType: '',
      stoneShape: '',
      stoneColor: '',
      stoneClarity: '',
      stoneCarat: 0,
      configurationJson: JSON.stringify({ prompt: design.prompt, style: this.style }),
      previewImageUrl: design.imageUrl
    }).subscribe({
      next: (saved) => {
        this.cartService.addCustomDesign(saved.id).subscribe({
          next: () => this.router.navigate(['/cart']),
          error: () => this.error.set('Failed to add to cart.')
        });
      },
      error: () => this.error.set('Failed to save design.')
    });
  }

  // --- Try It On ---
  openTryOn() { this.showTryOn.set(true); this.tryOnResult.set(null); this.tryOnError.set(null); }
  closeTryOn() { this.showTryOn.set(false); this.stopCamera(); }
  resetTryOn() { this.tryOnResult.set(null); this.tryOnError.set(null); this.tryOnLoading.set(false); this.stopCamera(); }

  openCamera() {
    this.showCamera.set(true);
    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then(stream => { this.mediaStream = stream; if (this.videoRef) this.videoRef.nativeElement.srcObject = stream; })
        .catch(() => { this.tryOnError.set('Camera access denied.'); this.showCamera.set(false); });
    }, 100);
  }

  capturePhoto() {
    if (!this.videoRef || !this.captureCanvasRef) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.captureCanvasRef.nativeElement;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.stopCamera(); this.showCamera.set(false);
    this.processTryOn(canvas.toDataURL('image/png'));
  }

  onTryOnPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.processTryOn(reader.result as string);
    reader.readAsDataURL(file);
  }

  private processTryOn(userPhoto: string) {
    const design = this.selectedDesign();
    if (!design) return;
    this.tryOnLoading.set(true); this.tryOnError.set(null);

    const token = localStorage.getItem('access_token');
    fetch(`${environment.apiUrl}/ai/try-on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify({ userPhoto, jewelleryPhoto: design.imageUrl, jewelleryType: 'custom' })
    })
    .then(r => r.json())
    .then(data => { this.tryOnLoading.set(false); data.imageUrl ? this.tryOnResult.set(data.imageUrl) : this.tryOnError.set(data.error || 'Generation failed.'); })
    .catch(() => { this.tryOnLoading.set(false); this.tryOnError.set('Failed to connect to try-on service.'); });
  }

  downloadTryOnResult() {
    const r = this.tryOnResult();
    if (!r) return;
    const link = document.createElement('a');
    link.download = `shiroiya-tryon-${Date.now()}.png`;
    link.href = r;
    link.click();
  }

  private stopCamera() { this.mediaStream?.getTracks().forEach(t => t.stop()); this.mediaStream = null; this.showCamera.set(false); }
}
