import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { BASE_TODAY } from '../common/constants';

export type DocumentUrgency = 'safe' | 'soon' | 'expired';

export interface ProcessedDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  urgency: DocumentUrgency;
  badgeColor: string; // Hex color: green (#10B981 / #1FBF8F), amber (#F59E0B), red (#E63757 / #EF4444)
}

function parseDateUTC(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function differenceInDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateUTC(dateStr1);
  const d2 = parseDateUTC(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

@Injectable()
export class DocumentsService {
  constructor(private readonly dataService: DataService) {}

  getDocuments() {
    const data = this.dataService.getDocumentsData();
    const warningDays = data?.thresholds?.warningDays ?? 30;
    const documents = data?.documents || [];

    const processedDocuments: ProcessedDocument[] = documents.map((doc) => {
      const daysRemaining = differenceInDays(doc.expiryDate, BASE_TODAY);

      let urgency: DocumentUrgency = 'safe';
      let badgeColor = '#1FBF8F'; // Brand Success Green

      if (daysRemaining <= 0) {
        urgency = 'expired';
        badgeColor = '#E63757'; // Brand Danger Red
      } else if (daysRemaining <= warningDays) {
        urgency = 'soon';
        badgeColor = '#F59E0B'; // Brand Warning Amber
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        urgency,
        badgeColor,
      };
    });

    return {
      today: BASE_TODAY,
      warningDays,
      documents: processedDocuments,
    };
  }
}
