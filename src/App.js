import React, { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import "./App.css";

// Generate random books based on seed, region, and language
const generateBooks = (seed, language, page, likes, reviews) => {
  faker.seed(seed + page); // Set seed
  faker.locale = language; // Set the locale for faker

  const books = [];

  for (let i = 0; i < 20; i++) {
    const title = faker.commerce.productName(); // Localized title
    const author = faker.name.fullName(); // Localized author name
    const publisher = faker.company.name(); // Localized publisher name
    const isbn = faker.number.int({ min: 1000000000000, max: 9999999999999 }).toString();

    const bookReviews = [];
    if (reviews > 0) {
      for (let r = 0; r < Math.floor(reviews); r++) {
        bookReviews.push({
          reviewer: faker.name.fullName(), // Localized reviewer name
          text: faker.lorem.sentence(), // Localized sentence
        });
      }

      if (reviews % 1 > 0 && Math.random() < reviews % 1) {
        bookReviews.push({
          reviewer: faker.name.fullName(), // Localized reviewer name
          text: faker.lorem.sentence(), // Localized sentence
        });
      }
    }

    books.push({
      index: i + 1 + page * 20,
      isbn,
      title,
      author,
      publisher,
      likes: Math.random() < likes % 1 ? Math.ceil(likes) : Math.floor(likes),
      reviews: bookReviews,
    });
  }

  return books;
};

export default function BookstoreTesterApp() {
  const [region, setRegion] = useState("en_US");
  const [seed, setSeed] = useState("12345");
  const [likes, setLikes] = useState(5);
  const [reviews, setReviews] = useState(3.5);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState([]);
  const [language, setLanguage] = useState("en"); // State for language

  const handleGenerateSeed = () => setSeed(Math.random().toString(36).substring(2, 8));

  const loadBooks = () => {
    const newBooks = generateBooks(Number(seed), language, page, likes, reviews);
    setBooks((prev) => [...prev, ...newBooks]);
  };

  useEffect(() => {
    setBooks([]);
    setPage(0);
    loadBooks();
  }, [seed, language, likes, reviews]); // Added language as dependency

  useEffect(() => {
    loadBooks();
  }, [page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="app-container" onScroll={handleScroll} style={{ height: "100vh", overflowY: "auto" }}>
      <div className="settings-card flex space-between">
        <div className="settings-header">
          <h2>Bookstore Settings</h2>
        </div>
        <div className="form-grid">
          <div className="form-item">
            <label>Region:</label>
            <select
              value={region}
              onChange={(e) => {
                const selectedRegion = e.target.value;
                setRegion(selectedRegion);

                // Set language based on region
                const langMap = {
                  en_US: "en",
                  de_DE: "de",
                  es_ES: "es",
                };
                setLanguage(langMap[selectedRegion]);
              }}
            >
              <option value="en_US">English (USA)</option>
              <option value="de_DE">German (Germany)</option>
              <option value="es_ES">Spanish (Spain)</option>
            </select>
          </div>

          <div className="form-item">
            <label>Seed:</label>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Seed Value"
            />
            <button onClick={handleGenerateSeed}>Generate Random Seed</button>
          </div>

          <div className="form-item">
            <label>Average Likes per Book:</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={likes}
              onChange={(e) => setLikes(parseFloat(e.target.value))}
            />
            <span>{likes.toFixed(1)}</span>
          </div>

          <div className="form-item">
            <label>Average Reviews per Book:</label>
            <input
              type="number"
              value={reviews}
              onChange={(e) => setReviews(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="book-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <React.Fragment key={book.index}>
                <tr onClick={() => toggleRowExpansion(index)}>
                  <td>{book.index}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                </tr>
                {expandedRows.includes(index) && (
                  <tr className="expanded-row">
                    <td colSpan="5">
                      <div className="reviews">
                        {book.reviews.map((review, reviewIndex) => (
                          <div key={reviewIndex} className="review">
                            <strong>{review.reviewer}:</strong> {review.text}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
