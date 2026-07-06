import dotenv from 'dotenv';
dotenv.config();

const testChat = async () => {
  try {
    const res = await fetch('http://localhost:5001/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: "Hello ARIA" })
    });
    
    if (!res.ok) {
      console.log('Error status:', res.status, res.statusText);
      const text = await res.text();
      console.log('Error body:', text);
      return;
    }
    
    const data = await res.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testChat();
