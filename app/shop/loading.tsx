export default function ShopLoading() {
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-96 rounded mb-10" />
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="skeleton aspect-[4/5] rounded-2xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
