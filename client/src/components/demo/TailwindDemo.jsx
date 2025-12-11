// components/demo/TailwindDemo.jsx
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Button, Input, Card, Badge } from "../ui";

const TailwindDemo = () => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen gradient-secondary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Tailwind CSS Demo
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive UI component showcase
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <Card.Header>
            <Card.Title>Button Components</Card.Title>
            <Card.Description>
              Various button styles and states
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="ghost">Ghost</Button>
              <Button
                variant="primary"
                loading={loading}
                onClick={handleButtonClick}
              >
                Loading
              </Button>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Button Sizes
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Form Components */}
        <Card>
          <Card.Header>
            <Card.Title>Form Components</Card.Title>
            <Card.Description>
              Input fields with various configurations
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input label="With Icon" placeholder="Search..." icon="🔍" />
              <Input
                label="Email Input"
                type="email"
                placeholder="user@example.com"
                icon="📧"
                required
              />
              <Input
                label="Error State"
                placeholder="Invalid input"
                error="This field is required"
                value=""
              />
            </div>
          </Card.Content>
        </Card>

        {/* Badges */}
        <Card>
          <Card.Header>
            <Card.Title>Badge Components</Card.Title>
            <Card.Description>Status indicators and labels</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Status Badges
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success" icon={<FaCheckCircle />}>
                    Active
                  </Badge>
                  <Badge variant="warning" icon="⚠️">
                    Pending
                  </Badge>
                  <Badge variant="error" icon="❌">
                    Inactive
                  </Badge>
                  <Badge variant="info" icon="ℹ️">
                    Info
                  </Badge>
                  <Badge variant="primary" icon="👑">
                    Admin
                  </Badge>
                  <Badge variant="secondary" icon="👤">
                    User
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Badge Sizes
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Cards Showcase */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card hover shadow="soft">
            <Card.Header>
              <Card.Title> Performance</Card.Title>
              <Card.Description>Lightning fast loading</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="text-3xl font-bold text-brand mb-2">99.9%</div>
              <p className="text-gray-600">Uptime guarantee</p>
            </Card.Content>
          </Card>

          <Card hover shadow="medium">
            <Card.Header>
              <Card.Title>🔒 Security</Card.Title>
              <Card.Description>Enterprise grade protection</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="text-3xl font-bold text-green-600 mb-2">
                256-bit
              </div>
              <p className="text-gray-600">SSL encryption</p>
            </Card.Content>
          </Card>

          <Card hover shadow="large">
            <Card.Header>
              <Card.Title>📊 Analytics</Card.Title>
              <Card.Description>Real-time insights</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                24/7
              </div>
              <p className="text-gray-600">Monitoring</p>
            </Card.Content>
          </Card>
        </div>

        {/* Gradient Backgrounds */}
        <Card>
          <Card.Header>
            <Card.Title>Gradient Backgrounds</Card.Title>
            <Card.Description>Beautiful gradient utilities</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="gradient-primary p-6 rounded-lg text-white text-center">
                <h4 className="font-medium">Primary Gradient</h4>
                <p className="text-sm opacity-90">Brand colors</p>
              </div>
              <div className="gradient-secondary p-6 rounded-lg text-gray-800 text-center">
                <h4 className="font-medium">Secondary Gradient</h4>
                <p className="text-sm opacity-75">Subtle background</p>
              </div>
              <div className="gradient-dark p-6 rounded-lg text-white text-center">
                <h4 className="font-medium">Dark Gradient</h4>
                <p className="text-sm opacity-90">Dark theme</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Animations */}
        <Card>
          <Card.Header>
            <Card.Title>Animations</Card.Title>
            <Card.Description>Smooth transitions and effects</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="animate-fade-in p-4 bg-blue-50 rounded-lg text-center">
                  <span className="text-blue-800">Fade In Animation</span>
                </div>
                <div className="animate-slide-up p-4 bg-green-50 rounded-lg text-center">
                  <span className="text-green-800">Slide Up Animation</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="animate-pulse-slow p-4 bg-purple-50 rounded-lg text-center">
                  <span className="text-purple-800">Pulse Animation</span>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center hover:scale-105 transition-transform">
                  <span className="text-yellow-800">Hover Scale</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600">
            🎨 Built with Tailwind CSS • 💙 Powered by MERN Stack
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindDemo;
