
export const AccessibilityStatement = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Accessibility Statement
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Our commitment to digital accessibility
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Our Commitment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Voucher Manager is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Accessibility Features
            </h2>
            <ul className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2 list-disc pl-6">
              <li>High contrast mode support</li>
              <li>Font size adjustment options</li>
              <li>Color blind support filters</li>
              <li>Enhanced focus indicators</li>
              <li>Reduced motion preferences</li>
              <li>Screen reader compatibility</li>
              <li>Keyboard navigation support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Standards Compliance
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These guidelines explain how to make web content more accessible for people with disabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Feedback
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We welcome your feedback on the accessibility of Voucher Manager. Please let us know if you encounter accessibility barriers or have suggestions for improvement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Using Accessibility Features
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Look for the accessibility button (♿) in the bottom right corner of the application to access our accessibility features and customize your experience.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
