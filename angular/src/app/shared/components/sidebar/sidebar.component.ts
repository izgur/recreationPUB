import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `<small class="text-muted">{{ content }}</small>`,
  styles: [
  ]
})
export class SidebarComponent {
  @Input() content: string = "";
}
