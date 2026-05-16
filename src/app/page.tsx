import { supabase } from "../lib/supabase";

export default async function Home() {
  // Test connection by fetching from a hypothetical "products" table
  // Even if it fails (e.g., table doesn't exist), it verifies the connection works.
  const { data, error } = await supabase.from('products').select('*').limit(5);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] p-8">
      <h1 className="text-5xl font-light tracking-[5px] text-[#5B2333] mb-8">
        BEAUTY SELLER
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl text-left">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Supabase Connection Test</h2>
        
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            <p className="font-bold">Connection successful, but query failed:</p>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200">
            <p className="font-bold">Connection successful! Data fetched:</p>
            <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}