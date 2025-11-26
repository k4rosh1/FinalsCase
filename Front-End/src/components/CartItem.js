import React, { useContext } from 'react';
import { Row, Col, Image, Button, Form } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { calculateSellingPrice } from '../utils/PricingUtils'; // Import pricing util
import '../Styles/CartItem.css'; 

const CartItem = ({ item }) => {
  const {
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    selectedItems,
    toggleSelectItem
  } = useContext(CartContext);

  if (!item) {
      console.error("CartItem received undefined item prop");
      return null;
  }

  const isSelected = selectedItems.includes(item.id);

  // --- Handlers ---
  const handleRemove = () => {
      if (window.confirm(`Are you sure you want to remove ${item.name} from your cart?`)) {
        removeFromCart(item.id);
      }
  };

  const handleDecrease = () => {
      if (item.quantity === 1) {
          handleRemove();
      } else {
        decreaseQuantity(item.id);
      }
  };

  const handleIncrease = () => {
      const currentQuantity = item.quantity || 0;
      const stock = item.stock || 0;

      if (currentQuantity + 1 > stock) {
          alert(`Cannot add more than ${stock} units of ${item.name}.`);
          return;
      }

      increaseQuantity(item.id);
  };
  // ---------------------------------

  const quantity = item.quantity || 0;
  // Use the utility to calculate price consistently
  const sellingPrice = calculateSellingPrice(item.price, item.discount);

  return (
    <Row className="align-items-center cart-item-row g-0"> 
      {/* 1. Left: Checkbox & Image */}
      <Col xs={4} md={2} className="d-flex align-items-center">
        <Form.Check
          type="checkbox"
          id={`select-item-${item.id}`}
          checked={isSelected}
          onChange={() => toggleSelectItem(item.id)}
          aria-label={`Select ${item.name}`}
          className="me-2"
        />
        <div className="cart-item-img-wrapper">
            <Image src={item.imageUrl || '/img/placeholder.png'} alt={item.name} fluid rounded />
        </div>
      </Col>

      {/* 2. Middle: Info */}
      <Col xs={4} md={4} className="ps-2">
        <h5 className="cart-item-name text-truncate" title={item.name}>{item.name}</h5> 
        <p className="cart-item-unit-price mb-0">₱{sellingPrice.toFixed(2)}</p> 
      </Col>

      {/* 3. Right: Actions (Qty, Total, Remove) */}
      <Col xs={4} md={6}>
        <div className="cart-item-actions d-flex flex-column flex-md-row align-items-end align-items-md-center justify-content-md-between">
            
            {/* Qty Controls */}
            <div className="qty-controls d-flex align-items-center mb-1 mb-md-0">
                <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleDecrease}>-</Button>
                <span className="qty-val mx-2">{quantity}</span>
                <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleIncrease}>+</Button>
            </div>

            {/* Total Price */}
            <strong className="cart-item-total mb-1 mb-md-0 mx-md-3">₱{(quantity * sellingPrice).toFixed(2)}</strong> 
            
            {/* Remove Link */}
            <div onClick={handleRemove} className="cart-item-remove text-danger" role="button">
                <small>Remove</small>
            </div>
        </div>
      </Col>
    </Row>
  );
};

export default CartItem;