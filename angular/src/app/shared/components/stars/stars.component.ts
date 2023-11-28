import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stars',
  template: `<i class="fa-{{ rating < 1 ? 'regular' : 'solid' }} fa-star"></i
            ><i class="fa-{{ rating < 2 ? 'regular' : 'solid' }} fa-star"></i
            ><i class="fa-{{ rating < 3 ? 'regular' : 'solid' }} fa-star"></i
            ><i class="fa-{{ rating < 4 ? 'regular' : 'solid' }} fa-star"></i
            ><i class="fa-{{ rating < 5 ? 'regular' : 'solid' }} fa-star"></i>`,
  styles: [
  ]
})
export class StarsComponent {
  @Input() rating: number = 0;
}
