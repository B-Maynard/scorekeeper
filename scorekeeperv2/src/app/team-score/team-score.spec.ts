import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamScore } from './team-score';

describe('TeamScore', () => {
  let component: TeamScore;
  let fixture: ComponentFixture<TeamScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamScore],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamScore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
