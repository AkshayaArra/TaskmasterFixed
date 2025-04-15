
import LoginForm from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-taskmaster-lightPurple/30">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <div className="text-4xl font-bold text-taskmaster-purple mb-2 flex items-center gap-2">
            <span className="bg-taskmaster-purple text-white rounded-lg p-2">TM</span>
            <span>TaskMaster</span>
          </div>
          <p className="text-sm text-gray-600">Collaborative task management for teams</p>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
