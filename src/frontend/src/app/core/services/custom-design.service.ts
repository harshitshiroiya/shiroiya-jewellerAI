import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CustomDesign {
  id: string;
  baseType: string;
  metalType: string;
  purity: string;
  stoneType: string;
  stoneShape?: string;
  stoneColor?: string;
  stoneClarity?: string;
  stoneCarat?: number;
  configurationJson: string;
  previewImageUrl?: string;
  estimatedPrice: number;
  status: string;
  createdAt: string;
}

export interface DesignConfig {
  baseType: string;
  metalType: string;
  purity: string;
  stoneType: string;
  stoneShape?: string;
  stoneColor?: string;
  stoneClarity?: string;
  stoneCarat?: number;
  configurationJson: string;
  previewImageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomDesignService {
  private readonly apiUrl = `${environment.apiUrl}/custom-designs`;

  constructor(private http: HttpClient) {}

  getMyDesigns() {
    return this.http.get<CustomDesign[]>(this.apiUrl);
  }

  getDesign(id: string) {
    return this.http.get<CustomDesign>(`${this.apiUrl}/${id}`);
  }

  saveDesign(config: DesignConfig) {
    return this.http.post<CustomDesign>(this.apiUrl, config);
  }

  updateDesign(id: string, config: DesignConfig) {
    return this.http.put<CustomDesign>(`${this.apiUrl}/${id}`, config);
  }

  submitDesign(id: string) {
    return this.http.post<CustomDesign>(`${this.apiUrl}/${id}/submit`, {});
  }

  calculatePrice(config: DesignConfig) {
    return this.http.post<{ estimatedPrice: number }>(`${this.apiUrl}/calculate-price`, config);
  }
}
