import React, { useState, useEffect, useRef, useCallback } from "react";
import { faker } from "@faker-js/faker";
import "./App.css";

const generateBooks = (seed, region, language, page, likes, reviews) => {
  faker.seed(seed + page);
  return Array.from({ length: 20 }, (_, i) => {
    const title = faker.lorem.words(3);
    const author = faker.person.fullName();
    const publisher = faker.company.name();
    const isbn = faker.number.int({ min: 1000000000000, max: 9999999999999 }).toString();
    
    const bookReviews = Array.from({ length: Math.floor(reviews) }, () => ({
      reviewer: faker.person.fullName(),
      text: faker.lorem.sentence(),
    }));
    if (reviews % 1 > 0 && Math.random() < reviews % 1) {
      bookReviews.push({ reviewer: faker.person.fullName(), text: faker.lorem.sentence() });
    }
    
    return {
      index: i + 1 + page * 20,
      isbn,
      title,
      author,
      publisher,
      likes: Math.random() < likes % 1 ? Math.ceil(likes) : Math.floor(likes),
      reviews: bookReviews,
    };
  });
};

export default function BookstoreTesterApp() {
  const [region, setRegion] = useState("en_US");
  const [seed, setSeed] = useState("");
  const [likes, setLikes] = useState(5);
  const [reviews, setReviews] = useState(3.5);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const observer = useRef();

  // Load seed from localStorage on mount
  useEffect(() => {
    const storedSeed = localStorage.getItem("bookstoreSeed");
    if (storedSeed) {
      setSeed(storedSeed);
    } else {
      generateNewSeed();
    }
  }, []);

  // Function to generate a new seed and ensure it doesn't match the previous one
  const generateNewSeed = () => {
    let newSeed;
    do {
      newSeed = Math.random().toString(36).substring(2, 8);
    } while (newSeed === localStorage.getItem("bookstoreSeed"));

    setSeed(newSeed);
    localStorage.setItem("bookstoreSeed", newSeed);
  };

  const lastBookRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    []
  );

  useEffect(() => {
    setBooks([]);
    setPage(0);
  }, [seed, region, likes, reviews]);

  useEffect(() => {
    if (seed) {
      const newBooks = generateBooks(Number(seed), region, "en", page, likes, reviews);
      setBooks((prev) => [...prev, ...newBooks]);
    }
  }, [seed, page]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="app-container">
      <div className="settings-card">
        <h2>Bookstore Settings</h2>
        <label>Region:</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="en_US">English (USA)</option>
          <option value="de_DE">German (Germany)</option>
          <option value="es_ES">Spanish (Spain)</option>
        </select>
        <label>Seed:</label>
        <input type="text" value={seed} readOnly />
        <button onClick={generateNewSeed}>Generate Seed</button>
        <label>Likes:</label>
        <input type="range" min="0" max="10" step="0.1" value={likes} onChange={(e) => setLikes(parseFloat(e.target.value))} />
        <label>Reviews:</label>
        <input type="number" value={reviews} onChange={(e) => setReviews(parseFloat(e.target.value))} />
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
              <React.Fragment key={index}>
                <tr ref={index === books.length - 1 ? lastBookRef : null} onClick={() => toggleExpand(index)}>
                  <td>{book.index}</td>
                  <td className="cursor-pointer text-blue-600 underline">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                </tr>
                {expandedIndex === index && (
                  <tr>
                    <td colSpan="5" className="p-4 border border-gray-300 text-sm text-gray-700">
                      <div>
                        <strong>Likes:</strong> {book.likes}
                      </div>
                      {book.reviews.length > 0 && (
                        <div className="mt-2">
                          <strong>Reviews ({book.reviews.length}):</strong>
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
