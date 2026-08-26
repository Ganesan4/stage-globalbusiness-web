import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { WebService } from '../services/web.service';
import { spec } from 'node:test/reporters';
import { Amenity } from './model/Amenity';
import { stat } from 'node:fs';
import {
  general_amenities, hospitality,
  health, business_services,
  entertainment, safety,
  location_specific, eco_friendly,
  additional_features,
} from './data/amenities';
import { group } from 'node:console';
import { title } from 'node:process';

// export function socialMediaLinkValidator(platform: string): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     if (!control.value) return null; // Allow empty values

//     const domainPatterns: { [key: string]: RegExp } = {
//       facebook: /^https?:\/\/(www\.)?facebook\.com(\/|$)/,
//       instagram: /^https?:\/\/(www\.)?instagram\.com(\/|$)/,
//       twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)(\/|$)/,
//       youtube: /^https?:\/\/(www\.)?youtube\.com(\/|$)/,
//       tiktok: /^https?:\/\/(www\.)?tiktok\.com(\/|$)/,
//       linkedin: /^https?:\/\/(www\.)?linkedin\.com(\/|$)/,
//     };

//     const pattern = domainPatterns[platform];
//     if (pattern && !pattern.test(control.value)) {
//       return { invalidLink: `Invalid ${platform} link` };
//     }

//     return null;
//   };
// }

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-allbusiness',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, CKEditorModule],
  templateUrl: './allbusiness.component.html',
  styleUrl: './allbusiness.component.scss'
})
export class AllbusinessComponent {

  public Editor: any;
  // public editorConfig = {
  //   toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote']
  // };
  public editorConfig = {}

  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;


  registerForm: FormGroup;
  step = 1;
  selectedPayment: string | null = null;
  showSquareModal: boolean = false;
  showModal = false;
  selectedAmenityTitle: string = '';
  description: string = '';
  isFree: boolean = false;
  cost: number | null = null;
  showOkButton: boolean = false;
  showPayPalModal: boolean = false;
  showStripeModal: boolean = false;
  transactionSuccessStripe: boolean = false;
  data: any;
  payments: any;
  response: any;
  card: any;
  cardButton: HTMLButtonElement | null = null;
  statusContainer: HTMLElement | null = null;
  existingEmails: string[] = [];
  stepLabels = ['Basic Info', 'Products & Services', 'Support', 'Final Details'];
  newfilename: string;
  amount: any;
  currency: any;
  transaction_id: any;
  payment_options: any;
  transaction_date: any;
  transactionSuccess: boolean = false;
  transactionSuccessPaypal: boolean = false;
  showValidationPayment: boolean = false;
  responseregister: any;
  details: any;
  // showsuccessmessage: boolean=false;
  user_id: string;
  myallbusinessdata: any;
  logoUrl: string;

  amenitiesArray: [Amenity]
  selectedAmenity: { index: number, group: string, element: any } = {
    index: 0,
    group: '',
    element: {}
  };

  selectedAmenityForEdit: Amenity;

  selectedCategory: string = '';

  general_amenities = general_amenities;
  hospitality = hospitality;
  health = health;
  business_services = business_services;
  entertainment = entertainment;
  safety = safety;
  location_specific = location_specific;
  eco_friendly = eco_friendly;
  additional_features = additional_features;

  amenities = [
    { 'General_Amenities': general_amenities },
    { 'Hospitality_&_Dining': hospitality },
    { 'Health_&_Fitness': health },
    { 'Business_Services': business_services },
    { 'Entertainment_&_Leisure': entertainment },
    { 'Safety_&_Security': safety },
    { 'Location_Specific': location_specific },
    { 'Eco_Friendly_Features': eco_friendly },
    { 'Additional_Features': additional_features }
  ];
  modaldata: any = {};

  // showsuccess: string;

  constructor(private fb: FormBuilder,
    private http: HttpClient,
    private web: WebService,
    @Inject(PLATFORM_ID) private platformId: Object) {

    this.registerForm = this.fb.group({
      category: [null, Validators.required],
      description: [null, Validators.required],
      products_services: [null, Validators.required],
      fax: [null],
      start_date: [null],
      website: [null],
      annual_sales: [null],
      pricing: [null],
      safety: this.fb.array([]),
      industry: [null],
      operating_hours: [null],
      location_details: [null],
      service_areas: [null],
      target_market: [null],
      social_media_links: [null],
      certifications: [null],
      client_testimonials: [null],
      market_positioning: [null],
      global_reach: [null],
      news_updates: [null],
      promotions: [null],
      networking_opportunities: [null],
      visual_content: [null],
      community_involvement: [null],
      faq: [null],
      call_to_action: [null],
      mobile_friendly_features: [null],
      legal_information: [null],
      uvp: [null],
      multilingual_support: [null],
      customer_satisfaction: [null],
      employee_satisfaction: [null],
      sustainability_practices: [null],
      social_impact_scores: [null],
      operational_transparency: [null],
      industry_comparisons: [null],
      usp_analysis: [null],
      product_lifecycle: [null],
      case_studies: [null],
      community_engagement: [null],
      visual_interactive: [null],
      user_generated_qa: [null],
      dynamic_pricing: [null],
      expert_opinions: [null],
      crisis_management: [null],
      facebook: [null],
      twitter: [null],
      instagram: [null],
      linkedin: [null],
      youtube: [null],
      tiktok: [null],
      clienttestimonials1: [null],
      clienttestimonials2: [null],
      clienttestimonials3: [null],
      clienttestimonials4: [null],
      clienttestimonials5: [null],
    },
    );
  }



  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamic import only on client side
      const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');
      this.Editor = ClassicEditor.default;
    }
    this.user_id = localStorage.getItem('userId');
    console.log("User id:", this.user_id);
    if (this.user_id) {
      this.myallbusiness();
    }
  }

  isChecked(amenity: string): boolean {
    let data = this.amenitiesArray?.filter(item => item.title === amenity)
    return data?.length > 0;
  }

  async onallbusinessSubmit() {
    console.log('this.registerForm.value', this.registerForm.value);
    console.log('this.user_id', this.user_id);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Mark fields as touched to trigger validation

      // Show a toaster error message for each empty field
      if (this.registerForm.get('category')?.invalid) {
        this.showNotification('Business Category is required', 'error');
      }
      if (this.registerForm.get('description')?.invalid) {
        this.showNotification('Business Description is required', 'error');
      }
      if (this.registerForm.get('products_services')?.invalid) {
        this.showNotification('Products / Services is required', 'error');
      }

      console.log('Form is invalid');
      return; // Stop form submission
    }

    try {
      const response = await this.web.postData('editallbusiness', {
        form: this.registerForm.value,
        id: this.user_id
      });

      if (response.status) {
        console.log('Registration successful');
        this.showNotification('Updated successfully!', 'success');
        this.myallbusiness();
      } else {
        this.showNotification('Failed to update my profile. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      this.showNotification('An unexpected error occurred. Please try again.', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000);
  }

  async myallbusiness() {
    try {
      const res = await this.web.postData('myallbusiness', { "userid": this.user_id })
      if (res.status) {
        this.myallbusinessdata = res.message
        this.amenitiesArray = this.myallbusinessdata.safety || []; 

        console.log("amenitiesArray", this.amenitiesArray);

         console.log("amenitiesArray", this.amenitiesArray);

        const safetyArray = this.registerForm.get('safety') as FormArray;
        while (safetyArray.length) {
          safetyArray.removeAt(0);
        }
        
        // Only proceed if amenitiesArray has items
        if (this.amenitiesArray && this.amenitiesArray.length) {
          this.amenitiesArray.forEach((amenity) => {
            let updatedAmenity = this.fb.group({
              title: amenity.title,
              description: amenity.description,
              isFree: amenity.isFree,
              cost: amenity.cost,
              category: amenity.category
            });
            safetyArray.push(updatedAmenity);
          });
        }

        this.registerForm.patchValue({
          category: this.myallbusinessdata.category,
          description: this.myallbusinessdata.description,
          products_services: this.myallbusinessdata.products_services,
          fax: this.myallbusinessdata.fax == "NULL" ? "" : this.myallbusinessdata.fax,
          start_date: this.myallbusinessdata.start_date == "NULL" ? "" : this.myallbusinessdata.start_date,
          website: this.myallbusinessdata.website == "NULL" ? "" : this.myallbusinessdata.website,
          annual_sales: this.myallbusinessdata.annual_sales == "NULL" ? "" : this.myallbusinessdata.annual_sales,
          pricing: this.myallbusinessdata.pricing == "NULL" ? "" : this.myallbusinessdata.pricing,
          industry: this.myallbusinessdata.industry == "NULL" ? "" : this.myallbusinessdata.industry,
          operating_hours: this.myallbusinessdata.operating_hours == "NULL" ? "" : this.myallbusinessdata.operating_hours,
          location_details: this.myallbusinessdata.location_details == "NULL" ? "" : this.myallbusinessdata.location_details,
          service_areas: this.myallbusinessdata.service_areas == "NULL" ? "" : this.myallbusinessdata.service_areas,
          target_market: this.myallbusinessdata.target_market == "NULL" ? "" : this.myallbusinessdata.target_market,
          social_media_links: this.myallbusinessdata.social_media_links == "NULL" ? "" : this.myallbusinessdata.social_media_links,
          certifications: this.myallbusinessdata.certifications == "NULL" ? "" : this.myallbusinessdata.certifications,
          client_testimonials: this.myallbusinessdata.client_testimonials == "NULL" ? "" : this.myallbusinessdata.client_testimonials,
          market_positioning: this.myallbusinessdata.market_positioning == "NULL" ? "" : this.myallbusinessdata.market_positioning,
          global_reach: this.myallbusinessdata.global_reach == "NULL" ? "" : this.myallbusinessdata.global_reach,
          news_updates: this.myallbusinessdata.news_updates == "NULL" ? "" : this.myallbusinessdata.news_updates,
          promotions: this.myallbusinessdata.promotions == "NULL" ? "" : this.myallbusinessdata.promotions,
          networking_opportunities: this.myallbusinessdata.networking_opportunities == "NULL" ? "" : this.myallbusinessdata.networking_opportunities,
          visual_content: this.myallbusinessdata.visual_content == "NULL" ? "" : this.myallbusinessdata.visual_content,
          community_involvement: this.myallbusinessdata.community_involvement == "NULL" ? "" : this.myallbusinessdata.community_involvement,
          faq: this.myallbusinessdata.faq == "NULL" ? "" : this.myallbusinessdata.faq,
          call_to_action: this.myallbusinessdata.call_to_action == "NULL" ? "" : this.myallbusinessdata.call_to_action,
          mobile_friendly_features: this.myallbusinessdata.mobile_friendly_features == "NULL" ? "" : this.myallbusinessdata.mobile_friendly_features,
          legal_information: this.myallbusinessdata.legal_information == "NULL" ? "" : this.myallbusinessdata.legal_information,
          uvp: this.myallbusinessdata.uvp == "NULL" ? "" : this.myallbusinessdata.uvp,
          multilingual_support: this.myallbusinessdata.multilingual_support == "NULL" ? "" : this.myallbusinessdata.multilingual_support,
          customer_satisfaction: this.myallbusinessdata.customer_satisfaction == "NULL" ? "" : this.myallbusinessdata.customer_satisfaction,
          employee_satisfaction: this.myallbusinessdata.employee_satisfaction == "NULL" ? "" : this.myallbusinessdata.employee_satisfaction,
          sustainability_practices: this.myallbusinessdata.sustainability_practices == "NULL" ? "" : this.myallbusinessdata.sustainability_practices,
          social_impact_scores: this.myallbusinessdata.social_impact_scores == "NULL" ? "" : this.myallbusinessdata.social_impact_scores,
          operational_transparency: this.myallbusinessdata.operational_transparency == "NULL" ? "" : this.myallbusinessdata.operational_transparency,
          industry_comparisons: this.myallbusinessdata.industry_comparisons == "NULL" ? "" : this.myallbusinessdata.industry_comparisons,
          usp_analysis: this.myallbusinessdata.usp_analysis == "NULL" ? "" : this.myallbusinessdata.usp_analysis,
          product_lifecycle: this.myallbusinessdata.product_lifecycle == "NULL" ? "" : this.myallbusinessdata.product_lifecycle,
          case_studies: this.myallbusinessdata.case_studies == "NULL" ? "" : this.myallbusinessdata.case_studies,
          community_engagement: this.myallbusinessdata.community_engagement == "NULL" ? "" : this.myallbusinessdata.community_engagement,
          visual_interactive: this.myallbusinessdata.visual_interactive == "NULL" ? "" : this.myallbusinessdata.visual_interactive,
          user_generated_qa: this.myallbusinessdata.user_generated_qa == "NULL" ? "" : this.myallbusinessdata.user_generated_qa,
          dynamic_pricing: this.myallbusinessdata.dynamic_pricing == "NULL" ? "" : this.myallbusinessdata.dynamic_pricing,
          expert_opinions: this.myallbusinessdata.expert_opinions == "NULL" ? "" : this.myallbusinessdata.expert_opinions,
          crisis_management: this.myallbusinessdata.crisis_management == "NULL" ? "" : this.myallbusinessdata.crisis_management,
          general: this.myallbusinessdata.general == "NULL" ? "" : this.myallbusinessdata.general,
          hospitality: this.myallbusinessdata.hospitality == "NULL" ? "" : this.myallbusinessdata.hospitality,
          health: this.myallbusinessdata.health == "NULL" ? "" : this.myallbusinessdata.health,
          business_services: this.myallbusinessdata.business_services == "NULL" ? "" : this.myallbusinessdata.business_services,
          location_specific: this.myallbusinessdata['location-specific'] == "NULL" ? "" : this.myallbusinessdata.location_specific,
          eco_friendly: this.myallbusinessdata['eco-friendly'] == "NULL" ? "" : this.myallbusinessdata.eco_friendly,
          additional_features: this.myallbusinessdata.additional_features == "NULL" ? "" : this.myallbusinessdata.additional_features,
          safety: this.myallbusinessdata.safety == "NULL" ? "" : this.myallbusinessdata.safety,
          entertainment: this.myallbusinessdata.entertainment == "NULL" ? "" : this.myallbusinessdata.entertainment,
          facebook: this.myallbusinessdata.facebook == "NULL" || this.myallbusinessdata.facebook == "None" ? "" : this.myallbusinessdata.facebook,
          instagram: this.myallbusinessdata.instagram == "NULL" || this.myallbusinessdata.instagram == "None" ? "" : this.myallbusinessdata.instagram,
          twitter: this.myallbusinessdata.twitter == "NULL" || this.myallbusinessdata.twitter == "None" ? "" : this.myallbusinessdata.twitter,
          linkedin: this.myallbusinessdata.linkedin == "NULL" || this.myallbusinessdata.linkedin == "None" ? "" : this.myallbusinessdata.linkedin,
          youtube: this.myallbusinessdata.youtube == "NULL" || this.myallbusinessdata.youtube == "None" ? "" : this.myallbusinessdata.youtube,
          tiktok: this.myallbusinessdata.tiktok == "NULL" || this.myallbusinessdata.tiktok == "None" ? "" : this.myallbusinessdata.tiktok,
          clienttestimonials1: this.myallbusinessdata.clienttestimonials1 == "NULL" || this.myallbusinessdata.clienttestimonials1 == "None" ? "" : this.myallbusinessdata.clienttestimonials1,
          clienttestimonials2: this.myallbusinessdata.clienttestimonials2 == "NULL" || this.myallbusinessdata.clienttestimonials2 == "None" ? "" : this.myallbusinessdata.clienttestimonials2,
          clienttestimonials3: this.myallbusinessdata.clienttestimonials3 == "NULL" || this.myallbusinessdata.clienttestimonials3 == "None" ? "" : this.myallbusinessdata.clienttestimonials3,
          clienttestimonials4: this.myallbusinessdata.clienttestimonials4 == "NULL" || this.myallbusinessdata.clienttestimonials4 == "None" ? "" : this.myallbusinessdata.clienttestimonials4,
          clienttestimonials5: this.myallbusinessdata.clienttestimonials5 == "NULL" || this.myallbusinessdata.clienttestimonials5 == "None" ? "" : this.myallbusinessdata.clienttestimonials5,
        });
      }
    } catch (err) {
      console.log(err)
    }

  }

  onOk() {
    const amenity = this.fb.group({
      title: this.selectedAmenityTitle,
      description: this.description,
      isFree: this.isFree,
      cost: this.isFree ? 0 : this.cost,
      category: this.selectedCategory
    });
    console.log('amenity', amenity);
    console.log('this.registerForm', this.registerForm);
    console.log('this.registerForm.get("safety")', this.registerForm.get('safety'));

    const existingAmenityIndex = (this.registerForm.get('safety') as FormArray).controls.findIndex((control: AbstractControl) =>
      control.value.title === this.selectedAmenityTitle
    );
    console.log('existingAmenityIndex', existingAmenityIndex);

    if (existingAmenityIndex > -1) {
      (this.registerForm.get('safety') as FormArray).at(existingAmenityIndex).patchValue({
        description: this.description,
        isFree: this.isFree,
        cost: this.isFree ? 0 : this.cost,
        category: this.selectedCategory
      });
    } else {
      (this.registerForm.get('safety') as FormArray).push(amenity);
      this.amenitiesArray.push(
        new Amenity(
          amenity.get('title').value,
          amenity.get('description').value,
          amenity.get('isFree').value,
          amenity.get('cost').value,
          amenity.get('category').value
        )
      );
    }

    console.log('this.registerForm', this.registerForm);

    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.isFree = false;
    this.cost = null;
    this.description = '';
    this.showOkButton = false;
  }

  closeShowModal() {
    this.showModal = false
    this.isFree = false;
    this.cost = null;
    this.description = '';
    this.showOkButton = false;
    this.general_amenities[this.selectedAmenity.index].status = false;
    (this.selectedAmenity.element.target as HTMLInputElement).checked = false;

  }

  isAmenitySelected(amenity: string): boolean {
    const amenitiesArray = this.registerForm.get('safety') as FormArray;
    return amenitiesArray.value.includes(amenity);
  }

  onToggleCost() {
    this.showOkButton = this.isFree || (this.cost !== null && this.cost > 0);
    if (this.isFree) {
      this.cost = null;
    }
  }

  onAmountChange() {
    this.showOkButton = this.cost !== null && this.cost > 0;
  }

  editAmenity(title: any) {
    // console.log(amenity, index);
    const amenity = this.amenitiesArray.find(x => x.title === title);
    console.log("Amenity:", amenity);
    this.selectedAmenityForEdit = amenity;
    this.selectedAmenityTitle = amenity.title;
    this.description = amenity.description || '';
    this.isFree = amenity.isFree || false;
    this.cost = amenity.cost !== undefined ? amenity.cost : null;
    this.selectedCategory = amenity.category;
    this.showModal = true;
    this.showOkButton = true;
  }


  onAmenityChange(amenity: any, index: number, event: any, cate: string) {
    console.log('Amenity Change Event Triggered');
    console.log('Amenity:', amenity);
    console.log('Index:', index);
    console.log('Event:', event);
    console.log('Category:', cate);
    this.modaldata = {
      index,
      description: amenity.description,
      title: amenity.title,
      cost: amenity.cost,
      isFree: amenity.isFree
    };
    console.log('Modal Data:', this.amenities);
    Object.keys(this.amenities).forEach((key) => {
      if (key == cate) {
        this.amenities[key][index].status = event.target.checked;
      }
    })
    // this.amenities[cate][index].status = event.target.checked;
    this.selectedAmenity = {
      index,
      group: cate,
      element: event
    };
    const isChecked = (event.target as HTMLInputElement).checked;
    const amenitiesArray = this.registerForm.get('safety') as FormArray;

    if (isChecked) {
      this.selectedAmenityTitle = amenity.title;
      this.selectedCategory = cate;
      this.showModal = true;
      console.log('Modal Not Opened');
    } else {
      console.log('Modal Opened');
      const confirmation = confirm(`Are you sure you want to delete the data for ${amenity.title}?`);
      if (confirmation) {
        const indexToRemove = amenitiesArray.controls.findIndex((x) => x.value.title === amenity.title);
        console.log('Index to Remove:', indexToRemove);

        if (indexToRemove > -1) {
          amenitiesArray.removeAt(indexToRemove);
          console.log('Amenity Removed from FormArray:', amenitiesArray);
        }

        this.showModal = false;
        console.log('Modal Closed');
      } else {
        event.target.checked = true;
        this.amenities[cate][index].status = true;

        console.log('Deletion Cancelled, Reverting Checkbox');
        console.log('Amenities after Reverting:', this.amenities);
      }
    }
  }

}