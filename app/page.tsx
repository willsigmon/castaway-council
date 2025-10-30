export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Castaway Council</h1>
        <p className="text-lg mb-8">Real-time slow-burn social survival RPG</p>
        <div className="grid gap-4">
          <div className="p-4 border rounded">
            <h2 className="text-2xl font-semibold mb-2">Welcome</h2>
            <p>Select a season or create a new one to begin.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
