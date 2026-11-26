import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Collection from "./Collection";
import Notifications from "./Notifications";
import PlantsAccessories from "./Plants&Accessories";
import About from "./About";
import Contact from "./Contact";

import "./home.css";

export default function Home() {
  const collectionRef = useRef(null);
  const notificationsRef = useRef(null);
  const plantsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to requested section from Navbar or external links
  useEffect(() => {
    const sectionId = location.state?.scrollToSection;
    if (!sectionId) return;

    const sectionRefs = {
      notifications: notificationsRef,
      "notifications-section": notificationsRef,
      collection: collectionRef,
      "fish-collection": collectionRef,
      "plants-accessories": plantsRef,
      "plants-accessories-section": plantsRef,
      about: aboutRef,
      "about-section": aboutRef,
      contact: contactRef,
      "contact-section": contactRef,
    };

    const targetRef = sectionRefs[sectionId];
    if (!targetRef) return;

    const timer = window.setTimeout(() => {
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location, navigate]);

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="home-page">
      {/* Hero section */}
      <section
        id="home"
        className="hero-exact"
        aria-label="Mr Black Guppy homepage"
      >
        <img
          src="/home_background.webp"
          alt="Mr Black Guppy aquarium"
          className="hero-background"
          draggable="false"
        />

        {/* Explore Collection Button */}
        <button
          type="button"
          className="hero-explore-btn"
          onClick={scrollToCollection}
          aria-label="Explore Collection"
        >
          <span>Explore Collection</span>
          <span className="hero-explore-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </section>

      {/* Offer announcement and featured products — after hero */}
      <section ref={notificationsRef} id="notifications-section" className="home-notifications-section">
        <Notifications />
      </section>

      {/* Fish collection */}
      <section
        ref={collectionRef}
        id="fish-collection"
        className="home-collection-section"
      >
        <Collection />
      </section>

      {/* Plants and accessories */}
      <section
        ref={plantsRef}
        id="plants-accessories-section"
        className="home-plants-section"
      >
        <PlantsAccessories />
      </section>

      {/* About */}
      <section ref={aboutRef} id="about-section" className="home-visit-section">
        <About />
      </section>

      {/* Contact */}
      <section
        ref={contactRef}
        id="contact-section"
        className="home-contact-section"
      >
        <Contact />
      </section>
    </main>
  );
}
