
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-taskmaster-lightPurple/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-taskmaster-purple flex items-center">
          <span className="bg-taskmaster-purple text-white rounded p-1 text-sm mr-2">TM</span>
          TaskMaster
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-taskmaster-purple hover:text-taskmaster-darkPurple">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-taskmaster-purple hover:bg-taskmaster-darkPurple">
              Register
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            Manage Tasks, <span className="text-taskmaster-purple">Together</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            TaskMaster brings your team's work together in one shared space. Collaborate in real-time,
            manage projects, and reach new productivity peaks.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-taskmaster-purple hover:bg-taskmaster-darkPurple">
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-taskmaster-purple text-taskmaster-purple hover:bg-taskmaster-lightPurple">
                Login to Your Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-taskmaster-lightPurple rounded-full flex items-center justify-center mb-4">
              <Zap size={24} className="text-taskmaster-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
            <p className="text-gray-600">
              See who's working on what in real-time. No more duplicate work or confusion.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-taskmaster-lightPurple rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-taskmaster-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Kanban Task Management</h3>
            <p className="text-gray-600">
              Visualize your workflow with customizable Kanban boards. Drag and drop tasks with ease.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-taskmaster-lightPurple rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-taskmaster-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Team Workspaces</h3>
            <p className="text-gray-600">
              Create dedicated spaces for different teams and projects. Keep everything organized.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 TaskMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
