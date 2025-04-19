import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Save, Moon, Sun, User, Shield, Bell, Database } from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-100">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                type="text"
                defaultValue="admin"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="admin@example.com"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Two-Factor Authentication
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="twoFactor"
                  className="h-4 w-4 rounded border-background-lighter bg-background"
                />
                <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-400">
                  Enable two-factor authentication
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Session Timeout
              </label>
              <select className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                API Key
              </label>
              <div className="flex">
                <input
                  type="text"
                  defaultValue="sk_test_51H8b3fJ92jfk2j3nfj3nfj3n"
                  className="flex-1 rounded-l border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                  readOnly
                />
                <button className="rounded-r border border-l-0 border-background-lighter bg-background-lighter px-3 py-2 text-gray-300">
                  Regenerate
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Email Notifications</h3>
                  <p className="text-xs text-gray-400">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-background-lighter bg-background"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">New Investigation Alerts</h3>
                  <p className="text-xs text-gray-400">Alert when new investigations are created</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-background-lighter bg-background"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Task Completion Notifications</h3>
                  <p className="text-xs text-gray-400">Alert when background tasks complete</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-background-lighter bg-background"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Storage Usage</span>
                  <span className="text-xs text-gray-400">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-background-lighter">
                  <div className="h-full w-1/4 bg-primary-600"></div>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Data Retention Policy
                </label>
                <select className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              
              <div>
                <button className="text-sm text-error-500 hover:text-error-400">
                  Delete All Data
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 