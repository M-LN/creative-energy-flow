import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Creative Energy Flow header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Creative Energy Flow/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders energy tracking description', () => {
  render(<App />);
  const descriptionElement = screen.getByText(/Track and visualize your energy patterns/i);
  expect(descriptionElement).toBeInTheDocument();
});
