import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleTab } from './collapsible-tab';

describe('CollapsibleTab', () => {
  let component: CollapsibleTab;
  let fixture: ComponentFixture<CollapsibleTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapsibleTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
