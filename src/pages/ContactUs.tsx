
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react';

export const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Get in touch with our support team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <span>Email Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              support@vouchermanager.com
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span>Live Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chat with our support team in real-time during business hours.
            </p>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Live Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Business Hours</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monday - Friday: 9:00 AM - 6:00 PM (EST)<br />
                    Saturday - Sunday: 10:00 AM - 4:00 PM (EST)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Response Time</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Email: Within 24 hours<br />
                    Live Chat: Immediate during business hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                How do I add a new voucher?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click the "Add New Voucher" button on the dashboard and follow the guided process to manually enter details or extract information from images.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Can I export my voucher data?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can export your voucher data to Excel format from the vouchers page.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, all your voucher data is stored locally in your browser and is not transmitted to external servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
