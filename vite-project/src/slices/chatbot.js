import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const chatslice = createSlice({
  name: 'chat',
  initialState: {
    loading: false,
    messages: [
      {
        id: 'init-1',
        sender: 'bot',
        text: 'Hello! How can I help you today?',
      },
      {
        id: 'init-2',
        sender: 'bot',
        text: `You are an agriculture expert helping Indian farmers.

Explain in:
1. Simple English
2. Hindi (किसानों के लिए आसान भाषा)

Keep it short and practical.

Crop: Tomato
Disease: Late Blight`,
      },
    ],
    error: null,
  },
  reducers: {
    chatLoading(state) {
      state.loading = true;
      state.error = null;
    },

    chatError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    addMessage(state, action) {
      state.messages.push(action.payload);
    },

    updateMessage(state, action) {
      const { id, text } = action.payload;
      const msg = state.messages.find((m) => m.id === id);
      if (msg) {
        msg.text = text;
        msg.loading = false;
      }
    },
  },
});

export const {
  chatLoading,
  chatError,
  addMessage,
  updateMessage,
} = chatslice.actions;


// ✅ Async thunk with DEBUG
export const fetchChatResponse = (userMessage) => async (dispatch, getState) => {
  console.log("🔹 STEP 1: User triggered request");

  if (!userMessage.trim()) {
    console.log("❌ Empty input blocked");
    return;
  }

  const time = Date.now();
  const userId = `user-${time}`;
  const botId = `bot-${time}`;

  console.log("🔹 STEP 2: Adding user message");

  dispatch(
    addMessage({
      id: userId,
      sender: 'user',
      text: userMessage,
    })
  );

  console.log("🔹 STEP 3: Adding bot placeholder");

  dispatch(
    addMessage({
      id: botId,
      sender: 'bot',
      text: '...',
      loading: true,
    })
  );

  dispatch(chatLoading());

  try {
    console.log("🔹 STEP 4: Preparing request");

    const state = getState();

    const history = state.chat.messages.slice(-8).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    console.log("📤 Sending history:", history);

    console.log("🔹 STEP 5: Calling backend API");

    const response = await axios.post(
      `${API_BASE}/api/gemini/chat`,
      { messages: history }
    );

    console.log("✅ STEP 6: Response received");
    console.log("📥 Full response:", response);

    // ⚠️ IMPORTANT: your backend returns { reply: text }
    const botText =
      response.data?.reply || "No valid reply from backend";

    console.log("🧠 Parsed bot text:", botText);

    dispatch(
      updateMessage({
        id: botId,
        text: botText,
      })
    );

  } catch (error) {
    console.log("❌ STEP 7: ERROR OCCURRED");

    if (error.response) {
      console.error("🔥 Backend responded with error:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      console.error("🔥 No response received:", error.request);
    } else {
      console.error("🔥 Request setup error:", error.message);
    }

    dispatch(
      updateMessage({
        id: botId,
        text: 'Error: Failed to get response.',
      })
    );

    dispatch(chatError('Failed to fetch chat response'));
  }
};

export default chatslice.reducer;