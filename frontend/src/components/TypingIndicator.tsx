const TypingIndicator = () => (
  <div className="flex justify-start mb-2 sm:mb-3">
    <div className="max-w-[85%] sm:max-w-lg px-4 sm:px-6 py-4 sm:py-5 rounded-3xl rounded-bl-xl bg-gradient-to-br from-white via-slate-50 to-gray-100 shadow-2xl border-2 border-gray-200 backdrop-blur-sm">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex space-x-1.5 sm:space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-bounce shadow-lg"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.4s'}}></div>
        </div>
        <span className="text-base sm:text-lg text-gray-800 font-bold tracking-wide">IAPivara está digitando...</span>
      </div>
    </div>
  </div>
);

export default TypingIndicator;
