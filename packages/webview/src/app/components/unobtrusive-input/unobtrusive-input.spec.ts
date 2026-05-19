import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnobtrusiveInput } from './unobtrusive-input';

describe('UnobtrusiveInput', () => {
  let component: UnobtrusiveInput;
  let fixture: ComponentFixture<UnobtrusiveInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnobtrusiveInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnobtrusiveInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
