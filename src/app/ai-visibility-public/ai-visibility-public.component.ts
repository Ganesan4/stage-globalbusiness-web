import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-ai-visibility-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="profile" class="mb-6">
      <p class="mb-4 inline-block rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">{{ profile.badge }}</p>
      <h2 class="mb-4 text-2xl font-extrabold text-gray-800">About this business</h2>
      <p *ngIf="profile.one_sentence_description" class="mb-2 text-gray-700">{{ profile.one_sentence_description }}</p>
      <p *ngIf="profile.short_summary" class="mb-2 text-gray-700">{{ profile.short_summary }}</p>
      <p *ngIf="profile.ai_business_summary" class="mb-3 whitespace-pre-line text-gray-700">{{ profile.ai_business_summary }}</p>
      <p *ngIf="profile.full_description && profile.full_description !== profile.ai_business_summary" class="mb-3 whitespace-pre-line text-gray-700">{{ profile.full_description }}</p>
      <ul class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <li *ngIf="profile.service_areas" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Service areas</h3>
          <p class="text-gray-600">{{ profile.service_areas }}</p>
        </li>
        <li *ngIf="profile.specialties" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Specialties / expertise</h3>
          <p class="text-gray-600">{{ profile.specialties }}</p>
        </li>
        <li *ngIf="profile.target_customers" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Target customers</h3>
          <p class="text-gray-600">{{ profile.target_customers }}</p>
        </li>
        <li *ngIf="profile.languages" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Languages</h3>
          <p class="text-gray-600">{{ profile.languages }}</p>
        </li>
        <li *ngIf="profile.licenses" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Licenses</h3>
          <p class="text-gray-600">{{ profile.licenses }}</p>
        </li>
        <li *ngIf="profile.certifications" class="rounded-lg border p-2">
          <h3 class="font-semibold text-gray-800">Certifications</h3>
          <p class="text-gray-600">{{ profile.certifications }}</p>
        </li>
      </ul>
      <div *ngIf="profile.services?.length" class="mt-6">
        <h2 class="mb-4 text-2xl font-extrabold text-gray-800">Services</h2>
        <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li *ngFor="let row of profile.services" class="rounded-lg border p-2">
            <h3 class="font-semibold text-gray-800">{{ row.name }}</h3>
            <p *ngIf="row.category" class="text-gray-600">Category: {{ row.category }}</p>
            <p *ngIf="row.description" class="text-gray-600">{{ row.description }}</p>
            <p *ngIf="row.price_range" class="text-gray-600">{{ row.price_range }}</p>
          </li>
        </ul>
      </div>
      <div *ngIf="profile.products?.length" class="mt-6">
        <h2 class="mb-4 text-2xl font-extrabold text-gray-800">Products</h2>
        <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li *ngFor="let row of profile.products" class="rounded-lg border p-2">
            <h3 class="font-semibold text-gray-800">{{ row.name }}</h3>
            <p *ngIf="row.brand" class="text-gray-600">Brand: {{ row.brand }}</p>
            <p *ngIf="row.description" class="text-gray-600">{{ row.description }}</p>
            <p *ngIf="row.price_range" class="text-gray-600">{{ row.price_range }}</p>
          </li>
        </ul>
      </div>
      <div *ngIf="profile.faqs?.length" class="mt-6">
        <h2 class="mb-4 text-2xl font-extrabold text-gray-800">FAQs</h2>
        <ul class="grid grid-cols-1 gap-4">
          <li *ngFor="let row of profile.faqs" class="rounded-lg border p-2">
            <h3 class="font-semibold text-gray-800">{{ row.question }}</h3>
            <p class="text-gray-600">{{ row.answer }}</p>
          </li>
        </ul>
      </div>
      <p *ngIf="profile.updated_at" class="mt-4 text-sm text-gray-500">Business information last updated: {{ profile.updated_at | date:'mediumDate' }}</p>
    </section>
  `,
})
export class AiVisibilityPublicComponent implements OnChanges, OnDestroy {
  @Input() listingId: string | number | null = null;
  @Input() registrationId: string | number | null = null;
  profile: any = null;
  private script: HTMLScriptElement | null = null;

  constructor(private http: HttpClient, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.removeScript();
  }

  private load(): void {
    const params = new URLSearchParams();
    if (this.listingId) {
      params.set('listing_id', String(this.listingId));
    }
    if (this.registrationId) {
      params.set('registration_id', String(this.registrationId));
    }
    if (!params.toString()) {
      this.profile = null;
      this.removeScript();
      return;
    }
    this.http.get<any>(`${environment.base_url}aiVisibility/public?${params.toString()}`).subscribe({
      next: (res) => {
        this.profile = res?.status ? res.data : null;
        this.renderJsonLd(this.profile?.json_ld);
      },
      error: () => {
        this.profile = null;
        this.removeScript();
      },
    });
  }

  private renderJsonLd(data: unknown): void {
    this.removeScript();
    if (!data) {
      return;
    }
    this.script = this.renderer.createElement('script');
    this.script.type = 'application/ld+json';
    this.script.text = JSON.stringify(data).replace(/</g, '\\u003c');
    this.renderer.appendChild(document.head, this.script);
  }

  private removeScript(): void {
    if (this.script?.parentNode) {
      this.renderer.removeChild(document.head, this.script);
    }
    this.script = null;
  }
}
