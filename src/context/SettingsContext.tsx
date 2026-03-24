import {createContext,useContext,useState,useEffect} from "react";
const C=createContext(null);
export const SettingsProvider=({children})=>{
const [reciter,setReciter]=useState(localStorage.getItem("reciter")||"husary");
const [theme,setTheme]=useState(localStorage.getItem("theme")||"light");
useEffect(()=>localStorage.setItem("reciter",reciter),[reciter]);
useEffect(()=>{localStorage.setItem("theme",theme);document.documentElement.className=theme;},[theme]);
return <C.Provider value={{reciter,setReciter,theme,setTheme}}>{children}</C.Provider>;
};
export const useSettings=()=>useContext(C);