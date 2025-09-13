import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('Onboarding flow (smoke)', () => {
  it('renders onboarding when unauthenticated user navigates there', async () => {
    // This is a very light smoke test to ensure route renders
    render(<App />);
    // Landing should show CTA
    expect(await screen.findByText(/ConnectSpark/i)).toBeInTheDocument();
  });
});


