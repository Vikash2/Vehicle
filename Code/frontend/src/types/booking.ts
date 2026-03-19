export type AccessoryCategory = 'Safety' | 'Convenience' | 'Protection' | 'Aesthetics';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  category: AccessoryCategory;
  price: number; // Includes GST
  image?: string;
  compatibleModels: string[]; // Array of model IDs, or 'all'
  inStock: boolean;
  installationCharges: number;
}

export type BookingStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Documentation In-Progress' 
  | 'Stock Allocated' 
  | 'Payment Pending' 
  | 'Payment Complete' 
  | 'RTO Processing' 
  | 'PDI Scheduled' 
  | 'Ready for Delivery' 
  | 'Delivered' 
  | 'Cancelled';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Financed';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  type: 'Booking Amount' | 'Balance Payment' | 'Accessory Addition';
}

export interface DocumentStatus {
  aadharCard: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
  addressProof: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
  passportPhotos: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
}

export interface BookingCustomer {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  emergencyContact: string;
}

export interface SelectedVehicleConfig {
  modelId: string;
  variantId: string;
  colorName: string;
}

export interface PricingBreakdown {
  exShowroom: number;
  rtoTotal: number;
  insuranceTotal: number;
  accessoriesTotal: number;
  otherChargesTotal: number;
  onRoadPrice: number;
}

export interface Booking {
  id: string;
  date: string;
  customer: BookingCustomer;
  vehicleConfig: SelectedVehicleConfig;
  selectedAccessories: string[]; // Array of Accessory IDs
  pricing: PricingBreakdown;
  payments: PaymentRecord[];
  
  // Computed values:
  bookingAmountPaid: number;
  balanceDue: number;
  
  preferredDeliveryDate?: string;
  specialInstructions?: string;
  
  status: BookingStatus;
  documents: DocumentStatus;
  
  assignedTo?: string; // Sales Executive
  chassisNumber?: string; // Allocated later
  cancellationReason?: string;
}
