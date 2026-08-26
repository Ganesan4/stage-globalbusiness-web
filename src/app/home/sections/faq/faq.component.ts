import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  faqItems = [
    { question: 'Is this really only $1.30 per year?', answer: 'Yes. One flat annual fee. No hidden charges.' },
    { question: 'Are there upsells?', answer: 'No. Everything listed is included.' },
    { question: 'Will my listing appear on Google?', answer: 'Listings are SEO-optimized and indexed by search engines.' },
    { question: 'Can I cancel anytime?', answer: 'Yes. No contracts. No auto-renewals.' },
    { question: 'How long does approval take?', answer: 'Most listings go live instantly or within 24 hours.' }
  ];

 openStates: boolean[] = [];
ngOnInit() {
  this.openStates = this.faqItems.map(() => false);
}
toggle(index: number) {
  this.openStates = this.openStates.map((state, i) =>
    i === index ? !state : false
  );
}
trackByIndex(index: number): number {
  return index;
}
}