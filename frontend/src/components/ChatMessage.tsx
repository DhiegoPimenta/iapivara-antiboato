import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const getMessageColor = (overall: string) => {
    switch (overall) {
      case 'red': return 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-2 border-red-200 text-red-900 shadow-xl shadow-red-100/60';
      case 'green': return 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 border-2 border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-100/60';
      case 'yellow': return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 border-2 border-amber-200 text-amber-900 shadow-xl shadow-amber-100/60';
      default: return 'bg-gradient-to-br from-white via-slate-50 to-gray-100 border-2 border-gray-200 text-gray-900 shadow-xl shadow-gray-100/60';
    }
  };

  const getStatusIcon = (overall: string) => {
    switch (overall) {
      case 'red': return '🔴';
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      default: return '';
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2 sm:mb-3`}>
      <div className={`max-w-[85%] sm:max-w-lg px-4 sm:px-6 py-4 sm:py-5 rounded-3xl shadow-2xl border-2 backdrop-blur-sm ${
        message.isUser 
          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-br-xl shadow-blue-500/30 ring-2 ring-white/20' 
          : `${message.apiResponse ? getMessageColor(message.apiResponse.overall) : 'bg-gradient-to-br from-white via-slate-50 to-gray-100 border-2 border-gray-200 text-gray-900 shadow-xl shadow-gray-100/60'} rounded-bl-xl`
      }`}>
        <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
        {message.apiResponse && (
          <div className="mt-3 sm:mt-4 text-sm">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 rounded-2xl bg-black/10 border-2 border-black/20 backdrop-blur-sm">
              <span className="text-xl sm:text-2xl drop-shadow-lg flex-shrink-0">{getStatusIcon(message.apiResponse.overall)}</span>
              <span className="font-bold text-base sm:text-lg tracking-wide uppercase">
                {message.apiResponse.overall === 'red' ? 'FAKE NEWS' : 
                 message.apiResponse.overall === 'green' ? 'VERDADEIRO' : 'INCERTO'}
              </span>
            </div>
            <p className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg leading-relaxed">{message.apiResponse.reason}</p>
            {message.apiResponse.sources.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-black/5 border border-black/5">
                <p className="font-bold mb-2 text-sm tracking-wide">Fontes:</p>
                <ul className="list-disc list-inside space-y-1">
                  {message.apiResponse.sources.map((source, index) => (
                    <li key={index} className="text-sm font-medium break-words">{source}</li>
                  ))}
                </ul>
              </div>
            )}
            {message.apiResponse.evidence.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-black/5 border border-black/5">
                <p className="font-bold mb-2 text-sm tracking-wide">Evidências:</p>
                <ul className="space-y-2">
                  {message.apiResponse.evidence.map((evidence, index) => (
                    <li key={index} className="text-sm">
                      <a href={evidence.url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-700 hover:text-blue-800 hover:underline font-semibold transition-colors break-words">
                        {evidence.title}
                      </a>
                      <span className="text-gray-600 font-medium"> - {evidence.source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 pt-3 border-t border-black/10 gap-2 sm:gap-0">
              <span className="text-sm font-semibold opacity-80">
                Confiança: {Math.round(message.apiResponse.confidence * 100)}%
              </span>
              <span className="text-sm font-medium opacity-80">
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        )}
        {!message.apiResponse && (
          <div className="text-sm opacity-80 mt-2 sm:mt-3 text-right font-medium">
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
