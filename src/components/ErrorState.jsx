export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="w-full border border-red-200 bg-red-50 p-5 rounded-2xl mb-5 text-red-800"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 font-semibold underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
