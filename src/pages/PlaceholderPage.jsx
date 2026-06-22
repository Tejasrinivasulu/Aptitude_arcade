export default function PlaceholderPage({ title, description }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-secondary/50">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
        🎯
      </div>
      <h1 className="text-2xl font-bold text-secondary dark:text-white">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
