import {LOGIN, REGISTER, PLAYING, PREMIUM} from './types';

export const login = (payload) => ({
  type: LOGIN,
  payload: payload,
});

export const register = (data) => ({
  type: REGISTER,
  data: data,
});

export const playing = (data) => ({
  type: PLAYING,
  data: data,
});

export const premium = (data) => ({
  type: PREMIUM,
  data: data,
});
