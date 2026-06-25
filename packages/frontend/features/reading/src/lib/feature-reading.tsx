import { Route, Link, Routes } from 'react-router-dom';

export function FeatureReading() {
  return (
    <div>
      <h1>Welcome to FeatureReading!</h1>
      <ul>
        <li>
          <Link to="/">feature-reading root</Link>
        </li>
      </ul>
      <Routes>
        <Route
          path="/"
          element={<div>This is the feature-reading root route.</div>}
        />
      </Routes>
    </div>
  );
}

export default FeatureReading;
