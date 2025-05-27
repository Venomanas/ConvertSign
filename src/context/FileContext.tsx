"use client"
import React, { useContext, useEffect , useState, ReactNode, createContext } from "react";
import { useAuth } from "@/context/AuthContext"
import { getUserFiles , updateUserFiles } from "@/utils/authUtils";

interface FileType {
    id: string;
    name: string;
    content?: string;
    createdAt : Date;
    updatedAt: Date;
}

interface FileContextType {
    files: FileType[];
    addFile: (file : FileType) => void;
    updatefile: (fileId: string, updates : Partial<FileType>) => void;
    removefile: (fileId: string)=> void;
    getFile: (fileId: string) => FileType | undefined;
    clearFiles: () => void;
}

interface FileProviderProps {
    children: ReactNode;
}
//create context
const FileContext = createContext<FileContextType | undefined>(undefined);

//custom hooks using file context
export const useFileContext = (): FileContextType => {
    const context = useContext(FileContext);
    if(!context) {
        throw new Error('useFileContext must be used within a FileProvider')
    }
    return context;
};

export const FileProvider: React.FC<FileProviderProps> = ({children}) => {
    const { currentUser } = useAuth();
    const [ files, setFiles ] = useState<FileType[]>([]);

    //load user-depecific files when user change 

    useEffect(()=>{
        if(currentUser){
            //files for authenticated user 
            const userFiles = getUserFiles(currentUser.uid);
            setFiles(userFiles);
        }
        else{
            //reset files when logged out
            setFiles([]);
        }
    },[currentUser]
    );
    //update storage whenever files chamgees
    useEffect(()=> {
        if(currentUser){updateUserFiles(currentUser.uid, files)}
    }, [files, currentUser]);

    //operation function for files 
    
    //add a new files
    const addFile = (file : FileType): void =>{
        setFiles(prevFiles =>[...prevFiles, file]);
    }
    //update files 
    const updatefile = (fileId: string, update: Partial<FileType>): void =>{
        setFiles(prevFiles =>
            prevFiles.map(file => 
                file.id === fileId ? {...file, ...update} : file
            )
        ); 
    }
    //remove files 
    const removefile = (fileId: string): void =>{
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    }
    //clear Files
    const clearFiles = (): void =>{
        if(window.confirm('Are you sure you want to clear all files'))
        {
            setFiles([]);
        }
        };
    //get single File by Id 
    const getFile = (fileId: string): FileType | undefined => {
        return files.find(file => file.id === fileId)
    };

    const contextValue : FileContextType ={
        files,
        addFile,
        updatefile,
        getFile,
        clearFiles,
        removefile,
    };

    return(
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    );
};