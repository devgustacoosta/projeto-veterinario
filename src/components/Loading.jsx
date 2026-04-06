import React from "react";

const Loading = ({ fullScreen = false, text = "Carregando..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
      {text && (
        <p className="text-slate-500 font-medium text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return <div className="w-full flex justify-center py-12">{content}</div>;
};

export default Loading;