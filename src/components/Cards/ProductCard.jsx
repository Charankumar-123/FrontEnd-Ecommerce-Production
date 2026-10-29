import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ProductCard.css";
import { addToCart } from "../../redux/CartSlice";
import { addItemToCart, getCartItems } from "../../Services/CartService";
import { setCartItems } from "../../redux/CartSlice";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "⚡ Super Tech Fest",
    title: "Up to 40% Off on Premium Electronics",
    subtitle: "Noise-cancelling headphones, high-definition audio, and smart wearable tech.",
    cta: "Shop Electronics",
    category: "Electronics",
    bg: "linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)",
    accent: "#ffca28",
  },
  {
    id: 2,
    tag: "🔥 Limited-Time Flash Deals",
    title: "Trending Fashion & Everyday Essentials",
    subtitle: "Discover statement sneakers, stylish backpacks, and contemporary accessories.",
    cta: "Explore Fashion Deals",
    category: "Fashion",
    bg: "linear-gradient(135deg, #0f172a 0%, #004d40 60%, #00796b 100%)",
    accent: "#38bdf8",
  },
  {
    id: 3,
    tag: "🏡 Modern Living Collection",
    title: "Upgrade Your Home, Kitchen & Workspace",
    subtitle: "Top-rated espresso coffee makers, smart organizers, and home comfort essentials.",
    cta: "Shop Home Deals",
    category: "Home",
    bg: "linear-gradient(135deg, #00382f 0%, #005b5b 50%, #26a69a 100%)",
    accent: "#ff8a65",
  },
];

const QUAD_CARDS = [
  {
    id: "quad-electronics",
    title: "Top Picks in Electronics",
    category: "Electronics",
    items: [
      { name: "Wireless Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200", query: "Headphones" },
      { name: "Smart Watch", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200", query: "Watch" },
      { name: "Bluetooth Sound", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200", query: "Speaker" },
      { name: "Tech Accessories", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200", query: "Audio" },
    ],
    footerLink: "See more in Electronics",
  },
  {
    id: "quad-fashion",
    title: "Style & Footwear Trends",
    category: "Fashion",
    items: [
      { name: "Running Sneakers", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", query: "Sneakers" },
      { name: "Everyday Backpack", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200", query: "Backpack" },
      { name: "Classic Watches", img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200", query: "Watch" },
      { name: "Casual Apparel", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200", query: "Fashion" },
    ],
    footerLink: "Explore Fashion Store",
  },
  {
    id: "quad-home",
    title: "Home & Kitchen Essentials",
    category: "Home",
    items: [
      { name: "Espresso Machines", img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200", query: "Coffee" },
      { name: "Cooking & Dining", img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200", query: "Kitchen" },
      { name: "Home Decor", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200", query: "Decor" },
      { name: "Workspace Setup", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200", query: "Desk" },
    ],
    footerLink: "Shop Home Collection",
  },
  {
    id: "quad-budget",
    title: "Deals Under ₹999",
    category: "Budget",
    items: [
      { name: "Daily Essentials", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200", query: "Essential" },
      { name: "Stationery & Books", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200", query: "Book" },
      { name: "Fitness Gear", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200", query: "Fitness" },
      { name: "Personal Care", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200", query: "Care" },
    ],
    footerLink: "See all budget deals",
  },
];

const CATEGORY_LIST = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Health & Care",
  "Gaming & Toys",
  "Sports",
];

const ProductCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Carousel Slide
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filters State
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";
  const filterParam = searchParams.get("filter") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceFilter, setPriceFilter] = useState("all"); // 'all' | 'under500' | '500-1500' | '1500-3000' | 'above3000'
  const [ratingFilter, setRatingFilter] = useState(0); // 0 | 4 | 3
  const [discountFilter, setDiscountFilter] = useState(0); // 0 | 10 | 20 | 30
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const userId = useSelector(
    (state) => state.auth.userDetail?.userId || state.auth.userDetail?.userID
  );
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("authToken");
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  // Sync category from URL param if changed from navigation
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Auto-rotate Hero Carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Products
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/products/getproducts", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, [token]);

  // Fetch Cart Items
  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => dispatch(setCartItems(data)))
        .catch((error) => console.error("Error fetching cart items:", error));
    }
  }, [userId, token, dispatch]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    if (!userId) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const quantity = quantities[product.id] || 1;
      const result = await addItemToCart(userId, product.id, quantity);

      if (result) {
        const updatedCart = await getCartItems(userId);
        dispatch(setCartItems(updatedCart));
        dispatch(addToCart({ productId: product.id, quantity }));
      }
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
    }
  };

  const isAddedToCart = (productId) => {
    return cartItems.some((item) => item.productInfo?.id === productId);
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory("All");
    setPriceFilter("all");
    setRatingFilter(0);
    setDiscountFilter(0);
    setInStockOnly(false);
    setSearchParams({});
  };

  // Complex Faceted Filtering & Sorting
  const filteredProducts = products
    .filter((product) => {
      // 1. Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = product.name?.toLowerCase().includes(q);
        const inDesc = product.description?.toLowerCase().includes(q);
        if (!inName && !inDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategory && selectedCategory !== "All") {
        const catLower = selectedCategory.toLowerCase();
        const pName = (product.name || "").toLowerCase();
        const pDesc = (product.description || "").toLowerCase();
        const matchesCat = pName.includes(catLower) || pDesc.includes(catLower);
        if (!matchesCat) return false;
      }

      // 3. Today's Deals filter param
      if (filterParam === "deals") {
        // All items with discount or price > 0
        if (!product.price || product.price <= 0) return false;
      }

      // 4. Price Filter
      const p = product.price || 0;
      if (priceFilter === "under500" && p >= 500) return false;
      if (priceFilter === "500-1500" && (p < 500 || p > 1500)) return false;
      if (priceFilter === "1500-3000" && (p < 1500 || p > 3000)) return false;
      if (priceFilter === "above3000" && p < 3000) return false;

      // 5. Rating Filter (mock default 4.5)
      const rating = product.rating || 4.5;
      if (ratingFilter > 0 && rating < ratingFilter) return false;

      // 6. Discount Filter (mock 20% discount on all items)
      const discount = product.discount || 20;
      if (discountFilter > 0 && discount < discountFilter) return false;

      // 7. In Stock Filter
      if (inStockOnly && (product.quantity !== undefined && product.quantity <= 0)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0; // featured
    });

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <div className="store-page-wrapper">
      {/* 1. HERO CAROUSEL BANNER */}
      {!searchQuery && (
        <div
          className="hero-carousel-section"
          style={{ background: activeSlideData.bg }}
        >
          <div className="hero-carousel-container">
            <button
              className="carousel-arrow prev"
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                )
              }
              title="Previous Offer"
            >
              ‹
            </button>

            <div className="hero-slide-content">
              <span
                className="hero-tag-badge"
                style={{ color: activeSlideData.accent, borderColor: activeSlideData.accent }}
              >
                {activeSlideData.tag}
              </span>
              <h1 className="hero-slide-title">{activeSlideData.title}</h1>
              <p className="hero-slide-subtitle">{activeSlideData.subtitle}</p>
              <button
                className="hero-cta-button"
                onClick={() => handleCategorySelect(activeSlideData.category)}
              >
                {activeSlideData.cta} →
              </button>
            </div>

            <button
              className="carousel-arrow next"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
              }
              title="Next Offer"
            >
              ›
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="carousel-dots-row">
            {HERO_SLIDES.map((s, idx) => (
              <span
                key={s.id}
                className={`carousel-dot ${idx === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              ></span>
            ))}
          </div>
        </div>
      )}

      {/* 2. AMAZON-STYLE QUAD-CARD TEASER GRIDS */}
      {!searchQuery && (
        <div className="quad-cards-section">
          <div className="quad-cards-grid">
            {QUAD_CARDS.map((quad) => (
              <div key={quad.id} className="quad-card">
                <h3 className="quad-card-title">{quad.title}</h3>
                <div className="quad-tiles-2x2">
                  {quad.items.map((sub, idx) => (
                    <div
                      key={idx}
                      className="quad-tile-item"
                      onClick={() => {
                        searchParams.set("search", sub.query);
                        setSearchParams(searchParams);
                      }}
                      title={`Search for ${sub.name}`}
                    >
                      <div className="quad-tile-img-box">
                        <img src={sub.img} alt={sub.name} className="quad-tile-img" />
                      </div>
                      <span className="quad-tile-label">{sub.name}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="quad-card-footer-link"
                  onClick={() => handleCategorySelect(quad.category)}
                >
                  {quad.footerLink} →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.5 HORIZONTAL PRODUCT CAROUSEL (TODAY'S BEST SELLERS) */}
      {!searchQuery && selectedCategory === "All" && products.length > 0 && (
        <div className="horizontal-deal-strip-container">
          <div className="deal-strip-header">
            <div className="deal-strip-title-box">
              <span className="deal-badge-pill">🔥 Deal of the Day</span>
              <h3 className="deal-strip-title">Today's Best Sellers & Flash Deals</h3>
            </div>
            <div className="strip-scroll-controls">
              <button
                className="strip-nav-btn"
                onClick={() => {
                  document.getElementById("horizontal-deals-track")?.scrollBy({ left: -320, behavior: "smooth" });
                }}
                title="Scroll Left"
              >
                ‹
              </button>
              <button
                className="strip-nav-btn"
                onClick={() => {
                  document.getElementById("horizontal-deals-track")?.scrollBy({ left: 320, behavior: "smooth" });
                }}
                title="Scroll Right"
              >
                ›
              </button>
            </div>
          </div>
          <div className="horizontal-deals-track" id="horizontal-deals-track">
            {products.slice(0, 10).map((prod) => (
              <div
                key={`deal-${prod.id}`}
                className="horizontal-deal-card"
                onClick={() => handleCardClick(prod.id)}
                title="Click to view details"
              >
                <div className="deal-card-img-box">
                  <img
                    src={prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"}
                    alt={prod.name}
                    className="deal-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/200x160?text=Deal";
                    }}
                  />
                  <span className="deal-percent-pill">Up to 35% OFF</span>
                </div>
                <div className="deal-card-info">
                  <span className="deal-card-tag">Limited Time</span>
                  <h4 className="deal-card-name">{prod.name}</h4>
                  <div className="deal-card-price-row">
                    <span className="deal-price">₹{prod.price?.toLocaleString("en-IN")}</span>
                    <span className="deal-mrp">₹{Math.round((prod.price || 500) * 1.35).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MAIN STORE LAYOUT: FACETED SIDEBAR + PRODUCTS CATALOG */}
      <div className="catalog-layout-container">
        {/* Left Sidebar: Faceted Filter Engine */}
        <aside className="faceted-filter-sidebar">
          <div className="sidebar-header-row">
            <h3>Filters</h3>
            {(selectedCategory !== "All" ||
              priceFilter !== "all" ||
              ratingFilter > 0 ||
              discountFilter > 0 ||
              inStockOnly ||
              searchQuery) && (
              <button className="clear-filters-link" onClick={handleClearAllFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Department / Category Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Department</h4>
            <ul className="filter-category-list">
              {CATEGORY_LIST.map((cat) => (
                <li
                  key={cat}
                  className={`category-item ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <span className="category-bullet">›</span>
                  <span className="category-name">{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="filter-divider" />

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Price Range</h4>
            <div className="filter-radios-list">
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === "all"}
                  onChange={() => setPriceFilter("all")}
                />
                <span>All Prices</span>
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === "under500"}
                  onChange={() => setPriceFilter("under500")}
                />
                <span>Under ₹500</span>
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === "500-1500"}
                  onChange={() => setPriceFilter("500-1500")}
                />
                <span>₹500 - ₹1,500</span>
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === "1500-3000"}
                  onChange={() => setPriceFilter("1500-3000")}
                />
                <span>₹1,500 - ₹3,000</span>
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === "above3000"}
                  onChange={() => setPriceFilter("above3000")}
                />
                <span>Over ₹3,000</span>
              </label>
            </div>
          </div>

          <hr className="filter-divider" />

          {/* Customer Reviews Rating Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Avg. Customer Review</h4>
            <div
              className={`rating-filter-pill ${ratingFilter === 4 ? "active" : ""}`}
              onClick={() => setRatingFilter(ratingFilter === 4 ? 0 : 4)}
            >
              <span className="stars">★★★★☆</span>
              <span>& Up</span>
            </div>
            <div
              className={`rating-filter-pill ${ratingFilter === 3 ? "active" : ""}`}
              onClick={() => setRatingFilter(ratingFilter === 3 ? 0 : 3)}
            >
              <span className="stars">★★★☆☆</span>
              <span>& Up</span>
            </div>
          </div>

          <hr className="filter-divider" />

          {/* Discount Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Discount Deals</h4>
            <div className="discount-links">
              <span
                className={`discount-chip ${discountFilter === 10 ? "active" : ""}`}
                onClick={() => setDiscountFilter(discountFilter === 10 ? 0 : 10)}
              >
                10% Off or more
              </span>
              <span
                className={`discount-chip ${discountFilter === 20 ? "active" : ""}`}
                onClick={() => setDiscountFilter(discountFilter === 20 ? 0 : 20)}
              >
                20% Off or more
              </span>
              <span
                className={`discount-chip ${discountFilter === 30 ? "active" : ""}`}
                onClick={() => setDiscountFilter(discountFilter === 30 ? 0 : 30)}
              >
                30% Off or more
              </span>
            </div>
          </div>

          <hr className="filter-divider" />

          {/* Availability */}
          <div className="filter-section">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Right Content Area: Active Chips Bar + Product Cards Grid */}
        <main className="catalog-products-main">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="catalog-top-bar">
            <div className="results-info-group">
              <span className="results-count-text">
                Showing <strong>{filteredProducts.length}</strong> results
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {searchQuery && ` for "${searchQuery}"`}
              </span>

              {/* Active Filter Chips */}
              <div className="active-chips-row">
                {filterParam && (
                  <span className="filter-badge-chip">
                    {filterParam === "deals" ? "⚡ Today's Deals" : "⭐ Best Sellers"}
                    <button onClick={() => {
                      searchParams.delete("filter");
                      setSearchParams(searchParams);
                    }}>✕</button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="filter-badge-chip">
                    {selectedCategory}
                    <button onClick={() => handleCategorySelect("All")}>✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="filter-badge-chip">
                    "{searchQuery}"
                    <button onClick={() => setSearchParams({})}>✕</button>
                  </span>
                )}
                {priceFilter !== "all" && (
                  <span className="filter-badge-chip">
                    Price: {priceFilter}
                    <button onClick={() => setPriceFilter("all")}>✕</button>
                  </span>
                )}
                {ratingFilter > 0 && (
                  <span className="filter-badge-chip">
                    {ratingFilter}★ & Up
                    <button onClick={() => setRatingFilter(0)}>✕</button>
                  </span>
                )}
                {discountFilter > 0 && (
                  <span className="filter-badge-chip">
                    {discountFilter}%+ Off
                    <button onClick={() => setDiscountFilter(0)}>✕</button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="filter-badge-chip">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)}>✕</button>
                  </span>
                )}
              </div>
            </div>

            <div className="sort-group">
              <label htmlFor="sort-by-select">Sort by:</label>
              <select
                id="sort-by-select"
                className="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured Deals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Cards Stream */}
          {loading ? (
            <div className="product-loading-container">
              <div className="loading-spinner"></div>
              <p>Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products-msg">
              <h3>No products match your criteria</h3>
              <p>Try resetting some filters or searching for different keywords.</p>
              <button className="primary-teal-btn" onClick={handleClearAllFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-list">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-container"
                  onClick={() => handleCardClick(product.id)}
                  title="Click to view product & store details"
                >
                  {/* Product Image Wrapper */}
                  <div className="product-image-wrapper">
                    <img
                      src={product.image || "https://via.placeholder.com/250x180?text=Product"}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/250x180?text=No+Image";
                      }}
                    />
                    <span className="view-store-badge">Click to View Store</span>
                  </div>

                  {/* Product Details */}
                  <div className="product-details">
                    <div className="product-store-tag">🏪 Verified Store</div>
                    <h2 className="product-name">{product.name}</h2>
                    <div className="product-rating">
                      <span className="stars">★★★★☆</span>
                      <span className="rating-score">4.5</span>
                      <span className="review-count">(42)</span>
                    </div>
                    <p className="product-description">{product.description}</p>

                    <div className="price-row">
                      <span className="product-price">
                        ₹{product.price ? product.price.toFixed(2) : "0.00"}
                      </span>
                      <span className="product-mrp">
                        ₹{product.price ? (product.price * 1.25).toFixed(0) : "0"}
                      </span>
                      <span className="discount-tag">20% OFF</span>
                    </div>

                    <div className="button-group">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`add-to-cart-btn ${isAddedToCart(product.id) ? "added" : ""}`}
                        disabled={isAddedToCart(product.id)}
                      >
                        {isAddedToCart(product.id) ? "✓ Added" : "🛒 Add to Cart"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(product.id);
                        }}
                        className="view-details-btn"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductCard;
