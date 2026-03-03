import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],

    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      this.loginForm.reset();
    }
  }
}
