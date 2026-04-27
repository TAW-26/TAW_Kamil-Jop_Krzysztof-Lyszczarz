import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AvatarShopApiService } from '../../../services/avatar-shop-api.service';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false,
            currentUser: () => null,
            username: () => null,
          },
        },
        {
          provide: AvatarShopApiService,
          useValue: {
            fetchOwnedAvatars: () => of([]),
            ownedAvatars: signal([]).asReadonly(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
