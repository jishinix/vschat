import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatOverlay } from './chat-overlay';

describe('ChatOverlay', () => {
  let component: ChatOverlay;
  let fixture: ComponentFixture<ChatOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
