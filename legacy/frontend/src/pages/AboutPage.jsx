import React from 'react';
import { FaAward, FaUsers, FaShieldAlt, FaRocket } from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>About Zenca Gamers</h1>
            <p>
              We're passionate gamers dedicated to providing the ultimate gaming experience
              through premium products, exceptional service, and unbeatable value.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2020, Zenca Gamers started as a small group of gaming enthusiasts
                who couldn't find the quality products and service they deserved. We decided
                to change that by creating a gaming store that puts gamers first.
              </p>
              <p>
                Today, we're proud to serve thousands of gamers worldwide, offering carefully
                curated products from trusted brands, expert advice, and unparalleled customer
                support. Our mission is simple: to enhance your gaming experience with gear
                that performs as well as you do.
              </p>
            </div>
            <div className="story-image">
              <img src="/images/about-story.jpg" alt="Our team" />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2>Why Choose Us?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3>Premium Quality</h3>
              <p>
                We only carry products from reputable brands that meet our high standards
                for performance and reliability.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Expert Support</h3>
              <p>
                Our team of gaming experts is here to help you find the perfect gear and
                answer any questions you have.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <FaShieldAlt />
              </div>
              <h3>Trusted Service</h3>
              <p>
                With thousands of satisfied customers and a 4.9-star rating, you can shop
                with confidence at Zenca Gamers.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <FaRocket />
              </div>
              <h3>Fast Delivery</h3>
              <p>
                Get your gaming gear quickly with our fast, reliable shipping options
                and free delivery on orders over $50.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Products Sold</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src="/images/team-alex.jpg" alt="Alex Johnson" />
              </div>
              <h3>Alex Johnson</h3>
              <p className="member-role">Founder & CEO</p>
              <p className="member-bio">
                Competitive gamer turned entrepreneur with 15+ years of gaming experience.
              </p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src="/images/team-sarah.jpg" alt="Sarah Chen" />
              </div>
              <h3>Sarah Chen</h3>
              <p className="member-role">Head of Product</p>
              <p className="member-bio">
                Tech enthusiast ensuring we carry the latest and greatest gaming gear.
              </p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src="/images/team-mike.jpg" alt="Mike Rodriguez" />
              </div>
              <h3>Mike Rodriguez</h3>
              <p className="member-role">Customer Success Manager</p>
              <p className="member-bio">
                Dedicated to making sure every customer has an amazing experience.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Level Up?</h2>
            <p>
              Join thousands of gamers who trust Zenca Gamers for their gaming needs.
              Start shopping today and experience the difference.
            </p>
            <a href="/shop" className="btn btn-primary btn-large">
              Shop Now
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;