import { FaBolt, FaBars, FaUser } from "react-icons/fa";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
}

export default function Header({ title = "Creative Energy Flow", showNavigation = true }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <FaBolt className="text-2xl text-primary mr-3" />
            <h1 className="text-xl font-bold text-charcoal">{title}</h1>
          </div>

          {/* Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-charcoal hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-charcoal hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/tracking" className="text-charcoal hover:text-primary transition-colors">
                Tracking
              </Link>
              <Link href="/insights" className="text-charcoal hover:text-primary transition-colors">
                Insights
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-charcoal hover:text-primary">
              <FaBars className="text-xl" />
            </button>
            <button className="text-charcoal hover:text-primary">
              <FaUser className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}