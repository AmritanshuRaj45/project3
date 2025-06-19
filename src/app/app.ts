import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicForm } from './dynamic-form/dynamic-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DynamicForm],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <app-dynamic-form></app-dynamic-form>
    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected title = 'dynamic-form-generator';
}
