import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-listing.component.html',
  styleUrl: './business-listing.component.scss'
})
export class BusinessListingComponent {
  // Business Information
  businessName: string = 'Global Business Pages';
  logoUrl: string = 'assets/logo.jpg';  // Path to logo image
  category: string = 'Restaurant';
  tags: string[] = ['Italian', 'Casual Dining'];
  rating: number = 4.5;
  reviewCount: number = 120;

  // Gallery Images
  images: string[] = [
    'assets/image1.jpg',
    'assets/image2.jpg',
    'assets/image3.jpg'
  ];

  // Contact Information
  phoneNumber: string = '+1 234 567 890';
  email: string = 'contact@business.com';
  address: string = '123 Business St., City, Country';
  websiteUrl: string = 'https://business.com';

  // Operating Hours
  operatingHours: { name: string; hours: string }[] = [
    { name: 'Monday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Thursday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Friday', hours: '9:00 AM - 5:00 PM' },
    { name: 'Saturday', hours: '10:00 AM - 2:00 PM' },
    { name: 'Sunday', hours: 'Closed' }
  ];

  // Services
  services: { name: string; description: string }[] = [
    { name: 'Dine-in', description: 'Enjoy our meals in a cozy environment.' },
    { name: 'Takeout', description: 'Order and pick up at your convenience.' },
    { name: 'Delivery', description: 'Get your favorite dishes delivered to your door.' }
  ];

  // Reviews
  reviews: { text: string; author: string }[] = [
    { text: 'Fantastic service and delicious food!', author: 'Alice' },
    { text: 'Highly recommend this place for family dinners.', author: 'Bob' },
    { text: 'Great ambiance and friendly staff.', author: 'Charlie' }
  ];

  // FAQs
  faqs: { question: string; answer: string }[] = [
    { question: 'Do you offer vegetarian options?', answer: 'Yes, we have a variety of vegetarian dishes available.' },
    { question: 'Is parking available?', answer: 'Yes, we provide parking spaces for our customers.' },
    { question: 'Can I make a reservation?', answer: 'Yes, reservations can be made by calling our contact number.' }
  ];
}
