export type LeadStatus = 'New' | 'Contacted' | 'Follow-up' | 'Test Ride Scheduled' | 'Hot Lead' | 'Quotation Sent' | 'Booking Done' | 'Lost' | 'Closed';
export type PurchaseTimeline = 'Immediate' | 'Within 1 month' | '1-3 months' | '3-6 months' | 'Just exploring';
export type BudgetRange = 'Under 60k' | '60-80k' | '80k-1L' | '1L-1.5L' | 'Above 1.5L';
export type LeadSource = 'Website' | 'Facebook' | 'Instagram' | 'Google' | 'Walk-in' | 'Reference' | 'Others';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TaskType = 'Call' | 'Meeting' | 'Test Ride' | 'Send Quotation' | 'Document Collection';
export type TaskStatus = 'Pending' | 'Completed' | 'Overdue';

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  email?: string;
  city: string;
}

export interface VehicleInterest {
  modelId?: string; // Links to Vehicle.id
  modelName: string;
  variantName?: string;
  colorName?: string;
  budgetRange?: BudgetRange;
}

export interface InquiryTask {
  id: string;
  inquiryId: string;
  type: TaskType;
  dueDate: string; // ISO string
  notes?: string;
  status: TaskStatus;
}

export interface CommunicationLog {
  id: string;
  inquiryId: string;
  timestamp: string; // ISO string
  type: 'Call' | 'Email' | 'WhatsApp' | 'SMS' | 'Meeting' | 'Note';
  summary: string;
  author: string; // E.g., Sales Exec name
}

export interface Inquiry {
  id: string;
  date: string; // ISO string
  customer: CustomerDetails;
  interest: VehicleInterest;
  timeline?: PurchaseTimeline;
  exchangeRequired: boolean;
  financeRequired: boolean;
  testRideRequested: boolean;
  source: LeadSource;
  
  // Admin/Sales fields
  status: LeadStatus;
  priority: PriorityLevel;
  assignedTo?: string; // Sales Exec ID/Name
  
  tasks: InquiryTask[];
  history: CommunicationLog[];
}
