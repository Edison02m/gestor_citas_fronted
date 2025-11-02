export default function CardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}
