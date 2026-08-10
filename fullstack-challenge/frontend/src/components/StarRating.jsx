// Interactive 1-5 star selector used for submitting/updating ratings.
export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= value ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
