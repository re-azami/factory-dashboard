import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { HistoryEntry } from '../../pages/history/models/history-entry';
import { HistoryService } from './history.service';

/**
 * Unit tests for HistoryService.
 *
 * HistoryService is a thin wrapper around GET /history?limit=N using Angular's
 * HttpClient, so we exercise it through HttpTestingController. No real network
 * traffic occurs — every request is intercepted and resolved synchronously.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: response body [] surfaces as an empty array
 *                                  observable; limit=0 still produces a well-formed URL.
 *  2. Boundary values            — covered: limit=5 (slider min), limit=100 (slider max),
 *                                  limit=200 (backend max).
 *  3. Persian / Unicode text     — covered: a Persian question + Persian answer in the
 *                                  response body round-trip through verbatim.
 *  4. Duplicate rows             — N/A: the service does not de-duplicate; it returns the
 *                                  response payload as-is. Duplicate handling lives in the
 *                                  component spec.
 *  5. Null DB columns            — covered: entries with null asked_at / answer / llm_provider /
 *                                  agent_mode / tool_calls survive the HTTP round-trip without
 *                                  being mangled.
 *  6. Calendar conversion        — N/A: the service passes asked_at through as an ISO string.
 *                                  No Jalali conversion is done here.
 *  7. Permission denials         — covered: a 401 response surfaces as an error observable.
 *  8. LLM provider switches      — N/A at the transport layer — the service treats the body
 *                                  opaquely. Component spec covers per-provider rendering.
 */
describe('HistoryService', () => {
    let service: HistoryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HistoryService, provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(HistoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // ── Request shape ────────────────────────────────────────────────────────

    it('issues a GET to `${apiBase}/history` with the supplied limit query param', () => {
        let received: HistoryEntry[] | undefined;
        service.list(20).subscribe((r) => (received = r));

        const req = httpMock.expectOne(
            (r) => r.url === `${environment.apiBase}/history` && r.method === 'GET',
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.url).toBe(`${environment.apiBase}/history`);
        expect(req.request.params.get('limit')).toBe('20');

        req.flush([]);

        expect(received).toEqual([]);
    });

    // ── Empty input ──────────────────────────────────────────────────────────

    it('passes through an empty array response as an empty list (empty-input edge case)', () => {
        let received: HistoryEntry[] | undefined;
        service.list(5).subscribe((r) => (received = r));

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=5`);
        req.flush([]);

        expect(received).toEqual([]);
        expect(received!.length).toBe(0);
    });

    // ── Boundary values ──────────────────────────────────────────────────────

    it('honors limit=5 (slider minimum)', () => {
        service.list(5).subscribe();

        const req = httpMock.expectOne(
            (r) => r.url === `${environment.apiBase}/history` && r.params.get('limit') === '5',
        );
        expect(req.request.params.get('limit')).toBe('5');
        req.flush([]);
    });

    it('honors limit=100 (slider maximum)', () => {
        service.list(100).subscribe();

        const req = httpMock.expectOne(
            (r) => r.url === `${environment.apiBase}/history` && r.params.get('limit') === '100',
        );
        expect(req.request.params.get('limit')).toBe('100');
        req.flush([]);
    });

    it('honors limit=200 (backend maximum, even though slider does not reach it)', () => {
        service.list(200).subscribe();

        const req = httpMock.expectOne(
            (r) => r.url === `${environment.apiBase}/history` && r.params.get('limit') === '200',
        );
        expect(req.request.params.get('limit')).toBe('200');
        req.flush([]);
    });

    it('stringifies a numeric zero into the params correctly (defensive boundary)', () => {
        service.list(0).subscribe();

        const req = httpMock.expectOne((r) => r.url === `${environment.apiBase}/history`);
        expect(req.request.params.get('limit')).toBe('0');
        req.flush([]);
    });

    // ── Persian / Unicode text round-trip ────────────────────────────────────

    it('preserves Persian question + Persian answer verbatim through the response body', () => {
        const persianQuestion = 'چند رکورد در دیتابیس داریم؟';
        const persianAnswer = 'در مجموع ۲۱۴ رکورد توقف ثبت شده است.';

        let received: HistoryEntry[] | undefined;
        service.list(20).subscribe((r) => (received = r));

        const fixture: HistoryEntry[] = [
            {
                id: 1,
                asked_at: '2026-05-19T08:30:00Z',
                question: persianQuestion,
                answer: persianAnswer,
                llm_provider: 'anthropic',
                tool_calls: null,
                agent_mode: 'simple',
            },
        ];

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=20`);
        req.flush(fixture);

        expect(received).toBeDefined();
        expect(received![0].question).toBe(persianQuestion);
        expect(received![0].answer).toBe(persianAnswer);
        // Codepoint-level confirmation: no normalization or transliteration.
        expect(Array.from(received![0].question).length).toBe(Array.from(persianQuestion).length);
        expect(Array.from(received![0].answer ?? '').length).toBe(Array.from(persianAnswer).length);
    });

    // ── Null DB columns survive the round-trip ───────────────────────────────

    it('preserves null asked_at / answer / llm_provider / agent_mode / tool_calls verbatim', () => {
        let received: HistoryEntry[] | undefined;
        service.list(10).subscribe((r) => (received = r));

        const fixture: HistoryEntry[] = [
            {
                id: 42,
                asked_at: null,
                question: 'q with all nulls',
                answer: null,
                llm_provider: null,
                tool_calls: null,
                agent_mode: null,
            },
        ];

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=10`);
        req.flush(fixture);

        expect(received).toBeDefined();
        const entry = received![0];
        expect(entry.id).toBe(42);
        expect(entry.asked_at).toBeNull();
        expect(entry.answer).toBeNull();
        expect(entry.llm_provider).toBeNull();
        expect(entry.tool_calls).toBeNull();
        expect(entry.agent_mode).toBeNull();
    });

    // ── Multi-entry payload ──────────────────────────────────────────────────

    it('passes a multi-entry payload through with order preserved', () => {
        let received: HistoryEntry[] | undefined;
        service.list(20).subscribe((r) => (received = r));

        const fixture: HistoryEntry[] = [
            {
                id: 1,
                asked_at: '2026-05-19T08:30:00Z',
                question: 'first',
                answer: 'a1',
                llm_provider: 'anthropic',
                tool_calls: [],
                agent_mode: 'simple',
            },
            {
                id: 2,
                asked_at: '2026-05-19T08:31:00Z',
                question: 'second',
                answer: 'a2',
                llm_provider: 'openai',
                tool_calls: [{ tool: 'execute_sql', input: { q: 'SELECT 1' }, output: { rows: [[1]] } }],
                agent_mode: 'deep',
            },
        ];

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=20`);
        req.flush(fixture);

        expect(received!.length).toBe(2);
        expect(received![0].id).toBe(1);
        expect(received![1].id).toBe(2);
        expect(received![1].tool_calls?.[0].tool).toBe('execute_sql');
    });

    // ── Permission denials ───────────────────────────────────────────────────

    it('surfaces a 401 Unauthorized response as an error observable', () => {
        let nextCalled = false;
        let errorReceived: HttpErrorResponse | undefined;

        service.list(20).subscribe({
            next: () => {
                nextCalled = true;
            },
            error: (err: HttpErrorResponse) => {
                errorReceived = err;
            },
        });

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=20`);
        req.flush({ detail: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

        expect(nextCalled).toBeFalse();
        expect(errorReceived).toBeDefined();
        expect(errorReceived!.status).toBe(401);
    });

    it('surfaces a 500 Internal Server Error as an error observable', () => {
        let nextCalled = false;
        let errorReceived: HttpErrorResponse | undefined;

        service.list(20).subscribe({
            next: () => {
                nextCalled = true;
            },
            error: (err: HttpErrorResponse) => {
                errorReceived = err;
            },
        });

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=20`);
        req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

        expect(nextCalled).toBeFalse();
        expect(errorReceived).toBeDefined();
        expect(errorReceived!.status).toBe(500);
    });

    // ── Calendar conversion ──────────────────────────────────────────────────

    it('passes asked_at through as a raw ISO string (no Jalali conversion in the service layer)', () => {
        // The history page renders dates via Angular's `date: medium` DatePipe — the
        // service itself does not transform asked_at. We just verify the round-trip.
        let received: HistoryEntry[] | undefined;
        service.list(20).subscribe((r) => (received = r));

        const iso = '2026-05-19T08:30:45.123Z';
        const fixture: HistoryEntry[] = [
            {
                id: 1,
                asked_at: iso,
                question: 'q',
                answer: null,
                llm_provider: null,
                tool_calls: null,
                agent_mode: null,
            },
        ];

        const req = httpMock.expectOne(`${environment.apiBase}/history?limit=20`);
        req.flush(fixture);

        expect(received![0].asked_at).toBe(iso);
    });
});
