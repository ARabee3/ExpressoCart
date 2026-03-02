import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.scss',
})
export class CartItems {
  @Input() items: CartItem[] = [];

  @Output() incrementItem = new EventEmitter<{ id: string, quantity: number }>();
  @Output() decrementItem = new EventEmitter<{ id: string, quantity: number }>();
  @Output() deleteItem = new EventEmitter<string>();

  onIncrement(id: string, quantity: number) {
    this.incrementItem.emit({ id, quantity });
  }

  onDecrement(id: string, quantity: number) {
    this.decrementItem.emit({ id, quantity });
  }

  onDelete(productId: string) {
    this.deleteItem.emit(productId);
  }
}
