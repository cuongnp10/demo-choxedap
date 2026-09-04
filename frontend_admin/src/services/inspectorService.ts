import api from '../lib/api';

export interface InspectionRequest {
  id: number;
  postingId: number;
  postingTitle: string;
  location: string;
  requestedDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  // Detailed fields
  acceptedAt?: string;
  completedAt?: string;
  externalInspectionLink?: string;
  record?: InspectionRecordDto;
  bicycleSpecs?: BicycleSpecsDto;
  mediaUrls?: string[];
  cancelReason?: string;
}

export interface InspectionReport {
  id: number;
  inspectionRequestId?: number | null;
  userReportId?: number | null;
  inspectorId?: number | null;
  result: 'TRUE' | 'FALSE' | string;
  comments?: string | null;
  cancelReason?: string | null;
  inspectedAt?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  inspectionVideoUrl?: string | null;
  attachmentUrlsJson?: string | null;
  
  // Derived / Included fields from Backend DTO
  status?: string | null;
  location?: string | null;
  requestedDate: string;
  externalInspectionLink?: string | null;
  userReportDescription?: string | null;
  userReportEvidence?: string[] | null;
  order?: OrderSummaryDto | null;
  bicycleSpecs?: BicycleSpecsDto | null;
  mediaUrls?: string[] | null;
}

export interface OrderSummaryDto {
  id: number;
  postingId: number;
  postingTitle?: string | null;
}

export interface InspectionRecordDto {
  result: 'PASSED' | 'FAILED' | string;
  comments?: string | null;
  inspectedAt: string;
  validUntil: string;
  inspectionVideoRecordUrl?: string | null;
  createdAt: string;
}

export interface BicycleSpecsDto {
  brandName?: string | null;
  categoryName?: string | null;
  model?: string | null;
  year?: number | null;
  condition?: string | null;
  frameSize?: string | null;
  frameMaterial?: string | null;
  brakeType?: string | null;
  color?: string | null;
  drivetrain?: string | null;
  wheelset?: string | null;
}

export interface SubmitReportDto {
  result: 'PASSED' | 'FAILED' | 'TRUE' | 'FALSE' | string;
  comments: string;
  inspectionVideoUrl?: string;
  inspectedAt: string;
  validUntil: string;
}

const inspectorService = {
  getInspections: async (status: string) => {
    const response = await api.get(`/inspector/inspections?status=${status}`);
    return response.data;
  },

  getInspectionDetail: async (id: number) => {
    const response = await api.get(`/inspector/inspections/${id}`);
    return response.data;
  },

  acceptInspection: async (id: number, externalInspectionLink: string) => {
    const response = await api.post(`/inspector/inspections/${id}/accept`, {
      externalInspectionLink,
    });
    return response.data;
  },

  submitReport: async (id: number, dto: SubmitReportDto) => {
    const response = await api.post(`/inspector/inspections/${id}/submit`, dto);
    return response.data;
  },

  cancelInspection: async (id: number, reason: string) => {
    const response = await api.post(`/inspector/inspections/${id}/cancel`, {
      reason,
    });
    return response.data;
  },

  // ORDER-linked InspectionReport endpoints
  getInspectionReports: async (status: string) => {
    const response = await api.get(`/inspector/inspections/reports?status=${status}`);
    return response.data;
  },

  acceptInspectionReport: async (reportId: number, externalInspectionLink?: string) => {
    const response = await api.post(`/inspector/inspections/reports/${reportId}/accept`, {
      externalInspectionLink: externalInspectionLink || null,
    });
    return response.data;
  },

  submitInspectionReport: async (reportId: number, dto: SubmitReportDto) => {
    const response = await api.post(`/inspector/inspections/reports/${reportId}/submit`, dto);
    return response.data;
  },

  cancelInspectionReport: async (reportId: number, reason: string) => {
    const response = await api.post(`/inspector/inspections/reports/${reportId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // Admin helper: open inspection for a posting from a report
  openInspectionFromReport: async (reportId: number, postingId: number) => {
    const response = await api.post(`/admin/reports/${reportId}/open-inspection`, null, { params: { postingId } });
    return response.data;
  },

  resolveTechnicalDispute: async (id: number, verdict: string) => {
    const response = await api.post(`/admin/reports/${id}/suggest-resolution`, { verdict });
    return response.data;
  }
};

export default inspectorService;
