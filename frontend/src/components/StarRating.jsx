function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
}) {
  const numericValue = Number(value) || 0;

  const sizeClasses =
    size === "lg"
      ? {
          wrapper: "gap-1.5 rounded-2xl px-3 py-2",
          button: "h-11 w-11 text-3xl",
        }
      : {
          wrapper: "gap-1 rounded-xl px-2.5 py-1.5",
          button: "h-8 w-8 text-xl",
        };

  function handleClick(ratingValue) {
    if (readonly || !onChange) {
      return;
    }

    onChange(ratingValue);
  }

  return (
    <div
      className={`inline-flex items-center border border-amber-100 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 shadow-sm ${sizeClasses.wrapper}`}
      aria-label={`Rating: ${numericValue} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((ratingValue) => {
        const isActive = ratingValue <= numericValue;

        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => handleClick(ratingValue)}
            disabled={readonly}
            aria-label={`${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
            className={[
              "group relative flex items-center justify-center rounded-xl transition duration-200",
              sizeClasses.button,
              readonly
                ? "cursor-default"
                : "cursor-pointer hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-sm",
            ].join(" ")}
          >
            <span
              className={[
                "transition duration-200",
                isActive
                  ? "text-amber-500 drop-shadow-[0_1px_5px_rgba(245,158,11,0.35)]"
                  : "text-slate-300",
                !readonly && !isActive
                  ? "group-hover:text-amber-400"
                  : "",
              ].join(" ")}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;