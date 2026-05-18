import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeScore } from './cumulative-score';

describe('CumulativeScore', () => {
  let component: CumulativeScore;
  let fixture: ComponentFixture<CumulativeScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CumulativeScore],
    }).compileComponents();

    fixture = TestBed.createComponent(CumulativeScore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
