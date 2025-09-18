import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-tide-display',
  templateUrl: './tides-display.component.html',
  styleUrls: ['./tides-display.component.scss']
})
export class TideDisplayComponent implements OnInit, OnChanges {
  @Input() station: any;
  @Input() predictions: any[] = [];
  
  nextHighTide: any = null;
  nextLowTide: any = null;
  currentTime: string = '';
  timeUntilNextTide: string = '';
  nextTideType: string = '';
  tideStatus: string = '';

  ngOnInit() {
    this.updateTideInfo();
    // Update time every minute
    setInterval(() => this.updateTideInfo(), 60000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['predictions']) {
      this.updateTideInfo();
    }
  }

  updateTideInfo() {
    this.currentTime = moment().format('h:mm A');
    
    if (!this.predictions || this.predictions.length === 0) {
      return;
    }
    
    const now = moment();
    
    // Find next high and low tides
    const futureTides = this.predictions.filter(p => 
      moment(p.time).isAfter(now)
    );
    
    if (futureTides.length > 0) {
      this.nextHighTide = futureTides.find(t => t.type === 'high');
      this.nextLowTide = futureTides.find(t => t.type === 'low');
      
      const nextTide = futureTides[0];
      this.nextTideType = nextTide.type;
      this.timeUntilNextTide = moment(nextTide.time).fromNow();
      
      // Determine if tide is currently rising or falling
      this.determineTideStatus();
    }
  }

  determineTideStatus() {
    const now = moment();
    const pastTides = this.predictions.filter(p => 
      moment(p.time).isBefore(now)
    );
    
    if (pastTides.length > 0) {
      const lastTide = pastTides[pastTides.length - 1];
      this.tideStatus = lastTide.type === 'high' ? 'Falling' : 'Rising';
    } else {
      this.tideStatus = 'Unknown';
    }
  }

  getTideIcon(type: string): string {
    return type === 'high' ? '📈' : '📉';
  }

  getTideColor(type: string): string {
    return type === 'high' ? 'primary' : 'accent';
  }
}