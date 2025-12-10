export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Brand */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">NewsDay</h3>
          <p className="max-w-3xl leading-relaxed">
            NewsDay is a digital news and media platform providing updates on
            global news, finance, markets, technology, and current affairs.
            All content published on this website is for informational and
            educational purposes only.
          </p>
        </div>

        {/* Risk Disclosure */}
        <div className="border-t border-gray-700 pt-6 space-y-3 leading-relaxed text-gray-400">
          <p>
            <strong className="text-gray-300">Risk Disclosure:</strong> Financial
            markets, cryptocurrencies, and investment instruments involve
            significant risk, including the possible loss of capital. Content
            provided on NewsDay does not constitute investment advice,
            recommendation, or solicitation.
          </p>

          <p>
            Market data, prices, and information shown on this website may not
            be real-time or fully accurate and can differ from actual market
            values. NewsDay does not guarantee the accuracy or completeness of
            any data and shall not be held liable for any loss or damage arising
            from reliance on the information presented.
          </p>

          <p>
            Users are advised to conduct their own research and consult
            qualified financial professionals before making any trading or
            investment decisions.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400">
            © {new Date().getFullYear()} NewsDay. All rights reserved.
          </p>

          <div className="flex space-x-5 text-gray-400">
            <a href="/terms" className="hover:text-white transition">
              Terms & Conditions
            </a>
            <a href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="/risk-disclosure" className="hover:text-white transition">
              Risk Warning
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
