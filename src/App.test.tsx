import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  const { container } = render(<App />);
  // Just ensure the app renders without throwing errors
  expect(container).toBeInTheDocument();
});
