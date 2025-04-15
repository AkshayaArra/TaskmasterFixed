
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState(false);
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNetworkError(false);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      await register(name, email, password);
    } catch (error) {
      // Check if it's a network error
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setNetworkError(true);
      }
      console.error("Registration failed:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <UserPlus size={24} className="text-taskmaster-purple" />
          <span>Create an Account</span>
        </CardTitle>
        <CardDescription>
          Enter your information to create a TaskMaster account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {networkError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to connect to the server. The backend service might be unavailable or experiencing issues. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-taskmaster-purple hover:bg-taskmaster-darkPurple" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-taskmaster-purple hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
