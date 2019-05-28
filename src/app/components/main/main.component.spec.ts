import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Main } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        Main
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(Main);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'andrea-dynamic'`, () => {
    const fixture = TestBed.createComponent(Main);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('andrea-dynamic');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(Main);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to andrea-dynamic!');
  });
});
