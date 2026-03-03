import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../core/models/cart.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-items',
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.scss',
})
export class CartItems {
  @Input() items: CartItem[] = [];

  @Output() incrementItem = new EventEmitter<{ id: string; quantity: number }>();
  @Output() decrementItem = new EventEmitter<{ id: string; quantity: number }>();
  @Output() setQuantity = new EventEmitter<{ id: string; quantity: number }>();
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


  onChangeQuantity(id: string, rawValue: string) {
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const item = this.items.find((i) => i._id === id);
      if (item) {
        item.quantity = parsed;
      }
      this.setQuantity.emit({ id, quantity: parsed });
    } else {
      const item = this.items.find((i) => i._id === id);
      if (item) {
        const current = item.quantity;
        item.quantity = 0;
        setTimeout(() => (item.quantity = current), 0);
      }
    }
  }
}
