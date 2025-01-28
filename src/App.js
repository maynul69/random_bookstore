import React, { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import "./App.css"; // Assuming a custom CSS file for styling

// Generate random books based on seed, region, and language
const generateBooks = (seed, region, language, page, likes, reviews) => {
  faker.seed(seed + page); // Set seed
  const books = [];

  for (let i = 0; i < 20; i++) {
    const title = faker.lorem.words(3);
    const author = faker.person.fullName();
    const publisher = faker.company.name();
    const isbn = faker.number.int({ min: 1000000000000, max: 9999999999999 }).toString();

    const bookReviews = [];
    if (reviews > 0) {
      for (let r = 0; r < Math.floor(reviews); r++) {
        bookReviews.push({
          reviewer: faker.person.fullName(),
          text: faker.lorem.sentence(),
        });
      }

      if (reviews % 1 > 0 && Math.random() < reviews % 1) {
        bookReviews.push({
          reviewer: faker.person.fullName(),
          text: faker.lorem.sentence(),
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
  const [expandedIndex, setExpandedIndex] = useState(null); // Track the expanded row

  const handleGenerateSeed = () => setSeed(Math.random().toString(36).substring(2, 8));

  const loadBooks = () => {
    const newBooks = generateBooks(Number(seed), region, "en", page, likes, reviews);
    setBooks((prev) => [...prev, ...newBooks]);
  };

  useEffect(() => {
    setBooks([]);
    setPage(0);
    loadBooks();
  }, [seed, region, likes, reviews]);

  useEffect(() => {
    loadBooks();
  }, [page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="app-container" onScroll={handleScroll} style={{ height: "100vh", overflowY: "auto" }}>
      <div className="settings-card">
        <div className="settings-header">
          <h2>Bookstore Settings</h2>
        </div>
        <div className="form-grid">
          <div className="form-item">
            <label>Region:</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
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
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-gray-300">#</th>
              <th className="p-2 border border-gray-300">Title</th>
              <th className="p-2 border border-gray-300">Author</th>
              <th className="p-2 border border-gray-300">Publisher</th>
              <th className="p-2 border border-gray-300">ISBN</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <React.Fragment key={index}>
                <tr
                  onClick={() => toggleExpand(index)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    expandedIndex === index ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="p-2 border border-gray-300">{book.index}</td>
                  <td className="p-2 border border-gray-300">{book.title}</td>
                  <td className="p-2 border border-gray-300">{book.author}</td>
                  <td className="p-2 border border-gray-300">{book.publisher}</td>
                  <td className="p-2 border border-gray-300">{book.isbn}</td>
                </tr>
                {expandedIndex === index && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="p-4 border border-gray-300 text-sm text-gray-700">
                      <div>
                        <strong>Likes:</strong> {book.likes}
                      </div>
                      {book.reviews.length > 0 && (
                        <div className="mt-2">
                          <strong>Reviews:</strong>
                          <ul className="mt-1 list-disc list-inside">
                            {book.reviews.map((review, i) => (
                              <li key={i}>
                                <strong>{review.reviewer}:</strong> {review.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
