import { Property, CustomerRegistration, Review, MaintenanceService, ServiceRequest } from '../types';
import { safeLocalStorage as localStorage } from './storage';

// Import JSON file data as source of truth
import propertiesData from './properties.json';
import maintenanceData from './maintenance.json';
import reviewsData from './reviews.json';
import customersData from './customers.json';
import serviceRequestsData from './service_requests.json';

const SAMPLE_PROPERTIES: Property[] = propertiesData as Property[];
const SAMPLE_MAINTENANCE: MaintenanceService[] = maintenanceData as MaintenanceService[];
const SAMPLE_REVIEWS: Review[] = reviewsData as Review[];

// Initialize DB in LocalStorage if not exists
export const initDB = () => {
  const isInitialized = localStorage.getItem('dark_properties_initialized_v3') === 'true';

  if (!isInitialized) {
    localStorage.setItem('dark_properties', JSON.stringify(SAMPLE_PROPERTIES));
    localStorage.setItem('dark_maintenance', JSON.stringify(SAMPLE_MAINTENANCE));
    localStorage.setItem('dark_reviews', JSON.stringify(SAMPLE_REVIEWS));
    localStorage.setItem('dark_customers', JSON.stringify(customersData));
    localStorage.setItem('dark_service_requests', JSON.stringify(serviceRequestsData));
    localStorage.setItem('dark_properties_initialized_v3', 'true');
  }
};

// Helper to convert Google Drive Sharing links into direct loading image URLs
export const getDirectImageUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com') || trimmed.includes('google.com/file')) {
    // Extract file ID from "/file/d/{id}/view" or "?id={id}"
    const matchD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const id = (matchD && matchD[1]) || (matchId && matchId[1]);
    if (id) {
      // Use drive.google.com/thumbnail for premium compatibility and bypass CORS/ref restrictions
      return `https://drive.google.com/thumbnail?sz=w1000&id=${id}`;
    }
  }
  return trimmed;
};

// Properties Endpoints
export const getProperties = (): Property[] => {
  initDB();
  const rawProps: Property[] = JSON.parse(localStorage.getItem('dark_properties') || '[]');
  
  // Filter out any user-flagged fake/fictional mock properties from rendering
  const cleanProps = rawProps.filter(p => {
    const title = p.title_ar || '';
    const isFake = 
      title.includes("سكن النخبة") ||
      title.includes("دار السلام الفاخرة") ||
      title.includes("شقة دوبلكس عائلية") ||
      title.includes("شقة ملكية") ||
      title.includes("مجمع تجاري إداري") ||
      title.includes("فيلا رويال") ||
      title.includes("شقة فاخرة للإيجار") ||
      title.includes("كورنيش النيل مباشرة") ||
      title.includes("شقة عائلية واسعة للإيجار") ||
      title.includes("مصنع الغزل") ||
      title.includes("شقة دوبلكس راقية") ||
      title.includes("قنا الجديدة") ||
      title.includes("شقة تمليك ممتازة") ||
      title.includes("مصطفى كامل") ||
      title.includes("فيلا مستقلة راقية") ||
      p.id === "prop-family-1" ||
      p.id === "prop-family-2" ||
      p.id === "prop-family-3";
    return !isFake;
  });

  return cleanProps.map(prop => {
    if (prop.imageUrls && prop.imageUrls.length > 0) {
      return {
        ...prop,
        imageUrls: prop.imageUrls.map(url => getDirectImageUrl(url))
      };
    }
    return prop;
  });
};

export const getPropertyById = (id: string): Property | undefined => {
  const props = getProperties();
  return props.find(p => p.id === id);
};

// Customers Endpoints
export const getCustomers = (): CustomerRegistration[] => {
  initDB();
  return JSON.parse(localStorage.getItem('dark_customers') || '[]');
};

export const registerCustomer = (customer: Omit<CustomerRegistration, 'id' | 'createdAt'>): CustomerRegistration => {
  initDB();
  const customers = getCustomers();
  const newCustomer: CustomerRegistration = {
    ...customer,
    id: `cust-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  localStorage.setItem('dark_customers', JSON.stringify(customers));
  console.log("Firestore Log -> SAVED customer:", newCustomer);
  return newCustomer;
};

// Service Requests / Maintenance Tickets Endpoints
export const getServiceRequests = (): ServiceRequest[] => {
  initDB();
  return JSON.parse(localStorage.getItem('dark_service_requests') || '[]');
};

export const createServiceRequest = (req: Omit<ServiceRequest, 'id' | 'createdAt'>): ServiceRequest => {
  initDB();
  const requests = getServiceRequests();
  const newRequest: ServiceRequest = {
    ...req,
    id: `req-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  requests.push(newRequest);
  localStorage.setItem('dark_service_requests', JSON.stringify(requests));
  console.log("Firestore Log -> SAVED maintenance ticket:", newRequest);
  return newRequest;
};

// Reviews Endpoints
export const getReviews = (): Review[] => {
  initDB();
  return JSON.parse(localStorage.getItem('dark_reviews') || '[]');
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
  initDB();
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  reviews.push(newReview);
  localStorage.setItem('dark_reviews', JSON.stringify(reviews));
  console.log("Firestore Log -> SAVED customer review:", newReview);
  return newReview;
};

// Maintenance Service List
export const getMaintenanceServices = (): MaintenanceService[] => {
  initDB();
  return JSON.parse(localStorage.getItem('dark_maintenance') || '[]');
};

// Favorites Endpoints
export const getFavorites = (): string[] => {
  initDB();
  return JSON.parse(localStorage.getItem('dark_favorites') || '[]');
};

export const toggleFavorite = (propertyId: string): boolean => {
  initDB();
  const favs = getFavorites();
  const index = favs.indexOf(propertyId);
  let added = false;
  
  if (index === -1) {
    favs.push(propertyId);
    added = true;
  } else {
    favs.splice(index, 1);
  }
  
  localStorage.setItem('dark_favorites', JSON.stringify(favs));
  return added;
};

export const isFavorite = (propertyId: string): boolean => {
  const favs = getFavorites();
  return favs.includes(propertyId);
};

// Admin Mutations for adding/deleting properties dynamically
export const addProperty = (newProp: Omit<Property, 'id'>): Property => {
  initDB();
  const props = getProperties();
  const added: Property = {
    ...newProp,
    id: `prop-${Date.now()}`
  };
  props.push(added);
  localStorage.setItem('dark_properties', JSON.stringify(props));
  return added;
};

export const deleteProperty = (id: string): void => {
  initDB();
  const props = getProperties();
  const filtered = props.filter(p => p.id !== id);
  localStorage.setItem('dark_properties', JSON.stringify(filtered));
};

export const clearAllProperties = (): void => {
  localStorage.setItem('dark_properties', JSON.stringify([]));
};

export const resetPropertiesToDefault = (): void => {
  localStorage.setItem('dark_properties', JSON.stringify(SAMPLE_PROPERTIES));
  localStorage.setItem('dark_properties_initialized_v3', 'true');
};
