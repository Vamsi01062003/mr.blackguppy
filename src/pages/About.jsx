import React from "react";
import "./about.css";

// Add your portrait to the public folder as about-ravi.jpg
const PHOTO_URL = "/about-ravi.jpg";
const INSTAGRAM_PROFILE =
  "https://www.instagram.com/mrblackguppy?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw==";
const YOUTUBE_CHANNEL =
  "https://youtube.com/@mrblackguppys?si=XT63SSkschhKb6nq";

export default function About() {
  return (
    <main className="ak-about-page">
      <section className="ak-about-layout">
        {/* LEFT: Ravi's introduction and journey */}
        <div className="ak-about-right">
          <div className="ak-about-overline">
            <span className="ak-about-overline-line" />
            ABOUT US
          </div>

          <h1 className="ak-about-title">
            Meet <em>Ravi Kumar.</em>
          </h1>

          <p className="ak-about-subtitle">The passion behind MR BLACK GUPPY</p>

          <div className="ak-about-story">
            <p className="ak-about-greeting">Hey guys, this is Ravi.</p>

            <p>
              Operating from our fish farm in Bhimavaram, I'm an experienced
              breeder and seller deeply passionate about the vibrant world of
              aquarium fish. What started as a personal fascination with aquatic
              life has grown into a dedicated journey of breeding healthy
              strains and sharing this wonderful hobby with fellow fish
              enthusiasts.
            </p>

            <p>
              Through Mr Black Guppy, I share my daily farming experiences,
              top-quality fish varieties, and breeding journey with our
              community. My aim is to bring aquarium lovers closer to the
              fascinating world beneath the water and help you build thriving
              aquariums.
            </p>
          </div>

          <div className="ak-about-signature">
            <span className="ak-signature-line" />
            <span>Ravi</span>
            <small>FOUNDER · MR BLACK GUPPY</small>
          </div>

          <div className="ak-about-social-section">
            <span className="ak-about-social-heading">FOLLOW THE JOURNEY</span>

            <div className="ak-about-social-links">
              <a
                href={YOUTUBE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="ak-about-social-link"
              >
                <span className="ak-social-symbol">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </span>
                <span className="ak-social-copy">
                  <strong>YouTube</strong>
                  <small>68 subscribers</small>
                </span>
                <span className="ak-social-arrow">↗</span>
              </a>

              <a
                href={INSTAGRAM_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="ak-about-social-link"
              >
                <span className="ak-social-symbol ak-instagram-symbol">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </span>
                <span className="ak-social-copy">
                  <strong>Instagram</strong>
                  <small>3.1K followers</small>
                </span>
                <span className="ak-social-arrow">↗</span>
              </a>
            </div>
          </div>

          <div className="ak-about-hours">
            <span className="ak-hours-indicator" />
            <span>BUSINESS HOURS</span>
            <strong>9:00 AM – 10:00 PM</strong>
          </div>
        </div>
        {/* RIGHT: Simple portrait — no frame or card */}
        <div className="ak-about-photo-column">
          <img
            src={PHOTO_URL}
            alt="Ravi Kumar, founder of Mr Black Guppy"
            loading="lazy"
            className="ak-about-portrait"
          />
          <p className="ak-photo-caption">
            Behind every healthy fish is a passion for the hobby.
          </p>
        </div>
      </section>
    </main>
  );
}
