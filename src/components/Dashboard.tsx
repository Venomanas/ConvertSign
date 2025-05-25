"use client";
import React, { useState } from "react";
import { formatBytes, downloadFile} from "@/utils/fileUtils"
import { useFileContext } from "@/context/FileContext";


export default function Dashboard() {
  const {files, removefile} = useFileContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy,setSortBy ] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [activeTab, setActiveTab] = useState('all')

  // here we Filter files based on active tab and search query
  const getFilteredFiles =() =>{
    let filtered =[...files];
  }

  //apply tab filter
  if (activeTab === 'images'){
    filtered = filteredFiles.filter(file => file.type.startsWith('image/'));
  }


    //file download
    const handleDownload = (file) =>{
        downloadFile(file.base64, file.name , file.type)
    }

    //file deletion 
    const handleDelete = (fileId) =>{
        if (window.confirm('Are you sure you want to delete the files ?')) {
            removefile(fileId)
        }
    }

    
//file tabs
const tabs = [
    {id:'all', label: 'All Files'},
    {id:'images', label: 'images'},
    {id:'documents', label: 'documents'},
    {id:'signatures', label: 'signatures'},
    {id:'processed', label: 'processed'},
];
const filteredFiles = getFilteredFiles();
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 ">
        Dashboard
      </h2>

      {/* Search and Filter Controls  */}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 "
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
                className="block w-full pl-10 text-black pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Sort by :</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setSortDirection("asc");
              }}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dateAdded">Date</option>
              <option value="Name">Name</option>
              <option value="Type">Type</option>
              <option value="Size">Size</option>
            </select>

            <button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className="ml-2 p-1 rounded-md hover:bg-gray-100"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              {sortDirection === "asc" ? (
                <svg
                  className="w-5 h-5 text-gray-600"
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
                  className="w-5 h-5 text-gray-600"
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
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
                {tab.label}
            </button>
          ))}
        </nav>
      </div>

     {/* File List*/}
     {files.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">Upload files to get started.</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No files match your filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map(file => (
              <div key={file.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* File Preview */}
                <div className={`h-40 bg-gray-100 flex items-center justify-center relative`}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.base64} 
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">{getFileIcon(file)}</div>
                  )}
                  
                  {file.processed && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Processed
                    </div>
                  )}
                  
                  {file.isSignature && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Signature
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatBytes(file.size)} • {file.type.split('/')[1].toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Added: {new Date(file.dateAdded).toLocaleDateString()}
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
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
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
};








