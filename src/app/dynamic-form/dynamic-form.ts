import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CommonModule, NgIf, NgFor, JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FORM_SCHEMA } from './form-schema';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCheckboxModule, NgIf, NgFor, JsonPipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <ng-container *ngFor="let field of schema.fields">
        <ng-container *ngIf="isVisible(field)">
          <ng-container [ngSwitch]="field.type">
            <mat-form-field *ngSwitchCase="'text'" appearance="fill" style="width: 100%; margin-bottom: 16px;">
              <mat-label>{{ field.label }}</mat-label>
              <input matInput [formControlName]="field.key" [placeholder]="field.tooltip ?? ''" [readonly]="!field.editable">
              <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
              <mat-error *ngIf="form.get(field.key)?.hasError('required')">This field is required</mat-error>
              <mat-error *ngIf="form.get(field.key)?.hasError('pattern')">Invalid format</mat-error>
            </mat-form-field>
            <mat-form-field *ngSwitchCase="'number'" appearance="fill" style="width: 100%; margin-bottom: 16px;">
              <mat-label>{{ field.label }}</mat-label>
              <input matInput type="number" [formControlName]="field.key" [placeholder]="field.tooltip ?? ''" [readonly]="!field.editable">
              <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
              <mat-error *ngIf="form.get(field.key)?.hasError('required')">This field is required</mat-error>
            </mat-form-field>
            <mat-form-field *ngSwitchCase="'dropdown'" appearance="fill" style="width: 100%; margin-bottom: 16px;">
              <mat-label>{{ field.label }}</mat-label>
              <mat-select [formControlName]="field.key">
                <mat-option *ngFor="let opt of field.options" [value]="opt">{{ opt }}</mat-option>
              </mat-select>
              <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
              <mat-error *ngIf="form.get(field.key)?.hasError('required')">This field is required</mat-error>
            </mat-form-field>
            <mat-checkbox *ngSwitchCase="'boolean'" [formControlName]="field.key">{{ field.label }}</mat-checkbox>
            <!-- Add more field types as needed -->
          </ng-container>
        </ng-container>
      </ng-container>
      <ng-container *ngFor="let map of schema.mapSections">
        <div style="margin: 24px 0;">
          <h3>{{ map.label }}</h3>
          <div *ngFor="let key of getMapKeys(map)">
            <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 8px;">
              <mat-label>{{ key }}</mat-label>
              <input matInput [formControlName]="key">
            </mat-form-field>
          </div>
          <button *ngIf="map.allowUserAddition" mat-stroked-button type="button" (click)="addMapKey(map.key)">+ Add Key</button>
        </div>
      </ng-container>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Submit</button>
    </form>
    <pre *ngIf="submitted">{{ form.value | json }}</pre>
  `,
  styles: `form { max-width: 800px; margin: 24px auto; }`
})
export class DynamicForm implements OnInit {
  schema: any = FORM_SCHEMA;
  form: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    const group: any = {};
    (this.schema.fields as any[]).forEach((field: any) => {
      const validators: ValidatorFn[] = [];
      if (field.mandatory) validators.push(Validators.required);
      if (field.regex) validators.push(Validators.pattern(field.regex));
      group[field.key] = [field.defaultValue ?? '', validators];
    });
    (this.schema.mapSections as any[] ?? []).forEach((map: any) => {
      group[map.key] = this.fb.group(map.defaultValue || {});
    });
    this.form = this.fb.group(group);
    this.form.valueChanges.subscribe(() => this.updateConditionalValidators());
  }

  isVisible(field: any): boolean {
    if (!field.visibleIf) return true;
    const depValue = this.form.get(field.visibleIf.key)?.value;
    return depValue === field.visibleIf.value;
  }

  updateConditionalValidators() {
    (this.schema.fields as any[]).forEach((field: any) => {
      if (field.mandatoryIf) {
        const depValue = this.form.get(field.mandatoryIf.key)?.value;
        const control = this.form.get(field.key);
        if (depValue === field.mandatoryIf.value) {
          control?.addValidators(Validators.required);
        } else {
          control?.removeValidators(Validators.required);
        }
        control?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  getMapKeys(map: any) {
    return Object.keys(this.form.value[map.key] || {});
  }

  addMapKey(mapKey: string) {
    const key = prompt('Enter new key:');
    if (key) {
      (this.form.get(mapKey) as FormGroup).addControl(key, new FormControl(''));
    }
  }

  onSubmit() {
    this.submitted = true;
  }
}