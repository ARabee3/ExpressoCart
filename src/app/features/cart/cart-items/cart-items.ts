import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-items',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItems {
  readonly items = input<CartItem[]>([]);

  readonly incrementItem = output<{ id: string; quantity: number }>();
  readonly decrementItem = output<{ id: string; quantity: number }>();
  readonly deleteItem = output<string>();
  readonly maxStockItemId = input<string | null>(null);

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
