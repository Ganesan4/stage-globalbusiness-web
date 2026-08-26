import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebService } from '../services/web.service';
import { spec } from 'node:test/reporters';
import { Amenity } from './model/Amenity';
import { stat } from 'node:fs';
import { 
  general_amenities, hospitality, 
  health, business_services,
  entertainment, safety,
  location_specific, eco_friendly, 
  additional_features, } from './data/amenities';
import { group } from 'node:console';
import { title } from 'node:process';

@Component({
  selector: 'app-allbusiness',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './allbusiness.component.html',
  styleUrl: './allbusiness.component.scss'
})
export class AllbusinessComponent {
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
  transactionSuccessStripe :boolean = false;
  data: any;
  payments: any;
  response:any;
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
  transactionSuccess: boolean=false;
  transactionSuccessPaypal: boolean=false;
  showValidationPayment: boolean=false;
  responseregister: any;
  details: any;
  // showsuccessmessage: boolean=false;
  user_id: string;
  myallbusinessdata: any;
  logoUrl: string;

  amenitiesArray: [Amenity]
  selectedAmenity: {index: number, group: string, element: any} = {
    index: 0,
    group: '',
    element: {}
  };
  
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
    ...general_amenities,
    ...hospitality,
    ...health,
    ...business_services,
    ...entertainment,
    ...safety,
    ...location_specific,
    ...eco_friendly,
    ...additional_features
  ];
  modaldata: any = {};
  
  // showsuccess: string;

  constructor(private fb: FormBuilder,private http: HttpClient, private web: WebService) {
   
    this.registerForm = this.fb.group({
      category: ['', Validators.required],
      description: ['', Validators.required],
      products_services: ['', Validators.required],
      fax: [''],
      start_date: [''],
      website: [''],
      annual_sales: [''],
      pricing: [''],
      safety: this.fb.array([]),
      industry: [''],
      operating_hours: [''],  
      location_details: [''],
      service_areas: [''],
      target_market: [''],
      social_media_links: [''],
      certifications: [''],
      client_testimonials: [''],
      market_positioning: [''],
      global_reach: [''],
      news_updates: [''],
      Promotions: [''],
      networking_opportunities: [''],
      visual_content: [''],
      community_involvement: [''],
      faq: [''],
      call_to_action: [''],
      mobile_friendly_features: [''],
      legal_information: [''],
      uvp: [''],
      multilingual_support: [''],
      customer_satisfaction: [''],
      employee_satisfaction: [''],
      sustainability_practices: [''],
      social_impact_scores: [''],
      operational_transparency: [''],
      industry_comparisons: [''],
      usp_analysis: [''],
      case_studies: [''],
      community_engagement: [''],
      visual_interactive: [''],
      user_generated_qa: [''],
      dynamic_pricing: [''],
      expert_opinions: [''],
      crisis_management: [''],
    },
   );
  }


  ngOnInit(): void {
    this.user_id = localStorage.getItem('userId');
    console.log("User id:", this.user_id);
    if(this.user_id){
      this.myallbusiness();
    }
  }

  isChecked(amenity: string): boolean {
    let data = this.amenitiesArray?.filter(item => item.title === amenity)
    return data?.length > 0;
  }

  async onallbusinessSubmit() { 
    console.log(this.registerForm.value, this.user_id);  
    if (this.registerForm.valid) {
      const response = await this.web.postData('editallbusiness', {form: this.registerForm.value, id: this.user_id});

        if(response.status) {
          console.log('Registration successful');
          this.showNotification('updated successfully!', 'success');
          this.myallbusiness();       
        }
        else {
          this.showNotification('Failed to update my profile. Please try again.', 'error');
        } 
    
    } else {
      console.log('Form is invalid');
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

  async myallbusiness(){
    try{
      const res = await this.web.postData('myallbusiness',{"userid":this.user_id})
      console.log("responsemy:",res)
      if(res.status){
        this.myallbusinessdata = JSON.parse(res.message)
        console.log("this.myallbusinessdata",this.myallbusinessdata);
        this.amenitiesArray = this.myallbusinessdata.safety
        console.log("amenitiesArray", this.amenitiesArray);
        
        this.amenitiesArray.forEach((amenity, index) => {
          let updatedAmenity = this.fb.group({
            title: amenity.title,
            description: amenity.description,
            isFree: amenity.isFree,
            cost: amenity.cost, 
            category: amenity.category
          });
          (this.registerForm.get('safety') as FormArray).push(updatedAmenity);
        })

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
          Promotions: this.myallbusinessdata.Promotions == "NULL" ? "" : this.myallbusinessdata.Promotions,
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
        });
      }
    } catch(err){
      console.log(err)
    }
  
  }

  // onOk() {
  //   const amenity = this.fb.group({
  //     title: this.selectedAmenityTitle,
  //     description: this.description,
  //     isFree: this.isFree,
  //     cost: this.isFree ? 0 : this.cost, 
  //     category: this.selectedCategory
  //   });
    
  //   (this.registerForm.get('safety') as FormArray).push(amenity);
  
  //   console.log(this.registerForm);

  //   this.closeModal();
  // }
  onOk() {
    const amenity = this.fb.group({
      title: this.selectedAmenityTitle,
      description: this.description,
      isFree: this.isFree,
      cost: this.isFree ? 0 : this.cost, 
      category: this.selectedCategory
    });
  
    const existingAmenityIndex = (this.registerForm.get('safety') as FormArray).controls.findIndex((control: AbstractControl) =>
      control.value.title === this.selectedAmenityTitle
    );
  
    if (existingAmenityIndex > -1) {
      (this.registerForm.get('safety') as FormArray).at(existingAmenityIndex).patchValue({
        description: this.description,
        isFree: this.isFree,
        cost: this.isFree ? 0 : this.cost,
        category: this.selectedCategory
      });
    } else {
      (this.registerForm.get('safety') as FormArray).push(amenity);
    }
  
    console.log(this.registerForm);
  
    this.closeModal();
  }  

  closeModal() {
    this.showModal = false;
    this.isFree = false;        
    this.cost = null;           
    this.description = '';      
    this.showOkButton = false;  
  }

  closeShowModal(){
    this.showModal = false
    this.isFree = false;        
    this.cost = null;           
    this.description = '';      
    this.showOkButton = false; 
    // (this.registerForm.get('amenities') as FormArray).removeAt(index)
    this.general_amenities[this.selectedAmenity.index].status = false;
    (this.selectedAmenity.element.target as HTMLInputElement).checked = false;

  }

  isAmenitySelected(amenity: string): boolean {
    const amenitiesArray = this.registerForm.get('safety') as FormArray;
    return amenitiesArray.value.includes(amenity);  
  }

  onAmenityClick(title: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const amenitiesArray = this.registerForm.get('safety') as FormArray;

    if (isChecked) {
      amenitiesArray.push(new FormControl(title)); 
      this.selectedAmenityTitle = title; 
      this.showModal = true; 
    } else {
      const index = amenitiesArray.controls.findIndex(x => x.value === title); 
      if (index > -1) {
        amenitiesArray.removeAt(index); 
      }
      this.showModal = false; 
    }
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
    this.selectedAmenityTitle = amenity.title;
    this.description = amenity.description || '';
    this.isFree = amenity.isFree || false;
    this.cost = amenity.cost !== undefined ? amenity.cost : null;
    this.showModal = true;
    this.showOkButton = true;
  }


  onAmenityChange(amenity: any, index: number, event: any, cate: string) {
    console.log('Amenity Change Event Triggered');
    console.log('Amenity:', amenity);
    console.log('Index:', index);
    console.log('Event Target Checked:', event.target.checked);
    console.log('Category:', cate);
  
    this.modaldata = {
      index,
      description: amenity.description,
      title: amenity.title,
      cost: amenity.cost,
      isFree: amenity.isFree
    };
  
    console.log('Modal Data:', this.modaldata);
  
    this.amenities[index].status = event.target.checked;
    console.log('Updated Amenities Status:', this.amenities);
  
    this.selectedAmenity = {
      index,
      group: cate,
      element: event
    };
  
    console.log('Selected Amenity:', this.selectedAmenity);
  
    const isChecked = (event.target as HTMLInputElement).checked;
    const amenitiesArray = this.registerForm.get('safety') as FormArray;
  
    console.log('Is Checked:', isChecked);
    console.log('Current FormArray:', amenitiesArray);
  
    if (isChecked) {
      this.selectedAmenityTitle = amenity.title;
      this.selectedCategory = cate;
      this.showModal = true;
  
      console.log('Modal Opened for Amenity:', amenity.title);
    } else {
      const confirmation = confirm(`Are you sure you want to delete the data for ${amenity.title}?`);
      console.log('Deletion Confirmation:', confirmation);
  
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
        this.amenities[index].status = true;
  
        console.log('Deletion Cancelled, Reverting Checkbox');
        console.log('Amenities after Reverting:', this.amenities);
      }
    }
  }  
  
}