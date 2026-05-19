export const callSophiaCoreProxy = async (questionObj, onResult) => {
  try {
    const proxyUrl = "https://skletsjrrejlmgseczan.supabase.co/functions/v1/sophia-proxy";
      
    // Needs anon key authorization to hit the Edge Function
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGV0c2pycmVqbG1nc2VjemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDAzMjIsImV4cCI6MjA5Mzg3NjMyMn0.o40dO4IZh__UZyVkmolquGg3KN9tdC1v-Xzikbg-2M4`
      },
      body: JSON.stringify({ question: questionObj })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Network Uplink Failed: ${res.status} ${errText}`);
    }
    const data = await res.json();
    if (onResult) onResult(data);
    return data;
  } catch (err) {
    console.error("Sophia Core proxy call failed:", err);
    throw new Error("Network Uplink Failed");
  }
};
