import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitDirect } from './init-direct';

describe('InitDirect', () => {
  let component: InitDirect;
  let fixture: ComponentFixture<InitDirect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitDirect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitDirect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
