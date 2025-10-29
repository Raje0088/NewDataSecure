import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialState = {
  filterRaw: {
    clientType: "",
    clientId: "",
    clientName: "",
    opticalName: "",
    address: "",
    mobile: "",
    email: "",
    district: "",
    state: "",
  },
  selectedData: {
    result: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    db: "",
    message: "",
    counts: { r: 0, c: 0, u: 0 },
  },
};

const filterSlice = createSlice({
  name: "filter",
  initialState: initialState,
  reducers: {
    setField: (state, action) => {
      const { key, value } = action.payload;
      state.filterRaw[key] = value;
    },
    setSelectedData: (state, action) => {
      const data = action.payload;
      state.selectedData = {
        result: data.result || [],
        totalCount: Number(data.totalCount) || 0,
        page: Number(data.page) || 1,
        limit: Number(data.limit) || 50,
        db: data.db || "",
        message: data.message || "",
        counts: { r: data.counts.r, c: data.counts.c, u: data.counts.u },
      };
    },
    resetAll: () => ({
      ...initialState,
      selectedData: { ...initialState.selectedData },
    }),
  },
});

export const store = configureStore({
  reducer: {
    filterStore: filterSlice.reducer,
  },
});

export const { setField, setSelectedData, resetAll } = filterSlice.actions;
