
import React, { useState, useEffect } from 'react';
import './Medicine.css';
import { FaStar, FaStarHalfAlt, FaShoppingCart, FaCheck, FaArrowRight, FaDolly } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

import medicineImg1 from '../asset/Med1.jpg';
import medicineImg2 from '../asset/Med2.jpg';
import medicineImg3 from '../asset/Med3.jpg';
import medicineImg4 from '../asset/Med4.jpg';
import medicineImg5 from '../asset/Med5.jpg';
import medicineImg6 from '../asset/Med6.jpg';
import medicineImg7 from '../asset/Med7.jpg';
import medicineImg8 from '../asset/Med8.jpg';
import medicineImg9 from '../asset/Med9.jpg';
import medicineImg10 from '../asset/Med10.jpg';
import medicineImg11 from '../asset/Med11.jpg';
import medicineImg12 from '../asset/Med12.jpg';
import medicineImg13 from '../asset/Med13.jpg';
import medicineImg14 from '../asset/Med14.jpg';
import medicineImg15 from '../asset/Med15.jpg';
import medicineImg16 from '../asset/Med16.jpg';
import medicineImg17 from '../asset/Med17.jpg';
import medicineImg18 from '../asset/Med18.jpg';
import medicineImg19 from '../asset/Med19.jpg';
import medicineImg20 from '../asset/Med20.jpg';
import medicineImg21 from '../asset/Med21.jpg';
import medicineImg22 from '../asset/Med22.jpg';
import medicineImg23 from '../asset/Med23.jpg';
import medicineImg24 from '../asset/Med24.jpg';
import medicineImg25 from '../asset/Med25.jpg';
import medicineImg26 from '../asset/Med26.jpg';
import medicineImg27 from '../asset/Med27.jpg';
import medicineImg28 from '../asset/Med28.jpg';
import medicineImg29 from '../asset/Med29.jpg';
import medicineImg30 from '../asset/Med30.jpg';

export default function Medicine() {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedItems, setAddedItems] = useState({});
  const [showMoveToCart, setShowMoveToCart] = useState({});

  const medicineSlider = [
    {
      id: 1,
      image: medicineImg1,
      title: "Antibiotics",
      description: "Used to treat bacterial infections by preventing bacteria from reproducing or by destroying them. Common conditions treated include strep throat, urinary tract infections, and certain types of pneumonia."
    },
    {
      id: 2,
      image: medicineImg2,
      title: "Pain Relievers",
      description: "Medications that reduce or relieve headaches, muscle aches, arthritis, or other aches and pains. Common types include NSAIDs (like ibuprofen), acetaminophen, and prescription opioids for severe pain."
    },
    {
      id: 3,
      image: medicineImg3,
      title: "Antihistamines",
      description: "These medicines block the action of histamine, a substance in the body that can cause allergy symptoms such as sneezing, itching, runny nose, and watery eyes. They're used to treat seasonal allergies and allergic reactions."
    }
  ];
  const medicineProducts = [
    {
      id: 1,
      image: medicineImg1,
      title: "Antibiotics",
      description: "Broad-spectrum antibiotics for bacterial infections",
      price: 29.99,
      rating: 4.5
    },
    {
      id: 2,
      image: medicineImg2,
      title: "Pain Relievers",
      description: "Effective pain relief medication",
      price: 19.99,
      rating: 4.8
    },
    {
      id: 3,
      image: medicineImg3,
      title: "Antihistamines",
      description: "Relief from allergies and cold symptoms",
      price: 24.99,
      rating: 4.2
    },
    {
      id: 4,
      image: medicineImg4,
      title: "Anti-inflammatory",
      description: "Reduce inflammation and swelling",
      price: 34.99,
      rating: 4.6
    },
    {
      id: 5,
      image: medicineImg5,
      title: "Vitamins & Supplements",
      description: "Essential nutrients for better health",
      price: 39.99,
      rating: 4.7
    },
    {
      id: 6,
      image: medicineImg6,
      title: "Digestive Health",
      description: "Support for digestive system",
      price: 27.99,
      rating: 4.4
    },
    {
      id: 7,
      image: medicineImg7,
      title: "Respiratory Care",
      description: "Relief for respiratory conditions",
      price: 31.99,
      rating: 4.5
    },
    {
      id: 8,
      image: medicineImg8,
      title: "Cardiovascular Health",
      description: "Support for heart health",
      price: 45.99,
      rating: 4.8
    },
    {
      id: 9,
      image: medicineImg9,
      title: "Diabetes Management",
      description: "Blood sugar control medication",
      price: 42.99,
      rating: 4.6
    },
    {
      id: 10,
      image: medicineImg10,
      title: "Mental Health",
      description: "Support for mental well-being",
      price: 38.99,
      rating: 4.7
    },
    {
      id: 11,
      image: medicineImg11,
      title: "Skin Care",
      description: "Treatment for skin conditions",
      price: 33.99,
      rating: 4.5
    },
    {
      id: 12,
      image: medicineImg12,
      title: "Eye Care",
      description: "Vision health products",
      price: 29.99,
      rating: 4.4
    },
    {
      id: 13,
      image: medicineImg13,
      title: "Bone Health",
      description: "Support for bone strength",
      price: 36.99,
      rating: 4.6
    },
    {
      id: 14,
      image: medicineImg14,
      title: "Immune Support",
      description: "Boost your immune system",
      price: 32.99,
      rating: 4.7
    },
    {
      id: 15,
      image: medicineImg15,
      title: "Sleep Aid",
      description: "Natural sleep support",
      price: 28.99,
      rating: 4.3
    },
    {
      id: 16,
      image: medicineImg16,
      title: "Joint Health",
      description: "Support for joint mobility",
      price: 41.99,
      rating: 4.6
    },
    {
      id: 17,
      image: medicineImg17,
      title: "Thyroid Support",
      description: "Thyroid health management",
      price: 35.99,
      rating: 4.5
    },
    {
      id: 18,
      image: medicineImg18,
      title: "Liver Health",
      description: "Liver support supplements",
      price: 37.99,
      rating: 4.4
    },
    {
      id: 19,
      image: medicineImg19,
      title: "Kidney Health",
      description: "Kidney function support",
      price: 39.99,
      rating: 4.6
    },
    {
      id: 20,
      image: medicineImg20,
      title: "Hormone Balance",
      description: "Hormonal health support",
      price: 43.99,
      rating: 4.7
    },
    {
      id: 21,
      image: medicineImg21,
      title: "Prostate Health",
      description: "Men's health support",
      price: 46.99,
      rating: 4.5
    },
    {
      id: 22,
      image: medicineImg22,
      title: "Women's Health",
      description: "Women's wellness products",
      price: 44.99,
      rating: 4.6
    },
    {
      id: 23,
      image: medicineImg23,
      title: "Children's Health",
      description: "Pediatric healthcare products",
      price: 25.99,
      rating: 4.8
    },
    {
      id: 24,
      image: medicineImg24,
      title: "Elder Care",
      description: "Senior health support",
      price: 47.99,
      rating: 4.7
    },
    {
      id: 25,
      image: medicineImg25,
      title: "Sports Nutrition",
      description: "Athletic performance support",
      price: 49.99,
      rating: 4.6
    },
    {
      id: 26,
      image: medicineImg26,
      title: "Weight Management",
      description: "Healthy weight support",
      price: 33.99,
      rating: 4.5
    },
    {
      id: 27,
      image: medicineImg27,
      title: "Dental Care",
      description: "Oral health products",
      price: 27.99,
      rating: 4.4
    },
    {
      id: 28,
      image: medicineImg28,
      title: "Hair Care",
      description: "Hair health products",
      price: 31.99,
      rating: 4.6
    },
    {
      id: 29,
      image: medicineImg29,
      title: "Nail Health",
      description: "Nail care products",
      price: 24.99,
      rating: 4.3
    },
    {
      id: 30,
      image: medicineImg30,
      title: "First Aid",
      description: "Emergency care products",
      price: 29.99,
      rating: 4.7
    }
  ];
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="star-icon" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="star-icon" />);
    }

    return stars;
  };
  useEffect(() => {
    const itemsInCart = {};
    cartItems.forEach(item => {
      itemsInCart[item.id] = true;
    });
    setAddedItems(itemsInCart);
  }, [cartItems]);
  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
  };
  const handleMoveToCart = () => {
    navigate('/cart');
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prevSlide => 
        prevSlide === medicineSlider.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
  const goToNextSlide = () => {
    setCurrentSlide(prevSlide => 
      prevSlide === medicineSlider.length - 1 ? 0 : prevSlide + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentSlide(prevSlide => 
      prevSlide === 0 ? medicineSlider.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="medicine-container">
      <h1 className="medicine-title">PharmaCart</h1>
      <div className="medicine-slider">
        <button className="prev-btn slider-btn" onClick={goToPrevSlide}>&#10094;</button>
        
        {medicineSlider.map((item, index) => (
          <div 
            key={item.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="slide-image-container">
              <img src={item.image} alt={item.title} className="slide-image" />
            </div>
            <div className="slide-content">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
        
        <button className="next-btn slider-btn" onClick={goToNextSlide}>&#10095;</button>
        
        <div className="slider-dots">
          {medicineSlider.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentSlide ? 'active' : ''}`} 
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      <div className="medicine-info">
        <h2>About Our Medicines</h2>
        <p>We provide high-quality medications from trusted pharmaceutical companies. Our pharmacy offers a wide range of prescription drugs, over-the-counter medicines, and health supplements to meet your healthcare needs.</p>
      </div>

      <div className="medicine-products-section">
        <h2>Our Products</h2>
        <div className="medicine-products-grid">
          {medicineProducts.map(product => (
            <div className="medicine-card" key={product.id}>
              <div className="medicine-card-image">
                <img src={product.image} alt={product.title} />
                <div className="medicine-card-actions">
                  <button 
                    className={`add-to-cart-btn ${addedItems[product.id] ? 'added' : ''}`}
                    onClick={() => addedItems[product.id] ? handleMoveToCart() : handleAddToCart(product)}
                  >
                    {addedItems[product.id] ? <FaDolly /> : <FaShoppingCart />}
                  </button>
                </div>
              </div>
              <div className="medicine-card-content">
                <h3>{product.title}</h3>
                <div className="medicine-card-rating">
                  {renderRatingStars(product.rating)}
                  <span className="rating-text">({product.rating})</span>
                </div>
                <p className="medicine-card-description">{product.description}</p>
                <div className="medicine-card-footer">
                  <span className="medicine-card-price">₹{Math.round(product.price * 83).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="pharmacy-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">Prescription Medicines</a></li>
              <li><a href="#">OTC Products</a></li>
              <li><a href="#">Health Supplements</a></li>
              <li><a href="#">Ayurvedic Medicines</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Help & Support</h3>
            <ul className="footer-links">
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Return Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Information</h3>
            <ul className="contact-info">
              <li><strong>Customer Care:</strong> +91 98765 43210</li>
              <li><strong>Prescription Help:</strong> +91 87654 32109</li>
              <li><strong>Emergency Line:</strong> +91 76543 21098</li>
              <li><strong>WhatsApp Support:</strong> +91 88888 77777</li>
              <li><strong>Email:</strong> support@medpharmacy.in</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Medical Helplines</h3>
            <ul className="contact-info">
              <li><strong>COVID-19 Helpline:</strong> 1075</li>
              <li><strong>Blood Bank:</strong> 1910</li>
              <li><strong>Ambulance:</strong> 108</li>
              <li><strong>Women's Helpline:</strong> 1091</li>
              <li><strong>Child Helpline:</strong> 1098</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Hospital Management System. All Rights Reserved.</p>
          <p>GST No: 29AABCU9603R1ZX | Drug License: KA-AL7-102932</p>
        </div>
      </footer>
    </div>
  );
}
