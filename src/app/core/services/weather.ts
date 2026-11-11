import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, timer } from 'rxjs';

export type SeaStatus = 'good' | 'caution' | 'bad';

export interface DayForecast {
  date: string;
  dayLabel: string;
  code: number;
  tMax: number;
  windMax: number;
  waveMax: number | null;
  status: SeaStatus;
}

export interface SeaConditions {
  temp: number;
  code: number;
  isDay: boolean;
  wind: number;      // knots
  gusts: number;     // knots
  windDir: string;   // N, NE, ...
  wave: number | null; // metres
  status: SeaStatus;
  days: DayForecast[];
  updated: Date;
}

// Cannigione (weather) + a point at sea in front of the gulf (waves)
const LAND = { latitude: 41.107, longitude: 9.444 };
const SEA  = { latitude: 41.17,  longitude: 9.48 };
const REFRESH_MS = 30 * 60 * 1000;
const DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  /** Live conditions, refreshed every 30 min, shared by all components */
  readonly conditions$: Observable<SeaConditions> = timer(0, REFRESH_MS).pipe(
    switchMap(() => this.fetch()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Limits for small boats – adjust with the owner */
  static status(wind: number, gusts: number, wave: number | null): SeaStatus {
    const w = wave ?? 0;
    if (w >= 1.25 || wind >= 20 || gusts >= 28) return 'bad';
    if (w >= 0.6 || wind >= 13 || gusts >= 20) return 'caution';
    return 'good';
  }
    /** Forecast for one day (weather up to 15 days, waves up to 7 days ahead) */
  dayForecast(date: string): Observable<DayForecast | null> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((new Date(date + 'T00:00').getTime() - today.getTime()) / 86_400_000);
    if (diff < 0 || diff > 15) return of(null);

    const weather$ = this.http.get<any>('https://api.open-meteo.com/v1/forecast', {
      params: {
        ...LAND,
        daily: 'weather_code,temperature_2m_max,wind_speed_10m_max,wind_gusts_10m_max',
        wind_speed_unit: 'kn', timezone: 'Europe/Rome', start_date: date, end_date: date
      }
    });
    const marine$ = diff > 7 ? of(null) : this.http.get<any>('https://marine-api.open-meteo.com/v1/marine', {
      params: { ...SEA, daily: 'wave_height_max', timezone: 'Europe/Rome', start_date: date, end_date: date }
    }).pipe(catchError(() => of(null)));

    return forkJoin([weather$, marine$]).pipe(
      map(([w, m]) => {
        const windMax = w.daily.wind_speed_10m_max[0];
        const gustMax = w.daily.wind_gusts_10m_max[0];
        const waveMax: number | null = m?.daily?.wave_height_max?.[0] ?? null;
        return {
          date,
          dayLabel: DAYS[new Date(date + 'T00:00').getDay()],
          code: w.daily.weather_code[0],
          tMax: Math.round(w.daily.temperature_2m_max[0]),
          windMax: Math.round(windMax),
          waveMax,
          status: WeatherService.status(windMax, gustMax, waveMax)
        };
      })
    );
  }

  private fetch(): Observable<SeaConditions> {
    const weather$ = this.http.get<any>('https://api.open-meteo.com/v1/forecast', {
      params: {
        ...LAND,
        current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day',
        daily: 'weather_code,temperature_2m_max,wind_speed_10m_max,wind_gusts_10m_max',
        wind_speed_unit: 'kn',
        timezone: 'Europe/Rome',
        forecast_days: 4
      }
    });

    const marine$ = this.http.get<any>('https://marine-api.open-meteo.com/v1/marine', {
      params: {
        ...SEA,
        current: 'wave_height',
        daily: 'wave_height_max',
        timezone: 'Europe/Rome',
        forecast_days: 4
      }
    }).pipe(catchError(() => of(null))); // weather still works if marine fails

    return forkJoin([weather$, marine$]).pipe(
      map(([w, m]) => {
        const c = w.current;
        const wave: number | null = m?.current?.wave_height ?? null;

        const days: DayForecast[] = w.daily.time.map((date: string, i: number) => {
          const windMax = w.daily.wind_speed_10m_max[i];
          const gustMax = w.daily.wind_gusts_10m_max[i];
          const waveMax: number | null = m?.daily?.wave_height_max?.[i] ?? null;
          return {
            date,
            dayLabel: i === 0 ? 'Oggi' : DAYS[new Date(date).getDay()],
            code: w.daily.weather_code[i],
            tMax: Math.round(w.daily.temperature_2m_max[i]),
            windMax: Math.round(windMax),
            waveMax,
            status: WeatherService.status(windMax, gustMax, waveMax)
          };
        });

        return {
          temp: Math.round(c.temperature_2m),
          code: c.weather_code,
          isDay: c.is_day === 1,
          wind: Math.round(c.wind_speed_10m),
          gusts: Math.round(c.wind_gusts_10m),
          windDir: COMPASS[Math.round(c.wind_direction_10m / 45) % 8],
          wave,
          status: WeatherService.status(c.wind_speed_10m, c.wind_gusts_10m, wave),
          days,
          updated: new Date()
        };
      })
    );
  }
}