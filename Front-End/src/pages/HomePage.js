import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard"; 
import "../Styles/HomePage.css";

const HomePage = ({ categories, products, onAddToCart }) => {
  // Slice to show only the first 8 products as "Featured"
  const featuredProducts = (products || []).slice(0, 8);

  return (
    <Container fluid className="home-container p-0">
      {/* Hero Section */}
      <div className="home-hero mb-5">
        <div className="hero-content">
          <h2>FRESH GROCERIES ONLINE</h2>
          <Link to="/products">
            <button className="home-shop-btn">SHOP NOW</button>
          </Link>
        </div>
      </div>

      {/* Category Section */}
      <section id="categories" className="category-section mb-5">
        <Container>
          <h2 className="home-section-title mb-4 text-start text-success fw-bold">
            Shop by Categories
          </h2>
          {/* g-2 reduces the gap to make 4 items fit nicely */}
          <Row className="g-2 justify-content-center">
            {(categories || []).map((cat) => (
              // xs={3} ensures 4 items per row on mobile
              <Col key={cat.id} xs={3} sm={3} md={3} lg={2}>
                <CategoryCard category={cat} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="product-section mb-5">
        <Container>
          <h2 className="home-section-title mb-4 text-start text-success fw-bold">
            Featured Products
          </h2>
          <Row className="g-2">
            {featuredProducts.map((product) => (
              // xs={3} ensures 4 items per row on mobile
              <Col key={product.id} xs={3} sm={3} md={3} lg={3}>
                <ProductCard product={product} onAddToCart={onAddToCart} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default HomePage;