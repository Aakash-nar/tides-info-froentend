import { Component, OnInit } from '@angular/core';
import { GeolocationService } from './services/geolocation.service';
import { TideService } from './services/tides.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Tide Tracker';
  userLocation: { lat: number, lng: number } | null = null;
  nearestStation: any = null;
  tidePredictions: any[] = [];
  hourlyPredictions: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private tideService: TideService,
    private geolocationService: GeolocationService
  ) {}

  async ngOnInit() {
    try {
      this.userLocation = this.geolocationService.getCachedLocation();
      if (!this.userLocation) {
        const position = await this.geolocationService.getCurrentPosition();
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.geolocationService.cacheLocation(
          this.userLocation.lat, 
          this.userLocation.lng
        );
      }

      this.tideService.findNearestStation(
        this.userLocation.lat, 
        this.userLocation.lng
      ).subscribe(station => {
        this.nearestStation = station;
        
        this.tideService.getTidePredictions(station.id).subscribe(predictions => {
          this.tidePredictions = predictions;
          
          this.tideService.getHourlyTidePredictions(station.id).subscribe(hourly => {
            this.hourlyPredictions = hourly;
            this.loading = false;
          });
        });
      });

    } catch (error) {
      this.error = 'Unable to retrieve your location. Please ensure location services are enabled.';
      this.loading = false;
      console.error(error);
    }
  }

  clearCache() {
    this.geolocationService.clearCachedLocation();
    this.userLocation = null;
    this.ngOnInit();
  }
}