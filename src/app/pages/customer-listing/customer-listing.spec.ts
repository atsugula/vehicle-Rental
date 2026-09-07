import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListing } from './customer-listing';

describe('CustomerListing', () => {
  let component: CustomerListing;
  let fixture: ComponentFixture<CustomerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerListing],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
