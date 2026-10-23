const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');

console.log('Testing cursor.js runtime simulation in headless DOM...');

// Mock browser window and document
const listeners = {};
const elements = [];

global.window = {
  matchMedia: (query) => {
    return {
      matches: query.includes('pointer: fine') && !query.includes('prefers-reduced-motion: reduce')
    };
  },
  addEventListener: (event, handler, options) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(handler);
  },
  removeEventListener: (event, handler) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(h => h !== handler);
    }
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id)
};
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;

const mockBody = {
  classList: {
    classes: new Set(),
    add: function(c) { this.classes.add(c); },
    remove: function(c) { this.classes.delete(c); },
    contains: function(c) { return this.classes.has(c); }
  },
  appendChild: (child) => {
    elements.push(child);
    child.parentNode = mockBody;
  },
  removeChild: (child) => {
    const idx = elements.indexOf(child);
    if (idx !== -1) elements.splice(idx, 1);
    child.parentNode = null;
  }
};

global.document = {
  body: mockBody,
  readyState: 'complete',
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      setAttribute: () => {},
      parentNode: null
    };
  },
  addEventListener: (event, handler) => {
    listeners['doc_' + event] = listeners['doc_' + event] || [];
    listeners['doc_' + event].push(handler);
  }
};

// Load cursor.js
const cursorCode = fs.readFileSync(path.join(rootDir, 'cursor.js'), 'utf8');
eval(cursorCode);

console.log('Injected elements into body:', elements.map(e => e.className));
console.log('Body classes after init:', Array.from(mockBody.classList.classes));

// Check elements created
if (!mockBody.classList.contains('cursor-active')) {
  console.error('FAIL: body does not have cursor-active class');
  process.exit(1);
}
if (elements.length !== 2) {
  console.error('FAIL: Expected 2 elements (dot, ring), found:', elements.length);
  process.exit(1);
}

// Simulate pointermove
if (listeners.pointermove && listeners.pointermove.length > 0) {
  listeners.pointermove[0]({ clientX: 300, clientY: 200, pointerType: 'mouse' });
  console.log('PASS: pointermove handled without errors');
}

// Simulate pointerover interactive button
if (listeners.doc_pointerover && listeners.doc_pointerover.length > 0) {
  listeners.doc_pointerover[0]({
    target: {
      closest: (sel) => sel.includes('button') ? true : null
    }
  });
  console.log('Body classes after hover:', Array.from(mockBody.classList.classes));
  if (!mockBody.classList.contains('cursor-hover')) {
    console.error('FAIL: cursor-hover class not added');
    process.exit(1);
  }
  console.log('PASS: cursor-hover activated on interactive hover');
}

// Simulate touchstart teardown
if (listeners.touchstart && listeners.touchstart.length > 0) {
  listeners.touchstart[0]();
  console.log('Body classes after touchstart teardown:', Array.from(mockBody.classList.classes));
  console.log('Remaining elements after teardown:', elements.length);
  if (elements.length !== 0) {
    console.error('FAIL: Elements not removed on touchstart');
    process.exit(1);
  }
  console.log('PASS: Touchstart cleaned up DOM and active classes successfully');
}

console.log('ALL RUNTIME SIMULATION CHECKS PASSED PERFECTLY!');
