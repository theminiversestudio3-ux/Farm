import { useState, useEffect } from 'react';

type RequestState<T> = {
  loading: boolean;
  data: T | null;
  errorMsg: string | null;
};

class Store {
  sow: RequestState<any[]> = { loading: false, data: null, errorMsg: null };
  rotation: RequestState<any[]> = { loading: false, data: null, errorMsg: null };
  disease: RequestState<string> = { loading: false, data: null, errorMsg: null };
  diseaseImage: string | null = null;
  cropRoadmaps: Record<string, RequestState<any[]>> = {};

  listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  notify = () => {
    this.listeners.forEach(l => l());
  };

  setSow = (state: Partial<RequestState<any[]>>) => {
    this.sow = { ...this.sow, ...state };
    this.notify();
  };

  setRotation = (state: Partial<RequestState<any[]>>) => {
    this.rotation = { ...this.rotation, ...state };
    this.notify();
  };

  setDisease = (state: Partial<RequestState<string>>, image?: string | null) => {
    this.disease = { ...this.disease, ...state };
    if (image !== undefined) {
      this.diseaseImage = image;
    }
    this.notify();
  };

  setCropRoadmap = (id: string, state: Partial<RequestState<any[]>>) => {
    this.cropRoadmaps[id] = { ...(this.cropRoadmaps[id] || { loading: false, data: null, errorMsg: null }), ...state };
    this.notify();
  };
}

export const appStore = new Store();

export function useAppStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return appStore.subscribe(() => setTick(t => t + 1));
  }, []);
  return appStore;
}
