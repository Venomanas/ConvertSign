'use client'
import React, { JSX, useState } from "react";
import { formatBytes, downloadFile} from "@/utils/fileUtils"
import { useFileContext } from "@/context/FileContext";
import Image from "next/image";

//define types for type safety
interface FileItem{
  id:string;
  name: string;
  type: string;
  size: number;
  base64: string;
  dateAdded: string | Date;
  processed?: boolean;
  isSignature?:boolean;
}
interface Tab{
  id: string;
  label:string;
}

type SortBy = "dateAdded" | "name" | "type" | "size";
type SortDirection = "asc"| "desc";
type ActiveTab = "all" | "images" | "documents" | "signatures" | "processed";

//to get file icons , a helper function
const getFileIcon = (file: FileItem):JSX.Element=>{
  const fileType = file.type.split('/')[0];

  switch (fileType) {
    case 'image':
      return (
        <>
          <svg
            className="w-6 h-6 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </>
      );
    case 'application':
      return (
        <>
          <svg
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        </>
      );
    default :
      return (
        <>
          <svg
            className="w-6 h-6 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        </>
      );
  }
}


export default function Dashboard(): JSX.Element {
  const {files, removeFile} = useFileContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy,setSortBy ] = useState<SortBy>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

    //file download
  function handleDownload(file: FileItem): void {    
    downloadFile(file.base64, file.name, file.type);
  }

    //file deletion 
    const handleDelete = (fileId: string): void =>{
        if (window.confirm('Are you sure you want to delete the files ?')) {
            removeFile(fileId)
        }
    }
  // here we Filter files based on active tab and search query
  const getFilteredFiles =(): FileItem[] =>{
    let filtered: FileItem[] = [...files as unknown as FileItem[]];

  
  //apply tab filter
  if (activeTab === 'images'){
    filtered = filtered.filter((file: FileItem)=> file.type.startsWith('image/'));
  }
  else if(activeTab === 'documents'){
    filtered = filtered.filter((file: FileItem)=> file.type.startsWith('application/') || file.type.startsWith('text/'));  
  }
  else if(activeTab === 'signatures'){
    filtered=filtered.filter((file: FileItem)=> file.isSignature);
  }
  else if(activeTab === 'processed'){
    filtered=filtered.filter((file: FileItem) => file.processed);
  }

  //apply search filter
  if(searchQuery.trim()){
    filtered=filtered.filter((file: FileItem)=>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  filtered.sort((a: FileItem, b: FileItem)=>{
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue= b.type;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'dateAdded':
        default:
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
    }
    if(aValue>bValue) return sortDirection === 'asc' ? 1:-1;
    if(bValue>aValue) return sortDirection === 'asc' ? -1:1;
    return 0;
  });
  return filtered
  }
  

//file tabs
const tabs: Tab[] = [
    {id:'all', label: 'All Files'},
    {id:'images', label: 'Images'},
    {id:'documents', label: 'Documents'},
    {id:'signatures', label: 'Signatures'},
    {id:'processed', label: 'Processed'},
    ];
  const filteredFiles = getFilteredFiles();
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl mb-6 p-3 text-center text-background text-shadow-2xl text-shadow-indigo font-stretch-condensed  ">
        Welcome🏠
      </h2>

      {/* Search and Filter Controls  */}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-900 "
                  fill="none"
                  stroke="currentColor "
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files...."
                className="block w-full pl-10 text-black pr-3 py-2 border border-gray-500 rounded-md focus:outline-none font-stretch-condensed focus:ring-2 focus:ring-[#574964] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-900">Sort by :</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value as SortBy);
                setSortDirection("asc");
              }}
              className="px-2 py-1 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1b60] bg-[#1a1b60] hover:bg-white font-stretch-condensed 
              text-white hover:text-blue-500 "
            >
              <option value="dateAdded">Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
            </select>

            <button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className="ml-2 p-1 text-black"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              {sortDirection === "asc" ? (
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-500"
                  : "border-transparent text-gray-900 hover:text-emerald-500 hover:border-[#574964]font-stretch-condensed"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* File List*/}
      {files.length === 0 ? (
        <div className="text-center py-10 bg-sky-100 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-neutral-900">
            Upload files to get started.
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-900">No files match your filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* File Preview */}
                <div
                  className={`h-40 bg-gray-100 flex items-center justify-center relative`}
                >
                  {file.type.startsWith("image/") ? (
                    <Image
                      src={`data:${file.type};base64,${file.base64}`}
                      alt={file.name}
                      fill
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">
                      {getFileIcon(file)}
                    </div>
                  )}

                  {file.processed && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-stretch-condensed">
                      Processed
                    </div>
                  )}

                  {file.isSignature && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded font-stretch-condensed">
                      Signature
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-gray-900 truncate font-stretch-condensed"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatBytes(file.size)} •{" "}
                        {file.type.split("/")[1].toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Added:
                        {(typeof file.dateAdded === "string"
                          ? new Date(file.dateAdded)
                          : file.dateAdded
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-stretch-condensed transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-3 py-1 bg-red-600 text-white font-stretch-condensed rounded-md hover:bg-red-700 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Showing {filteredFiles.length} of {files.length} files
          </p>
        </>
      )}
    </div>
  );
}