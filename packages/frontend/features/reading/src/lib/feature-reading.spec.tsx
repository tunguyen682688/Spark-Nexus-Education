import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import FeatureReading from './feature-reading';

describe('FeatureReading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <FeatureReading />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
