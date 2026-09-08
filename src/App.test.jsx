import { render, screen } from '@testing-library/react';
import Loading from './components/Loading';

test('renders an accessible loading state', () => {
  render(<Loading />);
  expect(screen.getByRole('status')).toHaveTextContent('Загрузка...');
});
