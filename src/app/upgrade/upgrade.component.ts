import { Component } from '@angular/core';
import { UpgradeCategoryComponent } from './components/upgrade-category/upgrade-category.component';
import { UpgradeCartComponent } from './components/upgrade-cart/upgrade-cart.component';
import { BundleCardComponent } from './components/bundle-card/bundle-card.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    UpgradeCategoryComponent,
    UpgradeCartComponent,
    BundleCardComponent
  ],
  templateUrl: './upgrade.component.html',
  styleUrl: './upgrade.component.scss'
})
export class UpgradeComponent {
constructor(private router: Router) {}
selectedItems:any[] = [];
selectedBundle: string | null = null;

bundle1 = {
  name: 'bundle1',
  price: 1099
};

bundle2 = {
  name: 'bundle2',
  price: 1997
};
total:number = 0;

upgrades = [

{
category:'⭐ Visibility Upgrades (Most Popular)',
items:[
{ name:'Featured Listing (Top of Search Results)', price:59, description:'Get placed above competitors in search results' },
{ name:'Category Spotlight Placement', price:29, description:'Highlighted listing inside category pages' },
{ name:'Priority Search Ranking Boost', price:39, description:'Improves your ranking in directory search' },
{ name:'City Homepage Featured Placement', price:99, description:'Appear on the city homepage' }
]
},

{
category:'🛡 Trust & Credibility',
items:[
{ name:'Verified Business Badge', price:12, description:'Build trust with verified status' },
{ name:'Verified Address Certification', price:9, description:'Verified address certification' },
{ name:'Verified Phone Badge', price:7, description:'Verified phone number badge' },
{ name:'Premium Top Business Seal', price:19, description:'Premium business credibility badge' }
]
},

{
category:'🔎 SEO & Search Upgrades',
items:[
{ name:'DoFollow SEO Backlink', price:19, description:'Improve SEO authority with DoFollow backlink' },
{ name:'Anchor Text Control', price:9, description:'Control anchor text for SEO links' },
{ name:'AI SEO Keyword Optimization', price:14, description:'AI optimized keywords for ranking' },
{ name:'Priority Google Indexing', price:12, description:'Faster indexing in Google search' }
]
},

{
category:'🖼 Profile Enhancement',
items:[
{ name:'Premium Business Profile Layout', price:19, description:'Professional enhanced profile layout' },
{ name:'Large Header Banner Image', price:9, description:'Add large banner image to profile' },
{ name:'Video Embed', price:9, description:'Embed promotional videos' },
{ name:'Unlimited Photo Gallery', price:12, description:'Upload unlimited business photos' }
]
},

{
category:'📞 Lead Generation',
items:[
{ name:'Lead Capture Button (Request Quote)', price:39, description:'Allow customers to request quotes' },
{ name:'Call Now Button', price:12, description:'Add direct call button for leads' },
{ name:'Appointment Booking', price:19, description:'Customers can book appointments' },
{ name:'Contact Form for Leads', price:29, description:'Dedicated contact form for inquiries' }
]
}

];
 
  ngOnInit() {
    // Allow non-logged users to view the upgrade page
  }

  private isUserLoggedIn(): boolean {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    return isLoggedIn === 'true' && !!userId;
  }
//   onSelectItem(item: any) {
//   this.selectedBundle = null;

//   const exists = this.selectedItems.find(i => i.name === item.name);

//   if (exists) {
//     this.selectedItems = this.selectedItems.filter(i => i.name !== item.name);
//   } else {
//     this.selectedItems.push(item);
//   }

// }
onSelectItem(item: any) {

  // Redirect non-logged users to register when they try to select an option
  if (!this.isUserLoggedIn()) {
    this.router.navigate(['/register']);
    return;
  }

  // remove bundle selection
  this.selectedBundle = null;

  // remove bundle item if exists
  this.selectedItems = this.selectedItems.filter(i => !i.isBundle);

  const exists = this.selectedItems.find(i => i.name === item.name);

  if (exists) {
    this.selectedItems = this.selectedItems.filter(i => i.name !== item.name);
  } else {
    this.selectedItems.push(item);
  }

  // ✅ CALCULATE TOTAL (IMPORTANT FIX)
  this.total = this.selectedItems.reduce((sum, i) => sum + i.price, 0);

}
 selectBundle(bundle: any) {

  // Redirect non-logged users to register when they try to select a bundle
  if (!this.isUserLoggedIn()) {
    this.router.navigate(['/register']);
    return;
  }

  this.selectedBundle = bundle.name;

  // ✅ Push bundle as selected item
  this.selectedItems = [
    {
      name: bundle.name === 'bundle1'
        ? 'Business Growth Bundle'
        : 'Ultimate Visibility Package',
      price: bundle.price,
      isBundle: true   // optional (for UI control)
    }
  ];

  // ✅ Update total
  this.total = bundle.price;

}
updateCart(item:any){

// Redirect non-logged users to register when they try to interact
if (!this.isUserLoggedIn()) {
  this.router.navigate(['/register']);
  return;
}

const exists = this.selectedItems.find(x=>x.name === item.name);

if(exists){
this.selectedItems = this.selectedItems.filter(x=>x.name !== item.name);
}
else{
this.selectedItems.push(item);
}

this.total = this.selectedItems.reduce((sum,x)=>sum + x.price,0);

}
}
