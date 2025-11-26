import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { calculateSellingPrice } from '../utils/PricingUtils';
import '../Styles/Checkout.css';

const Checkout = ({ showAlert, products = [], setProducts, handleResetFilters }) => {
  const { cartItems, selectedItems, selectedSubtotal, removeSelectedItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const validCartItems = Array.isArray(cartItems) ? cartItems : [];
  const validSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];
  const itemsToCheckout = validCartItems.filter(item => validSelectedItems.includes(item.id));

  const subtotal = selectedSubtotal || 0;
  const shippingFee = 50.0;
  const total = subtotal + shippingFee;

  const handleShowConfirmOrderModal = () => setShowConfirmOrderModal(true);
  const handleCloseConfirmOrderModal = () => setShowConfirmOrderModal(false);

  const handleConfirmOrderPlacement = () => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      if (showAlert) showAlert('No items to checkout.', 'warning');
      return;
    }

    let stockSufficient = true;
    const updatedProducts = products.map(prod => {
      const ordered = itemsToCheckout.find(item => item.id === prod.id);
      if (ordered) {
        const availableStock = parseInt(prod.stock) || 0;
        const orderedQty = parseInt(ordered.quantity) || 0;

        if (orderedQty > availableStock) {
          stockSufficient = false;
          if (showAlert) showAlert(`Not enough stock for ${prod.name}. Only ${availableStock} left.`, 'danger');
        }

        return { ...prod, stock: Math.max(availableStock - orderedQty, 0) };
      }
      return prod;
    });

    if (!stockSufficient) {
      handleCloseConfirmOrderModal();
      return;
    }

    if (typeof setProducts === 'function') {
      setProducts(updatedProducts);
    }
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    setOrderDetails({
      items: itemsToCheckout,
      subtotal,
      shipping: shippingFee,
      total,
      paymentMethod
    });

    if (showAlert) showAlert('Order placed successfully!', 'success');
    removeSelectedItems();
    if (handleResetFilters) handleResetFilters(); 
    setOrderPlaced(true);
    handleCloseConfirmOrderModal();
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    let isFormValid = form.checkValidity();

    if (paymentMethod === 'cod') {
      const requiredFields = form.querySelectorAll('[required]:not([id^="cc-"])');
      isFormValid = true;
      requiredFields.forEach(field => {
        if (!field.checkValidity()) isFormValid = false;
      });
      const paymentMethodSelected = form.querySelector('input[name="paymentMethod"]:checked');
      if (!paymentMethodSelected) {
          isFormValid = false;
      }
    }

    setValidated(true);
    if (isFormValid) handleShowConfirmOrderModal();
  };

  if (!orderPlaced && itemsToCheckout.length === 0) {
    return (
      <Container className="my-5 text-center">
        <h2>No Items Selected for Checkout</h2>
        <p className="lead text-muted">Please go back to your cart and select the items you wish to purchase.</p>
        <Button variant="outline-primary" onClick={() => navigate('/cart')} className="mt-3">
          <i className="bi bi-arrow-left me-2"></i>Back to Cart
        </Button>
      </Container>
    );
  }

  if (orderPlaced && orderDetails) {
    return (
      <Container className="my-3 my-md-5 checkout-container">
        <div className="order-receipt">
          <h2 className="text-success mb-3" style={{fontSize: '1.5rem'}}>
            <i className="bi bi-check-circle-fill me-2"></i>Success!
          </h2>
          <p className="mb-2">Order Placed.</p>
          <hr />
          <h5 className="text-start">Summary:</h5>
          <ListGroup variant="flush" className="mb-3 text-start bg-transparent">
            {orderDetails.items?.map(item => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between px-0 bg-transparent py-1">
                <span style={{fontSize: '0.9rem'}}>{item.name} (x{item.quantity})</span>
                <span style={{fontSize: '0.9rem'}}>₱{(calculateSellingPrice(item.price, item.discount) * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
            <ListGroup.Item className="d-flex justify-content-between px-0 bg-transparent">
              <span>Shipping</span>
              <span>₱{orderDetails.shipping.toFixed(2)}</span>
            </ListGroup.Item>
          </ListGroup>
          <div className="d-flex justify-content-between h5 mb-3">
            <strong>Total:</strong>
            <strong>₱{orderDetails.total.toFixed(2)}</strong>
          </div>
          <Button variant="primary" onClick={() => navigate('/')} className="mt-2 w-100">
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="my-3 my-md-5 checkout-container">
        <h2 className="checkout-title mb-4">Checkout</h2>
        
        <Row className="g-4">
          {/* Form Column */}
          <Col lg={7}>
            <h4 className="mb-3 section-title">Shipping & Payment</h4>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <h5 className="mb-2 text-muted" style={{fontSize: '1rem'}}>Address</h5>
              
              <Row className="g-2">
                <Form.Group as={Col} xs={6} controlId="firstName" className="mb-3">
                  <Form.Label>First name</Form.Label>
                  <Form.Control required type="text" placeholder="Juan" size="sm" />
                </Form.Group>
                <Form.Group as={Col} xs={6} controlId="lastName" className="mb-3">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control required type="text" placeholder="Dela Cruz" size="sm" />
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Address</Form.Label>
                <Form.Control placeholder="1234 Main St" required size="sm" />
                <Form.Control.Feedback type="invalid">Address required.</Form.Control.Feedback>
              </Form.Group>

              <Row className="g-2">
                <Form.Group as={Col} xs={6} controlId="city" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" placeholder="Cabuyao" required size="sm" />
                </Form.Group>
                <Form.Group as={Col} xs={6} controlId="zip" className="mb-3">
                  <Form.Label>Zip</Form.Label>
                  <Form.Control type="text" placeholder="4025" required pattern="[0-9]{4,5}" size="sm" />
                </Form.Group>
              </Row>

              <hr className="my-3" />

              <h5 className="mb-3 text-muted" style={{fontSize: '1rem'}}>Payment</h5>
              <div className="mb-3">
                <Form.Check type="radio" id="paymentCard" name="paymentMethod" label="Card" value="card"
                  checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} required />
                <Form.Check type="radio" id="paymentCod" name="paymentMethod" label="COD" value="cod"
                  checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} required />
              </div>

              {paymentMethod === 'card' && (
                <div className="p-3 bg-light rounded mb-3 border">
                  <Form.Group className="mb-2" controlId="cc-name">
                    <Form.Label>Cardholder</Form.Label>
                    <Form.Control type="text" required={paymentMethod === 'card'} size="sm" />
                  </Form.Group>
                  <Form.Group className="mb-2" controlId="cc-number">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control type="text" required={paymentMethod === 'card'} pattern="\d{13,16}" size="sm" placeholder="XXXX-XXXX-XXXX-XXXX"/>
                  </Form.Group>
                  <Row className="g-2">
                    <Form.Group as={Col} xs={6} controlId="cc-expiration">
                      <Form.Label>Exp (MM/YY)</Form.Label>
                      <Form.Control type="text" placeholder="MM/YY" required={paymentMethod === 'card'}
                        pattern="(0[1-9]|1[0-2])\/?([0-9]{2})" size="sm" />
                    </Form.Group>
                    <Form.Group as={Col} xs={6} controlId="cc-cvv">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control type="text" placeholder="123" required={paymentMethod === 'card'} pattern="\d{3,4}" size="sm" />
                    </Form.Group>
                  </Row>
                </div>
              )}

              <Button variant="success" size="lg" type="submit" className="w-100 mt-2">
                Place Order
              </Button>
            </Form>
          </Col>

          <Col lg={5}>
            <Card className="checkout-summary-card">
              <Card.Header as="h6" className="bg-white py-3">
                Order Summary
              </Card.Header>
              <Card.Body className="p-3">
                <ListGroup variant="flush">
                  {itemsToCheckout.map(item => {
                    const sellingPrice = calculateSellingPrice(item.price, item.discount);
                    const validQuantity = parseInt(item.quantity) || 0;
                    return (
                      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center px-0 py-2 border-bottom">
                        <div className="d-flex align-items-center" style={{overflow: 'hidden'}}>
                            <img src={item.imageUrl || '/img/placeholder.png'} alt={item.name} className="summary-item-image flex-shrink-0" />
                            <div className="summary-item-details ms-2">
                              <span className="fw-bold d-block text-truncate" style={{maxWidth: '140px'}}>{item.name}</span>
                              <small className="text-muted">x{validQuantity}</small>
                            </div>
                        </div>
                        <span className="text-nowrap ms-2 fw-bold" style={{fontSize: '0.9rem'}}>₱{(sellingPrice * validQuantity).toFixed(2)}</span>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
                
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Subtotal</small>
                    <small>₱{subtotal.toFixed(2)}</small>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <small>Shipping</small>
                    <small>₱{shippingFee.toFixed(2)}</small>
                  </div>
                  <div className="d-flex justify-content-between h6 mb-0 text-success pt-2 border-top">
                    <strong>Total</strong>
                    <strong>₱{total.toFixed(2)}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showConfirmOrderModal} onHide={handleCloseConfirmOrderModal} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          Place order for <strong>{validSelectedItems.length} item(s)</strong>? <br/>
          Total: <strong className="text-success">₱{total.toFixed(2)}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleCloseConfirmOrderModal}>Cancel</Button>
          <Button variant="success" size="sm" onClick={handleConfirmOrderPlacement}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Checkout;