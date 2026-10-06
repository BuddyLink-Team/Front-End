import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Create an async thunk around an API call.
 * - Fulfilled payload: the `data` field of the standard API envelope ({ success, message, data }).
 * - Rejected payload: the API error body ({ message, error: { code, details } }) via rejectWithValue,
 *   so hooks can `.unwrap()` and map error codes to user-facing messages.
 *
 * @param {string} type - Action type prefix, e.g. 'child/fetchMyChildren'
 * @param {(arg: any, thunkApi: Object) => Promise<any>} apiCall
 */
export const createApiThunk = (type, apiCall) =>
  createAsyncThunk(type, async (arg, thunkApi) => {
    try {
      const response = await apiCall(arg, thunkApi);
      return response?.data !== undefined ? response.data : response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  });
