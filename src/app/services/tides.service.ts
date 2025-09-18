import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TideStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
}

interface TidePrediction {
  time: string;
  type: 'high' | 'low';
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class TideService {
  private apiUrl = 'http://localhost:8080/api/tides'; 

  constructor(private http: HttpClient) { }

  getAllStations(): Observable<TideStation[]> {
    return this.http.get<any>(`${this.apiUrl}/stations`)
      .pipe(
        map(response => response.stations)
      );
  }

  findNearestStation(lat: number, lng: number): Observable<TideStation> {
    return this.http.get<any>(
      `${this.apiUrl}/nearest-station?lat=${lat}&lng=${lng}`
    );
  }

  getTidePredictions(stationId: string): Observable<TidePrediction[]> {
    return this.http.get<any>(
      `${this.apiUrl}/predictions?stationId=${stationId}`
    ).pipe(
      map(response => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        return data.predictions.map((pred: any) => ({
          time: pred.t,
          type: pred.type === 'H' ? 'high' : 'low',
          height: parseFloat(pred.v)
        }));
      })
    );
  }

  getHourlyTidePredictions(stationId: string): Observable<any[]> {
    return this.http.get<any>(
      `${this.apiUrl}/hourly-predictions?stationId=${stationId}`
    ).pipe(
      map(response => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        return data.predictions.map((pred: any) => ({
          time: pred.t,
          height: parseFloat(pred.v)
        }));
      })
    );
  }
}