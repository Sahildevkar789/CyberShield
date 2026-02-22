function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <strong>CyberShield AI</strong>
          <span> — AI-Powered Cybersecurity Intelligence</span>
        </div>
        <div className="app-footer-details">
          <p>Developer: Sahil Devkar · Full Stack + Cybersecurity Engineer</p>
          <p>Version v1.0.0 · {year} · All rights reserved.</p>
          <p className="app-footer-links">
            <a href="https://www.linkedin.com/in/sahil-devkar-917906290/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span> · </span>
            <a href="https://github.com/sahildevkar789" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span> · </span>
            <a href="mailto:Sahildevkar789@gmail.com">Contact</a>
          </p>
        </div>
        <div className="app-footer-space" />
      </div>
    </footer>
  );
}

export default Footer;
