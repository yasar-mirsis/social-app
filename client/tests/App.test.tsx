import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<App />);
    });

    it('should display the main header', () => {
      render(<App />);
      const header = screen.getByText(/social app/i);
      expect(header).toBeInTheDocument();
    });

    it('should display welcome message', () => {
      render(<App />);
      const welcomeMessage = screen.getByText(/welcome to the social application/i);
      expect(welcomeMessage).toBeInTheDocument();
    });

    it('should have correct className structure', () => {
      render(<App />);
      const appElement = screen.getByRole('banner');
      expect(appElement.className).toContain('App');
      expect(appElement.className).toContain('App-header');
    });

    it('should render h1 and p elements', () => {
      render(<App />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1.tagName).toBe('H1');

      const p = screen.getByText(/welcome to the social application/i);
      expect(p.tagName).toBe('P');
    });
  });

  describe('Component Structure', () => {
    it('should have correct component hierarchy', () => {
      const { container } = render(<App />);
      const appHeader = container.querySelector('.App-header');
      expect(appHeader).toBeInTheDocument();
    });

    it('should render children within the App component', () => {
      render(<App />);
      const appElement = document.querySelector('.App');
      expect(appElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<App />);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should have visible text content', () => {
      render(<App />);
      const visibleText = screen.getAllByText(/social app/i);
      expect(visibleText.length).toBeGreaterThan(0);
    });
  });
});
