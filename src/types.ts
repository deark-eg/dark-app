export type Language = 'ar' | 'en';

export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'unavailable';

export type PropertyType = 'apartment' | 'villa' | 'duplex' | 'commercial' | 'student_male' | 'student_female';

export type ServiceCategory = 'student_housing' | 'family_rentals' | 'property_sales' | 'maintenance_services';

export interface Property {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  location_ar: string;
  location_en: string;
  price: number; // monthly or total price
  type: PropertyType;
  category: 'student_housing' | 'family_rentals' | 'property_sales';
  status: PropertyStatus;
  imageUrls: string[];
  rooms?: number;
  bathrooms?: number;
  area: number; // in square meters
  beds?: number; // for student housing
  amenities_ar: string[];
  amenities_en: string[];
  priceLabel_ar?: string;
  priceLabel_en?: string;
  videoUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapIframe?: string;
  airConditioned?: boolean;
}

export interface CustomerRegistration {
  id: string;
  fullName: string;
  phoneNumber: string;
  serviceType: string;
  createdAt: string;
  deviceType: string;
  language: Language;
  governorate?: string;
}

export interface ServiceRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  category: string;
  details: string;
  createdAt: string;
}

export interface Review {
  id: string;
  fullName: string;
  rating: number;
  comment: string;
  createdAt: string;
  propertyId?: string;
}

export interface MaintenanceService {
  id: string;
  category: 'plumbing' | 'electricity' | 'carpenter' | 'ac' | 'painting' | 'ceramic';
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  rating: number;
  image: string;
}
