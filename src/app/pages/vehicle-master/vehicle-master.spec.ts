import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleMaster } from './vehicle-master';

describe('VehicleMaster', () => {
  let component: VehicleMaster;
  let fixture: ComponentFixture<VehicleMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleMaster],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleMaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
