export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-white">
            &copy; {new Date().getFullYear()} 医療Wiki. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

