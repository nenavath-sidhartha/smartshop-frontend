import React, { useState, useEffect, useCallback } from 'react';
import { getActiveFAQs, getFAQsByCategory } from '../services/faqService';

const CATEGORIES = ['ALL', 'ORDER', 'PAYMENT', 'DELIVERY', 'RETURN', 'REFUND', 'ACCOUNT', 'PRODUCT', 'GENERAL'];

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={onToggle}>
    <div className="faq-question">
      <span>{faq.question}</span>
      <span className="faq-chevron">{isOpen ? '▲' : '▼'}</span>
    </div>
    {isOpen && <div className="faq-answer">{faq.answer}</div>}
  </div>
);

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = activeCategory === 'ALL'
        ? await getActiveFAQs()
        : await getFAQsByCategory(activeCategory);
      setFaqs(Array.isArray(data) ? data : []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const filtered = faqs.filter(
    (f) =>
      f.question?.toLowerCase().includes(search.toLowerCase()) ||
      f.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find quick answers to common questions about SmartShop</p>
        <div className="faq-search-wrap">
          <input
            id="faq-search"
            className="faq-search"
            placeholder="🔍  Search FAQs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="faq-container">
        {/* Category tabs */}
        <div className="faq-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`faq-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setOpenId(null); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        {loading ? (
          <div className="faq-loading">Loading FAQs…</div>
        ) : filtered.length === 0 ? (
          <div className="faq-empty">
            <span>🤔</span>
            <p>No FAQs found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="faq-list">
            {filtered.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="faq-cta">
          <p>Still have questions?</p>
          <div className="faq-cta-buttons">
            <a href="/support" className="btn-primary">🎫 Open a Support Ticket</a>
            <a href="/customer-care" className="btn-secondary">👩‍💼 Live Customer Care</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
