export const TestTailwind = () => {
  return (
    <div className="p-4">
      <div className="bg-red-500 text-white p-4 rounded">
        If this has a red background, Tailwind is working
      </div>
      <div className="flex gap-4 mt-4">
        <div className="bg-blue-500 text-white p-2 rounded">Item 1</div>
        <div className="bg-green-500 text-white p-2 rounded">Item 2</div>
        <div className="bg-yellow-500 text-white p-2 rounded">Item 3</div>
      </div>
    </div>
  );
};