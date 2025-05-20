
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <img src="/drone-icon.png" alt="Drone" className="h-20 w-20 mx-auto animate-drone-fly" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! This page has flown away.
        </p>
        <p className="text-gray-500 mb-8">
          The page you're looking for is not available. Let's get you back to your medications.
        </p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
