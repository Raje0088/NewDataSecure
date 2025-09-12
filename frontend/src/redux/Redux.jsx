import { createSlice,configureStore } from "@reduxjs/toolkit";

const initialState = {
    filterRaw:{
        clientType:"",
        clientId:"",
        clientName:"",
        opticalName:"",
        address:"",
        mobile:"",
        email:"",
        district:"",
        state:"",
    },
    selectedData:[],
}

const filterSlice = createSlice({
    name:"filter",
    initialState:initialState,
    reducers:{
        setField:(state,action)=>{
            const {key,value} = action.payload;
            state.filterRaw[key] = value;
        },
        setSelectedData: (state,action) =>{
            state.selectedData= action.payload;
        }

    }
})

export const store = configureStore({
    reducer:{
        filterStore:filterSlice.reducer,

    }
})

export const {setField,setSelectedData} = filterSlice.actions;
