import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../apiService";

const initialState = {
  favorites: [],
  books: [],
  cart: [],
  bookDetail: null,
  status: "idle",
  error: null,
};

// Fetch book detail by ID
export const fetchBookDetail = createAsyncThunk(
  "books/fetchBookDetail",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add book to favorites
export const addToFavorites = createAsyncThunk(
  "books/addToFavorites",
  async (book, { rejectWithValue }) => {
    try {
      const response = await api.post(`/favorites`, book);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch favorites
export const fetchFavorites = createAsyncThunk(
  "books/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/favorites");
      console.log("fetch data", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete book from favorites
export const deleteFromFavorites = createAsyncThunk(
    "books/deleteFromFavorites",
    async (removedBookId, { getState, rejectWithValue }) => {
      try {
        await api.delete(`/favorites/${removedBookId}`);
        // Return the updated list without the deleted book
        const updatedFavorites = getState().books.favorites.filter((book) => book.id !== removedBookId);
        return updatedFavorites;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );


// Fetch books 
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async ({ pageNum, limit, query }, { rejectWithValue }) => {
    try {
      let url = `/books?_page=${pageNum}&_limit=${limit}`;
      if (query) url += `&q=${query}`;
      const response = await api.get(url);
      console.log("fetch books", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    addToCart(state, action) {
      state.cart.push(action.payload);
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter((book) => book.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    handleAsyncCases(builder, fetchFavorites, "favorites");
    handleAsyncCases(builder, fetchBooks, "books");
    handleAsyncCases(builder, fetchBookDetail, "bookDetail");
    handleAsyncCases(builder, addToFavorites, "books", "addFavoriteStatus");
    handleAsyncCases(builder, deleteFromFavorites, "favorites", "deleteFavoriteStatus");
  },
});

// Reusable function for handling async thunk cases
const handleAsyncCases = (builder, action, successStateKey, statusStateKey = "status") => {
    builder
      .addCase(action.pending, (state) => {
        state[statusStateKey] = "loading";
      })
      .addCase(action.fulfilled, (state, action) => {
        state[statusStateKey] = "succeeded";
        state[successStateKey] = action.payload;
      })
      .addCase(action.rejected, (state, action) => {
        state[statusStateKey] = "failed";
        state.error = action.payload;
      });
  };


export const { addToCart, removeFromCart } = bookSlice.actions;
export default bookSlice.reducer;
