import { Component,Input,Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-upgrade-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-category.component.html',
  styleUrl: './upgrade-category.component.scss'
})
export class UpgradeCategoryComponent {
@Input() category:any;
@Input() selectedItems: any[] = [];
@Output() selected = new EventEmitter<any>();

selectItem(item:any){
this.selected.emit(item);
}
isSelected(item: any): boolean {
  return this.selectedItems?.some((i: any) => i.name === item.name);
}
}
