import { Route, Link } from 'react-router-dom';

export function FeatureReading() {
  return (
    <div>
      <h1>Welcome to FeatureReading!</h1>
      <ul>
        <li>
          <Link to="/">feature-reading root</Link>
        </li>
      </ul>
      <Route
        path="/"
        element={<div>This is the feature-reading root route.</div>}
      />
    </div>
  );
}

export default FeatureReading;
