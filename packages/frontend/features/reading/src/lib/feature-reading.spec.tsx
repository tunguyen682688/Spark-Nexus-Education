import { render } from '@testing-library/react';

import FeatureReading from './feature-reading';

describe('FeatureReading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureReading />);
    expect(baseElement).toBeTruthy();
  });
});
