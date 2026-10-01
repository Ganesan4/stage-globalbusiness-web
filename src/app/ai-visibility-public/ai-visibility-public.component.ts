import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-ai-visibility-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="profile" class="mb-6 rounded-lg border border-gray-200 p-4">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">{{ profile.badge }}</p>
      <h2 class="mb-3 text-xl font-bold text-gray-800">About this business</h2>
      <p *ngIf="profile.one_sentence_description" class="mb-2 text-gray-700">{{ profile.one_sentence_description }}</p>
      <p *ngIf="profile.ai_business_summary" class="mb-3 whitespace-pre-line text-gray-700">{{ profile.ai_business_summary }}</p>
      <p *ngIf="profile.full_description && profile.full_description !== profile.ai_business_summary" class="mb-3 whitespace-pre-line text-gray-700">{{ profile.full_description }}</p>
      <p *ngIf="profile.service_areas"><strong>Service areas:</strong> {{ profile.service_areas }}</p>
      <p *ngIf="profile.specialties"><strong>Specialties:</strong> {{ profile.specialties }}</p>
      <p *ngIf="profile.target_customers"><strong>Customers:</strong> {{ profile.target_customers }}</p>
      <p *ngIf="profile.languages"><strong>Languages:</strong> {{ profile.languages }}</p>
      <p *ngIf="profile.licenses"><strong>Licenses:</strong> {{ profile.licenses }}</p>
      <p *ngIf="profile.certifications"><strong>Certifications:</strong> {{ profile.certifications }}</p>
      <div *ngIf="profile.services?.length" class="mt-4">
        <h3 class="font-semibold text-gray-800">Services</h3>
        <ul class="mt-2 space-y-2">
          <li *ngFor="let row of profile.services" class="rounded border p-2">
            <strong>{{ row.name }}</strong>
            <p *ngIf="row.description" class="text-gray-600">{{ row.description }}</p>
          </li>
        </ul>
      </div>
      <div *ngIf="profile.products?.length" class="mt-4">
        <h3 class="font-semibold text-gray-800">Products</h3>
        <ul class="mt-2 space-y-2">
          <li *ngFor="let row of profile.products" class="rounded border p-2">
            <strong>{{ row.name }}</strong>
            <p *ngIf="row.description" class="text-gray-600">{{ row.description }}</p>
          </li>
        </ul>
      </div>
      <div *ngIf="profile.faqs?.length" class="mt-4">
        <h3 class="font-semibold text-gray-800">Questions</h3>
        <ul class="mt-2 space-y-2">
          <li *ngFor="let row of profile.faqs" class="rounded border p-2">
            <strong>{{ row.question }}</strong>
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
