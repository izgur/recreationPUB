import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {
  transform(
    distance: number, ...args: unknown[]
  ): string {
    let unit = "m";
    let nDigits = 0;
    if (distance > 1000) {
      distance = distance / 1000;
      unit = "km";
      nDigits = 2;
    }
    return (
      
      distance.toLocaleString("sl-SI", { maximumFractionDigits: nDigits }) +
      " " +
      unit
    );
  }

}
