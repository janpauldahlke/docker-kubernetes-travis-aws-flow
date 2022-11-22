import { render, screen } from '@testing-library/react';
import App from './App';

test('the simple truth', () => {
  expect(true).toBeTruthy();
});


test('renders the Headline', () => {
  render(<App />);
  const headline = screen.getByText(/Hello World/i);;
  expect(headline).toBeInTheDocument();
});


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/we deploy, cuz we can/i);
  expect(linkElement).toBeInTheDocument();
});
