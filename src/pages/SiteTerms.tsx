
export const SiteTerms = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Site Terms
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Terms of Service for Voucher Manager
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using Voucher Manager, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              2. Use License
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Permission is granted to temporarily use Voucher Manager for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              3. User Responsibilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Users are responsible for maintaining the confidentiality of their voucher information and for all activities that occur under their account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              4. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The materials on Voucher Manager are provided on an 'as is' basis. Voucher Manager makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
