


export const useTopBarStore=defineStore('TopBarStore',()=>{

    const label=ref("")
    const description=ref("")
    const setLabel=(text:string)=>{
        label.value=text
    }
    const setDescription=(text:string)=>{
        description.value=text
    }
    return {label,description,setDescription,setLabel}
    
})