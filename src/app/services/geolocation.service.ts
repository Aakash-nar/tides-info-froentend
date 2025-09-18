import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { timeout: 10000 }
      );
    });
  }

  getCachedLocation(): { lat: number, lng: number } | null {
    const cached = localStorage.getItem('userLocation');
    return cached ? JSON.parse(cached) : null;
  }

  cacheLocation(lat: number, lng: number): void {
    localStorage.setItem('userLocation', JSON.stringify({ lat, lng }));
  }

  clearCachedLocation(): void {
    localStorage.removeItem('userLocation');
  }
}