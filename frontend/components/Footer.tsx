'use client';

export default function Footer() {
  return (
    <footer className="bg-dominion-blue text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg mb-2">Dominion City Directory</p>
          <p className="text-gray-300">
            Connecting you with the best businesses and professionals
          </p>
          <p className="text-gray-400 mt-4">
            © {new Date().getFullYear()} Dominion City. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
