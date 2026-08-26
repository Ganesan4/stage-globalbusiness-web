export interface BranchMapMarker {
    branch: Branch;
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    options: {
      animation: google.maps.Animation;
    };
    click?: () => void;
  }

  export interface Branch {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    state: string;
    city: string;
    postCode: string;
  }