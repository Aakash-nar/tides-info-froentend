import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-tide-chart',
  templateUrl: './tide-chart.component.html',
  styleUrls: ['./tide-chart.component.scss']
})
export class TideChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() predictions: any[] = [];
  @Input() hourlyPredictions: any[] = [];
  @ViewChild('tideChart') chartRef!: ElementRef;
  chart: any;
  private isViewReady = false;

  ngOnInit() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.isViewReady = true;
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['predictions'] || changes['hourlyPredictions']) && this.isViewReady) {
      this.createChart();
    }
  }

  createChart() {
    // Check if chartRef is available and predictions exist
    if (!this.chartRef?.nativeElement || !this.predictions || this.predictions.length === 0) return;
    
    const ctx = this.chartRef.nativeElement.getContext('2d');
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Use hourly predictions if available, otherwise use high/low predictions
    const data = this.hourlyPredictions.length > 0 ? 
      this.processHourlyData() : 
      this.processHighLowData();
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Tide Height (ft)',
          data: data.values,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: data.pointColors,
          pointBorderColor: data.pointColors,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Height: ${context.raw} ft`;
              },
              title: (context) => {
                return `Time: ${context[0].label}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Height (ft)',
              color: '#666',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time of Day',
              color: '#666',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
  }

  processHighLowData(): any {
    const labels = this.predictions.map(p => {
      const date = new Date(p.time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    const values = this.predictions.map(p => p.height);
    
    const pointColors = this.predictions.map(p => 
      p.type === 'high' ? '#4caf50' : '#f44336'
    );
    
    return { labels, values, pointColors };
  }

  processHourlyData(): any {
    const labels = this.hourlyPredictions.map(p => {
      const date = new Date(p.time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    const values = this.hourlyPredictions.map(p => p.height);
    
    // For hourly data, we don't have point colors based on tide type
    const pointColors = Array(values.length).fill('#3f51b5');
    
    return { labels, values, pointColors };
  }

  // Helper methods for the template
  getNextTideTime(type: 'high' | 'low'): string {
    if (!this.predictions || this.predictions.length === 0) return 'N/A';
    
    const now = new Date();
    const futureTides = this.predictions.filter(p => 
      new Date(p.time) > now && p.type === type
    );
    
    if (futureTides.length > 0) {
      const nextTide = futureTides[0];
      const tideTime = new Date(nextTide.time);
      return tideTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return 'N/A';
  }

  getMaxTideHeight(): number {
    if (!this.predictions || this.predictions.length === 0) return 0;
    
    const heights = this.predictions.map(p => p.height);
    return Math.max(...heights);
  }

  getMinTideHeight(): number {
    if (!this.predictions || this.predictions.length === 0) return 0;
    
    const heights = this.predictions.map(p => p.height);
    return Math.min(...heights);
  }
}