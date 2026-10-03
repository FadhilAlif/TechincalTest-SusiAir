import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { DataService } from '../data/data.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let dataService: DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, DataService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    dataService = module.get<DataService>(DataService);
    dataService.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return documents with server-computed urgency and badgeColor', () => {
    const res = service.getDocuments();
    expect(res.today).toBe('2026-05-15');
    expect(res.documents.length).toBeGreaterThan(0);

    for (const doc of res.documents) {
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('label');
      expect(doc).toHaveProperty('expiryDate');
      expect(doc).toHaveProperty('daysRemaining');
      expect(['safe', 'soon', 'expired']).toContain(doc.urgency);
      expect(['#1FBF8F', '#F59E0B', '#E63757']).toContain(doc.badgeColor);

      // Verify urgency logic against 15 May 2026
      if (doc.daysRemaining <= 0) {
        expect(doc.urgency).toBe('expired');
        expect(doc.badgeColor).toBe('#E63757');
      } else if (doc.daysRemaining <= res.warningDays) {
        expect(doc.urgency).toBe('soon');
        expect(doc.badgeColor).toBe('#F59E0B');
      } else {
        expect(doc.urgency).toBe('safe');
        expect(doc.badgeColor).toBe('#1FBF8F');
      }
    }
  });

  it('should identify Security Clearance as expired on 15 May 2026', () => {
    const res = service.getDocuments();
    const securityDoc = res.documents.find((d) => d.id === 'doc_security');
    expect(securityDoc).toBeDefined();
    expect(securityDoc.expiryDate).toBe('2026-05-01');
    expect(securityDoc.daysRemaining).toBe(-14);
    expect(securityDoc.urgency).toBe('expired');
    expect(securityDoc.badgeColor).toBe('#E63757');
  });
});
