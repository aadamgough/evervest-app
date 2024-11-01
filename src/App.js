import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <head>

      </head>
      <body class="body">
        <div id="grain" className="title-container" style={{ position: "relative", overflow: "hidden" }}></div>
        <div class="navbar w-nav">
          <div class="nav-container w-container">
            <a class="logo w-nav-brand w--current">
              <div class="name-text">
                <h1>Evervest FP</h1>
              </div>
            </a>
            <nav role="navigation" class="nav-menu w-nav-menu">
              <div class="nav-div-left">
                <h2 href= "google.com" class="nav-text-link">Our Story</h2>
                <h2 href= "google.com" class="nav-text-link">Our Team</h2>
                <h2 href= "google.com" class="nav-text-link">Contact Us</h2>
              </div>
            </nav>
          </div>
          <div class="w-nav-overlay"></div>
        </div>
        <section class="hero-wrapper">
          <div class="hero-div">
            <p class="hero-text">
                Evervest Financial Planning
            </p>
            <a class="word">
              Empower your future sustainably.
            </a>
          </div>
        </section>
        <div class="email-pass-container">

        </div>
        <div class="sign-log-in-container">

        </div>
        <div class="socials-container">

        </div>
    </body>
    </div>
  );
}

export default App;
