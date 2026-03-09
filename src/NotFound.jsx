import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>We couldn't find that page, but you can head back home and continue your registration journey.</p>
        <Link to="/" className="notfound-btn">
          Go back home
        </Link>
      </div>
    </div>
  );
}
