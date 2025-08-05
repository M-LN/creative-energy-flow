import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders social battery dashboard', () => {
  render(<App />);
  const titleElement = screen.getByText(/Social Battery Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});
