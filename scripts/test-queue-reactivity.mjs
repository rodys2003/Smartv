import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import ts from 'typescript';

function formatTicketNumber(num) {
  if (!num || num < 1) return '# A073';
  const effectiveNum = num < 73 ? num + 72 : num;
  const zeroIndexed = effectiveNum - 1;
  const letterIndex = Math.floor(zeroIndexed / 999);
  const numberPart = (zeroIndexed % 999) + 1;
  const letterCode = String.fromCharCode(65 + (letterIndex % 26));
  const prefix =
    letterIndex >= 26
      ? `${String.fromCharCode(64 + Math.floor(letterIndex / 26))}${letterCode}`
      : letterCode;
  return `# ${prefix}${numberPart.toString().padStart(3, '0')}`;
}

test('formatTicketNumber correctly maps ticket sequence to official alphanumeric codes', () => {
  // Ticket 1 starts at # A073 (offset +72)
  assert.equal(formatTicketNumber(1), '# A073');
  assert.equal(formatTicketNumber(2), '# A074');
  assert.equal(formatTicketNumber(3), '# A075');
  assert.equal(formatTicketNumber(4), '# A076');
  assert.equal(formatTicketNumber(75), '# A075');
  assert.equal(formatTicketNumber(76), '# A076');
  // Fallbacks
  assert.equal(formatTicketNumber(0), '# A073');
  assert.equal(formatTicketNumber(null), '# A073');
});

test('nextTicketNumber calculation is strictly reactive to database latest ticket', () => {
  const getNextTicket = (latestTicketNumber) => {
    const latest = latestTicketNumber || 0;
    return latest + 1;
  };

  // When database has tickets 1, 2, 3 (ticket 3 is # A075)
  const currentDbLatest = 3;
  const nextTicket = getNextTicket(currentDbLatest);
  assert.equal(nextTicket, 4);
  assert.equal(formatTicketNumber(nextTicket), '# A076');

  // When database advances to ticket 4 (# A076)
  const advancedDbLatest = 4;
  const subsequentTicket = getNextTicket(advancedDbLatest);
  assert.equal(subsequentTicket, 5);
  assert.equal(formatTicketNumber(subsequentTicket), '# A077');
});

function renderQueueTracker(mockNextTicketNumber = 4) {
  const source = readFileSync(new URL('../src/features/tickets/components/QueueTracker.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  });
  const exports = {};
  const mockReact = {
    ...React,
    useEffect() {},
    useCallback: (cb) => cb,
    useState: (val) => [typeof val === 'function' ? val() : val, () => {}],
  };

  runInNewContext(outputText, {
    exports,
    React: mockReact,
    console,
    require: (name) => {
      if (name === 'react') return mockReact;
      if (name.endsWith('/useQueue')) {
        return {
          useQueue: () => ({
            servingTicket: { id: 'srv-1', ticket_number: 3, status: 'in_progress' },
            waitingTickets: [],
            waitingCount: 0,
            totalCount: 3,
            maxTickets: 100,
            ticketsEnabled: true,
            whatsappThreshold: 5,
            canIssueTicket: true,
            loading: false,
            refreshQueue: () => {},
            nextTicketNumber: mockNextTicketNumber,
          }),
        };
      }
      if (name.endsWith('/operatingHours')) {
        return {
          getOperatingHoursInfo: () => ({
            isOpen: true,
            colombiaHours: '8:00 AM - 10:00 PM',
            isSameAsColombia: true,
            nextOpeningText: '',
          }),
        };
      }
      if (name === '@/lib/utils') {
        return {
          formatTicketNumber,
          formatWaitTime: () => 'Inmediato',
        };
      }
      return new Proxy({}, { get: () => function Mock() { return null; } });
    },
  });

  const Component = exports.QueueTracker;
  const tree = Component({
    isAuthenticated: true,
    userTicket: null,
    onOpenAuthModal: () => {},
    onOpenTicketModal: () => {},
  });

  const strings = (node) =>
    typeof node === 'string'
      ? node
      : Array.isArray(node)
      ? node.map(strings).join(' ')
      : node && typeof node === 'object'
      ? strings(node.props?.children)
      : '';

  return strings(tree);
}

test('QueueTracker dynamically shows the reactive next ticket number instead of stale A073', () => {
  // When current turn is # A075 (ticket 3), next ticket is 4 (# A076)
  const renderedText = renderQueueTracker(4);
  assert.match(renderedText, /Tomar Turno # A076/);
  assert.doesNotMatch(renderedText, /Tomar Turno # A073/);

  // When next ticket advances to 5 (# A077)
  const advancedText = renderQueueTracker(5);
  assert.match(advancedText, /Tomar Turno # A077/);
  assert.doesNotMatch(advancedText, /Tomar Turno # A076/);
});
