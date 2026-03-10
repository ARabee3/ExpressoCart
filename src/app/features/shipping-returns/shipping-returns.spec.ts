import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingReturns } from './shipping-returns';

describe('ShippingReturns', () => {
  let component: ShippingReturns;
  let fixture: ComponentFixture<ShippingReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingReturns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingReturns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
