import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import CategoryFilter from '../components/CategoryFilter';
import '../Styles/ProductList.css';

const ProductList = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  currentPage,
  productsPerPage,
  setCurrentPage
}) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category');
    if (categoryIdFromUrl) {
      onSelectCategory(parseInt(categoryIdFromUrl));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [setCurrentPage, selectedCategory]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = (products || []).slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="my-5">
      <div className="product-list-container">
        <h3 className="product-list-title">All Products</h3>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        
        {/* Reduced gap (g-2) to fit 4 items better on small screens */}
        <Row className="g-2 mt-3">
          {currentProducts.map(product => (
            // xs={3} forces 4 items per row (12/3 = 4)
            <Col key={product.id} xs={3} sm={3} md={3} lg={3}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </Col>
          ))}
        </Row>
        
        <Pagination 
          itemsPerPage={productsPerPage} 
          totalItems={(products || []).length} 
          currentPage={currentPage} 
          paginate={paginate} 
        />
      </div>
    </Container>
  );
};

export default ProductList;