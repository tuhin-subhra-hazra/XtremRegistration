import "./loader.css";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="loader-spinner" />
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
}
