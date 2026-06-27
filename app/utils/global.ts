

export const app_logo=()=>{
    // const {apiBase}=useRuntime()
    // return `${apiBase}assets/img/logo.png`
}
export const success=(message:string)=>{
  const { $toast } = useNuxtApp();
  $toast.success(message);  
}

export const convertToNunmberFormat=(number:number)=>{
  return new Intl.NumberFormat().format(number);
}