import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

describe('Join Event (smoke)', () => {
  it('renders app without crashing', async () => {
    render(<App />);
    expect(true).toBe(true);
  });
});


