export default function PricingCardsSkeleton() {
  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {/* Skeleton Cards */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-gray-200 p-6 relative"
            >
              {/* Badge skeleton */}
              <div className="h-6 w-24 bg-gray-200 rounded-full mb-4"></div>
              
              {/* Plan name */}
              <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
              
              {/* Description */}
              <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
              
              {/* Price */}
              <div className="mb-6">
                <div className="h-10 w-24 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Button */}
              <div className="h-12 w-full bg-gray-200 rounded-xl mb-6"></div>
              
              {/* Features */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
